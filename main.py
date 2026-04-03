import json
import os
import time
from typing import Dict, Any, List
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

# --- DATABASE LAYER ---
class ChellDB:
    def __init__(self, filename="db.json"):
        self.filename = filename
        self.data = self._load()

    def _load(self) -> Dict[str, Any]:
        if os.path.exists(self.filename):
            with open(self.filename, 'r') as f:
                return json.load(f)
        return {
            "user": {"name": "Sourish Senapati", "xp": 0, "credits": 5, "is_pro": False},
            "assets": [
                {"id": "T-101", "type": "Reactor", "tier": 1, "durability": 100, "efficiency": 0.98},
                {"id": "P-101", "type": "Pump", "tier": 1, "durability": 100, "efficiency": 0.85},
                {"id": "L-101", "type": "Valve", "tier": 1, "durability": 100, "efficiency": 0.95}
            ],
            "checkpoints": []
        }

    def save(self):
        with open(self.filename, 'w') as f:
            json.dump(self.data, f, indent=2)

    def update_user(self, updates: Dict[str, Any]):
        self.data["user"].update(updates)
        self.save()

    def add_checkpoint(self, mission_id: str):
        if mission_id not in self.data["checkpoints"]:
            self.data["checkpoints"].append(mission_id)
            self.save()

db = ChellDB()

# --- APP SETUP ---
app = FastAPI()

class SimState(BaseModel):
    capital: float = 154200.0
    year: int = 1
    physics: Dict[str, float] = {
        "flow_rate": 335.4,
        "temp_k": 322.0,
        "conversion": 0.77,
        "ai_loss": 0.00042
    }

current_state = SimState()

# --- API ENDPOINTS ---
@app.get("/api/v1/db/state")
async def get_db_state():
    return db.data

@app.get("/api/v1/user/profile")
async def get_profile():
    return db.data["user"]

@app.post("/api/v1/user/upgrade")
async def upgrade_user():
    db.update_user({"is_pro": True, "credits": 999999})
    return {"status": "success", "message": "CHELL PRO Activated"}

@app.post("/api/v1/simulation/checkpoint")
async def save_checkpoint(mission_id: str):
    db.add_checkpoint(mission_id)
    # Exponential XP award (simulated)
    current_xp = db.data["user"].get("xp", 0)
    db.update_user({"xp": current_xp + 100})
    return {"status": "success", "message": f"Checkpoint saved: {mission_id}"}

@app.get("/api/v1/assets/registry")
async def get_asset_registry():
    return db.data["assets"]

@app.post("/api/v1/simulation/reset")
async def reset_sim():
    global current_state
    current_state = SimState()
    return {"status": "success"}

# --- WEBSOCKET ENGINE ---
@app.websocket("/ws/reactor")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            # Simulate real-time physics jitter
            p = current_state.physics
            p["flow_rate"] += (time.time() % 0.5) - 0.25
            p["temp_k"] += (time.time() % 0.2) - 0.1
            
            await websocket.send_json({
                "capital": current_state.capital,
                "physics": p,
                "timestamp": time.time()
            })
            await time.sleep(0.5)
    except WebSocketDisconnect:
        pass

app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8181)
