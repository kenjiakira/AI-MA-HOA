

function checkSocketConnection() {
  
  setTimeout(() => {
    const socket = window.socket;
    if (!socket || !socket.connected) {
      console.log('Socket not connected, switching to polling transport');
      
      
      window.socket = io({
        path: '/socket.io/',
        transports: ['polling'],
        reconnectionAttempts: 3,
        timeout: 10000
      });
      
      
      const statusEl = document.getElementById('status');
      if (statusEl) {
        statusEl.textContent = 'Đang kết nối qua phương thức thay thế...';
        statusEl.className = 'conversation-status status-warning';
      }
      
      
      attachSocketHandlers(window.socket);
    }
  }, 5000);
}

function attachSocketHandlers(socket) {
  
  
  
  socket.on('connect', () => {
    console.log('Fallback connected to server with ID:', socket.id);
    const statusEl = document.getElementById('status');
    if (statusEl) {
      statusEl.textContent = 'Đã kết nối (chế độ dự phòng)';
      statusEl.className = 'conversation-status status-success';
    }
  });
  
  socket.on('disconnect', () => {
    console.log('Fallback disconnected from server');
    const statusEl = document.getElementById('status');
    if (statusEl) {
      statusEl.textContent = 'Mất kết nối với máy chủ';
      statusEl.className = 'conversation-status status-error';
    }
  });
  
  
  socket.on('newMessage', (message) => {
    const conversationEl = document.getElementById('conversation');
    if (conversationEl) {
      const messageEl = document.createElement('div');
      messageEl.className = `message ${message.sender.toLowerCase()}`;
      messageEl.innerHTML = `
        <div class="message-sender">${message.sender}</div>
        <div class="message-content">${message.content.replace(/\n/g, '<br>')}</div>
        <div class="message-timestamp">${new Date(message.timestamp).toLocaleTimeString()}</div>
      `;
      conversationEl.appendChild(messageEl);
      conversationEl.scrollTop = conversationEl.scrollHeight;
    }
  });
}


document.addEventListener('DOMContentLoaded', () => {
  checkSocketConnection();
});
