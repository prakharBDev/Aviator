import React, { useState } from "react";

const defaultData = [
  { user: "d***1", bet: "100.00", multiplier: "—", cashOut: "—" },
  { user: "d***3", bet: "100.00", multiplier: "—", cashOut: "—" },
  { user: "d***9", bet: "100.00", multiplier: "—", cashOut: "—" },
  { user: "d***0", bet: "100.00", multiplier: "—", cashOut: "—" },
  { user: "d***4", bet: "100.00", multiplier: "—", cashOut: "—" },
  { user: "d***8", bet: "100.00", multiplier: "—", cashOut: "—" },
  { user: "d***5", bet: "100.00", multiplier: "—", cashOut: "—" },
  { user: "d***1", bet: "100.00", multiplier: "—", cashOut: "—" },
  { user: "d***3", bet: "100.00", multiplier: "—", cashOut: "—" },
  { user: "d***9", bet: "100.00", multiplier: "—", cashOut: "—" },
  { user: "d***3", bet: "100.00", multiplier: "—", cashOut: "—" },
  { user: "d***9", bet: "100.00", multiplier: "—", cashOut: "—" },
];

const BetTable = () => {
  const [activeTab, setActiveTab] = useState("All Bets");

  const handleTabClick = (tab) => setActiveTab(tab);

  return (
    <div
      className="bg-black text-white p-4 rounded-md shadow-md"
      style={{
        width: "605px", // Increased width
        height: "calc(100vh - 60px)", // Make it fill vertical space until bottom
        position: "absolute",
        left: "-16px", // Positioned on the left side
        top: "47px", // Positioned from the top
        overflowY: "auto", // Enable scrolling if content overflows vertically
      }}
    >
      {/* Tabs */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-4">
          {["All Bets", "My Bets", "Top"].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabClick(tab)}
              className={`px-4 py-2 ${
                activeTab === tab
                  ? "bg-gray-700 text-white rounded-md"
                  : "text-gray-400"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <button className="text-sm text-gray-400 flex items-center space-x-1">
          <span>⏳</span> <span>Previous hand</span>
        </button>
      </div>

      {/* Table */}
      <div>
        <div className="text-sm mb-2">ALL BETS</div>
        <div className="text-gray-400 mb-4">{defaultData.length}</div>
        <table className="table-auto w-full text-sm">
          <thead>
            <tr className="text-gray-500 border-b border-gray-700">
              <th className="py-2 text-left">User</th>
              <th className="py-2 text-right">Bet USD</th>
              <th className="py-2 text-right">X</th>
              <th className="py-2 text-right">Cash out USD</th>
            </tr>
          </thead>
          <tbody>
            {defaultData.map((row, index) => (
              <tr
                key={index}
                className={`border-b border-gray-800 ${
                  index % 2 === 0 ? "bg-gray-800" : "bg-gray-900"
                }`}
              >
                <td className="py-2 text-left">{row.user}</td>
                <td className="py-2 text-right">{row.bet}</td>
                <td className="py-2 text-right">{row.multiplier}</td>
                <td className="py-2 text-right">{row.cashOut}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="text-xs text-gray-500 mt-4 flex justify-between items-center">
        <span>This game is</span>
        <span className="flex items-center space-x-1">
          <span className="text-green-500">✔</span>
          <span>Provably Fair</span>
        </span>
      </div>
    </div>
  );
};

export default BetTable;
