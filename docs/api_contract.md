# BioCopilot API Contract

## Base URL
`http://localhost:8000/api`

---

## Endpoint Specifications

### Health & Metadata
- **`GET /health`**
  - **Response:** `{ "status": "ok", "app": "BioCopilot", "version": "1.0.0", "mode": "Decision-Support System" }`

### Datasets (Agent A)
- **`POST /api/datasets/upload`**
  - Form Data file (CSV).
  - Returns dataset metadata & parsed columns.
- **`GET /api/datasets`**
  - Returns list of available raw/demo datasets.
- **`POST /api/datasets/{id}/clean`**
  - Request body: `{ "column_mapping": {...}, "physiological_ranges": {...} }`
  - Returns Data Quality Report (score, missing stats, outliers, provenance).

### Virtual Sensors & Telemetry (Agent A)
- **`GET /ws/sensors`** (WebSocket) or **`GET /api/sensors/stream`** (SSE)
  - Broadcasts 12 sensor channel states every 2 seconds.
- **`POST /api/sensors/fault`**
  - Request: `{ "fault_type": "glucose_overfeed" | "lactate_rise" | "do_failure" | "ph_drift" | "viability_crash", "intensity": 1.5 }`
  - Response: `{ "status": "fault_injected", "sensor_impacted": "SENSOR-06" }`

### Machine Learning & Risk (Agent B)
- **`GET /api/runs/{id}`**
  - Returns processed batch run data, VCD, Viability, Metabolite profiles.
- **`POST /api/predict/metabolites`**
  - Request: `{ "run_id": "batch_01", "horizon_h": 24 }`
  - Response: `{ "predictions": { "vcd": [...], "viability": [...], "lactate": [...], "ammonia": [...] }, "uncertainty": {...}, "model_metrics": {...} }`
- **`GET /api/model/metrics`**
  - Returns MAE, RMSE, R² for each target variable across Train/Val/Test batch splits.
- **`GET /api/explainability/{run_id}`**
  - Returns SHAP / feature importance matrix with directions, model contributions, and explicit separation from biological causation.
- **`GET /api/alerts`**
  - Returns list of active metabolic risk alerts (Severity, parameter, trend, driver, impact).

### Optimization & Feeding (Agent B)
- **`POST /api/analysis/nutrients`**
  - Nutrient status evaluation (Deficient, Optimal, Excess).
- **`POST /api/feed/schedule`**
  - What-if feed scenario simulator. Compares baseline vs optimized plan.
- **`POST /api/optimize/media`**
  - Pareto cost vs growth/viability optimization. Returns estimated savings and nutrient breakdowns.

### Scale-Up Engine (Agent C)
- **`POST /api/scaleup`**
  - Request: `{ "source_volume_L": 2, "target_volumes": [10, 100, 1000], "strategy": "constant_pv" | "constant_tipspeed" | "constant_kla" | "constant_mixing" }`
  - Response: Table of RPM, Gas Flow, P/V, Tip Speed, kLa estimate, Mixing time estimate, DO Risk, Shear Risk.

### Human-in-the-Loop & Audit (Agent D)
- **`POST /api/recommendations`**
  - Create recommendation entry (`PENDING`).
- **`POST /api/recommendations/{id}/approve`**
  - Body: `{ "user_id": "operator_01", "comment": "Approved following metabolic review." }`
- **`POST /api/recommendations/{id}/reject`**
  - Body: `{ "user_id": "operator_01", "reason": "Cost savings insufficient for shear risk." }`
- **`GET /api/audit`**
  - Returns audit log table of all actions and approvals.
- **`GET /api/report/{run_id}`**
  - Generates downloadable bioprocess decision PDF/Markdown report.

### Copilot Assistant
- **`POST /api/copilot/query`**
  - Request: `{ "query": "Why is lactate increasing?", "run_id": "batch_01" }`
  - Response: `{ "answer": "...", "data_sources": [...], "confidence": 0.92 }`
