import streamlit as st
import pandas as pd
import numpy as np

# Page configuration - Optimized for mobile-first rendering
st.set_page_config(page_title="ProcessGrid MVP", layout="centered", initial_sidebar_state="collapsed")

# Inject Dark Mode Editorial CSS to override default text and remove padding for mobile
st.markdown("""
<style>
    .main {
        background-color: #050505;
        color: #A3A3A3;
        font-family: 'Inter', sans-serif;
    }
    h1, h2, h3 {
        color: #FFFFFF;
        font-family: 'Playfair Display', serif;
    }
    .stSlider > div > div > div > div {
        background-color: #3B82F6 !important;
    }
    .stMetric label {
        color: #A3A3A3 !important;
    }
    div[data-testid="metric-container"] {
        background-color: #121212;
        border: 1px solid rgba(255, 255, 255, 0.1);
        padding: 1rem;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.5);
    }
    div[data-testid="stExpander"] {
        background-color: #121212;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }
</style>
""", unsafe_allow_html=True)

# The "Endowed Progress Trap" Header
st.title("ProcessGrid: Asset #402")
st.caption("You have inherited a legacy chemical pipeline. It is currently operating at a massive loss due to severe energy inefficiencies. Find the thermodynamic sweet spot to turn a profit.")
st.divider()

# The Economic & Physics Engine (Hidden from the user)
# Revenue = $500 per unit of flow
# Cost = Fixed maintenance + Exponential energy cost of the pump
def calculate_economics(power):
    revenue = 500 * power
    cost = (12 * (power ** 2)) + 1500  # Non-linear energy cost (Navier-Stokes correlation)
    profit = revenue - cost
    return revenue, cost, profit

# The Interactive Hook - Mobile Optimized Slider
st.subheader("Command Console")
pump_power = st.slider("Main Pump Power Output (kW)", min_value=0.0, max_value=50.0, value=5.0, step=0.5)

# Calculate live metrics
rev, cost, profit = calculate_economics(pump_power)

# Dopamine Visuals: Big numbers turning from Red to Green
# Using Streamlit columns which automatically stack on mobile devices
col1, col2, col3 = st.columns(3)
col1.metric(label="Gross Revenue", value=f"${rev:,.2f}")
col2.metric(label="Energy & OPEX", value=f"${cost:,.2f}")

# The core feedback loop (Sunk Cost & Optimization Trap)
if profit < 0:
    col3.metric(label="Net Hourly Profit", value=f"${profit:,.2f}", delta="Bleeding Cash", delta_color="inverse")
    st.error("[ALARM] Pump energy costs are exceeding product value. Adjust power immediately.")
elif profit > 0 and profit < 3708: # Max profit is exactly at 20.83 kW
    col3.metric(label="Net Hourly Profit", value=f"${profit:,.2f}", delta="Profitable", delta_color="normal")
    st.warning("[SUB-OPTIMAL] The plant is profitable, but you are leaving money on the table. Keep tuning.")
else:
    col3.metric(label="Net Hourly Profit", value=f"${profit:,.2f}", delta="MAX OPTIMIZATION", delta_color="normal")
    st.success("[OPTIMAL] Maximum thermodynamic efficiency achieved! You are in the top 1%.")

st.divider()

# The Reveal (Letting them see the curve if they want) - Academic ETH Zurich tie-in
with st.expander("View Engineering Analytics (Academic Cheat Sheet)"):
    st.write("This dimensional curve visually proves why scaling power linearly does not scale profit. Frictional energy costs scale exponentially via the Darcy-Weisbach equation.")
    powers = np.linspace(0, 50, 100)
    profits = (500 * powers) - (12 * powers**2) - 1500
    df = pd.DataFrame({'Pump Power (kW)': powers, 'Net Profit ($)': profits})
    st.line_chart(df, x='Pump Power (kW)', y='Net Profit ($)')
