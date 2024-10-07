// utils/websocket.js
import { WebSocketServer } from 'ws';

const clients = new Set();

// Function to initialize the WebSocket server
export const initializeWebSocketServer = (server) => {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    console.log('Client connected');
    clients.add(ws);

    ws.on('message', (message) => {
      console.log(`Received message: ${message}`);
    });

    ws.on('close', () => {
      console.log('Client disconnected');
      clients.delete(ws);
    });
  });
};

// Function to broadcast progress to all clients
export const broadcastProgress = (percentage) => {
  clients.forEach((ws) => {
    ws.send(JSON.stringify({ progress: percentage }));
  });
};


