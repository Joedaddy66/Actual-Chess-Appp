import React, { useEffect, useRef } from 'react';
import type { MovePair } from '../types';
import { ScrollIcon } from './icons';

interface MoveHistoryProps {
  history: MovePair[];
}

const MoveHistory: React.FC<MoveHistoryProps> = ({ history }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  return (
    <div className="mt-4 border-t border-gray-700/50 pt-4">
      <h4 className="text-sm font-semibold text-red-400 mb-2 font-cinzel tracking-wider flex items-center">
        <ScrollIcon />
        <span className="ml-2">BATTLE LOG</span>
      </h4>
      <div
        ref={scrollRef}
        className="h-24 bg-black/50 rounded-md p-3 font-mono text-xs overflow-y-auto border border-gray-700/50"
      >
        {history.length === 0 && <p className="text-gray-500">No moves made yet.</p>}
        {history.map((move, index) => (
          <div key={index} className="flex">
            <span className="text-gray-500 w-6">{index + 1}.</span>
            <span className="text-slate-200 w-12">{move.white}</span>
            <span className="text-green-300">{move.black}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MoveHistory;