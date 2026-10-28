# BioCopilot Limitations & Scientific Disclaimers

The BioCopilot application is designed solely as an **Explainable Decision-Support System** for bioprocess research and scale-up planning.

---

## Explicit Platform Limitations

1. **Decision-Support Only:** BioCopilot does NOT directly connect to, actuate, or control physical laboratory equipment or bioreactors.
2. **Human Approval Mandatory:** All recommended feed schedules, media alterations, and scale-up parameters require review and explicit approval by qualified human bioprocess engineers.
3. **Data Dependency:** Machine learning prediction accuracy depends strictly on the volume, quality, and representativeness of historical batch data.
4. **Synthetic Telemetry Labelling:** Pre-packaged demo datasets and real-time virtual sensor streams are generated for demonstration purposes and are explicitly tagged:  
   `SYNTHETIC DEMO DATA — NOT EXPERIMENTAL DATA`
5. **Engineering Approximations:** Scale-up equations (constant $P/V$, tip speed, $k_L a$, mixing time) rely on standard hydrodynamic correlations and must be labeled:  
   `ENGINEERING ESTIMATE — REQUIRES VALIDATION`
6. **Digital Twin Approximation:** The Monod-type kinetic model is a simplified ODE approximation and does not replace empirical cell-line characterization.
7. **Model Correlation vs Biological Causation:** SHAP and feature importance values indicate statistical association within trained models, not proven biological causation.
8. **Cost Calculations:** Media cost savings and Pareto frontiers depend entirely on user-editable input pricing tables.
9. **Wet-Lab Validation:** All optimized feed strategies and scale-up parameters must undergo empirical wet-lab validation prior to clinical or manufacturing deployment.
