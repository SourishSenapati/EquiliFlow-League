/**
 * EquiliFlow League — Comprehensive 40-Part Industrial Curriculum
 * [10 Domains x 4 Tiers = 40 Parts of Progression]
 * From Student (L1) to Principal Graduate Engineer Trainee (L4).
 */

window.CHEME_CURRICULUM = [
    {
        "id": "D1-FLUIDS",
        "title": "FLUID DYNAMICS & MOMENTUM TRANSPORT",
        "description": "Mapping momentum from Microscopic Balances to Site Hydraulic Networks.",
        "tiers": [
            { "id": "D1-L1", "title": "L1: Academic Fluid Laws", "missions": [{ "id": "D1-M1", "title": "Bernoulli's Integral", "formula": "P/ρ + v²/2 + gz = C", "theory": "Energy conservation in inviscid flow gradients." }] },
            { "id": "D1-L2", "title": "L2: Mechanical Operation", "missions": [{ "id": "D1-M2", "title": "NPSH & Cavitation Risk", "formula": "NPSHa > NPSHr", "theory": "Diagnosing vapor pressure failures in centrifugal pumps." }] },
            { "id": "D1-L3", "title": "L3: Disturbed Flow Dynamics", "missions": [{ "id": "D1-M3", "title": "Non-Newtonian Rheology", "formula": "τ = K(dv/dy)^n", "theory": "Modeling power-law fluids in polymer processing lines." }] },
            { "id": "D1-L4", "title": "L4: Principal GET Hydraulics", "missions": [{ "id": "D1-M4", "title": "Site Distribution Optim", "formula": "min Σ(dP * Q)", "theory": "Minimizing energy loss in parallel pump-station topologies." }] }
        ]
    },
    {
        "id": "D2-THERMO",
        "title": "CHEMICAL & PHASE THERMODYNAMICS",
        "description": "The laws of nature governing energy transformation and equilibrium.",
        "tiers": [
            { "id": "D2-L1", "title": "L1: First Principles", "missions": [{ "id": "D2-M1", "title": "Energy Balance (Static)", "formula": "dU = dQ - dW", "theory": "Mastering enthalpy departures in closed-system cycles." }] },
            { "id": "D2-L2", "title": "L2: Utilities & Steam", "missions": [{ "id": "D2-M2", "title": "Steam Quality & Enthalpy", "formula": "h = hf + x*hfg", "theory": "Monitoring boiler efficiency and utility steam headers." }] },
            { "id": "D2-L3", "title": "L3: Activity & Non-Ideality", "missions": [{ "id": "D2-M3", "title": "Wilson Coefficient Tuning", "formula": "ln(γ) = f(Λ, x)", "theory": "Modeling polar mixture deviations in multicomponent VLE." }] },
            { "id": "D2-L4", "title": "L4: Equation of State Expert", "missions": [{ "id": "D2-M4", "title": "EOS Solver (Peng-Rob)", "formula": "P = RT/(v-b) - a(T)/...", "theory": "Critical site-wide thermodynamic modeling for HP reactors." }] }
        ]
    },
    {
        "id": "D3-REACTION",
        "title": "KINETICS & REACTOR OPTIMIZATION",
        "description": "Controlling the rate and selectivity of molecular transformations.",
        "tiers": [
            { "id": "D3-L1", "title": "L1: Ideal Reactor Design", "missions": [{ "id": "D3-M1", "title": "CSTR Sizing Equation", "formula": "V = F_A0 * X / -rA", "theory": "Determining volume for steady-state 90% conversion." }] },
            { "id": "D3-L2", "title": "L2: Thermal Stability", "missions": [{ "id": "D3-M2", "title": "Runaway Prevention (HAZ)", "formula": "Q_rem > Q_gen", "theory": "Calibrating jacket cooling interlocks for exotherms." }] },
            { "id": "D3-L3", "title": "L3: Catalytic Deactivation", "missions": [{ "id": "D3-M3", "title": "Sintering & Fouling RUL", "formula": "a(t) = exp(-kd*t)", "theory": "Predicting Catalyst Bed life and replacement windows." }] },
            { "id": "D3-L4", "title": "L4: GET Selectivity Mastery", "missions": [{ "id": "D3-M4", "title": "Yield/NPV Optimization", "formula": "Max(Profit) s.t. Conversion", "theory": "Balancing T/P for max profitable side-chain yield." }] }
        ]
    },
    {
        "id": "D4-MASS",
        "title": "MASS TRANSFER & SEPARATIONS",
        "description": "Purifying products through diffusion, distillation, and extraction.",
        "tiers": [
            { "id": "D4-L1", "title": "L1: Fickian Diffusion", "missions": [{ "id": "D4-M1", "title": "Molecular Flux J_A", "formula": "J_A = -D_AB * dc/dz", "theory": "Calculating mass gradients in stagnant gas films." }] },
            { "id": "D4-L2", "title": "L2: Distillation Ops", "missions": [{ "id": "D4-M2", "title": "McCabe-Thiele R_min", "formula": "y = L/V * x + ...", "theory": "Monitoring tray efficiency and reflux ratios locally." }] },
            { "id": "D4-L3", "title": "L3: Multi-Component Sept", "missions": [{ "id": "D4-M3", "title": "Fenske-Underwood-Gill", "formula": "N_min = ln(...)", "theory": "Designing industrial columns for 5+ species streams." }] },
            { "id": "D4-L4", "title": "L4: GET Membrane Tech", "missions": [{ "id": "D4-M4", "title": "Permeability Integration", "formula": "Flux = P/l * (dp)", "theory": "Replacing high-energy distillation with membrane loops." }] }
        ]
    },
    {
        "id": "D5-CONTROL",
        "title": "PROCESS CONTROL & AUTOMATION",
        "description": "PID loops, feedback dynamics, and digital twins.",
        "tiers": [
            { "id": "D5-L1", "title": "L1: Loop Dynamics", "missions": [{ "id": "D5-M1", "title": "Transfer Func G(s)", "formula": "G(s) = K / (τs + 1)", "theory": "Analyzing First-Order response to step changes." }] },
            { "id": "D5-L2", "title": "L2: Field Maintenance", "missions": [{ "id": "D5-M2", "title": "Valve Stiction Diag", "formula": "hysteresis > 3%", "theory": "site Maintenance: Calibrating stuck pneunamic actuators." }] },
            { "id": "D5-L3", "title": "L3: Controller Tuning", "missions": [{ "id": "D5-M3", "title": "ZN vs IMC Tuning", "formula": "Kc, Ti, Td = ...", "theory": "Optimizing reactor temperature loop performance." }] },
            { "id": "D5-L4", "title": "L4: Digital Twin MPC", "missions": [{ "id": "D5-M4", "title": "Model Predictive Optim", "formula": "min J = (y-y_r)² + ...", "theory": "Implementing AI-driven setpoint trajectories for profit." }] }
        ]
    },
    {
        "id": "D6-SAFETY",
        "title": "INDUSTRIAL SAFETY & HAZARDS",
        "description": "Quantifying risk via HAZOP, LOPA, and SIL layering.",
        "tiers": [
            { "id": "D6-L1", "title": "L1: Material Risks", "missions": [{ "id": "D6-M1", "title": "Toxicity PEL / TWA", "formula": "TWA = (Ci*ti) / 8", "theory": "Designing safe exposure protocols for site staff." }] },
            { "id": "D6-L2", "title": "L2: Relief Valve Specs", "missions": [{ "id": "D6-M2", "title": "PSV Sizing (API 520)", "formula": "A = W / (C*Kd*P...)", "theory": "Ensuring vessel integrity during Fire Overpressure cases." }] },
            { "id": "D6-L3", "title": "L3: Layer Architecture", "missions": [{ "id": "D6-M3", "title": "SIL Verification (LOPA)", "formula": "PFD = Risk_i / Risk_goal", "theory": "Checking Safety Instrumented Function (SIF) health." }] },
            { "id": "D6-L4", "title": "L4: Site QRA Principal", "missions": [{ "id": "D6-M4", "title": "Quant. Risk Assessment", "formula": "Risk Σ(Freq * Cons)", "theory": "Mapping Fatality Iso-Risk contours across the site." }] }
        ]
    },
    {
        "id": "D7-ECON",
        "title": "PROJECT ECONOMICS & CAPEX",
        "description": "Net Present Value, IRR, and the business of engineering.",
        "tiers": [
            { "id": "D7-L1", "title": "L1: Equipment Costing", "missions": [{ "id": "D7-M1", "title": "Capacity Fact Logic", "formula": "C2 = C1 * (S2/S1)^0.6", "theory": "The 6/10th rule for scaling industrial reactors." }] },
            { "id": "D7-L2", "title": "L2: Operating Margin", "missions": [{ "id": "D7-M2", "title": "Feedstock Sensitivity", "formula": "Margin = Rev - Raw_Cost", "theory": "Tracking profit vs Natural Gas spot market volatility." }] },
            { "id": "D7-L3", "title": "L3: Project Viability", "missions": [{ "id": "D7-M3", "title": "NPV & IRR (GET Level)", "formula": "NPV = Σ CF_t / (1+r)^t", "theory": "Evaluating capital allocation for the Q3 expansion." }] },
            { "id": "D7-L4", "title": "L4: Principal Strategist", "missions": [{ "id": "D7-M4", "title": "Lifecycle Carbon Tax", "formula": "FCF = Profit - CO2_Cost", "theory": "Integrating global carbon pricing into 10-yr NPV models." }] }
        ]
    },
    {
        "id": "D8-ENV",
        "title": "SUSTAINABILITY & GREEN CORE",
        "description": "Zero-emission design and carbon sequestration pathways.",
        "tiers": [
            { "id": "D8-L1", "title": "L1: LCA Basics", "missions": [{ "id": "D8-M1", "title": "Cradle-to-Gate CO2", "formula": "Footprint = Σ(m_i * EF_i)", "theory": "Calculating mass-based emission factors for site." }] },
            { "id": "D8-L2", "title": "L2: Secondary Waste", "missions": [{ "id": "D8-M2", "title": "BOD/COD Remediation", "formula": "Eff_rem = (C_in-C_out)/Cin", "theory": "Optimizing water treatment plant throughput." }] },
            { "id": "D8-L3", "title": "L3: Carbon Capture", "missions": [{ "id": "D8-M3", "title": "Amine Column Scrubbing", "formula": "X_co2 = ...", "theory": "Modeling Post-Combustion CCS for the power site." }] },
            { "id": "D8-L4", "title": "L4: Net-Zero GET", "missions": [{ "id": "D8-M4", "title": "Circular Feedstock AI", "formula": "min Waste s.t. Loop", "theory": "Designing a strictly zero-waste industrial ecosystem." }] }
        ]
    },
    {
        "id": "D9-MAT",
        "title": "MATERIALS & METALLURGY",
        "description": "Corrosion, erosion, and high-temp alloy integrity.",
        "tiers": [
            { "id": "D9-L1", "title": "L1: Crystal Structure", "missions": [{ "id": "D9-M1", "title": "Unit Cell Density", "formula": "ρ = (n * Mw) / (V_cell * Na)", "theory": "Understanding lattice impact on tensile strength." }] },
            { "id": "D9-L2", "title": "L2: Corrosion Rates", "missions": [{ "id": "D9-M2", "title": "MPY Penetration", "formula": "mpy = (534 * W) / (DAT)", "theory": "Monitoring wall thinning in high-acid pipelines." }] },
            { "id": "D9-L3", "title": "L3: Alloy Optimization", "missions": [{ "id": "D9-M3", "title": "PREN Numerical Index", "formula": "PREN = Cr + 3.3Mo + ...", "theory": "Selecting steel for sea-water heat exchangers." }] },
            { "id": "D9-L4", "title": "L4: GET Integrity Lead", "missions": [{ "id": "D9-M4", "title": "Stress Crack Predictive", "formula": "K1c = Limit", "theory": "Modeling Fracture Mechanics for HP pressure vessels." }] }
        ]
    },
    {
        "id": "D10-UTILITIES",
        "title": "SITE UTILITIES & NETWORKS",
        "description": "Power, Steam, Cooling Water, and Compressed Air.",
        "tiers": [
            { "id": "D10-L1", "title": "L1: Pump Power", "missions": [{ "id": "D10-M1", "title": "Brake Horsepower", "formula": "BHP = (Q * H * SG) / 3960η", "theory": "Calculating electricity demand for feed pumps." }] },
            { "id": "D10-L2", "title": "L2: Cooling Tower Duty", "missions": [{ "id": "D10-M2", "title": "Evaporation Loss", "formula": "E = f(C_t, ΔT, WBT)", "theory": "Balancing water make-up and drift in towers." }] },
            { "id": "D10-L3", "title": "L3: Cogeneration", "missions": [{ "id": "D10-M3", "title": "Combined Heat/Power", "formula": "η_chp = (Q_th + W_el) / Q_f", "theory": "Optimizing site gas turbines for max thermal efficiency." }] },
            { "id": "D10-L4", "title": "L4: Principal Site Lead", "missions": [{ "id": "D10-M4", "title": "Global Energy Balance", "formula": "Σ E_in = Σ E_out + Loss", "theory": "Principal Challenge: Zeroing site thermal losses." }] }
        ]
    }
];
