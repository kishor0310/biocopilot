"""
BioCopilot Pydantic API Schemas for REST and WebSocket Contracts
"""

from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field

# --- Dataset & Run Schemas ---
class DatasetInfo(BaseModel):
    id: str
    name: str
    source_type: str = "SYNTHETIC DEMO DATA — NOT EXPERIMENTAL DATA"
    batches_count: int
    rows_count: int
    created_at: str
    data_quality_score: float
    license: str
    columns_mapped: int

class ColumnHealth(BaseModel):
    canonical_name: str
    source_column: str
    missing_percentage: float
    min: Optional[float] = None
    max: Optional[float] = None
    physiological_valid: bool
    unit: str

class DataQualityCleanRequest(BaseModel):
    confirmed_mappings: Dict[str, str]
    interpolation_strategy: str = "linear_time_safe"
    remove_duplicates: bool = True

class DataQualityCleanResponse(BaseModel):
    dataset_id: str
    data_quality_score: float
    summary: Dict[str, Any]
    column_health: List[ColumnHealth]

class RunSeriesPoint(BaseModel):
    time_h: float
    VCD: Optional[float] = None
    viability_pct: Optional[float] = None
    glucose_gL: Optional[float] = None
    glutamine_mM: Optional[float] = None
    lactate_gL: Optional[float] = None
    ammonia_mM: Optional[float] = None
    pH: Optional[float] = None
    DO_pct: Optional[float] = None
    temp_C: Optional[float] = None
    rpm: Optional[float] = None
    gas_flow_vvm: Optional[float] = None
    feed_rate_mL_h: Optional[float] = None

class RunDetails(BaseModel):
    run_id: str
    vessel_volume_L: float
    cell_line: str
    duration_h: float
    sampling_interval_h: float
    data_provenance: str = "SYNTHETIC DEMO DATA — NOT EXPERIMENTAL DATA"
    series: List[RunSeriesPoint]

# --- Sensor Schemas ---
class SensorReading(BaseModel):
    name: str
    value: float
    unit: str
    status: str = "NORMAL"  # NORMAL, WARNING, CRITICAL
    rolling_avg: float

class SensorStreamMessage(BaseModel):
    timestamp: str
    batch_id: str
    time_h: float
    is_simulated: bool = True
    disclaimer: str = "SIMULATED SENSOR DATA — NOT CONNECTED TO PHYSICAL EQUIPMENT"
    sensors: Dict[str, SensorReading]

class SensorFaultRequest(BaseModel):
    fault_type: str  # glucose_overfeed, lactate_rise, do_sensor_failure, ph_drift, viability_crash
    magnitude: float = 1.0
    duration_h: float = 12.0

class SensorFaultResponse(BaseModel):
    status: str
    fault_type: str
    message: str

# --- Prediction & ML Schemas ---
class CurrentProcessState(BaseModel):
    time_h: float
    VCD: float
    viability_pct: float
    glucose_gL: float
    glutamine_mM: Optional[float] = None
    lactate_gL: float
    ammonia_mM: Optional[float] = None
    pH: float = 7.0
    DO_pct: float = 50.0
    temp_C: float = 37.0
    feed_rate_mL_h: float = 4.0

class PredictionPoint(BaseModel):
    mean: float
    lower_bound: float
    upper_bound: float
    unit: str

class HorizonPrediction(BaseModel):
    time_h: float
    vcd: PredictionPoint
    viability: PredictionPoint
    lactate: PredictionPoint
    ammonia: PredictionPoint

class FeatureAttribution(BaseModel):
    feature: str
    importance: float
    direction: str  # positive, negative, neutral
    description: str

class ExplainabilityData(BaseModel):
    target: str
    disclaimer: str = "STATISTICAL MODEL CONTRIBUTION — DOES NOT PROVE BIOLOGICAL CAUSATION"
    top_contributing_features: List[FeatureAttribution]

class PredictMetabolitesRequest(BaseModel):
    current_state: CurrentProcessState
    horizon_hours: float = 48.0

class PredictMetabolitesResponse(BaseModel):
    horizon_hours: float
    predictions: List[HorizonPrediction]
    explainability: ExplainabilityData

class ModelMetricItem(BaseModel):
    mae: float
    rmse: float
    r2: float

class ModelMetricsResponse(BaseModel):
    split_strategy: str
    training_batches: List[str]
    test_batches: List[str]
    targets: Dict[str, Any]

# --- Nutrient & Feed Optimization Schemas ---
class NutrientEvaluationItem(BaseModel):
    parameter: str
    value: float
    status: str  # DEFICIENT, OPTIMAL, EXCESS, CRITICAL, UNKNOWN
    range: str

class NutrientAnalysisResponse(BaseModel):
    evaluation: List[NutrientEvaluationItem]
    disclaimer: str = "Reference range depends on cell line, clone, and basal medium formulation."

class FeedScheduleRequest(BaseModel):
    current_feed_mL_h: float = 5.0
    glucose_target_gL: float = 3.0
    process_time_h: float = 72.0
    vessel_volume_L: float = 2.0

class FeedPlanSummary(BaseModel):
    feed_rate_mL_h: float
    glucose_bolus_g: Optional[float] = 0.0
    predicted_end_vcd: float
    predicted_end_viability: float
    predicted_end_lactate: float
    estimated_cost_inr: float

class FeedScheduleResponse(BaseModel):
    current_plan: FeedPlanSummary
    optimized_plan: FeedPlanSummary
    recommendation_id: str
    status: str = "HUMAN APPROVAL REQUIRED"
    expected_savings_pct: float
    why: str
    expected_effect: str
    risk: str
    confidence: float
    constraints_checked: List[str]
    data_source: str = "MODEL ESTIMATE"

# --- Cost Analysis Schemas ---
class CostComponent(BaseModel):
    name: str
    unit_cost: float
    amount_used: float
    unit: str

class AlternativeStrategy(BaseModel):
    name: str
    components: List[CostComponent]

class MediaCostRequest(BaseModel):
    currency: str = "INR"  # INR or USD
    batch_volume_L: float = 2.0
    current_components: List[CostComponent]
    proposed_alternative: AlternativeStrategy

class MediaCostResponse(BaseModel):
    currency: str
    current_batch_cost: float
    optimized_batch_cost: float
    cost_delta: float
    savings_percentage: float
    cost_per_L_current: float
    cost_per_L_optimized: float
    cost_per_billion_cells_current: float
    cost_per_billion_cells_optimized: float
    disclaimer: str = "Calculated strictly from supplied unit prices. Model estimate."

# --- Scale-up Schemas ---
class ScaleupRequest(BaseModel):
    source_scale_L: float = 2.0
    source_rpm: float = 250.0
    source_vvm: float = 0.1
    impeller_type: str = "pitched_blade"
    density_kg_m3: float = 1000.0
    viscosity_Pa_s: float = 0.001

class ScaleupRegimePoint(BaseModel):
    scale_L: float
    rpm: float
    tip_speed_m_s: float
    power_volume_W_m3: float
    kla_h1: float
    mixing_time_s: float
    shear_risk: str
    do_risk: str

class ScaleupResponse(BaseModel):
    disclaimer: str = "ENGINEERING ESTIMATE — REQUIRES WET-LAB VALIDATION"
    scales: List[float]
    strategies: Dict[str, List[ScaleupRegimePoint]]
    engineering_notes: List[str]

# --- Alerts & Risk Schemas ---
class BioprocessAlert(BaseModel):
    id: str
    timestamp: str
    severity: str  # INFO, LOW, MEDIUM, HIGH, CRITICAL
    parameter: str
    observed_value: float
    threshold: float
    trend: str
    evidence: str
    possible_driver: str
    predicted_impact: str
    recommended_review: str
    confidence: float

# --- Human Approval & Audit Schemas ---
class ApprovalRequest(BaseModel):
    reviewer_name: str
    reviewer_role: str = "Senior Bioprocess Lead"
    comment: str
    status: str = "APPROVED"  # APPROVED or REJECTED

class ApprovalResponse(BaseModel):
    recommendation_id: str
    status: str
    audit_entry_id: str
    timestamp: str

class AuditLogEntry(BaseModel):
    id: str
    timestamp: str
    operator: str
    role: str
    recommendation_id: str
    action: str  # APPROVED, REJECTED, GENERATED
    parameter_delta: str
    predicted_impact: str
    confidence: float
    comment: str

# --- Copilot & Reports Schemas ---
class CopilotQueryRequest(BaseModel):
    question: str
    context_run_id: Optional[str] = None

class CopilotQueryResponse(BaseModel):
    answer: str
    supporting_metrics: Dict[str, Any]
    disclaimer: str = "Local template-based AI decision support. Requires human review."
