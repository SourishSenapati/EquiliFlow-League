# EquiliFlow League: Digital Twin & Process Simulation Environment

EquiliFlow League is an industrial-grade, spreadsheet-first simulation platform engineered for process engineering education. It merges classical chemical engineering principles with real-time physical simulation, continuous background neural network training, and asset degradation management.

---

## 1. Core Engineering Systems

### A. Fluid Network & Valve Dynamics
The hydraulic backbone is modeled as a multi-node P&ID topology. Flow characteristics are dynamically solved utilizing the mechanical energy balance (Bernoulli's Equation):

$$P_1 + \frac{1}{2}\rho v_1^2 + \rho g h_1 = P_2 + \frac{1}{2}\rho v_2^2 + \rho g h_2 + h_f$$

Where friction losses ($h_f$) across piping components and control valves are calculated in real time:

$$h_f = f \cdot \left(\frac{L}{D}\right) \cdot \left(\frac{v^2}{2g}\right)$$

### B. CSTR Arrhenius Kinetics
Reactor conversion rates follow first-order reaction kinetics modeled inside a Continuous Stirred-Tank Reactor (CSTR). The space time (mean residence time) is defined by:

$$\tau = \frac{V}{Q}$$

Where $V = 10.0\text{ m}^3$ is the reactor volume, and $Q$ is the user-adjustable volumetric flow rate. The temperature-dependent reaction rate constant $k$ is calculated dynamically utilizing the Arrhenius relationship:

$$k = A \cdot e^{-\frac{E_a}{R T}}$$

Using frequency factor $A = 0.05\text{ s}^{-1}$ and activation energy parameter $\frac{E_a}{R} = 1500\text{ K}$. The fractional conversion $X$ is solved as:

$$X = \frac{k \tau}{1 + k \tau}$$

### C. Game Economics & Passive Income
Capital accrual is tied directly to the production rate and asset reliability:

$$\text{Revenue Rate} = Q \cdot X \cdot 0.25 \cdot \text{Durability}_{\text{avg}}$$

This establishes a feedback loop where operating at high flow rates with low temperatures (low residence time and reaction rate) suppresses conversion and profits, forcing players to optimize setpoints.

---

## 2. Machine Learning Surrogate Model

The engine features a Physics-Informed Neural Network (PINN) running continuously on a background thread utilizing PyTorch.
- **Inputs**: $[\text{Flow Rate}, \text{Pump Power}, \text{Head Loss}, \text{Reactor Temperature}, \text{Conversion}]$
- **Training**: Regresses target loss profiles asynchronously, simulating real-time surrogate modeling. It automatically detects and binds to local NVIDIA CUDA Tensor Cores (e.g. CUDA 12.4) to offload training weight matrix iterations without blocking web dashboard processes.

---

## 3. Database & Authentication Scheme

- **Multi-User Mapping**: Active player profiles (capital, assets, curriculum checkpoints) are managed concurrently in `db.json` under isolated username dictionaries.
- **SHA-256 Hashing**: Password strings are securely hashed with a localized SHA-256 encryption method before disk writes.
- **Single-Click Bypass**: The login interface contains a fallback auto-registration capability. Inputting credentials automatically instantiates a new profile and begins database state logging.
- **REST Telemetry**: Client sessions are authorized utilizing the custom `X-User-Token` request header. WebSocket connections route data using `?token=` parameters.

---

## 4. Operational Tech Tree (4-Year Progression)

- **Year 1: Foundation (Mass & Energy Audits)**: Basic Centrifugal Pumps (T-101). Asset durability degradation (fouling stresses) is active.
- **Year 2: Hydrodynamics (Fluid Networks)**: PID loop tuning, valve cavitation control, and friction calculations.
- **Year 3: Reactor Design (Reaction Kinetics)**: Thermal heat exchange scaling, CSTR kinetics, Arrhenius parameter adjustments.
- **Year 4: Digital Twin (AI Optimization)**: Activating and testing continuous neural network loss convergence.

---

## 5. Quick Start Guide

### Prerequisites
- Python 3.13+
- Node.js (Optional, frontend requires simple browser environment)
- Native PyTorch-compatible graphics card (e.g. RTX series supporting CUDA 12)

### Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/SourishSenapati/EquiliFlow-League.git
cd EquiliFlow-League
python -m pip install -r requirements.txt
```

### Starting the Server
Run the FastAPI backend application:
```bash
python main.py
```
The terminal will start log-dumping real-time PyTorch training outputs.

### Playing the Game
Open `http://localhost:8181` in your browser.
1. Click **Initialize Operation** to log in automatically using default guest access (`admin` / `admin`).
2. Interact with the **Process Setpoints** card inside the Theory pane: adjust feed flow rate and temperature sliders.
3. Monitor real-time conversion ($X$), flow rate ($Q$), and reactor temperature changes in the P&ID dashboard and system indicators.
4. Upgrade and repair components in the **Asset Registry** table to maintain high plant efficiencies and optimize overall yield.
