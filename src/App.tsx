import React, { useEffect, useMemo, useRef, useState } from 'react';
import { submitMove } from './api/engine';
import { startTelemetryPolling, TelemetryResponse } from './api/telemetry';

type BoardState = {
  fen: string;
};

export default function App() {
  const [board, setBoard] = useState<BoardState>({ fen: 'startpos' });
  const [rttMs, setRttMs] = useState<number | null>(null);
  const [telemetry, setTelemetry] = useState<TelemetryResponse | null>(null);
  const [bias, setBias] = useState<number>(0.0);

  const abortCtrl = useMemo(() => new AbortController(), []);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    startTelemetryPolling((t) => {
      if (!isMounted.current) return;
      setTelemetry(t);
    }, { intervalMs: 3000, signal: abortCtrl.signal });

    return () => {
      isMounted.current = false;
      abortCtrl.abort();
    };
  }, [abortCtrl]);

  async function onUserMove(move: string) {
    const currentFen = board.fen;

    try {
      const { rttMs: measuredRtt, data } = await submitMove(currentFen, move, bias);
      setRttMs(measuredRtt);

      if (data.ok && data.fen) {
        setBoard({ fen: data.fen });
      }

      // Optional: also reflect engine telemetry if provided
      if (data.telemetry?.rtt_ms) setRttMs(data.telemetry.rtt_ms);

    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Move submission failed:', err);
    }
  }

  return (
    <div className="app">
      {/* 3D board component should call onUserMove when a move is made */}
      {/* <ThreeDChessBoard fen={board.fen} onMove={onUserMove} /> */}

      <div className="dashboard">
        <div>RTT: {rttMs !== null ? `${rttMs} ms` : '—'}</div>
        <div>Cost: {telemetry?.cost ?? '—'}</div>
        <div>Carbon: {telemetry?.carbon ?? '—'}</div>
        <div>Error Rate: {telemetry?.error_rate ?? '—'}</div>
        <div>Health: {telemetry?.health ?? '—'}</div>
      </div>

      <div className="controls">
        <label>
          Creative Context Bias
          <input
            type="range"
            min={-1}
            max={1}
            step={0.05}
            value={bias}
            onChange={(e) => setBias(parseFloat(e.target.value))}
          />
        </label>
      </div>
    </div>
  );
}