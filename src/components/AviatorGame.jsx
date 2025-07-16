import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSocket } from "../socketContext";
import useSound from "../hooks/useSound";
import NameInput from "./NameInput";
import ActivePlayersList from "./ActivePlayersList";

const AviatorGame = () => {
  const socket = useSocket();
  const { play: playSound } = useSound();

  // Game state
  const [gameState, setGameState] = useState({
    phase: "waiting",
    multiplier: 1.0,
    countdown: 5,
    gameId: null,
  });

  // Player state
  const [player, setPlayer] = useState({
    username: "",
    balance: 1000,
    registered: false,
  });

  // Betting state
  const [bet1, setBet1] = useState({
    amount: 10,
    active: false,
    cashedOut: false,
    autoCashout: null,
    payout: 0,
    profit: 0,
  });

  const [bet2, setBet2] = useState({
    amount: 10,
    active: false,
    cashedOut: false,
    autoCashout: null,
    payout: 0,
    profit: 0,
  });

  // UI state
  const [gameHistory, setGameHistory] = useState([]);
  const [activePlayers, setActivePlayers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showAutoCashout1, setShowAutoCashout1] = useState(false);
  const [showAutoCashout2, setShowAutoCashout2] = useState(false);
  const [showNameInput, setShowNameInput] = useState(true);
  const [sessionStats, setSessionStats] = useState({
    totalBets: 0,
    totalWins: 0,
    totalLosses: 0,
    netProfit: 0,
  });

  // Refs
  const multiplierRef = useRef(null);
  const canvasRef = useRef(null);
  const prevPhaseRef = useRef(null);

  // Handle name submission
  const handleNameSubmit = (name) => {
    if (socket) {
      socket.emit("register", {
        username: name,
        balance: 1000,
      });
      setPlayer((prev) => ({ ...prev, username: name }));
      setShowNameInput(false);
    }
  };

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    // Game state updates
    socket.on("gameState", (state) => {
      setGameState((prev) => {
        // Play sound for phase changes
        if (prev.phase !== state.phase) {
          if (state.phase === "flying") {
            playSound("takeoff");
          } else if (state.phase === "waiting") {
            playSound("tick");
          }
        }
        return state;
      });
    });

    socket.on("multiplierUpdate", (data) => {
      setGameState((prev) => ({
        ...prev,
        multiplier: data.multiplier,
        phase: data.phase,
      }));
    });

    socket.on("gameCrashed", (data) => {
      playSound("crash");
      setGameState((prev) => ({
        ...prev,
        phase: "crashed",
        multiplier: data.crashPoint,
      }));

      // Update session stats for losses
      setSessionStats((prev) => ({
        ...prev,
        totalLosses:
          prev.totalLosses +
          (bet1.active && !bet1.cashedOut ? 1 : 0) +
          (bet2.active && !bet2.cashedOut ? 1 : 0),
        netProfit:
          prev.netProfit -
          (bet1.active && !bet1.cashedOut ? bet1.amount : 0) -
          (bet2.active && !bet2.cashedOut ? bet2.amount : 0),
      }));

      // Reset bets
      setBet1((prev) => ({
        ...prev,
        active: false,
        cashedOut: false,
        payout: 0,
        profit: 0,
      }));
      setBet2((prev) => ({
        ...prev,
        active: false,
        cashedOut: false,
        payout: 0,
        profit: 0,
      }));

      addNotification(
        `💥 Game crashed at ${data.crashPoint.toFixed(2)}x`,
        "error"
      );
    });

    socket.on("gameHistory", (history) => {
      setGameHistory(history);
    });

    socket.on("playerRegistered", (data) => {
      setPlayer((prev) => ({ ...prev, ...data, registered: true }));
      addNotification(`Welcome ${data.username}! 🎮`, "success");
    });

    socket.on("activePlayers", (players) => {
      setActivePlayers(players);
    });

    socket.on("betPlaced", (data) => {
      playSound("bet");
      setPlayer((prev) => ({ ...prev, balance: data.balance }));
      setSessionStats((prev) => ({ ...prev, totalBets: prev.totalBets + 1 }));
      addNotification(`Bet placed: $${data.amount} 💰`, "success");
    });

    socket.on("cashedOut", (data) => {
      playSound("cashout");
      setPlayer((prev) => ({ ...prev, balance: data.balance }));

      // Update session stats
      setSessionStats((prev) => ({
        ...prev,
        totalWins: prev.totalWins + 1,
        netProfit: prev.netProfit + data.profit,
      }));

      // Update the appropriate bet
      if (bet1.active && !bet1.cashedOut) {
        setBet1((prev) => ({
          ...prev,
          cashedOut: true,
          payout: data.payout,
          profit: data.profit,
        }));
      } else if (bet2.active && !bet2.cashedOut) {
        setBet2((prev) => ({
          ...prev,
          cashedOut: true,
          payout: data.payout,
          profit: data.profit,
        }));
      }

      addNotification(
        `💰 Cashed out at ${data.multiplier.toFixed(
          2
        )}x! +$${data.profit.toFixed(2)}`,
        "success"
      );
    });

    socket.on("playerBet", (data) => {
      addNotification(`${data.username} placed a bet: $${data.amount}`, "info");
    });

    socket.on("playerCashOut", (data) => {
      const profit =
        data.profit > 0
          ? `+$${data.profit.toFixed(2)}`
          : `$${data.profit.toFixed(2)}`;
      addNotification(
        `${data.username} cashed out at ${data.multiplier.toFixed(
          2
        )}x (${profit})`,
        "info"
      );
    });

    socket.on("error", (data) => {
      addNotification(data.message, "error");
    });

    return () => {
      socket.off("gameState");
      socket.off("multiplierUpdate");
      socket.off("gameCrashed");
      socket.off("gameHistory");
      socket.off("playerRegistered");
      socket.off("activePlayers");
      socket.off("betPlaced");
      socket.off("cashedOut");
      socket.off("playerBet");
      socket.off("playerCashOut");
      socket.off("error");
    };
  }, [
    socket,
    bet1.active,
    bet1.cashedOut,
    bet2.active,
    bet2.cashedOut,
    playSound,
  ]);

  // Curve animation
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    if (gameState.phase === "flying" || gameState.phase === "crashed") {
      // Draw curve
      ctx.beginPath();
      ctx.strokeStyle = gameState.phase === "crashed" ? "#ef4444" : "#10b981";
      ctx.lineWidth = 4;

      const points = [];
      for (let i = 0; i < width; i += 2) {
        const x = i;
        const progress = i / width;
        const multiplier = 1 + (gameState.multiplier - 1) * progress;
        const y = height - Math.log(multiplier) * 120;
        points.push({ x, y });
      }

      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();

      // Draw airplane at the end of curve
      if (gameState.phase === "flying") {
        ctx.beginPath();
        ctx.fillStyle = "#10b981";
        ctx.arc(
          width * 0.85,
          height - Math.log(gameState.multiplier) * 120,
          6,
          0,
          2 * Math.PI
        );
        ctx.fill();
      }

      // Draw crash point if crashed
      if (gameState.phase === "crashed") {
        ctx.beginPath();
        ctx.fillStyle = "#ef4444";
        ctx.arc(
          width * 0.8,
          height - Math.log(gameState.multiplier) * 120,
          10,
          0,
          2 * Math.PI
        );
        ctx.fill();

        // Add explosion effect
        ctx.beginPath();
        ctx.strokeStyle = "#ff6b6b";
        ctx.lineWidth = 2;
        for (let i = 0; i < 8; i++) {
          const angle = (i * Math.PI) / 4;
          const x1 = width * 0.8 + Math.cos(angle) * 10;
          const y1 =
            height -
            Math.log(gameState.multiplier) * 120 +
            Math.sin(angle) * 10;
          const x2 = width * 0.8 + Math.cos(angle) * 20;
          const y2 =
            height -
            Math.log(gameState.multiplier) * 120 +
            Math.sin(angle) * 20;
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
        }
        ctx.stroke();
      }
    }
  }, [gameState.multiplier, gameState.phase]);

  // Utility functions
  const addNotification = (message, type) => {
    const id = Date.now() + Math.random();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  };

  const placeBet = (betNumber) => {
    if (!socket || gameState.phase !== "waiting") return;

    const bet = betNumber === 1 ? bet1 : bet2;
    const setBet = betNumber === 1 ? setBet1 : setBet2;

    if (bet.amount <= 0 || bet.amount > player.balance) {
      addNotification("❌ Invalid bet amount", "error");
      return;
    }

    socket.emit("placeBet", {
      amount: bet.amount,
      autoCashout: bet.autoCashout,
    });

    setBet((prev) => ({ ...prev, active: true }));
  };

  const cashOut = () => {
    if (!socket || gameState.phase !== "flying") return;
    socket.emit("cashOut");
  };

  const getMultiplierColor = () => {
    if (gameState.phase === "crashed") return "text-red-400";
    if (gameState.multiplier < 2) return "text-green-400";
    if (gameState.multiplier < 5) return "text-yellow-400";
    if (gameState.multiplier < 10) return "text-orange-400";
    return "text-red-400";
  };

  const getPotentialWin = (betAmount) => {
    if (gameState.phase === "flying") {
      return (betAmount * gameState.multiplier).toFixed(2);
    }
    return betAmount.toFixed(2);
  };

  if (showNameInput) {
    return (
      <NameInput onNameSubmit={handleNameSubmit} isVisible={showNameInput} />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 text-white p-4">
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-40 space-y-2">
        <AnimatePresence>
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className={`p-3 rounded-lg shadow-lg max-w-sm ${
                notification.type === "error"
                  ? "bg-red-600 border-red-500"
                  : notification.type === "success"
                  ? "bg-green-600 border-green-500"
                  : "bg-blue-600 border-blue-500"
              } border`}
            >
              <p className="text-sm">{notification.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            🚀 Aviator Game
          </h1>
          <p className="text-gray-300 mt-1">
            Fly high, bet smart, cash out in time!
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-green-400">
            💰 ${player.balance.toFixed(2)}
          </div>
          <div className="text-sm text-gray-400">
            Welcome, {player.username}!
          </div>
        </div>
      </div>

      {/* Session Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-lg p-3 text-center border border-gray-700">
          <div className="text-lg font-semibold text-blue-400">
            {sessionStats.totalBets}
          </div>
          <div className="text-xs text-gray-400">Total Bets</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 text-center border border-gray-700">
          <div className="text-lg font-semibold text-green-400">
            {sessionStats.totalWins}
          </div>
          <div className="text-xs text-gray-400">Wins</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 text-center border border-gray-700">
          <div className="text-lg font-semibold text-red-400">
            {sessionStats.totalLosses}
          </div>
          <div className="text-xs text-gray-400">Losses</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 text-center border border-gray-700">
          <div
            className={`text-lg font-semibold ${
              sessionStats.netProfit >= 0 ? "text-green-400" : "text-red-400"
            }`}
          >
            {sessionStats.netProfit >= 0 ? "+" : ""}$
            {sessionStats.netProfit.toFixed(2)}
          </div>
          <div className="text-xs text-gray-400">Net Profit</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Game Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Game Display */}
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20"></div>

            {/* Multiplier Display */}
            <div className="relative z-10 text-center mb-4">
              <motion.div
                ref={multiplierRef}
                className={`text-6xl font-bold ${getMultiplierColor()}`}
                animate={{
                  scale: gameState.phase === "flying" ? [1, 1.1, 1] : 1,
                  textShadow:
                    gameState.phase === "flying"
                      ? [
                          "0 0 20px rgba(16, 185, 129, 0.8)",
                          "0 0 40px rgba(16, 185, 129, 0.6)",
                          "0 0 20px rgba(16, 185, 129, 0.8)",
                        ]
                      : "none",
                }}
                transition={{
                  duration: 0.5,
                  repeat: gameState.phase === "flying" ? Infinity : 0,
                }}
              >
                {gameState.multiplier.toFixed(2)}x
              </motion.div>

              <div className="text-lg text-gray-300 mt-2">
                {gameState.phase === "waiting" &&
                  `⏱️ Next round in ${gameState.countdown}s`}
                {gameState.phase === "flying" && "🚀 Flying! Cash out anytime"}
                {gameState.phase === "crashed" &&
                  "💥 Crashed! Next round starting..."}
              </div>
            </div>

            {/* Canvas for curve */}
            <canvas
              ref={canvasRef}
              width={800}
              height={300}
              className="w-full h-64 bg-gray-900/50 rounded-lg border border-gray-600"
            />
          </div>

          {/* Game History */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <h3 className="text-lg font-semibold mb-3">📊 Recent Games</h3>
            <div className="flex flex-wrap gap-2">
              {gameHistory.slice(0, 20).map((game, index) => (
                <div
                  key={game.gameId}
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    game.crashPoint < 2
                      ? "bg-red-500/20 text-red-400"
                      : game.crashPoint < 5
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-green-500/20 text-green-400"
                  }`}
                >
                  {game.crashPoint.toFixed(2)}x
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Betting Panel */}
        <div className="space-y-4">
          {/* Bet 1 */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">🎯 Bet 1</h3>
              <button
                onClick={() => setShowAutoCashout1(!showAutoCashout1)}
                className="text-sm text-purple-400 hover:text-purple-300"
              >
                Auto Cashout
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() =>
                    setBet1((prev) => ({
                      ...prev,
                      amount: Math.max(1, prev.amount - 1),
                    }))
                  }
                  className="w-10 h-10 bg-gray-700 rounded-lg hover:bg-gray-600 flex items-center justify-center font-bold text-lg"
                >
                  -
                </button>
                <input
                  type="number"
                  value={bet1.amount}
                  onChange={(e) =>
                    setBet1((prev) => ({
                      ...prev,
                      amount: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="flex-1 bg-gray-700 rounded-lg px-3 py-2 text-center font-semibold"
                  disabled={bet1.active}
                />
                <button
                  onClick={() =>
                    setBet1((prev) => ({ ...prev, amount: prev.amount + 1 }))
                  }
                  className="w-10 h-10 bg-gray-700 rounded-lg hover:bg-gray-600 flex items-center justify-center font-bold text-lg"
                >
                  +
                </button>
              </div>

              {/* Potential Win Display */}
              {bet1.active && (
                <div className="bg-blue-500/20 rounded-lg p-2 text-center border border-blue-500/30">
                  <div className="text-sm text-blue-300">Potential Win</div>
                  <div className="text-lg font-semibold text-blue-400">
                    ${getPotentialWin(bet1.amount)}
                  </div>
                </div>
              )}

              {showAutoCashout1 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <input
                    type="number"
                    placeholder="Auto cashout at..."
                    value={bet1.autoCashout || ""}
                    onChange={(e) =>
                      setBet1((prev) => ({
                        ...prev,
                        autoCashout: parseFloat(e.target.value) || null,
                      }))
                    }
                    className="w-full bg-gray-700 rounded-lg px-3 py-2"
                    step="0.1"
                    min="1.1"
                  />
                </motion.div>
              )}

              {!bet1.active ? (
                <button
                  onClick={() => placeBet(1)}
                  disabled={gameState.phase !== "waiting"}
                  className={`w-full py-3 rounded-lg font-semibold transition-all ${
                    gameState.phase === "waiting"
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-gray-600 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {gameState.phase === "waiting"
                    ? "🎯 Place Bet"
                    : "⏱️ Betting Closed"}
                </button>
              ) : (
                <div className="space-y-2">
                  {!bet1.cashedOut ? (
                    <button
                      onClick={cashOut}
                      disabled={gameState.phase !== "flying"}
                      className={`w-full py-3 rounded-lg font-semibold transition-all ${
                        gameState.phase === "flying"
                          ? "bg-orange-600 hover:bg-orange-700 text-white animate-pulse"
                          : "bg-gray-600 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      💰 Cash Out
                    </button>
                  ) : (
                    <div className="text-center py-3 bg-green-600/20 rounded-lg border border-green-500/30">
                      <div className="text-green-400 font-semibold">
                        ✅ Cashed Out!
                      </div>
                      <div className="text-sm text-gray-300">
                        Payout: ${bet1.payout.toFixed(2)}
                      </div>
                      <div
                        className={`text-sm font-semibold ${
                          bet1.profit >= 0 ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        Profit: {bet1.profit >= 0 ? "+" : ""}$
                        {bet1.profit.toFixed(2)}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Bet 2 */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">🎯 Bet 2</h3>
              <button
                onClick={() => setShowAutoCashout2(!showAutoCashout2)}
                className="text-sm text-purple-400 hover:text-purple-300"
              >
                Auto Cashout
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() =>
                    setBet2((prev) => ({
                      ...prev,
                      amount: Math.max(1, prev.amount - 1),
                    }))
                  }
                  className="w-10 h-10 bg-gray-700 rounded-lg hover:bg-gray-600 flex items-center justify-center font-bold text-lg"
                >
                  -
                </button>
                <input
                  type="number"
                  value={bet2.amount}
                  onChange={(e) =>
                    setBet2((prev) => ({
                      ...prev,
                      amount: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="flex-1 bg-gray-700 rounded-lg px-3 py-2 text-center font-semibold"
                  disabled={bet2.active}
                />
                <button
                  onClick={() =>
                    setBet2((prev) => ({ ...prev, amount: prev.amount + 1 }))
                  }
                  className="w-10 h-10 bg-gray-700 rounded-lg hover:bg-gray-600 flex items-center justify-center font-bold text-lg"
                >
                  +
                </button>
              </div>

              {/* Potential Win Display */}
              {bet2.active && (
                <div className="bg-blue-500/20 rounded-lg p-2 text-center border border-blue-500/30">
                  <div className="text-sm text-blue-300">Potential Win</div>
                  <div className="text-lg font-semibold text-blue-400">
                    ${getPotentialWin(bet2.amount)}
                  </div>
                </div>
              )}

              {showAutoCashout2 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <input
                    type="number"
                    placeholder="Auto cashout at..."
                    value={bet2.autoCashout || ""}
                    onChange={(e) =>
                      setBet2((prev) => ({
                        ...prev,
                        autoCashout: parseFloat(e.target.value) || null,
                      }))
                    }
                    className="w-full bg-gray-700 rounded-lg px-3 py-2"
                    step="0.1"
                    min="1.1"
                  />
                </motion.div>
              )}

              {!bet2.active ? (
                <button
                  onClick={() => placeBet(2)}
                  disabled={gameState.phase !== "waiting"}
                  className={`w-full py-3 rounded-lg font-semibold transition-all ${
                    gameState.phase === "waiting"
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-gray-600 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {gameState.phase === "waiting"
                    ? "🎯 Place Bet"
                    : "⏱️ Betting Closed"}
                </button>
              ) : (
                <div className="space-y-2">
                  {!bet2.cashedOut ? (
                    <button
                      onClick={cashOut}
                      disabled={gameState.phase !== "flying"}
                      className={`w-full py-3 rounded-lg font-semibold transition-all ${
                        gameState.phase === "flying"
                          ? "bg-orange-600 hover:bg-orange-700 text-white animate-pulse"
                          : "bg-gray-600 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      💰 Cash Out
                    </button>
                  ) : (
                    <div className="text-center py-3 bg-green-600/20 rounded-lg border border-green-500/30">
                      <div className="text-green-400 font-semibold">
                        ✅ Cashed Out!
                      </div>
                      <div className="text-sm text-gray-300">
                        Payout: ${bet2.payout.toFixed(2)}
                      </div>
                      <div
                        className={`text-sm font-semibold ${
                          bet2.profit >= 0 ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        Profit: {bet2.profit >= 0 ? "+" : ""}$
                        {bet2.profit.toFixed(2)}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Active Players */}
          <ActivePlayersList
            players={activePlayers}
            currentMultiplier={gameState.multiplier}
            gamePhase={gameState.phase}
          />
        </div>
      </div>
    </div>
  );
};

export default AviatorGame;
