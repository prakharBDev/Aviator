import React from "react";

const GameHeader = ({ player }) => {
  return (
    <div className="flex justify-between items-center mb-2 py-1 px-4 bg-black border-b border-gray-800">
      <div>
        <h1 className="text-lg font-bold text-red-500">Aviator</h1>
      </div>
      <div className="text-right">
        <div className="text-base font-bold text-green-400">
          {player.balance.toFixed(2)} USD
        </div>
      </div>
    </div>
  );
};

export default GameHeader;