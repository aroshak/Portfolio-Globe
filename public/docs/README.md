# Arosha Kaluarachchi — Network Automation & Migration Portfolio

**Role:** Network Automation Engineer (Cisco enterprise / firewall migration)
**Contact:** arosha.kalu@civica.com
**Workspace:** `/home/civicala/Network_Tasks` (three bodies of work below)

This portfolio documents three distinct bodies of work, each in its own file. They are separate because they solve separate problems with separate toolchains, even though they all serve the same ASA → Cisco Secure Firewall (FTD) migration programme across the M1, M2, SY3, and Azure data centres.

---

## 📁 Separate Documents

| Document | Repo | Problem solved |
|---|---|---|
| **[`fmc_ansible_migration.md`](./fmc_ansible_migration.md)** | `FMCAnsible/` | Automating Cisco FMC configuration migration — interfaces, routing (static + VRF-aware OSPF), NAT, and access policy — between FMC instances, idempotently and stage-safe. |
| **[`network_automation_cutover.md`](./network_automation_cutover.md)** | `network-automation/` | A Dockerised pyATS/Netmiko/Ansible engine that baselines the live estate, drives the ASA→FTD cutover, and verifies post-cutover parity with diff-backed reports. |
| **[`network_topology_neo4j.md`](./network_topology_neo4j.md)** | `network-automation/network_topology/` | A collector that ingests live device state (CDP, interfaces, VRFs, VLANs, routing) and models the estate as a queryable Neo4j graph for impact analysis. |

---

## At a Glance

**FMC Ansible migration** (`fmc_ansible_migration.md`)
- Extended the upstream `cisco.fmcansible` collection with 23 migration playbooks (`civica/`), 14 Python utilities (`tools/`), 6 roles, and Swagger/OAS3 API maps.
- Idempotent, name-resolved interface/routing import; stage-safe (`safety_disable_interfaces`); fail-loud on undocumented OSPF write APIs; CSV as a human review boundary for NAT/ACP.
- Docker-reproducible; credentials via env vars; `.gitignore`-disciplined.

**Network automation cutover engine** (`network_automation_cutover.md`)
- Dockerised pyATS/Genie/Netmiko/Paramiko environment with a structured ~40-device inventory (by location × type) and an XML→pyATS testbed converter.
- Baseline → cutover → verify pipeline: right library per device class (pyATS for Nexus, Netmiko for ASA multi-context, Paramiko diag-CLI for FTD), timestamped evidenced outputs, `difflib`/Genie diff reports (HTML + text), semantic exit codes (0/1/2).
- Pre-flight test harness (`test_cutover_automation.py`, `test_credentials.py`, `test_firewall_connectivity.py`).

**Network topology → Neo4j** (`network_topology_neo4j.md`)
- Inventory-driven collector → Neo4j graph of devices, interfaces, IPs, VRFs, VLANs, CDP adjacencies, and data-centre locations.
- Idempotent ingestion (`MERGE` + constraints, `--clear-db`), parameterised Cypher, dual-signal device classification, raw-output evidence trail, ready-to-use Cypher queries.

---

## Cross-cutting Practices (recur across all three)

These reflect the `.clinerules` engineering standards I authored for the workspace:

- **Automate the repetitive** — playbooks, Python tools, and collectors replace ~34 manual runbooks.
- **Test in isolation, ship via Docker** — reproducible from any workstation.
- **Rollback always** — rollback procedures, `safety_disable_interfaces`, `enable_upgrade_revert`, `check_pending_deployments` before changes.
- **No plaintext credentials** — `.env.local`/`env_vars.sh`, `%ENV{...}` substitution, `sanitized/` exports, `.gitignore` for logs/outputs.
- **Evidence-driven troubleshooting (OSI)** — baseline → change → diff → report; per-command error files with troubleshooting hints; structured exit codes.
- **Document the API surface** — Swagger/OAS3 maps generated from the live FMC and committed; every `operation:` traceable to a documented endpoint.
- **Version-controlled & reviewed** — everything in git; CSV as the human review boundary for NAT/ACP.

---

## Technology Stack

- **Automation:** Ansible (collections, roles, httpapi connection plugin), Python 3.10, Bash.
- **Cisco tooling:** pyATS / Genie, Netmiko, Paramiko, scrapli, Nornir, `cisco.fmcansible`, `cisco.ios/nxos/asa`.
- **Platforms:** Cisco ASA (multi-context), FTD, FMC / cdFMC, ASR/ISR (IOS-XE), Catalyst (IOS), Nexus (NX-OS), IPS.
- **Data/persistence:** Neo4j (Cypher), YAML/JSON bundles, CSV round-tripping, TextFSM/ntc-templates parsing.
- **Ops:** Docker, Rich (TUI logging/progress), Git, `difflib`/Genie Diff for reporting.

---

*Each detail document was assembled by inspecting the live repositories, git history, documentation, and captured output data in `/home/civicala/Network_Tasks`.*