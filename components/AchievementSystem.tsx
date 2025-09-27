import React, { useState, useEffect } from 'react';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

interface AchievementSystemProps {
  moveCount: number;
  gameMode: string;
  victories: number;
}

const AchievementSystem: React.FC<AchievementSystemProps> = ({ 
  moveCount, 
  gameMode, 
  victories 
}) => {
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 'first-move',
      title: 'First Steps',
      description: 'Make your first move',
      icon: '👶',
      unlocked: false,
      progress: 0,
      maxProgress: 1
    },
    {
      id: 'speed-demon',
      title: 'Speed Demon',
      description: 'Make 50+ moves in a single game',
      icon: '⚡',
      unlocked: false,
      progress: 0,
      maxProgress: 50
    },
    {
      id: 'theme-explorer',
      title: 'Theme Explorer',
      description: 'Switch between piece themes',
      icon: '🎨',
      unlocked: false
    },
    {
      id: 'game-master',
      title: 'Game Master',
      description: 'Try all game modes',
      icon: '🏆',
      unlocked: false,
      progress: 0,
      maxProgress: 5
    },
    {
      id: 'champion',
      title: 'Champion',
      description: 'Win your first game',
      icon: '👑',
      unlocked: false,
      progress: 0,
      maxProgress: 1
    }
  ]);

  const [newlyUnlocked, setNewlyUnlocked] = useState<string[]>([]);

  // Update achievements based on game state
  useEffect(() => {
    setAchievements(prev => prev.map(achievement => {
      let updated = { ...achievement };
      
      switch (achievement.id) {
        case 'first-move':
          if (moveCount > 0 && !achievement.unlocked) {
            updated.unlocked = true;
            updated.progress = 1;
            setNewlyUnlocked(prev => [...prev, achievement.id]);
          }
          break;
          
        case 'speed-demon':
          updated.progress = Math.min(moveCount, 50);
          if (moveCount >= 50 && !achievement.unlocked) {
            updated.unlocked = true;
            setNewlyUnlocked(prev => [...prev, achievement.id]);
          }
          break;
          
        case 'champion':
          updated.progress = victories;
          if (victories > 0 && !achievement.unlocked) {
            updated.unlocked = true;
            setNewlyUnlocked(prev => [...prev, achievement.id]);
          }
          break;
      }
      
      return updated;
    }));
  }, [moveCount, gameMode, victories]);

  // Clear notifications after a delay
  useEffect(() => {
    if (newlyUnlocked.length > 0) {
      const timer = setTimeout(() => {
        setNewlyUnlocked([]);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [newlyUnlocked]);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  return (
    <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
          🏅 Achievements
        </h4>
        <div className="text-xs text-gray-400">
          {unlockedCount}/{totalCount}
        </div>
      </div>
      
      <div className="space-y-2">
        {achievements.map(achievement => (
          <div 
            key={achievement.id}
            className={`flex items-center gap-3 p-2 rounded transition-all duration-200 ${
              achievement.unlocked 
                ? 'bg-green-900/30 border border-green-500/30' 
                : 'bg-gray-700/30 border border-gray-600/30'
            } ${
              newlyUnlocked.includes(achievement.id) 
                ? 'animate-pulse ring-2 ring-yellow-500/50' 
                : ''
            }`}
          >
            <div className={`text-lg ${achievement.unlocked ? 'grayscale-0' : 'grayscale opacity-50'}`}>
              {achievement.icon}
            </div>
            <div className="flex-1">
              <div className={`text-sm font-medium ${
                achievement.unlocked ? 'text-green-300' : 'text-gray-400'
              }`}>
                {achievement.title}
                {newlyUnlocked.includes(achievement.id) && (
                  <span className="ml-2 text-xs bg-yellow-500 text-black px-2 py-0.5 rounded-full">
                    NEW!
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500">
                {achievement.description}
              </div>
              {achievement.maxProgress && (
                <div className="mt-1">
                  <div className="w-full bg-gray-600 rounded-full h-1">
                    <div 
                      className={`h-1 rounded-full transition-all duration-300 ${
                        achievement.unlocked ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ 
                        width: `${Math.min(100, (achievement.progress || 0) / achievement.maxProgress * 100)}%` 
                      }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {achievement.progress || 0}/{achievement.maxProgress}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AchievementSystem;