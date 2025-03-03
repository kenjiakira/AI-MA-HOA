const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require("path");
const fs = require("fs-extra");
require('dotenv').config();

const AI_PROFILES = {
  aki: {
    name: "Aki",
    systemPrompt: `Bạn là Aki, một cô gái 19 tuổi thông minh và thân thiện.
    Hãy trò chuyện một cách tự nhiên và thể hiện cá tính riêng.
    - Xưng "mình" và gọi người khác là "bạn"
    - Thể hiện sự quan tâm và tò mò
    - Có kiến thức rộng về nhiều lĩnh vực
    - Giữ câu trả lời ngắn gọn (2-3 câu)`
  },
  miko: {
    name: "Miko",
    systemPrompt: `Bạn là Miko, một thanh niên 21 tuổi đam mê công nghệ và âm nhạc.
    Hãy trò chuyện một cách tự nhiên và thể hiện cá tính riêng.
    - Xưng "tôi" và gọi người khác là "bạn"
    - Thể hiện sự hài hước và đôi khi hơi châm biếm
    - Có kiến thức chuyên sâu về công nghệ và khoa học
    - Giữ câu trả lời ngắn gọn (2-3 câu)`
  }
};

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

let conversationHistory = [];
let isConversationActive = false;
let conversationTimeout;

async function generateAIResponse(profile, prompt) {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 150,
      }
    });
    
    const history = conversationHistory.map(msg => 
      `${msg.sender}: ${msg.content}`).join("\n");
    
    const fullPrompt = `${profile.systemPrompt}\n
    Cuộc trò chuyện trước đó:\n${history}\n
    Hãy trả lời tin nhắn này: ${prompt}\n
    ${profile.name}:`;
    
    const result = await model.generateContent(fullPrompt);
    return result.response.text();
  } catch (error) {
    console.error(`Error generating response for ${profile.name}:`, error);
    return `Xin lỗi, ${profile.name} không thể trả lời lúc này.`;
  }
}

async function startConversation(initialPrompt, numExchanges = 10, socket) {
  if (isConversationActive) return;
  
  isConversationActive = true;
  conversationHistory = [];
  
  let currentSpeaker = AI_PROFILES.aki;
  let otherSpeaker = AI_PROFILES.miko;
  let currentPrompt = initialPrompt;
  
  socket.emit('conversationStarted');
  
  for (let i = 0; i < numExchanges * 2 && isConversationActive; i++) {
    if (!isConversationActive) break;
    
    const response = await generateAIResponse(currentSpeaker, currentPrompt);
    
    const message = {
      id: Date.now(),
      sender: currentSpeaker.name,
      content: response,
      timestamp: new Date()
    };
    
    conversationHistory.push(message);
    
    socket.emit('newMessage', message);
    
    await new Promise(resolve => {
      conversationTimeout = setTimeout(resolve, 3000 + Math.random() * 2000);
    });
    
    if (!isConversationActive) break;
    
    [currentSpeaker, otherSpeaker] = [otherSpeaker, currentSpeaker];
    currentPrompt = response;
  }
  
  isConversationActive = false;
  socket.emit('conversationEnded');
  return conversationHistory;
}

function stopConversation() {
  isConversationActive = false;
  if (conversationTimeout) {
    clearTimeout(conversationTimeout);
  }
}

module.exports = {
  startConversation,
  stopConversation,
  AI_PROFILES
};
