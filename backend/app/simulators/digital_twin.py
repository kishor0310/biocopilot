"""
Mechanistic Digital-Twin Approximation Simulator (Monod Kinetics + Byproduct Inhibition)
Simulates dynamic bioprocess trajectories under alternative operational feed and aeration setpoints.
Disclaimer: DIGITAL TWIN APPROXIMATION — NOT GROUND TRUTH
"""

import math
import numpy as np
from typing import Dict, Any, List

class MechanisticDigitalTwin:
    def __init__(
        self,
        mu_max: float = 0.040,      # h^-1 max specific growth rate
        kd_base: float = 0.002,     # h^-1 baseline death rate
        ks_glc: float = 0.45,       # g/L Monod affinity constant for glucose
        ks_gln: float = 0.25,       # mM Monod affinity constant for glutamine
        ki_lac: float = 4.2,        # g/L lactate inhibition constant
        ki_amm: float = 4.8,        # mM ammonia inhibition constant
        y_x_glc: float = 1.6,       # 10^6 cells / mg glucose
        y_lac_glc: float = 1.1,     # g lactate / g glucose consumed
        y_amm_gln: float = 0.65,    # mM ammonia / mM glutamine consumed
    ):
        self.mu_max = mu_max
        self.kd_base = kd_base
        self.ks_glc = ks_glc
        self.ks_gln = ks_gln
        self.ki_lac = ki_lac
        self.ki_amm = ki_amm
        self.y_x_glc = y_x_glc
        self.y_lac_glc = y_lac_glc
        self.y_amm_gln = y_amm_gln

    def simulate(
        self,
        initial_vcd: float = 0.5,
        initial_viability: float = 98.5,
        initial_glc: float = 5.5,
        initial_gln: float = 4.0,
        initial_lac: float = 0.3,
        initial_amm: float = 0.7,
        feed_rate_mL_h: float = 4.5,
        feed_start_h: float = 48.0,
        feed_glc_stock_gL: float = 400.0,
        feed_gln_stock_mM: float = 150.0,
        rpm: float = 250.0,
        vvm: float = 0.12,
        total_hours: float = 336.0,
        step_hours: float = 4.0
    ) -> List[Dict[str, Any]]:
        """
        Integrates dynamic mass balances over culture duration.
        """
        t_points = np.arange(0.0, total_hours + step_hours, step_hours)

        vcd = initial_vcd
        viab = initial_viability
        glc = initial_glc
        gln = initial_gln
        lac = initial_lac
        amm = initial_amm
        vol = 2.0 # L

        history: List[Dict[str, Any]] = []

        for t in t_points:
            # Feed addition
            f_in = (feed_rate_mL_h / 1000.0) if t >= feed_start_h else 0.0 # L/h

            # Kinetics
            lim_glc = glc / (glc + self.ks_glc)
            lim_gln = gln / (gln + self.ks_gln)
            inh_lac = self.ki_lac / (self.ki_lac + lac)
            inh_amm = self.ki_amm / (self.ki_amm + amm)

            # Growth rate
            mu = self.mu_max * lim_glc * lim_gln * inh_lac * inh_amm
            if t > 240:
                mu *= 0.25 # Stationary shutdown

            # Death rate accelerates with inhibitor accumulation
            kd = self.kd_base + (0.008 if lac > 3.0 else 0.0) + (0.006 if amm > 3.5 else 0.0)
            if t > 260:
                kd += 0.015

            # Derivatives
            dvcd = (mu - kd) * vcd
            dviab = -(kd * 35.0)

            # Consumption & Production
            q_glc = (mu / self.y_x_glc) * 0.035 + 0.008
            q_gln = 0.008 + 0.005 * mu

            feed_glc_flux = (f_in * feed_glc_stock_gL) / vol
            feed_gln_flux = (f_in * feed_gln_stock_mM) / vol

            dglc = - (q_glc * vcd) + feed_glc_flux
            dgln = - (q_gln * vcd) + feed_gln_flux

            # Net lactate production or shift to consumption
            if t > 144 and glc < 3.0 and lac > 1.5:
                # Metabolic shift: consumes lactate
                dlac = - 0.012 * vcd
            else:
                dlac = q_glc * self.y_lac_glc * vcd * 0.45

            damm = q_gln * self.y_amm_gln * vcd * 0.35

            # Euler integration
            vcd = max(0.05, vcd + dvcd * step_hours)
            viab = max(40.0, min(100.0, viab + dviab * step_hours))
            glc = max(0.1, glc + dglc * step_hours)
            gln = max(0.05, gln + dgln * step_hours)
            lac = max(0.1, lac + dlac * step_hours)
            amm = max(0.1, amm + damm * step_hours)
            vol += f_in * step_hours

            # Oxygen transfer and dissolved oxygen estimate
            kla_est = 18.0 * ((rpm / 250.0) ** 1.2) * ((vvm / 0.12) ** 0.5)
            our_est = 0.22 * vcd # mmol O2 / L / h
            do_est = max(15.0, min(100.0, 100.0 - (our_est / max(0.5, kla_est)) * 50.0))

            cost_inr = round(4500.0 * vol + (t * 80.0), 2)

            history.append({
                "time_h": round(float(t), 1),
                "VCD": round(float(vcd), 2),
                "viability_pct": round(float(viab), 1),
                "glucose_gL": round(float(glc), 2),
                "glutamine_mM": round(float(gln), 2),
                "lactate_gL": round(float(lac), 2),
                "ammonia_mM": round(float(amm), 2),
                "DO_pct": round(float(do_est), 1),
                "vessel_volume_L": round(float(vol), 2),
                "cost_inr": cost_inr,
                "disclaimer": "DIGITAL TWIN APPROXIMATION — NOT GROUND TRUTH"
            })

        return history
