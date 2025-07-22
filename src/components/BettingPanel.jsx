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
    <div className="bg-[#1b1c1d] w-1/2 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-center mb-3">
        <div className="bg-[#141516] w-52 p-1 rounded-2xl flex justify-between relative">
          {/* Bet Button */}
          <button
            className={`w-1/2 rounded-2xl ${
              !showAutoCashout ? "bg-[#1b1c1d] text-white" : "text-gray-300"
            }`}
            onClick={() => setShowAutoCashout1(false)}
          >
            Bet
          </button>

          {/* Auto Button with Dropdown */}
          <div className="relative w-1/2">
            <button
              onClick={() => setShowAutoCashout(true)}
              className={`w-full rounded-2xl ${
                showAutoCashout ? "bg-[#1b1c1d] text-white" : " text-white"
              }`}
            >
              Auto
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-10">
        <div>
          {/* Amount Controller */}
          <div className="flex items-center bg-[#141516] p-2 rounded-2xl w-36 space-x-2">
            <button
              onClick={() =>
                setBet((prev) => ({
                  ...prev,
                  amount: Math.max(1, prev.amount - 1),
                }))
              }
              className="w-6 h-6 bg-[#1b1c1d] rounded-lg hover:bg-gray-600 flex items-center justify-center font-bold text-lg"
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
              className="flex-1 w-2/3 bg-transparent rounded-lg text-center font-semibold"
              disabled={bet.active}
            />
            <button
              onClick={() =>
                setBet((prev) => ({
                  ...prev,
                  amount: prev.amount + 1,
                }))
              }
              className="w-6 h-6 bg-[#1b1c1d] rounded-lg hover:bg-gray-600 flex items-center justify-center font-bold text-lg"
            >
              +
            </button>
          </div>

          {/* Quick Amount Buttons */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            {[100, 200, 500, 1000].map((amt) => (
              <button
                key={amt}
                onClick={() =>
                  setBet((prev) => ({
                    ...prev,
                    amount: amt,
                  }))
                }
                className="px-3 py-1 rounded-lg bg-[#141516] text-white hover:bg-gray-600 text-sm font-medium"
              >
                {amt}
              </button>
            ))}
          </div>
        </div>

        {/* Potential Win Display */}

        {/* Betting / Cash Out Logic */}
        <div className="w-full  ">
          {" "}
          {!bet.active ? (
            <button
              onClick={() => placeBet(1)}
              disabled={gameState.phase !== "waiting"}
              className={`w-full h-full py-3 rounded-lg font-semibold transition-all ${
                gameState.phase === "waiting"
                  ? "bg-[#28a909] hover:bg-green-700 text-white"
                  : "bg-gray-600 text-gray-400 cursor-not-allowed"
              }`}
            >
              {gameState.phase === "waiting"
                ? "🎯 Place Bet"
                : "⏱️ Betting Closed"}
            </button>
          ) : (
            <div className="w-full h-full">
              {!bet.cashedOut ? (
                <button
                  onClick={cashOut}
                  disabled={gameState.phase !== "flying"}
                  className={`w-full h-full py-3 rounded-lg flex flex-col justify-center items-center font-semibold transition-all ${
                    gameState.phase === "flying"
                      ? "bg-orange-600 hover:bg-orange-700 text-white animate-pulse"
                      : "bg-gray-600 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  💰 Cash Out
                  {bet.active && (
                    <span className="ml-2 text-sm text-gray-300">
                      {" "}
                      ${getPotentialWin(bet.amount)}
                    </span>
                  )}
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
                    Profit: {bet.profit >= 0 ? "+" : ""}${bet.profit.toFixed(2)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {showAutoCashout && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className=" w-full mt-2 z-10"
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
