import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const ActivePlayersList = ({ players, currentMultiplier, gamePhase }) => {
  // Add dummy data to fill the list
  const dummyPlayers = [
    {
      id: 1,
      username: "d***9",
      betAmount: 100.0,
      cashedOut: true,
      cashoutMultiplier: 1.52,
      payout: 152.0,
    },
    {
      id: 2,
      username: "d***9",
      betAmount: 100.0,
      cashedOut: true,
      cashoutMultiplier: 1.5,
      payout: 150.0,
    },
    {
      id: 3,
      username: "d***4",
      betAmount: 100.0,
      cashedOut: true,
      cashoutMultiplier: 1.57,
      payout: 157.0,
    },
    {
      id: 4,
      username: "d***9",
      betAmount: 100.0,
      cashedOut: false,
      cashoutMultiplier: null,
      payout: 0,
    },
    {
      id: 5,
      username: "d***2",
      betAmount: 100.0,
      cashedOut: false,
      cashoutMultiplier: null,
      payout: 0,
    },
    {
      id: 6,
      username: "d***3",
      betAmount: 100.0,
      cashedOut: false,
      cashoutMultiplier: null,
      payout: 0,
    },
    {
      id: 7,
      username: "d***9",
      betAmount: 100.0,
      cashedOut: false,
      cashoutMultiplier: null,
      payout: 0,
    },
    {
      id: 8,
      username: "d***4",
      betAmount: 100.0,
      cashedOut: false,
      cashoutMultiplier: null,
      payout: 0,
    },
    {
      id: 9,
      username: "d***3",
      betAmount: 100.0,
      cashedOut: false,
      cashoutMultiplier: null,
      payout: 0,
    },
    {
      id: 10,
      username: "d***9",
      betAmount: 100.0,
      cashedOut: false,
      cashoutMultiplier: null,
      payout: 0,
    },
    {
      id: 11,
      username: "d***9",
      betAmount: 100.0,
      cashedOut: false,
      cashoutMultiplier: null,
      payout: 0,
    },
    {
      id: 12,
      username: "d***5",
      betAmount: 100.0,
      cashedOut: false,
      cashoutMultiplier: null,
      payout: 0,
    },
    {
      id: 13,
      username: "d***5",
      betAmount: 100.0,
      cashedOut: false,
      cashoutMultiplier: null,
      payout: 0,
    },
    {
      id: 14,
      username: "d***5",
      betAmount: 100.0,
      cashedOut: false,
      cashoutMultiplier: null,
      payout: 0,
    },
    {
      id: 15,
      username: "d***8",
      betAmount: 100.0,
      cashedOut: false,
      cashoutMultiplier: null,
      payout: 0,
    },
    {
      id: 16,
      username: "d***0",
      betAmount: 100.0,
      cashedOut: false,
      cashoutMultiplier: null,
      payout: 0,
    },
  ];

  // Combine real players with dummy data
  const allPlayers = [...players, ...dummyPlayers];

  const getPlayerStatus = (player) => {
    if (player.cashedOut) {
      return {
        status: "cashed",
        color: "text-green-400",
        bgColor: "bg-green-500/20",
        borderColor: "border-green-500/30",
      };
    }

    if (gamePhase === "crashed") {
      return {
        status: "lost",
        color: "text-red-400",
        bgColor: "bg-red-500/20",
        borderColor: "border-red-500/30",
      };
    }

    if (gamePhase === "flying") {
      return {
        status: "flying",
        color: "text-blue-400",
        bgColor: "bg-blue-500/20",
        borderColor: "border-blue-500/30",
      };
    }

    return {
      status: "waiting",
      color: "text-gray-400",
      bgColor: "bg-gray-500/20",
      borderColor: "border-gray-500/30",
    };
  };

  const formatProfit = (player) => {
    if (player.cashedOut) {
      const profit = player.payout - player.betAmount;
      return profit > 0 ? `+$${profit.toFixed(2)}` : `$${profit.toFixed(2)}`;
    }

    if (gamePhase === "flying") {
      const potentialPayout = player.betAmount * currentMultiplier;
      const potentialProfit = potentialPayout - player.betAmount;
      return `+$${potentialProfit.toFixed(2)}`;
    }

    return `$${player.betAmount.toFixed(2)}`;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "cashed":
        return "💰";
      case "lost":
        return "💥";
      case "flying":
        return "✈️";
      case "waiting":
        return "⏱️";
      default:
        return "👤";
    }
  };

  return (
    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          👥 Active Players
          <span className="text-sm text-gray-400">({allPlayers.length})</span>
        </h3>
        <div className="text-xs text-gray-500">
          {gamePhase === "flying" && (
            <span className="text-blue-400">🚀 In Flight</span>
          )}
          {gamePhase === "waiting" && (
            <span className="text-yellow-400">⏰ Waiting</span>
          )}
          {gamePhase === "crashed" && (
            <span className="text-red-400">💥 Crashed</span>
          )}
        </div>
      </div>

      <div className="space-y-2 max-h-[550px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
        <AnimatePresence mode="popLayout">
          {allPlayers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">🎮</div>
              <p>No active players</p>
              <p className="text-sm">Be the first to place a bet!</p>
            </div>
          ) : (
            allPlayers.map((player, index) => {
              const playerStatus = getPlayerStatus(player);
              return (
                <motion.div
                  key={`${player.username}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  whileHover={{ scale: 1.02 }}
                  className={`p-3 rounded-lg border ${playerStatus.bgColor} ${playerStatus.borderColor} transition-all duration-300`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {getStatusIcon(playerStatus.status)}
                      </span>
                      <div>
                        <div className="font-medium text-white truncate max-w-24">
                          {player.username}
                        </div>
                        <div className="text-xs text-gray-400">
                          Bet: ${player.betAmount?.toFixed(2) || "0.00"}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`font-semibold ${playerStatus.color}`}>
                        {formatProfit(player)}
                      </div>
                      {player.cashedOut && (
                        <div className="text-xs text-gray-400">
                          @ {player.multiplier?.toFixed(2)}x
                        </div>
                      )}
                      {gamePhase === "flying" && !player.cashedOut && (
                        <div className="text-xs text-blue-400">
                          @ {currentMultiplier.toFixed(2)}x
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status indicator */}
                  <div className="mt-2 flex items-center gap-1">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        playerStatus.status === "cashed"
                          ? "bg-green-500"
                          : playerStatus.status === "lost"
                          ? "bg-red-500"
                          : playerStatus.status === "flying"
                          ? "bg-blue-500 animate-pulse"
                          : "bg-yellow-500"
                      }`}
                    ></div>
                    <span className="text-xs text-gray-400">
                      {playerStatus.status === "cashed"
                        ? "Cashed out"
                        : playerStatus.status === "lost"
                        ? "Lost"
                        : playerStatus.status === "flying"
                        ? "Flying"
                        : "Waiting"}
                    </span>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {allPlayers.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-700">
          <div className="flex justify-between text-sm text-gray-400">
            <span>Total Bets:</span>
            <span className="text-white font-semibold">
              $
              {allPlayers
                .reduce((sum, player) => sum + (player.betAmount || 0), 0)
                .toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivePlayersList;
