import React from 'react';

export interface PlayerStats {
  gamesPlayed: number;
  gamesWon: number;
  totalMoves: number;
  favoriteGameMode: string;
  longestGame: number;
  averageGameLength: number;
}

interface PlayerStatsProps {
  stats: PlayerStats;
  currentStreak: number;
}

const PlayerStats: React.FC<PlayerStatsProps> = ({ stats, currentStreak }) => {
  const winRate = stats.gamesPlayed > 0 ? (stats.gamesWon / stats.gamesPlayed * 100) : 0;

  return (
    <div className="bg-gray-800/50 rounded-lg p-4">
      <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
        📊 Player Statistics
      </h4>
      
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="bg-gray-700/30 rounded p-2">
          <div className="text-gray-400">Games Played</div>
          <div className="text-lg font-bold text-white">{stats.gamesPlayed}</div>
        </div>
        
        <div className="bg-gray-700/30 rounded p-2">
          <div className="text-gray-400">Win Rate</div>
          <div className={`text-lg font-bold ${winRate >= 50 ? 'text-green-400' : 'text-yellow-400'}`}>
            {winRate.toFixed(1)}%
          </div>
        </div>
        
        <div className="bg-gray-700/30 rounded p-2">
          <div className="text-gray-400">Total Moves</div>
          <div className="text-lg font-bold text-blue-400">{stats.totalMoves.toLocaleString()}</div>
        </div>
        
        <div className="bg-gray-700/30 rounded p-2">
          <div className="text-gray-400">Current Streak</div>
          <div className={`text-lg font-bold ${currentStreak > 0 ? 'text-orange-400' : 'text-gray-400'}`}>
            {currentStreak}
          </div>
        </div>
        
        <div className="bg-gray-700/30 rounded p-2 col-span-2">
          <div className="text-gray-400">Favorite Mode</div>
          <div className="text-sm font-bold text-purple-400 capitalize">
            {stats.favoriteGameMode}
          </div>
        </div>
        
        <div className="bg-gray-700/30 rounded p-2">
          <div className="text-gray-400">Longest Game</div>
          <div className="text-sm font-bold text-red-400">{stats.longestGame} moves</div>
        </div>
        
        <div className="bg-gray-700/30 rounded p-2">
          <div className="text-gray-400">Avg Game Length</div>
          <div className="text-sm font-bold text-cyan-400">{stats.averageGameLength.toFixed(1)} moves</div>
        </div>
      </div>
      
      {/* Progress towards next milestone */}
      <div className="mt-3 pt-3 border-t border-gray-600/30">
        <div className="text-xs text-gray-400 mb-1">Progress to 100 games</div>
        <div className="w-full bg-gray-600 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, stats.gamesPlayed / 100 * 100)}%` }}
          />
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {stats.gamesPlayed}/100 games
        </div>
      </div>
    </div>
  );
};

export default PlayerStats;