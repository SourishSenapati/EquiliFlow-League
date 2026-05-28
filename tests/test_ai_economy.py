import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from engine.ai_manager import NNManager
from engine.game_loop import GameEconomy
from engine.network import PlantNetwork
from engine.components import Tank, Pump, Edge

def test_economy_and_ai():
    print("[CoreFlow] Initializing AI & Economy Test...")
    
    # AI Test
    ai = NNManager("SAVED/test_model.pth")
    data_in = [[0.01, 800.0, 50000.0, 350.0, 0.8]]
    target_out = [[850.0, 0.5]]
    loss = ai.train_step(data_in, target_out)
    assert loss > 0
    print(f"   - [AI] Train step successful, Loss: {loss:.4f}")
    
    # Economy Test
    plant = PlantNetwork()
    tank = Tank("Tank-A", level=5.0)
    pump = Pump("Pump-1", efficiency=0.75)
    plant.add_node(tank)
    plant.add_node(pump)
    
    economy = GameEconomy("SAVED/test_save.json")
    earned = economy.calculate_passive_income(plant)
    
    print(f"   - [Economy] Passive Income calculated: ${earned:.2f}")
    assert earned >= 0
    print("\n[SUCCESS] AI and Economy tests passed.")

if __name__ == "__main__":
    test_economy_and_ai()
