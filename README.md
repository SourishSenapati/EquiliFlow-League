# EquiliFlow-League

The Progressive Digital Twin for Chemical Engineering Education

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Python](https://img.shields.io/badge/Python-3.9+-yellow.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-green.svg)](https://fastapi.tiangolo.com/)

---

## Overview

EquiliFlow-League is a high-fidelity, narrative-driven simulation platform designed to bridge the gap between academic theory and industrial practice. Developed for the *Chemical Engineers Learning League*, this platform provides a **4-Year Progressive Curriculum** where students unlock advanced physics and industrial control modules as they master foundational concepts.

### Key Pillars

- **Progressive Fidelity**: Start with simple mass balances (Year 1) and advance to complex 3D Navier-Stokes simulations and digital twin economics (Year 4).
- **Industrial-Grade Engine**: Python-based physics engine (`engine/`) solving for Reynolds numbers, friction factors, Arrhenius kinetics, and PID control.
- **Dual-Interface System**
  - **Dashboard**: A premium Streamlit-based UI for high-level process monitoring.
  - **API Core**: A robust FastAPI backend for real-time telemetry and third-party integration.

---

## The 4-Year Curriculum

| Year | Phase | Focus | Core Physics Module |
| :--- | :--- | :--- | :--- |
| **Year 1** | Foundation | Mass & Energy Balances | `mass_balance_solver.py` |
| **Year 2** | Hydrodynamics | Fluid Flow & Pipe Sizing | `calculate_reynolds`, `head_loss` |
| **Year 3** | Reactor Design | Kinetics & Multi-phase Flow | `cstr_design_equation`, `arrhenius_rate` |
| **Year 4** | Control & Profit | Economics & Digital Twins | `PIDController`, `calculate_opex` |

---

## Quick Start

### 1. Requirements

Ensure you have Python 3.9+ installed.

### 2. Installation

```bash
# Clone the repository
git clone https://github.com/SourishSenapati/EquiliFlow-League.git
cd EquiliFlow-League

# Install dependencies
pip install -r requirements.txt
```

### 3. Launching the Platform

**Start the Simulation Engine (Backend):**

```bash
python main.py
```

**Start the Learning Dashboard (Frontend):**

```bash
streamlit run app.py
```

---

## Project Structure

```text
EquiliFlow-League/
├── app.py              # Streamlit Learning Dashboard
├── main.py             # FastAPI Simulation API
├── engine/             # The Physics Core
│   ├── physics.py      # Fundamental Equations
│   ├── solvers.py      # Network-Scale Solvers
│   └── network.py      # Plant Topology Logic
├── frontend/           # Static Web Assets (HTML/JS/CSS)
├── tests/              # Unit & Integration Tests
└── .docs/              # High-level Documentation
```

---

## License

This project is licensed under the **Apache License 2.0**. See the [LICENSE](LICENSE) file for details.

---

## Contributing

We welcome contributions from fellow chemical engineers and developers! Please read our `CONTRIBUTING.md` (coming soon) for details on our code of conduct and the process for submitting pull requests.

---

*"Engineering the future of process simulation, one node at a time."*
**EquiliFlow-League | 2026**
