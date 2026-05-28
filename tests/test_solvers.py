from engine.network import PlantNetwork
from engine.components import Tank, Pump, Edge
from engine.solvers import FlowSolver

def test_solve_simple_path():
    network = PlantNetwork()
    tank = Tank("T1", level=10.0)
    pump = Pump("P1", efficiency=0.8)
    pipe = Edge("E1", "T1", "P1", length=100.0, diameter=0.1)
    
    network.add_node(tank)
    network.add_node(pump)
    network.add_edge("T1", "P1", pipe)
    
    solver = FlowSolver(network)
    res = solver.solve_simple_path("T1", "P1", "E1", target_flow=0.01)
    
    assert res["reynolds"] > 0
    assert res["friction_factor"] > 0
    assert res["head_loss"] > 0
    assert res["pump_power_w"] > 0
    assert res["flow_velocity"] > 0
    
def test_solve_simple_path_missing():
    network = PlantNetwork()
    solver = FlowSolver(network)
    res = solver.solve_simple_path("T1", "P1", "E1", target_flow=0.01)
    assert res["pump_power_w"] == 0.0

def test_solve_simple_path_zero_diameter():
    network = PlantNetwork()
    tank = Tank("T1")
    pump = Pump("P1")
    pipe = Edge("E1", "T1", "P1", length=100.0, diameter=0.0)
    
    network.add_node(tank)
    network.add_node(pump)
    network.add_edge("T1", "P1", pipe)
    
    solver = FlowSolver(network)
    res = solver.solve_simple_path("T1", "P1", "E1", target_flow=0.01)
    assert res["pump_power_w"] == 0.0

def test_solve_simple_path_inf():
    network = PlantNetwork()
    tank = Tank("T1", level=float('-inf'))
    pump = Pump("P1")
    pipe = Edge("E1", "T1", "P1", length=100.0, diameter=0.1)
    network.add_node(tank)
    network.add_node(pump)
    network.add_edge("T1", "P1", pipe)
    
    solver = FlowSolver(network)
    res = solver.solve_simple_path("T1", "P1", "E1", target_flow=0.01)
    assert res["pump_power_w"] == 0.0

def test_solve_simple_path_nan():
    import numpy as np
    network = PlantNetwork()
    tank = Tank("T1")
    pump = Pump("P1")
    pipe = Edge("E1", "T1", "P1", length=100.0, diameter=0.1)
    network.add_node(tank)
    network.add_node(pump)
    network.add_edge("T1", "P1", pipe)
    
    solver = FlowSolver(network)
    res = solver.solve_simple_path("T1", "P1", "E1", target_flow=float('nan'))
    assert res["flow_velocity"] == 0.0
