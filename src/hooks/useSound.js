import { useCallback, useRef } from "react";

const useSound = () => {
  const audioRef = useRef({});

  const createAudio = useCallback((src) => {
    if (!audioRef.current[src]) {
      const audio = new Audio(src);
      audio.preload = "auto";
      audioRef.current[src] = audio;
    }
    return audioRef.current[src];
  }, []);

  const play = useCallback(
    (soundName) => {
      try {
        let src;
        switch (soundName) {
          case "takeoff":
            src = "/assets/sounds/takeoff.mp3";
            break;
          case "crash":
            src = "/assets/sounds/crash.mp3";
            break;
          case "cashout":
            src = "/assets/sounds/cashout.mp3";
            break;
          case "bet":
            src = "/assets/sounds/bet.mp3";
            break;
          case "tick":
            src = "/assets/sounds/tick.mp3";
            break;
          case "win":
            src = "/assets/sounds/win.mp3";
            break;
          case "lose":
            src = "/assets/sounds/lose.mp3";
            break;
          default:
            // Use simple beep sounds as fallback
            const context = new (window.AudioContext ||
              window.webkitAudioContext)();
            const oscillator = context.createOscillator();
            const gainNode = context.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(context.destination);

            const frequency =
              soundName === "crash"
                ? 200
                : soundName === "cashout"
                ? 800
                : soundName === "win"
                ? 1000
                : 400;

            oscillator.frequency.value = frequency;
            oscillator.type = "sine";
            gainNode.gain.setValueAtTime(0.1, context.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(
              0.001,
              context.currentTime + 0.5
            );

            oscillator.start(context.currentTime);
            oscillator.stop(context.currentTime + 0.5);
            return;
        }

        const audio = createAudio(src);
        audio.currentTime = 0;
        audio.volume = 0.3;
        audio.play().catch(console.error);
      } catch (error) {
        console.error("Error playing sound:", error);
      }
    },
    [createAudio]
  );

  const setVolume = useCallback((volume) => {
    Object.values(audioRef.current).forEach((audio) => {
      audio.volume = volume;
    });
  }, []);

  return { play, setVolume };
};

export default useSound;
