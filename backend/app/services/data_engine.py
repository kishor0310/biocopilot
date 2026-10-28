import pandas as pd
import numpy as np
import os
import yaml
from typing import Dict, List, Tuple, Any

CANONICAL_COLUMNS = [
    'time_h', 'batch_id', 'vessel_volume_L', 'VCD', 'viability_pct',
    'glucose_gL', 'glutamine_mM', 'lactate_gL', 'ammonia_mM', 'pH',
    'DO_pct', 'temp_C', 'rpm', 'gas_flow_vvm', 'feed_rate_mL_h', 'media_cost_per_L'
]

PHYSIOLOGICAL_RANGES = {
    'pH': (6.0, 8.0),
    'viability_pct': (0.0, 100.0),
    'DO_pct': (0.0, 100.0),
    'temp_C': (20.0, 42.0),
    'glucose_gL': (0.0, 25.0),
    'lactate_gL': (0.0, 15.0),
    'ammonia_mM': (0.0, 30.0),
    'VCD': (0.0, 50.0)
}

class DataEngine:
    def __init__(self, demo_path: str = None):
        if demo_path is None:
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
            demo_path = os.path.join(base_dir, 'data', 'demo', 'cho_fedbatch_demo.csv')
        self.demo_path = demo_path
        self.raw_df = None
        self.processed_df = None
        self.load_dataset(self.demo_path)

    def load_dataset(self, file_path: str) -> pd.DataFrame:
        if os.path.exists(file_path):
            self.raw_df = pd.read_csv(file_path)
        else:
            self.raw_df = pd.DataFrame(columns=CANONICAL_COLUMNS)
        self.processed_df = self.clean_and_canonicalize(self.raw_df)
        return self.processed_df

    def clean_and_canonicalize(self, df: pd.DataFrame) -> pd.DataFrame:
        clean_df = df.copy()
        for col in CANONICAL_COLUMNS:
            if col not in clean_df.columns:
                clean_df[col] = np.nan
        
        # Datatypes
        numeric_cols = [c for c in CANONICAL_COLUMNS if c != 'batch_id']
        for c in numeric_cols:
            clean_df[c] = pd.to_numeric(clean_df[c], errors='coerce')
        
        # Sort by batch and time
        if 'batch_id' in clean_df.columns and 'time_h' in clean_df.columns:
            clean_df.sort_values(by=['batch_id', 'time_h'], inplace=True)
            clean_df.reset_index(drop=True, inplace=True)
            
        return clean_df

    def generate_quality_report(self) -> Dict[str, Any]:
        if self.raw_df is None or self.raw_df.empty:
            return {
                "dataset_name": "CHO Demo Dataset",
                "total_rows": 0,
                "total_batches": 0,
                "quality_score": 0.0,
                "duplicate_count": 0,
                "missing_values": {},
                "physiological_violations": ["Empty dataset"],
                "is_synthetic": True,
                "data_label": "SYNTHETIC DEMO DATA — NOT EXPERIMENTAL DATA",
                "column_mappings": []
            }
            
        total_rows = len(self.raw_df)
        batches = self.raw_df['batch_id'].nunique() if 'batch_id' in self.raw_df.columns else 1
        duplicates = self.raw_df.duplicated().sum()
        missing = self.raw_df.isnull().sum().to_dict()
        
        violations = []
        for param, (low, high) in PHYSIOLOGICAL_RANGES.items():
            if param in self.raw_df.columns:
                out_of_bounds = self.raw_df[(self.raw_df[param] < low) | (self.raw_df[param] > high)]
                if len(out_of_bounds) > 0:
                    violations.append(f"{param}: {len(out_of_bounds)} values out of physiological range [{low}, {high}]")
                    
        # Calculate transparent Quality Score (100 minus penalties)
        missing_penalty = min(30.0, (sum(missing.values()) / (total_rows * len(CANONICAL_COLUMNS))) * 100.0)
        dup_penalty = min(20.0, (duplicates / max(1, total_rows)) * 100.0)
        viol_penalty = min(20.0, len(violations) * 5.0)
        score = max(0.0, round(100.0 - missing_penalty - dup_penalty - viol_penalty, 1))

        col_mappings = []
        for col in CANONICAL_COLUMNS:
            missing_pct = round((missing.get(col, 0) / max(1, total_rows)) * 100.0, 1)
            validity = "Valid" if missing_pct < 10.0 else "Partial"
            model_usage = "Feature Target" if col in ['VCD', 'viability_pct', 'lactate_gL', 'ammonia_mM'] else "Input Telemetry"
            col_mappings.append({
                "source_column": col,
                "canonical_variable": col,
                "unit": "g/L" if "gL" in col else ("mM" if "mM" in col else ("%" if "pct" in col else ("h" if "h" in col else "unit"))),
                "datatype": "float64" if col != "batch_id" else "string",
                "missing_pct": missing_pct,
                "validity_status": validity,
                "model_usage": model_usage
            })

        return {
            "dataset_name": "CHO Cell Fed-Batch Telemetry",
            "total_rows": total_rows,
            "total_batches": batches,
            "quality_score": score,
            "duplicate_count": int(duplicates),
            "missing_values": {k: int(v) for k, v in missing.items()},
            "physiological_violations": violations,
            "is_synthetic": True,
            "data_label": "SYNTHETIC DEMO DATA — NOT EXPERIMENTAL DATA",
            "column_mappings": col_mappings
        }
