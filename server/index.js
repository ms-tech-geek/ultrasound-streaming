import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Store connected peers
const peers = new Map();

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join', (roomId) => {
    socket.join(roomId);
    peers.set(socket.id, roomId);
    const roomPeers = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
    socket.emit('room-peers', roomPeers.filter(id => id !== socket.id));
  });

  socket.on('signal', ({ peerId, signal }) => {
    io.to(peerId).emit('signal', {
      peerId: socket.id,
      signal
    });
  });

  socket.on('disconnect', () => {
    const roomId = peers.get(socket.id);
    if (roomId) {
      socket.to(roomId).emit('peer-disconnected', socket.id);
      peers.delete(socket.id);
    }
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Signaling server running on port ${PORT}`);
});