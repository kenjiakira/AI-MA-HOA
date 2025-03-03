require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs-extra');
const aiService = require('./aiService');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  transports: ['polling', 'websocket'],
  path: '/socket.io/',
  pingTimeout: 30000,
  pingInterval: 25000,
  allowUpgrades: true,
  cookie: false,
  serveClient: true,
  allowEIO3: true
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/socket-health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Socket.IO server is running' });
});

io.on('connection', (socket) => {
  console.log('New client connected', socket.id);
  
  socket.on('startConversation', async (data) => {
    console.log('Starting AI conversation');
    
    try {
      const conversation = await aiService.startConversation(
        data.initialPrompt || 'Hãy bắt đầu cuộc trò chuyện', 
        data.numExchanges || 10,
        socket
      );
    } catch (error) {
      console.error('Error starting conversation:', error);
      socket.emit('error', { message: 'Failed to start conversation' });
    }
  });
  
  socket.on('stopConversation', () => {
    aiService.stopConversation();
    socket.emit('conversationStopped');
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected', socket.id);
    aiService.stopConversation();
  });
});

if (process.env.VERCEL) {
  module.exports = app;
} else { 
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} in your browser`);
  });
}
