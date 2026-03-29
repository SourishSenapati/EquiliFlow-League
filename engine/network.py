import networkx as nx
from typing import Dict, Any, List
from engine.components import Node, Edge, Tank, Pump

class PlantNetwork:
    """A directed graph representing the chemical plant flowsheet."""
    def __init__(self):
        self.graph = nx.DiGraph()
        self.nodes_data: Dict[str, Node] = {}
        self.edges_data: Dict[str, Edge] = {}

    def add_node(self, node: Node):
        """Add a unit operation node to the plant."""
        self.graph.add_node(node.id, type=node.type)
        self.nodes_data[node.id] = node

    def add_edge(self, source_id: str, target_id: str, edge: Edge):
        """Add a connecting pipe between two nodes."""
        self.graph.add_edge(source_id, target_id, id=edge.id)
        self.edges_data[edge.id] = edge

    def update_node_state(self, node_id: str, **kwargs):
        """Manually update state for a specific unit (e.g., Tank level)."""
        if node_id in self.nodes_data:
            node = self.nodes_data[node_id]
            for key, val in kwargs.items():
                setattr(node, key, val)
            return True
        return False

    def get_path_data(self, source: str, target: str):
        """Search for a path between nodes (for pressure drop/flow calculations)."""
        try:
            return nx.shortest_path(self.graph, source, target)
        except nx.NetworkXNoPath:
            return None
