"""
Virtual Bioprocess Sensor Engine & Fault Injection System
Streams 12 synchronized bioprocess channels at 2.0s intervals via WebSocket.
Includes real-time threshold evaluations, rolling buffers, and perturbation injection.
"""

import math
import random
from datetime import datetime
from typing import Dict, Any, List, Optional
from collections import deque
from backend.app.schemas.api_schemas import SensorReading, SensorStreamMessage, BioprocessAlert
from backend.app.services.risk_engine import MetabolicRiskEngine

class VirtualSensorManager:
    def __init__(self):
        self.batch_id: str = "BATCH-2026-CHO-001"
        self.current_time_h: float = 72.0
        self.time_step_h: float = 2.0
        self.is_running: bool = True

        # Active injected faults
        self.active_faults: Dict[str, Dict[str, Any]] = {}

        # 12 Sensor Baseline States
        self.state: Dict[str, float] = {
            "pH": 7.05,
            "DO": 48.0,
            "Temperature": 36.8,
            "Glucose": 3.8,
            "Glutamine": 2.2,
            "Lactate": 2.1,
            "Ammonia": 2.4,
            "VCD": 8.6,
            "Viability": 96.5,
            "RPM": 250.0,
            "Gas Flow": 0.12,
            "Feed Rate": 4.5,
        }

        # Rolling history buffers for calculating rolling average (10 readings)
        self.rolling_buffers: Dict[str, deque] = {
            k: deque([v] * 5, maxlen=10) for k, v in self.state.items()
        }

        # Active generated alerts
        self.active_alerts: List[BioprocessAlert] = []

    def inject_fault(self, fault_type: str, magnitude: float = 1.0, duration_h: float = 12.0) -> Dict[str, Any]:
        """
        Activates a dynamic fault perturbation on the simulated telemetry stream.
        """
        self.active_faults[fault_type] = {
            "magnitude": magnitude,
            "duration_h": duration_h,
            "injected_at_time": self.current_time_h
        }
        return {
            "status": "injected",
            "fault_type": fault_type,
            "message": f"Injected perturbation '{fault_type}' at t={round(self.current_time_h, 1)}h."
        }

    def reset_faults(self):
        self.active_faults.clear()

    def step(self) -> SensorStreamMessage:
        """
        Advances the virtual sensor simulation by one step (2.0 simulated hours per tick).
        Applies natural bioprocess drift, stochastic sensor noise, and active faults.
        """
        self.current_time_h = round(self.current_time_h + self.time_step_h, 1)
        if self.current_time_h > 336.0:
            self.current_time_h = 24.0 # Loop demo cycle

        prev_state = dict(self.state)

        # Baseline bioprocess progression
        t = self.current_time_h
        if t < 160:
            self.state["VCD"] = min(22.0, self.state["VCD"] + 0.35 + random.gauss(0, 0.05))
            self.state["Viability"] = max(90.0, min(99.0, self.state["Viability"] - 0.05 + random.gauss(0, 0.02)))
            self.state["Glucose"] = max(1.8, min(5.5, self.state["Glucose"] - 0.15 + random.gauss(0, 0.04)))
            self.state["Lactate"] = max(0.5, self.state["Lactate"] + 0.06 + random.gauss(0, 0.02))
        elif t < 260:
            self.state["VCD"] = max(12.0, self.state["VCD"] + random.gauss(0, 0.08))
            self.state["Viability"] = max(80.0, self.state["Viability"] - 0.2 + random.gauss(0, 0.05))
            self.state["Lactate"] = max(0.8, self.state["Lactate"] + 0.02 + random.gauss(0, 0.03))
        else:
            self.state["VCD"] = max(5.0, self.state["VCD"] - 0.4 + random.gauss(0, 0.08))
            self.state["Viability"] = max(60.0, self.state["Viability"] - 0.8 + random.gauss(0, 0.1))

        # Check and apply active faults
        faults_to_remove = []
        for f_type, f_data in self.active_faults.items():
            elapsed = self.current_time_h - f_data["injected_at_time"]
            if elapsed > f_data["duration_h"]:
                faults_to_remove.append(f_type)
                continue

            mag = f_data["magnitude"]
            if f_type == "glucose_overfeed":
                self.state["Glucose"] = min(9.5, self.state["Glucose"] + 0.8 * mag)
                self.state["Lactate"] = min(6.0, self.state["Lactate"] + 0.3 * mag)
                self.state["Feed Rate"] = 8.0 * mag
            elif f_type == "lactate_rise":
                self.state["Lactate"] = min(6.5, self.state["Lactate"] + 0.5 * mag)
                self.state["pH"] = max(6.5, self.state["pH"] - 0.04 * mag)
            elif f_type == "do_sensor_failure":
                # Severe signal dropout or zero baseline
                self.state["DO"] = max(2.0, min(15.0, 10.0 + random.gauss(0, 3.0)))
            elif f_type == "ph_drift":
                self.state["pH"] = max(6.4, self.state["pH"] - 0.08 * mag)
            elif f_type == "viability_crash":
                self.state["Viability"] = max(55.0, self.state["Viability"] - 3.5 * mag)

        for f_done in faults_to_remove:
            del self.active_faults[f_done]

        # Sensor noise & bounds
        self.state["pH"] = round(max(6.2, min(7.8, self.state["pH"] + random.gauss(0, 0.01))), 2)
        self.state["DO"] = round(max(0.0, min(100.0, self.state["DO"] + random.gauss(0, 0.3))), 1)
        self.state["Temperature"] = round(max(35.0, min(39.0, 36.8 + random.gauss(0, 0.03))), 1)
        self.state["Glucose"] = round(max(0.1, self.state["Glucose"]), 2)
        self.state["Glutamine"] = round(max(0.1, self.state["Glutamine"] + random.gauss(0, 0.02)), 2)
        self.state["Lactate"] = round(max(0.1, self.state["Lactate"]), 2)
        self.state["Ammonia"] = round(max(0.2, self.state["Ammonia"] + random.gauss(0, 0.02)), 2)
        self.state["VCD"] = round(max(0.1, self.state["VCD"]), 2)
        self.state["Viability"] = round(max(30.0, min(100.0, self.state["Viability"])), 1)
        self.state["RPM"] = round(self.state["RPM"], 1)
        self.state["Gas Flow"] = round(self.state["Gas Flow"], 2)
        self.state["Feed Rate"] = round(self.state["Feed Rate"], 2)

        # Update rolling averages
        for k, v in self.state.items():
            self.rolling_buffers[k].append(v)

        # Build 12 Sensor Dictionary
        sensors_dict: Dict[str, SensorReading] = {}
        sensor_configs = [
            ("SENSOR-01", "pH", self.state["pH"], "pH", 6.8, 7.2),
            ("SENSOR-02", "DO", self.state["DO"], "%", 30.0, 70.0),
            ("SENSOR-03", "Temperature", self.state["Temperature"], "°C", 36.5, 37.2),
            ("SENSOR-04", "Glucose", self.state["Glucose"], "g/L", 1.5, 5.5),
            ("SENSOR-05", "Glutamine", self.state["Glutamine"], "mM", 1.0, 4.5),
            ("SENSOR-06", "Lactate", self.state["Lactate"], "g/L", 0.0, 2.8),
            ("SENSOR-07", "Ammonia", self.state["Ammonia"], "mM", 0.0, 4.0),
            ("SENSOR-08", "VCD", self.state["VCD"], "10^6 cells/mL", 0.5, 30.0),
            ("SENSOR-09", "Viability", self.state["Viability"], "%", 85.0, 100.0),
            ("SENSOR-10", "RPM", self.state["RPM"], "RPM", 200.0, 320.0),
            ("SENSOR-11", "Gas Flow", self.state["Gas Flow"], "vvm", 0.05, 0.25),
            ("SENSOR-12", "Feed Rate", self.state["Feed Rate"], "mL/h", 0.0, 15.0),
        ]

        for s_id, s_name, val, unit, warn_min, warn_max in sensor_configs:
            roll_avg = round(float(sum(self.rolling_buffers[s_name]) / len(self.rolling_buffers[s_name])), 2)

            status = "NORMAL"
            if s_name == "Lactate":
                if val >= 3.5:
                    status = "CRITICAL"
                elif val >= 2.6:
                    status = "WARNING"
            elif s_name == "Glucose":
                if val <= 1.0 or val >= 6.5:
                    status = "CRITICAL" if val <= 1.0 else "WARNING"
            elif s_name == "DO":
                if val <= 20.0:
                    status = "CRITICAL"
                elif val <= 30.0:
                    status = "WARNING"
            elif s_name == "Viability":
                if val <= 80.0:
                    status = "CRITICAL"
                elif val <= 88.0:
                    status = "WARNING"
            else:
                if val < warn_min or val > warn_max:
                    status = "WARNING"

            sensors_dict[s_id] = SensorReading(
                name=s_name,
                value=val,
                unit=unit,
                status=status,
                rolling_avg=roll_avg
            )

        # Audit with MetabolicRiskEngine
        canonical_state = {
            "time_h": self.current_time_h,
            "glucose_gL": self.state["Glucose"],
            "lactate_gL": self.state["Lactate"],
            "ammonia_mM": self.state["Ammonia"],
            "viability_pct": self.state["Viability"],
            "DO_pct": self.state["DO"],
            "pH": self.state["pH"],
            "VCD": self.state["VCD"],
        }
        canonical_prev = {
            "glucose_gL": prev_state["Glucose"],
            "lactate_gL": prev_state["Lactate"],
            "ammonia_mM": prev_state["Ammonia"],
            "viability_pct": prev_state["Viability"],
            "DO_pct": prev_state["DO"],
            "pH": prev_state["pH"],
            "VCD": prev_state["VCD"],
        }

        self.active_alerts = MetabolicRiskEngine.evaluate_process_state(
            batch_id=self.batch_id,
            state=canonical_state,
            previous_state=canonical_prev
        )

        return SensorStreamMessage(
            timestamp=datetime.utcnow().isoformat() + "Z",
            batch_id=self.batch_id,
            time_h=self.current_time_h,
            is_simulated=True,
            disclaimer="SIMULATED SENSOR DATA — NOT CONNECTED TO PHYSICAL EQUIPMENT",
            sensors=sensors_dict
        )

# Global singleton streamer for WebSocket broadcasts
virtual_sensor_engine = VirtualSensorManager()
