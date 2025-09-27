import { fetchAdapterApi } from './fetchAdapterApi';

export type SubmitMoveRequest = {
  fen: string;
  move: string;
  bias?: number; // Creative Context Bias
};

export type SubmitMoveResponse = {
  fen: string;          // updated FEN after move
  engine_move?: string; // if engine replies with its move
  ok: boolean;
  telemetry?: {
    job_id?: string;
    rtt_ms?: number;
    cost?: number;
    carbon?: number;
    error_rate?: number;
  };
};

export async function submitMove(
  fen: string,
  move: string,
  bias: number | undefined
): Promise<{ rttMs: number; data: SubmitMoveResponse }> {
  const payload: SubmitMoveRequest = { fen, move, bias };

  const start = performance.now();
  const data = await fetchAdapterApi<SubmitMoveResponse>('/v1/engine/move', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  const end = performance.now();

  const rttMs = Math.round(end - start);
  return { rttMs, data };
}