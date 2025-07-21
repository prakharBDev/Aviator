import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Function to generate random usernames
const generateRandomUsername = () => {
  // Common first names
  const firstNames = [
    'Alex', 'Sam', 'Jordan', 'Taylor', 'Casey', 'Riley', 'Morgan', 'Quinn', 'Avery', 'Blake',
    'Cameron', 'Drew', 'Emery', 'Finley', 'Gray', 'Harper', 'Indigo', 'Jamie', 'Kai', 'Logan',
    'Mason', 'Noah', 'Owen', 'Parker', 'Quinn', 'River', 'Sage', 'Tyler', 'Unity', 'Vale',
    'Willow', 'Xander', 'Yuki', 'Zara', 'Aria', 'Bella', 'Chloe', 'Diana', 'Emma', 'Fiona',
    'Grace', 'Hannah', 'Iris', 'Jade', 'Kate', 'Luna', 'Maya', 'Nova', 'Olivia', 'Paige',
    'Ruby', 'Sophia', 'Tara', 'Uma', 'Vera', 'Wren', 'Xena', 'Yara', 'Zoe', 'Ada',
    'Ben', 'Carl', 'Dan', 'Eli', 'Finn', 'Gus', 'Hank', 'Ian', 'Jake', 'Kyle',
    'Leo', 'Max', 'Nick', 'Oscar', 'Paul', 'Ryan', 'Sean', 'Tom', 'Vic', 'Wade'
  ];

  // Common last name prefixes
  const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
    'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
    'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
    'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
    'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts',
    'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker', 'Cruz', 'Edwards', 'Collins', 'Reyes',
    'Stewart', 'Morris', 'Morales', 'Murphy', 'Cook', 'Rogers', 'Gutierrez', 'Ortiz', 'Morgan', 'Cooper',
    'Peterson', 'Bailey', 'Reed', 'Kelly', 'Howard', 'Ramos', 'Kim', 'Cox', 'Ward', 'Richardson'
  ];

  // Username patterns
  const patterns = [
    // First name + number
    () => `${firstNames[Math.floor(Math.random() * firstNames.length)]}${Math.floor(Math.random() * 999) + 1}`,
    // First name + underscore + last name
    () => `${firstNames[Math.floor(Math.random() * firstNames.length)]}_${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
    // First name + dot + last name
    () => `${firstNames[Math.floor(Math.random() * firstNames.length)]}.${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
    // First name + last name (no separator)
    () => `${firstNames[Math.floor(Math.random() * firstNames.length)]}${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
    // First name + random word
    () => `${firstNames[Math.floor(Math.random() * firstNames.length)]}${['Gamer', 'Player', 'Pro', 'Master', 'King', 'Queen', 'Star', 'Hero', 'Legend', 'Boss'][Math.floor(Math.random() * 10)]}`,
    // Random word + number
    () => `${['Gaming', 'Player', 'Pro', 'Master', 'King', 'Queen', 'Star', 'Hero', 'Legend', 'Boss', 'Cool', 'Epic', 'Awesome', 'Amazing', 'Incredible'][Math.floor(Math.random() * 15)]}${Math.floor(Math.random() * 999) + 1}`,
    // First letter of first name + last name + number
    () => `${firstNames[Math.floor(Math.random() * firstNames.length)][0]}${lastNames[Math.floor(Math.random() * lastNames.length)]}${Math.floor(Math.random() * 99) + 1}`,
    // First name + random emoji-inspired suffix
    () => `${firstNames[Math.floor(Math.random() * firstNames.length)]}${['Fire', 'Ice', 'Storm', 'Thunder', 'Lightning', 'Shadow', 'Phoenix', 'Dragon', 'Wolf', 'Eagle'][Math.floor(Math.random() * 10)]}`,
    // Gaming-style usernames
    () => `${['xX', 'Xx', ''][Math.floor(Math.random() * 3)]}${firstNames[Math.floor(Math.random() * firstNames.length)]}${['Xx', 'xX', ''][Math.floor(Math.random() * 3)]}`,
    // Simple first name with number
    () => `${firstNames[Math.floor(Math.random() * firstNames.length)].toLowerCase()}${Math.floor(Math.random() * 999) + 1}`
  ];

  // Randomly select a pattern and generate username
  const selectedPattern = patterns[Math.floor(Math.random() * patterns.length)];
  return selectedPattern();
};

// Function to generate random bet amounts
const generateRandomBetAmount = () => {
  const amounts = [10, 25, 50, 100, 200, 500, 1000, 2500, 5000, 10000];
  const randomAmount = amounts[Math.floor(Math.random() * amounts.length)];
  return randomAmount;
};

// Function to generate random player data
const generateRandomPlayers = (count = 16) => {
  const players = [];
  for (let i = 0; i < count; i++) {
    const betAmount = generateRandomBetAmount();
    
    // Generate random cashout multiplier (between 1.1x and 5.0x)
    const cashoutMultiplier = (Math.random() * 3.9 + 1.1).toFixed(2);
    
    players.push({
      id: i + 1,
      username: generateRandomUsername(),
      betAmount: betAmount,
      cashedOut: false, // All players start as not cashed out
      cashoutMultiplier: parseFloat(cashoutMultiplier), // Target multiplier for cashout
      payout: 0, // Will be calculated when they cash out
      hasCashedOut: false, // Track if they've already cashed out this game
    });
  }
  return players;
};

const ActivePlayersList = ({ players, currentMultiplier, gamePhase }) => {
  // Generate random dummy data once when component mounts
  const dummyPlayers = useMemo(() => generateRandomPlayers(16), []);
  
  // Combine real players with dummy data
  const allPlayers = [...players, ...dummyPlayers];

  // Process players for cashout events during flying phase
  const processedPlayers = useMemo(() => {
    if (gamePhase === "flying" && currentMultiplier > 1.0) {
      return allPlayers.map(player => {
        // Check if player should cash out at current multiplier
        if (!player.hasCashedOut && 
            player.cashoutMultiplier && 
            currentMultiplier >= player.cashoutMultiplier) {
          
          // Add some randomness to cashout timing (not exactly at target)
          const actualCashoutMultiplier = Math.min(
            currentMultiplier, 
            player.cashoutMultiplier + (Math.random() * 0.5) // Add up to 0.5x randomness
          );
          
          return {
            ...player,
            cashedOut: true,
            hasCashedOut: true,
            actualCashoutMultiplier: actualCashoutMultiplier.toFixed(2),
            payout: (player.betAmount * actualCashoutMultiplier).toFixed(2)
          };
        }
        return player;
      });
    }
    return allPlayers;
  }, [allPlayers, currentMultiplier, gamePhase]);

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
    <div className="bg-black rounded-lg p-4 border border-gray-800 h-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold text-blue-200 flex items-center gap-2">
          <span>🧑‍🤝‍🧑 Active Players</span>
          <span className="text-xs bg-blue-900/80 px-2 py-0.5 rounded-full text-blue-300">
            {processedPlayers.length}
          </span>
        </h3>
        <div className="text-xs text-blue-400 font-semibold">
          {gamePhase === "flying" && "🚀 In Flight"}
          {gamePhase === "waiting" && "⏰ Waiting"}
          {gamePhase === "crashed" && "💥 Crashed"}
        </div>
      </div>

      <div className="space-y-3 max-h-[570px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
        {processedPlayers.map((player, index) => {
          const isCashed = player.cashedOut;
          const isFlying = !player.cashedOut && gamePhase === "flying";
          
          // Calculate profits
          const actualProfit = isCashed
            ? player.payout - player.betAmount
            : player.betAmount * currentMultiplier - player.betAmount;
          
          // Calculate potential profit if they hadn't cashed out
          const potentialProfit = player.betAmount * currentMultiplier - player.betAmount;
          
          // Use actual profit for display, but track potential for comparison
          const profit = actualProfit;

          return (
            <div
              key={player.id || index}
              className={`rounded-2xl p-4 flex justify-between items-center shadow-lg transition-all duration-200 backdrop-blur-sm
                ${
                  isCashed
                    ? "bg-gradient-to-r from-green-900/90 to-green-800/80 border-2 border-green-400"
                    : ""
                }
                ${
                  isFlying
                    ? "bg-gradient-to-r from-blue-900/90 to-blue-800/80 border-2 border-blue-400"
                    : ""
                }
                ${
                  !isCashed && !isFlying
                    ? "bg-gradient-to-r from-gray-800/90 to-gray-900/80 border border-gray-700"
                    : ""
                }
                hover:scale-[1.02] hover:shadow-2xl hover:ring-2 hover:ring-green-400`}
            >
              {/* Avatar/Icon */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow
                  ${
                    isCashed
                      ? "bg-green-500/80 text-white"
                      : isFlying
                      ? "bg-blue-500/80 text-white"
                      : "bg-gray-700 text-gray-200"
                  }`}
                >
                  {player.username[0].toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-white text-base">
                    {player.username}
                  </div>
                  <div className="text-xs text-gray-300">
                    Bet: ${player.betAmount.toFixed(2)}
                  </div>
                </div>
              </div>
              {/* Profit and Status */}
              <div className="text-right">
                <div
                  className={`font-extrabold text-2xl tracking-wide ${
                    isCashed
                      ? "text-green-300 animate-bounce"
                      : isFlying
                      ? "text-blue-300 animate-pulse"
                      : "text-gray-300"
                  }`}
                >
                  {profit > 0 ? "+" : ""}${profit.toFixed(2)}
                </div>
                
                {/* Show potential earnings for cashed out players */}
                {isCashed && gamePhase === "flying" && (
                  <div className={`text-xs mt-1 font-medium ${
                    potentialProfit > actualProfit 
                      ? "text-orange-300 bg-orange-900/30 px-2 py-1 rounded-full border border-orange-500/50" // Could have earned more
                      : "text-emerald-300 bg-emerald-900/30 px-2 py-1 rounded-full border border-emerald-500/50"  // Made the right choice
                  }`}>
                    {potentialProfit > actualProfit 
                      ? `💭 Could earn: +$${potentialProfit.toFixed(2)}` 
                      : `✅ Smart choice! +$${actualProfit.toFixed(2)}`
                    }
                  </div>
                )}
                <div className="flex items-center gap-2 mt-1">
                  {(isCashed || isFlying) && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold
                      ${
                        isCashed
                          ? "bg-green-600/80 text-white"
                          : isFlying
                          ? "bg-blue-600/80 text-white"
                          : "bg-gray-600/80 text-gray-200"
                      }
                    `}
                    >
                      {isCashed ? "Cashed Out" : "Flying"}
                    </span>
                  )}
                  <span className="text-xs text-gray-400">
                    {isCashed || isFlying
                      ? `@ ${
                          isCashed
                            ? (player.actualCashoutMultiplier || player.cashoutMultiplier?.toFixed(2))
                            : currentMultiplier.toFixed(2)
                        }x`
                      : ""}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {processedPlayers.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-800 flex justify-between text-sm text-gray-400">
          <span>Total Bets:</span>
          <span className="text-white font-semibold">
            $
            {processedPlayers
              .reduce((sum, player) => sum + (player.betAmount || 0), 0)
              .toFixed(2)}
          </span>
        </div>
      )}
    </div>
  );
};

export default ActivePlayersList;
