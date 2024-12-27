import React, { useState, useEffect } from "react";
import Graph from "./Graph";

const AviatorGame = () => {
  const [speed, setSpeed] = useState(1); // Initial speed
  const [position, setPosition] = useState({ x: 0, y: 550 }); // Initial position
  const [motionType, setMotionType] = useState("takeoff"); // Current motion type
  const [isStarted, setIsStarted] = useState(false); // Game start state
  const [timeElapsed, setTimeElapsed] = useState(0); // Time elapsed since start
  const [sineOffset, setSineOffset] = useState(0); // Offset for sine wave start

  useEffect(() => {
    let motionInterval;
    let speedInterval;
    let timer;

    if (isStarted) {
      // Timer to track elapsed time
      timer = setInterval(() => {
        setTimeElapsed((prev) => prev + 50);
      }, 50);

      // Gradually increase speed
      speedInterval = setInterval(() => {
        setSpeed((prevSpeed) => Math.min(prevSpeed + 0.02, 10)); // Increment speed up to 10x
      }, 100);

      // Update position based on motion type
      motionInterval = setInterval(() => {
        setPosition((prev) => {
          const nextX = prev.x + speed * 2;
          let nextY;

          if (motionType === "takeoff") {
            nextY = prev.y - 1.5 * speed; // Realistic takeoff
            if (prev.y <= 400) {
              setMotionType("parabolic"); // Switch to parabolic after takeoff
            }
          } else if (motionType === "parabolic") {
            nextY = 550 - 0.002 * (nextX - 300) ** 2; // Parabolic motion
          } else if (motionType === "sine") {
            const sineX = nextX - sineOffset;
            nextY = 300 + 50 * Math.sin((sineX / 100) * Math.PI); // Sine wave
          } else if (motionType === "flat") {
            nextY = 300; // Flat motion
          }

          // Restart when plane exits the screen
          if (nextX > 800) {
            setTimeout(() => {
              setPosition({ x: 0, y: 550 });
              setMotionType("takeoff");
              setSpeed(1);
              setTimeElapsed(0);
              setSineOffset(0);
            }, 3000);
          }

          return { x: nextX, y: Math.max(nextY, 50) }; // Ensure Y stays in bounds
        });
      }, 50);

      // Transition from parabolic to sine after 5 seconds
      if (timeElapsed >= 5000 && motionType === "parabolic") {
        setMotionType("sine");
        setSineOffset(position.x); // Set the sine wave offset
      }

      return () => {
        clearInterval(motionInterval);
        clearInterval(speedInterval);
        clearInterval(timer);
      };
    }
  }, [isStarted, motionType, position.x, speed, timeElapsed]);

  const startGame = () => {
    setSpeed(1); // Reset speed
    setPosition({ x: 0, y: 550 }); // Reset position
    setMotionType("takeoff"); // Start with takeoff motion
    setIsStarted(true); // Start the game
    setTimeElapsed(0); // Reset elapsed time
    setSineOffset(0); // Reset sine offset
  };

  const triggerFlatMotion = () => {
    setMotionType("flat");
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h1>Aviator Game</h1>
      <Graph position={position} speed={speed} />
      <div style={{ marginTop: "20px", color: "white", fontSize: "24px" }}>
        <span style={{ fontWeight: "bold" }}>Speed:</span>{" "}
        <span style={{ color: "limegreen", fontSize: "28px" }}>
          {speed.toFixed(2)}x
        </span>
      </div>
      <button
        onClick={startGame}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          fontSize: "18px",
          backgroundColor: "#008CBA",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        {isStarted ? "Restart" : "Fly"}
      </button>
      <button
        onClick={triggerFlatMotion}
        style={{
          marginTop: "20px",
          marginLeft: "10px",
          padding: "10px 20px",
          fontSize: "18px",
          backgroundColor: "#f44336",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Flat
      </button>
    </div>
  );
};

export default AviatorGame;


