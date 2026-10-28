import {
  DataQualityReport, VirtualSensorData, RiskAlert, PredictionResult,
  ScaleUpItem, Recommendation, AuditLog
} from '../types';

const API_BASE = '/api';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

export async function fetchQualityReport(): Promise<DataQualityReport> {
  const res = await fetch(`${API_BASE}/datasets/cho_fedbatch_2026_demo/clean`, { method: 'POST' });
  return res.json();
}

export async function fetchCurrentSensors(): Promise<{ telemetry: VirtualSensorData[]; label: string }> {
  const res = await fetch(`${API_BASE}/sensors/current`);
  return res.json();
}

export async function injectSensorFault(faultType: string, intensity = 1.0) {
  const res = await fetch(`${API_BASE}/sensors/fault`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fault_type: faultType, intensity })
  });
  return res.json();
}

export async function clearSensorFault() {
  const res = await fetch(`${API_BASE}/sensors/fault/clear`, { method: 'POST' });
  return res.json();
}

export async function fetchPredictions(target = 'VCD'): Promise<PredictionResult> {
  const res = await fetch(`${API_BASE}/predict/metabolites`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ target })
  });
  return res.json();
}

export async function fetchActiveAlerts(): Promise<{ alerts: RiskAlert[] }> {
  const res = await fetch(`${API_BASE}/alerts`);
  return res.json();
}

export async function fetchScaleUpMatrix(strategy = 'constant_pv'): Promise<{ scaleup_matrix: ScaleUpItem[]; disclaimer: string }> {
  const res = await fetch(`${API_BASE}/scaleup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      source_volume_L: 2.0,
      target_volumes: [10.0, 100.0, 1000.0],
      strategy
    })
  });
  return res.json();
}

export async function fetchMediaOptimization(currency = 'USD', basePrice = 35.0) {
  const res = await fetch(`${API_BASE}/optimize/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ currency, base_media_price: basePrice })
  });
  return res.json();
}

export async function fetchRecommendations(): Promise<{ recommendations: Recommendation[] }> {
  const res = await fetch(`${API_BASE}/recommendations`);
  return res.json();
}

export async function approveRecommendation(id: string, userId: string, comment: string) {
  const res = await fetch(`${API_BASE}/recommendations/${id}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, comment })
  });
  return res.json();
}

export async function rejectRecommendation(id: string, userId: string, comment: string) {
  const res = await fetch(`${API_BASE}/recommendations/${id}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, comment })
  });
  return res.json();
}

export async function fetchAuditLogs(): Promise<{ audit_logs: AuditLog[] }> {
  const res = await fetch(`${API_BASE}/audit`);
  return res.json();
}

export async function queryCopilot(query: string) {
  const res = await fetch(`${API_BASE}/copilot/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  return res.json();
}
