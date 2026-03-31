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
        """Exponential Friction Curve: Tier 5 = $25,000,000"""
        # Tier 1: $1,000, Tier 5: $25,000,000 -> a*b^1 = 1k, a*b^5 = 25M
        # b^4 = 25000 -> b ~ 12.57
        base_cost = 1000.0
        multiplier = 10.0 # Approximately 10x per tier for extreme grind
        return base_cost * (multiplier ** (current_tier - 1))

    def get_build_time_seconds(self, current_tier: int):
        """Exponential Time-Scaling: Tier 5 = 14 days (1,209,600s)"""
        # Tier 1: 5s, Tier 5: 14 days -> a*b^1 = 5, a*b^5 = 1209600
        # b^4 = 241920 -> b ~ 22.18
        base_time = 5 
        multiplier = 20.0 # Massive time jump for high tiers
        return base_time * (multiplier ** (current_tier - 1))

    def get_repair_cost(self, durability: float, tier: int):
        """Cost to restore durability to 100%."""
        base_repair = 50.0 * tier
        penalty = (100.0 - durability) * 10.0 * (1.5 ** (tier - 1))
        return base_repair + penalty

    def calculate_passive_income(self, network: Any):
        """Generates capital based on plant performance and degrades assets."""
        now = datetime.datetime.now()
        delta = (now - self.last_login).total_seconds()
        
        # Calculate overall efficiency based on network durability
        total_durability = 0.0
        count = 0
        for node_id, node in network.nodes_data.items():
            # Degradation: 1% every 4 hours (0.25% per hour)
            degradation = (delta / 3600.0) * 0.25
            node.durability = max(0.0, node.durability - degradation)
            total_durability += node.durability
            count += 1
        
        avg_efficiency = (total_durability / (count * 100.0)) if count > 0 else 1.0
        
        # Linear payout per second: $ = k * Q * Eff
        income_rate = 0.05 * 100.0 * avg_efficiency 
        earned = income_rate * delta
        
        # Fouling penalty (Loss Aversion): Heavy penalty if efficiency is low
        if avg_efficiency < 0.5:
            earned *= 0.5
            
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
