"""
BioCopilot Canonical Bioprocess Schema and Data Contracts
Adheres strictly to bioprocess domain nomenclature and physiological ranges.
"""

from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field

CANONICAL_VARIABLES = [
    "time_h",
    "batch_id",
    "vessel_volume_L",
    "VCD",
    "viability_pct",
    "glucose_gL",
    "glutamine_mM",
    "lactate_gL",
    "ammonia_mM",
    "pH",
    "DO_pct",
    "temp_C",
    "rpm",
    "gas_flow_vvm",
    "feed_rate_mL_h",
    "media_cost_per_L",
]

# Canonical display units
CANONICAL_UNITS: Dict[str, str] = {
    "time_h": "h",
    "batch_id": "ID",
    "vessel_volume_L": "L",
    "VCD": "10^6 cells/mL",
    "viability_pct": "%",
    "glucose_gL": "g/L",
    "glutamine_mM": "mM",
    "lactate_gL": "g/L",
    "ammonia_mM": "mM",
    "pH": "pH",
    "DO_pct": "%",
    "temp_C": "°C",
    "rpm": "RPM",
    "gas_flow_vvm": "vvm",
    "feed_rate_mL_h": "mL/h",
    "media_cost_per_L": "Currency/L",
}

# Configurable physiological ranges for CHO cell culture validation
PHYSIOLOGICAL_RANGES: Dict[str, Dict[str, float]] = {
    "pH": {"min": 6.4, "max": 7.8, "optimal_min": 6.8, "optimal_max": 7.2},
    "viability_pct": {"min": 0.0, "max": 100.0, "optimal_min": 85.0, "optimal_max": 100.0},
    "temp_C": {"min": 30.0, "max": 40.0, "optimal_min": 36.5, "optimal_max": 37.2},
    "DO_pct": {"min": 0.0, "max": 150.0, "optimal_min": 30.0, "optimal_max": 60.0},
    "glucose_gL": {"min": 0.0, "max": 20.0, "optimal_min": 1.5, "optimal_max": 5.5},
    "glutamine_mM": {"min": 0.0, "max": 15.0, "optimal_min": 1.0, "optimal_max": 4.5},
    "lactate_gL": {"min": 0.0, "max": 12.0, "optimal_min": 0.0, "optimal_max": 2.5},
    "ammonia_mM": {"min": 0.0, "max": 15.0, "optimal_min": 0.0, "optimal_max": 4.0},
    "VCD": {"min": 0.0, "max": 60.0, "optimal_min": 0.5, "optimal_max": 35.0},
    "rpm": {"min": 20.0, "max": 600.0, "optimal_min": 150.0, "optimal_max": 350.0},
    "gas_flow_vvm": {"min": 0.0, "max": 1.0, "optimal_min": 0.05, "optimal_max": 0.25},
    "feed_rate_mL_h": {"min": 0.0, "max": 100.0, "optimal_min": 1.0, "optimal_max": 20.0},
}

DEFAULT_FUZZY_MAPPINGS: Dict[str, str] = {
    "time": "time_h",
    "time_h": "time_h",
    "time_hr": "time_h",
    "hours": "time_h",
    "batch": "batch_id",
    "batch_id": "batch_id",
    "run_id": "batch_id",
    "batch_run_id": "batch_id",
    "volume": "vessel_volume_L",
    "vessel_vol_l": "vessel_volume_L",
    "vessel_volume_l": "vessel_volume_L",
    "vcd": "VCD",
    "viable_cell_density": "VCD",
    "cell_density": "VCD",
    "viable_cell_density_1e6_ml": "VCD",
    "viability": "viability_pct",
    "viab": "viability_pct",
    "viability_pct": "viability_pct",
    "viability_percent": "viability_pct",
    "glucose": "glucose_gL",
    "gluc": "glucose_gL",
    "glucose_gl": "glucose_gL",
    "glucose_conc_g_l": "glucose_gL",
    "glutamine": "glutamine_mM",
    "gln": "glutamine_mM",
    "glutamine_mm": "glutamine_mM",
    "glutamine_conc_mm": "glutamine_mM",
    "lactate": "lactate_gL",
    "lac": "lactate_gL",
    "lactate_gl": "lactate_gL",
    "lactate_conc_g_l": "lactate_gL",
    "ammonia": "ammonia_mM",
    "nh3": "ammonia_mM",
    "nh4": "ammonia_mM",
    "ammonia_mm": "ammonia_mM",
    "ammonia_conc_mm": "ammonia_mM",
    "ph": "pH",
    "culture_ph": "pH",
    "do": "DO_pct",
    "do_pct": "DO_pct",
    "dissolved_oxygen": "DO_pct",
    "dissolved_oxygen_pct": "DO_pct",
    "temp": "temp_C",
    "temp_c": "temp_C",
    "temperature": "temp_C",
    "temperature_c": "temp_C",
    "rpm": "rpm",
    "agitation": "rpm",
    "agitation_rpm": "rpm",
    "gas_flow": "gas_flow_vvm",
    "gas_flow_vvm": "gas_flow_vvm",
    "aeration_vvm": "gas_flow_vvm",
    "feed": "feed_rate_mL_h",
    "feed_rate": "feed_rate_mL_h",
    "feed_rate_ml_h": "feed_rate_mL_h",
    "feed_flow_ml_hr": "feed_rate_mL_h",
    "media_cost": "media_cost_per_L",
    "media_cost_per_l": "media_cost_per_L",
    "medium_cost_per_l": "media_cost_per_L",
}

class BioprocessDataPoint(BaseModel):
    time_h: float
    batch_id: str
    vessel_volume_L: Optional[float] = 2.0
    VCD: Optional[float] = None
    viability_pct: Optional[float] = None
    glucose_gL: Optional[float] = None
    glutamine_mM: Optional[float] = None
    lactate_gL: Optional[float] = None
    ammonia_mM: Optional[float] = None
    pH: Optional[float] = None
    DO_pct: Optional[float] = None
    temp_C: Optional[float] = None
    rpm: Optional[float] = None
    gas_flow_vvm: Optional[float] = None
    feed_rate_mL_h: Optional[float] = None
    media_cost_per_L: Optional[float] = None
