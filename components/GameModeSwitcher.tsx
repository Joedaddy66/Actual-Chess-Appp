import React from 'react';
import type { GameMode } from '../types';

interface GameModeSwitcherProps {
  currentGameMode: GameMode;
  onGameModeChange: (mode: GameMode) => void;
}

const GameModeSwitcher: React.FC<GameModeSwitcherProps> = ({ currentGameMode, onGameModeChange }) => {
  const modes: GameMode[] = ['chess', 'leviathan', 'lambda', 'helmbreaker', 'rite'];

  const getModeDisplayName = (mode: GameMode) => {
    if (mode === 'rite') return 'Rite of Reduction';
    return mode.charAt(0).toUpperCase() + mode.slice(1);
  }

  return (
    <div className="my-4">
        <div className="flex flex-wrap gap-1 bg-black/30 rounded-lg p-1 border border-gray-700/50">
        {modes.map((mode) => (
            <button
            key={mode}
            onClick={() => onGameModeChange(mode)}
            className={`flex-grow py-2 px-2 text-xs font-bold rounded-md transition-colors duration-200 focus:outline-none font-cinzel tracking-wider
                ${currentGameMode === mode
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-red-300 hover:bg-red-500/20'
                }
            `}
            >
            {getModeDisplayName(mode)}
            </button>
        ))}
        </div>
    </div>
  );
};

export default GameModeSwitcher;