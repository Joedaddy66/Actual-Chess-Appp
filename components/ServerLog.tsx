import React, { useEffect, useRef } from 'react';
import { RobotIcon, UserIcon } from './icons';

interface ServerLogProps {
  logs: string[];
}

const ServerLog: React.FC<ServerLogProps> = ({ logs }) => {
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const formatLog = (log: string) => {
    if (log.startsWith('[AI]')) {
      return (
        <span className="flex items-center text-green-300 bg-green-900/30 rounded px-2 py-0.5 -mx-2 my-0.5">
          <RobotIcon className="h-4 w-4 mr-2 flex-shrink-0 text-green-400" />
          <span>{log}</span>
        </span>
      );
    }
    
    if (log.startsWith('[CLIENT]')) {
      return (
        <span className="flex items-center text-red-300 bg-red-900/20 rounded px-2 py-0.5 -mx-2 my-0.5">
          <UserIcon className="h-4 w-4 mr-2 flex-shrink-0 text-red-400" />
          <span>{log}</span>
        </span>
      );
    }

    let color = 'text-gray-400';
    if (log.startsWith('[ENGINE]')) color = 'text-lime-400';
    else if (log.startsWith('[SYSTEM] CRITICAL')) color = 'text-red-500 animate-pulse';
    
    return <span className={color}>{log}</span>;
  };

  return (
    <div className="mt-4">
      <h4 className="text-sm font-semibold text-gray-300 mb-2 font-cinzel tracking-wider">ENGINE LOGS</h4>
      <div
        ref={logContainerRef}
        className="h-48 bg-black/50 rounded-md p-3 font-mono text-xs overflow-y-auto border border-gray-700/50"
      >
        {logs.map((log, index) => (
          <p key={index} className="whitespace-pre-wrap leading-relaxed">
            <span className="text-gray-600 mr-2">{'>'}</span>
            {formatLog(log)}
          </p>
        ))}
      </div>
    </div>
  );
};

export default ServerLog;