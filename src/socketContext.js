import React, { createContext, useContext, useEffect, useState } from "react";
import { socket } from "./socket"; // Import the socket instance

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socketInstance, setSocketInstance] = useState(null);

  useEffect(() => {
    if (!socketInstance) {
      setSocketInstance(socket); // Set the socket instance on first render
    }

    return () => {
      // We don't disconnect here since it's controlled at a higher level (App)
    };
  }, [socketInstance]);

  return (
    <SocketContext.Provider value={socketInstance}>
      {children}
    </SocketContext.Provider>
  );
};
