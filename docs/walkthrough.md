# BioCopilot: Visual QA & Application Walkthrough

**Target Event:** YUVA Megathon 2026 — SRM IST Trichy — Biotech Track  
**Application State:** Fully operational with live FastAPI backend on port 8000 and Vite frontend on port 5173.  

---

## 1. Overview Dashboard (`/`)

* **Purpose:** Acts as the executive command center communicating the bioprocess problem, solution, and the 6-stage end-to-end pipeline.
* **Working Features:**
  * High-impact problem breakdown: High Media Cost, Metabolic Imbalance, Process Variability, Scale-Up Uncertainty.
  * Solution overview: Virtual sensors, XAI, unit economics, and 2 L → 1,000 L scale-up.
  * 6-stage pipeline navigation chips: DATA → DETECT → PREDICT → OPTIMIZE → SCALE → APPROVE.
  * Interactive Plotly bioprocess trajectory showing VCD, Viability, Glucose, and Lactate dynamics across 336 hours.
  * High-visibility **"START 5-MIN DEMO"** launch button.
* **Known Limitations:**
  * Trajectory reflects synthetic CHO fed-batch kinetics; wet-lab validation required for novel clones.

---

## 2. Data Ingestion & Quality Engine (`/data`)

* **Purpose:** Ingests raw cell culture files, maps variables automatically, and audits data health before allowing any model predictions.
* **Working Features:**
  * Prominent provenance badge: `"SYNTHETIC DEMO DATA — NOT EXPERIMENTAL DATA"`.
  * Transparent **Data Quality Score Gauge (99.6 / 100)** computed from completeness (40pts), range adherence (30pts), temporal regularity (20pts), and duplicate removal (10pts).
  * Interactive 16-variable canonical schema mapping table with missingness percentage, observed ranges, physiological validity checks, and model usage tags.
  * "Recalculate Quality Score" interactive trigger.
* **Known Limitations:**
  * Variables missing in source datasets are explicitly marked *"Not available in source data"* and are never fabricated.

---

## 3. Virtual Sensor Engine & Fault Injection (`/monitor`)

* **Purpose:** Real-time simulated laboratory instrument monitoring 12 synchronized telemetry channels.
* **Working Features:**
  * 12 Virtual Sensor Cards: SENSOR-01 pH, SENSOR-02 DO, SENSOR-03 Temp, SENSOR-04 Glucose, SENSOR-05 Glutamine, SENSOR-06 Lactate, SENSOR-07 Ammonia, SENSOR-08 VCD, SENSOR-09 Viability, SENSOR-10 RPM, SENSOR-11 Gas Flow, SENSOR-12 Feed Rate.
  * 10-tick rolling average computation and status badges (`NORMAL`, `WARNING`, `CRITICAL`).
  * **Judge Interactive Fault Console:**
    * *Inject Glucose Overfeed* (spikes glucose, triggers overflow metabolism)
    * *Inject Lactate Rise* (surges lactate past 3.5 g/L toxicity threshold)
    * *Inject DO Failure* (simulates sparger clog/sensor dropout)
    * *Inject pH Drift* (acidic shift past deadband)
    * *Inject Viability Crash* (accelerated cell death)
    * *Reset Stream*
  * Mandatory disclaimer: `"SIMULATED SENSOR DATA — NOT CONNECTED TO PHYSICAL EQUIPMENT"`.

---

## 4. AI Predictions & Explainability (`/predictions`)

* **Purpose:** Multi-horizon trajectory forecasts with rigorous uncertainty intervals and model attributions.
* **Working Features:**
  * Forward horizon forecasting at 12h, 24h, 36h, and 48h intervals for VCD, Viability, Lactate, and Ammonia.
  * **95% Bootstrap Uncertainty Ribbons** ($\pm 1.96 \cdot \text{RMSE}$) showing probabilistic cone of future states.
  * Model benchmark table comparing Linear Regression, Random Forest, and Gradient Boosting evaluated via strict **GroupKFold by Batch ID** (zero temporal row leakage).
  * **Explainable AI (XAI) attribution cards** showing feature importance percentages, directional impact, and domain rationale.
  * Mandatory scientific guard: `"STATISTICAL MODEL CONTRIBUTION — DOES NOT PROVE BIOLOGICAL CAUSATION"`.

---

## 5. Nutrient Analysis & Smart Feed Scheduler (`/nutrients`)

* **Purpose:** Compares substrate levels against metabolic envelopes and generates bounded decision-support feed scenarios.
* **Working Features:**
  * Nutrient gauges for Glucose, Glutamine, Lactate, and Ammonia with envelope statuses (`OPTIMAL`, `DEFICIENT`, `EXCESS`, `CRITICAL`).
  * Current Plan vs. Optimized Plan comparison cards (predicted harvest VCD, viability, end lactate, and media cost).
  * Decision rationale detailing WHY the feed modulation suppresses overflow metabolism and triggers lactate consumption.
  * "REVIEW & APPROVE" button triggering the modal human sign-off dialog.

---

## 6. Media Cost Optimizer (`/cost`)

* **Purpose:** Computes manufacturing unit economics and formulation savings in INR and USD.
* **Working Features:**
  * Editable component recipe table (Basal Medium, Concentrated Feed, Recombinant Growth Factors, Glucose Bolus).
  * Currency toggle: **INR (₹)** vs. **USD ($)**.
  * Dynamic calculation of batch cost, cost per liter, cost per billion viable cells ($10^9$ cells), and exact savings percentage.
  * Strict mathematical computation: savings percentages are never hardcoded and update dynamically upon price changes.

---

## 7. Scale-Up Hydrodynamics Engine (`/scaleup`)

* **Purpose:** Sizing and hydrodynamic risk evaluation across **2 L → 10 L → 100 L → 1,000 L**.
* **Working Features:**
  * Interactive sliders for benchtop agitation (RPM) and aeration (vvm).
  * Four classic scaling regimes: **Constant P/V**, **Constant Tip Speed**, **Constant kLa**, **Constant Mixing Time**.
  * Dynamic Plotly scale-up comparison curves.
  * Comprehensive scenario matrix calculating RPM, tip speed ($m/s$), $P/V$ ($W/m^3$), $k_L a$ ($h^{-1}$), mixing time ($\theta_m$), DO risk, and shear risk.
  * Prominent caveat: `"ENGINEERING ESTIMATE — REQUIRES WET-LAB VALIDATION"`.

---

## 8. Metabolic Risk Center (`/risks`)

* **Purpose:** Real-time exception tracker categorizing process excursions.
* **Working Features:**
  * Active alerts categorized by severity: `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`, `INFO`.
  * Clinical detail cards displaying observed value, threshold, trend, evidence, probable metabolic driver, projected impact, and recommended review action.

---

## 9. Human-in-the-Loop Decision Ledger (`/approval`)

* **Purpose:** Immutable audit trail conforming to FDA 21 CFR Part 11 requirements.
* **Working Features:**
  * Decision log displaying timestamp, signatory name, professional role, recommendation ID, action (`APPROVED` / `REJECTED`), parameter delta, and operator comment.
  * Prevents any automatic execution on physical equipment.

---

## 10. Regulatory Batch Dossier (`/reports`)

* **Purpose:** Compilation of the complete batch intelligence report.
* **Working Features:**
  * Generates formatted Markdown dossier containing KPIs, active alerts, and approval history.
  * "Export MD" and "Print Report" actions for regulatory archiving.

---

## 11. Deterministic 5-Min Judge Demo Runner

* **Purpose:** Automated or manual step-by-step walkthrough covering the 16-step competition narrative.
* **Working Features:**
  * Next / Back / Auto Play (15s/step) controls.
  * Synchronized route transitions with accompanying judge narration script.
  * Interactive action execution buttons (e.g. triggering fault injection or signing audit log).
