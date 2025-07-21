# Aviator Crash Game

A complete real-time multiplayer Aviator crash game built with React frontend and Node.js backend.

## Features

### Frontend (React)

- ⚡ Real-time multiplayer gameplay with Socket.io
- 🎨 Modern dark theme with glassmorphism effects
- 📱 Fully responsive design for all devices
- 🎯 Dual betting system (two simultaneous bets)
- 🤖 Auto-cashout functionality with target multiplier
- 📊 Live game history showing last 20 rounds
- 🔔 Real-time notifications system
- 🎭 Smooth animations with Framer Motion
- 📈 Animated multiplier curve visualization

### Backend (Node.js)

- 🔐 Cryptographically secure random crash point generation
- ⚖️ Provably fair algorithm implementation
- 🎲 Realistic crash distribution (60% 1.1x-2x, 30% 2x-10x, 10% 10x+)
- 🔄 Real-time game loop with WebSocket communication
- 👥 Player session management and balance tracking
- 📚 Game history storage (last 100 rounds)
- 🛡️ Input validation and security measures
- 🚀 High-performance real-time updates (100ms intervals)

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository:**

```bash
git clone <repository-url>
cd aviator-game
```

2. **Install frontend dependencies:**

```bash
npm install
```

3. **Install backend dependencies:**

```bash
cd backend
npm install
cd ..
```

4. **Start the backend server:**

```bash
cd backend
npm run dev
```

The backend will start on http://localhost:5000

5. **Start the frontend (in a new terminal):**

```bash
npm start
```

The frontend will start on http://localhost:3000

## Game Rules

1. **Waiting Phase (5 seconds)**: Players can place bets and set auto-cashout multipliers
2. **Flying Phase**: The multiplier starts at 1.00x and increases exponentially
3. **Crash**: The game randomly crashes, and players who didn't cash out lose their bets
4. **Payout**: Players who cashed out before the crash receive their bet × multiplier

## Technical Architecture

### Frontend Structure

```
src/
├── components/
│   ├── AviatorGame.jsx     # Main game component
│   └── ...                 # Other components
├── socket.js               # Socket.io client configuration
├── socketContext.js        # React context for socket
├── index.css              # Global styles with glassmorphism
└── App.js                 # Main app component
```

### Backend Structure

```
backend/
├── server.js              # Main server file
├── package.json           # Backend dependencies
└── README.md             # Backend documentation
```

## Key Technologies

- **Frontend**: React, Tailwind CSS, Framer Motion, Socket.io Client
- **Backend**: Node.js, Express, Socket.io, Crypto API
- **Real-time Communication**: WebSocket with Socket.io
- **Styling**: Tailwind CSS with custom glassmorphism effects

## Game Features

### Betting System

- Place up to 2 simultaneous bets
- Adjustable bet amounts with +/- controls
- Auto-cashout with target multiplier settings
- Real-time balance tracking

### Visual Effects

- Animated multiplier curve that grows with the game
- Neon glow effects and smooth transitions
- Glassmorphism UI elements
- Responsive design for mobile and desktop

### Multiplayer Features

- See other players' bets in real-time
- Live notifications when players cash out
- Game history with color-coded results
- Player activity feed

## Development

### Frontend Development

```bash
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests
```

### Backend Development

```bash
cd backend
npm run dev        # Start with nodemon (auto-restart)
npm start          # Start production server
```

## Configuration

### Environment Variables

- `PORT`: Backend server port (default: 5000)
- `NODE_ENV`: Environment mode (development/production)

### Customization

- Modify crash distribution in `backend/server.js`
- Adjust game timing and multiplier curve
- Customize UI colors and animations in Tailwind config

## Security

- Provably fair random number generation
- Server-side bet validation
- Balance checking and fraud prevention
- Secure WebSocket connections

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For issues and questions:

1. Check the documentation
2. Review existing issues
3. Create a new issue with detailed information

---

**Note**: This is a demonstration project. For production use, implement additional security measures, database persistence, and proper user authentication.
