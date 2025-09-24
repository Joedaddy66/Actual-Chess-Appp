import React from 'react';
import type { Player } from '../types';
import { ClockIcon } from './icons';

interface GameTimerProps {
  whiteTime: number;
  blackTime: number;
  activePlayer: Player;
  isAiThinking: boolean;
}

const formatTime = (timeInSeconds: number): string => {
  if (timeInSeconds <= 0) return "00:00";
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = timeInSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const GameTimer: React.FC<GameTimerProps> = ({ whiteTime, blackTime, activePlayer, isAiThinking }) => {
  return (
    <div className="mt-4 flex justify-between items-center bg-black/30 p-2 rounded-lg border border-gray-700/50">
      <div className={`w-1/2 text-center p-2 rounded-md transition-colors duration-300 ${activePlayer === 'W' && !isAiThinking ? 'bg-red-600/80' : 'bg-red-900/20'}`}>
        <span className={`font-cinzel text-sm tracking-wider ${activePlayer === 'W' && !isAiThinking ? 'text-white font-bold' : 'text-red-300'}`}>
          OPERATOR
        </span>
        <p className={`font-mono text-2xl font-bold mt-1 ${activePlayer === 'W' && !isAiThinking ? 'text-white' : 'text-white'}`}>
          {formatTime(whiteTime)}
        </p>
      </div>
      <div className="px-2">
        <ClockIcon className="h-6 w-6 text-gray-400" />
      </div>
      <div className={`w-1/2 text-center p-2 rounded-md transition-colors duration-300 flex items-center justify-center gap-2 ${activePlayer === 'B' || isAiThinking ? 'bg-green-600/80' : 'bg-green-900/20'}`}>
        <div>
          <span className={`font-cinzel text-sm tracking-wider ${activePlayer === 'B' || isAiThinking ? 'text-white font-bold' : 'text-green-300'}`}>
            AI ENGINE
          </span>
          <p className={`font-mono text-2xl font-bold mt-1 ${activePlayer === 'B' || isAiThinking ? 'text-white' : 'text-white'}`}>
            {formatTime(blackTime)}
          </p>
        </div>
        {isAiThinking && (
          <div className="w-4 h-4">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-slate-100"></span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameTimer;