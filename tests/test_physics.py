import numpy as np
import pytest
from engine.physics import (
    flow_rate_to_velocity,
    calculate_reynolds,
    calculate_friction_factor,
    head_loss,
    pump_power,
    arrhenius_rate,
    cstr_design_equation,
    PIDController,
    calculate_opex,
    calculate_revenue
)

def test_flow_rate_to_velocity():
    assert flow_rate_to_velocity(0, 1.0) == 0.0
    assert flow_rate_to_velocity(1.0, 0.0) == 0.0
    v = flow_rate_to_velocity(np.pi, 2.0)
    assert np.isclose(v, 1.0)

def test_calculate_reynolds():
    assert calculate_reynolds(1000, 1.0, 0.1, 0.001) == 100000.0
    assert calculate_reynolds(1000, 1.0, 0, 0.001) == 0.0
    assert calculate_reynolds(1000, 1.0, 0.1, 0) == 0.0

def test_calculate_friction_factor():
    assert calculate_friction_factor(2000, 0) == 64 / 2000
    assert calculate_friction_factor(0, 0) == 0
    f = calculate_friction_factor(10000, 0)
    assert f > 0
    assert calculate_friction_factor(10000, -10) == f

def test_head_loss():
    assert head_loss(0.02, 10, 0.1, 2.0, 9.81) > 0
    assert head_loss(0.02, 10, 0, 2.0, 9.81) == 0.0

def test_pump_power():
    assert pump_power(1.0, 1000, 0.5) == 2000.0
    assert pump_power(1.0, 1000, 0) == 0.0

def test_arrhenius_rate():
    assert arrhenius_rate(1.0, 1000, 300) > 0
    assert arrhenius_rate(1.0, 1000, 0) == 0.0

def test_cstr_design_equation():
    assert cstr_design_equation(10, 0.5, 0.1, 1.0) == 100.0
    assert cstr_design_equation(10, 0.5, 0, 1.0) == 0.0
    assert cstr_design_equation(10, 1.0, 0.1, 1.0) == 0.0
    assert cstr_design_equation(10, 0.5, 0.1, 0) == 0.0

def test_pid_controller():
    pid = PIDController(1.0, 0.1, 0.01, setpoint=10.0)
    out1 = pid.update(0.0, 1.0)
    assert out1 > 0
    out2 = pid.update(5.0, 1.0)
    assert out2 > 0

def test_economics():
    assert calculate_opex(1000, 0.1) == pytest.approx(2.4)
    assert calculate_revenue(1.0, 10.0) == pytest.approx(864000.0)
