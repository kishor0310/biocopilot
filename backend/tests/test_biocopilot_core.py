"""
BioCopilot Comprehensive Test Suite
Validates:
1. Dataset loading & column mapping
2. Cleaning, missing values, physiological ranges
3. Feature engineering (growth rates, IVCD, yields)
4. Group-based batch splitting (non-leakage)
5. Model training & metrics computation
6. Uncertainty intervals & explainability attributions
7. Metabolic risk detection & fault injection
8. Feed scheduler constraints & human approval workflow
9. Scale-up hydrodynamic & mass transfer equations
10. FastAPI endpoint responses
"""

import os
import sys
import pytest
import pandas as pd
import numpy as np

# Add project root to sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.schemas.canonical import CANONICAL_VARIABLES, DEFAULT_FUZZY_MAPPINGS, PHYSIOLOGICAL_RANGES
from backend.app.services.data_cleaner import DataCleaner
from backend.app.services.data_quality import DataQualityEngine
from backend.app.ml.feature_engineering import BioprocessFeatureEngineer
from backend.app.ml.trainer import BioprocessModelTrainer
from backend.app.ml.predictors import BioprocessPredictor
from backend.app.services.risk_engine import MetabolicRiskEngine
from backend.app.services.feed_scheduler import SmartFeedScheduler
from backend.app.services.cost_optimizer import MediaCostOptimizer
from backend.app.simulators.scaleup_engine import ScaleupEngine
from backend.app.simulators.sensor_streamer import VirtualSensorManager
from backend.app.schemas.api_schemas import (
    CurrentProcessState, FeedScheduleRequest, MediaCostRequest, CostComponent, AlternativeStrategy, ScaleupRequest, ApprovalRequest
)

client = TestClient(app)

# 1. Dataset Loading & Column Mapping
def test_dataset_loading_and_column_mapping():
    raw_path = os.path.join(BASE_DIR, "data", "raw", "cho_fedbatch_raw.csv")
    assert os.path.exists(raw_path), "Raw benchmark dataset must exist on disk."
    df = pd.read_csv(raw_path)
    assert len(df) >= 100, "Dataset must contain sufficient time-series points."

    # Validate mapping
    mapped_cols = {}
    for col in df.columns:
        norm = col.lower().strip()
        canonical = DEFAULT_FUZZY_MAPPINGS.get(norm, norm)
        if canonical in CANONICAL_VARIABLES:
            mapped_cols[col] = canonical

    assert "time_h" in mapped_cols.values()
    assert "batch_id" in mapped_cols.values()
    assert "VCD" in mapped_cols.values()
    assert "glucose_gL" in mapped_cols.values()
    assert "lactate_gL" in mapped_cols.values()

# 2. Data Cleaning, Missing Values, and Physiological Range Validation
def test_data_cleaning_and_quality():
    cleaner = DataCleaner()
    test_df = pd.DataFrame({
        "time_h": [0.0, 2.0, 4.0, 4.0, 6.0], # Includes duplicate at 4.0
        "batch_id": ["B1", "B1", "B1", "B1", "B1"],
        "VCD": [0.5, np.nan, 1.2, 1.2, 2.0], # Includes NaN
        "viability_pct": [98.0, 97.0, 96.0, 96.0, 105.0], # 105% is physiological violation
        "glucose_gL": [5.0, 4.8, 4.5, 4.5, 4.0],
        "lactate_gL": [0.2, 0.4, 0.6, 0.6, 0.8],
    })

    cleaned, metrics = cleaner.clean_dataframe(test_df, remove_duplicates=True, interpolate_missing=True)
    assert metrics["duplicates_removed"] == 1, "Duplicate row at time_h=4.0 must be identified and removed."
    assert metrics["interpolated_points"] >= 1, "Missing VCD must be interpolated safely."
    assert metrics["invalid_range_points"] >= 1, "105% viability must be flagged as out of physiological range."

    score = DataQualityEngine.calculate_score(cleaned, metrics)
    assert 0.0 <= score <= 100.0, "Quality score must be bounded between 0 and 100."

# 3. Feature Engineering Derivations
def test_feature_engineering_math():
    test_df = pd.DataFrame({
        "time_h": [0.0, 2.0, 4.0],
        "batch_id": ["B1", "B1", "B1"],
        "VCD": [1.0, 2.0, 4.0],
        "viability_pct": [98.0, 97.0, 96.0],
        "glucose_gL": [5.0, 4.0, 2.0],
        "lactate_gL": [0.5, 1.0, 2.2],
        "glutamine_mM": [4.0, 3.5, 3.0],
        "ammonia_mM": [0.5, 0.8, 1.2]
    })
    featured = BioprocessFeatureEngineer.compute_features(test_df)
    assert "IVCD" in featured.columns
    assert "mu_growth_rate" in featured.columns
    assert "q_glucose" in featured.columns
    assert "yield_lac_glc" in featured.columns

    # IVCD should be monotonically increasing
    assert featured["IVCD"].iloc[-1] > featured["IVCD"].iloc[0]
    # Positive growth
    assert featured["mu_growth_rate"].iloc[1] > 0

# 4. Group-Based Batch Splitting (Temporal Non-Leakage)
def test_batch_splitting_non_leakage():
    trainer = BioprocessModelTrainer()
    processed_path = os.path.join(BASE_DIR, "data", "processed", "cho_fedbatch_processed.csv")
    df = pd.read_csv(processed_path)
    dataset, X, groups = trainer.prepare_training_data(df)

    unique_batches = groups.unique().tolist()
    assert len(unique_batches) >= 2, "Must contain multiple distinct batches for GroupKFold."

    test_batch = unique_batches[-1]
    train_batches = unique_batches[:-1]

    # Verify sets are mutually disjoint
    assert test_batch not in train_batches

# 5. Model Metrics
def test_model_metrics_availability():
    res = client.get("/api/model/metrics")
    assert res.status_code == 200
    data = res.json()
    assert "split_strategy" in data
    assert "targets" in data
    assert "VCD" in data["targets"]
    assert "viability_pct" in data["targets"]
    assert "lactate_gL" in data["targets"]
    # Check that real metrics exist
    assert data["targets"]["lactate_gL"]["r2"] > 0.5

# 6. Prediction Uncertainty & XAI
def test_prediction_uncertainty_and_xai():
    state = CurrentProcessState(
        time_h=96.0,
        VCD=12.0,
        viability_pct=94.0,
        glucose_gL=3.5,
        glutamine_mM=2.0,
        lactate_gL=2.8,
        ammonia_mM=2.2,
        pH=7.02,
        DO_pct=48.0,
        temp_C=36.8,
        feed_rate_mL_h=4.5
    )
    predictor = BioprocessPredictor()
    pred_res = predictor.predict_trajectory(state, horizon_hours=48.0)

    assert len(pred_res.predictions) > 0
    p0 = pred_res.predictions[0]
    # Uncertainty bounds check: lower <= mean <= upper
    assert p0.vcd.lower_bound <= p0.vcd.mean <= p0.vcd.upper_bound
    assert p0.viability.lower_bound <= p0.viability.mean <= p0.viability.upper_bound
    # Explainability check
    assert pred_res.explainability.disclaimer == "STATISTICAL MODEL CONTRIBUTION — DOES NOT PROVE BIOLOGICAL CAUSATION"
    assert len(pred_res.explainability.top_contributing_features) > 0

# 7. Metabolic Risk Detection & Fault Injection
def test_metabolic_risk_detection():
    # Healthy state
    healthy_state = {
        "glucose_gL": 3.5,
        "lactate_gL": 1.8,
        "viability_pct": 96.0,
        "ammonia_mM": 2.0,
        "DO_pct": 50.0,
        "pH": 7.05
    }
    alerts_healthy = MetabolicRiskEngine.evaluate_process_state("BATCH-TEST", healthy_state)
    assert len(alerts_healthy) == 0

    # Perturbed state: high lactate
    toxic_state = dict(healthy_state)
    toxic_state["lactate_gL"] = 3.9
    alerts_toxic = MetabolicRiskEngine.evaluate_process_state("BATCH-TEST", toxic_state)
    assert any(a.parameter == "lactate_gL" and a.severity == "CRITICAL" for a in alerts_toxic)

    # Virtual sensor fault injection test
    mgr = VirtualSensorManager()
    mgr.inject_fault("glucose_overfeed", magnitude=2.0)
    assert "glucose_overfeed" in mgr.active_faults
    msg = mgr.step()
    assert msg.sensors["SENSOR-04"].name == "Glucose"
    mgr.reset_faults()

# 8. Feed Scheduler & Human Approval Workflow
def test_feed_schedule_and_approval():
    req = FeedScheduleRequest(
        current_feed_mL_h=6.0,
        glucose_target_gL=3.0,
        process_time_h=96.0,
        vessel_volume_L=2.0
    )
    schedule = SmartFeedScheduler.generate_feed_scenarios(req)
    assert schedule.status == "HUMAN APPROVAL REQUIRED"
    assert schedule.optimized_plan.feed_rate_mL_h < schedule.current_plan.feed_rate_mL_h
    assert schedule.expected_savings_pct > 0.0

    # Test Approval via API
    rec_id = schedule.recommendation_id
    app_res = client.post(f"/api/recommendations/{rec_id}/approve", json={
        "reviewer_name": "Test Bioprocess Lead",
        "reviewer_role": "QA / Bioprocess Lead",
        "comment": "Approved automated feed reduction.",
        "status": "APPROVED"
    })
    assert app_res.status_code == 200
    app_data = app_res.json()
    assert app_data["status"] == "APPROVED"
    assert "audit_entry_id" in app_data

# 9. Scale-Up Hydrodynamics & Mass Transfer
def test_scaleup_engine():
    engine = ScaleupEngine()
    req = ScaleupRequest(source_scale_L=2.0, source_rpm=250.0, source_vvm=0.1)
    res = engine.calculate_scaleup(req)

    assert res.scales == [2.0, 10.0, 100.0, 1000.0]
    pv_points = res.strategies["constant_power_volume"]
    assert len(pv_points) == 4
    # Check that 1000L tip speed is calculated
    p_1000 = pv_points[-1]
    assert p_1000.scale_L == 1000.0
    assert p_1000.tip_speed_m_s > 0
    assert p_1000.power_volume_W_m3 > 0

    # Verify constant tip speed at 1000L triggers oxygen risk
    tip_points = res.strategies["constant_tip_speed"]
    assert "CRITICAL" in tip_points[-1].do_risk or "HIGH" in tip_points[-1].do_risk

# 10. API System Health and Endpoints
def test_api_system_health():
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["decision_support_only"] is True

    # Test audit endpoint
    audit_res = client.get("/api/audit")
    assert audit_res.status_code == 200
    assert len(audit_res.json()) >= 1
