import {
  DatasetInfo, DataQualityCleanResponse, RunDetails,
  PredictMetabolitesResponse, CurrentProcessState, ModelMetricsResponse,
  NutrientAnalysisResponse, FeedScheduleRequest, FeedScheduleResponse,
  MediaCostRequest, MediaCostResponse, ScaleupRequest, ScaleupResponse,
  BioprocessAlert, AuditLogEntry, CopilotQueryResponse
} from '../types';

const BASE_URL = '';

export async function fetchHealth(): Promise<any> {
  const res = await fetch(`${BASE_URL}/health`);
  return res.json();
}

export async function fetchDatasets(): Promise<DatasetInfo[]> {
  const res = await fetch(`${BASE_URL}/api/datasets`);
  return res.json();
}

export async function cleanDataset(id: string, mappings: Record<string, string>): Promise<DataQualityCleanResponse> {
  const res = await fetch(`${BASE_URL}/api/datasets/${id}/clean`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      confirmed_mappings: mappings,
      interpolation_strategy: 'linear_time_safe',
      remove_duplicates: true
    })
  });
  return res.json();
}

export async function fetchRunDetails(runId: string): Promise<RunDetails> {
  const res = await fetch(`${BASE_URL}/api/runs/${runId}`);
  return res.json();
}

export async function injectFault(faultType: string, magnitude: number = 1.0): Promise<any> {
  const res = await fetch(`${BASE_URL}/api/sensors/fault`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fault_type: faultType, magnitude, duration_h: 12.0 })
  });
  return res.json();
}

export async function resetSensors(): Promise<any> {
  const res = await fetch(`${BASE_URL}/api/sensors/reset`, { method: 'POST' });
  return res.json();
}

export async function fetchAlerts(): Promise<BioprocessAlert[]> {
  const res = await fetch(`${BASE_URL}/api/alerts`);
  return res.json();
}

export async function fetchModelMetrics(): Promise<ModelMetricsResponse> {
  const res = await fetch(`${BASE_URL}/api/model/metrics`);
  return res.json();
}

export async function predictMetabolites(state: CurrentProcessState, horizon: number = 48.0): Promise<PredictMetabolitesResponse> {
  const res = await fetch(`${BASE_URL}/api/predict/metabolites`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ current_state: state, horizon_hours: horizon })
  });
  return res.json();
}

export async function fetchNutrientAnalysis(): Promise<NutrientAnalysisResponse> {
  const res = await fetch(`${BASE_URL}/api/analysis/nutrients`, { method: 'POST' });
  return res.json();
}

export async function scheduleFeed(req: FeedScheduleRequest): Promise<FeedScheduleResponse> {
  const res = await fetch(`${BASE_URL}/api/feed/schedule`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req)
  });
  return res.json();
}

export async function optimizeMediaCost(req: MediaCostRequest): Promise<MediaCostResponse> {
  const res = await fetch(`${BASE_URL}/api/optimize/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req)
  });
  return res.json();
}

export async function calculateScaleup(req: ScaleupRequest): Promise<ScaleupResponse> {
  const res = await fetch(`${BASE_URL}/api/scaleup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req)
  });
  return res.json();
}

export async function approveRecommendation(id: string, reviewerName: string, comment: string): Promise<any> {
  const res = await fetch(`${BASE_URL}/api/recommendations/${id}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      reviewer_name: reviewerName,
      reviewer_role: 'Senior Bioprocess Lead',
      comment: comment,
      status: 'APPROVED'
    })
  });
  return res.json();
}

export async function rejectRecommendation(id: string, reviewerName: string, comment: string): Promise<any> {
  const res = await fetch(`${BASE_URL}/api/recommendations/${id}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      reviewer_name: reviewerName,
      reviewer_role: 'Senior Bioprocess Lead',
      comment: comment,
      status: 'REJECTED'
    })
  });
  return res.json();
}

export async function fetchAuditLog(): Promise<AuditLogEntry[]> {
  const res = await fetch(`${BASE_URL}/api/audit`);
  return res.json();
}

export async function queryCopilot(question: string, runId?: string): Promise<CopilotQueryResponse> {
  const res = await fetch(`${BASE_URL}/api/copilot/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, context_run_id: runId })
  });
  return res.json();
}

export async function fetchReport(runId: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/api/report/${runId}`);
  return res.text();
}
