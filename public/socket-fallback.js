function checkSocketConnection() {
  
  if (typeof io === 'undefined') {
    console.error('Socket.IO is not available');
    showFallbackError('Socket.IO không khả dụng. Vui lòng tải lại trang.');
    return;
  }
  
  setTimeout(() => {
    const socket = window.socket;
    if (!socket || !socket.connected) {
      console.log('Socket not connected, switching to polling transport');
      
      try {
        window.socket = io(window.location.origin, {
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
      } catch (error) {
        console.error('Failed to create fallback connection:', error);
        showFallbackError('Không thể kết nối đến máy chủ.');
      }
    }
  }, 5000);
}

function showFallbackError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.innerHTML = `
    <div class="error-icon"><i class="fas fa-exclamation-triangle"></i></div>
    <div class="error-text">${message}</div>
    <div class="error-action">
      <button onclick="window.location.reload()">Tải lại trang</button>
    </div>
  `;
  document.body.appendChild(errorDiv);
  
  const statusEl = document.getElementById('status');
  if (statusEl) {
    statusEl.textContent = message;
    statusEl.className = 'conversation-status status-error';
  }
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
  setTimeout(() => {
    checkSocketConnection();
  }, 2000);
});
