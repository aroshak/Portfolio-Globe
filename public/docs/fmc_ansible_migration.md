# Cisco FMC Ansible Migration Toolchain — `FMCAnsible/`

**Author:** Arosha Kaluarachchi (Arosha Kalu, arosha.kalu@civica.com)
**Repo:** `/home/civicala/Network_Tasks/FMCAnsible`
**Domain:** Cisco Secure Firewall Management Center (FMC) configuration automation for an ASA → FTD migration across the M1 and M2 data centres.

> This document covers the `FMCAnsible` repository **only**. The network-automation cutover engine and the Neo4j topology graph are documented in their own files.

---

## 1. The Problem

The upstream Cisco DevNet `cisco.fmcansible` collection ships a single generic module — `fmc_configuration` — that wraps the FMC REST API. It is a thin primitive: it gives you CRUD on FMC objects, but it provides **no migration workflow**. There is no way to:

- export a working firewall's interfaces/routing/NAT/access-policy from one FMC and reconstruct it on a new FMC or HA cluster;
- do so idempotently across environments where FMC UUIDs differ;
- stage a migration safely (load config without taking traffic down);
- map the large, inconsistent FMC OpenAPI surface to usable, documented Ansible operations.

The business need: migrate M2's firewalls (M2FW01/M2FW02, an HA pair) onto a new FTD-based FMC, and replicate M1's OSPF/static routing — without outages and with a full audit trail.

---

## 2. Solution Overview

I layered a project-specific toolkit **on top of** the upstream collection rather than forking the module, so we stay compatible with Cisco's releases:

```
FMCAnsible/
├── civica/        # 23 migration playbooks + task includes (my work)
├── tools/         # 14 standalone Python utilities (my work)
├── roles/         # 6 Ansible roles (upgrade, backup, HA, retrieval)
├── docs/          # Swagger→Ansible API maps + migration guides (my work)
├── sanitized/    # Credential-scrubbed interface exports (my work)
├── samples/       # Reference playbooks (upstream + my additions)
└── plugins/       # Upstream cisco.fmcansible module (unchanged)
```

---

## 3. API Surface Discovery

The FMC REST API is large and documented only via a Swagger/OpenAPI spec. Before writing any automation I built tooling to map it:

- **`tools/fetch_fmc_swagger.py`** — parses an Ansible-style inventory to extract FMC host/user/password/port, authenticates, and pulls the live `fmc.json` OpenAPI document. Reused by the other tools for inventory parsing and token fetch.
- **`tools/scan_swagger.py`** — scans the OAS spec and emits human-readable maps of `operationId → HTTP method/path/params/body` for the domains I cared about.
- **`docs/SWAGGER_INTERFACES_OSPF_MAP.md`**, **`SWAGGER_INTERFACES_OSPF_MAP_OAS3.md`**, **`docs/SWAGGER_ROUTING_VRF_MAP_OAS3.md`**, **`docs/SWAGGER_HA_MAP.md`** — the generated maps, committed as the single source of truth that every playbook's `operation:` field is derived from.

This eliminated guesswork and made every playbook auditable against the real API. A key finding that shaped later design: the OAS3 surface documents **GET** for several OSPF resources but **no documented write operations** — which is why `apply_ospf.py` refuses LIVE mode (see §5).

---

## 4. Interface Migration (Export → Sanitize → Import)

The interface migration is the most complete end-to-end workflow in the toolchain.

### 4.1 Export
- **`civica/export_interfaces.yml`** + **`tasks/export_interfaces_per_device.yml`** — runs against the source FMC inventory and pulls every PhysicalInterface, SubInterface, and BridgeGroupInterface for selected devices into timestamped YAML under `outputs/interfaces/`. HA pairs can be exported as a subset via `-e include_devices=["M2FW01","M2FW02"]`.
- **`tools/sanitize_export.py`** / **`sanitize_bundle.py`** — scrubs device-specific IDs and sensitive values so the export can be reviewed and committed safely. The `sanitized/interfaces/` directory holds the scrubbed M2 HA-pair exports.

### 4.2 Import
- **`civica/import_interfaces.yml`** + **`tasks/import_physical_item.yml`** / **`import_subinterface_item.yml`** — re-applies the export to a target FMC.
- **`civica/push_m2_interfaces_direct.yml`** — a direct-push variant for the M2 HA pair specifically.

### 4.3 Key design decisions
- **Idempotent by name, not by ID.** FMC UUIDs differ between source and target, so the import resolves each interface by name on the target (`phys_map`), resolves Security Zones by name→id via a `zone_map`, and only then issues a PUT (update) or POST (create). This makes the bundles portable across environments.
- **Stage-safe imports.** A `safety_disable_interfaces` flag forces newly-imported interfaces into a disabled state, so a full interface config can be loaded onto a live firewall without taking traffic down. Interfaces are enabled deliberately afterwards — a deliberate blast-radius control.
- **Skip-if-absent.** If a physical interface name from the export isn't found on the target, it is skipped (logged) rather than erroring — so a bundle from a larger device can be applied to a smaller one.

---

## 5. Routing Migration (Static + OSPF, VRF-aware)

This was the hardest part. FMC exposes OSPF differently inside vs. outside VRFs, and the OAS3 surface only documents **GET** for several OSPF resources — writes are undocumented/unsupported via the collection.

### 5.1 Export
- **`civica/retrieve_routing.yml`**, **`retrieve_routing_objects.yml`**, **`tasks/routing_export.yml`** — export static routes and OSPF process/interface config per device/VRF.

### 5.2 Bundle generation
- **`tools/generate_routing_bundle.py`** — consolidates per-device exports into one `m2_routing_config.yml` bundle with `devices → vrfs → {static_v4, ospf}`.
- **`tools/annotate_bundle_groups.py`** / **`resolve_ospf_objects.py`** — enriches the bundle by resolving network-object names to IDs and annotating object groups.

### 5.3 Apply
- **`tools/apply_ospf.py`** — applies OSPF router config (router-id, NSF, default-info-originate, redistribute static, network statements), preferring resolved `objectName`/`objectId` when present. **Critically, it detects the missing write surface and refuses to run in LIVE mode**, printing an explanatory message and only supporting DRY-RUN. I chose fail-loud over silent corruption — undocumented writes against a firewall control plane are an unacceptable risk.
- **`tools/apply_routing_bundle.py`**, **`push_routing.py`**, **`patch_ospf_router.py`** — supporting apply utilities.
- **`tools/sanitize_bundle.py`** — removes unwanted `selectedNetworks` entries (e.g. decommissioned `New_External-VicRoads-WAN` prefixes) from the static-route bundle before push.
- **`tools/retrieve_routing.py`**, **`inspect_oas3_subinterfaces.py`** — retrieval/inspection helpers.

### 5.4 M1 OSPF
- **`civica/m1_ospf.yml`** — retrieves M1 OSPF processes and interfaces from FMC for analysis.

---

## 6. NAT & Access Policy CSV Round-tripping

ASA→FTD NAT and access-control rules were migrated via a **CSV-driven workflow** because the rule sets required human review/redesign between platforms:

- **`civica/export_nat_policy_csv.yml`**, **`export_access_policy_csv.yml`**, **`export_network_objects_csv.yml`** — export rules to CSV + JSON.
- **`civica/import_nat_policy_csv.yml`**, **`import_nat_rule.yml`** — re-import edited CSVs. The import:
  - creates a **new named policy** rather than mutating the source;
  - filters out header and empty rows (`Rule_ID` defined, non-empty, non-header);
  - checks whether the target policy already exists before creating.
- **`tools/apply_routing_bundle.py`** and the CSV export guides (`docs/CSV_EXPORT_GUIDE.md`) document the columns and the editable-spreadsheet format.

The CSV is deliberately a **human review boundary** — firewall engineers (not just the automator) review and sign off rule-by-rule before import.

---

## 7. Operational Safety Roles

- **`roles/device_upgrade/`** — FTD upgrade with readiness checks, `enable_upgrade_revert`, `auto_upgrade_cancel`, and a polled `wait_for_completion` loop (`max_retries`/`retry_delay`). Designed so an upgrade can be run `readiness_check_only: true` first. Saves upgrade task info to JSON.
- **`roles/device_backup/`**, **`get_ha_devices/`**, **`get_upgrade_packages/`**, **`get_access_policies/`**, **`get_domains/`** — reusable retrieval roles.
- **`civica/check_pending_deployments.yml`** — daily-routine playbook that flags pending (undeployed) FMC changes before any further automation runs, so configuration drift is never silently overwritten. Wired into `WORKFLOW_GUIDE.md` as a morning check.

---

## 8. Duplicate Network-Object Detection

**`civica/retrieve_duplicate_network_objects.yml`** + **`scripts/pull_fmc_duplicates.sh`** — finds duplicate network objects across the FMC (a common source of policy ambiguity) and emits JSON + CSV to `civica/outputs/duplicates`. The shell wrapper handles the "is `ansible-playbook` even installed?" case gracefully and pins `ANSIBLE_CONFIG`.

---

## 9. Containerised, Reproducible Runs

All playbooks are documented to run via a custom Docker image (`build_docker_image.sh`) with the repo mounted at `/fmc-ansible`, so the migration can be executed from any workstation without local Ansible/collection drift. Multiple `*_docker.sh` convenience wrappers (`pull_fmc_duplicates_docker.sh`, `import_fmc_nat_csv_docker.sh`, `export_fmc_nat_csv_docker.sh`, `pull_fmc_network_objects_docker.sh`, `pull_fmc_duplicates_docker.sh`) standardise this.

---

## 10. Documentation

I authored a full set of operator guides:
- **`WORKFLOW_GUIDE.md`** — complete setup/daily-operations workflow (env config, connectivity test, morning check routine, backup, deployment monitoring).
- **`docs/INTERFACES_MIGRATION_GUIDE.md`** — interface export→import with filtering, HA notes, troubleshooting.
- **`docs/CSV_EXPORT_GUIDE.md`** — access-control policy CSV export.
- **`RETRIEVAL_PLAYBOOKS_GUIDE.md`**, **`INVENTORY_FIX_GUIDE.md`**, **`DOCKER_*`** guides, **`README_CSV_EXPORT.md`**.
- The Swagger/OAS3 maps (§3).

---

## 11. Reasoning & Design Decisions

| Decision | Rationale |
|---|---|
| **Layer on top of upstream, don't fork the module** | Stay compatible with Cisco's releases; project tooling is isolated in `civica/` and `tools/`. |
| **Idempotency by name, not by ID** | FMC UUIDs differ between source/target; name resolution makes bundles portable. |
| **Stage-safe imports (`safety_disable_interfaces`)** | Load full config onto a live firewall without an outage; enable deliberately afterwards. |
| **Fail loud on unsupported APIs** | `apply_ospf.py` refuses LIVE mode because OAS3 only documents OSPF GETs. Documented gaps beat silent data loss. |
| **CSV as a human review boundary** | NAT/ACP migration routes through CSV so firewall engineers review rule-by-rule before import. |
| **Document the API surface first** | Swagger/OAS3 maps generated from the live FMC; every `operation:` is traceable to a documented endpoint. |
| **Secure by default** | Credentials via `.env.local`/env vars; `sanitized/` for anything committed; `.gitignore` keeps `logs/` and `outputs/` out of git (enforced in commit `af7cae7` after a 1.5 GB `ansible.log` was accidentally tracked). |
| **Docker-reproducible** | Custom image + wrappers so the migration runs identically on any workstation. |

---

## 12. Evidence of Authorship

Git history (`Arosha Kalu` / `Arosha Kaluarachchi`, arosha.kalu@civica.com) shows 13 commits on `main`, including "Add comprehensive FMC automation improvements", "Add FMC automation improvements: inventory fixes, deployment monitoring, and comprehensive guides", and "Civica FMC Details updated", touching all of `civica/` (23 playbooks + 6 task includes), `tools/` (14 Python utilities), `docs/` (Swagger maps + guides), `sanitized/`, and the operational shell scripts.

---

## 13. Outcomes

- A repeatable, auditable ASA→FTD migration pipeline for the M2 HA pair (and reusable for M1), covering interfaces, static + OSPF routing (VRF-aware), NAT, and access policy.
- A documented FMC API surface (Swagger maps) that de-risks all future FMC automation.
- Stage-safe, idempotent, name-resolved imports that work across differing FMC UUIDs.
- All delivered on top of the upstream Cisco collection (no hard fork), with secure credential handling and Docker-reproducible runs.