import os
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.data_engine import DataEngine
from app.simulators.sensor_engine import SensorEngine
from app.ml.ml_engine import MLEngine
from app.services.scaleup_engine import ScaleUpEngine
from app.simulators.digital_twin import DigitalTwinSimulator

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["app"] == "BioCopilot"

def test_data_engine():
    engine = DataEngine()
    report = engine.generate_quality_report()
    assert "quality_score" in report
    assert report["is_synthetic"] is True
    assert "SYNTHETIC DEMO DATA" in report["data_label"]
    assert len(report["column_mappings"]) > 0

def test_virtual_sensors_and_fault_injection():
    sensors = SensorEngine()
    telemetry = sensors.get_telemetry()
    assert len(telemetry) == 12
    
    # Test Fault Injection
    res = sensors.inject_fault("glucose_overfeed")
    assert res["status"] == "fault_injected"
    telemetry_fault = sensors.get_telemetry()
    glc_sensor = next(t for t in telemetry_fault if t["channel_id"] == "SENSOR-04")
    assert glc_sensor["value"] > 8.0

def test_ml_engine_and_risk():
    data = DataEngine()
    ml = MLEngine()
    df = data.processed_df
    
    # Feature engineering test
    feats = ml.engineer_features(df)
    assert 'specific_growth_rate_mu' in feats.columns
    assert 'ivcd' in feats.columns
    
    # Training & Prediction test
    metrics = ml.train_models(df)
    assert "VCD" in metrics
    assert metrics["VCD"]["train_samples"] > 0
    
    pred = ml.predict_future(df, target="VCD")
    assert len(pred["predicted"]) > 0
    assert "lower_bound" in pred
    assert "upper_bound" in pred

def test_scaleup_mathematics():
    scaleup = ScaleUpEngine()
    matrix = scaleup.compute_scaleup(
        source_volume_L=2.0,
        target_volumes_L=[10.0, 100.0, 1000.0],
        strategy="constant_pv"
    )
    assert len(matrix) == 4 # 1 baseline + 3 target volumes
    target_1000 = next(r for r in matrix if r["target_volume_L"] == 1000.0)
    assert target_1000["disclaimer"] == "ENGINEERING ESTIMATE — REQUIRES VALIDATION"
    assert target_1000["reynolds_number"] > 0

def test_digital_twin_and_cost():
    dt = DigitalTwinSimulator()
    sim = dt.simulate_fedbatch(time_horizon_h=24.0)
    assert len(sim["VCD"]) == 25
    assert "DIGITAL TWIN APPROXIMATION" in sim["disclaimer"]
    
    cost = dt.optimize_media_cost(currency="USD")
    assert cost["estimated_savings"] >= 0

def test_recommendation_and_approval():
    rec_res = client.get("/api/recommendations")
    assert rec_res.status_code == 200
    recs = rec_res.json()["recommendations"]
    assert len(recs) > 0
    rec_id = recs[0]["id"]
    
    approve_res = client.post(
        f"/api/recommendations/{rec_id}/approve",
        json={"user_id": "operator_test", "comment": "Approved in unit test"}
    )
    assert approve_res.status_code == 200
    assert approve_res.json()["recommendation_status"] == "APPROVED"
    
    audit_res = client.get("/api/audit")
    assert audit_res.status_code == 200
    logs = audit_res.json()["audit_logs"]
    assert len(logs) > 0
