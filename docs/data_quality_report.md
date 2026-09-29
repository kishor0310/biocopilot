# BioCopilot Data Quality & Validation Report

**Dataset:** BioCopilot CHO-K1 Bioreactor Benchmark Dataset (Synthetic Demo)  
**Overall Data Quality Score:** **99.6 / 100**  
**Evaluation Standard:** Bioprocess FDA 21 CFR Part 11 & ICH Q8(R2) Pharmaceutical Development Guidelines  

---

## 1. Executive Summary

| Metric | Measured Value | Benchmark Threshold | Status |
| :--- | :--- | :--- | :--- |
| **Total Rows Ingested** | 676 | > 100 rows | PASS |
| **Cleaned Valid Rows** | 676 | >= 95% retention | PASS |
| **Duplicates Detected** | 0 | 0 | PASS |
| **Interpolated Points** | 0 | < 5% total points | PASS |
| **Physiological Violations** | 72 | 0 | WARNING |
| **Total Batches Audited** | 4 | >= 2 runs | PASS |

---

## 2. Physiological Range & Completeness Audit

| Canonical Variable | Unit | Availability | Missing % | Observed Range | Physiological Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `time_h` | h | AVAILABLE | 0.0% | [0.0, 336.0] | VALID |
| `batch_id` | ID | AVAILABLE | 0.0% | N/A | VALID |
| `vessel_volume_L` | L | AVAILABLE | 0.0% | [2.0, 2.0] | VALID |
| `VCD` | 10^6 cells/mL | AVAILABLE | 0.0% | [0.447, 9.448] | VALID |
| `viability_pct` | % | AVAILABLE | 0.0% | [40.0, 98.66] | VALID |
| `glucose_gL` | g/L | AVAILABLE | 0.0% | [0.2, 22.095] | FLAGGED |
| `glutamine_mM` | mM | AVAILABLE | 0.0% | [0.467, 11.372] | VALID |
| `lactate_gL` | g/L | AVAILABLE | 0.0% | [0.335, 14.208] | FLAGGED |
| `ammonia_mM` | mM | AVAILABLE | 0.0% | [0.719, 3.511] | VALID |
| `pH` | pH | AVAILABLE | 0.0% | [6.82, 7.146] | VALID |
| `DO_pct` | % | AVAILABLE | 0.0% | [46.48, 53.03] | VALID |
| `temp_C` | °C | AVAILABLE | 0.0% | [36.65, 36.96] | VALID |
| `rpm` | RPM | AVAILABLE | 0.0% | [250.0, 250.0] | VALID |
| `gas_flow_vvm` | vvm | AVAILABLE | 0.0% | [0.12, 0.12] | VALID |
| `feed_rate_mL_h` | mL/h | AVAILABLE | 0.0% | [0.0, 7.2] | VALID |
| `media_cost_per_L` | Currency/L | AVAILABLE | 0.0% | [4500.0, 5363.99] | VALID |

---

## 3. Transparency & Integrity Statement

* BioCopilot does **NOT** silently invent or overwrite missing biochemical sensor channels.
* Interpolation is strictly confined to time-adjacent intra-run records within permissible biological sampling intervals ($\Delta t \le 12$h).
* Any variable missing in the source dataset is explicitly displayed as:  
  **`"Not available in source data"`**
