import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Body
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import datetime

from ..database.session import get_db, engine, Base
from ..database.models import RecommendationModel, AuditLogModel
from ..schemas.schemas import (
    DataQualityReport, VirtualSensorData, FaultInjectionRequest,
    RiskAlert, ModelMetrics, PredictionResult, FeedScenarioRequest,
    ScaleUpRequest, ScaleUpResultItem, RecommendationAction, CopilotQueryRequest
)
from ..services.data_engine import DataEngine
from ..simulators.sensor_engine import SensorEngine
from ..ml.ml_engine import MLEngine
from ..simulators.digital_twin import DigitalTwinSimulator
from ..services.scaleup_engine import ScaleUpEngine
from ..services.copilot_service import CopilotService

# Create database tables
Base.metadata.create_all(bind=engine)

router = APIRouter()

# Singletons for services
data_engine = DataEngine()
sensor_engine = SensorEngine()
ml_engine = MLEngine()
digital_twin = DigitalTwinSimulator()
scaleup_engine = ScaleUpEngine()
copilot_service = CopilotService()

@router.get("/health")
def health_check():
    return {
        "status": "ok",
        "app": "BioCopilot",
        "version": "1.0.0",
        "mode": "Decision-Support System",
        "human_approval_required": True
    }

# --- Datasets (Agent A) ---
@router.get("/datasets")
def list_datasets():
    return {
        "datasets": [
            {
                "id": "cho_fedbatch_2026_demo",
                "name": "CHO Cell Fed-Batch Telemetry",
                "rows": len(data_engine.processed_df) if data_engine.processed_df is not None else 123,
                "is_synthetic": True,
                "label": "SYNTHETIC DEMO DATA — NOT EXPERIMENTAL DATA"
            }
        ]
    }

@router.post("/datasets/upload")
async def upload_dataset(file: UploadFile = File(...)):
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
    upload_path = os.path.join(base_dir, "data", "raw", file.filename)
    with open(upload_path, "wb") as f:
        content = await file.read()
        f.write(content)
    data_engine.load_dataset(upload_path)
    return {"message": "Dataset uploaded and canonicalized successfully.", "filename": file.filename}

@router.post("/datasets/{id}/clean")
def clean_dataset(id: str):
    return data_engine.generate_quality_report()

@router.get("/runs/{id}")
def get_run_details(id: str):
    df = data_engine.processed_df
    if df is None or df.empty:
        raise HTTPException(status_code=404, detail="No batch data available.")
        
    batch_df = df[df['batch_id'] == id] if 'batch_id' in df.columns and id in df['batch_id'].values else df
    return {
        "run_id": id,
        "rows": len(batch_df),
        "time_h": batch_df['time_h'].tolist(),
        "VCD": batch_df['VCD'].tolist(),
        "viability_pct": batch_df['viability_pct'].tolist(),
        "glucose_gL": batch_df['glucose_gL'].tolist(),
        "lactate_gL": batch_df['lactate_gL'].tolist(),
        "ammonia_mM": batch_df['ammonia_mM'].tolist(),
        "pH": batch_df['pH'].tolist(),
        "DO_pct": batch_df['DO_pct'].tolist()
    }

# --- Virtual Sensors (Agent A) ---
@router.get("/sensors/current")
def get_current_sensors():
    return {
        "telemetry": sensor_engine.get_telemetry(),
        "label": "SIMULATED SENSOR DATA"
    }

@router.post("/sensors/fault")
def inject_sensor_fault(req: FaultInjectionRequest):
    return sensor_engine.inject_fault(req.fault_type, req.intensity)

@router.post("/sensors/fault/clear")
def clear_sensor_fault():
    return sensor_engine.clear_fault()

# --- ML & Risk (Agent B) ---
@router.get("/model/metrics")
def get_model_metrics():
    df = data_engine.processed_df
    return ml_engine.train_models(df)

@router.post("/predict/metabolites")
def predict_metabolites(body: Dict[str, Any] = Body(...)):
    target = body.get("target", "VCD")
    df = data_engine.processed_df
    return ml_engine.predict_future(df, target=target)

@router.get("/explainability/{run_id}")
def get_explainability(run_id: str):
    df = data_engine.processed_df
    pred_res = ml_engine.predict_future(df, target="VCD")
    return {
        "run_id": run_id,
        "target": "VCD",
        "feature_importances": pred_res.get("feature_importance", {}),
        "explanations": [
            {"feature": "glucose_gL", "direction": "NEGATIVE", "model_contribution": 0.35, "causation_note": "Model correlation: High glucose associated with overflow lactate accumulation in CHO fed-batch."},
            {"feature": "ivcd", "direction": "POSITIVE", "model_contribution": 0.28, "causation_note": "Model correlation: Integrated cell mass correlates strongly with future peak cell density."},
            {"feature": "lactate_gL", "direction": "NEGATIVE", "model_contribution": 0.22, "causation_note": "Model correlation: Elevated lactate (>2.5 g/L) correlates with reduced viability."}
        ],
        "disclaimer": "MODEL CONTRIBUTION IS STATISTICAL ASSOCIATION — NOT PROVEN BIOLOGICAL CAUSATION"
    }

@router.get("/alerts")
def get_active_alerts():
    telemetry = sensor_engine.get_telemetry()
    return {"alerts": ml_engine.detect_metabolic_risks(telemetry)}

# --- Optimization & Scaling (Agent B & C) ---
@router.post("/feed/schedule")
def schedule_feed(req: FeedScenarioRequest):
    sim_res = digital_twin.simulate_fedbatch(
        time_horizon_h=req.horizon_h,
        feed_rate_mL_h=req.feed_rate_mL_h
    )
    return {
        "scenario": "Smart Bounded Feed Schedule",
        "simulation": sim_res,
        "recommendation": "Maintain feed rate at 12.0 mL/h to prevent glucose overflow while supporting peak VCD."
    }

@router.post("/optimize/media")
def optimize_media(body: Dict[str, Any] = Body(...)):
    currency = body.get("currency", "USD")
    base_price = float(body.get("base_media_price", 35.0))
    return digital_twin.optimize_media_cost(base_media_usd_L=base_price, currency=currency)

@router.post("/scaleup")
def run_scaleup(req: ScaleUpRequest):
    return {
        "scaleup_matrix": scaleup_engine.compute_scaleup(
            source_volume_L=req.source_volume_L,
            target_volumes_L=req.target_volumes,
            strategy=req.strategy,
            source_rpm=req.source_rpm,
            source_gas_vvm=req.source_gas_vvm,
            impeller_ratio=req.impeller_diameter_ratio
        ),
        "disclaimer": "ENGINEERING ESTIMATE — REQUIRES VALIDATION"
    }

# --- Human-in-the-Loop & Audit (Agent D) ---
@router.get("/recommendations")
def list_recommendations(db: Session = Depends(get_db)):
    recs = db.query(RecommendationModel).all()
    if not recs:
        # Seed initial pending recommendation for demo
        demo_rec = RecommendationModel(
            id="REC-2026-001",
            run_id="Batch_02_LactateStress",
            title="Reduce Nutrient Feed Rate by 25% to Mitigate Lactate Accumulation",
            category="feed",
            status="PENDING",
            severity="HIGH",
            evidence="Lactate telemetry spiked to 3.2 g/L following glucose overfeed. Viability predicted to drop by 8% over next 24h.",
            expected_effect="Shift culture metabolism from lactate production to lactate consumption; preserve viability >94%.",
            confidence=0.93,
            constraints="Verified against pH buffer limits and substrate saturation thresholds."
        )
        db.add(demo_rec)
        db.commit()
        db.refresh(demo_rec)
        recs = [demo_rec]
        
    formatted = []
    for r in recs:
        formatted.append({
            "id": r.id,
            "run_id": r.run_id,
            "title": r.title,
            "category": r.category,
            "status": r.status,
            "severity": r.severity,
            "evidence": r.evidence,
            "expected_effect": r.expected_effect,
            "confidence": r.confidence,
            "constraints": r.constraints,
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "reviewed_at": r.reviewed_at.isoformat() if r.reviewed_at else None,
            "reviewer_id": r.reviewer_id,
            "reviewer_comment": r.reviewer_comment
        })
    return {"recommendations": formatted}

@router.post("/recommendations/{id}/approve")
def approve_recommendation(id: str, action: RecommendationAction, db: Session = Depends(get_db)):
    rec = db.query(RecommendationModel).filter(RecommendationModel.id == id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    rec.status = "APPROVED"
    rec.reviewed_at = datetime.utcnow()
    rec.reviewer_id = action.user_id
    rec.reviewer_comment = action.comment
    
    # Write audit log
    audit = AuditLogModel(
        user_id=action.user_id,
        action="APPROVE_RECOMMENDATION",
        dataset_version="cho_fedbatch_2026_demo",
        model_version="RandomForest-v1.0",
        recommendation_id=id,
        decision="APPROVED",
        comment=action.comment
    )
    db.add(audit)
    db.commit()
    return {"status": "success", "recommendation_status": "APPROVED"}

@router.post("/recommendations/{id}/reject")
def reject_recommendation(id: str, action: RecommendationAction, db: Session = Depends(get_db)):
    rec = db.query(RecommendationModel).filter(RecommendationModel.id == id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    rec.status = "REJECTED"
    rec.reviewed_at = datetime.utcnow()
    rec.reviewer_id = action.user_id
    rec.reviewer_comment = action.comment
    
    audit = AuditLogModel(
        user_id=action.user_id,
        action="REJECT_RECOMMENDATION",
        dataset_version="cho_fedbatch_2026_demo",
        model_version="RandomForest-v1.0",
        recommendation_id=id,
        decision="REJECTED",
        comment=action.comment
    )
    db.add(audit)
    db.commit()
    return {"status": "success", "recommendation_status": "REJECTED"}

@router.get("/audit")
def get_audit_logs(db: Session = Depends(get_db)):
    logs = db.query(AuditLogModel).order_by(AuditLogModel.timestamp.desc()).all()
    return {"audit_logs": logs}

@router.get("/report/{run_id}")
def generate_report(run_id: str):
    return {
        "run_id": run_id,
        "generated_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
        "report_markdown": f"# BioCopilot Process Decision Report\n\n**Run ID:** {run_id}\n**Status:** Decision Support Review Completed\n**Data Provenance:** SYNTHETIC DEMO DATA\n\n## 1. Process Summary\n- Total Duration: 240 h\n- Peak VCD: 18.4 x 10^6 cells/mL\n- Viability Harvest: 92.1%\n\n## 2. Risk & Recommendation Audit\n- Recommendation REC-2026-001 APPROVED by Human Operator.\n- Scaling Strategy: Constant P/V evaluated from 2 L to 1,000 L."
    }

# --- Copilot Assistant ---
@router.post("/copilot/query")
def query_copilot(req: CopilotQueryRequest):
    telemetry = sensor_engine.get_telemetry()
    alerts = ml_engine.detect_metabolic_risks(telemetry)
    context = {"telemetry": telemetry, "alerts": alerts}
    return copilot_service.answer_query(req.query, context=context)
