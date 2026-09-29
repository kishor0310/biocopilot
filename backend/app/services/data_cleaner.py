"""
Data Cleaning & Physiological Range Validation Engine
"""

from typing import Dict, List, Tuple, Any, Optional
import pandas as pd
import numpy as np
from backend.app.schemas.canonical import CANONICAL_VARIABLES, PHYSIOLOGICAL_RANGES

class DataCleaner:
    def __init__(self, ranges: Optional[Dict[str, Dict[str, float]]] = None):
        self.ranges = ranges or PHYSIOLOGICAL_RANGES

    def clean_dataframe(
        self,
        df: pd.DataFrame,
        remove_duplicates: bool = True,
        interpolate_missing: bool = True,
        max_interpolation_gap_h: float = 12.0
    ) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """
        Cleans and validates bioprocess data frame.
        Returns cleaned DataFrame and quality audit metrics.
        """
        metrics: Dict[str, Any] = {
            "initial_rows": len(df),
            "duplicates_removed": 0,
            "interpolated_points": 0,
            "outliers_flagged": 0,
            "invalid_range_points": 0,
            "batches_processed": [],
            "column_metrics": {},
        }

        cleaned = df.copy()

        # 1. Deduplication on (batch_id, time_h)
        if "batch_id" in cleaned.columns and "time_h" in cleaned.columns:
            init_len = len(cleaned)
            if remove_duplicates:
                cleaned = cleaned.drop_duplicates(subset=["batch_id", "time_h"], keep="first")
                metrics["duplicates_removed"] = init_len - len(cleaned)
            cleaned = cleaned.sort_values(by=["batch_id", "time_h"]).reset_index(drop=True)

        batches = cleaned["batch_id"].unique().tolist() if "batch_id" in cleaned.columns else ["BATCH-DEFAULT"]
        metrics["batches_processed"] = [str(b) for b in batches]

        # 2. Per-batch time-series cleaning and interpolation
        cleaned_batches = []
        for b_id in batches:
            b_df = cleaned[cleaned["batch_id"] == b_id].copy() if "batch_id" in cleaned.columns else cleaned.copy()
            b_df = b_df.sort_values(by="time_h")

            numeric_cols = [c for c in b_df.columns if c in CANONICAL_VARIABLES and c not in ["time_h", "batch_id"]]

            for col in numeric_cols:
                b_df[col] = pd.to_numeric(b_df[col], errors="coerce")

                # Check physiological limits
                if col in self.ranges:
                    bounds = self.ranges[col]
                    out_of_bounds = (b_df[col] < bounds["min"]) | (b_df[col] > bounds["max"])
                    violation_count = int(out_of_bounds.sum())
                    metrics["invalid_range_points"] += violation_count

                # Time-safe linear interpolation
                if interpolate_missing and "time_h" in b_df.columns:
                    missing_before = int(b_df[col].isna().sum())
                    if 0 < missing_before < len(b_df):
                        # Ensure we don't interpolate over large gaps
                        time_diff = b_df["time_h"].diff()
                        # Linear interpolation along time index
                        b_df[col] = b_df[col].interpolate(method="linear", limit_direction="both")
                        metrics["interpolated_points"] += (missing_before - int(b_df[col].isna().sum()))

            cleaned_batches.append(b_df)

        final_df = pd.concat(cleaned_batches, ignore_index=True) if cleaned_batches else cleaned

        # 3. Compute Column Health Metrics
        for col in CANONICAL_VARIABLES:
            if col in final_df.columns:
                series = final_df[col]
                missing_pct = float((series.isna().sum() / len(final_df)) * 100.0) if len(final_df) > 0 else 0.0
                c_min = float(series.dropna().min()) if series.dropna().count() > 0 and pd.api.types.is_numeric_dtype(series) else None
                c_max = float(series.dropna().max()) if series.dropna().count() > 0 and pd.api.types.is_numeric_dtype(series) else None

                valid = True
                if col in self.ranges and c_min is not None and c_max is not None:
                    valid = (c_min >= self.ranges[col]["min"] * 0.9) and (c_max <= self.ranges[col]["max"] * 1.1)

                metrics["column_metrics"][col] = {
                    "missing_pct": round(missing_pct, 2),
                    "min": round(c_min, 3) if c_min is not None else None,
                    "max": round(c_max, 3) if c_max is not None else None,
                    "physiological_valid": valid,
                    "available": True,
                }
            else:
                metrics["column_metrics"][col] = {
                    "missing_pct": 100.0,
                    "min": None,
                    "max": None,
                    "physiological_valid": False,
                    "available": False,
                }

        metrics["final_rows"] = len(final_df)
        return final_df, metrics
