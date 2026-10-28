from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from datetime import datetime

class ColumnMappingItem(BaseModel):
    source_column: str
    canonical_variable: str
    unit: str
    datatype: str
    missing_pct: float
    validity_status: str
    model_usage: str

class DataQualityReport(BaseModel):
    dataset_name: str
    total_rows: int
    total_batches: int
    quality_score: float
    duplicate_count: int
    missing_values: Dict[str, int]
    physiological_violations: List[str]
    is_synthetic: bool
    data_label: str
    column_mappings: List[ColumnMappingItem]

class VirtualSensorData(BaseModel):
    channel_id: str
    name: str
    value: float
    unit: str
    status: str # OPTIMAL, WARNING, CRITICAL
    trend: str # RISING, FALLING, STABLE
    rolling_avg: float
    min_threshold: float
    max_threshold: float

class FaultInjectionRequest(BaseModel):
    fault_type: str # glucose_overfeed, lactate_rise, do_failure, ph_drift, viability_crash
    intensity: float = 1.0

class RiskAlert(BaseModel):
    alert_id: str
    severity: str # INFO, LOW, MEDIUM, HIGH, CRITICAL
    parameter: str
    observed_value: float
    trend: str
    evidence: str
    possible_driver: str
    predicted_impact: str
    recommended_review: str
    confidence: float
    timestamp: str

class ModelMetrics(BaseModel):
    model_name: str
    target_variable: str
    mae: float
    rmse: float
    r2: float
    train_samples: int
    val_samples: int
    test_samples: int

class PredictionResult(BaseModel):
    time_h: List[float]
    actual: Optional[List[float]] = None
    predicted: List[float]
    lower_bound: List[float]
    upper_bound: List[float]
    confidence: float
    feature_importance: Dict[str, float]

class FeedScenarioRequest(BaseModel):
    run_id: str
    target_glucose_gL: float = 6.0
    feed_rate_mL_h: float = 12.0
    horizon_h: float = 48.0

class ScaleUpRequest(BaseModel):
    source_volume_L: float = 2.0
    target_volumes: List[float] = [10.0, 100.0, 1000.0]
    strategy: str = "constant_pv" # constant_pv, constant_tipspeed, constant_kla, constant_mixing
    source_rpm: float = 220.0
    source_gas_vvm: float = 0.12
    impeller_diameter_ratio: float = 0.35

class ScaleUpResultItem(BaseModel):
    target_volume_L: float
    strategy: str
    rpm: float
    gas_flow_vvm: float
    power_per_volume_W_m3: float
    tip_speed_m_s: float
    reynolds_number: float
    kla_est_h: float
    mixing_time_est_s: float
    do_limitation_risk: str
    shear_risk_level: str
    disclaimer: str = "ENGINEERING ESTIMATE — REQUIRES VALIDATION"

class RecommendationAction(BaseModel):
    user_id: str
    comment: str

class CopilotQueryRequest(BaseModel):
    query: str
    run_id: Optional[str] = "Batch_01_Control"
