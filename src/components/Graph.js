import React from "react";

const Graph = ({ position, speed, isFlat }) => {
  return (
    <svg
      viewBox="0 0 800 600"
      style={{
        position: "relative",
        height: "600px",
        width: "50%",
        backgroundColor: "black",
      }}
    >
      {/* Background */}
      <rect x="0" y="0" width="400" height="600" fill="black" />

      {/* Speed Display */}
      <text
        x="400"
        y="50"
        textAnchor="middle"
        fill="white"
        fontSize="24"
        fontWeight="bold"
      >
        Speed: {`${speed.toFixed(2)}x`}
      </text>

      {/* Plane */}
      <image
        href="https://promostatic.adjarabet.am/aviator-game-new/Desktop/assets/img/aviator-plane.png"
        x={position.x - 50} // Adjust X position
        y={position.y - 30} // Adjust Y position
        width="100"
        height="60"
        transform={isFlat ? "rotate(-10)" : "rotate(5)"} // Slight tilt for realism
        style={{
          transition: "transform 0.2s, x 0.05s ease-out, y 0.05s ease-out",
        }}
      />
    </svg>
  );
};

export default Graph;
