"""
Streamlit application for CoreFlow: A Progressive Digital Twin for Chemical Engineering.
This module provides a narrative-driven interface for students to design and optimize 
chemical processes through a 4-year curriculum.
"""

import pandas as pd
import numpy as np
import streamlit as st
from engine.physics import (
    calculate_reynolds, 
    calculate_friction_factor, 
    head_loss, 
    pump_power, 
    calculate_opex,
    calculate_revenue,
    arrhenius_rate,
    cstr_design_equation
)

# --- UI CONFIGURATION & STYLING ---

st.set_page_config(page_title="CoreFlow Academy: Progressive Digital Twin", layout="wide")

# Premium Dark Mode Styles (No Emojis)
st.markdown("""
<style>
    .main {
        background: #0f172a;
        color: #f8fafc;
        font-family: 'Inter', sans-serif;
    }
    .stApp {
        background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
    }
    .header-panel {
        background: rgba(30, 41, 59, 0.7);
        border: 1px solid rgba(56, 189, 248, 0.2);
        padding: 2.5rem;
        border-radius: 1rem;
        margin-bottom: 2rem;
        backdrop-filter: blur(10px);
    }
    .card {
        background: rgba(15, 23, 42, 0.8);
        border: 1px solid rgba(56, 189, 248, 0.1);
        padding: 1.5rem;
        border-radius: 0.75rem;
        margin-bottom: 1rem;
    }
    .metric-val {
        font-size: 2.5rem;
        font-weight: 700;
        color: #38bdf8;
    }
    .stButton>button {
        width: 100%;
        background: #38bdf8;
        color: #0f172a;
        border: none;
        border-radius: 0.5rem;
        font-weight: 600;
        padding: 0.75rem;
        transition: background 0.2s;
    }
    .stButton>button:hover {
        background: #7dd3fc;
    }
</style>
""", unsafe_allow_html=True)

# --- SESSION STATE INITIALIZATION ---

if 'user_year' not in st.session_state:
    st.session_state.user_year = 1
if 'capital' not in st.session_state:
    st.session_state.capital = 1000.0
if 'unlocked_tiers' not in st.session_state:
    st.session_state.unlocked_tiers = {1: True, 2: False, 3: False, 4: False}

# --- NARRATIVE HUB ---

def narrative_header():
    """Renders the top narrative panel with user stats."""
    year = st.session_state.user_year
    cap = st.session_state.capital
    st.markdown(f"""
    <div class="header-panel">
        <h1>CoreFlow Academy: The Progressive Digital Twin</h1>
        <p>Welcome, Engineer. Your 4-year journey into industrial process optimization starts here.</p>
        <p>Current Standing: <b>Year {year}</b> | Capital: <b>${cap:,.2f} Tokens</b></p>
    </div>
    """, unsafe_allow_html=True)

narrative_header()

# Sidebar Control Center
with st.sidebar:
    st.header("Simulation Control")
    year_map = {
        1: "Year 1: Foundation", 
        2: "Year 2: Hydrodynamics", 
        3: "Year 3: Reactor Design", 
        4: "Year 4: Control and Profit"
    }
    options = [1, 2, 3, 4]
    current_selection = st.radio("Access Faculty Module", options=options, format_func=lambda x: year_map[x])
    
    if current_selection > st.session_state.user_year:
        st.error(f"Access Denied: You must pass Year {st.session_state.user_year} to unlock this.")
        st.stop()
    
    st.markdown("---")
    if st.button("Submit Plant for Faculty Review"):
        if st.session_state.user_year < 4:
            st.session_state.user_year += 1
            st.success(f"Year {st.session_state.user_year - 1} Exam Passed! New Physics Tier Unlocked.")
            st.rerun()

# --- YEAR-SPECIFIC MODULES ---

def year_1_module():
    """Year 1 logic: Mass Balances."""
    st.header("Year 1: Material and Energy Balancing")
    st.write("Constraint: Strictly Mass In = Mass Out. Focus on Flow Control.")
    
    col1, col2 = st.columns(2)
    with col1:
        st.markdown("<div class='card'>", unsafe_allow_html=True)
        q_target = st.slider("Feed Flow Rate (m3/hr)", 0.1, 100.0, 10.0)
        conversion = st.slider("Target Stoichiometric Conversion (X)", 0.0, 1.0, 0.7)
        st.markdown("</div>", unsafe_allow_html=True)
        
    with col2:
        st.markdown("<div class='card'>", unsafe_allow_html=True)
        product_flow = q_target * conversion
        st.write("Mass Balance Summary:")
        st.write(f"- Input Flow: {q_target:.2f} m3/hr")
        st.write(f"- Product Theoretical Flow: {product_flow:.2f} m3/hr")
        st.write(f"- Waste: {q_target - product_flow:.2f} m3/hr")
        st.markdown("</div>", unsafe_allow_html=True)

def year_2_module():
    """Year 2 logic: Hydrodynamics."""
    st.header("Year 2: Hydrodynamics and Pressure Drop")
    st.write("Constraint: Friction Factor calculation required. Pipe sizing matters.")
    
    col1, col2, col3 = st.columns(3)
    with col1:
        st.markdown("<div class='card'>", unsafe_allow_html=True)
        pipe_id_val = st.slider("Pipe ID (mm)", 10.0, 200.0, 50.0) / 1000.0
        pipe_len_val = st.slider("Pipe Length (m)", 1.0, 1000.0, 100.0)
        st.markdown("</div>", unsafe_allow_html=True)
    
    # Physics Solve
    flow_m3s = 10.0 / 3600.0
    vel = flow_m3s / (np.pi * (pipe_id_val / 2)**2)
    re_num = calculate_reynolds(1000, vel, pipe_id_val, 0.001)
    f_fac = calculate_friction_factor(re_num, 0.000045 / pipe_id_val)
    h_loss = head_loss(f_fac, pipe_len_val, pipe_id_val, vel)
    
    with col2:
        st.markdown("<div class='card'>", unsafe_allow_html=True)
        st.metric("Reynolds Number", f"{int(re_num):,}")
        st.write(f"Regime: {'TURBULENT' if re_num > 2300 else 'LAMINAR'}")
        st.markdown("</div>", unsafe_allow_html=True)
        
    with col3:
        st.markdown("<div class='card'>", unsafe_allow_html=True)
        st.metric("Pressure Loss", f"{h_loss:.2f} mH2O")
        st.write("Loss due to friction")
        st.markdown("</div>", unsafe_allow_html=True)

def year_3_module():
    """Year 3 logic: CSTR Kinetics."""
    st.header("Year 3: Reaction Kinetics and CSTR")
    st.write("Constraint: Arrhenius kinetics unlock. Reactor volume sizing.")
    
    col1, col2 = st.columns(2)
    with col1:
        st.markdown("<div class='card'>", unsafe_allow_html=True)
        temp_k = st.slider("Reactor Temperature (K)", 273, 500, 350)
        t_conv = st.slider("Desired Conversion (%)", 1.0, 99.0, 75.0) / 100.0
        st.markdown("</div>", unsafe_allow_html=True)
        
        # Arrhenius: A=1e7, Ea=60kJ/mol
        rate_k_val = arrhenius_rate(1e7, 60000, temp_k)
        vol_req = cstr_design_equation(2.5, t_conv, rate_k_val, 1.5)
        
    with col1:
        st.markdown("<div class='card'>", unsafe_allow_html=True)
        st.metric("Rate Constant (k)", f"{rate_k_val:.4f} s-1")
        st.markdown("</div>", unsafe_allow_html=True)
        
    with col2:
        st.markdown("<div class='card'>", unsafe_allow_html=True)
        st.metric("Required Volume", f"{vol_req:.2f} m3")
        st.write("Calculated for Steady State CSTR")
        st.markdown("</div>", unsafe_allow_html=True)

def year_4_module():
    """Year 4 logic: Control and Economics."""
    st.header("Year 4: Economics and Digital Twin Control")
    st.write("Constraint: Profit simulation active. OPEX vs Revenue balance.")
    
    # Micro-economy loop
    day_rev = calculate_revenue(10.0 / 3600, 25.0)
    day_opex = calculate_opex(1500.0, 0.15)
    
    st.subheader("Profitability Dashboard")
    col1, col2, col3 = st.columns(3)
    with col1:
        st.metric("Daily Gross Revenue", f"${day_rev:,.2f}")
    with col2:
        st.metric("Daily OPEX", f"${day_opex:,.2f}")
    with col3:
        st.metric("Net Daily Profit", f"${day_rev - day_opex:,.2f}")
        
    # Placeholder for real-time control noise
    st.line_chart(np.random.randn(50).cumsum())
    st.warning("Critical: Feed fluctuations detected. PID Tuning Required.")

# --- ROUTING ---

if current_selection == 1:
    year_1_module()
elif current_selection == 2:
    year_2_module()
elif current_selection == 3:
    year_3_module()
elif current_selection == 4:
    year_4_module()

# --- SYSTEM DASHBOARD ---
st.write("---")
st.header("Advanced Agentic Diagnostics")
st.info("System Engine Status: Online | Physics Solver: Active | Network Graph: Connected")
