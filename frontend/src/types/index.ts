export interface DatasetInfo {
  id: string;
  name: string;
  source_type: string;
  batches_count: number;
  rows_count: number;
  created_at: string;
  data_quality_score: number;
  license: string;
  columns_mapped: number;
}

export interface ColumnHealth {
  canonical_name: string;
  source_column: string;
  missing_percentage: number;
  min: number | null;
  max: number | null;
  physiological_valid: boolean;
  unit: string;
}

export interface DataQualityCleanResponse {
  dataset_id: string;
  data_quality_score: number;
  summary: Record<string, any>;
  column_health: ColumnHealth[];
}

export interface RunSeriesPoint {
  time_h: number;
  VCD: number | null;
  viability_pct: number | null;
  glucose_gL: number | null;
  glutamine_mM: number | null;
  lactate_gL: number | null;
  ammonia_mM: number | null;
  pH: number | null;
  DO_pct: number | null;
  temp_C: number | null;
  rpm: number | null;
  gas_flow_vvm: number | null;
  feed_rate_mL_h: number | null;
}

export interface RunDetails {
  run_id: string;
  vessel_volume_L: number;
  cell_line: string;
  duration_h: number;
  sampling_interval_h: number;
  data_provenance: string;
  series: RunSeriesPoint[];
}

export interface SensorReading {
  name: string;
  value: number;
  unit: string;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  rolling_avg: number;
}

export interface SensorStreamMessage {
  timestamp: string;
  batch_id: string;
  time_h: number;
  is_simulated: boolean;
  disclaimer: string;
  sensors: Record<string, SensorReading>;
}

export interface CurrentProcessState {
  time_h: number;
  VCD: number;
  viability_pct: number;
  glucose_gL: number;
  glutamine_mM?: number;
  lactate_gL: number;
  ammonia_mM?: number;
  pH: number;
  DO_pct: number;
  temp_C: number;
  feed_rate_mL_h: number;
}

export interface PredictionPoint {
  mean: number;
  lower_bound: number;
  upper_bound: number;
  unit: string;
}

export interface HorizonPrediction {
  time_h: number;
  vcd: PredictionPoint;
  viability: PredictionPoint;
  lactate: PredictionPoint;
  ammonia: PredictionPoint;
}

export interface FeatureAttribution {
  feature: string;
  importance: number;
  direction: 'positive' | 'negative' | 'neutral';
  description: string;
}

export interface PredictMetabolitesResponse {
  horizon_hours: number;
  predictions: HorizonPrediction[];
  explainability: {
    target: string;
    disclaimer: string;
    top_contributing_features: FeatureAttribution[];
  };
}

export interface ModelMetricsResponse {
  split_strategy: string;
  training_batches: string[];
  test_batches: string[];
  targets: Record<string, any>;
}

export interface NutrientEvaluationItem {
  parameter: string;
  value: number;
  status: 'DEFICIENT' | 'OPTIMAL' | 'EXCESS' | 'CRITICAL' | 'UNKNOWN';
  range: string;
}

export interface NutrientAnalysisResponse {
  evaluation: NutrientEvaluationItem[];
  disclaimer: string;
}

export interface FeedScheduleRequest {
  current_feed_mL_h: number;
  glucose_target_gL: number;
  process_time_h: number;
  vessel_volume_L?: number;
}

export interface FeedPlanSummary {
  feed_rate_mL_h: number;
  glucose_bolus_g?: number;
  predicted_end_vcd: number;
  predicted_end_viability: number;
  predicted_end_lactate: number;
  estimated_cost_inr: number;
}

export interface FeedScheduleResponse {
  current_plan: FeedPlanSummary;
  optimized_plan: FeedPlanSummary;
  recommendation_id: string;
  status: string;
  expected_savings_pct: number;
  why: string;
  expected_effect: string;
  risk: string;
  confidence: number;
  constraints_checked: string[];
  data_source: string;
}

export interface CostComponent {
  name: string;
  unit_cost: number;
  amount_used: number;
  unit: string;
}

export interface MediaCostRequest {
  currency: string;
  batch_volume_L: number;
  current_components: CostComponent[];
  proposed_alternative: {
    name: string;
    components: CostComponent[];
  };
}

export interface MediaCostResponse {
  currency: string;
  current_batch_cost: number;
  optimized_batch_cost: number;
  cost_delta: number;
  savings_percentage: number;
  cost_per_L_current: number;
  cost_per_L_optimized: number;
  cost_per_billion_cells_current: number;
  cost_per_billion_cells_optimized: number;
  disclaimer: string;
}

export interface ScaleupRequest {
  source_scale_L: number;
  source_rpm: number;
  source_vvm: number;
  impeller_type?: string;
  density_kg_m3?: number;
  viscosity_Pa_s?: number;
}

export interface ScaleupRegimePoint {
  scale_L: number;
  rpm: number;
  tip_speed_m_s: number;
  power_volume_W_m3: number;
  kla_h1: number;
  mixing_time_s: number;
  shear_risk: string;
  do_risk: string;
}

export interface ScaleupResponse {
  disclaimer: string;
  scales: number[];
  strategies: Record<string, ScaleupRegimePoint[]>;
  engineering_notes: string[];
}

export interface BioprocessAlert {
  id: string;
  timestamp: string;
  severity: 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  parameter: string;
  observed_value: number;
  threshold: number;
  trend: string;
  evidence: string;
  possible_driver: string;
  predicted_impact: string;
  recommended_review: string;
  confidence: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  operator: string;
  role: string;
  recommendation_id: string;
  action: string;
  parameter_delta: string;
  predicted_impact: string;
  confidence: number;
  comment: string;
}

export interface CopilotQueryResponse {
  answer: string;
  supporting_metrics: Record<string, any>;
  disclaimer: string;
}
