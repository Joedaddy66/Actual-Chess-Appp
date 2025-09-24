import React from 'react';
import type { GameMeta } from '../types';

interface LambdaControlsProps {
    meta: GameMeta;
    displayPlane: 'mind' | 'body' | 'spirit';
    onPlaneChange: (plane: 'mind' | 'body' | 'spirit') => void;
}

const LambdaControls: React.FC<LambdaControlsProps> = ({ meta, displayPlane, onPlaneChange }) => {
    const planes: ('mind' | 'body' | 'spirit')[] = ['mind', 'body', 'spirit'];
    const isActivePlane = (plane: 'mind' | 'body' | 'spirit') => meta.currentPlane === plane;
    
    return (
        <div className="mt-4 border-t border-gray-700/50 pt-4">
             <h4 className="font-cinzel text-base font-bold text-red-400 mb-2 tracking-wider">Tactical View</h4>
            <div className="flex flex-wrap gap-1 bg-black/30 rounded-lg p-1 border border-gray-700/50">
                {planes.map(plane => (
                     <button
                        key={plane}
                        onClick={() => onPlaneChange(plane)}
                        className={`relative flex-grow py-2 px-2 text-xs font-bold rounded-md transition-colors duration-200 focus:outline-none font-cinzel tracking-wider
                        ${displayPlane === plane ? 'bg-red-600 text-white shadow-md' : 'text-red-300 hover:bg-red-500/20'}
                        `}
                    >
                        {isActivePlane(plane) && <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-white animate-pulse" title="Active Plane"></span>}
                        {plane.toUpperCase()}
                    </button>
                ))}
            </div>
            <div className="mt-2 flex justify-between items-center text-xs font-mono">
                <span className="text-red-300">Player Resources: <span className="font-bold text-white">{meta.resources?.white ?? 0}</span></span>
                <span className="text-green-300">AI Resources: <span className="font-bold text-white">{meta.resources?.black ?? 0}</span></span>
            </div>
        </div>
    );
};

export default LambdaControls;
