# GitHub Copilot Code Review Instructions

## Project Overview

This is the "Actual Chess App" - a sophisticated web-based chess application with multiple game variants, featuring a "Hollow App" architecture where a thin React frontend communicates with an AI-powered backend engine.

### Architecture

- **Frontend**: React 19 + TypeScript with Vite build system
- **Backend Logic**: AI-powered game engine using Google Gemini API
- **Styling**: Tailwind CSS with custom theming
- **Game Engine**: Stateless backend that validates moves and generates AI responses

### Key Components

1. **Game Modes**: Multiple chess variants including:
   - **Chess**: Standard chess rules
   - **Leviathan**: Simple piece-based wargame
   - **Lambda Protocol**: Multi-dimensional chess across 3 planes (Mind, Body, Spirit)
   - **Helmbreaker**: Chess with fortifications and turn limits
   - **Rite of Reduction**: Chess with essence/energy management

2. **Core Services**:
   - `geminiService.ts`: AI integration and game logic processing
   - `moveLogic.ts`: Client-side move validation and legal move generation

3. **UI Components**:
   - `GameBoard.tsx`: Interactive chess board with piece movement
   - `Card.tsx`: Reusable UI card components
   - Various game-specific components (Tutorial, GameRules, etc.)

## Code Review Focus Areas

### 1. Game Logic & Rules Implementation
- **Move Validation**: Ensure move logic follows chess rules and variant-specific rules
- **State Management**: Verify game state transitions are consistent and immutable
- **AI Integration**: Check that Gemini API integration handles edge cases and errors
- **Victory Conditions**: Validate that win/loss/draw conditions are properly implemented

### 2. Type Safety & Data Flow
- **TypeScript Usage**: All game state, moves, and API responses should be properly typed
- **Interface Consistency**: Check that `GameState`, `BoardState`, and `GameMeta` interfaces are used correctly
- **API Response Handling**: Verify proper parsing and validation of AI responses

### 3. Performance & UX
- **Move Animations**: Ensure smooth piece movement and capture animations
- **AI Thinking States**: Proper loading states during AI computation
- **Memory Leaks**: Check for proper cleanup of event listeners and subscriptions
- **Responsive Design**: UI should work on different screen sizes

### 4. Error Handling
- **Invalid Moves**: Graceful handling of illegal moves
- **API Failures**: Proper fallbacks when Gemini API is unavailable
- **Network Issues**: Retry logic and user feedback for connectivity problems
- **Game State Corruption**: Recovery mechanisms for invalid game states

## Common Patterns & Conventions

### State Management
```typescript
// Game state is immutable - always create new objects
const newGameState: GameState = {
  board: { ...gameState.board, [square]: piece },
  meta: { ...gameState.meta, ply: gameState.meta.ply + 1 }
};
```

### Move Notation
- Coordinate notation: "E2-E4" (used internally)
- Algebraic notation: "e4", "Nf3" (for display)
- Square IDs: "A1" to "H8" (board coordinates)

### Component Props
- Always use proper TypeScript interfaces for component props
- Game state should be passed down, not mutated directly
- Event handlers should be callbacks passed from parent components

### API Integration
- All AI requests go through `geminiService.ts`
- Responses must conform to the defined JSON schema
- Include proper error handling and validation

## Security & Best Practices

### API Security
- Environment variables for API keys (GEMINI_API_KEY)
- No sensitive data in client-side code
- Proper input validation before sending to AI

### Code Quality
- Use functional components with hooks
- Avoid side effects in render methods
- Proper dependency arrays for useEffect/useMemo
- Consistent naming conventions (camelCase for variables, PascalCase for components)

### Testing Considerations
- Game logic should be testable in isolation
- Mock AI responses for consistent testing
- Test edge cases in move validation
- Verify UI state updates correctly

## Review Checklist

When reviewing code changes, pay special attention to:

- [ ] **Type Safety**: Are all types properly defined and used?
- [ ] **Game Rules**: Do changes maintain game rule integrity?
- [ ] **Performance**: Are there any potential performance bottlenecks?
- [ ] **Error Handling**: Are edge cases and errors handled gracefully?
- [ ] **User Experience**: Do changes improve or maintain good UX?
- [ ] **Code Consistency**: Does the code follow existing patterns?
- [ ] **Security**: Are there any security implications?
- [ ] **Documentation**: Are complex game rules or logic properly commented?

## File-Specific Guidelines

### `App.tsx`
- Main application state management
- Coordinate between UI components and game engine
- Handle authentication and game mode switching

### `services/geminiService.ts`
- AI prompt engineering - ensure prompts are clear and comprehensive
- Response parsing - validate all required fields are present
- Error handling - graceful degradation when AI is unavailable

### `services/moveLogic.ts`
- Pure functions for move validation
- Should not depend on external state
- Comprehensive test coverage recommended

### `components/GameBoard.tsx`
- Complex UI state for piece selection and movement
- Animation handling
- Accessibility considerations for chess notation

### `types.ts`
- Central type definitions
- Keep interfaces minimal but complete
- Document complex type relationships

This application demonstrates advanced React patterns, complex game logic, and AI integration. Focus on maintaining the separation between UI and game logic, ensuring type safety, and preserving the sophisticated game rule implementations.