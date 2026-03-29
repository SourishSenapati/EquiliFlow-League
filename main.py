"""
FastAPI Backend for CoreFlow: The Progressive Digital Twin.
Simplified, Industrial-Grade version to ensure maximum compatibility.
"""

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
import numpy as np
import json
import os

# Core Engine Imports
from engine.network import PlantNetwork
from engine.components import Tank, Pump, Edge
from engine.solvers import FlowSolver
from engine.physics import (
    arrhenius_rate,
    cstr_design_equation,
    calculate_opex
)

app = FastAPI(title="CoreFlow Industrial API")

def sanitize(data: Any) -> Any:
    """Helper for manual JSON safety. Converts inf/nan to 0.0."""
    if isinstance(data, dict):
        return {k: sanitize(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [sanitize(i) for i in data]
    elif isinstance(data, (float, int)):
        if np.isinf(data) or np.isnan(data):
            return 0.0
    return data

# --- DATA MODELS ---

class SimState:
    """In-memory singleton for the current simulation session."""
    def __init__(self):
        self.network = PlantNetwork()
        self.solver = FlowSolver(self.network)
        self.year = 1
        self.capital = 1000.0

state = SimState()

class PathSolveRequest(BaseModel):
    tank_id: str = "T-101"
    pump_id: str = "P-101"
    pipe_id: str = "L-101"
    target_flow: float = 50.0
    tank_pressure: float = 101325.0
    pipe_diameter_mm: float = 50.0
    pipe_length_m: float = 100.0

class KineticsSolveRequest(BaseModel):
    temp_k: float
    conversion: float
    fa0: float = 2.5
    ca0: float = 1.5
    pre_expo: float = 1e7
    activation_e: float = 60000

# --- GLOBAL ERROR HANDLING ---

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"System Error Logged: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"message": "System Fault", "detail": str(exc)}
    )

# --- ENDPOINTS ---

@app.get("/api/v1/status")
async def get_status():
    return sanitize({"status": "operational", "year": state.year, "capital": state.capital})

@app.post("/api/v1/simulation/hydrodynamics/solve")
async def solve_hydrodynamics(req: PathSolveRequest):
    density = 1000.0
    gravity = 9.81
    level_m = req.tank_pressure / (density * gravity)
    
    tank = Tank(req.tank_id, level=level_m, density=density)
    pump = Pump(req.pump_id, efficiency=0.75)
    pipe = Edge(id=req.pipe_id, source=tank.id, target=pump.id, length=req.pipe_length_m, diameter=req.pipe_diameter_mm/1000.0)
    
    state.network.add_node(tank)
    state.network.add_node(pump)
    state.network.add_edge(tank.id, pump.id, pipe)

    q_m3s = req.target_flow / 3600.0
    solve_data = state.solver.solve_simple_path(tank.id, pump.id, pipe.id, q_m3s, p_out_target=200000.0)
    
    opex = calculate_opex(solve_data['pump_power_w'])
    state.capital -= opex / 24.0
    
    return sanitize({
        "physics": solve_data,
        "economics": {"hourly_opex": opex / 24.0, "remaining_capital": state.capital}
    })

@app.post("/api/v1/curriculum/advance")
async def advance_year():
    if state.year < 4:
        state.year += 1
        return {"new_year": state.year, "message": "Advancement Approved."}
    return {"message": "Maximum curriculum reached."}

@app.post("/api/v1/simulation/reset")
async def reset_simulation():
    global state
    state = SimState()
    return {"message": "Reset Successful"}

# Static Files
base_path = os.path.dirname(os.path.abspath(__file__))
frontend_path = os.path.join(base_path, "frontend")
app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8181)
