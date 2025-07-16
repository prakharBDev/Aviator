import React, { useState } from "react";
import { motion } from "framer-motion";

const NameInput = ({ onNameSubmit, isVisible }) => {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedName = name.trim();

    if (trimmedName.length < 2) {
      setError("Name must be at least 2 characters long");
      return;
    }

    if (trimmedName.length > 20) {
      setError("Name must be less than 20 characters");
      return;
    }

    if (!/^[a-zA-Z0-9_\s]+$/.test(trimmedName)) {
      setError(
        "Name can only contain letters, numbers, underscores, and spaces"
      );
      return;
    }

    onNameSubmit(trimmedName);
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
    setError("");
  };

  const generateRandomName = () => {
    const adjectives = [
      "Lucky",
      "Fast",
      "Smart",
      "Cool",
      "Bold",
      "Swift",
      "Brave",
      "Quick",
      "Sharp",
      "Ace",
    ];
    const nouns = [
      "Pilot",
      "Flyer",
      "Aviator",
      "Player",
      "Gamer",
      "Pro",
      "Expert",
      "Champion",
      "Master",
      "Hero",
    ];
    const randomAdjective =
      adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNumber = Math.floor(Math.random() * 1000);

    setName(`${randomAdjective}${randomNoun}${randomNumber}`);
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 border border-gray-700"
      >
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-white mb-2">
            Welcome to Aviator!
          </h2>
          <p className="text-gray-300">Enter your name to join the game</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              placeholder="Enter your name..."
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              maxLength={20}
              autoFocus
            />
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm mt-2"
              >
                {error}
              </motion.p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={generateRandomName}
              className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
            >
              Random Name
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
            >
              Join Game
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-gray-400 text-sm">
          <p>🎮 Multiplayer Aviator Game</p>
          <p>Fly high, bet smart, cash out in time!</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default NameInput;
