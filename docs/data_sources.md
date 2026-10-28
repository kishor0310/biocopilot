# BioCopilot Data Sources & Provenance

## Data Ingestion Policy
BioCopilot prioritizes verified public bioprocess datasets while supporting custom user CSV upload.

---

## Benchmark Datasets

### 1. CHO-Cell Fed-Batch Bioprocess Telemetry (Demo Dataset)
- **Identifier:** `cho_fedbatch_2026_demo`
- **Source:** Kaggle / Synthetic Bioprocess Telemetry Generator
- **License:** CC-BY-4.0
- **Variables Included:**
  - `time_h` (0 to 240 hours)
  - `batch_id` (`Batch_01_Control`, `Batch_02_LactateStress`, `Batch_03_Optimized`)
  - `vessel_volume_L` (2.0 L benchtop scale)
  - `VCD` (Viable Cell Density, $10^6 \text{ cells/mL}$)
  - `viability_pct` (%)
  - `glucose_gL` (g/L)
  - `glutamine_mM` (mM)
  - `lactate_gL` (g/L)
  - `ammonia_mM` (mM)
  - `pH`
  - `DO_pct` (%)
  - `temp_C` (°C)
  - `rpm` (RPM)
  - `gas_flow_vvm` (VVM)
  - `feed_rate_mL_h` (mL/h)
  - `media_cost_per_L` (USD/L)

### 2. Custom User Upload Adapter
- Ingests arbitrary CSV files containing bioprocess telemetry.
- Performs fuzzy column matching against BioCopilot Canonical Schema.
- Requires explicit user confirmation of column and unit mappings before processing.
