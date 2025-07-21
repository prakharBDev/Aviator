# Aviator Game Backend

A real-time multiplayer crash game backend built with Node.js, Express, and Socket.io.

## Features

- Real-time multiplayer gameplay
- Cryptographically secure random crash point generation
- Provably fair algorithm implementation
- WebSocket-based communication
- Player session management
- Game history tracking
- Auto-cashout functionality
- Realistic crash distribution (60% between 1.1x-2x, 30% between 2x-10x, 10% above 10x)

## Installation

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Start the server:

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The server will start on port 5000 by default.

## API Endpoints

### REST API

- `GET /api/game-state` - Get current game state
- `GET /api/game-history` - Get last 20 game results

### Socket.io Events

#### Client to Server

- `register` - Register a new player
- `placeBet` - Place a bet with optional auto-cashout
- `cashOut` - Manually cash out during flying phase

#### Server to Client

- `gameState` - Current game state updates
- `multiplierUpdate` - Real-time multiplier updates (every 100ms)
- `gameCrashed` - Game crash notification with results
- `gameHistory` - Historical game data
- `playerRegistered` - Player registration confirmation
- `betPlaced` - Bet placement confirmation
- `cashedOut` - Cashout confirmation with payout details
- `playerBet` - Broadcast when any player places a bet
- `playerCashOut` - Broadcast when any player cashes out
- `error` - Error messages

## Game Flow

1. **Waiting Phase (5 seconds)**: Players can place bets
2. **Flying Phase**: Multiplier increases from 1.00x until crash
3. **Crashed Phase**: Game ends, results processed
4. **Reset**: New game starts after 3 seconds

## Configuration

- Server port: `process.env.PORT || 5000`
- Frontend origin: `http://localhost:3000` (configurable in CORS settings)
- Game phases: Waiting (5s), Flying (variable), Crashed (3s pause)

## Security Features

- Provably fair random number generation
- Server-side validation for all game actions
- Balance checking for bets
- Rate limiting and input validation

## Development

The server uses:

- Express.js for HTTP server
- Socket.io for real-time communication
- Crypto module for secure random generation
- UUID for unique game identification
