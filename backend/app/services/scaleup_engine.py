import math
from typing import Dict, List, Any

class ScaleUpEngine:
    def __init__(self):
        # Fluid physical constants for cell culture media
        self.rho = 1000.0  # kg/m^3 (density)
        self.mu = 0.001    # Pa.s (dynamic viscosity)
        self.Np = 1.2      # Impeller power number (Rushton / pitched blade)
        self.k_constant = 0.015
        self.a_exp = 0.4
        self.b_exp = 0.5

    def calculate_vessel_geometry(self, volume_L: float, D_to_T_ratio: float = 0.35) -> Dict[str, float]:
        # Cylindrical vessel with H/T = 1.5 aspect ratio
        volume_m3 = volume_L / 1000.0
        # V = (pi / 4) * T^2 * H = (pi / 4) * T^2 * (1.5 T) = 0.375 * pi * T^3
        tank_diameter_T = (volume_m3 / (0.375 * math.pi)) ** (1.0 / 3.0)
        impeller_diameter_D = tank_diameter_T * D_to_T_ratio
        liquid_height_H = tank_diameter_T * 1.5
        return {
            "volume_m3": volume_m3,
            "tank_diameter_m": tank_diameter_T,
            "impeller_diameter_m": impeller_diameter_D,
            "liquid_height_m": liquid_height_H
        }

    def compute_scaleup(
        self,
        source_volume_L: float = 2.0,
        target_volumes_L: List[float] = None,
        strategy: str = "constant_pv",
        source_rpm: float = 220.0,
        source_gas_vvm: float = 0.12,
        impeller_ratio: float = 0.35
    ) -> List[Dict[str, Any]]:
        if target_volumes_L is None:
            target_volumes_L = [10.0, 100.0, 1000.0]

        # 1. Source 2L vessel baseline
        src_geo = self.calculate_vessel_geometry(source_volume_L, impeller_ratio)
        src_N = source_rpm / 60.0 # rev/s
        src_D = src_geo["impeller_diameter_m"]
        src_V = src_geo["volume_m3"]
        
        # Source physics
        src_P = self.Np * self.rho * (src_N ** 3) * (src_D ** 5)
        src_PV = src_P / src_V # W/m^3
        src_tip = math.pi * src_N * src_D # m/s
        src_vvs = (source_gas_vvm * source_volume_L / 60.0) / (math.pi * (src_geo["tank_diameter_m"] / 2.0) ** 2) # superficial gas velocity
        src_kla = self.k_constant * ((max(0.1, src_PV)) ** self.a_exp) * ((max(1e-4, src_vvs)) ** self.b_exp) * 3600.0 # 1/h

        results = []
        
        # Include source as baseline row
        results.append({
            "target_volume_L": source_volume_L,
            "strategy": "Baseline (Benchtop)",
            "rpm": round(source_rpm, 1),
            "gas_flow_vvm": round(source_gas_vvm, 3),
            "power_per_volume_W_m3": round(src_PV, 2),
            "tip_speed_m_s": round(src_tip, 2),
            "reynolds_number": round((self.rho * src_N * (src_D ** 2)) / self.mu, 0),
            "kla_est_h": round(src_kla, 1),
            "mixing_time_est_s": round(4.5 / (src_N * (impeller_ratio ** 2)), 1),
            "do_limitation_risk": "LOW",
            "shear_risk_level": "LOW",
            "disclaimer": "BENCHTOP EXPERIMENTAL BASELINE"
        })

        for V_tgt in target_volumes_L:
            tgt_geo = self.calculate_vessel_geometry(V_tgt, impeller_ratio)
            tgt_D = tgt_geo["impeller_diameter_m"]
            tgt_V = tgt_geo["volume_m3"]
            
            # Solve RPM based on scaling strategy
            if strategy == "constant_pv":
                # P/V = const => N_tgt^3 * D_tgt^5 / V_tgt = N_src^3 * D_src^5 / V_src
                N_tgt = src_N * ((src_V / tgt_V) ** (1.0 / 3.0)) * ((tgt_D / src_D) ** (-5.0 / 3.0))
            elif strategy == "constant_tipspeed":
                # N_tgt * D_tgt = N_src * D_src
                N_tgt = src_N * (src_D / tgt_D)
            elif strategy == "constant_kla":
                # Match kLa by scaling RPM slightly higher
                N_tgt = src_N * ((src_D / tgt_D) ** 0.85)
            else: # constant_mixing
                N_tgt = src_N * ((tgt_geo["tank_diameter_m"] / src_geo["tank_diameter_m"]) ** 0.5)

            target_rpm = N_tgt * 60.0
            tgt_P = self.Np * self.rho * (N_tgt ** 3) * (tgt_D ** 5)
            tgt_PV = tgt_P / tgt_V
            tgt_tip = math.pi * N_tgt * tgt_D
            
            # Scaled gas flow
            tgt_vvm = max(0.01, source_gas_vvm * ((source_volume_L / V_tgt) ** 0.2))
            tgt_vvs = (tgt_vvm * V_tgt / 60.0) / (math.pi * (tgt_geo["tank_diameter_m"] / 2.0) ** 2)
            tgt_kla = self.k_constant * ((max(0.1, tgt_PV)) ** self.a_exp) * ((max(1e-4, tgt_vvs)) ** self.b_exp) * 3600.0
            
            Re = (self.rho * N_tgt * (tgt_D ** 2)) / self.mu
            mixing_time = 4.5 / (N_tgt * (impeller_ratio ** 2))

            # Risk evaluation
            do_risk = "HIGH" if tgt_kla < 15.0 else ("MEDIUM" if tgt_kla < 25.0 else "LOW")
            shear_risk = "CRITICAL" if tgt_tip > 2.8 else ("HIGH" if tgt_tip > 2.2 else "LOW")

            results.append({
                "target_volume_L": V_tgt,
                "strategy": strategy.replace("_", " ").title(),
                "rpm": round(float(target_rpm), 1),
                "gas_flow_vvm": round(float(tgt_vvm), 3),
                "power_per_volume_W_m3": round(float(tgt_PV), 2),
                "tip_speed_m_s": round(float(tgt_tip), 2),
                "reynolds_number": round(float(Re), 0),
                "kla_est_h": round(float(tgt_kla), 1),
                "mixing_time_est_s": round(float(mixing_time), 1),
                "do_limitation_risk": do_risk,
                "shear_risk_level": shear_risk,
                "disclaimer": "ENGINEERING ESTIMATE — REQUIRES VALIDATION"
            })

        return results
