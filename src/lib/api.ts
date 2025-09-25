// API utilities for fetching metrics data

export interface MetricsData {
  range: {
    from: string;
    to: string;
  };
  samples: {
    voltage: Array<{ ts: number; value: number }>;
    current: Array<{ ts: number; value: number }>;
    'temp.CH1': Array<{ ts: number; value: number }>;
    'temp.CH2': Array<{ ts: number; value: number }>;
    'temp.CH3': Array<{ ts: number; value: number }>;
    vibration: Array<{ ts: number; value: number }>;
    frequency_Hz: Array<{ ts: number; value: number }>;
    energy_kWh: Array<{ ts: number; value: number }>;
  };
  latest: {
    voltage: number;
    current: number;
    'temp.CH1': number;
    'temp.CH2': number;
    'temp.CH3': number;
    vibration: number;
    frequency_Hz: number;
    energy_kWh: number;
  };
  aggregation: string;
  sampleCounts: Record<string, number>;
}

export async function fetchMetrics(
  from?: string,
  to?: string,
  metrics?: string,
  agg: string = 'raw'
): Promise<MetricsData> {
  const params = new URLSearchParams();
  
  if (from) params.append('from', from);
  if (to) params.append('to', to);
  if (metrics) params.append('metrics', metrics);
  params.append('agg', agg);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
  const response = await fetch(`${baseUrl}/api/metrics?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch metrics: ${response.statusText}`);
  }
  
  return response.json();
}

export async function ingestData(payload: unknown): Promise<Response> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
  return fetch(`${baseUrl}/api/ingest`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

export async function resetData(): Promise<Response> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
  return fetch(`${baseUrl}/api/reset`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export async function fetchPercentages(): Promise<Record<string, number>> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
  const response = await fetch(`${baseUrl}/api/percentages`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch percentages: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.percentages;
}