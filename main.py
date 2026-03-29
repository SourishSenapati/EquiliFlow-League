"""
FastAPI Backend for EquiliFlow League: The Progressive Digital Twin.
This module serves the industrial simulation engine and the forensic dashboard.
"""

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
import numpy as np
import os

# Core Engine Imports
from engine.network import PlantNetwork
from engine.components import Tank, Pump, Edge
from engine.solvers import FlowSolver
from engine.physics import (
    arrhenius_rate,
    cstr_design_equation,
    calculate_opex,
    calculate_revenue
)

app = FastAPI(title="EquiliFlow Industrial API")

def sanitize(data: Any) -> Any:
    """ENSURE JSON SAFETY: Converts inf/nan values to 0.0 to prevent frontend crashes."""
    if isinstance(data, dict):
        return {k: sanitize(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [sanitize(i) for i in data]
    elif isinstance(data, (float, int)):
        if np.isinf(data) or np.isnan(data):
            return 0.0
    return data

# --- SIMULATION STATE ---

class SimState:
    """In-memory singleton for the current simulation session."""
    def __init__(self):
        self.network = PlantNetwork()
        self.solver = FlowSolver(self.network)
        self.year = 1
        self.capital = 1000.0

state = SimState()

# --- REQUEST MODELS ---

class HydroSolveRequest(BaseModel):
    tank_id: str = "T-101"
    pump_id: str = "P-101"
    pipe_id: str = "L-101"
    target_flow: float = 50.0 # m3/hr
    tank_pressure: float = 101325.0 # Pa
    pipe_diameter_mm: float = 50.0
    pipe_length_m: float = 100.0

class KineticsSolveRequest(BaseModel):
    temp_k: float = 350.0
    conversion: float = 0.75
    fa0: float = 2.5
    ca0: float = 1.5
    pre_expo: float = 1e7
    activation_e: float = 60000.0

# --- GLOBAL ERROR HANDLING ---

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"message": "System Fault", "detail": str(exc)}
    )

# --- ENDPOINTS ---

@app.get("/api/v1/status")
async def get_status():
    """Returns the current state of the industrial twin."""
    return sanitize({
        "status": "operational", 
        "year": state.year, 
        "capital": state.capital
    })

@app.post("/api/v1/simulation/hydrodynamics/solve")
async def solve_hydrodynamics(req: HydroSolveRequest):
    """Solves for pressure drop and required pump power in a single path."""
    density = 1000.0 # Water
    gravity = 9.81
    level_m = req.tank_pressure / (density * gravity)
    
    # Update local network nodes
    tank = Tank(req.tank_id, level=level_m, density=density)
    pump = Pump(req.pump_id, efficiency=0.75)
    pipe = Edge(id=req.pipe_id, source=tank.id, target=pump.id, length=req.pipe_length_m, diameter=req.pipe_diameter_mm/1000.0)
    
    state.network.add_node(tank)
    state.network.add_node(pump)
    state.network.add_edge(tank.id, pump.id, pipe)

    q_m3s = req.target_flow / 3600.0
    solve_data = state.solver.solve_simple_path(tank.id, pump.id, pipe.id, q_m3s)
    
    # Calculate Economic Impact
    opex = calculate_opex(solve_data['pump_power_w'])
    state.capital -= (opex / 24.0) # Cost for 1 hour of simulation
    
    return sanitize({
        "physics": solve_data,
        "economics": {
            "opex_impact": opex / 24.0, 
            "remaining_capital": state.capital
        }
    })

@app.post("/api/v1/simulation/kinetics/solve")
async def solve_kinetics(req: KineticsSolveRequest):
    """Calculates rate constants and required CSTR volume based on thermal input."""
    k_val = arrhenius_rate(req.pre_expo, req.activation_e, req.temp_k)
    v_req = cstr_design_equation(req.fa0, req.conversion, k_val, req.ca0)
    
    # Passive revenue from successful conversion
    revenue = calculate_revenue(req.fa0, multiplier=2.0)
    state.capital += revenue
    
    return sanitize({
        "rate_constant": k_val,
        "volume_required": v_req,
        "conversion": req.conversion,
        "revenue_gen": revenue,
        "remaining_capital": state.capital
    })

@app.post("/api/v1/curriculum/advance")
async def advance_year():
    """Advances the student to the next academic tier."""
    if state.year < 4:
        state.year += 1
        return {"new_year": state.year, "message": "Evaluation Successful. Tier Unlocked."}
    raise HTTPException(status_code=400, detail="Maximum curriculum reached.")

@app.post("/api/v1/simulation/reset")
async def reset_simulation():
    """Resets the simulation environment state."""
    global state
    state = SimState()
    return {"message": "System Re-initialized Successfully"}

# --- STATIC ASSET SERVING ---

base_path = os.path.dirname(os.path.abspath(__file__))
frontend_path = os.path.join(base_path, "frontend")
app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")

if __name__ == "__main__":
    import uvicorn
    # Use 8181 to avoid common port conflicts
    uvicorn.run(app, host="127.0.0.1", port=8181)
