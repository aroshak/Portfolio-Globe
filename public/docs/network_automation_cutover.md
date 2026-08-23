# Network Automation Cutover Engine — `network-automation/`

**Author:** Arosha Kaluarachchi (akaluarachchi / arosha.kalu@civica.com)
**Repo:** `/home/civicala/Network_Tasks/network-automation`
**Domain:** ASA → Cisco Secure Firewall (FTD) migration across the M1, M2, SY3 and Azure data centres.

> This document covers the `network-automation` repository **only** (the Dockerised pyATS/Netmiko/Ansible cutover engine, inventory modelling, baseline collection, post-cutover verification, and the test harness). The FMC Ansible toolchain and the Neo4j topology graph are documented in their own files.

---

## 1. The Problem

The enterprise was migrating firewalls from legacy Cisco ASA (multi-context) to Cisco FTD. A cutover of this kind is high-risk: you are changing the data path for an entire data centre, and any routing asymmetry, missing static route, or missed next-hop can black-hole production traffic.

Before this work, cutover validation was done **manually**. There were ~34 runbook text files under `backups/` (e.g. `Baseline M1 ASA -admin context V0.9.txt`, `Verify M1 FTD routing table V0.9.txt`, `Test-end2endTCPping V0.9.txt`, `Modify M1 FTD routing Configuration V0.9.txt`, `Shutdown M1 ASA data path V0.9.txt`). An engineer would SSH into each device in turn, paste `show` commands, eyeball the output, save it into a text file, and try to compare before/after by hand. This was:

- **Slow** — minutes-to-hours of manual CLI per device, repeated for baseline and post-cutover.
- **Error-prone** — no structured diff, no parity check, easy to miss a context or a route.
- **Non-evidenced** — no machine-readable audit trail for the change record / rollback decision.
- **Unrepeatable** — every cutover was a bespoke exercise.

The brief I set myself: turn those manual runbooks into a repeatable, evidenced, fail-loud automation pipeline that produces a diff-backed change record and structured pass/fail signals so a cutover can proceed (or halt) on evidence, not guesswork.

---

## 2. Solution Overview

I built a Dockerised automation environment and a three-phase cutover engine:

```
 Phase 1                Phase 2                Phase 3
 BASELINE      →       CUTOVER       →      VERIFY
 (capture)            (manual change)         (re-capture + diff)
```

The pipeline is anchored on two ideas:

1. **You cannot verify a cutover without a pre-recorded baseline.** Every verification is a *comparison* against a captured "before" state, stored in timestamped directories.
2. **Use the right tool for each device class.** ASA, FTD, and NX-OS have fundamentally different CLI behaviours, so I use three different connection libraries rather than forcing one to do everything.

The full file set I authored:

| File | Role |
|---|---|
| `Dockerfile.network`, `netmiko.sh`, `connect_container.sh` | Reproducible container environment |
| `requirements-network.txt` | Pinned toolchain |
| `env_vars.sh` | Secure credential injection |
| `inventory/inventory.ini` + `group_vars/` + `host_vars/` | Structured estate inventory |
| `testbed.yaml`, `xml_to_testbed.py` | pyATS testbed modelling |
| `baseline_collector.py`, `baseline_collector_v2.py`, `comprehensive_baseline_collector.py` | Pre-cutover baseline capture |
| `asa_multicontext_collector.py` | ASA multi-context specialist collector (Netmiko) |
| `ftd_nx_baseline_collector.py`, `ftd_baseline_collector.py` | FTD (Paramiko diag-CLI) + Nexus (pyATS) baseline |
| `m2_ftd_nx_baseline_collector.py`, `post_migration_ftd_nx_collector.py` | M2-site-specific + post-migration collectors |
| `post_cutover_verifier.py` | Post-cutover re-collection + diff + HTML/text report |
| `compare_configs.py` | Single-device Genie Diff utility |
| `network_automation_demo.py` | pyATS/Genie/Netmiko demonstration harness |
| `test_cutover_automation.py`, `test_credentials.py`, `test_inventory.py`, `test_firewall_connectivity.py`, `test_logging.py` | Test/validation harness |
| `m2_basic_cutover_test.sh` | Encoded manual ping/traceroute runbook |
| `ansible_demo.yml`, `ansible_inventory.ini`, `install_ansible_collections.sh` | Ansible demonstration layer |
| `CUTOVER_AUTOMATION_GUIDE.md`, `DOCKER_WORKFLOW.md`, `CREDENTIAL_HANDLING.md`, `README.md` | Operator documentation |
| `.clinerules/*.md` | Engineering standards I authored for the workspace |

---

## 3. Reproducible Environment

### 3.1 Container (`Dockerfile.network`, `netmiko.sh`, `connect_container.sh`)

Everything runs inside a `python:3.10` container so the toolchain is identical on every workstation. The image installs:

- **Python networking stack:** pyATS, Genie, Netmiko, Paramiko, scrapli, Nornir.
- **Parsing:** TextFSM + ntc-templates (so `show` output parses into structured dicts), Jinja2, PyYAML.
- **Data/reporting:** pandas, openpyxl, matplotlib, Rich (TUI logging/progress).
- **Operational tools inside the container:** `iputils-ping`, `traceroute`, `nmap`, `vim` — so an operator can run live reachability checks without leaving the container.
- **Ansible** (installed via pip) plus the Cisco collections via `install_ansible_collections.sh` (`cisco.ios`, `cisco.nxos`, `cisco.asa`, `cisco.fmcansible`, `ansible.netcommon`).

`netmiko.sh` builds the image and auto-detects whether `sudo` is needed for the Docker socket (a common friction point). `connect_container.sh` creates/starts/reuses a named container with the repo mounted at `/network-automation`, so state persists between sessions.

### 3.2 Credentials (`env_vars.sh`, `CREDENTIAL_HANDLING.md`)

No credentials live in code or in the image. They are injected at runtime:

- `env_vars.sh` is sourced inside the container and `export`s `NETWORK_USERNAME/PASSWORD`, `ENABLE_PASSWORD`, `FTD_USERNAME/PASSWORD`, per-device M2 credentials, FMC variables, backup/logging settings, and Ansible config.
- **Single quotes** are used for password values so shell special characters (notably `!`) survive Bash interpretation — a subtle but classic bug I called out explicitly in the docs.
- The pyATS testbed references credentials via `%ENV{...}` substitution, so the YAML is safe to commit.

### 3.3 Engineering standards (`.clinerules/`)

I authored three rules files that govern this repo: `network-automation-rules.md`, `comprehensive-automation-practices.md`, and `network-topology-management.md`. They codify the conventions every script follows:

- **Mandatory output logging** — every script creates `logs/{category}/{timestamp}/{device}/` *before* any device operation; every output file carries a header (device, command, timestamp); failed commands are still saved with troubleshooting hints.
- **Semantic exit codes** — `0` complete success, `1` partial failure, `2` total failure, so CI/cutover gates can act.
- **Resilience** — never exit on first failure; complete all devices; produce a summary.
- **Device-specific timeouts** — 60s for ASA/FTD, 30s for Nexus.
- **Naming conventions** — `{Location}{Type}{Number}` (e.g. `M1NX01`); filenames with spaces/special chars replaced by underscores.

---

## 4. Inventory & Testbed Modelling

### 4.1 Structured Ansible inventory (`inventory/`)

`inventory.ini` organises ~30+ devices along two axes — **location** (Azure, GrIT/SY3, M1, M2) and **type** (routers, catalyst, nexus, firewalls, FTD, FMC, IPS). Each axis has matching `group_vars/` (`routers.yml`, `switches_catalyst.yml`, `switches_nexus.yml`, `firewalls.yml`, `ftd.yml`, `fmc.yml`, `ips.yml`, `all.yml`) plus `host_vars/` for per-device overrides (`M1FMC.yml`).

This structure matters because it lets a cutover target exactly one slice of the estate — e.g. `--limit switches_nexus` or `--limit m2` — without touching anything else. It is the single device list reused by the Ansible playbooks, the baseline collectors, and the Neo4j topology collector (see the topology doc).

### 4.2 pyATS testbed (`testbed.yaml`, `xml_to_testbed.py`)

The team already had a legacy **XML session-manager** device list (`sample_devices.xml`). Rather than re-key it by hand into pyATS format, I wrote `xml_to_testbed.py`, which:

- Parses the XML, extracts name/IP/username.
- **Infers OS and type from naming patterns** (`ASR`/`RTR`/`ISR`→`iosxe` router; `NX`→`nxos` switch; `CAT`→`ios` switch; `FW` (non-FMC)→`asa` firewall; `FMC`→`fmc` management; `FTD`→`ftd` firewall).
- Emits a properly structured pyATS `testbed.yaml` with credentials wired through `%ENV{...}`.

This bridged the team's existing inventory into the pyATS/Genie world with zero manual transcription — and it is reusable for any future XML device list.

### 4.3 Inventory validation (`test_inventory.py`)

`test_inventory.py` shells out to `ansible-inventory --list`, parses the JSON, counts devices per group, verifies that `group_vars/` files exist for each group, and prints a Rich-formatted summary (totals, by-location, by-type, group_vars status). It is a pre-flight check that the inventory is internally consistent before any automation runs against it.

---

## 5. Baseline Collection (Phase 1)

The baseline collectors are the heart of the cutover engine. They encode the manual runbooks as command sets and capture timestamped, headered outputs. There is a deliberate family of collectors, each handling a specific device-class quirk.

### 5.1 Why three connection libraries

| Device class | Library | Reason |
|---|---|---|
| **ASA multi-context** | **Netmiko** | pyATS prompt patterns misbehave when `changeto context` switches the prompt. Netmiko `ConnectHandler` with explicit context switching is reliable. |
| **FTD** | **Paramiko** (diagnostic CLI) | FTD has no normal SSH CLI. You connect over SSH then run `system support diagnostic-cli`, with a blank enable password. pyATS cannot model this cleanly, so I wrote a dedicated `FTDConnection` class on Paramiko. |
| **Nexus (NX-OS)** | **pyATS/Genie** | NX-OS has mature Genie parsers, so I get *structured* output (parsed JSON) in addition to raw text. |

Forcing one library across all three would have produced unreliable prompt detection and silent failures. The split is documented in the `.clinerules` and in each script's docstring.

### 5.2 `baseline_collector.py` (primary)

- Loads the pyATS testbed, builds a **dynamic testbed** for the `cutover_test` device group.
- Checks required environment variables up front and fails fast with a helpful message if missing.
- Runs per-device-type command sets. For ASA this is **per-context**: `admin`, `bpo`, `grit`, `les`, `lg`, `system`, plus a `nexthop_reachability` set of pings to critical next-hops (10.224.254.6, 10.224.254.14, 10.20.254.217, …) — exactly mirroring the manual baseline files.
- ASA context handling follows the rule: start from admin, `changeto context {name}`, capture, return to admin in a `finally` block.
- Outputs go to `logs/baseline/{timestamp}/{asa|nexus|ftd}/{DEVICE}/{context_or_command}.txt`, each with a standard header, plus a `baseline_summary.txt`.
- Resilience: a device/context failure is logged with troubleshooting hints but does not abort the run.

### 5.3 `asa_multicontext_collector.py` (specialist)

Because pyATS struggled with ASA context prompts, this collector uses Netmiko and a hardcoded, context-aware command dictionary (`ASA_CONTEXTS`). It is the most reliable path to capture all six ASA contexts plus nexthop reachability. It is the collector actually used for the ASA baseline.

### 5.4 FTD + Nexus collectors

- `ftd_nx_baseline_collector.py` — FTD via Paramiko `FTDConnection` (diagnostic CLI + blank enable), Nexus via pyATS/Genie. Excludes ASA (use the specialist collector).
- `ftd_baseline_collector.py` — FTD-only variant.
- `m2_ftd_nx_baseline_collector.py` — M2-site-specific: pulls M2 old-platform FTDs (M2FW01/M2FW02) and M2 Nexus (M2NX01/M2NX02) from env vars, with the same logging conventions. This is the collector used for the M2 cutover baseline.
- `comprehensive_baseline_collector.py` / `baseline_collector_v2.py` — iterative improvements with better error handling and device-specific fixes (v2 adds FTD credential separation).

Every collector prints the **absolute path** to the timestamped output directory at the end — a `.clinerules` requirement so the operator always knows where the evidence is.

---

## 6. Post-Cutover Verification (Phase 3)

### 6.1 `post_cutover_verifier.py`

This is the centrepiece. It:

1. **Re-collects** the same command set post-cutover, reusing `BASELINE_COMMANDS` and `FTDConnection` from the baseline collector — single source of truth for commands and connection logic. ASA is skipped (it is shut down post-cutover).
2. **Adds cutover-specific routing verification commands** beyond the baseline set — e.g. `show route 10.192.162.0`, `show route 10.224.225.0`, `show route 10.224.226.0`, `show run interface po81`, `show run interface po86` — these are the exact prefixes and port-channels the cutover is supposed to move onto the new FTD path. If those routes aren't present post-cutover, the cutover failed.
3. **Diffs baseline vs post-cutover per file** using `difflib.unified_diff` with proper `fromfile`/`tofile` labels, and classifies each difference as **critical** vs **informational**.
4. **Generates both HTML and text reports** (a `.clinerules` standard) — the HTML includes styling, colour-coded severity, and summary tables; the text report is the audit-trail copy.
5. Tracks `critical_differences`, `warnings`, and `info_messages` and surfaces them in the summary so a cutover lead can make a go/no-go decision on evidence.

### 6.2 `post_migration_ftd_nx_collector.py`

An inventory-driven post-migration collector (no hardcoded IPs — device endpoints are discovered from `ansible_inventory.ini`). It reuses the same `FTDConnection` Paramiko flow for FTD and pyATS for Nexus, writes to `logs/post_cutover/{timestamp}/` with headers and a `post_cutover_summary.txt`, and distinguishes the M2 old- vs new-platform FTDs via per-device env vars.

### 6.3 `compare_configs.py`

A lighter utility for single-device before/after changes (e.g. an interface description edit during normal change work). Uses Genie's `Diff` class and saves timestamped diffs to `logs/comparison/`. Useful for day-to-day change validation, not just cutover.

---

## 7. Test & Diagnostic Harness

I built a set of pre-flight and diagnostic scripts because a cutover is the worst possible time to discover a credential or connectivity problem:

- **`test_cutover_automation.py`** — end-to-end environment test: checks env vars are set, the testbed parses, and the collectors/verifier are importable and callable. The `CUTOVER_AUTOMATION_GUIDE.md` mandates this passes before any real run.
- **`test_credentials.py`** — loads the testbed and attempts a real connection to a (optionally specified) device, validating that `%ENV{...}` substitution and credentials work.
- **`test_firewall_connectivity.py`** — staged diagnostics: (1) raw TCP socket test to port 22, (2) Paramiko SSH auth test. This separates "is the host reachable?" from "are my credentials right?" — the two most common cutover-day failures.
- **`test_inventory.py`** — inventory structure validation (above).
- **`test_logging.py`** — validates the logging/output conventions are honoured.

### `m2_basic_cutover_test.sh`

A Bash script that encodes the manual M2 connectivity runbook: it pings and traceroutes every M2 next-hop (BPO_Edge, DMZ, Prod, Inside, Management, Outside, VIEW_Edge) with inline comments identifying which Port-channel/subinterface each next-hop belongs to. It is the bridge between the old manual process and the automated one — an operator can run it for a quick human-readable sanity check, while the Python collectors produce the machine-readable evidence.

---

## 8. Ansible Demonstration Layer

`ansible_demo.yml` shows the multi-vendor pattern: it branches on `ansible_network_os` to call `cisco.ios.ios_command`, `cisco.nxos.nxos_command`, or `cisco.asa.asa_command` accordingly, runs `show version`/`show running-config`/`show ip interface brief`, and saves configs to `logs/configs/{host}_config.txt`. Credentials come from env vars via `lookup('env', ...)`. It is the template the team uses for new Ansible network tasks.

---

## 9. Reasoning & Design Decisions

- **Baseline before you touch anything.** The whole pipeline is gated on having a captured "before". The verifier refuses to compare against nothing.
- **Right tool per device class.** pyATS for Nexus (structured parsing), Netmiko for ASA (reliable context switching), Paramiko for FTD (diagnostic CLI). One library across all would silently fail on prompts.
- **Evidence-first.** Every command output is a file with a header; the change record is self-documenting and auditable after the fact. Both HTML and text reports are generated.
- **Fail loud, fail partial.** Semantic exit codes (0/1/2) and "continue on failure" mean a cutover can proceed on green devices while flagging amber ones — and CI can gate on the code.
- **Pre-flight everything.** `test_cutover_automation.py` / `test_credentials.py` / `test_firewall_connectivity.py` exist so cutover-day surprises are caught in advance, not during the window.
- **Reproducibility.** Docker image + pinned requirements + env-var credentials means any engineer gets the same behaviour on any workstation.
- **Reuse the inventory.** One `inventory.ini` powers Ansible, the collectors, and the topology graph — no parallel device lists.
- **Document the runbook in code.** `m2_basic_cutover_test.sh` keeps the human-readable runbook alive alongside the automated evidence.

---

## 10. Outcomes

- 34 manual runbook text files converted into repeatable, evidenced collectors.
- A baseline → cutover → verify pipeline that produces diff-backed change records with critical/informational classification.
- Structured pass/fail signalling (exit codes + HTML/text reports) so cutover go/no-go is evidence-based.
- A reproducible Docker environment so the toolchain is portable across the team.
- A validated, structured inventory and pyATS testbed reused across the whole workspace.