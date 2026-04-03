import json
import os

CURRICULUM_DATA = {
    "fluids": {
        "title": "Fluid Dynamics & Momentum",
        "levels": [
            { "id": "L1", "title": "Bernoulli's Continuum", "formula": "P + 1/2\u03c1v\u00b2 + \u03c1gh = C", "theory": "Conservation of mechanical energy for inviscid, incompressible flow. Analyzing how static pressure converts to kinetic energy in a frictionless venturi.", "vars": [{"sym": "P", "def": "Static Pressure (Pa)"}, {"sym": "v", "def": "Velocity (m/s)"}] },
            { "id": "L2", "title": "Centrifugal Pump Metrics", "formula": "NPSHa = (Patm - Pv)/\u03c1g + hs - hf", "theory": "Predicting cavitation by monitoring Net Positive Suction Head Available. Maintaining static head (hs) to prevent impeller erosion.", "vars": [{"sym": "Pv", "def": "Vapor Pressure"}, {"sym": "hf", "def": "Friction Head Loss"}] },
            { "id": "L3", "title": "Power-Law Rheology", "formula": "\u03c4 = K(dv/dy)^n", "theory": "Modeling non-Newtonian flow in complex polymers. Determining the consistency index (K) for high-viscosity industrial extrusions.", "vars": [{"sym": "K", "def": "Consistency Index"}, {"sym": "n", "def": "Flow Behavior Index"}] },
            { "id": "L4", "title": "Site Hydraulic Gradient", "formula": "min \u03a3(dP * Q)", "theory": "Principal GET Challenge: Balancing massive parallel pump stations to meet site demand while minimizing parasitic energy consumption.", "vars": [{"sym": "dP", "def": "Diff. Pressure"}, {"sym": "Q", "def": "Flow Rate"}] }
        ]
    },
    "thermo": {
        "title": "Chemical Thermodynamics",
        "levels": [
            { "id": "L1", "title": "First Law: Open Control Volume", "formula": "Q - W = \u0394(H + Ek + Ep)", "theory": "Energy balance for steady-state flow systems. Tracking enthalpy departures across heaters and adiabatic compressor stages.", "vars": [{"sym": "H", "def": "Enthalpy"}, {"sym": "Q", "def": "Heat Flux"}] },
            { "id": "L2", "title": "Steam Quality \u03a7 Analysis", "formula": "h = hf + \u03c7*hfg", "theory": "Determining steam dryness for site boilers. Preventing turbine damage from water carryover in utility headers.", "vars": [{"sym": "\u03c7", "def": "Dryness Fraction"}, {"sym": "hfg", "def": "Latent Heat"}] },
            { "id": "L3", "title": "NRTL/Wilson Activity Models", "formula": "ln(\u03b3_i) = f(\u03c4, G)", "theory": "Mapping non-ideal Vapor-Liquid Equilibrium (VLE). Calculating activity coefficients (\u03b3) for polar chemical mixtures.", "vars": [{"sym": "\u03b3", "def": "Activity Coeff"}, {"sym": "\u03c4", "def": "Interaction Energy"}] },
            { "id": "L4", "title": "Peng-Robinson EOS Convergence", "formula": "Z\u00b3 - (1-B)Z\u00b2 + (A-2B-3B\u00b2)Z...", "theory": "Solving for compressibility (Z) in high-pressure reactor modeling. Accurate prediction of real-gas molar volumes.", "vars": [{"sym": "Z", "def": "Compressibility"}, {"sym": "T_c", "def": "Critical Temp"}] }
        ]
    },
    "reaction": {
        "title": "Reaction & Kinetics Ops",
        "levels": [
            { "id": "L1", "title": "Ideal CSTR Space Time", "formula": "\u03c4 = V / v_0 = X / (-r_A)", "theory": "Sizing steady-state reactors based on residence time (\u03c4). Determining conversion limits for first-order kinetics.", "vars": [{"sym": "\u03c4", "def": "Space Time (s)"}, {"sym": "X", "def": "Fractional Conversion"}] },
            { "id": "L2", "title": "Thermal Runaway Criticality", "formula": "dT/dt = (Q_gen - Q_rem)/mCp", "theory": "Preventing exothermic temperature escalation. Calibrating safety relief interlocks based on adiabatic temp rise.", "vars": [{"sym": "Q_gen", "def": "Heat Generation"}, {"sym": "mCp", "def": "Mass Heat Cap"}] },
            { "id": "L3", "title": "Catalyst Activity Decay", "formula": "-da/dt = kd * a^p", "theory": "Modeling deactivation due to site poison carryover (Sulphur/Coke). Predicting Remaining Useful Life (RUL).", "vars": [{"sym": "a", "def": "Activity Phase"}, {"sym": "kd", "def": "Decay Constant"}] },
            { "id": "L4", "title": "Selectivity/Profit Sensitivity", "formula": "Max Margins s.t. Conversion", "theory": "Principal Site Challenge: Maximizing high-value product yield while minimizing hazardous byproducts via temperature sweep.", "vars": [{"sym": "\u03a6", "def": "Yield"}, {"sym": "$", "def": "Operating Profit"}] }
        ]
    },
    "mass": {
        "title": "Mass Transfer & Separation",
        "levels": [
            { "id": "L1", "title": "Molecular Fickian Flux", "formula": "J_A = -D_AB * dc/dz", "theory": "First principles of diffusive transport. Calculating mass gradients for gas-leak sensing in site containment.", "vars": [{"sym": "J_A", "def": "Mass Flux"}, {"sym": "D_AB", "def": "Diffusivity"}] },
            { "id": "L2", "title": "McCabe-Thiele Reflux Opt", "formula": "y = L/V * x + (D/V * xD)", "theory": "Monitoring tray efficiency and reflux ratios. Ensuring product purity in high-energy naphtha splitters.", "vars": [{"sym": "L/V", "def": "Reflux Ratio"}, {"sym": "xD", "def": "Purity"}] },
            { "id": "L3", "title": "FUG Column Design Methods", "formula": "N_min = ln(\u03b1) / ...", "theory": "Multi-component column modeling. Predicting minimum stages (N_min) for complex site separation loops.", "vars": [{"sym": "\u03b1", "def": "Rel. Volatility"}, {"sym": "N", "def": "Stage Count"}] },
            { "id": "L4", "title": "Membrane Partitioning AI", "formula": "J = P/l * \u0394p", "theory": "Integrating zero-emission membrane harvesting into the site core to replace traditional high-cost distillation.", "vars": [{"sym": "P", "def": "Permeability"}, {"sym": "l", "def": "Layer Thickness"}] }
        ]
    },
    "control": {
        "title": "Process Control & PID",
        "levels": [
            { "id": "L1", "title": "Loop Stability Dynamics", "formula": "G(s) = K / (\u03c4s + 1)", "theory": "Control first principles. Analyzing the overshoot and damping of reactor temperature feedback loops.", "vars": [{"sym": "K", "def": "Process Gain"}, {"sym": "\u03c4", "def": "Time Constant"}] },
            { "id": "L2", "title": "Transmitter Nulling/Zeroing", "formula": "Error = |Measured - Target|", "theory": "Field Engineering: Calibrating 4-20mA pressure sensors. Correcting for signal drift in remote site headers.", "vars": [{"sym": "mA", "def": "Loop Signal"}, {"sym": "PV", "def": "Process Variable"}] },
            { "id": "L3", "title": "Cascade Control Strategy", "formula": "Outer_Loop -> Inner_Settpoint", "theory": "Tuning reactor cores using slave/master interaction. Eliminating feed temperature noise before it hits the core.", "vars": [{"sym": "SP", "def": "Setpoint"}, {"sym": "CV", "def": "Controlled Var"}] },
            { "id": "L4", "title": "MPC Digital Twin State", "formula": "min J = \u03a3(y-yr)\u00b2 + (du)\u00b2", "theory": "Model Predictive Control: Forecasting site trajectories. Using AI-driven Twins to maintain tight profit margins.", "vars": [{"sym": "J", "def": "Objective Func"}, {"sym": "u", "def": "Manipulated Var"}] }
        ]
    },
    "safety": {
        "title": "Safety & LOPA Analysis",
        "levels": [
            { "id": "L1", "title": "Material Hazard Matrix", "formula": "TWA = \u03a3(C*t)/8", "theory": "Safety Protocol Mastery: Designing exposure limits for toxic feedstocks based on OSHA TWA guidelines.", "vars": [{"sym": "C", "def": "Concentration (ppm)"}, {"sym": "TWA", "def": "8-hr Exposure"}] },
            { "id": "L2", "title": "PSV Fire-Case Sizing", "formula": "A = W / (C*Kd*P)", "theory": "Determining critical pressure relief valve (PSV) orifice area to prevent vessel BLEVE during site fires.", "vars": [{"sym": "W", "def": "Relief Flow"}, {"sym": "Kd", "def": "Discharge Coeff"}] },
            { "id": "L3", "title": "SIL Layer Verification", "formula": "PFD_avg = 1/2 * \u03bb * TI", "theory": "Verifying Safety Instrumented Systems (SIS). Maintaining SIL-2 certification for reactor high-pressure trips.", "vars": [{"sym": "PFD", "def": "Prob. of Failure"}, {"sym": "\u03bb", "def": "Hazard Rate"}] },
            { "id": "L4", "title": "Principal QRA Strategy", "formula": "IR = \u03a3(Freq * Cons)", "theory": "Site Lead Challenge: Mapping Individual Risk (IR) fatality contours to optimize site layout for personnel safety.", "vars": [{"sym": "IR", "def": "Fatality Risk"}, {"sym": "Freq", "def": "Event Freq"}] }
        ]
    },
    "economics": {
        "title": "Project Economics & NPV",
        "levels": [
            { "id": "L1", "title": "Capex Cost Escalation", "formula": "C2 = C1 * (I2/I1)", "theory": "Adjusting historical equipment costs using modern CEPCI indices to estimate project capital requirements.", "vars": [{"sym": "C1", "def": "Base Cost"}, {"sym": "I", "def": "Cost Index"}] },
            { "id": "L2", "title": "Operating Marginal Break-Even", "formula": "BEP = Fixed_Costs / (P - V)", "theory": "Analyzing site profitability. Determining the break-even point in units based on feed and price volatility.", "vars": [{"sym": "P", "def": "Unit Price"}, {"sym": "V", "def": "Variable Cost"}] },
            { "id": "L3", "title": "Strategic NPV/IRR Forecasting", "formula": "NPV = \u03a3 CF_t/(1+r)^t - Cost", "theory": "Principal Strategy: Evaluating a 10-year decarbonization project. Analyzing internal rate of return (IRR).", "vars": [{"sym": "NPV", "def": "Net Present Val"}, {"sym": "r", "def": "Discount Rate"}] },
            { "id": "L4", "title": "Global Site Value Creation", "formula": "Profit = Revenue - (OpEx + Tax)", "theory": "Managing the site as a business. Balancing global market feedstock trends against carbon tax liabilities.", "vars": [{"sym": "V", "def": "Equity Value"}, {"sym": "Tax", "def": "Env Penalty"}] }
        ]
    },
    "sustainability": {
        "title": "Net-Zero Sustainability",
        "levels": [
            { "id": "L1", "title": "Cradle-to-Gate LCA Scope", "formula": "E = \u03a3(m * EF)", "theory": "Life Cycle Assessment (LCA) first principles. Calculating Scope 1 and 2 emissions for site-wide feedstocks.", "vars": [{"sym": "m", "def": "Mass Input"}, {"sym": "EF", "def": "Emission Coeff"}] },
            { "id": "L2", "title": "Secondary Water Remediation", "formula": "\u03b7_rem = (Cin - Cout) / Cin", "theory": "Optimizing water treatment efficiency (BOD/COD) to ensure ZERO discharge impact on local ecosystems.", "vars": [{"sym": "\u03b7", "def": "Remed. Efficiency"}, {"sym": "C", "def": "Pollutant Conc"}] },
            { "id": "L3", "title": "Post-Combustion Carbon Prep", "formula": "X_co2 = F(Flux, Abs)", "theory": "Modeling amine-based carbon scrubbing. Balancing solvent circulation against flue gas CO2 concentrations.", "vars": [{"sym": "Abs", "def": "Absorption %"}, {"sym": "S", "def": "Solvent Duty"}] },
            { "id": "L4", "title": "Advanced Circular Loops", "formula": "min Waste s.t. Recycling", "theory": "GET Principal Challenge: Zero-waste industrial site. Designing circular byproduct loops for high-value recapture.", "vars": [{"sym": "NZ", "def": "Net Zero Stat"}, {"sym": "Cir", "def": "Circularity Index"}] }
        ]
    },
    "materials": {
        "title": "Materials & Chemistry",
        "levels": [
            { "id": "L1", "title": "Lattice Stress \u03b7 Analysis", "formula": "\u03c1 = (n*Mw)/(V*Na)", "theory": "Material Science: Calculating crystal occupancy density. Understanding impact on high-temp reactor creep.", "vars": [{"sym": "\u03c1", "def": "Crystal Density"}, {"sym": "Na", "def": "Avogadro Number"}] },
            { "id": "L2", "title": "Acidic Corrosion MPY Penetration", "formula": "mpy = (534*W)/(DAT)", "theory": "Site Integrity: Monitoring wall thinning in high-acid pipelines. Predicting equipment replacement windows.", "vars": [{"sym": "mpy", "def": "Mils Per Year"}, {"sym": "W", "def": "Mass Loss"}] },
            { "id": "L3", "title": "PREN Corrosion Selection", "formula": "PREN = Cr + 3.3Mo + 16N", "theory": "Selecting alloys for aggressive site environments. Optimizing cost vs Pitting Resistance Equivalent Number (PREN).", "vars": [{"sym": "Cr", "def": "Chromium %"}, {"sym": "Mo", "def": "Molybdenum %"}] },
            { "id": "L4", "title": "Stress Crack K1c Predictive", "formula": "K1c = Y * \u03c3 * (\u03c0a)^0.5", "theory": "Ensuring high-pressure vessel integrity. Modeling fracture mechanics (K1c) to prevent catastrophic wall failure.", "vars": [{"sym": "\u03c3", "def": "Applied Stress"}, {"sym": "a", "def": "Crack Depth"}] }
        ]
    },
    "utilities": {
        "title": "Site Utility Networks",
        "levels": [
            { "id": "L1", "title": "Brake Horsepower Utility", "formula": "BHP = (Q*H*SG) / (3960*\u03b7)", "theory": "Utility Load Calculation. Determining motor power required for site-wide cooling water circulation.", "vars": [{"sym": "BHP", "def": "Mech Power"}, {"sym": "\u03b7", "def": "Efficiency"}] },
            { "id": "L2", "title": "Cooling Tower Evaporation Duty", "formula": "E = f(C, \u0394T, WBT)", "theory": "Maintaining site thermal balance. Monitoring evaporation and drift losses to reduce makeup water costs.", "vars": [{"sym": "\u0394T", "def": "Thermal Range"}, {"sym": "WBT", "def": "Wet Bulb Temp"}] },
            { "id": "L3", "title": "CHP Cogeneration Efficiency", "formula": "\u03b7_chp = (Qth + Wel) / Qf", "theory": "Optimizing site Heat \u0026 Power assets. Maximizing thermal recapture from site-wide gas turbines.", "vars": [{"sym": "Qth", "def": "Thermal Out"}, {"sym": "Wel", "def": "Elec Out"}] },
            { "id": "L4", "title": "Global Irreversibility Minimum", "formula": "\u03a3 Ein = \u03a3 Eout + Loss", "theory": "Principal Utility Challenge: Mastering Entropy. Eliminating second-law losses in massive site-wide utility headers.", "vars": [{"sym": "Loss", "def": "Exergy Loss"}, {"sym": "S_gen", "def": "Entropy Gen"}] }
        ]
    }
}

base_path = "frontend/curriculum"
os.makedirs(base_path, exist_ok=True)

manifest = {"domains": []}

for d_slug, data in CURRICULUM_DATA.items():
    d_path = os.path.join(base_path, d_slug)
    os.makedirs(d_path, exist_ok=True)
    
    domain_entry = {
        "id": d_slug,
        "title": data["title"],
        "files": []
    }
    
    for level in data["levels"]:
        filename = f"{level['id']}.json"
        filepath = os.path.join(d_path, filename)
        
        # Prepare content
        content = {
            "id": f"{d_slug}_{level['id']}",
            "title": level["title"],
            "formula": level["formula"],
            "theory": level["theory"],
            "variables": level["vars"]
        }
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(content, f, indent=2)
            
        domain_entry["files"].append(f"{d_slug}/{filename}")
    
    manifest["domains"].append(domain_entry)

# Write Manifest
with open(os.path.join(base_path, "manifest.json"), 'w', encoding='utf-8') as f:
    json.dump(manifest, f, indent=2)

print(f"Successfully generated structured curriculum in {base_path}")
