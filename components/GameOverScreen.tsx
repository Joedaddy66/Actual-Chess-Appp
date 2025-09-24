import React from 'react';
import type { VictoryState } from '../types';

interface GameOverScreenProps {
    victoryState: VictoryState;
    onPlayAgain: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ victoryState, onPlayAgain }) => {
    if (!victoryState) return null;

    const isWin = victoryState.winner === 'W';
    const title = isWin ? "VICTORY" : "DEFEAT";
    const titleColor = isWin ? "text-red-500" : "text-gray-400";

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center animate-fade-in">
            <div className="bg-black/50 border border-gray-700/50 rounded-lg shadow-2xl p-8 text-center max-w-lg mx-4">
                <h1 className={`font-cinzel text-6xl font-bold tracking-widest ${titleColor}`} style={{ textShadow: `0 0 20px ${isWin ? 'rgba(239, 68, 68, 0.5)' : 'rgba(156, 163, 175, 0.3)'}` }}>
                    {title}
                </h1>
                <p className="text-gray-300 mt-4 mb-8 text-lg">
                    {victoryState.reason}
                </p>
                <button
                    onClick={onPlayAgain}
                    className="w-full flex justify-center py-3 px-4 border border-red-700/80 rounded-md shadow-sm text-lg font-medium text-white bg-red-700/80 hover:bg-red-600/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors font-cinzel tracking-wider"
                >
                    Engage in Another Trial
                </button>
            </div>
        </div>
    );
};

export default GameOverScreen;
