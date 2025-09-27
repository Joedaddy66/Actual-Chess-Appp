import React, { useState, useMemo, useEffect } from 'react';
import type { GameState, GameMode, LegalMove, VictoryState } from '../types';
import { getLegalMoves } from '../services/moveLogic';
import { pieceImages, fallbackChessPieces } from '../services/pieceImages';

interface GameBoardProps {
  gameState: GameState;
  onMove: (from: string, to: string) => void;
  isAiThinking: boolean;
  gameMode: GameMode;
  aiMoveHighlight: { from: string | null; to: string | null };
  victoryState: VictoryState;
}

// Helper to get coordinates for absolute positioning of animations
const getCoords = (square: string): [number, number] => {
  const col = square.charCodeAt(0) - 'A'.charCodeAt(0);
  const row = 8 - parseInt(square.charAt(1));
  return [row, col];
};


const GameBoard: React.FC<GameBoardProps> = ({ gameState, onMove, isAiThinking, gameMode, aiMoveHighlight, victoryState }) => {
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [animatingCaptures, setAnimatingCaptures] = useState<Record<string, {square: string, piece: string}>>({});
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  const { board, meta } = gameState;

  const cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const rows = ['8', '7', '6', '5', '4', '3', '2', '1'];
  
  const legalMoves: LegalMove[] = useMemo(() => {
    if (!selectedSquare) return [];
    const piece = board[selectedSquare];
    if (!piece) return [];
    // Assuming 'W' is always the player for now
    return getLegalMoves(selectedSquare, piece, gameState, 'W', gameMode);
  }, [selectedSquare, gameState, gameMode]);

  const handleSquareClick = (squareId: string) => {
    if (isAiThinking || isAnimating || victoryState) return;

    if (selectedSquare) {
      const isValidMove = legalMoves.some(move => move.to === squareId);
      
      if (isValidMove) {
        const isCapture = board[squareId] && legalMoves.some(m => m.to === squareId && m.type === 'capture');

        if (isCapture) {
          const pieceToCapture = board[squareId]!;
          const captureKey = `${squareId}-${Date.now()}`;
          
          setIsAnimating(true); // Prevent other actions during animation
          setAnimatingCaptures(prev => ({ ...prev, [captureKey]: { square: squareId, piece: pieceToCapture } }));

          // Delay the actual move to let the animation play out completely.
          // This ensures the capture animation is seen before the piece moves.
          setTimeout(() => {
            onMove(selectedSquare, squareId);
            setIsAnimating(false);
            
            // Clean up the animation state after it's fully finished
            setAnimatingCaptures(prev => {
              const next = { ...prev };
              delete next[captureKey];
              return next;
            });
          }, 800); // Duration MUST match the new CSS animation time

        } else {
          // Regular move, no animation delay needed
          onMove(selectedSquare, squareId);
        }
      }
      
      setSelectedSquare(null);

    } else if (board[squareId] && board[squareId].startsWith('W')) { // Select a piece
      setSelectedSquare(squareId);
    }
  };
  
  const getPieceStyle = (piece: string): React.CSSProperties => {
    if (gameMode !== 'chess' && gameMode !== 'rite' && gameMode !== 'helmbreaker') return {};

    const color = piece.charAt(0);
    // Bone/Light Stone pieces
    if (color === 'W') {
        return {
            color: '#e2e8f0', // slate-200
            textShadow: `
                0px 1px 0px #a8a29e, 
                0px 2px 0px #78716c, 
                0px 3px 0px #57534e, 
                0px 4px 8px rgba(0,0,0,0.6)
            `,
        };
    } 
    // Obsidian pieces
    else { // 'B'
        const aiStyle: React.CSSProperties = isAiThinking ? {
            color: '#86efac' // Animation is handled by a class now
        } : {
            color: '#1e293b', // slate-800
            textShadow: `
                0px 1px 0px #0f172a, 
                0px 2px 0px #020617, 
                0px 3px 5px rgba(0,0,0,0.8),
                0 0 5px rgba(0,0,0,0.7)
            `,
        };
        return aiStyle;
    }
  };

  const renderPiece = (piece: string) => {
    if (gameMode === 'leviathan') {
      return 'Λ';
    }
    
    const imageUrl = pieceImages[piece];
    if (imageUrl) {
      return (
        <img 
          src={imageUrl} 
          alt={piece}
          className="w-full h-full object-contain"
          onError={(e) => {
            // Fallback to Unicode character if image fails to load
            const target = e.target as HTMLImageElement;
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = fallbackChessPieces[piece] || '?';
              parent.className = parent.className.replace('object-contain', '');
            }
          }}
        />
      );
    }
    
    return fallbackChessPieces[piece] || '?';
  };
  
  const isLegalMove = (squareId: string): LegalMove | undefined => legalMoves.find(move => move.to === squareId);

  return (
    <div className={`relative aspect-square p-2 bg-black/50 rounded-lg border-4 border-gray-800 shadow-2xl mt-4 transition-opacity duration-300`}>
       {isAiThinking && <div className="absolute inset-0 bg-black/40 z-10 pointer-events-none rounded-md"></div>}
      <div className="grid grid-cols-8">
        {rows.map((row, rowIndex) =>
          cols.map((col, colIndex) => {
            const squareId = `${col}${row}`;
            const piece = board[squareId];
            const isSelected = selectedSquare === squareId;
            const pieceColor = piece ? piece.charAt(0) : '';
            const legalMoveInfo = isLegalMove(squareId);
            const isAiHighlight = squareId === aiMoveHighlight.from || squareId === aiMoveHighlight.to;
            const isActive = meta?.activeSquares?.[squareId] ?? true;
            const fortificationHealth = meta?.fortifications?.[squareId];
            
            return (
              <div
                key={squareId}
                onClick={() => handleSquareClick(squareId)}
                className={`group aspect-square flex items-center justify-center rounded-sm transition-all duration-150 relative
                  ${!isActive ? 'square-collapsed' :
                    (rowIndex + colIndex) % 2 === 0 
                      ? 'bg-[#b9936c]' // Light wood
                      : 'bg-[#614126]' // Dark wood
                  }
                  ${isSelected ? 'ring-2 ring-red-500 z-20' : ''}
                  ${isAiHighlight ? 'animate-ai-glow z-20' : ''}
                  ${victoryState ? 'cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {fortificationHealth && fortificationHealth > 0 && (
                  <div className="absolute inset-0 border-2 border-yellow-300/50 rounded-sm pointer-events-none flex items-end justify-end p-0.5">
                     <span className="text-xs font-bold text-yellow-200" style={{textShadow: '0 0 2px black'}}>{fortificationHealth}</span>
                  </div>
                )}
                {piece && isActive && (
                  <div 
                    className={`w-full h-full flex items-center justify-center font-bold text-5xl transition-all duration-200 ease-in-out
                      ${gameMode === 'leviathan' 
                        ? `rounded-full shadow-lg ${pieceColor === 'W' ? 'bg-slate-200 text-slate-900' : 'bg-slate-800 text-slate-100 border-2 border-slate-500'}` 
                        : `group-hover:scale-125 group-hover:-translate-y-2 group-hover:drop-shadow-[0_5px_15px_rgba(239,68,68,0.4)]`
                      }
                      ${isSelected ? 'scale-125 -translate-y-2 drop-shadow-[0_5px_15px_rgba(239,68,68,0.4)]' : ''}
                      ${isAiThinking && pieceColor === 'B' ? 'piece-ai-thinking' : ''}
                    `}
                    style={getPieceStyle(piece)}
                  >
                    {renderPiece(piece)}
                  </div>
                )}
                 {selectedSquare && legalMoveInfo && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className={`rounded-full transition-all duration-200
                      ${legalMoveInfo.type === 'capture' 
                        ? 'w-10 h-10 ring-2 ring-red-500/80 bg-red-500/20 group-hover:ring-4' 
                        : 'w-4 h-4 bg-red-500/40 group-hover:scale-150 group-hover:bg-red-500/80'
                      }`}
                    ></div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
       {/* Capture animations overlay */}
       <div className="absolute inset-0 pointer-events-none w-full h-full">
            {Object.entries(animatingCaptures).map(([key, { square, piece }]) => {
                const [row, col] = getCoords(square);
                if (row === null || col === null) return null;
                return (
                    <div 
                        key={key} 
                        className="absolute w-[12.5%] h-[12.5%] flex items-center justify-center" 
                        style={{ top: `${row * 12.5}%`, left: `${col * 12.5}%` }}
                    >
                        <div 
                          className="w-full h-full flex items-center justify-center font-bold text-5xl animate-takedown"
                          style={getPieceStyle(piece)}
                        >
                           {renderPiece(piece)}
                        </div>
                    </div>
                )
            })}
        </div>
    </div>
  );
};

export default GameBoard;
