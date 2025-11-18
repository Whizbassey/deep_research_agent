const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000/api/v1';

export interface ResearchRequest {
  query: string;
  num_results_per_agent?: number;
}

export interface ResearchResponse {
  query: string;
  subagents: number;
  total_sources: number;
  synthesis: string;
  session_id?: string;
}

export async function performResearch(data: ResearchRequest): Promise<ResearchResponse> {
  const response = await fetch(`${API_URL}/research`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Research failed');
  }

  return response.json();
}

export async function checkHealth() {
  const response = await fetch(`${API_URL}/health`);
  return response.json();
}

export interface ActivityEvent {
  timestamp: string;
  type: string;
  message: string;
  data?: Record<string, any>;
}

export interface ActivityState {
  active: boolean;
  query?: string;
  status: string;
  total_sources: number;
  subagents: Record<number, { status?: string; search_focus?: string; sources?: number; requested?: number }>;
  events: ActivityEvent[];
}

export async function getActivity(sessionId?: string): Promise<ActivityState> {
  const url = sessionId ? `${API_URL}/activity?session_id=${encodeURIComponent(sessionId)}` : `${API_URL}/activity`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Activity fetch failed: ${response.status}`);
  }
  return response.json();
}

export function getActivityStreamUrl(sessionId: string): string {
  return `${API_URL}/activity/stream/${encodeURIComponent(sessionId)}`;
}