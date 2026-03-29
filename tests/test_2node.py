import sys
import os

# Add the project root to sys.path to allow imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from engine.components import Tank, Pump, Edge
from engine.network import PlantNetwork
from engine.solvers import FlowSolver

def test_mvp_logic():
    print("🚀 Initializing CoreFlow 2-Node MVP Test...")
    
    # 1. Setup Network
    plant = PlantNetwork()
    
    # Tank-1: 5m of water (Density=1000)
    # Head = 5m -> P = 1000 * 9.81 * 5 = 49,050 Pa
    tank = Tank("Tank-A", level=5.0)
    
    # Pump-1: 75% efficiency
    pump = Pump("Pump-1", efficiency=0.75)
    
    # Pipe-1: 50m length, 40mm diameter (0.04m)
    pipe = Edge("Pipe-1", source="Tank-A", target="Pump-1", length=50.0, diameter=0.04)
    
    plant.add_node(tank)
    plant.add_node(pump)
    plant.add_edge("Tank-A", "Pump-1", pipe)
    
    # 2. Solver
    solver = FlowSolver(plant)
    
    # Target Flow: 10 m3/hr = 10 / 3600 m3/s
    q_target = 10.0 / 3600.0
    
    print(f"🔹 Target Flow: {q_target:.6f} m3/s")
    
    results = solver.solve_simple_path("Tank-A", "Pump-1", "Pipe-1", q_target)
    
    if results:
        print("\n✅ Physics Solve Successful:")
        print(f"   - Reynolds Number: {int(results['reynolds']):,}")
        print(f"   - Friction Factor (f): {results['friction_factor']:.4f}")
        print(f"   - Head Loss: {results['head_loss']:.2f} m")
        print(f"   - Required Pump Power: {results['pump_power_w']:.2f} Watts")
        print(f"   - Flow Velocity: {results['flow_velocity']:.2f} m/s")
        
        # Validation: check Re > 2300 (Turbulent)
        if results['reynolds'] > 2300:
            print("   - [Regime] Turbulent flow detected.")
        else:
            print("   - [Regime] Laminar flow detected.")
    else:
        print("\n❌ Physics Solve Failed.")

if __name__ == "__main__":
    test_mvp_logic()
