"""
CoreFlow Physics Engine: Provides foundational chemical engineering equations.
Includes hydrodynamics, reaction kinetics, and economic estimations.
"""

import numpy as np

def flow_rate_to_velocity(flow_rate: float, diameter: float) -> float:
    """
    Convert volumetric flow rate (m3/s) to linear velocity (m/s).
    """
    if diameter <= 0:
        return 0.0
    area = np.pi * (diameter**2) / 4.0
    return flow_rate / area

# --- YEAR 2: HYDRODYNAMICS ---

def calculate_reynolds(rho: float, velocity: float, diameter: float, viscosity: float) -> float:
    """
    Calculate the dimensionless Reynolds number.
    """
    if viscosity == 0 or diameter == 0:
        return 0.0
    return (rho * velocity * diameter) / viscosity

def calculate_friction_factor(re_number: float, epsilon_d: float = 0.0) -> float:
    """
    Calculate the Darcy friction factor (f).
    Uses Haaland equation as a fast approximation of Colebrook-White.
    """
    if re_number < 2300:
        return 64 / re_number if re_number > 0 else 0
    
    # Turbulent flow (Haaland equation)
    term = (epsilon_d / 3.7)**1.11 + 6.9 / re_number
    if term <= 0:
        return 0.02
    
    f_factor = (-1.8 * np.log10(term))**-2
    return f_factor

def head_loss(f_factor: float, length: float, diameter: float, velocity: float, gravity: float = 9.81) -> float:
    """
    Calculate Darcy-Weisbach head loss (m).
    """
    if diameter == 0:
        return 0.0
    return f_factor * (length / diameter) * (velocity**2 / (2 * gravity))

def pump_power(flow_rate: float, delta_p: float, efficiency: float = 0.75) -> float:
    """
    Calculate pump power in Watts.
    """
    if efficiency <= 0:
        return 0.0
    return (flow_rate * delta_p) / efficiency

# --- YEAR 3: REACTION KINETICS ---

def arrhenius_rate(pre_expo: float, activation_energy: float, temperature: float, gas_const: float = 8.314) -> float:
    """
    Calculate the rate constant k using Arrhenius equation.
    """
    if temperature <= 0:
        return 0.0
    return pre_expo * np.exp(-activation_energy / (gas_const * temperature))

def cstr_design_equation(fa0: float, conversion: float, rate_k: float, ca0: float) -> float:
    """
    Calculate required volume for a CSTR.
    """
    if rate_k <= 0 or ca0 <= 0 or (1 - conversion) <= 0:
        return 0.0
    return (fa0 * conversion) / (rate_k * ca0 * (1 - conversion))

# --- YEAR 4: CONTROL & ECONOMICS ---

class PIDController:
    """A standard PID controller implementation for process stability."""
    def __init__(self, kp: float, ki: float, kd: float, setpoint: float = 0.0):
        self.kp = kp
        self.ki = ki
        self.kd = kd
        self.setpoint = setpoint
        self.integral = 0.0
        self.prev_error = 0.0

    def update(self, current_value: float, delta_t: float) -> float:
        error = self.setpoint - current_value
        self.integral += error * delta_t
        derivative = (error - self.prev_error) / delta_t if delta_t > 0 else 0
        output = (self.kp * error) + (self.ki * self.integral) + (self.kd * derivative)
        self.prev_error = error
        return output

def calculate_opex(power_w: float, elec_price: float = 0.15) -> float:
    """
    Calculate daily operating expenditure (USD).
    """
    kwh_day = (power_w / 1000.0) * 24
    return kwh_day * elec_price

def calculate_revenue(q_m3s: float, product_val_m3: float) -> float:
    """
    Calculate daily revenue from product flow (USD).
    """
    m3_day = q_m3s * 3600 * 24
    return m3_day * product_val_m3
