# BioCopilot: API Contract Specification
## Version 1.0.0 — Canonical Specification for All Services

This document defines the strict REST and WebSocket contracts for the BioCopilot backend and frontend. Every agent and module must adhere to these schemas.

---

## 1. System Health & Metadata

### `GET /health`
* **Description:** Health check and system readiness probe.
* **Response (200 OK):**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "environment": "production-demo",
  "dataset_loaded": true,
  "active_run_id": "BATCH-2026-CHO-001",
  "timestamp": "2026-09-29T11:30:00Z"
}
```

---

## 2. Dataset Management & Quality

### `GET /api/datasets`
* **Description:** Retrieve available experimental and synthetic datasets with metadata.
* **Response (200 OK):**
```json
[
  {
    "id": "ds_cho_fedbatch_01",
    "name": "Industrial Fed-Batch CHO Benchmark (2L)",
    "source_type": "SYNTHETIC DEMO DATA — NOT EXPERIMENTAL DATA",
    "batches_count": 4,
    "rows_count": 672,
    "created_at": "2026-09-29T11:00:00Z",
    "data_quality_score": 96.4,
    "license": "CC-BY-4.0",
    "columns_mapped": 16
  }
]
```

### `POST /api/datasets/upload`
* **Description:** Ingest a custom bioprocess CSV.
* **Content-Type:** `multipart/form-data`
* **Response (201 Created):**
```json
{
  "id": "ds_upload_123",
  "filename": "bioreactor_run_data.csv",
  "detected_columns": ["Time_hr", "VCD_x10e6", "Gluc_gL", "Lac_gL", "Viab_pct"],
  "suggested_mappings": {
    "Time_hr": "time_h",
    "VCD_x10e6": "VCD",
    "Gluc_gL": "glucose_gL",
    "Lac_gL": "lactate_gL",
    "Viab_pct": "viability_pct"
  },
  "status": "awaiting_confirmation"
}
```

### `POST /api/datasets/{id}/clean`
* **Description:** Execute data quality validation, range checks, and generate data quality audit report.
* **Request Body:**
```json
{
  "confirmed_mappings": {
    "Time_hr": "time_h",
    "VCD_x10e6": "VCD",
    "Gluc_gL": "glucose_gL",
    "Lac_gL": "lactate_gL",
    "Viab_pct": "viability_pct"
  },
  "interpolation_strategy": "linear_time_safe",
  "remove_duplicates": true
}
```
* **Response (200 OK):**
```json
{
  "dataset_id": "ds_cho_fedbatch_01",
  "data_quality_score": 96.4,
  "summary": {
    "total_rows": 672,
    "cleaned_rows": 672,
    "duplicates_removed": 0,
    "interpolated_points": 4,
    "outliers_flagged": 2
  },
  "column_health": [
    {
      "canonical_name": "glucose_gL",
      "source_column": "Gluc_gL",
      "missing_percentage": 0.0,
      "min": 0.42,
      "max": 6.85,
      "physiological_valid": true,
      "unit": "g/L"
    }
  ]
}
```

### `GET /api/runs/{id}`
* **Description:** Retrieve time-series data, batch metadata, and quality metrics for a specific batch.
* **Response (200 OK):**
```json
{
  "run_id": "BATCH-2026-CHO-001",
  "vessel_volume_L": 2.0,
  "cell_line": "CHO-K1 mAb Producer",
  "duration_h": 336.0,
  "sampling_interval_h": 2.0,
  "data_provenance": "SYNTHETIC DEMO DATA — NOT EXPERIMENTAL DATA",
  "series": [
    {
      "time_h": 0.0,
      "VCD": 0.5,
      "viability_pct": 98.5,
      "glucose_gL": 5.2,
      "glutamine_mM": 4.0,
      "lactate_gL": 0.2,
      "ammonia_mM": 0.8,
      "pH": 7.15,
      "DO_pct": 50.0,
      "temp_C": 36.8,
      "rpm": 250.0,
      "gas_flow_vvm": 0.1,
      "feed_rate_mL_h": 0.0
    }
  ]
}
```

---

## 3. Real-Time Virtual Sensors & Fault Injection

### `WebSocket /ws/sensors`
* **Description:** High-frequency bioprocess telemetry stream delivering 12 virtual sensor channels at 2.0s intervals.
* **Payload Format:**
```json
{
  "timestamp": "2026-09-29T11:32:04.120Z",
  "batch_id": "BATCH-2026-CHO-001",
  "time_h": 72.0,
  "is_simulated": true,
  "disclaimer": "SIMULATED SENSOR DATA — NOT CONNECTED TO PHYSICAL EQUIPMENT",
  "sensors": {
    "SENSOR-01": {"name": "pH", "value": 7.02, "unit": "pH", "status": "NORMAL", "rolling_avg": 7.04},
    "SENSOR-02": {"name": "DO", "value": 48.5, "unit": "%", "status": "NORMAL", "rolling_avg": 49.1},
    "SENSOR-03": {"name": "Temperature", "value": 36.8, "unit": "°C", "status": "NORMAL", "rolling_avg": 36.8},
    "SENSOR-04": {"name": "Glucose", "value": 3.8, "unit": "g/L", "status": "NORMAL", "rolling_avg": 3.9},
    "SENSOR-05": {"name": "Glutamine", "value": 2.1, "unit": "mM", "status": "NORMAL", "rolling_avg": 2.2},
    "SENSOR-06": {"name": "Lactate", "value": 2.45, "unit": "g/L", "status": "WARNING", "rolling_avg": 2.10},
    "SENSOR-07": {"name": "Ammonia", "value": 2.8, "unit": "mM", "status": "NORMAL", "rolling_avg": 2.7},
    "SENSOR-08": {"name": "VCD", "value": 8.42, "unit": "10^6 cells/mL", "status": "NORMAL", "rolling_avg": 8.20},
    "SENSOR-09": {"name": "Viability", "value": 96.1, "unit": "%", "status": "NORMAL", "rolling_avg": 96.8},
    "SENSOR-10": {"name": "Agitation", "value": 250.0, "unit": "RPM", "status": "NORMAL", "rolling_avg": 250.0},
    "SENSOR-11": {"name": "Gas Flow", "value": 0.12, "unit": "vvm", "status": "NORMAL", "rolling_avg": 0.12},
    "SENSOR-12": {"name": "Feed Rate", "value": 4.5, "unit": "mL/h", "status": "NORMAL", "rolling_avg": 4.5}
  }
}
```

### `POST /api/sensors/fault`
* **Description:** Inject synthetic perturbation into the live sensor replay engine.
* **Request Body:**
```json
{
  "fault_type": "glucose_overfeed",
  "magnitude": 2.5,
  "duration_h": 12.0
}
```
* **Supported Fault Types:**
  - `glucose_overfeed`
  - `lactate_rise`
  - `do_sensor_failure`
  - `ph_drift`
  - `viability_crash`
* **Response (200 OK):**
```json
{
  "status": "injected",
  "fault_type": "glucose_overfeed",
  "message": "Injected glucose perturbation into virtual sensor stream. Risk engine alerted."
}
```

---

## 4. Machine Learning & Uncertainty Predictions

### `GET /api/model/metrics`
* **Description:** Retrieve validated benchmark metrics comparing candidate models trained on batch-split splits.
* **Response (200 OK):**
```json
{
  "split_strategy": "GroupKFold by Batch ID (Strict non-leakage)",
  "training_batches": ["BATCH-001", "BATCH-002", "BATCH-003"],
  "test_batches": ["BATCH-004"],
  "targets": {
    "VCD": {
      "linear_regression": {"mae": 0.65, "rmse": 0.88, "r2": 0.89},
      "random_forest": {"mae": 0.31, "rmse": 0.44, "r2": 0.96},
      "gradient_boosting": {"mae": 0.28, "rmse": 0.39, "r2": 0.97},
      "best_model": "Gradient Boosting Regressor"
    },
    "viability_pct": {
      "best_model": "Random Forest Regressor",
      "mae": 1.25,
      "rmse": 1.82,
      "r2": 0.94
    },
    "lactate_gL": {
      "best_model": "Gradient Boosting Regressor",
      "mae": 0.18,
      "rmse": 0.26,
      "r2": 0.95
    },
    "ammonia_mM": {
      "best_model": "Random Forest Regressor",
      "mae": 0.24,
      "rmse": 0.35,
      "r2": 0.92
    }
  }
}
```

### `POST /api/predict/metabolites`
* **Description:** Generate forward trajectory forecasts for VCD, viability, lactate, and ammonia with uncertainty bounds and explainability SHAP attributions.
* **Request Body:**
```json
{
  "current_state": {
    "time_h": 96.0,
    "VCD": 12.4,
    "viability_pct": 94.2,
    "glucose_gL": 4.1,
    "glutamine_mM": 1.8,
    "lactate_gL": 2.8,
    "ammonia_mM": 3.1,
    "pH": 6.98,
    "DO_pct": 42.0,
    "temp_C": 36.8,
    "feed_rate_mL_h": 5.0
  },
  "horizon_hours": 48.0
}
```
* **Response (200 OK):**
```json
{
  "horizon_hours": 48.0,
  "predictions": [
    {
      "time_h": 120.0,
      "vcd": {"mean": 14.8, "lower_bound": 13.9, "upper_bound": 15.7, "unit": "10^6 cells/mL"},
      "viability": {"mean": 91.5, "lower_bound": 89.2, "upper_bound": 93.8, "unit": "%"},
      "lactate": {"mean": 3.65, "lower_bound": 3.30, "upper_bound": 4.00, "unit": "g/L"},
      "ammonia": {"mean": 3.8, "lower_bound": 3.4, "upper_bound": 4.2, "unit": "mM"}
    }
  ],
  "explainability": {
    "target": "viability",
    "disclaimer": "STATISTICAL MODEL CONTRIBUTION — DOES NOT PROVE BIOLOGICAL CAUSATION",
    "top_contributing_features": [
      {"feature": "lactate_gL", "importance": 0.42, "direction": "negative", "description": "High accumulation of lactate is strongly associated with downward viability trajectory."},
      {"feature": "glucose_consumption_rate", "importance": 0.28, "direction": "positive", "description": "Active substrate uptake indicates viable metabolic maintenance."},
      {"feature": "ammonia_mM", "importance": 0.18, "direction": "negative", "description": "Ammonia levels approaching inhibitory range (4.0 mM)."}
    ]
  }
}
```

---

## 5. Nutrient Analysis & Feed Scheduler

### `POST /api/analysis/nutrients`
* **Description:** Evaluate nutrient and byproduct levels against bioprocess reference envelopes.
* **Response (200 OK):**
```json
{
  "evaluation": [
    {"parameter": "glucose_gL", "value": 3.8, "status": "OPTIMAL", "range": "2.0 - 5.0 g/L"},
    {"parameter": "glutamine_mM", "value": 0.9, "status": "DEFICIENT", "range": "1.5 - 4.0 mM"},
    {"parameter": "lactate_gL", "value": 3.2, "status": "EXCESS", "range": "< 2.5 g/L"},
    {"parameter": "ammonia_mM", "value": 2.1, "status": "OPTIMAL", "range": "< 4.0 mM"}
  ],
  "disclaimer": "Reference range depends on cell line, clone, and basal medium formulation."
}
```

### `POST /api/feed/schedule`
* **Description:** Generate comparative decision-support feed scenarios (Current vs. Optimized).
* **Request Body:**
```json
{
  "current_feed_mL_h": 6.0,
  "glucose_target_gL": 3.0,
  "process_time_h": 96.0
}
```
* **Response (200 OK):**
```json
{
  "current_plan": {
    "feed_rate_mL_h": 6.0,
    "predicted_end_vcd": 13.2,
    "predicted_end_viability": 84.0,
    "predicted_end_lactate": 4.2,
    "estimated_cost_inr": 28400.0
  },
  "optimized_plan": {
    "feed_rate_mL_h": 4.2,
    "glucose_bolus_g": 1.8,
    "predicted_end_vcd": 15.1,
    "predicted_end_viability": 90.5,
    "predicted_end_lactate": 2.6,
    "estimated_cost_inr": 22100.0,
    "expected_savings_pct": 22.18
  },
  "recommendation_id": "REC-FEED-9901",
  "status": "HUMAN APPROVAL REQUIRED",
  "why": "Dynamic feeding at 4.2 mL/h reduces glucose overflow metabolism, suppressing toxic lactate accumulation while extending culture viability by 6.5%.",
  "constraints_checked": ["Max working volume not exceeded", "Osmolality within 290-340 mOsm/kg", "Pump flow rate within equipment specs"]
}
```

---

## 6. Media Cost Optimizer

### `POST /api/optimize/media`
* **Description:** Perform unit economic analysis and Pareto optimization across formulations.
* **Request Body:**
```json
{
  "currency": "INR",
  "batch_volume_L": 2.0,
  "current_components": [
    {"name": "Basal Medium CHO-Pro", "unit_cost": 4500.0, "amount_used": 1.8, "unit": "L"},
    {"name": "Concentrated Feed A", "unit_cost": 9200.0, "amount_used": 0.25, "unit": "L"},
    {"name": "Recombinant Growth Factor", "unit_cost": 18500.0, "amount_used": 0.01, "unit": "g"}
  ],
  "proposed_alternative": {
    "name": "Lean-Feed Fed-Batch Strategy",
    "components": [
      {"name": "Basal Medium CHO-Pro", "unit_cost": 4500.0, "amount_used": 1.8, "unit": "L"},
      {"name": "Optimized Feed A", "unit_cost": 7100.0, "amount_used": 0.18, "unit": "L"},
      {"name": "Recombinant Growth Factor", "unit_cost": 18500.0, "amount_used": 0.008, "unit": "g"}
    ]
  }
}
```
* **Response (200 OK):**
```json
{
  "currency": "INR",
  "current_batch_cost": 10585.0,
  "optimized_batch_cost": 9526.0,
  "cost_delta": -1059.0,
  "savings_percentage": 10.0,
  "cost_per_L_current": 5292.5,
  "cost_per_L_optimized": 4763.0,
  "cost_per_billion_cells_current": 427.5,
  "cost_per_billion_cells_optimized": 361.2,
  "disclaimer": "Calculated strictly from supplied unit prices. Model estimate."
}
```

---

## 7. Scale-Up Engine (2 L → 1,000 L)

### `POST /api/scaleup`
* **Description:** Calculate hydrodynamic and mass-transfer scaling parameters across 2 L, 10 L, 100 L, and 1,000 L.
* **Request Body:**
```json
{
  "source_scale_L": 2.0,
  "source_rpm": 250.0,
  "source_vvm": 0.1,
  "impeller_type": "pitched_blade",
  "density_kg_m3": 1000.0,
  "viscosity_Pa_s": 0.001
}
```
* **Response (200 OK):**
```json
{
  "disclaimer": "ENGINEERING ESTIMATE — REQUIRES WET-LAB VALIDATION",
  "scales": [2.0, 10.0, 100.0, 1000.0],
  "strategies": {
    "constant_power_volume": [
      {"scale_L": 2.0, "rpm": 250.0, "tip_speed_m_s": 0.72, "power_volume_W_m3": 45.2, "kla_h1": 18.5, "mixing_time_s": 14.2, "shear_risk": "LOW", "do_risk": "LOW"},
      {"scale_L": 10.0, "rpm": 146.0, "tip_speed_m_s": 0.85, "power_volume_W_m3": 45.2, "kla_h1": 17.8, "mixing_time_s": 22.1, "shear_risk": "LOW", "do_risk": "LOW"},
      {"scale_L": 100.0, "rpm": 68.0, "tip_speed_m_s": 1.12, "power_volume_W_m3": 45.2, "kla_h1": 16.5, "mixing_time_s": 38.4, "shear_risk": "MEDIUM", "do_risk": "LOW"},
      {"scale_L": 1000.0, "rpm": 32.0, "tip_speed_m_s": 1.48, "power_volume_W_m3": 45.2, "kla_h1": 14.8, "mixing_time_s": 65.0, "shear_risk": "MEDIUM-HIGH", "do_risk": "MEDIUM"}
    ],
    "constant_tip_speed": [
      {"scale_L": 1000.0, "rpm": 15.5, "tip_speed_m_s": 0.72, "power_volume_W_m3": 5.1, "kla_h1": 6.8, "mixing_time_s": 140.0, "shear_risk": "LOW", "do_risk": "CRITICAL_OXYGEN_STARVATION"}
    ]
  },
  "engineering_notes": [
    "Scaling by Constant Tip Speed at 1,000 L creates severe kLa deficit (< 8 h^-1), risking hypoxic culture conditions.",
    "Constant P/V at 1,000 L maintains adequate kLa (14.8 h^-1) with acceptable tip speed of 1.48 m/s."
  ]
}
```

---

## 8. Risk Engine & Alerts

### `GET /api/alerts`
* **Description:** Retrieve active metabolic and sensor alerts.
* **Response (200 OK):**
```json
[
  {
    "id": "ALERT-2026-081",
    "timestamp": "2026-09-29T11:34:00Z",
    "severity": "CRITICAL",
    "parameter": "lactate_gL",
    "observed_value": 3.85,
    "threshold": 3.0,
    "trend": "rising (+0.45 g/L in 6h)",
    "evidence": "Lactate accumulation accelerating during peak stationary phase.",
    "possible_driver": "Excessive residual glucose inducing Warburg-like aerobic glycolysis.",
    "predicted_impact": "Viability projected to drop below 85% within 36 hours.",
    "recommended_review": "Review nutrient feed rate reduction or switch to galactosyl-sparing feed.",
    "confidence": 0.94
  }
]
```

---

## 9. Human-in-the-Loop Approval & Audit Log

### `POST /api/recommendations/{id}/approve`
* **Request Body:**
```json
{
  "reviewer_name": "Dr. S. K. Ramanathan (Senior Bioprocess Lead)",
  "reviewer_role": "Process Development Lead",
  "comment": "Approved reduction of feed rate to 4.2 mL/h. Aligns with lactate management protocol.",
  "status": "APPROVED"
}
```
* **Response (200 OK):**
```json
{
  "recommendation_id": "REC-FEED-9901",
  "status": "APPROVED",
  "audit_entry_id": "AUDIT-2026-0042",
  "timestamp": "2026-09-29T11:35:12Z"
}
```

### `POST /api/recommendations/{id}/reject`
* **Request Body:**
```json
{
  "reviewer_name": "Dr. S. K. Ramanathan",
  "comment": "Rejected due to scheduled harvest within 18 hours.",
  "status": "REJECTED"
}
```

### `GET /api/audit`
* **Description:** Retrieve complete historical decision-support audit log.

---

## 10. Local Copilot Chat & Report Generation

### `POST /api/copilot/query`
* **Request Body:**
```json
{
  "question": "Why is lactate increasing?",
  "context_run_id": "BATCH-2026-CHO-001"
}
```
* **Response (200 OK):**
```json
{
  "answer": "Current lactate has reached 3.85 g/L (above the 3.0 g/L warning threshold). Analysis of recent telemetry reveals glucose feed rate maintained at 6.0 mL/h while VCD has plateaued at 12.4 x 10^6 cells/mL. This creates a state of substrate excess (overflow metabolism), driving high glycolytic flux toward lactate rather than TCA cycle respiration. Recommend reviewing proposed feed rate reduction scenario REC-FEED-9901.",
  "supporting_metrics": {
    "current_lactate_gL": 3.85,
    "delta_6h": "+0.45 g/L",
    "glucose_residual_gL": 4.1
  },
  "disclaimer": "Local template-based AI decision support. Requires human review."
}
```

### `GET /api/report/{run_id}`
* **Description:** Generate comprehensive bioprocess summary report in Markdown / JSON structure for compliance export.
