import type { GameState, GameMode, TelemetryData } from '../types';

// The prompt generation and direct Gemini API calls are now handled by the backend microservice.
// This service now acts as a client to that backend.

const GATEWAY_HOST = process.env.NEXT_PUBLIC_GATEWAY_HOST;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

if (!GATEWAY_HOST || !API_KEY) {
    console.warn("Gateway host or API key is not configured in environment variables. API calls will fail.");
}

async function fetchWithZeroTrust(url: string, idToken: string, options: RequestInit = {}) {
    if (!idToken) {
        throw new Error("Authentication token is missing. Cannot make a secure call.");
    }

    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY!,
            'Authorization': `Bearer ${idToken}`,
            ...options.headers,
        },
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`API request failed with status ${response.status}: ${errorBody}`);
    }

    return response.json();
}

export const getBackendResponse = async (command: string, currentGameState: GameState, gameMode: GameMode, idToken: string): Promise<any> => {
    const url = `${GATEWAY_HOST}/v1/agent/infer`;
    const payload = {
        command,
        gameState: currentGameState,
        gameMode,
    };
    
    try {
        const parsedResponse = await fetchWithZeroTrust(url, idToken, {
            method: 'POST',
            body: JSON.stringify(payload),
        });

        // The backend is expected to return a response with the same structure as the old Gemini service.
        return parsedResponse;

    } catch (error) {
        console.error("Error communicating with backend:", error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return {
            status: 'error',
            message: `Failed to connect to the Core Engine: ${errorMessage}`,
            newBoardState: currentGameState.board,
            meta: currentGameState.meta,
            aiMove: null,
        };
    }
};

export const getTelemetryData = async (idToken: string): Promise<TelemetryData> => {
    const url = `${GATEWAY_HOST}/v1/monitor/telemetry`;
    return fetchWithZeroTrust(url, idToken, { method: 'GET' });
};
