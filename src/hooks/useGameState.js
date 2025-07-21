import { useState, useEffect, useCallback } from "react";
import { useSocket } from "../socketContext";
import useSound from "./useSound";

const useGameState = () => {
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

  // Utility function to add notifications
  const addNotification = useCallback((message, type) => {
    const id = Date.now() + Math.random();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  }, []);

  // Handle name submission
  const handleNameSubmit = useCallback((name) => {
    if (socket) {
      socket.emit("register", {
        username: name,
        balance: 1000,
      });
      setPlayer((prev) => ({ ...prev, username: name }));
      setShowNameInput(false);
    }
  }, [socket]);

  // Place bet function
  const placeBet = useCallback((betNumber) => {
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
  }, [socket, gameState.phase, bet1, bet2, player.balance, addNotification]);

  // Cash out function
  const cashOut = useCallback(() => {
    if (!socket || gameState.phase !== "flying") return;
    socket.emit("cashOut");
  }, [socket, gameState.phase]);

  // Get potential win amount
  const getPotentialWin = useCallback((betAmount) => {
    if (gameState.phase === "flying") {
      return (betAmount * Math.min(gameState.multiplier, 15)).toFixed(2);
    }
    return betAmount.toFixed(2);
  }, [gameState.phase, gameState.multiplier]);

  // Get multiplier color based on value
  const getMultiplierColor = useCallback(() => {
    if (gameState.phase === "crashed") return "text-red-400";
    if (gameState.multiplier < 2) return "text-green-400";
    if (gameState.multiplier < 5) return "text-yellow-400";
    if (gameState.multiplier < 10) return "text-orange-400";
    return "text-red-400";
  }, [gameState.phase, gameState.multiplier]);

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
    addNotification,
  ]);

  return {
    // State
    gameState,
    player,
    bet1,
    setBet1,
    bet2,
    setBet2,
    gameHistory,
    activePlayers,
    notifications,
    showAutoCashout1,
    setShowAutoCashout1,
    showAutoCashout2,
    setShowAutoCashout2,
    showNameInput,
    sessionStats,
    
    // Functions
    handleNameSubmit,
    placeBet,
    cashOut,
    getPotentialWin,
    getMultiplierColor,
    addNotification,
  };
};

export default useGameState;