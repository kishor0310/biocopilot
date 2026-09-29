"""
Metabolic Risk Engine for Bioprocess Monitoring
Detects metabolic imbalances, substrate depletion/overflow, and sensor anomalies.
Produces structured alerts with clinical bioprocess evidence and recommended reviews.
"""

import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
from backend.app.schemas.api_schemas import BioprocessAlert

class MetabolicRiskEngine:
    @staticmethod
    def evaluate_process_state(
        batch_id: str,
        state: Dict[str, float],
        previous_state: Optional[Dict[str, float]] = None
    ) -> List[BioprocessAlert]:
        """
        Audits current biochemical state and generates structured decision-support alerts.
        """
        alerts: List[BioprocessAlert] = []
        now_iso = datetime.utcnow().isoformat() + "Z"

        # 1. Lactate Accumulation & Overflow Metabolism
        lac = state.get("lactate_gL", 0.0)
        glc = state.get("glucose_gL", 0.0)
        prev_lac = previous_state.get("lactate_gL", lac) if previous_state else lac
        lac_trend = lac - prev_lac

        if lac >= 3.5:
            alerts.append(BioprocessAlert(
                id=f"ALT-LAC-{uuid.uuid4().hex[:6].upper()}",
                timestamp=now_iso,
                severity="CRITICAL",
                parameter="lactate_gL",
                observed_value=round(lac, 2),
                threshold=3.5,
                trend=f"rising (+{round(lac_trend, 2)} g/L)" if lac_trend > 0 else "elevated",
                evidence="Lactate accumulation exceeds critical toxicity threshold (3.5 g/L), triggering intracellular acidification and growth arrest.",
                possible_driver="Glycolytic overflow metabolism driven by excessive glucose feeding during stationary phase.",
                predicted_impact="Viability projected to drop below 80% within 24-36 hours due to osmotic and metabolic stress.",
                recommended_review="Consider immediate feed rate reduction (e.g. from 6.0 to 4.2 mL/h) to force metabolic shift toward lactate consumption.",
                confidence=0.95
            ))
        elif lac >= 2.6:
            alerts.append(BioprocessAlert(
                id=f"ALT-LAC-{uuid.uuid4().hex[:6].upper()}",
                timestamp=now_iso,
                severity="HIGH",
                parameter="lactate_gL",
                observed_value=round(lac, 2),
                threshold=2.6,
                trend="moderately increasing",
                evidence="Lactate concentration is trending above normal baseline (2.6 g/L).",
                possible_driver="Partial aerobic glycolysis; carbon flux exceeds pyruvate dehydrogenase capacity.",
                predicted_impact="Risk of culture acidification and medium buffering exhaustion.",
                recommended_review="Review current glucose feed trajectory to prevent overflow.",
                confidence=0.88
            ))

        # 2. Glucose Depletion or Overfeed
        if glc <= 1.0:
            alerts.append(BioprocessAlert(
                id=f"ALT-GLC-{uuid.uuid4().hex[:6].upper()}",
                timestamp=now_iso,
                severity="CRITICAL",
                parameter="glucose_gL",
                observed_value=round(glc, 2),
                threshold=1.0,
                trend="depleted",
                evidence="Residual glucose fell to or below 1.0 g/L, risking severe energetic starvation and premature apoptosis.",
                possible_driver="Biomass consumption rate outpaced scheduled feed pump rate.",
                predicted_impact="Rapid apoptotic cell death cascade and batch termination.",
                recommended_review="Initiate targeted glucose bolus addition immediately.",
                confidence=0.98
            ))
        elif glc >= 6.5:
            alerts.append(BioprocessAlert(
                id=f"ALT-GLC-{uuid.uuid4().hex[:6].upper()}",
                timestamp=now_iso,
                severity="MEDIUM",
                parameter="glucose_gL",
                observed_value=round(glc, 2),
                threshold=6.5,
                trend="excessive",
                evidence=f"Residual glucose measured at {round(glc, 2)} g/L (upper recommended limit: 6.0 g/L).",
                possible_driver="Over-feeding bolus during low specific uptake phase.",
                predicted_impact="Elevated culture osmolality (>340 mOsm/kg) and stimulation of byproduct overflow.",
                recommended_review="Pause or reduce feed pump rate until glucose drops into 2.5 - 4.5 g/L window.",
                confidence=0.91
            ))

        # 3. Ammonia Toxicity
        amm = state.get("ammonia_mM", 0.0)
        if amm >= 4.5:
            alerts.append(BioprocessAlert(
                id=f"ALT-AMM-{uuid.uuid4().hex[:6].upper()}",
                timestamp=now_iso,
                severity="HIGH",
                parameter="ammonia_mM",
                observed_value=round(amm, 2),
                threshold=4.5,
                trend="inhibitory accumulation",
                evidence=f"Ammonia level reached {round(amm, 2)} mM, approaching mammalian cytotoxicity threshold.",
                possible_driver="Deamination of excess glutamine or amino acid catabolism.",
                predicted_impact="Impairment of monoclonal antibody sialylation and glycosylation micro-heterogeneity.",
                recommended_review="Switch to glutamine-free or dipeptide feed formulation.",
                confidence=0.92
            ))

        # 4. Viability Collapse
        viab = state.get("viability_pct", 100.0)
        if viab <= 80.0:
            alerts.append(BioprocessAlert(
                id=f"ALT-VCD-{uuid.uuid4().hex[:6].upper()}",
                timestamp=now_iso,
                severity="CRITICAL",
                parameter="viability_pct",
                observed_value=round(viab, 1),
                threshold=80.0,
                trend="declining",
                evidence=f"Culture viability has dropped to {round(viab, 1)}% (regulatory alert limit: 85%).",
                possible_driver="Accumulated cellular stress, protease release, and programmed cell death.",
                predicted_impact="Substantial release of host cell proteins (HCP) and degradation of recombinant product.",
                recommended_review="Evaluate batch harvest criteria; downstream purification may be compromised.",
                confidence=0.96
            ))

        # 5. Dissolved Oxygen (DO) Limitation
        do = state.get("DO_pct", 50.0)
        if do <= 25.0:
            alerts.append(BioprocessAlert(
                id=f"ALT-DO-{uuid.uuid4().hex[:6].upper()}",
                timestamp=now_iso,
                severity="HIGH",
                parameter="DO_pct",
                observed_value=round(do, 1),
                threshold=25.0,
                trend="hypoxic limitation",
                evidence=f"Dissolved oxygen level depressed at {round(do, 1)}% (target setpoint: 40-50%).",
                possible_driver="High oxygen uptake rate exceeding sparger kLa capacity, or gas blend enrichment lag.",
                predicted_impact="Induction of anaerobic metabolic pathways and rapid lactate generation.",
                recommended_review="Increase agitation RPM or enrich O2 fraction in sparged gas flow.",
                confidence=0.93
            ))

        # 6. pH Drift
        ph = state.get("pH", 7.0)
        if ph < 6.75 or ph > 7.35:
            alerts.append(BioprocessAlert(
                id=f"ALT-PH-{uuid.uuid4().hex[:6].upper()}",
                timestamp=now_iso,
                severity="MEDIUM",
                parameter="pH",
                observed_value=round(ph, 2),
                threshold=6.75 if ph < 6.75 else 7.35,
                trend="out-of-specification drift",
                evidence=f"Culture pH at {round(ph, 2)} deviates from controlled window (6.80 - 7.20).",
                possible_driver="Acid accumulation or base pump exhaustion / probe drift.",
                predicted_impact="Altered enzyme kinetics and protein structural conformation.",
                recommended_review="Verify pH calibration and check base titrant reservoir level.",
                confidence=0.90
            ))

        return alerts
