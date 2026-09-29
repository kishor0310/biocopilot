"""
Bioprocess Feature Engineering Engine
Calculates specific reaction rates (growth, uptake, production), yield coefficients,
integral viable cell density (IVCD), and temporal dynamic rolling features.
"""

from typing import Dict, List, Optional, Tuple
import pandas as pd
import numpy as np

class BioprocessFeatureEngineer:
    @staticmethod
    def compute_features(df: pd.DataFrame) -> pd.DataFrame:
        """
        Derives physiological bioprocess features strictly per batch.
        Guards: Never derives a feature if required columns are missing.
        """
        if df.empty:
            return df

        featured_batches = []
        batch_col = "batch_id" if "batch_id" in df.columns else None
        batches = df[batch_col].unique() if batch_col else ["DEFAULT"]

        for b_id in batches:
            b_df = df[df[batch_col] == b_id].copy() if batch_col else df.copy()
            b_df = b_df.sort_values(by="time_h").reset_index(drop=True)

            # Ensure time delta is available
            dt = b_df["time_h"].diff().replace(0, np.nan)

            # 1. Integral Viable Cell Density (IVCD) using trapezoidal rule
            if "VCD" in b_df.columns:
                vcd_series = b_df["VCD"].fillna(0)
                # trapezoidal step = 0.5 * (vcd[t] + vcd[t-1]) * dt
                dt_safe = b_df["time_h"].diff().fillna(0)
                vcd_prev = vcd_series.shift(1).fillna(vcd_series)
                step_ivcd = 0.5 * (vcd_series + vcd_prev) * dt_safe
                b_df["IVCD"] = step_ivcd.cumsum()

                # Specific growth rate mu = (1/VCD) * (dVCD / dt)
                # Using logarithmic difference: mu = (ln(VCD_t) - ln(VCD_{t-1})) / dt
                safe_vcd = vcd_series.clip(lower=0.01)
                log_vcd_diff = np.log(safe_vcd).diff()
                b_df["mu_growth_rate"] = (log_vcd_diff / dt).fillna(0.0)
                # Clip unphysical growth rates (-0.2 to 0.2 h^-1)
                b_df["mu_growth_rate"] = b_df["mu_growth_rate"].clip(lower=-0.2, upper=0.2)
            else:
                b_df["IVCD"] = np.nan
                b_df["mu_growth_rate"] = np.nan

            # 2. Specific substrate uptake and byproduct rates
            # q_glc = - (1/VCD) * (d[Glc]/dt)
            if "glucose_gL" in b_df.columns and "VCD" in b_df.columns:
                d_glc = b_df["glucose_gL"].diff()
                vcd_mid = 0.5 * (b_df["VCD"] + b_df["VCD"].shift(1)).clip(lower=0.1)
                b_df["q_glucose"] = -(d_glc / (vcd_mid * dt)).fillna(0.0)
            else:
                b_df["q_glucose"] = np.nan

            # q_gln = - (1/VCD) * (d[Gln]/dt)
            if "glutamine_mM" in b_df.columns and "VCD" in b_df.columns:
                d_gln = b_df["glutamine_mM"].diff()
                vcd_mid = 0.5 * (b_df["VCD"] + b_df["VCD"].shift(1)).clip(lower=0.1)
                b_df["q_glutamine"] = -(d_gln / (vcd_mid * dt)).fillna(0.0)
            else:
                b_df["q_glutamine"] = np.nan

            # q_lac = (1/VCD) * (d[Lac]/dt)
            if "lactate_gL" in b_df.columns and "VCD" in b_df.columns:
                d_lac = b_df["lactate_gL"].diff()
                vcd_mid = 0.5 * (b_df["VCD"] + b_df["VCD"].shift(1)).clip(lower=0.1)
                b_df["q_lactate"] = (d_lac / (vcd_mid * dt)).fillna(0.0)
            else:
                b_df["q_lactate"] = np.nan

            # q_amm = (1/VCD) * (d[Amm]/dt)
            if "ammonia_mM" in b_df.columns and "VCD" in b_df.columns:
                d_amm = b_df["ammonia_mM"].diff()
                vcd_mid = 0.5 * (b_df["VCD"] + b_df["VCD"].shift(1)).clip(lower=0.1)
                b_df["q_ammonia"] = (d_amm / (vcd_mid * dt)).fillna(0.0)
            else:
                b_df["q_ammonia"] = np.nan

            # 3. Yield coefficient: Y_lac_glc = delta(Lactate) / delta(Glucose)
            if "lactate_gL" in b_df.columns and "glucose_gL" in b_df.columns:
                d_lac = b_df["lactate_gL"].diff()
                d_glc = b_df["glucose_gL"].diff().abs().replace(0, np.nan)
                b_df["yield_lac_glc"] = (d_lac / d_glc).clip(lower=-2.0, upper=3.0).fillna(0.0)
            else:
                b_df["yield_lac_glc"] = np.nan

            # 4. Rolling statistical features (3-point and 5-point moving trends)
            for var in ["VCD", "viability_pct", "lactate_gL", "glucose_gL"]:
                if var in b_df.columns:
                    b_df[f"{var}_roll_mean_3"] = b_df[var].rolling(window=3, min_periods=1).mean()
                    b_df[f"{var}_slope_3"] = (b_df[var] - b_df[var].shift(2)) / (b_df["time_h"] - b_df["time_h"].shift(2)).replace(0, np.nan)
                    b_df[f"{var}_slope_3"] = b_df[f"{var}_slope_3"].fillna(0.0)

            featured_batches.append(b_df)

        return pd.concat(featured_batches, ignore_index=True)
