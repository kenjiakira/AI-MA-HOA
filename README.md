# AI Secret Language Communicator

An innovative web application that allows two people to communicate through an AI that encodes their speech into a mysterious language. The application uses Google's Generative AI to transform normal speech into a strange, fictional language that only the application can decode.

## Features

- Real-time communication between two users
- AI-powered translation of normal speech into a fictional alien language
- Automatic decoding of the alien language back to normal speech
- Visual representation of audio waveforms
- Connection status indicators
- Mobile-friendly design

## Requirements

- Node.js (v14 or higher)
- NPM or Yarn
- A Google AI API key (for Gemini)

## Installation

1. Clone the repository:
```
git clone https://github.com/kenjiakira/ai-ma-hoa.git
cd ai-ma-hoa
```

2. Install dependencies:
```
npm install
```

3. Create a `.env` file in the root directory with your Google AI API key:
```
GOOGLE_AI_API_KEY=your_api_key_here
```

## Usage

1. Start the server:
```
npm start
```

2. Open your browser and navigate to `http://localhost:3000`

3. On one device, click "Start Communication" and wait for a partner

4. On another device or browser, also click "Start Communication"

5. Once connected:
   - One person speaks into their device
   - AI encodes the speech into a strange language
   - The encoded message is sent to the other device
   - The recipient's device automatically decodes it back to normal speech

## How It Works

1. **Speech Capture**: The application captures audio from the user's microphone and converts it to text using the browser's Speech Recognition API.

2. **AI Encoding**: The server uses Google's Generative AI (Gemini) to transform the normal speech text into an alien language with consistent patterns.

3. **Real-time Transmission**: The encoded language is sent to the partner's device using WebSockets.

4. **AI Decoding**: The partner's device uses the AI to decode the alien language back into understandable text.

5. **Audio Visualization**: Both devices display audio waveform visualizations for an enhanced user experience.

## Privacy and Security

- All speech processing occurs server-side
- No conversations are stored permanently
- WebSocket connections are used for direct communication between partners

## License

MIT License

## Credits

Developed by Kenji Akira
