const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export interface ResearchRequest {
  query: string;
  num_results_per_agent?: number;
}

export interface ResearchResponse {
  query: string;
  subagents: number;
  total_sources: number;
  synthesis: string;
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