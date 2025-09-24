import React from 'react';
import type { GameMode } from '../types';

interface GameRulesProps {
  gameMode: GameMode;
}

const LeviathanRules = () => (
  <>
    <h4 className="font-cinzel text-base font-bold text-red-400 mb-2 tracking-wider">Game Rules: Leviathan</h4>
    <ul className="space-y-2 text-xs text-gray-400 list-disc list-inside">
      <li>
        <strong>Basic Move:</strong> A piece moves one square forward to an empty square.
      </li>
      <li>
        <strong>Capture:</strong> A piece captures an opponent by moving one square diagonally forward.
      </li>
      <li>
        <strong>Momentum Rule:</strong> After a basic move, if the next forward square is also empty, the piece MUST move to it, completing a "Momentum Move" in one turn.
      </li>
    </ul>
  </>
);

const ChessRules = () => (
  <>
    <h4 className="font-cinzel text-base font-bold text-red-400 mb-2 tracking-wider">Game Rules: Chess (Simplified)</h4>
    <ul className="space-y-2 text-xs text-gray-400 list-disc list-inside">
      <li>
        <strong>Objective:</strong> Capture the opponent's King.
      </li>
      <li>
        <strong>Pieces:</strong> Standard chess piece movement (Pawn, Rook, Knight, Bishop, Queen, King).
      </li>
      <li>
        <strong>Note:</strong> Advanced rules like castling, en passant, and pawn promotion are not implemented in this simulation.
      </li>
    </ul>
  </>
);

const LambdaRules = () => (
    <>
      <h4 className="font-cinzel text-base font-bold text-red-400 mb-2 tracking-wider">Game Rules: Lambda Protocol</h4>
      <ul className="space-y-2 text-xs text-gray-400 list-disc list-inside">
        <li>
            <strong>Three Planes:</strong> The game is fought across the Mind, Body, and Spirit planes. You can only make a standard move on the currently active plane.
        </li>
        <li>
            <strong>Plane-Shift:</strong> For 1 resource, a piece can move to the same square on an adjacent plane (Mind ↔ Body ↔ Spirit). The destination must be empty. This makes the target plane the new active plane.
        </li>
         <li>
            <strong>Resources:</strong> Gain 1 resource at the start of your turn (max 5).
        </li>
        <li>
            <strong>Victory Conditions:</strong>
            <ul className="pl-4 mt-1 space-y-1">
                <li>1. Deliver checkmate to an enemy King on any of the three planes.</li>
                <li>2. Achieve "Triune Dominance" by controlling the four central squares (D4,E4,D5,E5) on all three planes at the end of your turn.</li>
            </ul>
        </li>
    </ul>
    </>
);

const HelmbreakerRules = () => (
    <>
      <h4 className="font-cinzel text-base font-bold text-red-400 mb-2 tracking-wider">Game Rules: Helmbreaker</h4>
        <ul className="space-y-2 text-xs text-gray-400 list-disc list-inside">
        <li>
            <strong>Asymmetric Siege:</strong> The Operator (White) is the Invader; the AI (Black) is the Defender.
        </li>
        <li>
            <strong>Invader's Goal:</strong> Capture the Defender's Fortress King to win.
        </li>
        <li>
            <strong>Defender's Goal:</strong> Survive for 40 turns to win.
        </li>
        <li>
            <strong>Siege Engines (❖):</strong> Move one square forward (or diag-forward). Cannot capture. They damage fortifications on move.
        </li>
    </ul>
    </>
);

const RiteRules = () => (
    <>
      <h4 className="font-cinzel text-base font-bold text-red-400 mb-2 tracking-wider">Game Rules: Rite of Reduction</h4>
      <ul className="space-y-2 text-xs text-gray-400 list-disc list-inside">
        <li>
            <strong>Entropy Rule:</strong> After every 10 total moves, the outermost ring of the board collapses and becomes inactive.
        </li>
        <li>
            <strong>Essence:</strong> Each piece has an essence value (K=10, Q=9, etc.). Capture pieces to reduce the opponent's total essence.
        </li>
        <li>
            <strong>Victory Conditions:</strong>
            <ul className="pl-4 mt-1 space-y-1">
                <li>1. Standard Checkmate.</li>
                <li>2. Opponent's King is destroyed by board collapse.</li>
                <li>3. Opponent's total essence is reduced to zero.</li>
                <li>4. Last Stand: If no moves are possible, highest essence wins.</li>
            </ul>
        </li>
    </ul>
    </>
);


const GameRules: React.FC<GameRulesProps> = ({ gameMode }) => {
    const renderRules = () => {
        switch (gameMode) {
            case 'leviathan': return <LeviathanRules />;
            case 'chess': return <ChessRules />;
            case 'lambda': return <LambdaRules />;
            case 'helmbreaker': return <HelmbreakerRules />;
            case 'rite': return <RiteRules />;
            default: return null;
        }
    }

  return (
    <div className="mt-6 border-t border-gray-700/50 pt-4">
      {renderRules()}
    </div>
  );
};

export default GameRules;