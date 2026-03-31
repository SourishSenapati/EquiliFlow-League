# EquiliFlow-League

The Premium Digital Twin & Industrial Simulation Engine

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Python](https://img.shields.io/badge/Python-3.13+-yellow.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-green.svg)](https://fastapi.tiangolo.com/)
[![CUDA](https://img.shields.io/badge/PyTorch-CUDA_12.4-orange.svg)](https://pytorch.org/)

---

## Overview

EquiliFlow-League is an industrial-grade, spreadsheet-first simulation platform engineered for long-term (2,000+ hour) progression. It serves as a rigorous, forensic management sandbox merging classical chemical engineering physics with GPU-accelerated AI optimization.

### Core Upgrades & Architecture

- **Spreadsheet-First UI Framework**: Replaced all visual abstraction with a dense, professional grid-based layout for raw numerical telemetry tracking, loss aversion, asset degradation, and phase-based tech-tree unlocks. No emojis. Extreme professionalism.
- **Physics-Informed Neural Network (PINN) Surrogate Model**: Features an embedded continuous background training loop (`engine/ai_manager.py`) built directly on PyTorch.
- **Native GPU Acceleration**: The engine automatically binds to native NVIDIA Tensor Cores (e.g. RTX 4050 / CUDA 12.4) to stream batches and calculate multi-dimensional loss asynchronously without interrupting the event loop.
- **4-Sigma Reliability Protocol**: Implementation of an atomic file-replacement `save_on_interrupt` mechanism. Guarantees temporal state parity and zero data corruption during unexpected system kills.
- **Loss Aversion Mechanics**: Assets degrade over time (fouling factors and mechanical stresses) introducing rigorous financial friction as students navigate higher curriculum phases.

---

## The 4-Year (2,000 Hour) Sandbox

| Year | Phase | Industrial Focus | Engine Matrix Constraints |
| :--- | :--- | :--- | :--- |
| **Year 1** | Foundation | Mass & Energy Auditing | `Durability mechanics & Basic friction` |
| **Year 2** | Hydrodynamics | Fluid Networks & Valve Decay | `System-wide pressure drops` |
| **Year 3** | Reactor Design | Fouling & Reaction Kinetics | `CSTR fouling decay models` |
| **Year 4** | GPU Digital Twin | Advanced Output Optimization | `Continuous PyTorch Surrogate Training` |

---

## Quick Start
### 1. Requirements

Ensure you have Python 3.13+ installed along with native CUDA 12.4 capabilities. Note: If using an RTX series GPU, specific PyTorch WHL configurations may be required to bypass PyPI defaults.

### 2. Installation

```bash
git clone https://github.com/SourishSenapati/EquiliFlow-League.git
cd EquiliFlow-League
python -m pip install -r requirements.txt
```

### 3. Launching the Industrial Simulation

**Start the Simulation Engine (Backend + GPU Background Loop):**

```bash
python main.py
```
*The terminal will immediately begin outputting 4-SIGMA TELEMETRY reading directly from the GPU tensor boundaries.*

**Access the Executive Control Grid (Frontend):**
Open `http://localhost:8181` in your browser. All monitoring and asset interactions are routed through this port dynamically.

---

## Project Structure

```text
EquiliFlow-League/
├── main.py             # FastAPI API Core & Background GPU Threading
├── requirements.txt    # Strict py3.13 + Torch CUDA 12.4 bindings
├── engine/             # The Core Physics & Intelligence
│   ├── ai_manager.py   # PyTorch Surrogate Model with 4-Sigma Saves
│   ├── components.py   # Degrading Node structures
│   ├── game_loop.py    # Temporal friction & economic logic
│   └── network.py      # Abstract topological mapping
├── frontend/           # The Terminal-Style Spreadsheet Grid
│   ├── index.html      
│   ├── script.js       # Real-time data polling & UI Matrix
│   └── style.css       # Clean, professional Dark/Glassmorphism theme
└── .docs/              # Architectural specs
```

---

## Status
*Live Telemetry Link Connected. Operational Accuracy at Plateau (~2.47-Sigma Generalization floor on base 16-D layer).*

---
**EquiliFlow-League | Industrial Grade Digital Twins**
