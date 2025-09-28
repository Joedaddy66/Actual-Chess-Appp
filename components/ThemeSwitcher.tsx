import React from 'react';

export type PieceTheme = 'custom' | 'unicode';

interface ThemeSwitcherProps {
  currentTheme: PieceTheme;
  onThemeChange: (theme: PieceTheme) => void;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ currentTheme, onThemeChange }) => {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-sm font-medium text-gray-300">Piece Style:</span>
      <div className="flex bg-gray-800 rounded-lg p-1">
        <button
          onClick={() => onThemeChange('custom')}
          className={`px-3 py-1 text-xs rounded transition-all duration-200 ${
            currentTheme === 'custom'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          Custom Images
        </button>
        <button
          onClick={() => onThemeChange('unicode')}
          className={`px-3 py-1 text-xs rounded transition-all duration-200 ${
            currentTheme === 'unicode'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          Classic Symbols
        </button>
      </div>
    </div>
  );
};

export default ThemeSwitcher;