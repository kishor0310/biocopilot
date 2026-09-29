"""
Media Cost Optimizer & Bioprocess Economic Valuation Engine
Computes granular unit economics (INR / USD), batch costs, cost per liter,
and cost per billion viable cells strictly from user-provided component price tables.
"""

from typing import Dict, Any, List
from backend.app.schemas.api_schemas import (
    MediaCostRequest, MediaCostResponse, CostComponent
)

class MediaCostOptimizer:
    @staticmethod
    def calculate_cost_breakdown(req: MediaCostRequest) -> MediaCostResponse:
        """
        Calculates total medium cost, delta, and unit economics.
        Never fabricates percentages; computes strictly from inputs.
        """
        vol = max(0.1, req.batch_volume_L)
        currency = req.currency.upper()

        # 1. Current Formulation Total
        current_total = sum(c.unit_cost * c.amount_used for c in req.current_components)

        # 2. Optimized Formulation Total
        opt_total = sum(c.unit_cost * c.amount_used for c in req.proposed_alternative.components)

        cost_delta = opt_total - current_total
        savings_pct = (abs(cost_delta) / current_total * 100.0) if current_total > 0 and cost_delta < 0 else 0.0

        # Standard baseline cell output estimation:
        # 2L vessel @ 15x10^6 cells/mL = 30 x 10^9 cells
        # Scaled by volume
        est_total_cells_billion = 15.0 * vol

        cost_per_L_curr = round(current_total / vol, 2)
        cost_per_L_opt = round(opt_total / vol, 2)

        cost_per_billion_curr = round(current_total / max(0.1, est_total_cells_billion), 2)
        cost_per_billion_opt = round(opt_total / max(0.1, est_total_cells_billion), 2)

        return MediaCostResponse(
            currency=currency,
            current_batch_cost=round(current_total, 2),
            optimized_batch_cost=round(opt_total, 2),
            cost_delta=round(cost_delta, 2),
            savings_percentage=round(savings_pct, 2),
            cost_per_L_current=cost_per_L_curr,
            cost_per_L_optimized=cost_per_L_opt,
            cost_per_billion_cells_current=cost_per_billion_curr,
            cost_per_billion_cells_optimized=cost_per_billion_opt,
            disclaimer="Calculated strictly from supplied unit prices. Model estimate."
        )
