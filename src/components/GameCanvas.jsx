import React, { useRef, useEffect, useState } from "react";
import Plain0 from "../assets/plane-0.svg";
import Plain1 from "../assets/plane-1.svg";
import Plain2 from "../assets/plane-2.svg";

const planeImages = [Plain0, Plain1, Plain2];

const GameCanvas = ({ gameState }) => {
  const canvasRef = useRef(null);

  // Plane animation state
  const [planeFrame, setPlaneFrame] = useState(0);
  const planeFrameRef = useRef(0);
  const planeImageElements = useRef([]);

  // Fly out state
  const [planeFlyOut, setPlaneFlyOut] = useState(false);
  const flyOutRef = useRef({ active: false, x: 0, y: 0, progress: 0 });

  // Background animation state
  const [backgroundOffset, setBackgroundOffset] = useState(0);
  const backgroundRef = useRef({
    offset: 0,
    clouds: [],
    terrain: [],
    speedLines: [],
    particles: [],
  });

  // Flight path tracking
  const flightPathRef = useRef([]);

  // Initialize background elements
  useEffect(() => {
    // Initialize clouds
    backgroundRef.current.clouds = Array.from({ length: 8 }, (_, i) => ({
      x: Math.random() * 800,
      y: Math.random() * 150 + 50,
      size: Math.random() * 40 + 20,
      speed: Math.random() * 0.5 + 0.2,
      opacity: Math.random() * 0.3 + 0.1,
    }));

    // Initialize terrain elements
    backgroundRef.current.terrain = Array.from({ length: 15 }, (_, i) => ({
      x: i * 60 + Math.random() * 40,
      y: 280 + Math.random() * 20,
      width: Math.random() * 30 + 20,
      height: Math.random() * 15 + 10,
      speed: Math.random() * 1 + 0.5,
    }));

    // Initialize speed lines
    backgroundRef.current.speedLines = Array.from({ length: 20 }, (_, i) => ({
      x: Math.random() * 800,
      y: Math.random() * 300,
      length: Math.random() * 60 + 20,
      speed: Math.random() * 8 + 4,
      opacity: Math.random() * 0.4 + 0.1,
    }));

    // Initialize particles
    backgroundRef.current.particles = Array.from({ length: 30 }, (_, i) => ({
      x: Math.random() * 800,
      y: Math.random() * 300,
      vx: Math.random() * 2 - 1,
      vy: Math.random() * 2 - 1,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.3 + 0.1,
    }));
  }, []);

  // Background animation loop
  useEffect(() => {
    if (gameState.phase !== "flying" && gameState.phase !== "waiting") return;

    let animationId;
    const animate = () => {
      // Smooth background offset update
      backgroundRef.current.offset += 1.5; // Consistent, smooth speed
      setBackgroundOffset(backgroundRef.current.offset);

      // Update clouds smoothly
      backgroundRef.current.clouds.forEach((cloud) => {
        cloud.x -= cloud.speed * 0.8; // Slower, smoother cloud movement
        if (cloud.x + cloud.size < 0) {
          cloud.x = 800 + cloud.size;
          cloud.y = Math.random() * 150 + 50;
        }
      });

      // Update terrain smoothly
      backgroundRef.current.terrain.forEach((terrain) => {
        terrain.x -= terrain.speed * 0.8; // Slower, smoother terrain movement
        if (terrain.x + terrain.width < 0) {
          terrain.x = 800 + terrain.width;
          terrain.y = 280 + Math.random() * 20;
        }
      });

      // Update speed lines smoothly (only when flying)
      if (gameState.phase === "flying") {
        backgroundRef.current.speedLines.forEach((line) => {
          line.x -= line.speed * 0.6; // Slower speed lines for smooth effect
          if (line.x + line.length < 0) {
            line.x = 800 + line.length;
            line.y = Math.random() * 300;
            line.length = Math.random() * 60 + 20;
          }
        });
      }

      // Update particles smoothly
      backgroundRef.current.particles.forEach((particle) => {
        particle.x += particle.vx * 0.5; // Slower particle movement
        particle.y += particle.vy * 0.5;

        // Bounce off edges
        if (particle.x < 0 || particle.x > 800) particle.vx *= -1;
        if (particle.y < 0 || particle.y > 300) particle.vy *= -1;

        // Keep particles in bounds
        particle.x = Math.max(0, Math.min(800, particle.x));
        particle.y = Math.max(0, Math.min(300, particle.y));
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationId);
  }, [gameState.phase]);

  // Preload plane images
  useEffect(() => {
    planeImageElements.current = planeImages.map((src) => {
      const img = new window.Image();
      img.src = src;
      return img;
    });
  }, []);

  // Animate plane frame during 'flying' or 'fly out' phase
  useEffect(() => {
    if (gameState.phase !== "flying" && !planeFlyOut) return;
    let frame = 0;
    planeFrameRef.current = 0;
    const interval = setInterval(() => {
      frame = (frame + 1) % planeImages.length;
      planeFrameRef.current = frame;
      setPlaneFrame(frame);
    }, 100);
    return () => clearInterval(interval);
  }, [gameState.phase, planeFlyOut]);

  // Start fly out when crashed
  useEffect(() => {
    if (gameState.phase === "crashed") {
      // Start fly out after a short delay (e.g., 0.3s)
      const timeout = setTimeout(() => {
        setPlaneFlyOut(true);
        flyOutRef.current = { active: true, progress: 0 };
      }, 300);
      return () => clearTimeout(timeout);
    } else {
      setPlaneFlyOut(false);
      flyOutRef.current = { active: false, progress: 0 };
    }
  }, [gameState.phase]);

  // Enhanced fly out animation loop starting from exact crash position
  useEffect(() => {
    if (!planeFlyOut) return;
    let running = true;
    const start = performance.now();
    const duration = 1200; // Slightly longer for smoother animation
    const width = canvasRef.current ? canvasRef.current.width : 800;
    const height = canvasRef.current ? canvasRef.current.height : 300;

    // Calculate exact crash position (same as crash calculation)
    const progress = Math.log(Math.min(gameState.multiplier, 15)) / Math.log(20);
    const smoothProgress = 1 - Math.pow(1 - progress, 4);

    const startX = 60;
    const endX = width + 100;
    const startY = height - 40;
    const endY = -50;

    const curveX = startX + (endX - startX) * smoothProgress;
    const altitudeCurve = Math.pow(smoothProgress, 1.2);
    const baseY = startY - (startY - endY) * altitudeCurve;

    const time = Date.now() * 0.0008;
    const sineWave = Math.sin(time * 0.6) * 3;
    const verticalSine = Math.sin(time * 0.8) * 2;

    const smoothSineWave = sineWave * (1 - Math.pow(1 - smoothProgress, 3));
    const smoothVerticalSine = verticalSine * (1 - Math.pow(1 - smoothProgress, 3));

    const crashX = Math.max(60, Math.min(width - 60, curveX + smoothSineWave));
    const crashY = Math.max(40, Math.min(height - 40, baseY + smoothVerticalSine));

    function animate(now) {
      if (!running) return;
      const elapsed = now - start;
      let flyProgress = Math.min(elapsed / duration, 1);

      // Smooth easing for fly-out
      const easedProgress = 1 - Math.pow(1 - flyProgress, 3);

      flyOutRef.current.progress = flyProgress;
      // X moves from crashX to off-screen right
      flyOutRef.current.x = crashX + (width + 100 - crashX) * easedProgress;
      // Y moves up smoothly
      flyOutRef.current.y = crashY - 60 * easedProgress;

      if (flyProgress < 1) {
        requestAnimationFrame(animate);
      } else {
        setTimeout(() => setPlaneFlyOut(false), 100);
      }
    }
    requestAnimationFrame(animate);
    return () => {
      running = false;
    };
  }, [planeFlyOut, gameState.multiplier]);

  // Clear flight path when new game starts
  useEffect(() => {
    if (gameState.phase === "waiting") {
      flightPathRef.current = [];
    }
  }, [gameState.phase]);

  // Curve animation with plane image and fly out
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Set high DPI for crisp text rendering
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    // Set actual canvas size
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    // Scale the drawing context
    ctx.scale(dpr, dpr);

    // Set canvas display size
    canvas.style.width = rect.width + "px";
    canvas.style.height = rect.height + "px";

    // Improve text rendering quality
    ctx.textRenderingOptimization = "optimizeQuality";
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    const width = rect.width;
    const height = rect.height;
    ctx.clearRect(0, 0, width, height);

    // Draw animated background elements
    if (gameState.phase === "flying" || gameState.phase === "crashed") {
      // Draw night sky gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, "#0f172a"); // Dark blue night
      gradient.addColorStop(0.5, "#1e293b"); // Midnight blue
      gradient.addColorStop(1, "#334155"); // Slate blue
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Draw stars
      for (let i = 0; i < 50; i++) {
        const starX = (i * 17) % width;
        const starY = (i * 23) % (height * 0.7);
        const starSize = Math.sin(i * 0.5 + backgroundRef.current.offset * 0.01) * 0.5 + 1;

        ctx.save();
        ctx.globalAlpha = Math.sin(i * 0.3 + backgroundRef.current.offset * 0.02) * 0.5 + 0.5;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(starX, starY, starSize, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();
      }

      // Add dynamic lighting based on multiplier
      if (gameState.phase === "flying") {
        const intensity = Math.min(gameState.multiplier / 10, 1); // Intensity based on multiplier
        const lightGradient = ctx.createRadialGradient(
          width * 0.8,
          height * 0.3,
          0,
          width * 0.8,
          height * 0.3,
          200
        );
        lightGradient.addColorStop(0, `rgba(59, 130, 246, ${intensity * 0.3})`);
        lightGradient.addColorStop(0.5, `rgba(59, 130, 246, ${intensity * 0.1})`);
        lightGradient.addColorStop(1, "transparent");
        ctx.fillStyle = lightGradient;
        ctx.fillRect(0, 0, width, height);
      }

      // Draw animated clouds (night clouds)
      backgroundRef.current.clouds.forEach((cloud) => {
        ctx.save();
        ctx.globalAlpha = cloud.opacity * 0.3; // Dimmer for night
        ctx.fillStyle = "#4b5563"; // Dark gray clouds for night

        // Draw cloud shape
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, cloud.size * 0.3, 0, 2 * Math.PI);
        ctx.arc(cloud.x + cloud.size * 0.3, cloud.y, cloud.size * 0.4, 0, 2 * Math.PI);
        ctx.arc(cloud.x + cloud.size * 0.6, cloud.y, cloud.size * 0.3, 0, 2 * Math.PI);
        ctx.arc(cloud.x + cloud.size * 0.2, cloud.y - cloud.size * 0.2, cloud.size * 0.25, 0, 2 * Math.PI);
        ctx.arc(cloud.x + cloud.size * 0.5, cloud.y - cloud.size * 0.2, cloud.size * 0.25, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();
      });

      // Draw speed lines (only when flying)
      if (gameState.phase === "flying") {
        backgroundRef.current.speedLines.forEach((line) => {
          ctx.save();
          ctx.globalAlpha = line.opacity;
          ctx.strokeStyle = "#3b82f6"; // Blue lines for night
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(line.x, line.y);
          ctx.lineTo(line.x + line.length, line.y);
          ctx.stroke();
          ctx.restore();
        });
      }

      // Draw particles (stars)
      backgroundRef.current.particles.forEach((particle) => {
        ctx.save();
        ctx.globalAlpha = particle.opacity;
        ctx.fillStyle = "#ffffff"; // White stars
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();
      });

      // Draw terrain elements (mountains, hills) - night theme
      backgroundRef.current.terrain.forEach((terrain) => {
        ctx.save();
        ctx.fillStyle = "#1f2937"; // Dark gray for night terrain

        // Draw terrain shape
        ctx.beginPath();
        ctx.moveTo(terrain.x, terrain.y);
        ctx.lineTo(terrain.x + terrain.width * 0.3, terrain.y - terrain.height);
        ctx.lineTo(terrain.x + terrain.width * 0.7, terrain.y - terrain.height * 0.7);
        ctx.lineTo(terrain.x + terrain.width, terrain.y);
        ctx.closePath();
        ctx.fill();

        // Add some texture
        ctx.strokeStyle = "#374151";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      });

      // Draw ground line
      ctx.strokeStyle = "#374151";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, height - 20);
      ctx.lineTo(width, height - 20);
      ctx.stroke();

      // Add some ground texture
      for (let i = 0; i < width; i += 30) {
        ctx.strokeStyle = "#1f2937";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(i, height - 20);
        ctx.lineTo(i, height);
        ctx.stroke();
      }
    }

    // Draw progress timer for waiting phase with refined soft UI
    if (gameState.phase === "waiting") {
      // Draw night sky gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, "#0f172a"); // Dark blue night
      gradient.addColorStop(0.5, "#1e293b"); // Midnight blue
      gradient.addColorStop(1, "#334155"); // Slate blue
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Draw stars
      for (let i = 0; i < 50; i++) {
        const starX = (i * 17) % width;
        const starY = (i * 23) % (height * 0.7);
        const starSize = Math.sin(i * 0.5 + backgroundRef.current.offset * 0.01) * 0.5 + 1;

        ctx.save();
        ctx.globalAlpha = Math.sin(i * 0.3 + backgroundRef.current.offset * 0.02) * 0.5 + 0.5;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(starX, starY, starSize, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();
      }

      // Refined soft progress timer
      const progressBarWidth = width * 0.5;
      const progressBarHeight = 6;
      const progressBarX = (width - progressBarWidth) / 2;
      const progressBarY = height / 2 + 20;

      // Soft background track with subtle glow
      ctx.save();
      ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
      ctx.shadowBlur = 8;
      ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
      ctx.beginPath();
      ctx.roundRect(progressBarX, progressBarY, progressBarWidth, progressBarHeight, progressBarHeight / 2);
      ctx.fill();
      ctx.restore();

      // Progress fill with soft gradient
      const progress = (5 - gameState.countdown) / 5;
      const fillWidth = progressBarWidth * progress;

      if (fillWidth > 0) {
        const progressGradient = ctx.createLinearGradient(progressBarX, 0, progressBarX + fillWidth, 0);
        progressGradient.addColorStop(0, "#3b82f6");
        progressGradient.addColorStop(0.5, "#60a5fa");
        progressGradient.addColorStop(1, "#93c5fd");

        ctx.save();
        ctx.shadowColor = "#3b82f6";
        ctx.shadowBlur = 12;
        ctx.fillStyle = progressGradient;
        ctx.beginPath();
        ctx.roundRect(progressBarX, progressBarY, fillWidth, progressBarHeight, progressBarHeight / 2);
        ctx.fill();
        ctx.restore();
      }

      // Soft countdown text
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 28px Arial";
      ctx.textAlign = "center";
      ctx.shadowColor = "rgba(59, 130, 246, 0.5)";
      ctx.shadowBlur = 8;
      ctx.fillText(`${gameState.countdown}s`, width / 2, progressBarY - 30);
      ctx.shadowBlur = 0;

      // Soft subtitle
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.font = "16px Arial";
      ctx.fillText("Next Round Starting...", width / 2, progressBarY + 50);
    }

    if (gameState.phase === "flying" || gameState.phase === "crashed") {
      // Draw airplane image with super smooth sine wave animation
      if (gameState.phase === "flying") {
        // Calculate base flight trajectory
        const maxMultiplier = 20; // Plane reaches exit at 20x
        const progress = Math.log(Math.min(gameState.multiplier, 15)) / Math.log(maxMultiplier);

        // Smooth easing function for progress
        const smoothProgress = 1 - Math.pow(1 - progress, 3); // Ease-out cubic

        // Flight path parameters
        const startX = 60; // Start from left
        const endX = width + 100; // Exit off right
        const startY = height - 40; // Start from bottom
        const endY = -50; // Exit off top

        // Calculate base position with smooth curve
        const curveX = startX + (endX - startX) * smoothProgress;

        // Realistic altitude curve with smooth easing
        const altitudeCurve = Math.pow(smoothProgress, 1.3); // Smooth climb
        const baseY = startY - (startY - endY) * altitudeCurve;

        // Super smooth sine wave motion with reduced intensity
        const time = Date.now() * 0.001; // Slower, smoother
        const sineWave = Math.sin(time * 0.4) * 2; // Much more subtle horizontal wave

        // Add the same wave motion as trajectory for consistency
        const waveOffset = Math.sin(Date.now() * 0.003 + curveX * 0.01) * 3; // Same as trajectory
        const verticalSine = Math.sin(time * 0.6) * 8 + waveOffset; // Combine existing motion with wave

        // Smooth interpolation for position using easing
        const smoothSineWave = sineWave * (1 - Math.pow(1 - smoothProgress, 2)); // Ease-out quadratic
        const smoothVerticalSine = verticalSine * (1 - Math.pow(1 - smoothProgress, 2));

        // Stop plane before reaching the very edge
        const maxProgress = 0.85; // Stop at 85% instead of 100%
        const clampedProgress = Math.min(smoothProgress, maxProgress);

        const adjustedCurveX = startX + (endX - startX) * clampedProgress;
        const adjustedBaseY = startY - (startY - endY) * Math.pow(clampedProgress, 1.3);

        const planeX = Math.max(60, Math.min(width - 120, adjustedCurveX + smoothSineWave)); // More margin from edge
        const planeY = Math.max(40, Math.min(height - 40, adjustedBaseY + smoothVerticalSine));

        // Track flight path for graph-like trajectory with sine wave motion
        if (gameState.phase === "flying") {
          // Add current position to flight path with subtle sine wave
          const waveOffset = Math.sin(Date.now() * 0.003 + planeX * 0.01) * 3; // Subtle wave motion
          flightPathRef.current.push({
            x: planeX,
            y: planeY + waveOffset, // Add wave to y position
            multiplier: gameState.multiplier,
          });

          // Limit path length to prevent memory issues
          if (flightPathRef.current.length > 300) {
            flightPathRef.current.shift();
          }
        }

        // Draw filled curve area under flight path (like in image)
        if (flightPathRef.current.length > 0) {
          ctx.save();

          // Create gradient fill for the area under the curve
          const gradient = ctx.createLinearGradient(0, height, width, 0);
          gradient.addColorStop(0, "rgba(239, 68, 68, 0.8)"); // Red at bottom
          gradient.addColorStop(0.5, "rgba(239, 68, 68, 0.6)"); // Semi-transparent red
          gradient.addColorStop(1, "rgba(239, 68, 68, 0.2)"); // Very light red at top

          ctx.fillStyle = gradient;
          ctx.globalAlpha = 0.7;

          // Create filled area path
          ctx.beginPath();

          // Start from bottom-left corner
          ctx.moveTo(0, height);

          // Go to plane start position
          ctx.lineTo(60, height - 40);

          // Draw smooth curve through all flight path points
          for (let i = 0; i < flightPathRef.current.length; i++) {
            const point = flightPathRef.current[i];

            if (i === 0) {
              ctx.lineTo(point.x, point.y);
            } else if (i < flightPathRef.current.length - 1) {
              // Use quadratic curves for ultra-smooth line
              const nextPoint = flightPathRef.current[i + 1];
              const cpX = (point.x + nextPoint.x) / 2;
              const cpY = (point.y + nextPoint.y) / 2;
              ctx.quadraticCurveTo(point.x, point.y, cpX, cpY);
            } else {
              // Final point
              ctx.lineTo(point.x, point.y);
            }
          }

          // Close the path by going down to bottom edge and back to start
          if (flightPathRef.current.length > 0) {
            const lastPoint = flightPathRef.current[flightPathRef.current.length - 1];
            ctx.lineTo(lastPoint.x, height); // Go straight down
            ctx.lineTo(0, height); // Go back to start
          }

          ctx.closePath();
          ctx.fill();

          // Also draw the outline stroke
          ctx.strokeStyle = "#ef4444";
          ctx.lineWidth = 2;
          ctx.globalAlpha = 1;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";

          // Draw just the top curve line
          ctx.beginPath();
          ctx.moveTo(0, height);
          ctx.lineTo(60, height - 40);

          for (let i = 0; i < flightPathRef.current.length; i++) {
            const point = flightPathRef.current[i];

            if (i === 0) {
              ctx.lineTo(point.x, point.y);
            } else if (i < flightPathRef.current.length - 1) {
              const nextPoint = flightPathRef.current[i + 1];
              const cpX = (point.x + nextPoint.x) / 2;
              const cpY = (point.y + nextPoint.y) / 2;
              ctx.quadraticCurveTo(point.x, point.y, cpX, cpY);
            } else {
              ctx.lineTo(point.x, point.y);
            }
          }

          ctx.stroke();
          ctx.restore();
        }

        // Smooth rotation based on flight phase
        let rotationAngle = -Math.PI / 12; // Default slight upward tilt

        // Add smooth banking rotation
        const bankingRotation = Math.cos(time * 0.6) * 0.03; // Very subtle banking
        rotationAngle += bankingRotation;

        // Add slight pitch variation based on vertical movement
        const pitchVariation = Math.cos(time * 1.1) * 0.02;
        rotationAngle += pitchVariation;

        const img = planeImageElements.current[planeFrame] || planeImageElements.current[0];
        if (img && img.complete) {
          // Draw subtle contrails for smooth effect
          ctx.save();
          ctx.globalAlpha = 0.2;
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 1;

          // Draw smooth contrail
          ctx.beginPath();
          ctx.moveTo(planeX - 30, planeY);
          ctx.lineTo(planeX - 5, planeY);
          ctx.stroke();
          ctx.restore();

          ctx.save();
          ctx.translate(planeX, planeY);
          ctx.rotate(rotationAngle);

          // Add subtle shadow
          const shadowOpacity = Math.max(0.1, 0.3 - ((startY - planeY) / (startY - endY)) * 0.2);
          ctx.save();
          ctx.translate(0, 6);
          ctx.globalAlpha = shadowOpacity;
          ctx.fillStyle = "#000000";
          ctx.ellipse(0, 0, 32, 10, 0, 0, 2 * Math.PI);
          ctx.fill();
          ctx.restore();

          // Add very subtle glow effect
          ctx.save();
          ctx.globalAlpha = 0.1;
          ctx.shadowColor = "#ffffff";
          ctx.shadowBlur = 4;
          ctx.drawImage(img, -50, -35, 100, 70);
          ctx.restore();

          // Draw the plane - increased size
          ctx.drawImage(img, -50, -35, 100, 70);
          ctx.restore();
        }

        // Draw multiplier display in canvas - simple white text
        ctx.save();

        const multiplierText = `${Math.min(gameState.multiplier, 15).toFixed(2)}x`;
        const multiplierX = width / 2;
        const multiplierY = height / 2 - 100;

        // Simple white multiplier text with improved quality
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 48px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(multiplierText, multiplierX, multiplierY);

        // Simple white status text below multiplier with improved quality
        ctx.fillStyle = "#ffffff";
        ctx.font = "16px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        ctx.fillText("🚀 Flying! Cash out anytime", multiplierX, multiplierY + 60);

        ctx.restore();
      }

      // Enhanced crash point without red dot - aviator flies from exact position
      if (gameState.phase === "crashed") {
        // Get the exact crash position (same calculation as flying plane)
        const progress = Math.log(Math.min(gameState.multiplier, 15)) / Math.log(20);
        const smoothProgress = 1 - Math.pow(1 - progress, 4);

        const startX = 60;
        const endX = width + 100;
        const startY = height - 40;
        const endY = -50;

        const curveX = startX + (endX - startX) * smoothProgress;
        const altitudeCurve = Math.pow(smoothProgress, 1.2);
        const baseY = startY - (startY - endY) * altitudeCurve;

        const time = Date.now() * 0.0008;
        const sineWave = Math.sin(time * 0.6) * 3;
        const verticalSine = Math.sin(time * 0.8) * 2;

        const smoothSineWave = sineWave * (1 - Math.pow(1 - smoothProgress, 3));
        const smoothVerticalSine = verticalSine * (1 - Math.pow(1 - smoothProgress, 3));

        const crashX = Math.max(60, Math.min(width - 60, curveX + smoothSineWave));
        const crashY = Math.max(40, Math.min(height - 40, baseY + smoothVerticalSine));

        // Only show subtle explosion effect, no red dot
        ctx.save();
        ctx.globalAlpha = 0.5;

        // Subtle explosion glow
        const explosionGradient = ctx.createRadialGradient(crashX, crashY, 0, crashX, crashY, 20);
        explosionGradient.addColorStop(0, "rgba(239, 68, 68, 0.6)");
        explosionGradient.addColorStop(0.5, "rgba(248, 113, 113, 0.3)");
        explosionGradient.addColorStop(1, "transparent");
        ctx.fillStyle = explosionGradient;
        ctx.beginPath();
        ctx.arc(crashX, crashY, 20, 0, 2 * Math.PI);
        ctx.fill();

        // Subtle explosion particles
        ctx.strokeStyle = "rgba(252, 165, 165, 0.7)";
        ctx.lineWidth = 1;
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3;
          const x1 = crashX + Math.cos(angle) * 8;
          const y1 = crashY + Math.sin(angle) * 8;
          const x2 = crashX + Math.cos(angle) * 15;
          const y2 = crashY + Math.sin(angle) * 15;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }

        ctx.restore();

        // Draw crash multiplier display in canvas - simple white text
        ctx.save();

        const crashMultiplierText = `${Math.min(gameState.multiplier, 15).toFixed(2)}x`;
        const crashMultiplierX = width / 2;
        const crashMultiplierY = height / 2 - 100;

        // Simple white crash multiplier text with improved quality
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 48px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(crashMultiplierText, crashMultiplierX, crashMultiplierY);

        // Simple white crash status text below multiplier with improved quality
        ctx.fillStyle = "#ffffff";
        ctx.font = "16px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        ctx.fillText("💥 Crashed! Next round starting...", crashMultiplierX, crashMultiplierY + 60);

        ctx.restore();
      }
    }

    // Draw enhanced fly out plane if active
    if (planeFlyOut && flyOutRef.current.active) {
      const img = planeImageElements.current[planeFrame] || planeImageElements.current[0];
      if (img && img.complete) {
        ctx.save();
        ctx.translate(flyOutRef.current.x, flyOutRef.current.y);

        // Enhanced rotation with smooth banking
        const bankingAngle = flyOutRef.current.progress * 0.2; // Gentle banking
        const baseRotation = -Math.PI / 12;
        ctx.rotate(baseRotation + bankingAngle);

        // Smooth fade out
        const fadeAlpha = 1 - flyOutRef.current.progress * 0.5; // Gentler fade
        ctx.globalAlpha = fadeAlpha;

        // Add trailing glow effect
        ctx.save();
        ctx.shadowColor = "#ffffff";
        ctx.shadowBlur = 8 * (1 - flyOutRef.current.progress);
        ctx.drawImage(img, -50, -35, 100, 70);
        ctx.restore();

        // Draw the plane - increased size
        ctx.drawImage(img, -50, -35, 100, 70);
        ctx.restore();
      }
    }
  }, [gameState.multiplier, gameState.phase, gameState.countdown, planeFrame, planeFlyOut, backgroundOffset]);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={300}
      className="w-full h-[400px] bg-slate-900/50 rounded-lg border border-slate-600"
    />
  );
};

export default GameCanvas;