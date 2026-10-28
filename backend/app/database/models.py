from sqlalchemy import Column, Integer, String, Float, DateTime, Text, JSON
from datetime import datetime
from .session import Base

class RecommendationModel(Base):
    __tablename__ = "recommendations"

    id = Column(String, primary_key=True, index=True)
    run_id = Column(String, index=True)
    title = Column(String)
    category = Column(String) # feed, risk, scaleup, cost
    status = Column(String, default="PENDING") # PENDING, APPROVED, REJECTED
    severity = Column(String, default="INFO")
    evidence = Column(Text)
    expected_effect = Column(Text)
    confidence = Column(Float)
    constraints = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    reviewed_at = Column(DateTime, nullable=True)
    reviewer_id = Column(String, nullable=True)
    reviewer_comment = Column(Text, nullable=True)

class AuditLogModel(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    user_id = Column(String)
    action = Column(String)
    dataset_version = Column(String)
    model_version = Column(String)
    recommendation_id = Column(String, nullable=True)
    input_state = Column(JSON, nullable=True)
    decision = Column(String)
    comment = Column(Text, nullable=True)
