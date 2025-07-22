import React, { useState } from "react";
import { Ellipsis } from "lucide-react";

const GameHistory = ({ gameHistory }) => {
  const [showAll, setShowAll] = useState(false);

  return (
    <div className="bg-black rounded-lg p-4 border border-gray-800">
      <div className="relative">
        {/* Game History Section */}
        <div
          className={`overflow-hidden w-11/12 transition-all duration-300 ${
            showAll ? "max-h-[500px]" : "max-h-[36px]"
          }`}
        >
          <div className="flex flex-wrap gap-2">
            {gameHistory.slice(0, 20).map((game) => (
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

        {/* Fade or ... when collapsed */}
        {!showAll && (
          <div className="absolute right-0 top-0 h-full flex items-center pl-4">
            <div
              className="text-blue-400 border border-blue-400 rounded-xl px-1 cursor-pointer hover:bg-blue-400/10"
              onClick={() => setShowAll(true)}
            >
              <Ellipsis size={16} />
            </div>
          </div>
        )}

        {/* Show Less Button */}
        {showAll && (
          <div className="mt-2 flex justify-end">
            <div
              className="text-blue-400 border border-blue-400 rounded-xl px-1 cursor-pointer hover:bg-blue-400/10 flex items-center"
              onClick={() => setShowAll(false)}
            >
              <Ellipsis size={16} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameHistory;