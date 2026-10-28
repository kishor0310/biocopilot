import React, { useState } from 'react';
import { FileText, Download, Printer, CheckCircle } from 'lucide-react';

export const ReportPage: React.FC = () => {
  const [downloaded, setDownloaded] = useState(false);

  const reportText = `
# BioCopilot Bioprocess Decision Support Report
**Target Event:** YUVA Megathon 2026 — Biotech Track  
**Batch ID:** Batch_02_LactateStress  
**Vessel Scale:** 2.0 L Benchtop Bioreactor  
**Generated Date:** ${new Date().toISOString().split('T')[0]}  
**Provenance:** SYNTHETIC DEMO DATA — NOT EXPERIMENTAL DATA  

---

## 1. Executive Summary
BioCopilot executed real-time telemetry monitoring, data quality validation, metabolic risk detection, and feed schedule optimization for CHO cell fed-batch run Batch_02_LactateStress.

- **Data Quality Score:** 96.0% (Passed physiological range checks: pH 6.8-7.4, Viability 0-100%)
- **Peak VCD Achieved:** 14.8 x 10⁶ cells/mL
- **Harvest Culture Viability:** 92.4%
- **Active Risk Detected:** High Severity Lactate Accumulation (3.2 g/L) following glucose overfeed event.

---

## 2. Machine Learning & Explainable AI Summary
- **Primary Forecast Target:** Future 24h Viable Cell Density (VCD) & Viability.
- **Model Algorithm:** Random Forest Regressor (Batch-Split Evaluation).
- **Validation Metrics:** MAE = 0.142, RMSE = 0.185, R² = 0.912.
- **SHAP Top Feature Drivers:**
  1. \`glucose_gL\` (35.0% model impact)
  2. \`ivcd\` (28.0% model impact)
  3. \`lactate_gL\` (22.0% model impact)
*Note: Model contribution represents statistical association and does not prove biological causation.*

---

## 3. Scale-Up Engineering Assessment (2 L → 1,000 L)
- **Scaling Strategy:** Constant Power/Volume ($P/V = 55.4 \\text{ W/m}^3$).
- **1,000 L Vessel Agitation:** 68.4 RPM (Impeller Tip Speed: 1.85 m/s).
- **Reynolds Number:** Re = 42,500 (Turbulent regime).
- **Estimated Mass Transfer ($k_L a$):** 28.5 h⁻¹ (DO limitation risk: LOW).
*Disclaimer: All scaling parameters are engineering estimates requiring wet-lab validation.*

---

## 4. Human Approval & Audit Record
- **Recommendation ID:** REC-2026-001
- **Recommendation Title:** Reduce Nutrient Feed Rate by 25% to Mitigate Lactate Accumulation.
- **Status:** APPROVED
- **Reviewing Operator:** Op_Engineer_01
- **Operator Rationale:** "Approved following metabolic review. Prevents glucose overflow while maintaining culture viability >94%."
  `;

  const handleDownload = () => {
    const blob = new Blob([reportText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'BioCopilot_Bioprocess_Report_Batch_02.md';
    a.click();
    setDownloaded(true);
  };

  return (
    <div className="space-y-6 py-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <FileText className="w-6 h-6 text-teal-600" />
            <span>Bioprocess Decision Support Report</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Export complete process decision logs, ML metrics, scale-up matrix, and human audit trail.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleDownload}
            className="flex items-center space-x-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>DOWNLOAD REPORT (.MD)</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl border border-slate-300 dark:border-slate-700 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>PRINT / SAVE PDF</span>
          </button>
        </div>
      </div>

      {downloaded && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-300 flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>Report exported successfully! File saved as BioCopilot_Bioprocess_Report_Batch_02.md</span>
        </div>
      )}

      {/* Report Document Preview */}
      <div className="p-8 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
        {reportText}
      </div>
    </div>
  );
};
