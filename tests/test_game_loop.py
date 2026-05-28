import os
import datetime
from engine.game_loop import GameEconomy
from engine.network import PlantNetwork
from engine.components import Node

def test_game_economy():
    path = "SAVED/test_economy.json"
    if os.path.exists(path):
        os.remove(path)
        
    econ = GameEconomy(path)
    assert econ.capital == 5000.0
    
    cost_1 = econ.get_upgrade_cost(1)
    assert cost_1 == 1000.0
    cost_2 = econ.get_upgrade_cost(2)
    assert cost_2 == 10000.0
    
    time_1 = econ.get_build_time_seconds(1)
    assert time_1 == 5.0
    time_2 = econ.get_build_time_seconds(2)
    assert time_2 == 100.0
    
    repair = econ.get_repair_cost(50.0, 1)
    assert repair > 0
    
    net = PlantNetwork()
    n1 = Node("n1", "Tank", durability=100.0)
    net.add_node(n1)
    
    # fake last login to 1 hour ago
    econ.last_login = datetime.datetime.now() - datetime.timedelta(hours=1)
    earned = econ.calculate_passive_income(net)
    
    assert earned > 0
    assert econ.capital > 5000.0
    assert n1.durability < 100.0
    
    # Test fouling penalty
    n1.durability = 0.0
    econ.calculate_passive_income(net)
    
    econ.save_state()
    assert os.path.exists(path)
    
    econ2 = GameEconomy(path)
    assert econ2.capital == econ.capital
    
    # Test invalid json state
    with open(path, "w") as f:
        f.write("{invalid json")
    econ3 = GameEconomy(path)
    assert econ3.capital == 5000.0
    
    if os.path.exists(path):
        os.remove(path)
