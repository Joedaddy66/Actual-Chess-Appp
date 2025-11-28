import React, { useState, useEffect, useCallback } from 'react';
import { getTelemetryData } from '../services/geminiService';
import Card from './Card';
import { CpuIcon } from './icons';
import type { TelemetryData } from '../types';

interface TelemetryMonitorProps {
  idToken: string | null;
}

const TelemetryMonitor: React.FC<TelemetryMonitorProps> = ({ idToken }) => {
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchTelemetry = useCallback(async () => {
    if (!idToken) return;
    try {
      const data = await getTelemetryData(idToken);
      setTelemetry(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch telemetry');
      console.error(err);
    }
  }, [idToken]);

  useEffect(() => {
    if (idToken) {
        fetchTelemetry(); // Initial fetch
        const interval = setInterval(fetchTelemetry, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }
  }, [idToken, fetchTelemetry]);

  return (
    <Card>
      <Card.Header>
        <CpuIcon />
        <Card.Title>Unified Telemetry</Card.Title>
      </Card.Header>
      <Card.Body>
        <Card.Description>
          Real-time AIOps/FinOps reporting from the Core Engine.
        </Card.Description>
        <div className="mt-4 space-y-3 font-mono text-sm">
          {error && <p className="text-red-400">{error}</p>}
          {!telemetry && !error && idToken && <p className="text-gray-500">Polling for data...</p>}
          {!idToken && <p className="text-gray-500">Awaiting authentication...</p>}
          {telemetry && (
            <>
              <div className="flex justify-between items-baseline">
                <span className="text-gray-400">Cost (USD):</span>
                <span className="text-white font-bold text-lg">${telemetry.cost.toFixed(6)}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-gray-400">Latency (RTT):</span>
                <span className="text-white font-bold text-lg">{telemetry.latency.toFixed(0)}ms</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-gray-400">Carbon (gCO₂eq):</span>
                <span className="text-white font-bold text-lg">{telemetry.carbon.toFixed(4)}</span>
              </div>
            </>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default TelemetryMonitor;
