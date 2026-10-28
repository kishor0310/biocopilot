export interface ColumnMappingItem {
  source_column: string;
  canonical_variable: string;
  unit: string;
  datatype: string;
  missing_pct: number;
  validity_status: string;
  model_usage: string;
}

export interface DataQualityReport {
  dataset_name: string;
  total_rows: number;
  total_batches: number;
  quality_score: number;
  duplicate_count: number;
  missing_values: Record<string, number>;
  physiological_violations: string[];
  is_synthetic: boolean;
  data_label: string;
  column_mappings: ColumnMappingItem[];
}

export interface VirtualSensorData {
  channel_id: string;
  name: string;
  value: number;
  unit: string;
  status: 'OPTIMAL' | 'WARNING' | 'CRITICAL';
  trend: 'RISING' | 'FALLING' | 'STABLE';
  rolling_avg: number;
  min_threshold: number;
  max_threshold: number;
}

export interface RiskAlert {
  alert_id: string;
  severity: 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  parameter: string;
  observed_value: number;
  trend: string;
  evidence: string;
  possible_driver: string;
  predicted_impact: string;
  recommended_review: string;
  confidence: number;
  timestamp: string;
}

export interface PredictionResult {
  time_h: number[];
  actual?: number[];
  predicted: number[];
  lower_bound: number[];
  upper_bound: number[];
  confidence: number;
  feature_importance: Record<string, number>;
}

export interface ScaleUpItem {
  target_volume_L: number;
  strategy: string;
  rpm: number;
  gas_flow_vvm: number;
  power_per_volume_W_m3: number;
  tip_speed_m_s: number;
  reynolds_number: number;
  kla_est_h: number;
  mixing_time_est_s: number;
  do_limitation_risk: 'LOW' | 'MEDIUM' | 'HIGH';
  shear_risk_level: 'LOW' | 'HIGH' | 'CRITICAL';
  disclaimer: string;
}

export interface Recommendation {
  id: string;
  run_id: string;
  title: string;
  category: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  severity: string;
  evidence: string;
  expected_effect: string;
  confidence: number;
  constraints: string;
  created_at?: string;
  reviewed_at?: string;
  reviewer_id?: string;
  reviewer_comment?: string;
}

export interface AuditLog {
  id: number;
  timestamp: string;
  user_id: string;
  action: string;
  dataset_version: string;
  model_version: string;
  recommendation_id?: string;
  decision: string;
  comment?: string;
}
