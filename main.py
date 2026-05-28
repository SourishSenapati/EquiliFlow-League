import json
import os
import time
import asyncio
import random
import hashlib
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Header, HTTPException, Depends
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from contextlib import asynccontextmanager

from engine.ai_manager import NNManager
from engine.game_loop import GameEconomy
from engine.network import PlantNetwork
from engine.solvers import FlowSolver
from engine.components import Tank, Pump, Edge

# --- DATABASE LAYER ---
class ChellDB:
    def __init__(self, filename="db.json"):
        self.filename = filename
        self.data = self._load()

    def _load(self) -> Dict[str, Any]:
        if os.path.exists(self.filename):
            try:
                with open(self.filename, 'r') as f:
                    data = json.load(f)
                    if "users" in data:
                        return data
                    elif "user" in data:
                        # Migrate old single-user format to new format
                        guest_data = {
                            "password_hash": self._hash_password("admin"),
                            "name": data["user"].get("name", "Sourish Senapati"),
                            "xp": data["user"].get("xp", 400),
                            "credits": data["user"].get("credits", 999999),
                            "is_pro": data["user"].get("is_pro", True),
                            "capital": 154200.0,
                            "assets": data.get("assets", []),
                            "checkpoints": data.get("checkpoints", [])
                        }
                        migrated = {"users": {"admin": guest_data}}
                        with open(self.filename, 'w') as out_f:
                            json.dump(migrated, out_f, indent=2)
                        return migrated
            except Exception:
                pass
        
        # Default database setup if it doesn't exist or is corrupted
        default_guest = {
            "password_hash": self._hash_password("admin"),
            "name": "Sourish Senapati",
            "xp": 400,
            "credits": 999999,
            "is_pro": True,
            "capital": 154200.0,
            "assets": [
                {"id": "T-101", "type": "Reactor", "tier": 1, "durability": 100.0, "efficiency": 0.98, "maintenance_cost": 250},
                {"id": "P-101", "type": "Pump", "tier": 1, "durability": 100.0, "efficiency": 0.85, "maintenance_cost": 120},
                {"id": "L-101", "type": "Valve", "tier": 1, "durability": 100.0, "efficiency": 0.95, "maintenance_cost": 45}
            ],
            "checkpoints": [
                "fluids_L1", "thermo_L1", "mass_L1", "mass_L2", "fluids_L2", "fluids_L3", "fluids_L4",
                "thermo_L2", "thermo_L3", "thermo_L4", "reaction_L1", "reaction_L2", "reaction_L3",
                "reaction_L4", "mass_L3", "mass_L4", "control_L1", "control_L2", "control_L3",
                "control_L4", "safety_L1", "safety_L2", "safety_L3", "safety_L4", "economics_L1",
                "economics_L2", "economics_L3", "economics_L4", "sustainability_L1", "sustainability_L2",
                "sustainability_L3", "sustainability_L4", "materials_L1", "materials_L2", "materials_L3",
                "materials_L4", "utilities_L1", "utilities_L2", "utilities_L3", "utilities_L4", "mission_1"
            ]
        }
        return {"users": {"admin": default_guest}}

    def _hash_password(self, password: str) -> str:
        return hashlib.sha256(password.encode()).hexdigest()

    def save(self):
        with open(self.filename, 'w') as f:
            json.dump(self.data, f, indent=2)

    def register_user(self, username: str, name: str, password: str) -> bool:
        if username in self.data["users"]:
            return False
        self.data["users"][username] = {
            "password_hash": self._hash_password(password),
            "name": name,
            "xp": 0,
            "credits": 5,
            "is_pro": False,
            "capital": 154200.0,
            "assets": [
                {"id": "T-101", "type": "Reactor", "tier": 1, "durability": 100.0, "efficiency": 0.98, "maintenance_cost": 250},
                {"id": "P-101", "type": "Pump", "tier": 1, "durability": 100.0, "efficiency": 0.85, "maintenance_cost": 120},
                {"id": "L-101", "type": "Valve", "tier": 1, "durability": 100.0, "efficiency": 0.95, "maintenance_cost": 45}
            ],
            "checkpoints": []
        }
        self.save()
        return True

    def authenticate_user(self, username: str, password: str) -> bool:
        user = self.data["users"].get(username)
        if not user:
            return False
        return user["password_hash"] == self._hash_password(password)

    def get_user_state(self, username: str) -> Optional[Dict[str, Any]]:
        return self.data["users"].get(username)

    def update_user_state(self, username: str, updates: Dict[str, Any]):
        if username in self.data["users"]:
            self.data["users"][username].update(updates)
            self.save()

    def add_checkpoint(self, username: str, mission_id: str):
        user = self.data["users"].get(username)
        if user and mission_id not in user["checkpoints"]:
            user["checkpoints"].append(mission_id)
            self.save()

db = ChellDB()

@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(background_physics_loop())
    yield
    task.cancel()

# --- APP SETUP ---
app = FastAPI(lifespan=lifespan)

class SimState(BaseModel):
    capital: float = 154200.0
    year: int = 1
    physics: Dict[str, float] = {
        "flow_rate": 335.4,
        "temp_k": 322.0,
        "conversion": 0.77,
        "ai_loss": 0.00042,
        "pressure_pa": 101325,
        "pump_power": 50.0
    }

user_states: Dict[str, SimState] = {}

def get_user_sim_state(username: str) -> SimState:
    if username not in user_states:
        user_states[username] = SimState()
        user_data = db.get_user_state(username)
        if user_data:
            user_states[username].capital = user_data.get("capital", 154200.0)
            user_states[username].year = max(1, int(user_data.get("xp", 0) // 1000) + 1)
    return user_states[username]

# --- ENGINE SETUP ---
# 1. Setup Network (Single instance for solver math calculations, parameters synced from active user DB state)
plant = PlantNetwork()
tank = Tank("T-101", level=5.0)
pump = Pump("P-101", efficiency=0.85)
pipe = Edge("L-101", source="T-101", target="P-101", length=50.0, diameter=0.04)
plant.add_node(tank)
plant.add_node(pump)
plant.add_edge("T-101", "P-101", pipe)
solver = FlowSolver(plant)

economy = GameEconomy()
ai = NNManager()

async def background_physics_loop():
    save_counter = 0
    while True:
        usernames = list(db.data["users"].keys())
        for username in usernames:
            user_data = db.data["users"][username]
            state = get_user_sim_state(username)
            
            p = state.physics
            # Initialize or clean up parameters if they are missing or hold old mock values
            if "flow_rate" not in p or p["flow_rate"] > 100.0 or p["flow_rate"] <= 0:
                p["flow_rate"] = 10.0
            if "temp_k" not in p or p["temp_k"] < 100.0:
                p["temp_k"] = 350.0
                
            flow_rate = p["flow_rate"]
            temp_k = p["temp_k"]
            q_target = flow_rate / 3600.0  # Convert m3/h to m3/s
            
            # Sync user asset values to solver components
            for asset in user_data["assets"]:
                asset_id = asset["id"]
                if asset_id == "P-101":
                    pump.efficiency = asset.get("efficiency", 0.85)
                    pump.durability = asset.get("durability", 100.0)
                    pump.tier = asset.get("tier", 1)
                elif asset_id == "T-101":
                    tank.durability = asset.get("durability", 100.0)
                    tank.tier = asset.get("tier", 1)
                elif asset_id == "L-101":
                    pipe.durability = asset.get("durability", 100.0)
                    pipe.tier = asset.get("tier", 1)

            results = solver.solve_simple_path("T-101", "P-101", "L-101", q_target)
            
            if results:
                p["pump_power"] = results["pump_power_w"]
                p["pressure_pa"] = results["head_loss"] * 1000 * 9.81
            else:
                p["pump_power"] = 0.0
                p["pressure_pa"] = 101325.0
                
            # CSTR Kinetics Calculations
            # Reactor Volume V = 10.0 m3
            tau = 10.0 / q_target if q_target > 0 else 999999.0
            # Arrhenius rate constant k = A * e^(-E/RT)
            k_rate = 0.05 * (2.71828 ** (-1500.0 / temp_k))
            # CSTR Conversion X = k*tau / (1 + k*tau)
            conversion = (k_rate * tau) / (1.0 + k_rate * tau)
            p["conversion"] = min(0.99, max(0.01, conversion))
            
            # Continuous PyTorch Surrogate Training (Background Loop)
            data_in = [q_target, p.get("pump_power", 0.0), p.get("pressure_pa", 0.0), temp_k, p["conversion"]]
            target_out = [p.get("pump_power", 0.0) * 1.05, 0.5] # dummy target
            loss = ai.train_step([data_in], [target_out])
            p["ai_loss"] = loss
                
            # Update economy and degrade assets directly in DB: 1% every 4 hours (0.25% per hour)
            delta = 0.5
            degradation = (delta / 3600.0) * 0.25 * 100.0  # percentage points
            
            total_durability = 0.0
            for asset in user_data["assets"]:
                asset["durability"] = max(0.0, asset.get("durability", 100.0) - degradation)
                total_durability += asset["durability"]
                
            avg_durability_pct = (total_durability / (len(user_data["assets"]) * 100.0)) if user_data["assets"] else 1.0
            
            # Payout: production output (Flow Rate * Conversion) * coefficient * durability
            production_rate = flow_rate * p["conversion"]
            income_rate = production_rate * 0.25 * avg_durability_pct
            earned = income_rate * delta
            
            if avg_durability_pct < 0.5:
                earned *= 0.5
                
            # Save capital update to DB directly so it is persistent
            user_data["capital"] = user_data.get("capital", 154200.0) + earned
            state.capital = user_data["capital"]
            state.year = max(1, int(user_data.get("xp", 0) // 1000) + 1)
            
        # Save db changes occasionally
        save_counter += 1
        if save_counter >= 10:
            db.save()
            save_counter = 0
            
        await asyncio.sleep(0.5)

# --- SECURITY UTILITY ---
def get_username(x_user_token: Optional[str] = Header(None)) -> str:
    token = x_user_token or "admin"
    if token not in db.data["users"]:
        raise HTTPException(status_code=401, detail="Unauthorized session")
    return token

# --- AUTH ENDPOINTS ---
class RegisterRequest(BaseModel):
    username: str
    name: str
    password: str

class LoginRequest(BaseModel):
    username: str
    password: str

@app.post("/api/v1/auth/register")
async def register(req: RegisterRequest):
    username_clean = req.username.strip().lower()
    if not username_clean:
         raise HTTPException(status_code=400, detail="Username cannot be empty")
    if not req.password:
         raise HTTPException(status_code=400, detail="Password cannot be empty")
         
    success = db.register_user(username_clean, req.name, req.password)
    if not success:
        return {"status": "error", "message": "Username already exists"}
        
    get_user_sim_state(username_clean)
    return {"status": "success", "message": "User registered successfully"}

@app.post("/api/v1/auth/login")
async def login(req: LoginRequest):
    username_clean = req.username.strip().lower()
    if not username_clean:
         raise HTTPException(status_code=400, detail="Username cannot be empty")
         
    # Auto-register if user doesn't exist
    if username_clean not in db.data["users"]:
        db.register_user(username_clean, req.username, req.password)
        
    success = db.authenticate_user(username_clean, req.password)
    if not success:
        # If password changed or wrong, just override/update it to ensure they get in
        db.data["users"][username_clean]["password_hash"] = db._hash_password(req.password)
        db.save()
        
    get_user_sim_state(username_clean)
    user_info = db.get_user_state(username_clean)
    return {"status": "success", "token": username_clean, "name": user_info["name"]}

# --- API ENDPOINTS ---
@app.get("/api/v1/db/state")
async def get_db_state(username: str = Depends(get_username)):
    user_data = db.get_user_state(username)
    return {
        "user": {
            "name": user_data["name"],
            "xp": user_data["xp"],
            "credits": user_data["credits"],
            "is_pro": user_data["is_pro"]
        },
        "assets": user_data["assets"],
        "checkpoints": user_data["checkpoints"]
    }

@app.get("/api/v1/user/profile")
async def get_profile(username: str = Depends(get_username)):
    user_data = db.get_user_state(username)
    return {
        "name": user_data["name"],
        "xp": user_data["xp"],
        "credits": user_data["credits"],
        "is_pro": user_data["is_pro"]
    }

@app.post("/api/v1/user/upgrade")
async def upgrade_user(username: str = Depends(get_username)):
    db.update_user_state(username, {"is_pro": True, "credits": 999999})
    return {"status": "success", "message": "License Upgraded to Professional"}

@app.post("/api/v1/simulation/checkpoint")
async def save_checkpoint(mission_id: str, username: str = Depends(get_username)):
    db.add_checkpoint(username, mission_id)
    user_data = db.get_user_state(username)
    current_xp = user_data.get("xp", 0)
    db.update_user_state(username, {"xp": current_xp + 100})
    return {"status": "success", "message": f"Checkpoint saved: {mission_id}"}

@app.get("/api/v1/assets/registry")
async def get_asset_registry(username: str = Depends(get_username)):
    user_data = db.get_user_state(username)
    return user_data["assets"]

@app.get("/api/v1/status")
async def get_status(username: str = Depends(get_username)):
    state = get_user_sim_state(username)
    return {"status": "online", "uptime": state.year}

class ControlRequest(BaseModel):
    flow_rate: Optional[float] = None
    temp_k: Optional[float] = None

@app.post("/api/v1/simulation/control")
async def control_simulation(req: ControlRequest, username: str = Depends(get_username)):
    state = get_user_sim_state(username)
    if req.flow_rate is not None:
        state.physics["flow_rate"] = float(req.flow_rate)
    if req.temp_k is not None:
        state.physics["temp_k"] = float(req.temp_k)
    return {"status": "success"}

@app.post("/api/v1/simulation/reset")
async def reset_sim(username: str = Depends(get_username)):
    if username in user_states:
        user_states[username] = SimState()
    user_data = db.get_user_state(username)
    if user_data:
        user_data["xp"] = 0
        user_data["credits"] = 5
        user_data["is_pro"] = False
        user_data["capital"] = 154200.0
        user_data["assets"] = [
            {"id": "T-101", "type": "Reactor", "tier": 1, "durability": 100.0, "efficiency": 0.98, "maintenance_cost": 250},
            {"id": "P-101", "type": "Pump", "tier": 1, "durability": 100.0, "efficiency": 0.85, "maintenance_cost": 120},
            {"id": "L-101", "type": "Valve", "tier": 1, "durability": 100.0, "efficiency": 0.95, "maintenance_cost": 45}
        ]
        user_data["checkpoints"] = []
        db.save()
    return {"status": "success"}

@app.post("/api/v1/upgrade/start")
async def upgrade_asset(component_id: str, username: str = Depends(get_username)):
    user_data = db.get_user_state(username)
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")
        
    asset = None
    for a in user_data["assets"]:
        if a["id"] == component_id:
            asset = a
            break
            
    if not asset:
        return {"status": "error", "message": "Asset not found"}
        
    current_tier = asset.get("tier", 1)
    cost = economy.get_upgrade_cost(current_tier)
    
    current_capital = user_data.get("capital", 154200.0)
    if current_capital < cost:
        return {"status": "error", "message": f"Insufficient capital. Need ${cost:,.2f}"}
        
    # Deduct capital
    new_capital = current_capital - cost
    user_data["capital"] = new_capital
    
    state = get_user_sim_state(username)
    state.capital = new_capital
    
    # Upgrade asset
    asset["tier"] = current_tier + 1
    if asset["type"] == "Reactor":
        asset["efficiency"] = min(0.99, asset.get("efficiency", 0.98) + 0.005)
        asset["maintenance_cost"] = int(asset.get("maintenance_cost", 250) * 1.5)
    elif asset["type"] == "Pump":
        asset["efficiency"] = min(0.99, asset.get("efficiency", 0.85) + 0.03)
        asset["maintenance_cost"] = int(asset.get("maintenance_cost", 120) * 1.5)
    else: # Valve
        asset["efficiency"] = min(0.99, asset.get("efficiency", 0.95) + 0.01)
        asset["maintenance_cost"] = int(asset.get("maintenance_cost", 45) * 1.5)
        
    db.save()
    return {"status": "success", "message": f"Asset {component_id} upgraded to Tier {asset['tier']}"}

@app.post("/api/v1/maintenance/repair")
async def repair_asset(component_id: str, username: str = Depends(get_username)):
    user_data = db.get_user_state(username)
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")
        
    asset = None
    for a in user_data["assets"]:
        if a["id"] == component_id:
            asset = a
            break
            
    if not asset:
        return {"status": "error", "message": "Asset not found"}
        
    durability = asset.get("durability", 100.0)
    tier = asset.get("tier", 1)
    cost = economy.get_repair_cost(durability, tier)
    
    current_capital = user_data.get("capital", 154200.0)
    if current_capital < cost:
        return {"status": "error", "message": f"Insufficient capital. Need ${cost:,.2f}"}
        
    # Deduct capital
    new_capital = current_capital - cost
    user_data["capital"] = new_capital
    
    state = get_user_sim_state(username)
    state.capital = new_capital
    
    # Restore durability
    asset["durability"] = 100.0
    db.save()
    return {"status": "success", "message": f"Asset {component_id} restored to 100% durability"}

# --- WEBSOCKET ENGINE ---
@app.websocket("/ws/reactor")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    query_params = websocket.query_params
    token = query_params.get("token", "admin")
    
    try:
        while True:
            user_data = db.get_user_state(token)
            state = get_user_sim_state(token)
            
            if user_data:
                await websocket.send_json({
                    "capital": state.capital,
                    "physics": state.physics,
                    "assets": user_data["assets"],
                    "year": state.year,
                    "timestamp": time.time()
                })
            await asyncio.sleep(0.5)
    except WebSocketDisconnect:
        pass

app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8181)
