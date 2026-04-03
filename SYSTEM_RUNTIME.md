# EquiliFlow Digital Twin — System Runtime Metadata
**Industrial Control & Process Monitoring — V1.0.6**

This document records the exact runtime parameters used during the development and final verification of the EquiliFlow platform.

## 1. Network Telemetry
| Parameter | Value | Description |
| :--- | :--- | :--- |
| **Primary Host** | `localhost` | Local loopback for digital twin simulation. |
| **Service Port** | `8181` | Standardized high-concurrency port for FastAPI. |
| **WebSocket** | `ws://localhost:8181/ws/reactor` | 2 Hz real-time physics stream. |
| **Static Entry** | `http://localhost:8181/` | Glassmorphic frontend landing. |

## 2. Infrastructure & Execution
- **Backend Engine**: FastAPI (Python 3.13)
- **Startup Command**: `python -m uvicorn main:app --reload --host 0.0.0.0 --port 8181`
- **Asset Persistence**: `db.json` (Automated ChellDB state tracking).
- **Curriculum Root**: `frontend/curriculum/` (Manifest-driven JSON modules).

## 3. Maintenance Protocols
- **To restart**: Run the Startup Command from the root directory.
- **Verification**: Ensure `db.json` contains valid asset records for v1.0.6 compliance.

---
**Status: OFFLINE — STATE PRESERVED**
Designed by **Soul Architect**
