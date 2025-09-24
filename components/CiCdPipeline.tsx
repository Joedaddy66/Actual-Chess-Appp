
import React from 'react';
import { CheckCircleIcon } from './icons';

interface CiCdPipelineProps {
  logs: string[];
}

const CiCdPipeline: React.FC<CiCdPipelineProps> = ({ logs }) => {
  return (
    <div className="mt-4 space-y-3">
      {logs.map((log, index) => (
        <div key={index} className="flex items-start animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
          <div className="flex-shrink-0">
            <CheckCircleIcon className="h-5 w-5 text-green-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-gray-300">{log}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CiCdPipeline;