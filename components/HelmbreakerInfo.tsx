import React from 'react';
import type { GameMeta } from '../types';

interface HelmbreakerInfoProps {
    meta: GameMeta;
}

const HelmbreakerInfo: React.FC<HelmbreakerInfoProps> = ({ meta }) => {
    return (
        <div className="mt-4 border-t border-gray-700/50 pt-4 text-center">
             <h4 className="font-cinzel text-sm font-bold text-gray-400 mb-1 tracking-wider">TURNS UNTIL DEFENDER VICTORY</h4>
             <p className="font-mono text-3xl font-bold text-white">
                {meta.turnLimit ?? 'N/A'}
             </p>
        </div>
    );
};

export default HelmbreakerInfo;
