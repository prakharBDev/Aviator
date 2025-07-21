import React, { useState, useEffect } from "react";
import Plane0 from "../assets/plane-0.svg";
import Plane1 from "../assets/plane-1.svg";
import Plane2 from "../assets/plane-2.svg";
import BgSun from "../assets/bg-sun.svg";

const Graph = ({ position, speed, isFlat }) => {
  const [currentPlane, setCurrentPlane] = useState(Plane0);

  useEffect(() => {
    const planes = [Plane0, Plane1, Plane2];
    let currentIndex = 0;

    const animationInterval = setInterval(() => {
      currentIndex = (currentIndex + 1) % planes.length; // Cycle through the planes
      setCurrentPlane(planes[currentIndex]);
    }, 150); // Change image every 0.1 second

    return () => clearInterval(animationInterval); // Clean up the interval
  }, []);

  return (
    <svg
      viewBox="0 0 800 600"
      style={{
        position: "relative",
        height: "600px",
        width: "100%",
        backgroundColor: "black",
      }}
    >
      {/* Background */}
      {/* <rect x="0" y="0" width="800" height="600" fill="black" /> */}
      <img src={BgSun} width="800" height="600" alt="" />
      {/* Speed Display */}
      <text
        x="400"
        y="50"
        textAnchor="middle"
        fill="white"
        fontSize="100"
        fontWeight="bold"
      >
        {`${speed.toFixed(2)}x`}
      </text>
      {/* Animated Plane */}
      <image
        href={currentPlane}
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
