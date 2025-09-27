import { fetchAdapterApi } from './fetchAdapterApi';

export type TelemetryResponse = {
  job_id: string;
  rtt_ms?: number;
  cost?: number;
  carbon?: number;
  error_rate?: number;
  health?: 'healthy' | 'degraded' | 'down';
  timestamp?: string;
};

export function startTelemetryPolling(
  onUpdate: (t: TelemetryResponse) => void,
  { intervalMs = 3000, signal }: { intervalMs?: number; signal?: AbortSignal } = {}
): void {
  let timer: number | undefined;

  const tick = async () => {
    try {
      const t = await fetchAdapterApi<TelemetryResponse>('/v1/monitor/telemetry?job_id=latest', {
        method: 'GET',
      });
      onUpdate(t);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('Telemetry polling error:', err);
    } finally {
      if (!signal?.aborted) {
        timer = window.setTimeout(tick, Math.min(intervalMs, 3000));
      }
    }
  };

  tick();

  signal?.addEventListener('abort', () => {
    if (timer) window.clearTimeout(timer);
  });
}