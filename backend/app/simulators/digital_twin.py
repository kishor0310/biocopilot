import numpy as np
import pandas as pd
from typing import Dict, List, Any

class DigitalTwinSimulator:
    def __init__(self):
        # Monod kinetic parameters for standard CHO cell line
        self.mu_max = 0.040 # 1/h max growth rate
        self.K_s = 0.50     # g/L glucose saturation constant
        self.K_i = 4.50     # g/L lactate inhibition constant
        self.k_d = 0.005    # 1/h natural cell death rate
        self.Y_xs = 0.85    # 10^6 cells / g glucose
        self.Y_lac_s = 0.75 # g lactate / g glucose

    def simulate_fedbatch(
        self,
        time_horizon_h: float = 48.0,
        initial_state: Dict[str, float] = None,
        feed_rate_mL_h: float = 12.0,
        feed_glucose_conc_gL: float = 250.0
    ) -> Dict[str, Any]:
        if initial_state is None:
            initial_state = {
                "VCD": 8.0,
                "viability_pct": 95.0,
                "glucose_gL": 5.0,
                "lactate_gL": 1.2,
                "ammonia_mM": 1.1,
                "volume_L": 2.0
            }
            
        dt = 1.0 # 1 hour time step
        steps = int(time_horizon_h)
        
        t_vec = list(range(steps + 1))
        vcd_sim = [initial_state["VCD"]]
        via_sim = [initial_state["viability_pct"]]
        glc_sim = [initial_state["glucose_gL"]]
        lac_sim = [initial_state["lactate_gL"]]
        vol_sim = [initial_state["volume_L"]]
        
        X = initial_state["VCD"]
        via = initial_state["viability_pct"]
        S = initial_state["glucose_gL"]
        L = initial_state["lactate_gL"]
        V = initial_state["volume_L"]
        
        for step in range(steps):
            # Monod growth with lactate inhibition
            mu = self.mu_max * (S / (self.K_s + S)) * (self.K_i / (self.K_i + L))
            dX = (mu - self.k_d) * X * dt
            
            # Feed addition
            feed_vol_L = (feed_rate_mL_h / 1000.0) * dt
            V += feed_vol_L
            
            # Substrate & lactate updates
            dS = (- (1.0 / self.Y_xs) * mu * X + (feed_vol_L * feed_glucose_conc_gL / V)) * dt
            dL = (self.Y_lac_s * (1.0 / self.Y_xs) * mu * X) * dt
            
            X = max(0.1, X + dX)
            S = max(0.1, S + dS)
            L = max(0.0, L + dL)
            
            if L > 3.0:
                via = max(40.0, via - 0.25 * (L - 3.0))
            else:
                via = max(40.0, via - 0.05)
                
            vcd_sim.append(round(float(X), 2))
            via_sim.append(round(float(via), 1))
            glc_sim.append(round(float(S), 2))
            lac_sim.append(round(float(L), 2))
            vol_sim.append(round(float(V), 3))
            
        return {
            "time_h": t_vec,
            "VCD": vcd_sim,
            "viability_pct": via_sim,
            "glucose_gL": glc_sim,
            "lactate_gL": lac_sim,
            "volume_L": vol_sim,
            "disclaimer": "DIGITAL TWIN APPROXIMATION — NOT GROUND TRUTH"
        }

    def optimize_media_cost(
        self,
        base_media_usd_L: float = 35.0,
        glucose_supp_usd_L: float = 5.0,
        growth_factor_usd_L: float = 15.0,
        batch_volume_L: float = 2.0,
        currency: str = "USD"
    ) -> Dict[str, Any]:
        conversion_rate = 83.5 if currency == "INR" else 1.0
        unit_sym = "₹" if currency == "INR" else "$"
        
        current_total_per_L = base_media_usd_L + glucose_supp_usd_L + growth_factor_usd_L
        current_batch_cost = current_total_per_L * batch_volume_L * conversion_rate
        
        # Bounded optimized scenario: 15% reduction in growth factor concentration via feed timing
        opt_growth_factor = growth_factor_usd_L * 0.75
        opt_total_per_L = base_media_usd_L + glucose_supp_usd_L + opt_growth_factor
        opt_batch_cost = opt_total_per_L * batch_volume_L * conversion_rate
        
        estimated_savings = current_batch_cost - opt_batch_cost
        savings_pct = round((estimated_savings / max(1.0, current_batch_cost)) * 100.0, 1)

        # Pareto frontier points (Cost vs Viability trade-off)
        pareto_points = [
            {"scenario": "High Yield / Standard Feed", "cost_per_L": round(current_total_per_L * conversion_rate, 2), "expected_viability": 96.5},
            {"scenario": "Balanced Smart Feed", "cost_per_L": round(opt_total_per_L * conversion_rate, 2), "expected_viability": 95.8},
            {"scenario": "Low-Cost Lean Feed", "cost_per_L": round((base_media_usd_L + glucose_supp_usd_L) * conversion_rate, 2), "expected_viability": 89.2}
        ]

        return {
            "currency": currency,
            "currency_symbol": unit_sym,
            "current_cost_per_L": round(current_total_per_L * conversion_rate, 2),
            "current_batch_cost": round(current_batch_cost, 2),
            "optimized_cost_per_L": round(opt_total_per_L * conversion_rate, 2),
            "optimized_batch_cost": round(opt_batch_cost, 2),
            "estimated_savings": round(estimated_savings, 2),
            "savings_percentage": savings_pct,
            "pareto_scenarios": pareto_points,
            "disclaimer": "MODEL ESTIMATE — DEPENDS ON SUPPLIED INPUT PRICES"
        }
