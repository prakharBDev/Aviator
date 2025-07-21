// src/socket.js
import { io } from "socket.io-client";

// Backend server URL
const SOCKET_URL = "https://aviator-8.onrender.com";

export const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});
