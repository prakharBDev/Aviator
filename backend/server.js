const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Game state
let gameState = {
  phase: "waiting", // waiting, flying, crashed
  multiplier: 1.0,
  startTime: null,
  crashPoint: null,
  countdown: 5,
  gameId: null,
  serverSeed: null,
  clientSeed: null,
};

// Players storage
const players = new Map();
const gameHistory = [];
const activeBets = new Map();
const activePlayers = new Map(); // Track active players for display

// Provably fair system
function generateServerSeed() {
  return crypto.randomBytes(32).toString("hex");
}

function generateCrashPoint(serverSeed, clientSeed, gameId) {
  const hash = crypto.createHash("sha256");
  hash.update(serverSeed + clientSeed + gameId);
  const hex = hash.digest("hex");

  // Convert first 8 characters to number
  const seed = parseInt(hex.substring(0, 8), 16);
  const crashPoint = Math.max(1.0, (2 ** 32 / (seed + 1)) * 0.99);

  // Apply maximum crash point limit of 15x
  const maxCrashPoint = 15.0;
  return Math.max(1.01, Math.min(crashPoint, maxCrashPoint));
}

function getCurrentMultiplier() {
  const elapsed = Date.now() - gameState.startTime;
  const growthRate = 0.0001;
  return Math.max(1.0, 1 + elapsed * growthRate);
}

function broadcastActivePlayers() {
  const playersArray = Array.from(activePlayers.values());
  io.emit("activePlayers", playersArray);
}

function startNewGame() {
  gameState.gameId = uuidv4();
  gameState.serverSeed = generateServerSeed();
  gameState.clientSeed = "client_seed_" + Date.now();
  gameState.crashPoint = generateCrashPoint(
    gameState.serverSeed,
    gameState.clientSeed,
    gameState.gameId
  );
  gameState.phase = "waiting";
  gameState.countdown = 5;
  gameState.multiplier = 1.0;

  // Clear active bets from previous round
  activeBets.clear();

  console.log(
    `New game started: ${gameState.gameId}, crash point: ${gameState.crashPoint}`
  );

  // Send game history to all connected clients
  io.emit("gameHistory", gameHistory.slice(0, 100));

  // Countdown phase
  const countdownInterval = setInterval(() => {
    gameState.countdown--;
    io.emit("gameState", {
      phase: gameState.phase,
      countdown: gameState.countdown,
      multiplier: gameState.multiplier,
      gameId: gameState.gameId,
    });

    if (gameState.countdown <= 0) {
      clearInterval(countdownInterval);
      startFlyingPhase();
    }
  }, 1000);
}

function startFlyingPhase() {
  gameState.phase = "flying";
  gameState.startTime = Date.now();
  gameState.multiplier = 1.0;

  const flyingInterval = setInterval(() => {
    gameState.multiplier = getCurrentMultiplier();

    // Check if crash point reached or if multiplier hits 15x (safety check)
    if (gameState.multiplier >= gameState.crashPoint || gameState.multiplier >= 15.0) {
      clearInterval(flyingInterval);
      crashGame();
      return;
    }

    // Broadcast multiplier update
    io.emit("multiplierUpdate", {
      multiplier: gameState.multiplier,
      phase: gameState.phase,
    });
  }, 100);
}

function crashGame() {
  gameState.phase = "crashed";
  gameState.multiplier = gameState.crashPoint;

  // Process all active bets
  const results = [];
  activeBets.forEach((bet, playerId) => {
    const player = players.get(playerId);
    if (player && !bet.cashedOut) {
      // Player lost
      results.push({
        playerId,
        username: player.username,
        betAmount: bet.amount,
        multiplier: 0,
        payout: 0,
        won: false,
        lost: true,
      });
    }
  });

  // Add to history
  gameHistory.unshift({
    gameId: gameState.gameId,
    crashPoint: gameState.crashPoint,
    timestamp: Date.now(),
    results,
  });

  // Keep only last 100 games
  if (gameHistory.length > 100) {
    gameHistory.pop();
  }

  // Broadcast crash
  io.emit("gameCrashed", {
    crashPoint: gameState.crashPoint,
    results,
    gameId: gameState.gameId,
  });

  // Clear active players for next round
  activePlayers.clear();
  broadcastActivePlayers();

  // Start new game after 3 seconds
  setTimeout(() => {
    startNewGame();
  }, 3000);
}

// Socket connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Send current game state
  socket.emit("gameState", {
    phase: gameState.phase,
    countdown: gameState.countdown,
    multiplier: gameState.multiplier,
    gameId: gameState.gameId,
  });

  // Send game history
  socket.emit("gameHistory", gameHistory.slice(0, 100));

  // Send active players
  broadcastActivePlayers();

  // Player registration
  socket.on("register", (data) => {
    const player = {
      id: socket.id,
      username: data.username,
      balance: data.balance || 1000,
      joinedAt: Date.now(),
    };

    players.set(socket.id, player);

    socket.emit("playerRegistered", {
      username: player.username,
      balance: player.balance,
      id: player.id,
    });

    console.log(`Player registered: ${player.username} (${socket.id})`);
  });

  // Place bet
  socket.on("placeBet", (data) => {
    const player = players.get(socket.id);
    if (!player) {
      socket.emit("error", { message: "Player not registered" });
      return;
    }

    if (gameState.phase !== "waiting") {
      socket.emit("error", { message: "Betting is closed" });
      return;
    }

    const betAmount = parseFloat(data.amount);
    if (betAmount <= 0 || betAmount > player.balance) {
      socket.emit("error", { message: "Invalid bet amount" });
      return;
    }

    if (activeBets.has(socket.id)) {
      socket.emit("error", { message: "You already have an active bet" });
      return;
    }

    // Deduct bet from balance
    player.balance -= betAmount;

    // Store bet
    activeBets.set(socket.id, {
      amount: betAmount,
      playerId: socket.id,
      username: player.username,
      cashedOut: false,
      autoCashout: data.autoCashout || null,
    });

    // Add to active players
    activePlayers.set(socket.id, {
      username: player.username,
      betAmount: betAmount,
      cashedOut: false,
      multiplier: null,
      payout: 0,
    });

    socket.emit("betPlaced", {
      amount: betAmount,
      balance: player.balance,
      autoCashout: data.autoCashout,
    });

    // Broadcast bet to all players
    io.emit("playerBet", {
      username: player.username,
      amount: betAmount,
    });

    // Update active players list
    broadcastActivePlayers();
  });

  // Cash out
  socket.on("cashOut", () => {
    const player = players.get(socket.id);
    const bet = activeBets.get(socket.id);

    if (!player || !bet) {
      socket.emit("error", { message: "No active bet found" });
      return;
    }

    if (gameState.phase !== "flying") {
      socket.emit("error", { message: "Cannot cash out now" });
      return;
    }

    if (bet.cashedOut) {
      socket.emit("error", { message: "Already cashed out" });
      return;
    }

    // Calculate payout
    const payout = bet.amount * gameState.multiplier;
    const profit = payout - bet.amount;
    player.balance += payout;
    bet.cashedOut = true;
    bet.cashoutMultiplier = gameState.multiplier;

    // Update active players
    if (activePlayers.has(socket.id)) {
      activePlayers.set(socket.id, {
        ...activePlayers.get(socket.id),
        cashedOut: true,
        multiplier: gameState.multiplier,
        payout: payout,
      });
    }

    socket.emit("cashedOut", {
      multiplier: gameState.multiplier,
      payout: payout,
      balance: player.balance,
      profit: profit,
    });

    // Broadcast cashout to all players
    io.emit("playerCashOut", {
      username: player.username,
      multiplier: gameState.multiplier,
      payout: payout,
      profit: profit,
    });

    // Update active players list
    broadcastActivePlayers();
  });

  // Handle auto cashout
  const autoCashoutInterval = setInterval(() => {
    if (gameState.phase === "flying") {
      activeBets.forEach((bet, playerId) => {
        if (
          bet.autoCashout &&
          !bet.cashedOut &&
          gameState.multiplier >= bet.autoCashout
        ) {
          const player = players.get(playerId);
          if (player) {
            const payout = bet.amount * gameState.multiplier;
            const profit = payout - bet.amount;
            player.balance += payout;
            bet.cashedOut = true;
            bet.cashoutMultiplier = gameState.multiplier;

            // Update active players
            if (activePlayers.has(playerId)) {
              activePlayers.set(playerId, {
                ...activePlayers.get(playerId),
                cashedOut: true,
                multiplier: gameState.multiplier,
                payout: payout,
              });
            }

            // Notify player
            io.to(playerId).emit("cashedOut", {
              multiplier: gameState.multiplier,
              payout: payout,
              balance: player.balance,
              profit: profit,
              auto: true,
            });

            // Broadcast to all players
            io.emit("playerCashOut", {
              username: player.username,
              multiplier: gameState.multiplier,
              payout: payout,
              profit: profit,
              auto: true,
            });

            // Update active players list
            broadcastActivePlayers();
          }
        }
      });
    }
  }, 100);

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    // Remove player
    players.delete(socket.id);

    // Remove active bet
    activeBets.delete(socket.id);

    // Remove from active players
    activePlayers.delete(socket.id);

    // Update active players list
    broadcastActivePlayers();

    // Clear interval
    clearInterval(autoCashoutInterval);
  });
});

// Start the first game
startNewGame();

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
