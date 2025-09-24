import React from 'react';

interface TitleBarProps {
    username: string;
    nickname: string;
    onLogout: () => void;
    onRunTutorial: () => void;
}

const TitleBar: React.FC<TitleBarProps> = ({ username, nickname, onLogout, onRunTutorial }) => {
    return (
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
            <div className="text-left font-cinzel">
                <span className="text-gray-400 text-sm">OPERATOR:</span>
                <span className="font-bold text-red-400 ml-2 text-base tracking-wider">{username}</span>
                <span className="text-gray-500 mx-2">|</span>
                <span className="text-gray-400 text-sm">FACTION:</span>
                <span className="font-bold text-red-400 ml-2 text-base tracking-wider">{nickname}</span>
            </div>
            <div>
                 <button onClick={onRunTutorial} className="bg-gray-800/50 hover:bg-gray-700/50 text-white font-bold py-2 px-4 rounded-md transition-colors mr-2 border border-gray-700/80 text-sm font-cinzel tracking-wider">
                    Run Tutorial
                </button>
                <button onClick={onLogout} className="bg-red-900/50 hover:bg-red-800/50 text-white font-bold py-2 px-4 rounded-md transition-colors border border-red-700/80 text-sm font-cinzel tracking-wider">
                    Logout
                </button>
            </div>
        </div>
    );
};

export default TitleBar;