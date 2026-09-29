"""
Bioprocess Data Adapter, Cleaning, Quality Scoring, and Database Pre-population Script
"""

import os
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

import json
import pandas as pd
from backend.app.schemas.canonical import CANONICAL_VARIABLES, DEFAULT_FUZZY_MAPPINGS
from backend.app.services.data_cleaner import DataCleaner
from backend.app.services.data_quality import DataQualityEngine
from backend.app.database.database import engine, Base, SessionLocal
from backend.app.database.models import DatasetRecord, BatchRunRecord, TelemetryPointRecord

def run_adapter_and_cleaning():
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
    raw_path = os.path.join(base_dir, "data", "raw", "cho_fedbatch_raw.csv")
    processed_path = os.path.join(base_dir, "data", "processed", "cho_fedbatch_processed.csv")
    report_path = os.path.join(base_dir, "docs", "data_quality_report.md")

    os.makedirs(os.path.dirname(processed_path), exist_ok=True)
    os.makedirs(os.path.dirname(report_path), exist_ok=True)

    print(f"Reading raw data from: {raw_path}")
    raw_df = pd.read_csv(raw_path)

    # 1. Column Adapter: Map source columns to canonical schema
    mapped_df = pd.DataFrame()
    mapping_applied = {}
    for col in raw_df.columns:
        norm_col = col.lower().strip()
        canonical_name = DEFAULT_FUZZY_MAPPINGS.get(norm_col, norm_col)
        if canonical_name in CANONICAL_VARIABLES:
            mapped_df[canonical_name] = raw_df[col]
            mapping_applied[col] = canonical_name

    # 2. Run Data Cleaner
    cleaner = DataCleaner()
    cleaned_df, clean_metrics = cleaner.clean_dataframe(
        mapped_df,
        remove_duplicates=True,
        interpolate_missing=True,
        max_interpolation_gap_h=12.0
    )

    # 3. Calculate Transparent Data Quality Score
    quality_score = DataQualityEngine.calculate_score(cleaned_df, clean_metrics)
    print(f"Data Quality Score: {quality_score} / 100")

    # 4. Save Processed Dataset
    cleaned_df.to_csv(processed_path, index=False)
    print(f"Saved processed data to: {processed_path}")

    # 5. Generate Formal Markdown Report
    report_md = DataQualityEngine.generate_markdown_report(
        dataset_name="BioCopilot CHO-K1 Bioreactor Benchmark Dataset (Synthetic Demo)",
        score=quality_score,
        metrics=clean_metrics
    )
    with open(report_path, "w", encoding="utf-8") as f:
        f.write(report_md)
    print(f"Generated Data Quality Report at: {report_path}")

    # 6. Pre-populate SQLite Database
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Clear existing
    db.query(TelemetryPointRecord).delete()
    db.query(BatchRunRecord).delete()
    db.query(DatasetRecord).delete()

    dataset_rec = DatasetRecord(
        id="ds_cho_benchmark_01",
        name="CHO-K1 Fed-Batch Benchmark (2L)",
        filename="cho_fedbatch_processed.csv",
        source_type="SYNTHETIC DEMO DATA — NOT EXPERIMENTAL DATA",
        rows_count=len(cleaned_df),
        batches_count=len(cleaned_df["batch_id"].unique()),
        quality_score=quality_score,
        license="CC-BY-4.0",
        columns_mapped=len(mapping_applied),
        metadata_json=json.dumps({"mappings": mapping_applied, "metrics": clean_metrics})
    )
    db.add(dataset_rec)

    for b_id in cleaned_df["batch_id"].unique():
        b_sub = cleaned_df[cleaned_df["batch_id"] == b_id]
        batch_rec = BatchRunRecord(
            id=f"run_{b_id}",
            dataset_id="ds_cho_benchmark_01",
            run_id=b_id,
            vessel_volume_L=float(b_sub["vessel_volume_L"].iloc[0]) if "vessel_volume_L" in b_sub.columns else 2.0,
            cell_line="CHO-K1 mAb Producer",
            duration_h=float(b_sub["time_h"].max()),
            sampling_interval_h=2.0,
            data_provenance="SYNTHETIC DEMO DATA — NOT EXPERIMENTAL DATA"
        )
        db.add(batch_rec)

        for _, row in b_sub.iterrows():
            pt = TelemetryPointRecord(
                batch_id=str(row["batch_id"]),
                time_h=float(row["time_h"]),
                vessel_volume_L=float(row.get("vessel_volume_L", 2.0)),
                VCD=float(row["VCD"]) if pd.notna(row.get("VCD")) else None,
                viability_pct=float(row["viability_pct"]) if pd.notna(row.get("viability_pct")) else None,
                glucose_gL=float(row["glucose_gL"]) if pd.notna(row.get("glucose_gL")) else None,
                glutamine_mM=float(row["glutamine_mM"]) if pd.notna(row.get("glutamine_mM")) else None,
                lactate_gL=float(row["lactate_gL"]) if pd.notna(row.get("lactate_gL")) else None,
                ammonia_mM=float(row["ammonia_mM"]) if pd.notna(row.get("ammonia_mM")) else None,
                pH=float(row["pH"]) if pd.notna(row.get("pH")) else None,
                DO_pct=float(row["DO_pct"]) if pd.notna(row.get("DO_pct")) else None,
                temp_C=float(row["temp_C"]) if pd.notna(row.get("temp_C")) else None,
                rpm=float(row["rpm"]) if pd.notna(row.get("rpm")) else None,
                gas_flow_vvm=float(row["gas_flow_vvm"]) if pd.notna(row.get("gas_flow_vvm")) else None,
                feed_rate_mL_h=float(row["feed_rate_mL_h"]) if pd.notna(row.get("feed_rate_mL_h")) else None,
                media_cost_per_L=float(row["media_cost_per_L"]) if pd.notna(row.get("media_cost_per_L")) else None,
            )
            db.add(pt)

    db.commit()
    db.close()
    print("Successfully populated SQLite database.")

if __name__ == "__main__":
    run_adapter_and_cleaning()
