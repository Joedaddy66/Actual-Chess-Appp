import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { BoardState, GameState, GameMode, MovePair, Player, VictoryState, Essence } from './types';
import { getBackendResponse } from './services/geminiService';
import { startTelemetryPolling, TelemetryResponse } from './src/api/telemetry';
import GameBoard from './components/GameBoard';
import ServerLog from './components/ServerLog';
import CiCdPipeline from './components/CiCdPipeline';
import CommandFlow from './components/CommandFlow';
import Card from './components/Card';
import GameRules from './components/GameRules';
import { ShieldIcon, CpuIcon, RocketIcon } from './components/icons';
import LoginScreen from './components/LoginScreen';
import GameModeSwitcher from './components/GameModeSwitcher';
import Tutorial from './components/Tutorial';
import TitleBar from './components/TitleBar';
import MoveHistory from './components/MoveHistory';
import GameTimer from './components/GameTimer';
import GameOverScreen from './components/GameOverScreen';
import EssenceTracker from './components/EssenceTracker';
import LambdaControls from './components/LambdaControls';
import HelmbreakerInfo from './components/HelmbreakerInfo';

const initialLeviathanBoard: BoardState = {
  'A1': 'W', 'B1': 'W', 'C1': 'W', 'D1': 'W', 'E1': 'W', 'F1': 'W', 'G1': 'W', 'H1': 'W',
  'A2': 'W', 'B2': 'W', 'C2': 'W', 'D2': 'W', 'E2': 'W', 'F2': 'W', 'G2': 'W', 'H2': 'W',
  'A7': 'B', 'B7': 'B', 'C7': 'B', 'D7': 'B', 'E7': 'B', 'F7': 'B', 'G7': 'B', 'H7': 'B',
  'A8': 'B', 'B8': 'B', 'C8': 'B', 'D8': 'B', 'E8': 'B', 'F8': 'B', 'G8': 'B', 'H8': 'B',
};

const initialChessBoard: BoardState = {
  // White back rank (Rook, Knight, Bishop, Queen, King, Bishop, Knight, Rook)
  'A1': 'WR', 'B1': 'WN', 'C1': 'WB', 'D1': 'WQ', 'E1': 'WK', 'F1': 'WB', 'G1': 'WN', 'H1': 'WR',
  // White pawns
  'A2': 'WP', 'B2': 'WP', 'C2': 'WP', 'D2': 'WP', 'E2': 'WP', 'F2': 'WP', 'G2': 'WP', 'H2': 'WP',
  // Black pawns
  'A7': 'BP', 'B7': 'BP', 'C7': 'BP', 'D7': 'BP', 'E7': 'BP', 'F7': 'BP', 'G7': 'BP', 'H7': 'BP',
  // Black back rank (Rook, Knight, Bishop, Queen, King, Bishop, Knight, Rook)
  'A8': 'BR', 'B8': 'BN', 'C8': 'BB', 'D8': 'BQ', 'E8': 'BK', 'F8': 'BB', 'G8': 'BN', 'H8': 'BR',
};

const initialEmptyBoard: BoardState = {};

const INITIAL_TIME = 600; // 10 minutes in seconds

const cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const rows = ['1', '2', '3', '4', '5', '6', '7', '8'];
const initialActiveSquares: { [key: string]: boolean } = {};
for (const col of cols) {
  for (const row of rows) {
    initialActiveSquares[`${col}${row}`] = true;
  }
}

const initialEssence: Essence = { white: 39, black: 39 };

const initialGameState: GameState = {
  board: initialChessBoard,
  meta: {}
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [nickname, setNickname] = useState('');
  const [gameMode, setGameMode] = useState<GameMode>('chess');
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [serverLogs, setServerLogs] = useState<string[]>(['[SYSTEM] Core Engine Initialized. Waiting for client connection...']);
  const [cicdLogs, setCicdLogs] = useState<string[]>([]);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [command, setCommand] = useState<string | null>(null);
  const [backendResponse, setBackendResponse] = useState<any | null>(null);
  const [isTutorialActive, setTutorialActive] = useState(false);
  const [moveHistory, setMoveHistory] = useState<MovePair[]>([]);
  const [whiteTime, setWhiteTime] = useState(INITIAL_TIME);
  const [blackTime, setBlackTime] = useState(INITIAL_TIME);
  const [activePlayer, setActivePlayer] = useState<Player>('W');
  const [aiMoveHighlight, setAiMoveHighlight] = useState<{ from: string | null; to: string | null }>({ from: null, to: null });
  const [victoryState, setVictoryState] = useState<VictoryState>(null);
  const [essence, setEssence] = useState<Essence>(initialEssence);
  const [displayPlane, setDisplayPlane] = useState<'mind' | 'body' | 'spirit'>('body');
  const cicdAnimationRun = useRef(false);

  // API Integration State
  const [rttMs, setRttMs] = useState<number | null>(null);
  const [telemetry, setTelemetry] = useState<TelemetryResponse | null>(null);
  const [bias, setBias] = useState<number>(0.0);
  const abortCtrl = useMemo(() => new AbortController(), []);
  const isMounted = useRef(true);

  const resetGameState = useCallback((mode: GameMode) => {
    let initialState: GameState;
    setEssence(initialEssence);
    setVictoryState(null);
    setDisplayPlane('body');

    switch (mode) {
      case 'leviathan':
        initialState = { board: initialLeviathanBoard, meta: {} };
        break;
      case 'chess':
        initialState = { board: initialChessBoard, meta: {} };
        break;
      case 'lambda':
        const lambdaPlanes = {
            mind: initialEmptyBoard,
            body: initialChessBoard,
            spirit: initialEmptyBoard,
        };
        initialState = { 
            board: lambdaPlanes.body, 
            meta: { 
                planes: lambdaPlanes,
                currentPlane: 'body',
                resources: { white: 1, black: 1 }
            }
        };
        break;
      case 'helmbreaker':
        initialState = { 
            board: {
                'D1':'WSE', 'E1':'WSE', // Siege Engines
                'A2':'WP', 'B2':'WP', 'C2':'WP', 'D2':'WP', 'E2':'WP', 'F2':'WP', 'G2':'WP', 'H2':'WP',
                'D8':'BFK', // Fortress King
                'C7':'BGR', 'D7':'BGR', 'E7':'BGR', // Guards
            }, 
            meta: {
                turnLimit: 40,
                fortifications: { 'C8': 3, 'E8': 3 }
            }
        };
        break;
      case 'rite':
        initialState = { 
            board: initialChessBoard, 
            meta: { ply: 0, activeSquares: { ...initialActiveSquares } } 
        };
        break;
      default:
        initialState = { board: initialChessBoard, meta: {} };
    }
    setGameState(initialState);
    setServerLogs(['[SYSTEM] Core Engine re-initialized for new game mode.']);
    setBackendResponse(null);
    setMoveHistory([]);
    setWhiteTime(INITIAL_TIME);
    setBlackTime(INITIAL_TIME);
    setActivePlayer('W');
  }, []);

  const handleGameModeChange = (mode: GameMode) => {
    setGameMode(mode);
    resetGameState(mode);
  };

  const addServerLog = useCallback((log: string) => {
    setServerLogs(prev => [...prev.slice(-10), log]);
  }, []);
  
  // Timer effect
  useEffect(() => {
    if (victoryState || whiteTime <= 0 || blackTime <= 0) {
      return;
    }

    const timer = setInterval(() => {
      if (activePlayer === 'W' && !isAiThinking) {
        setWhiteTime(t => Math.max(0, t - 1));
      } 
      else if (activePlayer === 'B') {
        setBlackTime(t => Math.max(0, t - 1));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [activePlayer, isAiThinking, whiteTime, blackTime, victoryState]);

  const handleMove = async (from: string, to: string) => {
    if (isAiThinking || victoryState || (whiteTime <= 0 || blackTime <= 0)) return;

    const originalGameState = { ...gameState };
    const playerMoveBoard = { ...originalGameState.board };
    playerMoveBoard[to] = playerMoveBoard[from];
    delete playerMoveBoard[from];
    
    setGameState(gs => ({ ...gs, board: playerMoveBoard }));
    setActivePlayer('B'); 
    setIsAiThinking(true);

    const userCommand = `move ${from} to ${to}`;
    setCommand(userCommand);
    setBackendResponse(null);
    addServerLog(`[CLIENT] Command sent: ${userCommand}`);

    try {
      addServerLog(`[ENGINE] Processing command for ${gameMode}...`);
      const response = await getBackendResponse(userCommand, originalGameState, gameMode, addServerLog);
      setBackendResponse(response);

      if (response.status === 'success') {
        addServerLog(`[ENGINE] Move validated. New state received.`);
        addServerLog(`[ENGINE] ${response.message}`);
        if (response.aiMove) {
          addServerLog(`[AI] AI move: ${response.aiMove}`);
        }
        if (response.playerMoveNotation && response.aiMoveNotation) {
          setMoveHistory(prev => [...prev, { white: response.playerMoveNotation, black: response.aiMoveNotation }]);
        }
        if (response.essence) {
          setEssence(response.essence);
        }

        setAiMoveHighlight({ from: response.aiMoveFrom, to: response.aiMoveTo });
        
        setTimeout(() => {
          if (response.newBoardState) {
            let newMeta = response.newGameMeta || gameState.meta;
            if (gameMode === 'lambda' && newMeta.planes) {
               // In Lambda, the board to display might not be the active plane if the AI plane-shifted
               // The AI tells us the new active plane in `currentPlane`
               const activePlane = newMeta.currentPlane || 'body';
               setGameState({ board: newMeta.planes[activePlane], meta: newMeta });
               setDisplayPlane(activePlane);
            } else {
               setGameState({ board: response.newBoardState, meta: newMeta });
            }
          }

          if (response.victoryState) {
            setVictoryState(response.victoryState);
            addServerLog(`[SYSTEM] GAME OVER: ${response.victoryState.reason}`);
          }

          setTimeout(() => setAiMoveHighlight({ from: null, to: null }), 500); 
          
          setIsAiThinking(false);
          setActivePlayer('W'); 
          setCommand(null);
        }, 100);

      } else {
        addServerLog(`[ENGINE] Error: ${response.message}`);
        setGameState(originalGameState); 
        setIsAiThinking(false);
        setActivePlayer('W');
        setCommand(null);
      }
    } catch (error) {
      console.error("Error communicating with backend:", error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      addServerLog(`[SYSTEM] CRITICAL ERROR: ${errorMessage}`);
      setBackendResponse({ status: 'error', message: 'Failed to connect to the Core Engine.' });
      setGameState(originalGameState);
      setIsAiThinking(false);
      setActivePlayer('W');
      setCommand(null);
    }
  };
  
  useEffect(() => {
    if (!isAuthenticated || cicdAnimationRun.current) {
        return;
    }
    
    const cicdEvents = [
      'Commit `feat: implement multi-game support` pushed to main',
      'CI pipeline triggered...',
      'Running unit tests (Leviathan & Chess)...',
      'Tests passed (212/212)',
      'Starting build for Android & iOS...',
      'Build successful.',
      'Deploying to staging environment...',
      'Staging deployment complete. Awaiting QA.',
      'QA approved. Deploying to production...',
      'Production deployment successful! v2.0.0 is live.'
    ];
    let i = 0;
    const interval = setInterval(() => {
      if (i < cicdEvents.length) {
        setCicdLogs(prev => [...prev, cicdEvents[i]]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 150);
    
    cicdAnimationRun.current = true;
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Telemetry polling effect
  useEffect(() => {
    if (!isAuthenticated) return;
    
    isMounted.current = true;
    startTelemetryPolling((t) => {
      if (!isMounted.current) return;
      setTelemetry(t);
      addServerLog(`[TELEMETRY] RTT: ${t.rtt_ms}ms, Health: ${t.health}, Cost: ${t.cost}`);
    }, { intervalMs: 3000, signal: abortCtrl.signal });

    return () => {
      isMounted.current = false;
      abortCtrl.abort();
    };
  }, [isAuthenticated, abortCtrl]);

  const handleLogin = (name: string, faction: string) => {
    setUsername(name);
    setNickname(faction);
    setIsAuthenticated(true);
    addServerLog(`[SYSTEM] Operator '${name}' (${faction}) authenticated and connected.`);
    setTutorialActive(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername('');
    setNickname('');
    resetGameState(gameMode);
    cicdAnimationRun.current = false;
    setCicdLogs([]);
  };

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }
  
  const boardToDisplay = gameMode === 'lambda' ? (gameState.meta.planes?.[displayPlane] ?? gameState.board) : gameState.board;

  return (
    <div className={`min-h-screen p-4 sm:p-6 lg:p-8 ${isAiThinking ? 'ai-thinking' : ''}`}>
      {victoryState && <GameOverScreen victoryState={victoryState} onPlayAgain={() => resetGameState(gameMode)} />}
      {isTutorialActive && <Tutorial onClose={() => setTutorialActive(false)} />}
      <TitleBar 
        username={username} 
        nickname={nickname} 
        onLogout={handleLogout} 
        onRunTutorial={() => setTutorialActive(true)} 
      />
      <header className="text-center mb-6">
        <h1 className="font-cinzel text-4xl sm:text-5xl font-bold text-red-500 tracking-wider" style={{ textShadow: '0 0 10px rgba(239, 68, 68, 0.3)' }}>
          "Hollow App" Architecture
        </h1>
        <p className="text-gray-400 mt-2 max-w-3xl mx-auto">
          A visual demonstration of a thin client front-end powered by a modular, AI-driven back-end engine.
        </p>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-1 flex flex-col gap-6" data-tutorial="step-1">
          <Card>
            <Card.Header>
              <ShieldIcon />
              <Card.Title>Front-End Client</Card.Title>
            </Card.Header>
            <Card.Body>
              <Card.Description>
                Renders the game state from the Core Engine. Contains minimal logic. Click a piece, then a square to move.
              </Card.Description>
              <GameModeSwitcher currentGameMode={gameMode} onGameModeChange={handleGameModeChange} />
              {gameMode === 'lambda' && <LambdaControls meta={gameState.meta} displayPlane={displayPlane} onPlaneChange={setDisplayPlane} />}
              {gameMode === 'helmbreaker' && <HelmbreakerInfo meta={gameState.meta} />}
              <GameBoard 
                gameState={{...gameState, board: boardToDisplay}}
                onMove={handleMove} 
                isAiThinking={isAiThinking} 
                gameMode={gameMode} 
                aiMoveHighlight={aiMoveHighlight}
                victoryState={victoryState}
              />
              {gameMode === 'rite' && <EssenceTracker essence={essence} />}
              <GameTimer whiteTime={whiteTime} blackTime={blackTime} activePlayer={activePlayer} isAiThinking={isAiThinking} />
              <GameRules gameMode={gameMode} />
              
              {/* API Integration Dashboard */}
              <div className="mt-4 p-3 bg-gray-800 rounded-lg border border-gray-600">
                <h3 className="text-sm font-semibold text-purple-400 mb-2">API Telemetry Dashboard</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>RTT: {rttMs !== null ? `${rttMs} ms` : telemetry?.rtt_ms ? `${telemetry.rtt_ms} ms` : '—'}</div>
                  <div>Health: {telemetry?.health ?? '—'}</div>
                  <div>Cost: {telemetry?.cost ?? '—'}</div>
                  <div>Carbon: {telemetry?.carbon ?? '—'}</div>
                  <div className="col-span-2">Error Rate: {telemetry?.error_rate ?? '—'}</div>
                </div>
                <div className="mt-2">
                  <label className="block text-xs text-gray-400 mb-1">
                    Creative Context Bias: {bias.toFixed(2)}
                  </label>
                  <input
                    type="range"
                    min={-1}
                    max={1}
                    step={0.05}
                    value={bias}
                    onChange={(e) => setBias(parseFloat(e.target.value))}
                    className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>

        {/* Middle Column */}
        <div className="lg:col-span-1 flex flex-col gap-6" data-tutorial="step-2">
          <Card className="card-engine">
            <Card.Header className="card-header">
              <CpuIcon className="icon-engine" />
              <Card.Title className="title-engine">Core Engine</Card.Title>
            </Card.Header>
            <Card.Body>
              <Card.Description>
                A headless, AI-powered engine that manages state, rules, and logic for the selected game mode.
              </Card.Description>
              <MoveHistory history={moveHistory} />
              <CommandFlow command={command} response={backendResponse} isLoading={isAiThinking} />
              <ServerLog logs={serverLogs} />
            </Card.Body>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1 flex flex-col gap-6" data-tutorial="step-3">
          <Card>
            <Card.Header>
              <RocketIcon />
              <Card.Title>CI/CD Pipeline</Card.Title>
            </Card.Header>
            <Card.Body>
              <Card.Description>
                Automated assembly line that builds, tests, and deploys the Core Engine and the Front-End client seamlessly.
              </Card.Description>
              <CiCdPipeline logs={cicdLogs} />
            </Card.Body>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default App;
