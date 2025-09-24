import React from 'react';
import type { Essence } from '../types';

interface EssenceTrackerProps {
    essence: Essence;
}

const EssenceTracker: React.FC<EssenceTrackerProps> = ({ essence }) => {
    return (
        <div className="mt-4 flex justify-between items-center bg-black/30 p-2 rounded-lg border border-gray-700/50">
            <div className="w-1/2 text-center p-2">
                <span className="font-cinzel text-sm tracking-wider text-red-300">
                    OPERATOR ESSENCE
                </span>
                <p className="font-mono text-2xl font-bold mt-1 text-white">
                    {essence.white}
                </p>
            </div>
            <div className="px-2 text-gray-500 font-bold text-2xl">
                /
            </div>
            <div className="w-1/2 text-center p-2">
                <span className="font-cinzel text-sm tracking-wider text-green-300">
                    AI ENGINE ESSENCE
                </span>
                <p className="font-mono text-2xl font-bold mt-1 text-white">
                    {essence.black}
                </p>
            </div>
        </div>
    );
};

export default EssenceTracker;
