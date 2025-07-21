import React from "react";
import NameInput from "./NameInput";
import ActivePlayersList from "./ActivePlayersList";
import GameCanvas from "./GameCanvas";
import GameHistory from "./GameHistory";
import BettingPanel from "./BettingPanel";
import GameHeader from "./GameHeader";
import Notifications from "./Notifications";
import useGameState from "../hooks/useGameState";

const AviatorGame = () => {
  const {
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
    handleNameSubmit,
    placeBet,
    cashOut,
    getPotentialWin,
  } = useGameState();

  if (showNameInput) {
    return (
      <NameInput onNameSubmit={handleNameSubmit} isVisible={showNameInput} />
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4">
      {/* Notifications */}
      <Notifications notifications={notifications} />

      {/* Header */}
      <GameHeader player={player} />

      {/* Session Stats - Commented out for now */}
      {/* Session stats component can be added here if needed */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Players */}
        <div>
          <ActivePlayersList
            players={activePlayers}
            currentMultiplier={gameState.multiplier}
            gamePhase={gameState.phase}
          />
        </div>
        
        <div className="lg:col-span-2 space-y-6">
          {/* Game History */}
          <GameHistory gameHistory={gameHistory} />
          
          {/* Game Canvas */}
          <div className="bg-black rounded-lg p-6 border border-gray-800 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20"></div>
            <GameCanvas gameState={gameState} />
          </div>
          
          {/* Betting Panel */}
          <BettingPanel
            bet1={bet1}
            setBet1={setBet1}
            bet2={bet2}
            setBet2={setBet2}
            gameState={gameState}
            showAutoCashout1={showAutoCashout1}
            setShowAutoCashout1={setShowAutoCashout1}
            showAutoCashout2={showAutoCashout2}
            setShowAutoCashout2={setShowAutoCashout2}
            placeBet={placeBet}
            cashOut={cashOut}
            getPotentialWin={getPotentialWin}
          />
        </div>
      </div>
    </div>
  );
};

export default AviatorGame;
