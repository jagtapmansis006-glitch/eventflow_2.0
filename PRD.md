# Product Requirement Document (PRD)

**Project Name:** EventFlow AI — Predictive Digital Twin & Crowd Flow Orchestration  
**Document Version:** 1.0.0  
**Status:** Approved / In Development  
**Target Release:** Capstone Phase 2 / MVP Release  
**Last Updated:** September 2026  

---

## 1. Executive Summary

Mega-events, sports arenas, and mass-transit hubs experience localized crowd surges, queue stagnation, and dangerous compression bottlenecks. Current crowd safety systems rely on reactive visual surveillance—alerts trigger only after safe capacity thresholds are exceeded.

**EventFlow AI** is a predictive, real-time edge telemetry and digital twin platform. It fuses multi-source edge sensor inputs (computer vision headcounts, turnstile RFID counters, and transit arrival feeds) to calculate a normalized **Zone Pressure Index (ZPI)**. Using a constraint-aware Mixed-Integer Linear Programming (MILP) solver (Google OR-Tools), EventFlow AI provides dynamic re-routing recommendations and marshal dispatch triggers with a 15-minute forward-looking horizon.

---

## 2. Problem Statement & Motivation

1. **Human Cognitive Delay:** Field operators and CCTV monitoring rooms take an average of 5–8 minutes to identify emerging queue friction and localized crowd turbulence.
2. **Lack of Predictive Foresight:** Traditional video management software (VMS) lacks continuous spatial flow modeling, missing non-linear arrival spikes (e.g., simultaneous train discharges).
3. **Absence of Coordinated Interventions:** Once a gate bottlenecks, manual radio dispatching creates operational delays, compounding crowd density hazards.

---

## 3. Goals & Non-Goals

### 3.1 Project Goals
* Ingest multi-modal edge sensor telemetry at $\ge 1\text{ Hz}$ frequency across $\ge 50$ distinct venue zones.
* Predict crowd pressure escalation with $\ge 15\text{ minutes}$ advance warning.
* Automate closed-loop mitigation advisories (e.g., corridor diversions, gate flow adjustments) via constraint-aware optimization.
* Maintain an end-to-end data processing latency of $\le 1.5\text{ seconds}$ from edge ingestion to dashboard visualization.
* Enforce strict privacy compliance: zero biometric or Personally Identifiable Information (PII) retention.

### 3.2 Non-Goals (Out of Scope for this Release)
* Standalone hardware fabrication (the project uses off-the-shelf IP cameras and simulated edge hardware).
* Biometric profiling, facial recognition, or individual passenger tracking.
* Fully autonomous physical gate/turnstile locking without human confirmation (human-in-the-loop decision-support model).

---

## 4. Key Performance Indicators (KPIs)

| Metric | Target Baseline | Verification Method |
| :--- | :--- | :--- |
| **Surge Prediction Horizon** | $\ge 15\text{ minutes}$ | Injected burst stress trace validation |
| **End-to-End Pipeline Latency** | $\le 1.5\text{ seconds}$ ($p95$) | Edge ingress timestamp to UI render difference |
| **Optimization Solver Latency** | $\le 2.0\text{ seconds}$ per run | Benchmark execution of Google OR-Tools engine |
| **Zone State Classification Accuracy** | $\ge 92\%$ F1-Score | Confusion matrix against ground-truth simulation |
| **Telemetry Ingestion Throughput** | $\ge 500\text{ packets/second}$ | Distributed Locust load test |

---

## 5. User Personas

### 5.1 Incident Commander (Control Room)
* **Goal:** Macro-level visibility across all sectors; instantaneous surge alerts.
* **Pain Point:** Sensory overload from dozens of disparate CCTV monitor feeds.
* **Needs:** 2D spatial heatmap with single-click operational dispatch authorization.

### 5.2 Field Marshal / Security Officer
* **Goal:** Clear, localized instructions to resolve queue blockages.
* **Pain Point:** Unclear verbal instructions over noisy two-way radio channels.
* **Needs:** Real-time push task notifications (e.g., "Deploy barrier at Corridor 4; divert flow to Gate 2").

### 5.3 System Administrator / Data Engineer
* **Goal:** Pipeline uptime, sensor telemetry health, and database retention management.
* **Pain Point:** Stream dropouts and out-of-order sensor packet arrivals.
* **Needs:** Pipeline diagnostics, dead-letter queue metrics, and automated Kalman failovers.

---

## 6. System Architecture

```
  [Edge Vision Counters]      [Turnstiles / RFID]      [Transit Schedules]
            │                          │                        │
            ▼                          ▼                        ▼
       (Protobuf/gRPC)           (JSON/WebSocket)           (HTTP REST)
            │                          │                        │
            └──────────────────────────┼────────────────────────┘
                                       │
                                       ▼
    ┌──────────────────────────────────────────────────────────────────────┐
    │                Tier 1: FastAPI Ingestion Gateway                    │
    │          - Checksum Validation & Schema Deserialization              │
    └──────────────────────────────────┬───────────────────────────────────┘
                                       │
                                       ▼
    ┌──────────────────────────────────────────────────────────────────────┐
    │                 Tier 2: Apache Kafka Message Broker                  │
    │         Topics: `raw-telemetry`, `surge-alerts`, `solver-actions`     │
    └──────────────────┬───────────────────────────────┬───────────────────┘
                       │                               │
                       ▼                               ▼
    ┌──────────────────────────────────────┐  ┌────────────────────────────┐
    │      TimescaleDB (Hypertables)       │  │ Spatial Digital Twin Core  │
    │   - Analytical time-series store     │  │  - Graph state maintenance │
    │   - 7-day retention + downsampling   │  │  - Real-time ZPI engine    │
    └──────────────────────────────────────┘  └──────────────┬─────────────┘
                                                             │
                                                             ▼
                                              ┌────────────────────────────┐
                                              │ Google OR-Tools Optimizer  │
                                              │  - MILP crowd re-routing   │
                                              └──────────────┬─────────────┘
                                                             │
                                                             ▼
    ┌──────────────────────────────────────────────────────────────────────┐
    │             Tier 3: Incident Command Dashboard (React 19)            │
    │         - Live SVG/2D Floorplan Map   - Active Alert Feed            │
    │         - 1-Click Operational Dispatch Mechanism                     │
    └──────────────────────────────────────────────────────────────────────┘
```

---

## 7. Mathematical Modeling & Algorithmic Design

### 7.1 Zone Pressure Index (ZPI)
For any operational zone $z$ at timestamp $t$, the localized pressure scalar $ZPI(z, t) \in [0, 1]$ is computed as:

$$ZPI(z, t) = w_d \cdot \left(\frac{D(z, t)}{D_{\max}(z)}\right) + w_v \cdot \left(\frac{\max(0, \, \Phi_{\text{net}}(z, t))}{C_{\max}(z)}\right) + w_q \cdot \left(\frac{Q(z, t)}{Q_{\max}(z)}\right)$$

Where:
* $D(z, t) = \frac{N(z, t)}{A(z)}$: Zone crowd density (persons/$\text{m}^2$) given current headcount $N$ and usable area $A$.
* $\Phi_{\text{net}}(z, t) = \sum_{u \in \text{In}(z)} v_{u, z}(t) - \sum_{w \in \text{Out}(z)} v_{z, w}(t)$: Net passenger flux rate across boundaries (persons/sec).
* $Q(z, t)$: Instantaneous queue depth at boundary turnstiles/barriers.
* $D_{\max}(z), C_{\max}(z), Q_{\max}(z)$: Zone structural threshold constraints.
* $w_d, w_v, w_q$: Tunable weight coefficients satisfying $w_d + w_v + w_q = 1.0$ (calibrated default: $w_d = 0.50$, $w_v = 0.30$, $w_q = 0.20$).

#### Escalation State Machine:
* **Nominal (Green):** $0.00 \le ZPI < 0.60$ $\rightarrow$ Passive telemetry logging.
* **Warning (Amber):** $0.60 \le ZPI < 0.80$ $\rightarrow$ Pre-computes alternate routing; notifies corridor marshals.
* **Critical (Red):** $0.80 \le ZPI \le 1.00$ $\rightarrow$ Triggers automated diversion recommendations and dynamic signage overrides.

### 7.2 Mixed-Integer Linear Program (MILP) Routing Optimizer
The venue topology is represented as a directed graph $G = (V, E)$, with zones $v \in V$ and transit corridors $e = (u, v) \in E$ exhibiting transit latency $\tau_e$ and throughput capacity $C_e$.

**Objective Function:**
$$\min_{x} \sum_{e \in E} \tau_e \cdot x_e + \lambda \sum_{v \in V} ZPI(v)$$

**Subject to:**
1. **Flow Conservation:**  
   $$\sum_{(u, v) \in E} x_{u, v} - \sum_{(v, w) \in E} x_{v, w} = \Delta N_v \quad \forall v \in V \setminus \{\text{Sources, Sinks}\}$$
2. **Corridor Flow Capacity:**  
   $$0 \le x_e \le C_e \quad \forall e \in E$$
3. **Safety Density Bound:**  
   $$D(v) \le D_{\text{crit}}(v) \quad \forall v \in V$$

---

## 8. Functional Requirements (FR)

### 8.1 Telemetry Ingestion & Preprocessing
* **FR-1.1:** The system shall expose WebSocket (`/ws/telemetry`) and gRPC endpoints accepting real-time headcount and throughput payloads.
* **FR-1.2:** The ingestion service shall validate schema structures against defined Pydantic models; non-conforming packets must be discarded and logged.
* **FR-1.3:** The system shall detect sensor heartbeats and invoke a linear Kalman filter fallback when a sensor node misses $\ge 3$ consecutive ticks.

### 8.2 Digital Twin & ZPI Analytics
* **FR-2.1:** The analytics engine shall recalculate ZPI for every active venue zone on a $1.0\text{-second}$ cyclic cadence.
* **FR-2.2:** The system shall maintain an in-memory directed graph of the venue representing all nodes, edge capacities, and active directionalities.
* **FR-2.3:** Forward-looking projections ($t+5$, $t+15$ min) must be updated dynamically based on historical ingress slopes and public transit schedule feeds.

### 8.3 Incident Command Dashboard & Dispatch
* **FR-3.1:** The UI shall display a real-time vector map of the facility, color-coding zones based on active ZPI status.
* **FR-3.2:** When a zone transitions into the Amber or Red state, the UI shall push an audio-visual alert banner within $\le 500\text{ ms}$.
* **FR-3.3:** The dashboard shall present optimization recommendations as actionable cards (e.g., *"Open North Corridor Bypass"*).
* **FR-3.4:** Confirming an action card must dispatch an outbound webhook payload to digital signage endpoints and marshal mobile units.

---

## 9. Non-Functional Requirements (NFR)

* **NFR-1 (Performance):** Total latency from edge packet receipt to UI update shall not exceed $1.5\text{ seconds}$ at $p95$.
* **NFR-2 (Reliability):** Telemetry ingestion must sustain $99.95\%$ uptime during scheduled operational windows.
* **NFR-3 (Data Privacy):** The platform shall not ingest, store, or process raw video frames, facial imagery, MAC addresses, or personal identifiers.
* **NFR-4 (Security):** All data transmissions must be encrypted via TLS 1.3 in transit; sensitive configuration tokens must be secured via environment secrets.

---

## 10. Database Schema & Data Models

```sql
-- Zone Spatial Definitions
CREATE TABLE venue_zones (
    zone_id VARCHAR(32) PRIMARY KEY,
    zone_name VARCHAR(64) NOT NULL,
    floor_level INTEGER DEFAULT 0,
    area_sqm NUMERIC(8, 2) NOT NULL,
    max_capacity INTEGER NOT NULL,
    danger_density_threshold NUMERIC(4, 2) DEFAULT 4.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Corridor Graph Edges
CREATE TABLE corridor_edges (
    edge_id VARCHAR(32) PRIMARY KEY,
    source_zone_id VARCHAR(32) REFERENCES venue_zones(zone_id),
    target_zone_id VARCHAR(32) REFERENCES venue_zones(zone_id),
    max_flow_rate NUMERIC(6, 2) NOT NULL, -- persons per second
    nominal_transit_seconds NUMERIC(6, 2) NOT NULL,
    is_bidirectional BOOLEAN DEFAULT FALSE
);

-- Real-Time Telemetry Hypertable (TimescaleDB)
CREATE TABLE zone_telemetry_stream (
    recorded_at TIMESTAMPTZ NOT NULL,
    zone_id VARCHAR(32) REFERENCES venue_zones(zone_id),
    headcount INTEGER NOT NULL,
    inflow_rate NUMERIC(6, 2) NOT NULL,
    outflow_rate NUMERIC(6, 2) NOT NULL,
    queue_depth INTEGER DEFAULT 0,
    zpi_score NUMERIC(4, 3) NOT NULL,
    status_level VARCHAR(16) NOT NULL
);

-- Partition telemetry into hypertables by timestamp
SELECT create_hypertable('zone_telemetry_stream', 'recorded_at', if_not_exists => TRUE);

-- Automated retention policy: drop raw data older than 7 days
SELECT add_retention_policy('zone_telemetry_stream', INTERVAL '7 days');
```

---

## 11. API Specifications

### 11.1 Telemetry Ingestion (Edge $\rightarrow$ Gateway)
* **Endpoint:** `POST /api/v1/telemetry/ingest`
* **Request Payload:**
```json
{
  "sensor_id": "cam_gate_north_01",
  "zone_id": "zone_ingress_a",
  "timestamp": "2026-09-17T12:00:00Z",
  "metrics": {
    "headcount": 342,
    "inflow_rate": 8.4,
    "outflow_rate": 6.1,
    "queue_depth": 45
  }
}
```
* **Response:** `202 Accepted` $\rightarrow$ `{"status": "queued", "trace_id": "uuid-v4"}`

### 11.2 Active Advisories (Dashboard $\leftarrow$ Engine)
* **Endpoint:** `GET /api/v1/advisories/active`
* **Response:**
```json
{
  "active_advisories": [
    {
      "advisory_id": "adv_8832",
      "zone_id": "zone_ingress_a",
      "zpi_score": 0.84,
      "severity": "CRITICAL",
      "recommended_action": "Divert ingress queue 2 to Corridor 4",
      "projected_latency_reduction_pct": 28.5,
      "timestamp": "2026-09-17T12:01:15Z"
    }
  ]
}
```

---

## 12. Verification & Testing Strategy

```
  ┌──────────────────────────────────────────────────────────────┐
  │                 System Verification Matrix                    │
  ├───────────────────┬──────────────────────────────────────────┤
  │ Unit Tests        │ • Formula correctness of ZPI computation │
  │                   │ • Graph adjacency matrix generation      │
  ├───────────────────┼──────────────────────────────────────────┤
  │ Integration Tests │ • Sensor Ingest -> Kafka -> TimescaleDB  │
  │                   │ • WebSocket broadcast to frontend client │
  ├───────────────────┼──────────────────────────────────────────┤
  │ Benchmark Tests   │ • Locust: 500 concurrent telemetry nodes │
  │                   │ • OR-Tools runtime under 100-node graph  │
  └───────────────────┴──────────────────────────────────────────┘
```

---

## 13. Project Timeline & Milestones

| Milestone | Target Horizon | Core Deliverable |
| :--- | :--- | :--- |
| **M1: Core Pipeline** | Week 2 | Schema migration, FastAPI gateway, and synthetic telemetry producer. |
| **M2: Intelligence Engine** | Week 5 | Implementation of ZPI calculations and Google OR-Tools solver script. |
| **M3: Dashboard & Integration**| Week 8 | Real-time WebSocket connection to React map UI with incident cards. |
| **M4: Validation & Viva** | Week 11 | Stress testing, Locust benchmarks, and capstone presentation. |
