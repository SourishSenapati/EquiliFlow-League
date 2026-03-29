"""
CoreFlow Solvers: High-level algorithms to simulate plant-scale behavior.
Handles network-wide pressure/flow distribution and kinetics.
"""

import numpy as np
from engine.physics import (
    calculate_reynolds,
    calculate_friction_factor,
    head_loss,
    pump_power,
    flow_rate_to_velocity
)
from engine.network import PlantNetwork

class FlowSolver:
    """Solves for pressure drops, flow rates, and power consumption."""
    def __init__(self, network: PlantNetwork):
        self.network = network

    def solve_simple_path(self, tank_id: str, pump_id: str, pipe_id: str, target_flow: float, p_out_target: float = 200000.0):
        """
        Calculates pump power needed for a target flow rate (m3/s) 
        given a static tank head and frictional losses.
        
        Args:
            tank_id: Source tank identifier
            pump_id: Pump identifier
            pipe_id: Connecting pipe identifier
            target_flow: Volumetric flow rate (m3/s)
            p_out_target: Target delivery pressure (Pa)
        """
        tank = self.network.nodes_data.get(tank_id)
        pump = self.network.nodes_data.get(pump_id)
        pipe = self.network.edges_data.get(pipe_id)

        if not all([tank, pump, pipe]) or pipe.diameter <= 0:
            return {
                "reynolds": 0.0,
                "friction_factor": 0.0,
                "head_loss": 0.0,
                "pump_power_w": 0.0,
                "flow_velocity": 0.0
            }

        # 1. Physics: Velocity (m/s)
        velocity = flow_rate_to_velocity(target_flow, pipe.diameter)
        
        # 2. Reynolds Number (assume water: rho=1000, mu=0.001)
        rho, mu = 1000.0, 0.001
        re_number = calculate_reynolds(rho, velocity, pipe.diameter, mu)

        # 3. Friction Factor (f)
        epsilon_d = pipe.roughness / pipe.diameter if pipe.diameter > 0 else 0
        f_factor = calculate_friction_factor(re_number, epsilon_d)

        # 4. Pressure Loss (Pa)
        h_f = head_loss(f_factor, pipe.length, pipe.diameter, velocity)
        p_loss = h_f * rho * 9.81

        # 5. Pressure balance (Bernoulli simple)
        p_diff_pump = (p_out_target + p_loss) - tank.pressure

        # Ensure we don't return 'inf' for power to avoid capital drainage
        if np.isinf(p_diff_pump) or np.isnan(p_diff_pump):
            p_needed = 0.0
        else:
            # 6. Pump Power Calculation
            p_needed = pump_power(target_flow, max(0, p_diff_pump), pump.efficiency)

        # Update node state
        pump.current_power = p_needed
        pipe.velocity = velocity

        # 7. Final Sanitize for JSON Stability
        resp = {
            "reynolds": re_number,
            "friction_factor": f_factor,
            "head_loss": h_f,
            "pump_power_w": p_needed,
            "flow_velocity": velocity
        }
        
        # Ensure no inf/nan for JSON compatibility
        for key, val in resp.items():
            if np.isinf(val) or np.isnan(val):
                resp[key] = 0.0
                
        return resp
