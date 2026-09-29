# BioCopilot: System Architecture & Data Flow

```mermaid
flowchart TB
    subgraph Data Tier
        D1[Raw Bioreactor CSV] --> D2[Data Adapter & Mapping Engine]
        D2 --> D3[Data Quality & Validation Engine]
        D3 --> D4[(SQLite DB / Telemetry Cache)]
    end

    subgraph Analytics & Modeling Engine
        D4 --> M1[Feature Engineering: Specific Rates & IVCD]
        M1 --> M2[ML Models: Linear Regression, RF, Gradient Boosting]
        M2 --> M3[GroupKFold Batch-Split Validator]
        M2 --> M4[XAI Feature Attributions & Uncertainty Bounds]
        M1 --> M5[Mechanistic Monod Digital Twin]
    end

    subgraph Real-Time Telemetry & Scaling
        D4 --> S1[Virtual Sensor Streamer: 12 Channels @ 2s]
        S1 --> S2[Fault Injection Engine: Overfeed, Surge, Crash]
        S2 --> S3[Metabolic Risk Engine: Alert Categorization]
        M1 --> SC1[Scale-Up Engine: 2 L -> 10 L -> 100 L -> 1,000 L]
        SC1 --> SC2[Regime Evaluator: P/V, Tip Speed, kLa, Mixing Time]
    end

    subgraph Decision Support & Optimization
        M2 & S3 --> OP1[Smart Feed Scheduler: Bounded Scenarios]
        OP1 --> OP2[Media Cost Optimizer: INR / USD Unit Economics]
        OP2 --> OP3[Human-in-the-Loop Approval Queue]
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

## Component Breakdown

1. **Data Tier:** Ingests raw cell culture time-series data, maps columns via fuzzy matching, applies physiological range bounds, and computes a transparent 0-100 data quality score.
2. **Analytics & Modeling Engine:** Derives physiological rates ($q_{glc}, q_{lac}, \mu$), computes cumulative biomass integrals ($IVCD$), and executes multi-horizon forecasting using regressors evaluated on unseen batch holdouts.
3. **Telemetry & Scaling:** Emits 12 bioprocess channels over WebSockets at 2.0-second intervals, injects perturbations on command, and evaluates hydrodynamic scale-up trade-offs across 4 industrial regimes.
4. **Decision Support & Approval:** Generates bounded feeding scenarios, models media formulation economics, and directs all recommendations into an approval gate requiring human sign-off.
5. **Presentation Layer:** Glassmorphic laboratory instrument theme with Plotly scientific visualizations and an automated 16-step guided demo mode.
