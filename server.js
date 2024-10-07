import app from "./app.js";
import dotenv from 'dotenv';
import { initializeWebSocketServer } from "./utils/websocket.js";
import http from 'http';

dotenv.config(); 

// Start the server
const PORT = process.env.PORT || 5000; // Set a default port if not defined

// Create an HTTP server for both Express and WebSocket
const server = http.createServer(app);

// Initialize WebSocket server
initializeWebSocketServer(server); // Initialize WebSocket on the same server

// Listen on the same server instance
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
