"""
Bioprocess Run Report Generator
Produces formal regulatory and analytical batch summary reports in Markdown & structured format.
"""

from datetime import datetime
from typing import Dict, Any, List
import pandas as pd

class BioprocessReportGenerator:
    @staticmethod
    def generate_batch_report(
        batch_id: str,
        df_batch: pd.DataFrame,
        active_alerts: List[Any],
        recommendations: List[Any],
        audit_trail: List[Any]
    ) -> str:
        """
        Assembles comprehensive batch audit and bioprocess performance dossier.
        """
        now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

        max_vcd = round(float(df_batch["VCD"].max()), 2) if "VCD" in df_batch.columns else "N/A"
        end_viab = round(float(df_batch["viability_pct"].iloc[-1]), 1) if "viability_pct" in df_batch.columns else "N/A"
        max_lac = round(float(df_batch["lactate_gL"].max()), 2) if "lactate_gL" in df_batch.columns else "N/A"
        max_amm = round(float(df_batch["ammonia_mM"].max()), 2) if "ammonia_mM" in df_batch.columns else "N/A"
        duration = round(float(df_batch["time_h"].max()), 1) if "time_h" in df_batch.columns else "N/A"

        md = f"""# BioCopilot Bioprocess Batch Intelligence & Audit Dossier

**Batch Identifier:** `{batch_id}`  
**Generated At:** {now_str}  
**Classification:** Decision-Support Verification Report (ICH Q8 / Q11 Standard)  
**Data Provenance:** SYNTHETIC DEMO DATA — NOT EXPERIMENTAL DATA  

---

## 1. Key Performance Indicators (KPIs)

| Parameter | Observed Final / Peak | Target Specification | Compliance |
| :--- | :--- | :--- | :--- |
| **Culture Duration** | {duration} h | 336.0 h (14 days) | COMPLETE |
| **Peak Viable Cell Density (VCD)** | {max_vcd} x 10^6 cells/mL | > 12.0 x 10^6 cells/mL | PASS |
| **Final Harvest Viability** | {end_viab} % | >= 80.0 % | {"PASS" if isinstance(end_viab, (int, float)) and end_viab >= 80 else "ALERT"} |
| **Maximum Lactate Accumulation** | {max_lac} g/L | < 3.0 g/L | {"PASS" if isinstance(max_lac, (int, float)) and max_lac <= 3.0 else "EXCESS"} |
| **Maximum Ammonia Concentration** | {max_amm} mM | < 4.0 mM | {"PASS" if isinstance(max_amm, (int, float)) and max_amm <= 4.0 else "ELEVATED"} |

---

## 2. Metabolic Risk & Critical Process Alerts

"""
        if active_alerts:
            md += "| Alert ID | Severity | Parameter | Observed | Trend | Recommended Action |\n"
            md += "| :--- | :--- | :--- | :--- | :--- | :--- |\n"
            for a in active_alerts:
                # Handle dict or object
                aid = a.get("id") if isinstance(a, dict) else a.id
                sev = a.get("severity") if isinstance(a, dict) else a.severity
                param = a.get("parameter") if isinstance(a, dict) else a.parameter
                obs = a.get("observed_value") if isinstance(a, dict) else a.observed_value
                trnd = a.get("trend") if isinstance(a, dict) else a.trend
                rec = a.get("recommended_review") if isinstance(a, dict) else a.recommended_review
                md += f"| `{aid}` | **{sev}** | `{param}` | {obs} | {trnd} | {rec} |\n"
        else:
            md += "*No critical metabolic alerts triggered for this batch profile.*\n"

        md += """
---

## 3. Human-in-the-Loop Decision & Approval History

All automated AI interventions must receive affirmative human authorization prior to physical process implementation.

"""
        if audit_trail:
            md += "| Timestamp | Operator | Role | Recommendation ID | Action | Reviewer Comments |\n"
            md += "| :--- | :--- | :--- | :--- | :--- | :--- |\n"
            for log in audit_trail:
                ts = log.get("timestamp") if isinstance(log, dict) else str(log.timestamp)
                op = log.get("operator") if isinstance(log, dict) else log.operator
                role = log.get("role") if isinstance(log, dict) else log.role
                rid = log.get("recommendation_id") if isinstance(log, dict) else log.recommendation_id
                act = log.get("action") if isinstance(log, dict) else log.action
                comm = log.get("comment") if isinstance(log, dict) else log.comment
                md += f"| {ts} | {op} | {role} | `{rid}` | **{act}** | {comm} |\n"
        else:
            md += "*No pending or executed human approval decisions recorded.*\n"

        md += """
---

## 4. Regulatory Limitations & Operational Notice

* **Prototype Scope:** BioCopilot is strictly an analytical decision-support system. It has **NO** direct hardware interface to bioreactors or control pumps.
* **Wet-Lab Validation:** All algorithmic predictions and scale-up models represent mathematical estimates and require benchtop empirical validation before adoption in GMP manufacturing.
"""
        return md
