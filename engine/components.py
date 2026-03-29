from dataclasses import dataclass, field
from typing import Dict, Any, Optional
import networkx as nx

@dataclass
class Node:
    id: str
    type: str
    pressure: float = 0.0  # (Pa)
    flow_rate: float = 0.0 # (m3/s)
    properties: Dict[str, Any] = field(default_factory=dict)

@dataclass
class Edge:
    id: str
    source: str
    target: str
    length: float = 0.0
    diameter: float = 0.0
    material: str = "Standard"
    roughness: float = 0.000045 # (m)
    velocity: float = 0.0

class Tank(Node):
    def __init__(self, id: str, level: float = 5.0, density: float = 1000.0):
        super().__init__(id, "Tank")
        self.level = level
        self.density = density
        self.pressure = density * 9.81 * level

class Pump(Node):
    def __init__(self, id: str, efficiency: float = 0.75, max_power: float = 1000.0):
        super().__init__(id, "Pump")
        self.efficiency = efficiency
        self.max_power = max_power
        self.current_power = 0.0

@dataclass
class Pipe:
    id: str
    length: float
    diameter: float
    roughness: float = 0.000045 # (m)
