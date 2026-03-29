import datetime
import json
import os
from typing import Dict, Any

class GameEconomy:
    """Handles the Macro-Layer (Exponential Friction) and Micro-Layer (Linear Payouts)."""
    
    def __init__(self, data_path="data/save_state.json"):
        self.data_path = data_path
        self.capital = 5000.0  # (Tokens)
        self.premium_tokens = 0
        self.total_revenue = 0.0
        self.upgrades: Dict[str, Any] = {}
        self.last_login = datetime.datetime.now()

        # Load existing state if it exists
        if os.path.exists(self.data_path):
            self.load_state()

    def get_upgrade_cost(self, current_tier: int):
        """Exponential Friction Curve: Cost(T) = a * b^T"""
        base_cost = 5000.0
        multiplier = 2.5
        return base_cost * (multiplier ** (current_tier - 1))

    def get_build_time_seconds(self, current_tier: int):
        """Exponential Time-Scaling: Time(T) = t0 * k^T"""
        base_time = 600 # 10 minutes
        multiplier = 3.0
        return base_time * (multiplier ** (current_tier - 1))

    def calculate_passive_income(self, efficiency: float, capacity: float):
        """Generates capital based on plant performance (The Grind)."""
        now = datetime.datetime.now()
        delta = (now - self.last_login).total_seconds()
        
        # Linear payout per second: $ = k * Q * Eff
        income_rate = 0.05 * capacity * efficiency 
        earned = income_rate * delta
        
        # Fouling penalty (Loss Aversion): -20% if offline for > 24 hours
        if delta > 86400:
            earned *= 0.8
            
        self.capital += earned
        self.total_revenue += earned
        self.last_login = now
        self.save_state()
        return earned

    def save_state(self):
        state = {
            "capital": self.capital,
            "premium_tokens": self.premium_tokens,
            "total_revenue": self.total_revenue,
            "last_login": self.last_login.isoformat(),
            "upgrades": self.upgrades
        }
        with open(self.data_path, 'w') as f:
            json.dump(state, f)

    def load_state(self):
        try:
            with open(self.data_path, 'r') as f:
                state = json.load(f)
                self.capital = state.get("capital", 5000.0)
                self.premium_tokens = state.get("premium_tokens", 0)
                self.total_revenue = state.get("total_revenue", 0.0)
                last_login_iso = state.get("last_login")
                if last_login_iso:
                    self.last_login = datetime.datetime.fromisoformat(last_login_iso)
                self.upgrades = state.get("upgrades", {})
        except Exception:
            pass
