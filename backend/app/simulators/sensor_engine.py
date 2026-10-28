import time
import math
import random
from typing import Dict, List, Any

class SensorEngine:
    def __init__(self):
        self.tick = 0
        self.active_fault = None
        self.fault_intensity = 1.0
        self.fault_start_tick = 0
        
        # Base values for a healthy mid-exponential fed-batch bioreactor
        self.base_sensors = {
            "SENSOR-01": {"name": "pH", "val": 7.12, "unit": "pH", "min": 6.80, "max": 7.40},
            "SENSOR-02": {"name": "DO (Dissolved Oxygen)", "val": 42.5, "unit": "%", "min": 30.0, "max": 60.0},
            "SENSOR-03": {"name": "Temperature", "val": 36.8, "unit": "°C", "min": 36.5, "max": 37.2},
            "SENSOR-04": {"name": "Glucose", "val": 5.40, "unit": "g/L", "min": 2.00, "max": 8.00},
            "SENSOR-05": {"name": "Glutamine", "val": 3.10, "unit": "mM", "min": 1.00, "max": 5.00},
            "SENSOR-06": {"name": "Lactate", "val": 1.10, "unit": "g/L", "min": 0.00, "max": 2.50},
            "SENSOR-07": {"name": "Ammonia", "val": 1.20, "unit": "mM", "min": 0.00, "max": 3.00},
            "SENSOR-08": {"name": "VCD (Viable Cell Density)", "val": 8.40, "unit": "10⁶ cells/mL", "min": 0.50, "max": 25.0},
            "SENSOR-09": {"name": "Viability", "val": 96.2, "unit": "%", "min": 85.0, "max": 100.0},
            "SENSOR-10": {"name": "Agitation Speed", "val": 220.0, "unit": "RPM", "min": 150.0, "max": 300.0},
            "SENSOR-11": {"name": "Gas Flow Rate", "val": 0.12, "unit": "VVM", "min": 0.05, "max": 0.30},
            "SENSOR-12": {"name": "Nutrient Feed Rate", "val": 12.5, "unit": "mL/h", "min": 0.00, "max": 30.0}
        }
        
    def inject_fault(self, fault_type: str, intensity: float = 1.0):
        self.active_fault = fault_type
        self.fault_intensity = intensity
        self.fault_start_tick = self.tick
        return {"status": "fault_injected", "fault": fault_type, "intensity": intensity}

    def clear_fault(self):
        self.active_fault = None
        self.fault_intensity = 1.0
        return {"status": "fault_cleared"}

    def get_telemetry(self) -> List[Dict[str, Any]]:
        self.tick += 1
        t = self.tick
        
        telemetry = []
        for s_id, cfg in self.base_sensors.items():
            val = cfg["val"]
            # Add natural sinus oscillation / noise
            noise = random.uniform(-0.02, 0.02) * val
            val += noise + 0.05 * math.sin(t / 5.0)
            
            # Apply fault injections if active
            if self.active_fault == "glucose_overfeed":
                if s_id == "SENSOR-04": # Glucose spikes
                    val += 5.5 * self.fault_intensity + (t - self.fault_start_tick) * 0.1
                elif s_id == "SENSOR-06": # Lactate accumulates secondary to overfeeding
                    val += 2.2 * self.fault_intensity + (t - self.fault_start_tick) * 0.15
                elif s_id == "SENSOR-01": # Acidification drop
                    val -= 0.35 * self.fault_intensity
            elif self.active_fault == "lactate_rise":
                if s_id == "SENSOR-06":
                    val += 3.2 * self.fault_intensity + (t - self.fault_start_tick) * 0.2
                elif s_id == "SENSOR-09": # Viability drops under high lactate
                    val -= 8.0 * self.fault_intensity
            elif self.active_fault == "do_failure":
                if s_id == "SENSOR-02": # DO crashes
                    val = max(5.0, 12.0 - (t - self.fault_start_tick) * 0.5)
            elif self.active_fault == "ph_drift":
                if s_id == "SENSOR-01":
                    val = 6.25 - random.uniform(0.0, 0.1)
            elif self.active_fault == "viability_crash":
                if s_id == "SENSOR-09":
                    val = max(45.0, 72.0 - (t - self.fault_start_tick) * 1.2)
                elif s_id == "SENSOR-08":
                    val *= 0.85
                    
            # Determine status
            status = "OPTIMAL"
            if val < cfg["min"] or val > cfg["max"]:
                status = "CRITICAL" if (val < cfg["min"] * 0.8 or val > cfg["max"] * 1.2) else "WARNING"
                
            trend = "RISING" if math.sin(t / 5.0) > 0 else "FALLING"
            if self.active_fault and s_id in ["SENSOR-01", "SENSOR-02", "SENSOR-04", "SENSOR-06", "SENSOR-09"]:
                trend = "RISING" if s_id in ["SENSOR-04", "SENSOR-06"] else "FALLING"
                
            telemetry.append({
                "channel_id": s_id,
                "name": cfg["name"],
                "value": round(float(val), 2),
                "unit": cfg["unit"],
                "status": status,
                "trend": trend,
                "rolling_avg": round(float(val * 0.98), 2),
                "min_threshold": cfg["min"],
                "max_threshold": cfg["max"]
            })
            
        return telemetry
