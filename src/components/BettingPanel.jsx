import React from "react";
import { motion } from "framer-motion";

const BettingPanel = ({
  bet1,
  setBet1,
  bet2,
  setBet2,
  gameState,
  showAutoCashout1,
  setShowAutoCashout1,
  showAutoCashout2,
  setShowAutoCashout2,
  placeBet,
  cashOut,
  getPotentialWin,
}) => {
  const BetControl = ({
    betNumber,
    bet,
    setBet,
    showAutoCashout,
    setShowAutoCashout,
  }) => (
    <div className="bg-black w-1/2 rounded-lg p-4 border border-gray-800">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">🎯 Bet {betNumber}</h3>
        <button
          onClick={() => setShowAutoCashout(!showAutoCashout)}
          className="text-sm text-purple-400 hover:text-purple-300"
        >
          Auto Cashout
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() =>
              setBet((prev) => ({
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
            value={bet.amount}
            onChange={(e) =>
              setBet((prev) => ({
                ...prev,
                amount: parseFloat(e.target.value) || 0,
              }))
            }
            className="flex-1 bg-gray-700 rounded-lg px-3 py-2 text-center font-semibold"
            disabled={bet.active}
          />
          <button
            onClick={() =>
              setBet((prev) => ({ ...prev, amount: prev.amount + 1 }))
            }
            className="w-10 h-10 bg-gray-700 rounded-lg hover:bg-gray-600 flex items-center justify-center font-bold text-lg"
          >
            +
          </button>
        </div>

        {/* Potential Win Display */}
        {bet.active && (
          <div className="bg-blue-500/20 rounded-lg p-2 text-center border border-blue-500/30">
            <div className="text-sm text-blue-300">Potential Win</div>
            <div className="text-lg font-semibold text-blue-400">
              ${getPotentialWin(bet.amount)}
            </div>
          </div>
        )}

        {showAutoCashout && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <input
              type="number"
              placeholder="Auto cashout at..."
              value={bet.autoCashout || ""}
              onChange={(e) =>
                setBet((prev) => ({
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

        {/* Bet Buttons */}
        {!bet.active ? (
          <button
            onClick={() => placeBet(betNumber)}
            disabled={gameState.phase !== "waiting"}
            className={`w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md transition-all duration-150 hover:from-green-600 hover:to-green-700 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-green-400 ${
              gameState.phase !== "waiting"
                ? "opacity-60 cursor-not-allowed"
                : ""
            }`}
          >
            <span className="mr-2">🎯</span> Bet
          </button>
        ) : (
          <div className="space-y-2">
            {!bet.cashedOut ? (
              <button
                onClick={cashOut}
                disabled={gameState.phase !== "flying"}
                className={`w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md transition-all duration-150 hover:from-purple-600 hover:to-purple-700 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                  gameState.phase !== "flying"
                    ? "opacity-60 cursor-not-allowed"
                    : ""
                }`}
              >
                <span className="mr-2">💸</span> Auto Cashout
              </button>
            ) : (
              <div className="text-center py-3 bg-green-600/20 rounded-lg border border-green-500/30">
                <div className="text-green-400 font-semibold">
                  ✅ Cashed Out!
                </div>
                <div className="text-sm text-gray-300">
                  Payout: ${bet.payout.toFixed(2)}
                </div>
                <div
                  className={`text-sm font-semibold ${
                    bet.profit >= 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  Profit: {bet.profit >= 0 ? "+" : ""}$
                  {bet.profit.toFixed(2)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-row w-full gap-4">
      <BetControl
        betNumber={1}
        bet={bet1}
        setBet={setBet1}
        showAutoCashout={showAutoCashout1}
        setShowAutoCashout={setShowAutoCashout1}
      />
      <BetControl
        betNumber={2}
        bet={bet2}
        setBet={setBet2}
        showAutoCashout={showAutoCashout2}
        setShowAutoCashout={setShowAutoCashout2}
      />
    </div>
  );
};

export default BettingPanel;