from engine.network import PlantNetwork
from engine.components import Tank, Edge, Node

def test_network():
    net = PlantNetwork()
    n1 = Node("n1", "TypeA")
    n2 = Node("n2", "TypeB")
    e1 = Edge("e1", "n1", "n2")
    
    net.add_node(n1)
    net.add_node(n2)
    net.add_edge("n1", "n2", e1)
    
    assert "n1" in net.nodes_data
    assert "e1" in net.edges_data
    
    assert net.update_node_state("n1", pressure=100.0) == True
    assert net.nodes_data["n1"].pressure == 100.0
    
    assert net.update_node_state("nonexistent", pressure=100.0) == False
    
    path = net.get_path_data("n1", "n2")
    assert path == ["n1", "n2"]
    
    path_none = net.get_path_data("n2", "n1")
    assert path_none is None
