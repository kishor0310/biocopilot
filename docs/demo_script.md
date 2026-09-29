# BioCopilot: 3-Minute Judge Demo Script & Walkthrough

**Target Event:** YUVA Megathon 2026 — SRM IST Trichy — Biotech Track  
**Pitch Duration:** 3 Minutes + 2 Minutes Q&A (Total 5-Min Judge Experience)  
**Live URL:** `http://127.0.0.1:5173/` (Backend: `http://127.0.0.1:8000/`)

---

## 1. The Core 3-Minute Narrative

> **"Judges, cell culture bioprocessing is a multi-million-dollar endeavor where a single batch failure can cost upwards of $2 million.**
>
> Today, bioprocess engineers are forced to fly blind between sampling points and guess how 2-liter benchtop recipes will behave when scaled to 1,000-liter production bioreactors.
>
> We built **BioCopilot** — an AI Copilot for Scalable Cell-Culture Bioprocess Design.
>
> It is an explainable decision-support system that:
> 1. Detects metabolic risk in real time,
> 2. Predicts future cell density, viability, and toxic metabolite trajectories,
> 3. Optimizes nutrient feeds and media economics in INR and USD,
> 4. Evaluates scale-up hydrodynamics from 2 L toward 1,000 L,
> 5. And strictly requires human operator sign-off before any recommendation can be enacted."

---

## 2. 16-Step Deterministic Demo Execution Flow

| Step | Action on UI | Visual State | Judge Narrative |
| :--- | :--- | :--- | :--- |
| **01** | Click **"START 5-MIN DEMO"** | Overview Home Dashboard loads | *"Here is our active process: BATCH-2026-CHO-001, a 14-day CHO cell fed-batch run."* |
| **02** | Navigates to `/data` | Data Quality Gauge shows **99.6 / 100** | *"Before allowing any AI model to make predictions, BioCopilot validates data completeness, sampling intervals, and physiological boundaries."* |
| **03** | View Column Adapter table | 16/16 Canonical Variables Mapped | *"Our data adapter automatically fuzzy-maps raw bioreactor headers to standardized bioprocess variables."* |
| **04** | Navigate to `/monitor` | 12 Virtual Sensor Cards Green | *"We replay the culture as 12 synchronized virtual sensors streaming at 2.0-second intervals."* |
| **05** | Point to baseline telemetry | VCD: 8.6, Viability: 96.5%, Lactate: 2.1 g/L | *"In mid-exponential phase, cellular metabolism is healthy with steady biomass accumulation."* |
| **06** | Click **"Inject Glucose Overfeed"** | Alert banner & glucose rises to 5.8 g/L | *"Now we simulate a real-world operator error or pump surge: an excessive glucose feed event."* |
| **07** | Observe telemetry response | Lactate climbs to 3.85 g/L | *"Excessive substrate triggers Warburg-like aerobic glycolysis: cells rapidly convert surplus pyruvate into toxic lactate."* |
| **08** | Navigate to `/risks` | Red **CRITICAL Alert** on `lactate_gL` | *"The Metabolic Risk Engine catches the excursion immediately, citing intracellular acidification risk."* |
| **09** | Navigate to `/predictions` | 48-Hour Forecast with 95% CI Ribbons | *"Instead of a dumb alert, BioCopilot forecasts the 48-hour forward trajectory: viability will drop below 85% within 36 hours if unaddressed."* |
| **10** | Inspect Explainable AI (XAI) | Tree attribution card: Lactate (42% weight) | *"BioCopilot explains WHY: 42% relative negative weight assigned to lactate accumulation. Notice our clear scientific guard: correlation, not biological causation."* |
| **11** | Navigate to `/nutrients` | Current Plan vs Optimized Plan | *"The Smart Feed Scheduler modulates feed from 6.0 down to 4.2 mL/h, triggering cells to switch from producing lactate to consuming it."* |
| **12** | Inspect Economics (`/cost`) | Savings card: **+22.18% Cost Reduction** | *"This dynamic feeding saves 22.18% in media cost while extending harvest viability by 6.5%."* |
| **13** | Navigate to `/scaleup` | 4 Scaling Regimes (2 L → 1,000 L) | *"What happens when this 2 L recipe moves to 1,000 L? The scale-up engine shows Constant Tip Speed starves the cells of oxygen (kLa < 7 h⁻¹), while Constant Mixing Time shears cells at >2.5 m/s. Constant P/V is the safest operating window."* |
| **14** | Navigate to `/approval` | Pending Recommendation REC-FEED-9901 | *"Crucially, BioCopilot never directly controls bioreactor pumps. Every action enters a human-in-the-loop approval gate."* |
| **15** | Click **"APPROVE & LOG AUDIT"** | Enters comment & approves | *"The lead engineer enters their rationale. The decision is recorded in an immutable FDA 21 CFR Part 11 compliant audit trail."* |
| **16** | Navigate to `/reports` | Full Compliance Batch Dossier | *"The entire run dossier is compiled into an auditable Markdown report ready for QA and regulatory submission."* |

---

## 3. Anticipated Judge Questions & Bulletproof Answers

### Q1: "How do you avoid hallucinating biological results?"
> **Answer:** *"BioCopilot does not generate ungrounded text. Every prediction comes from verified scikit-learn regressors benchmarked with batch-split GroupKFold cross-validation (zero row-level temporal leakage). When data is missing, the system explicitly displays 'Not available in source data' rather than fabricating values."*

### Q2: "Can this AI accidentally ruin a million-dollar batch?"
> **Answer:** *"No. By architecture, BioCopilot is strictly a decision-support system. It has zero network or hardware write access to bioreactor PLCs or pumps. Every single recommendation requires affirmative operator sign-off with mandatory review justifications."*

### Q3: "Why did you choose Constant P/V for 1,000 L scale-up?"
> **Answer:** *"Mammalian CHO cells lack cell walls and are shear-sensitive. Scaling by constant mixing time requires 85 RPM at 1,000 L, driving tip speed above 2.5 m/s, which causes catastrophic cell lysis. Constant P/V maintains an acceptable tip speed of 1.48 m/s while delivering kLa of 14.8 h⁻¹, perfectly matching the culture's oxygen uptake rate."*
