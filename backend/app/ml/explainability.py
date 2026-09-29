"""
Explainable AI (XAI) Attribution Engine for Bioprocess Predictions
Computes feature attributions while maintaining strict scientific distinction
between statistical model contribution and biological causation.
"""

from typing import List, Dict, Any, Optional
import numpy as np

FEATURE_DESCRIPTIONS = {
    "lactate_gL": {
        "positive": "Elevated lactate accumulation correlates with higher predicted metabolic stress.",
        "negative": "Higher lactate is strongly associated in the model with downward viability trajectory.",
    },
    "glucose_gL": {
        "positive": "Sufficient residual glucose supports continuous viable cell maintenance.",
        "negative": "Substrate limitation or excessive overfeed drives metabolic shift in the model.",
    },
    "q_glucose": {
        "positive": "Active specific glucose uptake rate indicates energetic metabolic flux.",
        "negative": "Low uptake rate signals early transition toward stationary or decline phase.",
    },
    "q_lactate": {
        "positive": "Net lactate accumulation rate reflects glycolytic overflow metabolism.",
        "negative": "Negative lactate production rate indicates metabolic shift toward lactate consumption.",
    },
    "mu_growth_rate": {
        "positive": "Positive specific growth rate drives exponential biomass accumulation.",
        "negative": "Decelerating growth rate associates with nutrient depletion or inhibitor build-up.",
    },
    "IVCD": {
        "positive": "High cumulative cell-time integral indicates mature, productive culture state.",
        "negative": "Lower integral biomass indicates delayed inoculation recovery.",
    },
    "ammonia_mM": {
        "positive": "Elevated ammonium ions correlate with cellular stress and protein glycosylation impact.",
        "negative": "Ammonia concentration approaching toxicity threshold (4.0 mM) associates with viability drop.",
    },
    "pH": {
        "positive": "Stable physiological pH (6.8 - 7.2) correlates with enzymatic equilibrium.",
        "negative": "Acidic or alkaline shift associates with suboptimal enzyme kinetics.",
    },
    "feed_rate_mL_h": {
        "positive": "Nutrient feed rate delivers concentrated glucose and amino acid supplementation.",
        "negative": "Feed reduction associated with substrate starvation in predictive model.",
    }
}

class BioprocessExplainer:
    @staticmethod
    def explain_prediction(
        target: str,
        feature_names: List[str],
        model_payload: Any,
        input_vector: np.ndarray,
        top_k: int = 4
    ) -> Dict[str, Any]:
        """
        Calculates feature attributions and generates scientifically truthful domain rationale.
        """
        model = model_payload.get("model")
        attributions = []

        importances = None
        if hasattr(model, "feature_importances_"):
            importances = model.feature_importances_
        elif hasattr(model, "coef_"):
            importances = np.abs(model.coef_)
        else:
            # Fallback uniform baseline
            importances = np.ones(len(feature_names)) / len(feature_names)

        # Normalize importances
        total_imp = np.sum(importances)
        norm_imp = (importances / total_imp) if total_imp > 0 else importances

        # Sort indices
        sorted_indices = np.argsort(norm_imp)[::-1]

        for idx in sorted_indices[:top_k]:
            fname = feature_names[idx]
            imp_val = float(norm_imp[idx])
            val = float(input_vector[idx]) if idx < len(input_vector) else 0.0

            # Determine direction
            direction = "positive"
            if target == "viability_pct" and ("lactate" in fname or "ammonia" in fname):
                direction = "negative"
            elif "q_lactate" in fname and val > 0:
                direction = "negative" if target == "viability_pct" else "positive"
            elif "glucose" in fname and val < 1.5:
                direction = "negative"

            desc_dict = FEATURE_DESCRIPTIONS.get(fname, {})
            desc = desc_dict.get(
                direction,
                f"Feature `{fname}` (value: {round(val, 2)}) contributes {round(imp_val * 100, 1)}% relative importance to {target} forecast."
            )

            attributions.append({
                "feature": fname,
                "importance": round(imp_val, 3),
                "direction": direction,
                "description": desc
            })

        return {
            "target": target,
            "disclaimer": "STATISTICAL MODEL CONTRIBUTION — DOES NOT PROVE BIOLOGICAL CAUSATION",
            "top_contributing_features": attributions
        }
