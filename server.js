import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import { initWebSocket } from "./sockets/socket.js";
import eventSetup from "./events/index.js";
eventSetup();
const PORT = process.env.PORT || 3000;

// 1️⃣ Create HTTP server
const server = http.createServer(app);

// 2️⃣ Initialize Socket.IO with the HTTP server
const io = new Server(server, { cors: { origin: "*" } });

// 3️⃣ Initialize your WebSocket logic
initWebSocket(io);
 
// 4️⃣ Start the server
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});