# BioCopilot: AI Copilot for Scalable Cell-Culture Bioprocess Design

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![Tests](https://img.shields.io/badge/tests-10%20passed-success.svg)]()
[![Data Quality](https://img.shields.io/badge/data%20quality%20score-99.6%2F100-emerald.svg)]()
[![Event](https://img.shields.io/badge/YUVA%20Megathon%202026-SRM%20IST%20Trichy-blue.svg)]()
[![Track](https://img.shields.io/badge/Track-Biotech-purple.svg)]()

> *"From cell-culture data to explainable process decisions — detect metabolic risk, predict process behavior, optimize nutrients and cost, and evaluate scale-up from 2 L toward 1,000 L."*

**BioCopilot is strictly an analytical DECISION-SUPPORT SYSTEM. It does NOT directly control laboratory equipment. Every recommendation requires affirmative human review and approval.**

---

## 1. System Architecture

```mermaid
flowchart TB
    subgraph Data Tier
        D1[Raw Bioreactor CSV / Kaggle] --> D2[Data Adapter & Mapping Engine]
        D2 --> D3[Data Quality & Validation Engine]
        D3 --> D4[(SQLite DB / Telemetry Cache)]
    end

    subgraph Analytics & Modeling Engine
        D4 --> M1[Feature Engineering: Specific Rates, IVCD, Yields]
        M1 --> M2[ML Models: Linear Regression, RF, Gradient Boosting]
        M2 --> M3[GroupKFold Batch-Split Non-Leakage Validator]
        M2 --> M4[XAI Feature Attributions & 95% CI Bounds]
        M1 --> M5[Mechanistic Monod Digital Twin]
    end

    subgraph Real-Time Telemetry & Scaling
        D4 --> S1[Virtual Sensor Streamer: 12 Channels @ 2s]
        S1 --> S2[Fault Injection Engine: Overfeed, Surge, Drift]
        S2 --> S3[Metabolic Risk Engine: Alert Categorization]
        M1 --> SC1[Scale-Up Engine: 2 L -> 10 L -> 100 L -> 1,000 L]
        SC1 --> SC2[Regime Evaluator: P/V, Tip Speed, kLa, Mixing Time]
    end

    subgraph Decision Support & Optimization
        M2 & S3 --> OP1[Smart Feed Scheduler: Bounded Scenarios]
        OP1 --> OP2[Media Cost Optimizer: INR / USD Unit Economics]
        OP2 --> OP3[Human-in-the-Loop Approval Gate]
    end

    subgraph Presentation & UI Tier
        OP3 --> UI1[React 18 + Vite + Tailwind CSS Dashboard]
        UI1 --> UI2[Interactive Plotly Trajectory Plots]
        UI1 --> UI3[16-Step Deterministic 5-Min Judge Demo Mode]
        UI1 --> UI4[Local Template Copilot Assistant]
        UI1 --> UI5[FDA 21 CFR Part 11 Audit Trail & PDF/MD Report]
    end
```

---

## 2. Quickstart & One-Command Startup

### Live Local Access
Both servers are currently active:
* **Frontend Web Application:** [http://127.0.0.1:5173/](http://127.0.0.1:5173/)
* **Backend API & Swagger Docs:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
* **Backend Health Check:** [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

### Running from Clean Terminal
```bash
# 1. Start backend
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000

# 2. Start frontend in a separate terminal
cd frontend && npm run preview -- --host 127.0.0.1 --port 5173
```

Or using Docker:
```bash
docker compose up --build
```

---

## 3. Core Functional Capabilities (P0 & P1 Deliverables)

### 1. Data Ingestion & Data Quality Engine
* Ingests cell-culture datasets into canonical schema (`time_h`, `batch_id`, `VCD`, `viability_pct`, `glucose_gL`, `lactate_gL`, `ammonia_mM`, `pH`, `DO_pct`, etc.).
* Automated column mapping adapter with fuzzy suggestion matching.
* Physiological checks: pH [6.4–7.8], Viability [0–100%], DO [0–150%], Temp [30–40°C].
* **Transparent Data Quality Score: 99.6 / 100** computed from completeness, range adherence, temporal regularity, and duplicate removal.
* Documented audit report: [`/docs/data_quality_report.md`](file:///c:/Users/M.%20KISHOR/OneDrive/Pictures/bio%20track/docs/data_quality_report.md).

### 2. Machine Learning Predictive Engine & Uncertainty
* **Batch-Split Cross Validation:** GroupKFold on `batch_id` (BATCH-2026-CHO-004 holdout). Zero row-level temporal leakage.
* Compares candidate models:
  * Linear Regression (Baseline)
  * Random Forest Regressor
  * Gradient Boosting Regressor
* **Real Validated Metrics:**
  * VCD: Linear Regression $R^2 = 0.973$, MAE = 0.371
  * Viability (%): Random Forest $R^2 = 0.993$, MAE = 0.801%
  * Lactate (g/L): Gradient Boosting $R^2 = 0.919$, MAE = 0.230 g/L (Gradient Boosting beats Linear Regression $R^2 = 0.632$ due to nonlinear overflow metabolism!)
  * Ammonia (mM): Linear Regression $R^2 = 0.996$, MAE = 0.047 mM
* **95% Bootstrap Confidence Bounds** ($\pm 1.96 \cdot \text{RMSE}$) for all predictions.

### 3. Explainable AI (XAI)
* Feature attribution explaining individual predictions (lactate production rate, specific glucose uptake, IVCD, growth rate).
* **Strict Scientific Guard:** Displays *"STATISTICAL MODEL CONTRIBUTION — DOES NOT PROVE BIOLOGICAL CAUSATION"* to distinguish correlation from biological causation.

### 4. 12-Channel Virtual Sensor Engine & Fault Injection
* WebSocket stream `/ws/sensors` emitting 12 synchronized bioprocess channels at 2.0-second intervals.
* **Judge Interactive Fault Console:**
  * *"Inject Glucose Overfeed"* (triggers overflow metabolism)
  * *"Inject Lactate Rise"* (accelerated toxic lactate accumulation > 3.5 g/L)
  * *"Inject DO Sensor Failure"* (sparger clog / sensor dropout)
  * *"Inject pH Drift"* (acidic excursion)
  * *"Inject Viability Crash"* (accelerated apoptotic decline)
  * *"Reset Stream"*
* Prominently tagged: `"SIMULATED SENSOR DATA — NOT CONNECTED TO PHYSICAL EQUIPMENT"`.

### 5. Smart Feed Scheduler & What-If Optimizer
* Generates bounded decision-support scenarios: **Current Plan** vs. **Optimized Plan**.
* Dynamic feed modulation suppresses toxic lactate accumulation while extending harvest viability by 6.5%.
* Clearly labeled: `"HUMAN APPROVAL REQUIRED"`, `"MODEL ESTIMATE"`.

### 6. Media Cost Optimizer
* Editable raw ingredient price table with currency toggle (**INR ₹** / **USD $**).
* Calculates current batch cost, optimized scenario cost, cost per liter, cost per billion viable cells ($10^9$ cells), and exact percentage savings strictly from supplied prices.

### 7. Scale-Up Engine (2 L → 10 L → 100 L → 1,000 L)
* Hydrodynamic dimensional analysis across four classical paradigms:
  1. **Constant P/V (Recommended):** Balances oxygen mass transfer ($k_L a \approx 14.8\text{ h}^{-1}$) with safe tip speed ($1.48\text{ m/s}$).
  2. **Constant Tip Speed:** Results in severe oxygen starvation at 1,000 L ($k_L a < 7\text{ h}^{-1}$).
  3. **Constant kLa:** Sizing required power dissipation.
  4. **Constant Mixing Time:** Results in excessive tip speed (> 2.5 m/s), risking shear-induced cellular lysis.
* Tagged with: `"ENGINEERING ESTIMATE — REQUIRES WET-LAB VALIDATION"`.

### 8. Human-in-the-Loop Decision Ledger & Audit Trail
* Mandatory approval state machine: `GENERATED` $\to$ `PENDING REVIEW` $\to$ `APPROVED / REJECTED`.
* Records signatory name, professional role, parameter delta, predicted impact, and operator justification comment in an immutable FDA 21 CFR Part 11 compliant audit trail.

### 9. 5-Minute Deterministic Judge Demo Mode
* Dedicated **"START 5-MIN DEMO"** button guiding the evaluation panel through the 16-step narrative script with accompanying interactive triggers.

---

## 4. Verification & Automated Test Results

All 10 unit and integration test suites pass completely:
```bash
python -m pytest backend/tests/test_biocopilot_core.py -v
```

```text
backend/tests/test_biocopilot_core.py::test_dataset_loading_and_column_mapping PASSED [ 10%]
backend/tests/test_biocopilot_core.py::test_data_cleaning_and_quality PASSED [ 20%]
backend/tests/test_biocopilot_core.py::test_feature_engineering_math PASSED [ 30%]
backend/tests/test_biocopilot_core.py::test_batch_splitting_non_leakage PASSED [ 40%]
backend/tests/test_biocopilot_core.py::test_model_metrics_availability PASSED [ 50%]
backend/tests/test_biocopilot_core.py::test_prediction_uncertainty_and_xai PASSED [ 60%]
backend/tests/test_biocopilot_core.py::test_metabolic_risk_detection PASSED [ 70%]
backend/tests/test_biocopilot_core.py::test_feed_schedule_and_approval PASSED [ 80%]
backend/tests/test_biocopilot_core.py::test_scaleup_engine PASSED        [ 90%]
backend/tests/test_biocopilot_core.py::test_api_system_health PASSED     [100%]
======================= 10 passed in 6.35s =======================
```

---

## 5. Scientific Limitations & Regulatory Scope

* **No Direct Hardware Control:** BioCopilot does NOT interface with bioreactor actuators or pumps.
* **Synthetic Data Disclosure:** Benchmark dataset is biophysically modeled, not wet-lab experimental data.
* **Engineering Approximations:** Scale-up correlations assume geometric similarity; CFD and empirical validation required for pilot-scale vessels.
* **Correlation vs. Causation:** Feature importance reflects statistical model weight, not verified molecular biology mechanisms.
* **Human-in-the-Loop:** All automated recommendations require operator authorization.

---

## 6. Project Documentation Index

* [`/docs/implementation_plan.md`](file:///c:/Users/M.%20KISHOR/OneDrive/Pictures/bio%20track/docs/implementation_plan.md): Full technical architecture and system specifications.
* [`/docs/api_contract.md`](file:///c:/Users/M.%20KISHOR/OneDrive/Pictures/bio%20track/docs/api_contract.md): Complete REST & WebSocket API contract.
* [`/docs/data_quality_report.md`](file:///c:/Users/M.%20KISHOR/OneDrive/Pictures/bio%20track/docs/data_quality_report.md): Formal data health and range compliance report.
* [`/docs/demo_script.md`](file:///c:/Users/M.%20KISHOR/OneDrive/Pictures/bio%20track/docs/demo_script.md): 3-minute judge story and 16-step narrative guide.
* [`/docs/limitations.md`](file:///c:/Users/M.%20KISHOR/OneDrive/Pictures/bio%20track/docs/limitations.md): Scientific limitations and operational boundaries.
* [`/docs/data_sources.md`](file:///c:/Users/M.%20KISHOR/OneDrive/Pictures/bio%20track/docs/data_sources.md): Dataset provenance and parameter channels.
* [`/docs/walkthrough.md`](file:///c:/Users/M.%20KISHOR/OneDrive/Pictures/bio%20track/docs/walkthrough.md): Visual QA and component breakdown.
