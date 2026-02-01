// API URL - checks for env variable first, then falls back to localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const API_KEY = import.meta.env.VITE_API_KEY;

// Helper function to get default headers
const getHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add API key if available (required for production)
  if (API_KEY) {
    headers['X-API-Key'] = API_KEY;
  }

  return headers;
};

export interface ResearchRequest {
  query: string;
  num_results_per_agent?: number;
  model?: string;
}

export interface ResearchResponse {
  query: string;
  subagents: number;
  total_sources: number;
  synthesis: string;
  session_id?: string;
  model?: string;
}

export interface ModelInfo {
  id: string;
  name: string;
  description: string;
  provider: string;
  max_tokens: number;
}

export interface ModelsResponse {
  models: ModelInfo[];
  default_model: string;
}

export async function performResearch(data: ResearchRequest): Promise<ResearchResponse> {
  try {
    const response = await fetch(`${API_URL}/research`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Research failed');
    }

    return response.json();
  } catch (error) {
    console.error('Error in performResearch:', error);
    throw error;
  }
}

export async function checkHealth() {
  try {
    const response = await fetch(`${API_URL}/health`);
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error('Health check error:', error);
    throw error;
  }
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
  subagents: Record<number, { status?: string; search_focus?: string; sources?: number; requested?: number; rationale?: string }>;
  events: ActivityEvent[];
  progress: number;
  current_phase: string;
  total_subagents: number;
  completed_subagents: number;
  estimated_total_sources: number;
  duration_seconds: number;
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

export async function getModels(): Promise<ModelsResponse> {
  try {
    const response = await fetch(`${API_URL}/models`);
    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching models:', error);
    throw error;
  }
}