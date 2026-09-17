# EventFlow AI 🚀
> **Predictive Digital Twin & Real-Time Crowd Flow Orchestration Platform**

[![Python 3.11+](https://img.shields.io/badge/Python-3.11%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![TimescaleDB](https://img.shields.io/badge/TimescaleDB-PostgreSQL-gold.svg)](https://www.timescale.com/)
[![OR-Tools](https://img.shields.io/badge/Google-OR--Tools-orange.svg)](https://developers.google.com/optimization)
[![React 19](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📌 Overview

**EventFlow AI** transforms crowd safety from a reactive scramble into predictive orchestration. Designed for stadiums, transit hubs, and mega-festivals, it fuses multi-modal edge telemetry (vision-based headcounts, turnstile velocities, transit spikes) into a real-time digital twin. 

By computing a localized **Zone Pressure Index (ZPI)** and executing constraint-aware **Mixed-Integer Linear Programming (MILP)** optimization via Google OR-Tools, EventFlow AI recommends dynamic corridor diversions and barrier reconfigurations **15+ minutes before hazardous crush thresholds are reached**.

---

## 🏗️ System Architecture

```
[Edge Vision Nodes]       [Turnstiles & Gates]       [Transit Feeds]
        │                           │                       │
        ▼                           ▼                       ▼
  (Protobuf/gRPC)             (MQTT/Sockets)           (REST Webhooks)
        │                           │                       │
        └───────────────────┬───────┴───────────────────────┘
                            ▼
           ┌─────────────────────────────────┐
           │   FastAPI Ingestion Gateway     │  (Sub-second validation)
           └────────────────┬────────────────┘
                            ▼
           ┌─────────────────────────────────┐
           │      Apache Kafka Message Bus   │  (Topic: telemetry-stream)
           └────────┬───────────────┬────────┘
                    │               │
                    ▼               ▼
     ┌──────────────────────┐  ┌────────────────────────────────────┐
     │ TimescaleDB Storage  │  │ Spatial Digital Twin Engine        │
     │ (Telemetry History)  │  │  - Zone Pressure Index (ZPI) Calc  │
     └──────────────────────┘  │  - OR-Tools MILP Reroute Solver    │
                               └─────────────────┬──────────────────┘
                                                 ▼
                               ┌────────────────────────────────────┐
                               │ Incident Command Center Dashboard  │
                               │ (React 19 + Tailwind CSS + WS)     │
                               └────────────────────────────────────┘
```

---

## ⚡ Key Features

* **Real-Time Digital Twin:** Models complex venue topologies as directed flow-conservation graphs with explicit capacity boundaries.
* **Zone Pressure Index (ZPI):** Multi-factor risk scoring incorporating density ($persons/m^2$), directional boundary net flux ($\Phi_{\text{net}}$), and barrier queue lengths.
* **Proactive MILP Rerouting:** Automatically optimizes pedestrian redirection vectors using Google OR-Tools without causing secondary bottleneck cascades.
* **Zero PII Retention:** Strict edge-level privacy compliance—processes camera feeds purely in memory to output count vectors; zero biometrics or raw video storage.
* **Live Operations Dashboard:** Sub-second incident command UI featuring 2D/3D pressure heatmaps, automated intervention triggers, and audit-ready logging.

---

## 📐 Mathematical Formulation: Zone Pressure Index (ZPI)

For every zone $z$ at time step $t$, the localized risk saturation index $ZPI(z, t) \in [0, 1]$ is defined as:

$$ZPI(z, t) = w_d \cdot \left(\frac{D(z, t)}{D_{\max}(z)}\right) + w_v \cdot \left(\frac{\max(0, \, \Phi_{\text{net}}(z, t))}{C_{\max}(z)}\right) + w_q \cdot \left(\frac{Q(z, t)}{Q_{\max}(z)}\right)$$

| Status Level | ZPI Range | System Action |
| :--- | :--- | :--- |
| 🟢 **Nominal** | $0.00 \le ZPI < 0.60$ | Passive monitoring; nominal route advisory. |
| 🟡 **Warning** | $0.60 \le ZPI < 0.80$ | Pre-computes diversion pathways; notifies marshals. |
| 🔴 **Critical** | $0.80 \le ZPI \le 1.00$ | Automated rerouting dispatches & emergency gate release. |

---

## 🛠️ Tech Stack

* **Backend & Ingestion:** Python 3.11+, FastAPI, WebSockets, gRPC, Pydantic
* **Message Broker:** Apache Kafka / Redis Streams
* **Database:** PostgreSQL 16 + TimescaleDB (Time-series hypertables)
* **Optimization Engine:** Google OR-Tools (Mixed-Integer Linear Programming)
* **Frontend:** React 19, TypeScript, Tailwind CSS, Lucide Icons, Vite
* **Infrastructure & DevOps:** Docker, Docker Compose, Locust (Load Testing)

---

## 🚀 Quick Start Guide

### Prerequisites
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) (v24.0+)
* [Python 3.11+](https://www.python.org/)
* [Node.js 20+](https://nodejs.org/)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/eventflow-ai.git
cd eventflow-ai
```

### 2. Environment Configuration
Copy the example configuration files and verify port assignments:
```bash
cp .env.example .env
```

### 3. Launch Infrastructure (Docker Compose)
Spins up PostgreSQL/TimescaleDB, Apache Kafka, and Zookeeper:
```bash
docker compose up -d
```

### 4. Setup Backend Service
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Run database migrations
python scripts/init_db.py

# Start the ingestion and optimization engine
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 5. Setup Incident Command Dashboard
```bash
cd ../frontend
npm install
npm run dev
```
Navigate to `http://localhost:5173` to access the live operations console.

---

## 📂 Repository Structure

```
eventflow-ai/
├── backend/
│   ├── app/
│   │   ├── api/             # FastAPI route handlers & WebSockets
│   │   ├── core/            # Configs, DB sessions, security
│   │   ├── engine/          # ZPI calculator & OR-Tools MILP optimizer
│   │   ├── models/          # SQLAlchemy & TimescaleDB entity models
│   │   └── schemas/         # Pydantic validation contracts
│   ├── tests/               # Pytest test cases & algorithmic benchmarks
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/      # UI components, Heatmaps & Action Panels
│   │   ├── hooks/           # WebSocket real-time subscription hooks
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
├── docker/
│   └── docker-compose.yml   # Multi-container orchestration
├── docs/
│   ├── PRD.md               # Complete Product Requirement Document
│   └── ARCHITECTURE.md      # Detailed graph topology & flow mechanics
├── LICENSE
└── README.md
```

---

## 🧪 Running Benchmarks & Tests

Verify algorithmic convergence, pipeline latency, and database persistence:

```bash
# Run unit tests for ZPI calculation and OR-Tools optimizer
pytest backend/tests/test_optimizer.py -v

# Run synthetic telemetry stress test (500 mock sensor streams)
python backend/scripts/simulate_telemetry.py --rate=500 --duration=60
```

---

## 📄 Documentation

* Detailed functional requirements, schema DDLs, and KPIs are defined in **[PRD.md](docs/PRD.md)**.

---

## 🛡️ License

Distributed under the MIT License. See `LICENSE` for more information.