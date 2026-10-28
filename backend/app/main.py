import asyncio
import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from .api.routes import router as api_router, sensor_engine

app = FastAPI(
    title="BioCopilot Backend",
    description="AI Copilot for Scalable Cell-Culture Bioprocess Design (YUVA Megathon 2026)",
    version="1.0.0"
)

# Enable CORS for frontend Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

@app.get("/")
def root():
    return {
        "message": "BioCopilot Decision-Support System API",
        "health": "/health",
        "docs": "/docs"
    }

@app.websocket("/ws/sensors")
async def websocket_sensor_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            telemetry = sensor_engine.get_telemetry()
            payload = {
                "timestamp": asyncio.get_event_loop().time(),
                "telemetry": telemetry,
                "label": "SIMULATED SENSOR DATA"
            }
            await websocket.send_text(json.dumps(payload))
            await asyncio.sleep(2.0)
    except WebSocketDisconnect:
        pass
    except Exception as e:
        await websocket.close()
