import { GoogleGenAI, Type } from "@google/genai";
import type { GameState, GameMode } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper function for exponential backoff delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    status: { type: Type.STRING, enum: ["success", "error"] },
    message: { type: Type.STRING },
    newBoardState: {
      type: Type.STRING,
      description: "A JSON string representation of the entire board state after the move. For Lambda Protocol, this is the state of the NEW active plane. It must be a valid JSON string. Example: '{\"A1\":\"W\",\"B1\":\"W\",...}' or '{\"A1\":\"WR\",\"B1\":\"WN\",...}'",
    },
    newGameMeta: {
        type: Type.OBJECT,
        description: "A JSON object containing the game's metadata. This is CRITICAL for complex variants. For Lambda, it MUST include the full state of all three 'planes'. Example: {\"ply\": 2, \"activeSquares\": {\"A1\": true, ...}}",
        properties: {
          ply: { type: Type.NUMBER },
          activeSquares: {
              type: Type.STRING,
              description: "A JSON string representation of an object mapping square IDs to a boolean indicating if they are active. Example: '{\"A1\":true,\"A2\":true,...}'",
          },
          // Lambda Protocol
          planes: {
            type: Type.OBJECT,
            properties: {
                mind: { type: Type.STRING, description: "JSON string of the 'mind' plane's board state." },
                body: { type: Type.STRING, description: "JSON string of the 'body' plane's board state." },
                spirit: { type: Type.STRING, description: "JSON string of the 'spirit' plane's board state." },
            }
          },
          currentPlane: { type: Type.STRING, enum: ['mind', 'body', 'spirit'] },
          resources: {
            type: Type.OBJECT,
            properties: {
                white: { type: Type.NUMBER },
                black: { type: Type.NUMBER },
            }
          },
          // Helmbreaker
          turnLimit: { type: Type.NUMBER },
          fortifications: { type: Type.STRING, description: "JSON string of fortification healths. e.g. '{\"C8\": 2, \"E8\": 1}'" }
        },
        nullable: true,
      },
    essence: {
        type: Type.OBJECT,
        description: "An object containing the total essence for white and black. Example: {\"white\": 39, \"black\": 39}",
        properties: {
            white: { type: Type.NUMBER },
            black: { type: Type.NUMBER },
        },
        nullable: true,
    },
    victoryState: {
        type: Type.OBJECT,
        description: "An object indicating the game's winner and the reason, or null if the game is ongoing.",
        properties: {
            winner: { type: Type.STRING, enum: ["W", "B", "draw"] },
            reason: { type: Type.STRING },
        },
        nullable: true,
    },
    aiMove: {
      type: Type.STRING,
      description: "A description of the AI's counter-move, or null if no move was made.",
      nullable: true
    },
    playerMoveNotation: {
        type: Type.STRING,
        description: "The player's move in an appropriate notation (e.g., Algebraic for Chess, coordinate for Leviathan).",
        nullable: true
    },
    aiMoveNotation: {
        type: Type.STRING,
        description: "The AI's counter-move in an appropriate notation.",
        nullable: true
    },
    aiMoveFrom: {
        type: Type.STRING,
        description: "The starting square of the AI's counter-move (e.g., 'G8').",
        nullable: true
    },
    aiMoveTo: {
        type: Type.STRING,
        description: "The ending square of the AI's counter-move (e.g., 'F6').",
        nullable: true
    },
  },
  required: ["status", "message"],
};


const getLeviathanPrompt = (currentGameState: GameState, command: string) => `
    You are the back-end game engine for a chess-like wargame called 'Leviathan', played on an 8x8 grid.
    The player's pieces are 'W' (White) and the AI's pieces are 'B' (Black).

    GAME RULES:
    1.  **Forward Direction:**
        - 'W' pieces move "forward" by increasing their row number (e.g., from row 2 to 3).
        - 'B' pieces move "forward" by decreasing their row number (e.g., from row 7 to 6).
    2.  **Basic Move:** A piece moves one square forward to an EMPTY square.
    3.  **Capture:** A piece captures an opponent's piece by moving one square DIAGONALLY FORWARD.
    4.  **Momentum Rule:** After a piece makes a **Basic Move** (NOT a capture) to an empty square, if the very next square directly in front of it is ALSO empty, it MUST immediately move forward to that second square. This completes a single "Momentum Move".
        - e.g., If 'W' at C2 moves to an empty C3, and C4 is also empty, the piece MUST end its turn at C4.
        - e.g., If 'B' at C7 moves to an empty C6, and C5 is also empty, the piece MUST end its turn at C5.
        - This rule does not apply if the first move was a capture.
    5.  A move is invalid if it violates any of these rules (e.g., moving to an occupied square, moving backwards).

    YOUR TASK:
    You are the authoritative game engine. Process the player's command based on the current game state and the rules.
    1.  **Validate Player's Move:** Check if the player's command is a valid move.
    2.  **Update State:** If valid, update the game state with the result of the player's move (including any Momentum effect).
    3.  **AI Counter-Move:** After a valid player move, you MUST make a strategic counter-move for a 'B' piece. Your move MUST also follow all game rules, including Momentum. Prioritize captures if available.
    4.  **Final State:** Update the game state again with the result of your AI move.
    5.  **Respond:** Return the final game state and a descriptive message.

    Current Board State:
    ${JSON.stringify(currentGameState.board, null, 2)}

    Received Command: "${command}"

    Process this command and respond ONLY with a JSON object conforming to the schema.
    - If the move is valid, the message should describe both the player's move and your counter-move.
    - Provide 'playerMoveNotation' and 'aiMoveNotation' using coordinate notation (e.g., "C2-C4", "G7-G5").
    - **Crucially**, also provide the AI's move as 'aiMoveFrom' and 'aiMoveTo' coordinates.
    - If the player's move is invalid, return an "error" status with a clear message explaining why. The notation and move fields can be null.
    - The 'newBoardState' field MUST be a string containing valid JSON representing the board AFTER BOTH moves are complete.
  `;

const getChessPrompt = (currentGameState: GameState, command: string) => `
    You are the back-end game engine for a game of Chess.
    The player's pieces are White (e.g., 'WP', 'WR') and the AI's pieces are Black (e.g., 'BP', 'BR').
    The pieces are: P (Pawn), R (Rook), N (Knight), B (Bishop), Q (Queen), K (King).

    CHESS RULES:
    1.  **Pawn:** Moves 1 square forward. On its first move, it can move 2 squares forward. Captures one square diagonally forward. (No en passant or promotion).
    2.  **Rook:** Moves any number of squares horizontally or vertically.
    3.  **Knight:** Moves in an 'L' shape (2 squares in one direction, then 1 square perpendicular). It can jump over other pieces.
    4.  **Bishop:** Moves any number of squares diagonally.
    5.  **Queen:** Moves any number of squares horizontally, vertically, or diagonally.
    6.  **King:** Moves one square in any direction. (No castling).
    7.  A move is invalid if it is blocked by another piece (except for Knights) or does not follow the piece's movement rule. A piece is captured by moving onto its square.

    YOUR TASK:
    You are the authoritative game engine for Chess.
    1.  **Validate Player's Move:** The player (White) sends a command. Check if it's a legal move according to chess rules.
    2.  **Update State:** If valid, update the game state with the player's move.
    3.  **AI Counter-Move:** After a valid player move, make a strategic counter-move for Black. Your move MUST be legal.
    4.  **Final State:** Update the game state again with the result of your AI move.
    5.  **Respond:** Return the final game state.

    Current Board State:
    ${JSON.stringify(currentGameState.board, null, 2)}

    Received Command: "${command}"

    Process this command and respond ONLY with a JSON object conforming to the schema.
    - If the move is valid, the message should describe the player's move and your counter-move.
    - Provide 'playerMoveNotation' and 'aiMoveNotation' using standard algebraic notation (e.g., "e4", "Nf6").
    - **Crucially**, also provide the AI's move as 'aiMoveFrom' and 'aiMoveTo' coordinates (e.g., 'G8', 'F6').
    - If the player's move is invalid, return an "error" status with a clear message. The notation and move fields can be null.
    - The 'newBoardState' field MUST be a string containing valid JSON representing the board AFTER BOTH moves are complete.
`;

const getRitePrompt = (currentGameState: GameState, command: string) => `
    You are the back-end game engine for a chess variant called 'Rite of Reduction'.
    The game state is composed of a 'board' and 'metadata'.

    **PIECE ESSENCE VALUES:**
    - King (K): 10
    - Queen (Q): 9
    - Rook (R): 5
    - Bishop (B): 3
    - Knight (N): 3
    - Pawn (P): 1
    Total starting essence for each side is 39.

    **GAME RULES:**
    1.  **Movement:** Standard chess rules apply.
    2.  **Entropy Rule (Board Collapse):** After every 10 total moves (when 'ply' is a multiple of 10), the board's outermost active ring of squares becomes inactive. This happens AFTER the move that reaches the threshold.
    3.  **Collapse Mechanic:** Pieces on squares that collapse are removed from the game, and their essence is lost. A move to an inactive square is invalid.
    4.  **Essence:** Each piece has an essence value. When a piece is captured or removed by collapse, its essence is deducted from its owner's total.

    **VICTORY CONDITIONS (in order of precedence):**
    1.  **Checkmate:** Standard checkmate wins the game instantly.
    2.  **King Destruction by Collapse:** If a player's King is on a square that collapses, that player loses instantly.
    3.  **Essence Collapse:** If a player's total essence is reduced to 0 or less, they lose instantly.
    4.  **Last Stand:** If the board collapses to a point where no legal moves are possible for either player, the player with the higher remaining total essence wins. If essence is equal, it's a draw.

    **YOUR TASK:**
    You are the authoritative engine. Process the player's command, apply all rules, perform a counter-move, and return the final state.
    1.  **Validate Player's Move:** Check if the player's command is a valid chess move to an active square.
    2.  **Apply Player's Move & Check Victory:** If valid, update the board, increment 'ply'. If it was a capture, update essence. Check for victory (checkmate, essence collapse).
    3.  **Check for Collapse (Player):** If the new 'ply' is a multiple of 10, collapse the next ring. Update 'activeSquares', remove pieces on collapsed squares, update essence totals, and check for victory again (King destruction, essence collapse).
    4.  **AI Counter-Move & Check Victory:** Make a strategic counter-move for Black to an active square. Update board, increment 'ply', update essence if capture. Check for victory.
    5.  **Check for Collapse (AI):** If the new 'ply' is a multiple of 10, collapse the board again, update everything, and check for victory one last time.
    6.  **Last Stand Check:** Before responding, if no pieces for a player can legally move, evaluate the Last Stand condition.
    7.  **Respond:** Return the final board state, metadata, essence totals, and victory state.

    Current Game State:
    ${JSON.stringify(currentGameState, null, 2)}

    Received Command: "${command}"

    Process this command and respond ONLY with a JSON object conforming to the schema.
    - If the game is ongoing, 'victoryState' MUST be null.
    - If a player wins or it's a draw, 'victoryState' MUST be populated with the winner and the reason.
    - You MUST always return the final 'newBoardState' (as a JSON string), 'newGameMeta' (containing a stringified 'activeSquares' field), and 'essence' objects.
`;

const getLambdaPrompt = (currentGameState: GameState, command: string) => `
    You are the back-end game engine for a complex chess variant called 'Lambda Protocol'.
    The game is played on three 8x8 boards simultaneously: the Mind, Body, and Spirit planes.

    **GAME STATE:**
    - The 'meta' object contains the state of all three planes ('meta.planes'), the current active plane ('meta.currentPlane'), and player resources ('meta.resources').
    - The top-level 'board' object represents the state of the CURRENTLY ACTIVE plane. This is redundant but useful context.

    **GAME RULES:**
    1.  **Normal Moves:** On a player's turn, they can make a standard chess move on the currently active plane. This costs 0 resources.
    2.  **Plane-Shifting (Special Move):**
        - A piece may move to the **SAME square** on an **ADJACENT plane** (Mind <-> Body <-> Spirit).
        - This special move costs 1 resource.
        - The destination square on the target plane MUST be empty.
        - After a piece plane-shifts, that plane becomes the new active plane for the OPPONENT'S turn.
        - A player cannot plane-shift to a plane that is not adjacent to the current one (e.g., Mind to Spirit is illegal).
    3.  **Resources:**
        - At the start of their turn, the current player gains 1 resource.
        - A player can hold a maximum of 5 resources.
    4.  **Interaction:** The planes are separate except for plane-shifting. A piece on the Body plane cannot capture or be blocked by a piece on the Mind or Spirit planes.

    **VICTORY CONDITIONS (checked at the end of every turn):**
    1.  **Checkmate:** Delivering checkmate to an opponent's King on ANY of the three planes wins the game instantly.
    2.  **Triune Dominance:** If a player simultaneously occupies all four central squares (D4, E4, D5, E5) on ALL THREE planes at the end of their turn, they win instantly.

    **YOUR TASK:**
    You are the authoritative engine. You must process the player's command, apply all rules, perform a strategic counter-move, and return the final, updated state.
    1.  **Update Resources:** At the beginning of the player's turn (before their move), add 1 resource to their total (max 5).
    2.  **Validate Player's Move:** Check if the player's command is a valid normal move or a valid plane-shift (and if they have enough resources). A 'move' command like "move E2 to E4" is a normal move. A command like "move E2 from body to mind" would be a plane-shift. The command from the client is simplified to "move FROM to TO", you must infer if it is a plane-shift if the 'TO' square is on another plane. For this simulation, the client will only send normal chess moves; you must decide if/when the AI should plane-shift.
    3.  **Apply Player's Move:** If valid, update the appropriate plane.
    4.  **Check Player Victory:** After the player's move, check for Checkmate or Triune Dominance.
    5.  **AI Counter-Move:**
        - First, add 1 resource to the AI's total (max 5).
        - Then, make a strategic counter-move for Black. Your move can be a standard chess move on the current plane OR a tactical plane-shift to another plane.
        - Your goal is to win. Prioritize checkmating threats, block Triune Dominance, and set up your own Triune Dominance.
    6.  **Apply AI Move:** Update the appropriate plane and resources. If it was a plane-shift, update the 'currentPlane' for the next turn.
    7.  **Check AI Victory:** After the AI's move, check for Checkmate or Triune Dominance.
    8.  **Respond:** Return the final game state.

    Current Game State (meta contains all planes):
    ${JSON.stringify(currentGameState, null, 2)}

    Received Command: "${command}"

    Process this command and respond ONLY with a JSON object conforming to the schema.
    - If the player's move is invalid, return an "error" status.
    - 'newBoardState' MUST be the JSON string of the NEW active plane after all moves are complete.
    - 'newGameMeta' MUST contain the updated 'planes' object (with all 3 boards as JSON strings), the new 'currentPlane' for the start of the next player's turn, and the final 'resources' for both players.
    - If a player wins, 'victoryState' MUST be populated. Otherwise, it MUST be null.
`;

const getHelmbreakerPrompt = (currentGameState: GameState, command: string) => `
    You are the back-end game engine for an asymmetric chess variant called 'Helmbreaker'.
    The Player is the Invader (White) and the AI is the Defender (Black).

    **PIECES:**
    - Invader (W): Standard pawns ('WP') and two Siege Engines ('WSE').
    - Defender (B): A single Fortress King ('BFK') and three Royal Guards ('BGR', which move like Rooks).
    - Fortifications: Some squares have walls with health, tracked in meta.fortifications.

    **GAME RULES:**
    1.  **Invader's Goal (Player):** Capture the Defender's Fortress King.
    2.  **Defender's Goal (AI):** Survive for 40 turns. If the turn limit is reached, the Defender wins.
    3.  **Movement:**
        - Pawns, Guards (Rooks), and the King move normally.
        - **Siege Engine (WSE):** Moves one square forward or diagonally forward. It CANNOT capture pieces. Instead, if it moves to an empty fortified square, it reduces the fortification's health by 1.
    4.  **Fortifications:** The Defender's back rank squares are fortified. They are like walls. Invader pieces cannot move onto a fortified square while it has health > 0, unless they are a Siege Engine.

    **YOUR TASK:**
    You are the authoritative engine for the Defender (Black).
    1.  **Validate Player's Move:** Check if the Invader's command is a valid move according to the rules. Update fortification health if a Siege Engine attacks.
    2.  **AI Counter-Move:** Make a strategic defensive move for Black. Your goal is to protect the Fortress King and stall the Invader. Prioritize capturing threatening pieces.
    3.  **Update State:** Update the board, turn limit, and fortification health.
    4.  **Check Victory:** Check if the Fortress King was captured (Invader wins) or if the turn limit was reached (Defender wins).
    5.  **Respond:** Return the final game state.

    Current Game State:
    ${JSON.stringify(currentGameState, null, 2)}

    Received Command: "${command}"

    Process this command and respond ONLY with a JSON object conforming to the schema.
    - 'newGameMeta' MUST contain the updated 'turnLimit' and a JSON string of the 'fortifications' state.
    - If a player wins, 'victoryState' MUST be populated.
`;

const getNotImplementedPrompt = (gameMode: string, currentGameState: GameState) => `
    You are the back-end game engine. The user has selected the game mode "${gameMode}".
    This game mode is not yet implemented.
    Your task is to respond with a JSON object indicating an error.
    - The status should be "error".
    - The message should be "Game mode '${gameMode}' is currently in development and not yet available to play."
    - The 'newBoardState' must be a JSON string representation of the current board state provided below, unchanged.
    - The 'newGameMeta' must be a JSON object containing the current game metadata.
    - All other optional fields in the schema should be null.

    Current Game State:
    ${JSON.stringify(currentGameState, null, 2)}

    Respond ONLY with a JSON object conforming to the schema.
`;


export const getBackendResponse = async (command: string, currentGameState: GameState, gameMode: GameMode, addServerLog: (log: string) => void): Promise<any> => {
  let prompt: string;
  switch (gameMode) {
    case 'leviathan':
      prompt = getLeviathanPrompt(currentGameState, command);
      break;
    case 'chess':
      prompt = getChessPrompt(currentGameState, command);
      break;
    case 'rite':
      prompt = getRitePrompt(currentGameState, command);
      break;
    case 'lambda':
      prompt = getLambdaPrompt(currentGameState, command);
      break;
    case 'helmbreaker':
      prompt = getHelmbreakerPrompt(currentGameState, command);
      break;
    default:
      // Fallback for any unexpected game modes
      prompt = getNotImplementedPrompt('unknown', currentGameState);
  }

  const MAX_RETRIES = 5;
  let attempt = 0;
  let backoffDelay = 2000; // Start with 2 seconds

  while (attempt < MAX_RETRIES) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: responseSchema,
          temperature: 0.5,
        },
      });

      const jsonText = response.text.trim();
      const parsedResponse = JSON.parse(jsonText);

      // Safely parse nested JSON strings from the response
      if (parsedResponse.newBoardState && typeof parsedResponse.newBoardState === 'string') {
          try {
              parsedResponse.newBoardState = JSON.parse(parsedResponse.newBoardState);
          } catch (e) {
              console.error("Failed to parse newBoardState JSON string:", e);
              throw new Error('The AI Core Engine returned an invalid board state format.');
          }
      }
       if (parsedResponse.newGameMeta?.activeSquares && typeof parsedResponse.newGameMeta.activeSquares === 'string') {
        try {
            parsedResponse.newGameMeta.activeSquares = JSON.parse(parsedResponse.newGameMeta.activeSquares);
        } catch (e) {
            console.error("Failed to parse activeSquares JSON string:", e);
            throw new Error('The AI Core Engine returned an invalid rite metadata format.');
        }
      }
      if (parsedResponse.newGameMeta?.fortifications && typeof parsedResponse.newGameMeta.fortifications === 'string') {
        try {
            parsedResponse.newGameMeta.fortifications = JSON.parse(parsedResponse.newGameMeta.fortifications);
        } catch (e) {
            console.error("Failed to parse fortifications JSON string:", e);
            throw new Error('The AI Core Engine returned an invalid helmbreaker metadata format.');
        }
      }
       if (parsedResponse.newGameMeta?.planes) {
         try {
            if (typeof parsedResponse.newGameMeta.planes.mind === 'string') {
                parsedResponse.newGameMeta.planes.mind = JSON.parse(parsedResponse.newGameMeta.planes.mind);
            }
            if (typeof parsedResponse.newGameMeta.planes.body === 'string') {
                parsedResponse.newGameMeta.planes.body = JSON.parse(parsedResponse.newGameMeta.planes.body);
            }
            if (typeof parsedResponse.newGameMeta.planes.spirit === 'string') {
                parsedResponse.newGameMeta.planes.spirit = JSON.parse(parsedResponse.newGameMeta.planes.spirit);
            }
         } catch (e) {
            console.error("Failed to parse planes JSON string:", e);
            throw new Error('The AI Core Engine returned an invalid lambda metadata format.');
         }
       }
      
      return parsedResponse; // Success

    } catch (e) {
      attempt++;
      const errorMessage = e instanceof Error ? e.message : String(e);

      if (errorMessage.includes('"code":429') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
        if (attempt < MAX_RETRIES) {
          addServerLog(`[SYSTEM] AI Core rate limit reached. Retrying in ${backoffDelay / 1000}s... (${attempt}/${MAX_RETRIES})`);
          await delay(backoffDelay);
          backoffDelay *= 2; // Exponential backoff
        } else {
          console.error("Gemini API call failed after multiple retries:", e);
          addServerLog(`[SYSTEM] CRITICAL ERROR: AI Core is overloaded. Please check your API plan and billing details.`);
          return {
            status: 'error',
            message: 'The AI Core Engine is experiencing heavy load and could not respond. This may be due to API rate limits.',
            newBoardState: currentGameState.board,
            aiMove: null,
          };
        }
      } else {
        console.error("Gemini API call failed:", e);
        return {
          status: 'error',
          message: `The AI Core Engine failed to process the request. ${errorMessage}`,
          newBoardState: currentGameState.board,
          aiMove: null,
        };
      }
    }
  }
};