"""
SQLAlchemy ORM Models for BioCopilot
"""

from sqlalchemy import Column, Integer, Float, String, Text, Boolean, DateTime
from datetime import datetime
from backend.app.database.database import Base

class DatasetRecord(Base):
    __tablename__ = "datasets"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    filename = Column(String(255), nullable=False)
    source_type = Column(String(255), default="SYNTHETIC DEMO DATA — NOT EXPERIMENTAL DATA")
    rows_count = Column(Integer, default=0)
    batches_count = Column(Integer, default=0)
    quality_score = Column(Float, default=100.0)
    license = Column(String(128), default="CC-BY-4.0")
    created_at = Column(DateTime, default=datetime.utcnow)
    columns_mapped = Column(Integer, default=16)
    metadata_json = Column(Text, nullable=True)

class BatchRunRecord(Base):
    __tablename__ = "batch_runs"

    id = Column(String(64), primary_key=True, index=True)
    dataset_id = Column(String(64), index=True)
    run_id = Column(String(64), index=True)
    vessel_volume_L = Column(Float, default=2.0)
    cell_line = Column(String(128), default="CHO-K1 mAb Producer")
    duration_h = Column(Float, default=336.0)
    sampling_interval_h = Column(Float, default=2.0)
    data_provenance = Column(String(255), default="SYNTHETIC DEMO DATA — NOT EXPERIMENTAL DATA")

class TelemetryPointRecord(Base):
    __tablename__ = "telemetry_points"

    id = Column(Integer, primary_key=True, autoincrement=True)
    batch_id = Column(String(64), index=True)
    time_h = Column(Float, index=True)
    vessel_volume_L = Column(Float, default=2.0)
    VCD = Column(Float, nullable=True)
    viability_pct = Column(Float, nullable=True)
    glucose_gL = Column(Float, nullable=True)
    glutamine_mM = Column(Float, nullable=True)
    lactate_gL = Column(Float, nullable=True)
    ammonia_mM = Column(Float, nullable=True)
    pH = Column(Float, nullable=True)
    DO_pct = Column(Float, nullable=True)
    temp_C = Column(Float, nullable=True)
    rpm = Column(Float, nullable=True)
    gas_flow_vvm = Column(Float, nullable=True)
    feed_rate_mL_h = Column(Float, nullable=True)
    media_cost_per_L = Column(Float, nullable=True)

class AlertRecord(Base):
    __tablename__ = "alerts"

    id = Column(String(64), primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    batch_id = Column(String(64), index=True)
    severity = Column(String(32), default="INFO")  # INFO, LOW, MEDIUM, HIGH, CRITICAL
    parameter = Column(String(64), nullable=False)
    observed_value = Column(Float, nullable=False)
    threshold = Column(Float, nullable=False)
    trend = Column(String(128), nullable=False)
    evidence = Column(Text, nullable=False)
    possible_driver = Column(Text, nullable=False)
    predicted_impact = Column(Text, nullable=False)
    recommended_review = Column(Text, nullable=False)
    confidence = Column(Float, default=0.9)

class RecommendationRecord(Base):
    __tablename__ = "recommendations"

    id = Column(String(64), primary_key=True, index=True)
    batch_id = Column(String(64), index=True)
    type = Column(String(64), default="FEED_SCHEDULE")
    current_plan_json = Column(Text, nullable=False)
    optimized_plan_json = Column(Text, nullable=False)
    why = Column(Text, nullable=False)
    expected_effect = Column(Text, nullable=False)
    risk = Column(Text, nullable=False)
    confidence = Column(Float, default=0.85)
    status = Column(String(32), default="PENDING")  # PENDING, APPROVED, REJECTED
    created_at = Column(DateTime, default=datetime.utcnow)

class AuditEntryRecord(Base):
    __tablename__ = "audit_log"

    id = Column(String(64), primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    operator = Column(String(128), nullable=False)
    role = Column(String(128), nullable=False)
    recommendation_id = Column(String(64), index=True)
    action = Column(String(32), nullable=False)  # APPROVED, REJECTED, GENERATED
    parameter_delta = Column(Text, nullable=False)
    predicted_impact = Column(Text, nullable=False)
    confidence = Column(Float, default=0.85)
    comment = Column(Text, nullable=False)
