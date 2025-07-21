import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

const NameInput = ({ onNameSubmit, isVisible }) => {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const canvasRef = useRef(null);

  // Particle animation for background (with some larger, slower particles and shooting stars)
  useEffect(() => {
    if (!isVisible) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Generate particles (mix of small and large)
    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() < 0.8 ? Math.random() * 2 + 1 : Math.random() * 8 + 4, // some large
      dx: (Math.random() - 0.5) * (Math.random() < 0.8 ? 0.5 : 0.15), // large ones move slower
      dy: (Math.random() - 0.5) * (Math.random() < 0.8 ? 0.5 : 0.15),
      color: ["#3b82f6", "#ef4444", "#fbbf24", "#fff", "#6366f1"][
        Math.floor(Math.random() * 5)
      ],
    }));

    // Shooting star state
    let shootingStar = null;
    let shootingStarTimer = 0;

    let animationId;
    function animate() {
      ctx.clearRect(0, 0, width, height);
      // Subtle dark radial background
      const radial = ctx.createRadialGradient(
        width / 2,
        height / 2,
        0,
        width / 2,
        height / 2,
        Math.max(width, height) / 1.2
      );
      radial.addColorStop(0, "#23272e");
      radial.addColorStop(1, "#111216");
      ctx.fillStyle = radial;
      ctx.fillRect(0, 0, width, height);

      // Animate particles
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 2 * Math.PI);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.r > 4 ? 0.18 : 0.7;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = p.r > 4 ? 24 : 8;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > width) p.dx *= -1;
        if (p.y < 0 || p.y > height) p.dy *= -1;
      }

      // Shooting star logic
      if (!shootingStar && Math.random() < 0.003 && shootingStarTimer <= 0) {
        // Occasionally spawn a shooting star
        shootingStar = {
          x: Math.random() * width * 0.7,
          y: Math.random() * height * 0.5 + height * 0.2,
          dx: 6 + Math.random() * 4,
          dy: 1 + Math.random() * 2,
          length: 80 + Math.random() * 40,
          opacity: 1,
        };
        shootingStarTimer = 200; // cooldown
      }
      if (shootingStar) {
        ctx.save();
        ctx.globalAlpha = shootingStar.opacity;
        ctx.strokeStyle = "#fff";
        ctx.shadowColor = "#fff";
        ctx.shadowBlur = 16;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(shootingStar.x, shootingStar.y);
        ctx.lineTo(
          shootingStar.x - shootingStar.length,
          shootingStar.y - shootingStar.length * 0.2
        );
        ctx.stroke();
        ctx.restore();
        shootingStar.x += shootingStar.dx;
        shootingStar.y += shootingStar.dy;
        shootingStar.opacity -= 0.012;
        if (shootingStar.opacity <= 0) shootingStar = null;
      } else if (shootingStarTimer > 0) {
        shootingStarTimer--;
      }

      animationId = requestAnimationFrame(animate);
    }
    animate();
    return () => cancelAnimationFrame(animationId);
  }, [isVisible]);

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
      className="fixed inset-0 flex items-center justify-center z-50"
    >
      {/* Animated particles background */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0" />

      <motion.div
        initial={{ scale: 0.7, opacity: 0, y: 60 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.7, opacity: 0, y: 60 }}
        transition={{ type: "spring", stiffness: 120, damping: 12 }}
        className="relative z-10 bg-[#18181b] rounded-2xl p-8 pt-20 max-w-md w-full mx-4 border-2 border-blue-500/40 shadow-2xl backdrop-blur-md overflow-visible"
        style={{
          boxShadow: "0 0 32px 0 #3b82f6, 0 0 0 4px #18181b",
        }}
      >
        {/* Plane icon with glow and float */}
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
          {/* Halo glow */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-cyan-400/20 blur-2xl z-0"></div>
          <motion.div
            animate={{
              y: [0, -10, 0, 10, 0],
              boxShadow: [
                "0 0 32px 8px #3b82f6",
                "0 0 48px 16px #3b82f6",
                "0 0 32px 8px #3b82f6",
                "0 0 16px 4px #3b82f6",
                "0 0 32px 8px #3b82f6",
              ],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="flex flex-col items-center relative z-10"
          >
            <span className="text-6xl drop-shadow-lg">🛩️</span>
          </motion.div>
        </div>
        <div className="text-center mb-6">
          <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight drop-shadow">
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
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-lg shadow"
              maxLength={20}
            />
            {error && <div className="text-red-400 text-xs mt-2">{error}</div>}
          </div>
          <motion.button
            type="submit"
            whileHover={{ scale: 1.04, boxShadow: "0 0 16px #22d3ee" }}
            whileTap={{ scale: 0.97 }}
            className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-cyan-400 to-blue-600 text-white shadow-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            Join Game
          </motion.button>
          <button
            type="button"
            onClick={generateRandomName}
            className="w-full py-2 rounded-xl font-semibold bg-gray-800 text-gray-200 hover:bg-gray-700 transition-all"
          >
            Generate Random Name
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default NameInput;
