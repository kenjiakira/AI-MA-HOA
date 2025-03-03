document.addEventListener('DOMContentLoaded', () => {
    const conversationEl = document.getElementById('conversation');
    const statusEl = document.getElementById('status');
    const initialPromptEl = document.getElementById('initialPrompt');
    const numExchangesEl = document.getElementById('numExchanges');
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const resetBtn = document.getElementById('resetBtn');
    const akiAvatar = document.getElementById('akiAvatar');
    const mikoAvatar = document.getElementById('mikoAvatar');
    const aboutLink = document.getElementById('aboutLink');
    const aboutModal = document.getElementById('aboutModal');
    const closeBtn = document.querySelector('.close');
    
    const controlsPanel = document.getElementById('controlsPanel');
    const conversationContainer = document.getElementById('conversationContainer');
    
    const socket = window.socket;
    
    function showStatus(message, type = 'default') {
      statusEl.textContent = message;
      statusEl.className = 'conversation-status';
      if (type) {
        statusEl.classList.add(`status-${type}`);
      }
    }
    
    if (!socket) {
      showError('Socket.IO is not available. Please try refreshing the page.');
      return;
    }
    
    let activeSpeaker = null;
    
    socket.on('connect', () => {
      console.log('Connected to server with ID:', socket.id);
      showStatus('Đã kết nối tới cổng thần giao', 'success');
    });
    
    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      showStatus('Lỗi kết nối: ' + error.message, 'error');
    });
    
    socket.on('disconnect', (reason) => {
      console.log('Disconnected from server:', reason);
      showStatus('Mất kết nối với máy chủ: ' + reason, 'error');
      setButtonState(false);
    });
    
    socket.on('error', (error) => {
      console.error('Socket error:', error);
      showStatus('Có lỗi xảy ra: ' + error.message, 'error');
    });
    
    startBtn.addEventListener('click', startConversation);
    stopBtn.addEventListener('click', stopConversation);
    resetBtn.addEventListener('click', resetConversation);
    aboutLink.addEventListener('click', (e) => {
      e.preventDefault();
      aboutModal.style.display = 'block';
    });
    closeBtn.addEventListener('click', () => {
      aboutModal.style.display = 'none';
    });
    window.addEventListener('click', (e) => {
      if (e.target === aboutModal) {
        aboutModal.style.display = 'none';
      }
    });
    
    socket.on('conversationStarted', () => {
      showStatus('Cuộc trò chuyện đang diễn ra...', 'info');
      setButtonState(true);
      hideControlsPanel();
      showConversationContainer();
    });
    
    socket.on('conversationEnded', () => {
      showStatus('Cuộc trò chuyện kết thúc', 'success');
      setButtonState(false);
      updateActiveSpeaker(null);
    });
    
    socket.on('conversationStopped', () => {
      showStatus('Cuộc trò chuyện đã dừng', 'warning');
      setButtonState(false);
      updateActiveSpeaker(null);
      showControlsPanel();
    });
    
    socket.on('newMessage', (message) => {
      updateActiveSpeaker(message.sender.toLowerCase());
      
      showTypingIndicator(message.sender.toLowerCase());
      
      setTimeout(() => {
        removeTypingIndicator();
        appendMessage(message);
        scrollToBottom();
      }, 1000);
    });
    
    function startConversation() {
      const initialPrompt = initialPromptEl.value.trim() || 'Hãy bắt đầu cuộc trò chuyện';
      const numExchanges = parseInt(numExchangesEl.value) || 10;
      
      conversationEl.innerHTML = '';
      
      showStatus('Đang bắt đầu cuộc trò chuyện...', 'info');
      
      const startingMessage = {
        id: 'system-start',
        sender: 'System',
        content: `Bắt đầu cuộc trò chuyện với chủ đề: "${initialPrompt}"`,
        timestamp: new Date()
      };
      
      socket.emit('startConversation', {
        initialPrompt,
        numExchanges
      });
    }
    
    function stopConversation() {
      socket.emit('stopConversation');
      showStatus('Đang dừng cuộc trò chuyện...', 'warning');
    }
    
    function resetConversation() {
      conversationEl.innerHTML = '';
      initialPromptEl.value = 'Chào bạn, hôm nay chúng ta hãy nói về những điều huyền bí...';
      numExchangesEl.value = '10';
      showStatus('Chờ triệu hồi...', 'default');
      updateActiveSpeaker(null);
      hideConversationContainer();
      showControlsPanel();
    }
    
    function hideControlsPanel() {
      controlsPanel.classList.add('fade-out');
      setTimeout(() => {
        controlsPanel.classList.add('hidden');
        controlsPanel.classList.remove('fade-out');
      }, 500);
    }
    
    function showControlsPanel() {
      controlsPanel.classList.remove('hidden');
      controlsPanel.classList.add('fade-in');
      setTimeout(() => {
        controlsPanel.classList.remove('fade-in');
      }, 800);
    }
    
    function showConversationContainer() {
      conversationContainer.classList.remove('hidden');
      conversationContainer.classList.add('fade-in');
      
      setTimeout(() => {
        const startingMessage = {
          id: 'system-start',
          sender: 'System',
          content: `Bắt đầu cuộc trò chuyện với chủ đề: "${initialPromptEl.value.trim()}"`,
          timestamp: new Date()
        };
        appendSystemMessage(startingMessage);
        conversationContainer.classList.remove('fade-in');
      }, 800);
    }
    
    function hideConversationContainer() {
      conversationContainer.classList.add('fade-out');
      setTimeout(() => {
        conversationContainer.classList.add('hidden');
        conversationContainer.classList.remove('fade-out');
      }, 500);
    }
    
    function appendMessage(message) {
      const messageEl = document.createElement('div');
      messageEl.className = `message ${message.sender.toLowerCase()}`;
      messageEl.id = `message-${message.id}`;
      
      const formattedTime = new Date(message.timestamp).toLocaleTimeString();
      
      messageEl.innerHTML = `
        <div class="message-sender">${message.sender}</div>
        <div class="message-content">${formatMessageContent(message.content)}</div>
        <div class="message-timestamp">${formattedTime}</div>
      `;
      
      conversationEl.appendChild(messageEl);
    }
    
    function appendSystemMessage(message) {
      const messageEl = document.createElement('div');
      messageEl.className = 'system-message';
      
      const formattedTime = new Date(message.timestamp).toLocaleTimeString();
      
      messageEl.innerHTML = `
        <div class="system-content">${message.content}</div>
        <div class="message-timestamp">${formattedTime}</div>
      `;
      
      conversationEl.appendChild(messageEl);
    }
    
    function showTypingIndicator(sender) {
      const typingEl = document.createElement('div');
      typingEl.className = `typing-indicator ${sender}`;
      typingEl.id = 'typing-indicator';
      
      typingEl.innerHTML = `
        <span></span>
        <span></span>
        <span></span>
      `;
      
      conversationEl.appendChild(typingEl);
      scrollToBottom();
    }
    
    function removeTypingIndicator() {
      const typingEl = document.getElementById('typing-indicator');
      if (typingEl) {
        typingEl.remove();
      }
    }
    
    function formatMessageContent(content) {
      return content
        .replace(/\n/g, '<br>')
        .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
    }
    
    function scrollToBottom() {
      conversationEl.scrollTop = conversationEl.scrollHeight;
    }
  
    function updateActiveSpeaker(speaker) {
      if (activeSpeaker === 'aki') {
        akiAvatar.classList.remove('active');
      } else if (activeSpeaker === 'miko') {
        mikoAvatar.classList.remove('active');
      }
      
      activeSpeaker = speaker;
      
      if (speaker === 'aki') {
        akiAvatar.classList.add('active');
      } else if (speaker === 'miko') {
        mikoAvatar.classList.add('active');
      }
    }
    
    function setButtonState(conversationActive) {
      startBtn.disabled = conversationActive;
      stopBtn.disabled = !conversationActive;
      resetBtn.disabled = conversationActive;
      initialPromptEl.disabled = conversationActive;
      numExchangesEl.disabled = conversationActive;
    }
    
    function showError(message) {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-message';
      errorDiv.textContent = message;
      document.body.appendChild(errorDiv);
      
      if (statusEl) {
        statusEl.textContent = message;
        statusEl.className = 'conversation-status status-error';
      }
    }
  });
  