// src/socket.js
import { io } from "socket.io-client";

// Replace with your server URL
const SOCKET_URL = "http://localhost:3000";

// export const socket = io(SOCKET_URL, {
//   transports: ["websocket"], // Ensures WebSocket is used
//   reconnectionAttempts: 3, // Limits reconnection attempts
// });

export const socket = io(SOCKET_URL);
