import React from 'react';
import { ArrowDownIcon, ArrowUpIcon } from './icons';

interface CommandFlowProps {
  command: string | null;
  response: any | null;
  isLoading: boolean;
}

const CommandFlow: React.FC<CommandFlowProps> = ({ command, response, isLoading }) => {
  return (
    <div className="mt-4 space-y-2">
      {/* Request */}
      <div className={`p-3 rounded-lg border transition-all duration-500 ${isLoading && command ? 'border-red-500 bg-red-900/30' : 'border-gray-700/50 bg-black/50'}`}>
        <div className="flex items-center text-sm font-semibold text-red-400">
          <ArrowUpIcon />
          <span className="ml-2">REQUEST</span>
        </div>
        <pre className="mt-2 text-xs font-mono text-gray-300 whitespace-pre-wrap">
          {command ? JSON.stringify({ command }, null, 2) : '{ idle }'}
        </pre>
      </div>

      {/* Response */}
      <div className={`p-3 rounded-lg border transition-all duration-500 ${response ? (response.status === 'success' ? 'border-green-500 bg-green-900/30' : 'border-red-500 bg-red-900/30') : 'border-gray-700/50 bg-black/50'}`}>
        <div className={`flex items-center text-sm font-semibold ${response ? (response.status === 'success' ? 'text-green-300' : 'text-red-300') : 'text-gray-500'}`}>
          <ArrowDownIcon />
          <span className="ml-2">RESPONSE</span>
        </div>
        <pre className="mt-2 text-xs font-mono text-gray-300 whitespace-pre-wrap">
          {response ? JSON.stringify(response, null, 2) : '{ waiting }'}
        </pre>
      </div>
    </div>
  );
};

export default CommandFlow;