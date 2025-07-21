// src/socket.js
import { io } from "socket.io-client";

// Backend server URL
const SOCKET_URL = "http://localhost:5001";

export const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});
