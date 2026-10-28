# BioCopilot 5-Minute Judge Demo Script

**Target:** YUVA Megathon 2026 — Biotech Track  
**Objective:** Deliver a flawless 3-minute pitch + 2-minute live demo showing real AI bioprocess decision support.

---

## Storyline Narrative

> *"Cell-culture bioprocess development is plagued by high media costs, metabolic stress, and unpredictable scale-up from benchtop 2 L bioreactors to 1,000 L pilot plants.  
BioCopilot acts as an intelligent decision-support partner. It ingests process telemetry, validates data quality, streams virtual sensor data, predicts metabolic risks, optimizes nutrient feed & media costs, and evaluates engineering scale-up trade-offs — requiring explicit human operator approval before any recommendation is accepted."*

---

## Step-by-Step Demo Flow (16 Steps)

| Step | Time | UI Screen | Action / Interaction | Key Takeaway |
|:---:|:---:|:---|:---|:---|
| **1** | 0:00 | **Overview** | Click "START 5-MIN DEMO" on Home screen. | Clear problem-solution pipeline presented instantly. |
| **2** | 0:15 | **Data Ingestion** | View ingested CHO cell dataset & data quality report. | Quality checks before AI predictions. |
| **3** | 0:30 | **Data Quality** | Review physiological range checks & Data Quality Score (96%). | Transparent validation rules, no silent data alteration. |
| **4** | 0:45 | **Process Dashboard** | Select `Batch_02_LactateStress` historical profile. | Baseline healthy growth profile vs metabolic drift. |
| **5** | 1:00 | **Live Monitor** | Start 12-channel Virtual Sensor stream (2s interval). | Telemetry simulation clearly marked. |
| **6** | 1:15 | **Fault Injection** | Click **"Inject Glucose Overfeed"** button. | Interactive demo trigger for judges. |
| **7** | 1:30 | **Live Telemetry** | Observe SENSOR-04 (Glucose) & SENSOR-06 (Lactate) spike. | Live real-time response to process perturbation. |
| **8** | 1:45 | **Risk Center** | View **HIGH SEVERITY Alert**: Glucose overfeed driving lactate accumulation. | Explains severity, trend, evidence, and possible drivers. |
| **9** | 2:00 | **AI Predictions** | View 24h VCD & Viability drop prediction with confidence bounds. | Machine learning foresight with uncertainty bounds. |
| **10** | 2:15 | **Explainable AI** | Click **SHAP Feature Contribution** view. | Explicit distinction: Model contribution vs biological causation. |
| **11** | 2:30 | **Feed Scheduler** | Run What-If Feed Scenario: Current vs Smart Bounded Feed. | Evaluates lower feed rate to prevent lactate accumulation. |
| **12** | 2:45 | **Media Cost** | Compare Media Cost breakdown (INR/USD) & Pareto frontier. | Real cost savings computed directly from pricing table. |
| **13** | 3:00 | **Scale-Up Engine** | Run 2 L → 10 L → 100 L → 1,000 L under Constant $P/V$ & $k_L a$. | Engineering trade-offs ($Re$, shear risk, DO limitations). |
| **14** | 3:15 | **Human Approval** | Submit Recommendation to Human Approval Queue. | System is strictly Decision-Support, no automated control. |
| **15** | 3:30 | **Approval Action** | Operator enters comment and clicks **APPROVE**. | Immutable audit trail recorded in SQLite DB. |
| **16** | 3:45 | **Report** | Click **"Generate Bioprocess Decision Report"**. | Instant complete PDF/Markdown export for regulatory review. |

---

## Golden Rules for Demonstration

1. Never imply direct control of physical lab hardware.
2. Always emphasize that predictions include confidence intervals.
3. Keep the 5-Minute Guided Demo button visible on the main navigation.
