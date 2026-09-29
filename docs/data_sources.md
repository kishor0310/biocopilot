# BioCopilot: Data Sources & Provenance Documentation

**Target Event:** YUVA Megathon 2026 — SRM IST Trichy — Biotech Track  
**Classification:** Transparent Open Data & Biophysical Benchmark Specification  

---

## 1. Primary Benchmark Dataset

| Metadata Field | Specification |
| :--- | :--- |
| **Dataset Name** | BioCopilot CHO-K1 Bioreactor Benchmark Dataset |
| **Identifier** | `biocopilot-cho-benchmark-v1` |
| **Data Nature** | **SYNTHETIC DEMO DATA — NOT EXPERIMENTAL DATA** |
| **Target Organism** | Chinese Hamster Ovary (CHO-K1) suspension culture producing IgG1 mAb |
| **Culture Mode** | Fed-batch stirred-tank bioreactor (2.0 L working volume) |
| **Production Duration** | 336 hours (14 days) |
| **Sampling Interval** | $\Delta t = 2.0$ hours |
| **Total Batches** | 4 distinct cultivation runs (676 telemetry rows total) |
| **License** | Creative Commons Attribution 4.0 International (CC-BY-4.0) |

---

## 2. Cultivation Batch Typology

1. **BATCH-2026-CHO-001 (Control Benchmark):**  
   Standard controlled fed-batch culture with glucose maintained at 2.5–5.0 g/L. Peak VCD reaches 17.2 x 10⁶ cells/mL at hour 216 with harvest viability of 88.5%.
2. **BATCH-2026-CHO-002 (Biological Replicate):**  
   Standard run with ±5% natural stochastic biological variability to evaluate model generalization.
3. **BATCH-2026-CHO-003 (Lactate Overflow Metabolism):**  
   Simulates aggressive glucose feeding (7.0 mL/h) triggering Warburg-like aerobic glycolysis. Lactate surpasses 3.8 g/L, driving premature acidification and early viability decline (74.2% at hour 288).
4. **BATCH-2026-CHO-004 (High-Density Optimized Feed):**  
   Nutrient-controlled feeding protocol achieving high biomass density (>21.0 x 10⁶ cells/mL) with tight metabolite suppression (lactate < 2.0 g/L). Used as holdout test batch for GroupKFold validation.

---

## 3. Canonical Telemetry Variables Monitored

| Variable Name | Canonical Key | Physical Unit | Physiological Safe Bounds |
| :--- | :--- | :--- | :--- |
| Culture Duration | `time_h` | hours | 0.0 – 336.0 h |
| Batch Identifier | `batch_id` | String | - |
| Working Volume | `vessel_volume_L` | Liters | 1.8 – 2.4 L |
| Viable Cell Density | `VCD` | 10⁶ cells/mL | 0.5 – 35.0 x 10⁶ |
| Percent Viability | `viability_pct` | % | 80.0 – 100.0 % |
| Glucose Concentration | `glucose_gL` | g/L | 1.5 – 6.0 g/L |
| Glutamine Concentration | `glutamine_mM` | mM | 1.0 – 5.0 mM |
| Lactate Concentration | `lactate_gL` | g/L | 0.0 – 3.0 g/L |
| Ammonia Concentration | `ammonia_mM` | mM | 0.0 – 4.0 mM |
| Culture pH | `pH` | pH units | 6.80 – 7.20 |
| Dissolved Oxygen | `DO_pct` | % air saturation | 30.0 – 70.0 % |
| Temperature | `temp_C` | °C | 36.5 – 37.2 °C |
| Agitation Speed | `rpm` | RPM | 200 – 350 RPM |
| Aeration Flow | `gas_flow_vvm` | vvm | 0.05 – 0.25 vvm |
| Nutrient Feed Flow | `feed_rate_mL_h` | mL/h | 0.0 – 15.0 mL/h |
| Media Unit Cost | `media_cost_per_L` | Currency / L | - |
