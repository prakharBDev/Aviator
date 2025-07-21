import React, { useState, useEffect } from "react";
import { motion } from "framer-motion"; // Import framer motion for smooth scrolling
import Plane0 from "../assets/plane-0.svg";
import Plane1 from "../assets/plane-1.svg";
import Plane2 from "../assets/plane-2.svg";
import backgroundImage from "../assets/AviatorBackground.jpg";
import BetTable from "./BetTable";

const AviatorGame = () => {
  const [position, setPosition] = useState({ x: 0, y: 400 }); // Plane position
  const [isFlying, setIsFlying] = useState(false); // Controls flying state
  const [currentPlane, setCurrentPlane] = useState(Plane0);
  const [betAmount, setBetAmount] = useState(1.0); // Bet amount
  const [isAuto, setIsAuto] = useState(false); // Controls auto mode
  const [autoCashout, setAutoCashout] = useState(false); // Controls AutoCashout toggle

  // Plane sprite animation
  useEffect(() => {
    const planes = [Plane0, Plane1, Plane2];
    let index = 0;
    const spriteInterval = setInterval(() => {
      index = (index + 1) % planes.length;
      setCurrentPlane(planes[index]);
    }, 150); // Change sprite every 150ms
    return () => clearInterval(spriteInterval);
  }, []);

  // Flying logic
  useEffect(() => {
    if (isFlying) {
      let takeoff = true; // True until the plane starts hovering
      let timeElapsed = 0; // Counter for sine wave motion
      const flyInterval = setInterval(() => {
        setPosition((prev) => {
          const containerWidth = 800; // Width of the container

          // Plane is taking off
          if (takeoff) {
            const newX = Math.min(prev.x + 5, containerWidth - 250); // Move forward but stop before the end
            const newY = Math.max(prev.y - 4, 200); // Move up until y = 200

            if (newX === containerWidth - 250) {
              takeoff = false; // Stop takeoff when the plane reaches the adjusted end
            }

            return { x: newX, y: newY }; // Update position
          }

          // Plane is hovering with sine wave motion
          timeElapsed += 0.1;
          const oscillation = Math.sin(timeElapsed) * 10; // Smooth sine wave for up/down motion
          return { x: prev.x, y: 200 + oscillation };
        });
      }, 30); // Update position every 30ms

      return () => clearInterval(flyInterval);
    }
  }, [isFlying]);

  const startFlying = () => {
    setIsFlying(true);
    setPosition({ x: 0, y: 400 }); // Reset to starting position
  };

  const stopFlying = () => {
    setIsFlying(false);
  };

  // Adjust bet amount
  const handleBetChange = (amount) => {
    setBetAmount((prev) => Math.max(0, prev + amount)); // Prevent negative values
  };

  // Toggle Auto mode
  const toggleAuto = () => {
    setIsAuto(!isAuto);
  };

  // Toggle AutoCashout
  const toggleAutoCashout = () => {
    setAutoCashout(!autoCashout);
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end", // Align container to the right
        alignItems: "flex-start", // Align container to the top
        height: "100vh",
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        padding: "20px",
        position: "relative",
        overflow: "hidden", // Prevent scrolling
      }}
    >
      {/* Flying Container */}
      <div
        style={{
          position: "absolute",
          width: "800px",
          height: "500px",
          backgroundColor: "#1b1e2a",
          borderRadius: "10px",
          overflow: "hidden",
          border: "2px solid #ffffff40",
          top: "20px",
          right: "20px",
        }}
      >
        <video
          autoPlay
          loop
          muted
          style={{
            position: "absolute",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            objectFit: "cover", // Make sure video covers the container
          }}
        >
          <source src="/assets/BackgroundVideo.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        {/* Plane */}
        <img
          src={currentPlane}
          alt="plane"
          style={{
            position: "absolute",
            width: "100px",
            height: "80px",
            left: `${position.x}px`,
            top: `${position.y}px`,
            transition: isFlying
              ? "top 0.1s ease-in-out, left 0.05s linear"
              : "none",
          }}
        />
      </div>

      {/* Start/Stop Flying Buttons */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          display: "flex",
          flexDirection: "row",
          gap: "10px",
        }}
      >
        <button
          onClick={startFlying}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor: "rgb(76, 175, 80)",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Start Flying
        </button>
        <button
          onClick={stopFlying}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor: "rgb(244, 67, 54)",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Stop Flying
        </button>
      </div>
      {/* Move BetTable to Left Side */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <BetTable />
      </div>

      {/* Buttons Below the Flying Container */}
      <div
        style={{
          position: "absolute",
          bottom: "6px",
          right: "26px",
          display: "flex",
          backgroundColor: "#15181e",
          gap: "90px",
          width: "793px",
          justifyContent: "space-between",
          borderRadius: "10px",
          padding: "10px 0",
          minHeight: "160px", // Fixed minimum height to avoid container resizing
        }}
      >
        {[1, 2].map((_, index) => (
          <div
            key={index}
            style={{
              width: "300px",
              padding: "10px",
              backgroundColor: "#1b1e2a",
              borderRadius: "8px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-around",
                width: "100%",
                marginBottom: "10px",
              }}
            >
              <button
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#333740",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                }}
              >
                Bet
              </button>
              <motion.button
                onClick={toggleAuto}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#333740",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                Auto
              </motion.button>
              {isAuto && (
                <motion.div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "5px",
                    marginTop: "10px",
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <button
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#555",
                      color: "#32cd32",
                      border: "none",
                      borderRadius: "5px",
                    }}
                  >
                    Auto
                  </button>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      color: "#fff",
                    }}
                  >
                    AutoCashout
                    <input
                      type="checkbox"
                      checked={autoCashout}
                      onChange={toggleAutoCashout}
                      style={{
                        width: "20px",
                        height: "20px",
                        cursor: "pointer",
                      }}
                    />
                  </label>
                </motion.div>
              )}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <button
                onClick={() => handleBetChange(-1)}
                style={{
                  fontSize: "24px",
                  color: "#fff",
                  background: "none",
                  border: "none",
                }}
              >
                -
              </button>
              <span style={{ fontSize: "24px", color: "#fff" }}>
                {betAmount.toFixed(2)}
              </span>
              <button
                onClick={() => handleBetChange(1)}
                style={{
                  fontSize: "24px",
                  color: "#fff",
                  background: "none",
                  border: "none",
                }}
              >
                +
              </button>
            </div>
            <button
              style={{
                width: "100%",
                padding: "10px 20px",
                backgroundColor: "#32cd32",
                color: "#fff",
                fontSize: "18px",
                fontWeight: "bold",
                border: "none",
                borderRadius: "5px",
              }}
            >
              BET {betAmount.toFixed(2)} USD
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AviatorGame;
