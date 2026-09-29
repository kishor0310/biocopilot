# BioCopilot: Scientific Scope, Operational Boundaries & Limitations

**Standard:** ISO 13485 / FDA 21 CFR Part 11 / GAMP 5 Category 4 Configured Software  
**Status:** Competition-Ready Prototype & Decision-Support System  

---

## 1. System Intent & Non-Clinical Disclaimer

BioCopilot is designed exclusively as an **in-silico decision-support tool** for bioprocess development teams. It serves as an analytical companion to aid scientists in spotting process drift, anticipating byproduct surges, exploring feed schedules, and sizing large-scale bioreactors.

> [!WARNING]
> **NO DIRECT HARDWARE CONTROL:**  
> BioCopilot does NOT interface directly with bioreactor programmable logic controllers (PLCs), peristaltic pumps, mass flow controllers, or electrical actuation systems. Under no circumstances should algorithmic outputs be wired directly to laboratory hardware without intermediate qualified human review.

---

## 2. Core Scientific Limitations

### 1. Dataset Dependencies & Range Extrapolation
* The predictive models (Linear Regression, Random Forest, Gradient Boosting) are trained on specific operational envelopes (0 to 336 hours, 2 L working volume, CHO-K1 cell lines).
* Predictions generated outside of these training envelopes (e.g. microbial fermentation, perfusion bioprocesses, or viral vector production) represent unverified extrapolations.

### 2. Synthetic Data Disclosure
* The benchmark dataset (`cho_fedbatch_processed.csv`) was synthesized using biophysically calibrated Monod and metabolic inhibition kinetics to model typical industrial Chinese Hamster Ovary (CHO) culture behavior.
* **SYNTHETIC DEMO DATA — NOT EXPERIMENTAL DATA.** Synthetic datasets do not exhibit the full stochastic noise, clonal drift, or epigenetic variability of physical biological systems.

### 3. Hydrodynamic Scale-Up Approximations
* Scale-up calculations (2 L → 10 L → 100 L → 1,000 L) are based on standard bioprocess dimensional analysis:
  $$P/V = \frac{N_p \rho N^3 D^5}{V}, \quad v_{tip} = \pi N D, \quad k_L a = k (P/V)^a (v_{gas})^b$$
* These equations assume geometric similarity ($H/T = 1.5, D/T = 0.33$) and uniform fluid properties. Real-world bioreactors exhibit non-ideal flow patterns, dead zones, impeller baffle interactions, and hydrostatic pressure gradients that require empirical CFD or wet-lab validation.

### 4. Mechanistic Digital Twin vs. Biological Reality
* The internal digital twin approximates cell growth, death, substrate uptake, and byproduct inhibition using coupled ordinary differential equations.
* This model is an approximation of central carbon metabolism and does not account for complex cellular signaling, post-translational modifications (e.g. antibody glycosylation patterns), or nutrient micro-heterogeneity.

### 5. Statistical Correlation vs. Biological Causation
* Feature importances (SHAP / tree feature attributions) reflect the statistical weight assigned by the machine learning regressor.
* While a rising lactate signal strongly associates with a predicted viability decrease, **model correlation does not prove biological causation**. Intracellular mechanisms must be verified experimentally.

### 6. Media Economic Calculations
* All media cost calculations (cost per liter, cost per billion cells, savings percentage) are derived mathematically from user-specified price and usage tables.
* Market prices for raw chemicals, growth factors, and serum-free feeds fluctuate geographically and across suppliers.

---

## 3. Mandatory Operator Responsibilities

1. **Human-in-the-Loop Sign-Off:** Every feed modulation, agitation change, or operational recommendation must be reviewed and approved by a qualified bioprocess technician or lead engineer.
2. **Empirical Benchtop Validation:** Small-scale (shake flask / 2L benchtop) experimental confirmation is strictly required prior to pilot-plant or commercial-scale deployment.
