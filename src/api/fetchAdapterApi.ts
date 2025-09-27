import { getIdToken } from './auth';

const API_BASE = process.env.REACT_APP_ADAPTER_API_BASE;

if (!API_BASE) {
  // Fail fast in dev if not configured
  // In production, ensure this is provided via environment variables
  // eslint-disable-next-line no-console
  console.error('REACT_APP_ADAPTER_API_BASE is not set');
}

export async function fetchAdapterApi<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getIdToken();

  // If API is not properly configured, return mock data
  if (!API_BASE || API_BASE.includes('example.com')) {
    console.warn('Adapter API not configured, returning mock data for:', path);
    
    // Return mock responses based on the path
    if (path.includes('/v1/engine/move')) {
      return {
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR',
        engine_move: 'e7e5',
        ok: true,
        telemetry: {
          job_id: 'mock_job_123',
          rtt_ms: Math.floor(Math.random() * 100) + 50,
          cost: Math.random() * 0.01,
          carbon: Math.random() * 0.001,
          error_rate: Math.random() * 0.1
        }
      } as T;
    } else if (path.includes('/v1/monitor/telemetry')) {
      return {
        job_id: 'mock_job_123',
        rtt_ms: Math.floor(Math.random() * 100) + 50,
        cost: Math.random() * 0.01,
        carbon: Math.random() * 0.001,
        error_rate: Math.random() * 0.1,
        health: ['healthy', 'degraded', 'down'][Math.floor(Math.random() * 3)],
        timestamp: new Date().toISOString()
      } as T;
    }
    
    throw new Error('Mock API endpoint not implemented for path: ' + path);
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Adapter API error: ${res.status} ${res.statusText} ${text}`);
  }

  return res.json() as Promise<T>;
}