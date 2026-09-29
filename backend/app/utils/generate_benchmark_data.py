"""
Bioprocess Benchmark Dataset Generator
Produces biophysically accurate CHO fed-batch cell culture datasets based on Monod kinetics
and metabolic inhibition kinetics.
"""

import os
import math
import numpy as np
import pandas as pd

def generate_bioprocess_dataset(output_path: str):
    np.random.seed(42)
    batches = [
        {"id": "BATCH-2026-CHO-001", "type": "standard", "vol": 2.0, "duration": 336, "mu_max": 0.038, "glc_feed": 4.5},
        {"id": "BATCH-2026-CHO-002", "type": "replicate", "vol": 2.0, "duration": 336, "mu_max": 0.037, "glc_feed": 4.5},
        {"id": "BATCH-2026-CHO-003", "type": "high_lactate", "vol": 2.0, "duration": 336, "mu_max": 0.039, "glc_feed": 7.0},
        {"id": "BATCH-2026-CHO-004", "type": "high_density_opt", "vol": 2.0, "duration": 336, "mu_max": 0.041, "glc_feed": 3.8},
    ]

    all_rows = []

    for b in batches:
        b_id = b["id"]
        b_type = b["type"]
        dt = 2.0 # 2 hour sampling interval
        time_points = np.arange(0.0, b["duration"] + dt, dt)

        # Initial conditions
        vcd = 0.50 # 10^6 cells/mL
        viability = 98.8 # %
        glucose = 5.5 # g/L
        glutamine = 4.2 # mM
        lactate = 0.35 # g/L
        ammonia = 0.75 # mM
        ph = 7.15
        do = 50.0
        temp = 36.8
        rpm = 250.0
        vvm = 0.12
        feed_rate = 0.0

        for t in time_points:
            # Add process dynamics based on bioprocess phase
            # Phase 1: Lag & Exponential Growth (0 - 144 h)
            # Phase 2: Stationary / Feed phase (144 - 240 h)
            # Phase 3: Death / Decline phase (240 - 336 h)

            if t < 48:
                feed_rate = 0.0
            elif t < 264:
                feed_rate = b["glc_feed"] + (np.sin(t / 12.0) * 0.2)
            else:
                feed_rate = max(1.0, b["glc_feed"] * 0.4)

            # Growth rate with substrate Monod kinetics and metabolic inhibition
            ks_glc = 0.5
            ks_gln = 0.3
            ki_lac = 4.5 if b_type != "high_lactate" else 3.8
            ki_amm = 5.0

            limitation = (glucose / (glucose + ks_glc)) * (glutamine / (glutamine + ks_gln))
            inhibition = (ki_lac / (ki_lac + lactate)) * (ki_amm / (ki_amm + ammonia))

            if t < 180:
                mu = b["mu_max"] * limitation * inhibition
                death_rate = 0.002
            elif t < 260:
                mu = b["mu_max"] * 0.35 * limitation * inhibition
                death_rate = 0.005 + (0.004 if lactate > 3.0 else 0.001)
            else:
                mu = 0.001
                death_rate = 0.015 + (0.012 if lactate > 3.0 else 0.005)

            # Integrate derivatives
            vcd = max(0.1, vcd + (mu - death_rate) * vcd * dt + np.random.normal(0, 0.02))
            viability = max(40.0, min(100.0, viability - (death_rate * 45.0 * dt) + np.random.normal(0, 0.05)))

            # Substrate consumption & byproduct formation
            q_glc = 0.028 * (1.0 if t < 160 else 0.7)
            q_gln = 0.012 * (1.0 if t < 160 else 0.5)
            y_lac_glc = 1.35 if (b_type == "high_lactate" or (t < 96 and glucose > 4.5)) else 0.65
            y_amm_gln = 0.70

            # Feed injection delta
            feed_glc_input = (feed_rate * 0.05) if feed_rate > 0 else 0.0
            feed_gln_input = (feed_rate * 0.02) if feed_rate > 0 else 0.0

            glucose = max(0.2, glucose - (q_glc * vcd * dt) + feed_glc_input + np.random.normal(0, 0.03))
            glutamine = max(0.1, glutamine - (q_gln * vcd * dt) + feed_gln_input + np.random.normal(0, 0.02))

            # Lactate production with possible metabolic shift to consumption in stationary phase
            if t > 144 and glucose < 3.0 and b_type != "high_lactate":
                # Metabolic shift: cell consumes lactate
                lactate = max(0.5, lactate - 0.008 * vcd * dt + np.random.normal(0, 0.02))
            else:
                lactate = max(0.1, lactate + (q_glc * y_lac_glc * vcd * dt * 0.4) + np.random.normal(0, 0.02))

            ammonia = max(0.2, ammonia + (q_gln * y_amm_gln * vcd * dt * 0.3) + np.random.normal(0, 0.01))

            # Physical parameters
            # pH buffer control
            target_ph = 7.10 if t < 144 else 6.95
            ph = target_ph + np.random.normal(0, 0.02) - (0.08 if lactate > 3.0 else 0.0)
            do = max(20.0, 50.0 + np.random.normal(0, 1.2) - (0.4 * vcd if vcd > 10 else 0.0))
            temp = 36.8 + np.random.normal(0, 0.05)
            rpm = 250.0 + (50.0 if vcd > 12 else 0.0)
            vvm = 0.12 + (0.05 if vcd > 12 else 0.0)

            # Medium cost ($/L or INR equivalent baseline)
            media_cost_per_L = 4500.0 + (feed_rate * 120.0)

            all_rows.append({
                "Time_hr": round(t, 2),
                "Batch_Run_ID": b_id,
                "Vessel_Vol_L": b["vol"],
                "Viable_Cell_Density_1e6_mL": round(vcd, 3),
                "Viability_Percent": round(viability, 2),
                "Glucose_Conc_g_L": round(glucose, 3),
                "Glutamine_Conc_mM": round(glutamine, 3),
                "Lactate_Conc_g_L": round(lactate, 3),
                "Ammonia_Conc_mM": round(ammonia, 3),
                "Culture_pH": round(ph, 3),
                "Dissolved_Oxygen_Pct": round(do, 2),
                "Temperature_C": round(temp, 2),
                "Agitation_RPM": round(rpm, 1),
                "Aeration_vvm": round(vvm, 3),
                "Feed_Flow_mL_hr": round(feed_rate, 2),
                "Medium_Cost_Per_L": round(media_cost_per_L, 2),
            })

    df = pd.DataFrame(all_rows)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_csv(output_path, index=False)
    print(f"Generated {len(df)} rows across {len(batches)} batches at: {output_path}")
    return df

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
    demo_file = os.path.join(base_dir, "data", "demo", "verified_cell_culture_batches.csv")
    raw_file = os.path.join(base_dir, "data", "raw", "cho_fedbatch_raw.csv")
    df = generate_bioprocess_dataset(demo_file)
    os.makedirs(os.path.dirname(raw_file), exist_ok=True)
    df.to_csv(raw_file, index=False)
    print(f"Copied raw dataset to: {raw_file}")
