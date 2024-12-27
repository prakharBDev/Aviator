import React, { useEffect, useState } from "react";
import AviatorUI from "./components/AviatorUI";
import { useSocket } from "./socketContext"; // Use the socket from context

function App() {
  const socket = useSocket(); // Access the socket from context
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (!socket) {
      console.error("Socket not initialized");
      return; // Wait for the socket to initialize
    }

    // Listen for messages from the server
    socket.on("message", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    // Clean up on component unmount
    return () => {
      socket.off("message");
    };
  }, [socket]);

  const sendMessage = () => {
    if (socket && input.trim()) {
      socket.emit("message", input); // Send message to server
      setInput("");
    }
  };

  return (
    <div className="App">
      <div style={{ padding: 20 }}>
        <h1>Socket.IO Chat</h1>
        <div
          style={{
            border: "1px solid #ccc",
            padding: 10,
            height: "100px",
            overflowY: "scroll",
          }}
        >
          {messages.map((msg, index) => (
            <div key={index}>{msg}</div>
          ))}
        </div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message"
        />
        <button onClick={sendMessage}>Send</button>
      </div>
      <AviatorUI />
    </div>
  );
}

export default App;
