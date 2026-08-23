# Network Topology → Neo4j Graph — `network_topology/`

**Author:** Arosha Kaluarachchi (akaluarachchi / arosha.kalu@civica.com)
**Repo:** `/home/civicala/Network_Tasks/network-automation/network_topology`
**Domain:** Live-state network topology modelling for the M1, M2, SY3, Azure, and GrIT estate.

> This document covers the Neo4j topology graph **only**. The cutover engine and the FMC Ansible toolchain are documented in their own files.

---

## 1. The Problem

The estate has ~40 devices across five locations (M1, M2, SY3, Azure, GrIT) spanning routers (ASR/ISR, IOS-XE), Catalyst switches (IOS), Nexus switches (NX-OS), ASA firewalls (multi-context), FTD firewalls, and an FMC. We manage these with a flat Ansible `inventory.ini`.

A flat inventory answers "what devices exist?" but it **cannot** answer the questions that actually matter during a migration:

- *Which devices share this VLAN / VRF?*
- *What is the Layer-2/Layer-3 path between two hosts?*
- *Which interfaces are physically connected (via CDP) to a device I am about to decommission?*
- *If I change a subnet on one device, which other devices' interfaces are in the same broadcast domain?*
- *Give me a visual, queryable model of the whole estate for impact analysis and documentation.*

For ASA→FTD cutover impact analysis, I needed a **graph** — topology is inherently relational, and a graph makes "blast radius of a change" a one-query question.

---

## 2. Solution Overview

I built a three-file topology pipeline that collects live device state and models it in Neo4j:

```
 inventory.ini  →  topology_collector.py  →  Neo4j (Cypher)
 (device list)     (collect + parse)         (graph model)
                        ↑
                  neo4j_connection.py  (driver wrapper)
                        ↑
                  network_to_neo4j.py   (CLI orchestrator)
```

| File | Role |
|---|---|
| `neo4j_connection.py` | Neo4j driver wrapper (connect, parameterised queries, schema, clear) |
| `topology_collector.py` | Inventory parsing + per-OS command collection + parsing + Cypher writes |
| `network_to_neo4j.py` | CLI orchestrator with selection/filtering options |
| `README.md` | Operator guide + ready-to-use Cypher examples |
| `data/{timestamp}/` | Raw collected outputs per device (evidence) |
| `logs/topology_collector_*.log` | Run logs |

It is governed by `.clinerules/network-topology-management.md`, which I authored to mandate that all topology code, data, and logs live under `network_topology/` (separation of concerns from the cutover engine), that runs are timestamped, and that the graph schema is documented.

---

## 3. The Graph Model

The schema is designed to be a faithful, queryable representation of the network:

### Nodes
| Label | Key properties |
|---|---|
| `:Device` | `name`, `device_type`, `location`, `os`, `ip_address`, `last_updated` |
| `:Interface` | `device_name`, `name`, `description`, `admin_status`, `mac_address` |
| `:IPAddress` | `address`, `network`, `prefix_length` |
| `:VRF` | `device_name`, `name`, `vrf_id` |
| `:VLAN` | `device_name`, `id`, `name`, `status` |
| `:DataCenter` | `name` |

### Relationships
| Relationship | Meaning |
|---|---|
| `(:Device)-[:HAS_INTERFACE]->(:Interface)` | Device owns an interface |
| `(:Interface)-[:HAS_IP_ADDRESS]->(:IPAddress)` | Interface has an IP |
| `(:Device)-[:HAS_VRF]->(:VRF)` | Device has a VRF |
| `(:Device)-[:HAS_VLAN]->(:VLAN)` | Device has a VLAN |
| `(:Interface)-[:CONNECTED_TO]->(:Interface)` | Physical adjacency (from CDP) |
| `(:Device)-[:LOCATED_IN]->(:DataCenter)` | Device placement |

### Idempotency
All writes use `MERGE` with `ON CREATE SET` / `ON MATCH SET` and uniqueness is enforced by schema constraints (e.g. on `Device.name`, `Interface(device_name,name)`). This means the graph can be **rebuilt nightly** without producing duplicates, and re-running against a subset of devices updates only those nodes.

---

## 4. `neo4j_connection.py` — Driver Wrapper

A `Neo4jConnection` class wrapping the official `neo4j` Python driver:

- **`__init__` / `_connect`** — builds the driver, runs `RETURN 1 AS test` to confirm liveness, logs success/failure.
- **`execute_query(query, parameters)`** — parameterised read (prevents Cypher injection; parameters always bound).
- **`execute_write_query(query, parameters)`** — parameterised write.
- **`setup_schema()`** — creates uniqueness constraints and indexes so ingestion is idempotent and fast.
- **`clear_database()`** — wipes all nodes/relationships for a clean re-ingest (used by `--clear-db`).
- **`close()`** — clean driver shutdown.

Credentials are pulled from environment variables — never hardcoded.

---

## 5. `topology_collector.py` — Collection & Modelling

This is the substantive file. It contains the `NetworkTopologyCollector` class plus the `FTDConnection` helper.

### 5.1 Inventory parsing

Rather than depend on a library, I wrote a purpose-built `_parse_inventory()` that reads `inventory.ini` as text, walks the `[group]` sections, skips `:children`/`:vars` sections, and extracts `key=value` params (notably `ansible_host`) per device. This is more tolerant of the inventory's quirks than a generic INI parser and gives me the device→group membership I need for type/location inference.

### 5.2 Device classification

`_get_device_type`, `_get_device_location`, and `_get_device_os` infer type/OS/location from **two signals**: group membership (e.g. a device under `[m1_switches_nexus]` is a Nexus switch in M1) and name pattern (`M1NX*`→nxos switch in M1, `AZ*`→Azure, `SY3*`→SY3, etc.). This dual-signal approach is robust to one of the signals being missing.

### 5.3 Per-OS command sets

A `COMMANDS` dictionary tailors the `show` commands to each OS so the parser gets the right output:

- **ios / nxos:** `show interfaces`, `show ip interface brief` (nxos adds `vrf all`), `show ip route` (nxos `vrf all`), `show cdp neighbors detail`, `show vrf`, `show vlan brief`, `show port-channel summary`, `show version`, `show inventory`.
- **asa:** `show interface`, `show ip address`, `show route`, `show cdp neighbors detail`, `show version`.
- **ftd:** `show interface`, `show ip address`, `show route`, `show version`.

### 5.4 `FTDConnection` — FTD diagnostic CLI

Because FTD has no normal SSH CLI, I implemented an `FTDConnection` class (reused by the cutover collectors too):
- Connects via Paramiko, invokes a shell, sends `system support diagnostic-cli`, waits for the prompt, sets `terminal pager 0`.
- `execute_command` sends a command, reads with a timeout loop, and cleans command echo + prompt lines from the output.
- `disconnect` exits diagnostic mode and closes SSH cleanly.

### 5.5 Parsing → Cypher

Each `_process_*` method parses the raw `show` output and writes the graph:

- **`_process_interfaces`** — regex-parses `show interfaces` (interface name, up/down, description, MAC) and `show ip interface brief`/`show ip address` (IP + mask). Subnet masks are converted to CIDR via Python's `ipaddress` module, and `:IPAddress` nodes are created with `network` and `prefix_length` so subnet queries work.
- **`_process_vrf_data`** — parses `show vrf` into `:VRF` nodes.
- **`_process_vlans`** — parses `show vlan brief` into `:VLAN` nodes.
- **`_process_cdp_neighbors`** — parses `show cdp neighbors detail`: extracts the neighbor's Device ID (stripping domain suffix), local interface, and remote Port ID, then creates the `(:Interface)-[:CONNECTED_TO]->(:Interface)` edge. This is what makes the graph a *topology* rather than just a device list — CDP gives you the physical adjacencies.
- **`_create_device_node`** — `MERGE` on `Device.name` and `SET` type/location/os/ip/last_updated.
- **`_create_location_relationships`** — creates `:DataCenter` nodes and `LOCATED_IN` edges.

Every write uses parameterised Cypher and `MERGE`/`ON CREATE SET`/`ON MATCH SET` so re-runs update rather than duplicate.

### 5.6 Resilience & evidence

- A per-device output directory (`data/{timestamp}/{DEVICE}/`) saves the raw `interfaces.txt`, `routing.txt`, `neighbors.txt`, `vlans.txt`, `vrf.txt`, etc. — so every graph node is traceable back to the command output that produced it. (Real captured data exists under `data/20250910_114426/M1NX01/`, `M1NX02/`, etc.)
- `self.results` tracks counts (devices, interfaces, IPs, VRFs, VLANs, connections, success/failed lists) for the run summary.
- A device failure is logged and the run continues.

---

## 6. `network_to_neo4j.py` — Orchestrator CLI

The CLI entry point with selection/filtering options so the operator controls scope:

```
network_to_neo4j.py [-h] [--inventory INVENTORY] [--output-dir OUTPUT_DIR]
                    [--log-dir LOG_DIR] [--setup-schema] [--clear-db]
                    [--devices DEVICES ...] [--skip-devices ...]
                    [--device-types {router,switch_nexus,switch_catalyst,firewall,ftd} ...]
                    [--create-locations]
```

Typical workflows:
- `--setup-schema` — first-run: create constraints/indexes.
- `--clear-db` — wipe and re-ingest the whole estate (nightly rebuild).
- `--devices M1NX01 M1NX02` — limit to specific devices (e.g. just the M1 core pair).
- `--device-types switch_nexus firewall` — limit by type.
- `--create-locations` — build the `DataCenter` nodes and `LOCATED_IN` edges.

---

## 7. Operator Queries (from the README)

I shipped ready-to-use Cypher in the README so the graph is immediately useful to the operations team:

```cypher
-- All devices
MATCH (d:Device) RETURN d

-- Interface count per device
MATCH (d:Device)-[:HAS_INTERFACE]->(i:Interface)
RETURN d.name, count(i) AS interface_count
ORDER BY interface_count DESC

-- Physical topology (CDP adjacencies)
MATCH p=(d1:Device)-[:HAS_INTERFACE]->()-[:CONNECTED_TO]->()<-[:HAS_INTERFACE]-(d2:Device)
RETURN p LIMIT 25

-- Devices by location
MATCH (d:Device)-[:LOCATED_IN]->(loc:DataCenter)
RETURN loc.name, count(d) AS device_count ORDER BY device_count DESC

-- All IPs in a subnet
MATCH (ip:IPAddress) WHERE ip.network STARTS WITH "10.224." RETURN ip.address, ip.network

-- Devices with VRFs
MATCH (d:Device)-[:HAS_VRF]->(v:VRF)
RETURN d.name, collect(v.name) AS vrfs
```

---

## 8. Reasoning & Design Decisions

- **Graph over spreadsheet/inventory.** Topology is relational; "what's the blast radius of this change?" is a one-Cypher-query question in a graph and an impossible question in a flat inventory.
- **One inventory, reused.** The collector reads the same `inventory.ini` used by the Ansible playbooks and the cutover collectors — no parallel device list to drift.
- **Dual-signal classification.** Type/location inferred from both group membership and name patterns so it stays robust when one signal is absent.
- **Idempotent ingestion.** `MERGE` + uniqueness constraints + `--clear-db` mean safe nightly rebuilds with no duplicates.
- **Evidence trail.** Raw `show` output is saved per device per run, so every graph edge is auditable back to the command that produced it.
- **CDP is the topology glue.** The `CONNECTED_TO` edge comes from CDP neighbor data — that is what turns a device inventory into a physical topology graph.
- **Right tool for FTD.** FTD's diagnostic-CLI quirk is handled by a dedicated `FTDConnection` (Paramiko) rather than fighting pyATS — the same class is reused by the cutover collectors.
- **Parameterised Cypher only.** All queries bind parameters, preventing injection and keeping the code safe for operator-supplied device names.
- **Scope control.** The CLI's `--devices`/`--skip-devices`/`--device-types` let the operator refresh just part of the estate (e.g. only the M2 pair after a cutover) without re-collecting everything.

---

## 9. Outcomes

- A queryable, visual model of the entire estate (devices, interfaces, IPs, VRFs, VLANs, CDP adjacencies, locations) in Neo4j.
- One-Cypher-query impact analysis for "which devices/interfaces are affected if I change X".
- An idempotent, nightly-rebuildable graph backed by a raw-output evidence trail.
- A documented, operator-friendly tool with ready-to-use Cypher examples.