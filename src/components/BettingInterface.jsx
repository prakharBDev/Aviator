import { useState } from "react";

const BettingInterface = () => {
  const [mode, setMode] = useState("bet"); // 'bet' or 'auto'
  const [betAmount, setBetAmount] = useState(500);
  const quickPresets = [100, 200, 500, 1000];

  const handlePreset = (amount) => setBetAmount(amount);
  const increaseBet = () => setBetAmount((prev) => prev + 100);
  const decreaseBet = () =>
    setBetAmount((prev) => (prev - 100 >= 0 ? prev - 100 : 0));

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-900 rounded-xl text-white space-y-6 shadow-lg">
      {/* Toggle Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setMode("bet")}
          className={`w-1/2 py-2 rounded-lg font-semibold transition ${
            mode === "bet"
              ? "bg-blue-600 text-white"
              : "bg-gray-700 text-gray-300"
          }`}
        >
          Bet
        </button>
        <button
          onClick={() => setMode("auto")}
          className={`w-1/2 py-2 rounded-lg font-semibold transition ${
            mode === "auto"
              ? "bg-blue-600 text-white"
              : "bg-gray-700 text-gray-300"
          }`}
        >
          Auto
        </button>
      </div>

      {/* Bet Amount Controls */}
      <div className="text-center space-y-2">
        <div className="text-2xl font-bold">₹ {betAmount.toFixed(2)}</div>
        <div className="flex justify-center gap-4">
          <button
            onClick={decreaseBet}
            className="bg-gray-700 px-4 py-2 rounded text-lg hover:bg-gray-600"
          >
            −
          </button>
          <button
            onClick={increaseBet}
            className="bg-gray-700 px-4 py-2 rounded text-lg hover:bg-gray-600"
          >
            +
          </button>
        </div>

        {/* Quick Presets */}
        <div className="flex justify-center gap-2 flex-wrap mt-2">
          {quickPresets.map((amount) => (
            <button
              key={amount}
              onClick={() => handlePreset(amount)}
              className="bg-gray-800 px-3 py-1 rounded-md text-sm hover:bg-gray-700"
            >
              ₹ {amount}
            </button>
          ))}
        </div>
      </div>

      {/* Action Button */}
      <button className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold text-lg shadow-lg transition">
        Bet ₹ {betAmount.toFixed(2)}
      </button>
    </div>
  );
};

export default BettingInterface;
