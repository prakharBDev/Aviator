import React, { useState, useEffect } from "react";
import { useSocket } from "../socketContext"; // Import the socket context
import Graph from "./Graph";

const AviatorGame = () => {
  const socket = useSocket(); // Access the socket instance from context
  const [speed, setSpeed] = useState(1); // Initial speed
  const [position, setPosition] = useState({ x: 0, y: 550 }); // Initial position
  const [motionType, setMotionType] = useState("takeoff"); // Current motion type
  const [isStarted, setIsStarted] = useState(false); // Game start state
  const [timeElapsed, setTimeElapsed] = useState(0); // Time elapsed since start
  const [sineOffset, setSineOffset] = useState(0); // Offset for sine wave start
  const [countdown, setCountdown] = useState(8); // Countdown timer
  const [betData, setBetData] = useState({});

  useEffect(() => {
    if (!socket) return;

    let countdownInterval;

    // Countdown and emit "startGame" to server
    setCountdown(1);
    countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(countdownInterval);
          socket.emit("startGame"); // Emit event to server
        }
        return prev - 1;
      });
    }, 1000);

    // Listen for "startGame" event from server
    socket.on("startGame", (data) => {
      setBetData(data);
      startGame(); // Start the game when the event is received
    });

    return () => {
      clearInterval(countdownInterval);
      socket.off("startGame");
    };
  }, [socket]);

  const startGame = () => {
    setSpeed(1); // Reset speed
    setPosition({ x: 0, y: 550 }); // Reset position
    setMotionType("takeoff"); // Start with takeoff motion
    setIsStarted(true); // Start the game
    setTimeElapsed(0); // Reset elapsed time
    setSineOffset(0); // Reset sine offset
  };

  const stopGame = () => {
    setSpeed(0); // Stop the speed (or reset to initial value)
    setPosition({ x: 0, y: 550 }); // Reset position to starting point
    setMotionType("landing"); // Set the motion to "landing" or any stopping animation you prefer
    setIsStarted(false); // Stop the game
    setTimeElapsed(0); // Reset elapsed time
    setSineOffset(0); // Reset sine offset (if it's used for motion)
};


  useEffect(() => {
    let motionInterval;
    let speedInterval;
    let timer;

    if (isStarted) {
      // Timer to track elapsed time
      timer = setInterval(() => {
        setTimeElapsed((prev) => prev + 50);
      }, 50);  
    
      // Update position based on motion type
      motionInterval = setInterval(() => {
        setSpeed((prevSpeed) => {
          // Increment the speed by a small decimal value, e.g., 0.01 every interval
          return prevSpeed + 0.009; // Increment speed by 0.01 per interval
        });

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
              // setSpeed(1);
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
  }, [isStarted, motionType, position.x, sineOffset, speed, timeElapsed]);
  

  const triggerFlatMotion = () => {
    setMotionType("flat");
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h1>Aviator Game</h1>
      {!isStarted && (
        <div style={{ marginBottom: "20px", fontSize: "24px", color: "red" }}>
          Starting in: {countdown} seconds
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
        <table style={{ border: '1px solid black', borderCollapse: 'collapse', margin: '0 auto' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid black', padding: '8px' }}>User Name</th>
              <th style={{ border: '1px solid black', padding: '8px' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {betData && Object.entries(betData).map(([key, value]) => (
              <tr key={key}>
                <td style={{ border: '1px solid black', padding: '8px' }}>{key}</td>
                <td style={{ border: '1px solid black', padding: '8px' }}>{value?.initialBet}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ flex: 1 }}>
        <Graph position={position} speed={speed} />
      </div>
      <button
        onClick={triggerFlatMotion}
        disabled={!isStarted}
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
          opacity: isStarted ? 1 : 0.5,
        }}
      >
        Flat
      </button>
      {!isStarted && (
        <button
          onClick={startGame}
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            fontSize: "18px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Fly
        </button>
      )}
      <button
          onClick={stopGame}
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            fontSize: "18px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Stop
        </button>
    </div>
  );
};

export default AviatorGame;
