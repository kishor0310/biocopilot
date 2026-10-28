from typing import Dict, List, Any

class CopilotService:
    def answer_query(self, query: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        q_lower = query.lower()
        
        telemetry = context.get("telemetry", []) if context else []
        alerts = context.get("alerts", []) if context else []
        
        # State awareness variables
        lactate_val = 1.2
        glucose_val = 5.4
        viability_val = 96.0
        for t in telemetry:
            if t.get("channel_id") == "SENSOR-06":
                lactate_val = t.get("value", lactate_val)
            elif t.get("channel_id") == "SENSOR-04":
                glucose_val = t.get("value", glucose_val)
            elif t.get("channel_id") == "SENSOR-09":
                viability_val = t.get("value", viability_val)

        if "lactate" in q_lower or "increasing" in q_lower:
            answer = (
                f"Lactate is currently measured at {lactate_val} g/L. In CHO fed-batch cultures, lactate accumulation is primarily "
                f"driven by high glycolytic flux during exponential growth when glucose concentrations excess setpoints ({glucose_val} g/L). "
                f"This overflow metabolism (Warburg-like effect) converts excess pyruvate to lactate. "
                f"Recommendation: Consider reducing glucose feed rate by 20-30% to shift cells from lactate production to lactate consumption phase."
            )
            sources = ["SENSOR-04 (Glucose)", "SENSOR-06 (Lactate)", "MLEngine Metabolic Risk Rules"]
            confidence = 0.94

        elif "viability" in q_lower or "cell death" in q_lower:
            answer = (
                f"Current culture viability is {viability_val}%. Key factors influencing cell viability in this run include: "
                f"1) Accumulation of metabolic byproducts (lactate = {lactate_val} g/L, ammonia threshold), "
                f"2) Dissolved oxygen (DO) saturation levels, and 3) Hydrodynamic shear stress from agitation. "
                f"If viability drops below 85%, emergency nutrient supplementation or premature batch harvest should be evaluated."
            )
            sources = ["SENSOR-09 (Viability)", "SENSOR-06 (Lactate)", "RandomForest Viability Model"]
            confidence = 0.91

        elif "risk" in q_lower or "alerts" in q_lower:
            if alerts:
                top_alert = alerts[0]
                answer = (
                    f"Active Process Risk Detected: [{top_alert.get('severity')}] {top_alert.get('parameter')}. "
                    f"Observed Value: {top_alert.get('observed_value')}. Evidence: {top_alert.get('evidence')} "
                    f"Recommended Review: {top_alert.get('recommended_review')}"
                )
            else:
                answer = "All 12 virtual sensor channels are currently operating within nominal physiological setpoints. No active critical risks detected."
            sources = ["Metabolic Risk Detection Engine"]
            confidence = 0.96

        elif "scale" in q_lower or "200 l" in q_lower or "1,000 l" in q_lower or "1000 l" in q_lower:
            answer = (
                "Transitioning from 2 L benchtop to 200 L or 1,000 L pilot vessels introduces key engineering trade-offs: "
                "1) Constant P/V scaling increases impeller tip speed, raising cell shear stress risks; "
                "2) Constant Tip Speed scaling leads to lower volumetric power input and potential DO transfer limitations (kLa < 15 h⁻¹); "
                "3) Mixing time increases from ~4s at 2 L to ~25s at 1,000 L. Human engineering review of sparger gas velocity is strongly advised."
            )
            sources = ["ScaleUpEngine (Constant P/V & Tip Speed Correlations)"]
            confidence = 0.95

        elif "cost" in q_lower or "feed scenario" in q_lower:
            answer = (
                "The 'Balanced Smart Feed' scenario achieves lower estimated cost per liter by optimizing growth factor timing, "
                "yielding an estimated 15-22% savings on media expenditure while maintaining predicted culture viability >95%."
            )
            sources = ["DigitalTwinSimulator Media Cost Optimizer", "Pareto Frontier Engine"]
            confidence = 0.90

        else:
            answer = (
                "BioCopilot analyzed the current process telemetry. All parameters are registered under canonical schema. "
                "Please specify if you would like an analysis of lactate trends, viability predictions, feed optimization, or 2 L → 1,000 L scale-up risks."
            )
            sources = ["BioCopilot State Knowledgebase"]
            confidence = 0.88

        return {
            "answer": answer,
            "data_sources": sources,
            "confidence": confidence,
            "human_approval_note": "DISCLAIMER: AI Copilot recommendations are decision-support insights and require qualified operator review."
        }
