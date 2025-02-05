# Ultrasound WebRTC Streaming

Real-time ultrasound image streaming application using WebRTC with sub-500ms latency.

## Prerequisites

- Node.js 18.0.0 or higher
- npm 9.0.0 or higher
- Modern web browser with WebRTC support (Chrome, Firefox, Edge, Safari)

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

## Running the Application

You need to start both the signaling server and the web application:

1. Start the signaling server:
```bash
npm run server
```

2. In a new terminal, start the web application:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Using the Application

### For the Sender (Ultrasound Device)

1. Open the application in your browser
2. Click the "Sender" role
3. Enter a unique room ID (e.g., "room123")
4. Click "Start Streaming"
5. When prompted, allow camera access
6. The local preview will appear on the left
7. Once a receiver joins, their feed will appear on the right

### For the Receiver (Remote Viewer)

1. Open the application in a different browser or device
2. Click the "Receiver" role
3. Enter the same room ID as the sender
4. Click "Join Room"
5. The streamed ultrasound feed will appear

## Features

- Real-time video streaming with WebRTC
- Room-based connections for multiple streaming sessions
- Local preview for sender
- Automatic peer discovery
- Sub-500ms latency (network conditions permitting)

## Troubleshooting

### Common Issues

1. **Can't connect to room**
   - Ensure both sender and receiver use the exact same room ID
   - Check that the signaling server is running
   - Verify your network connection

2. **No video stream**
   - Ensure camera permissions are granted
   - Check if the camera is being used by another application
   - Refresh the page and try again

3. **High Latency**
   - Check your network connection speed
   - Ensure both peers have stable internet connections
   - Consider using a wired connection for better performance

### Network Requirements

- Minimum upload speed: 1 Mbps
- Minimum download speed: 1 Mbps
- Maximum recommended latency: 100ms
- Open ports: 3000 (signaling server)

## Security Notes

- The current version is for development/testing only
- Do not use for sensitive medical data without proper security measures
- Implement proper authentication before production use

## Technical Details

- Frontend: React + TypeScript + Vite
- Signaling: Socket.IO
- Streaming: WebRTC
- UI: Tailwind CSS
- Icons: Lucide React

## Development

To build for production:
```bash
npm run build
```

To preview production build:
```bash
npm run preview
```