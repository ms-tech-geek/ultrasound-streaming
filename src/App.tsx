import React, { useEffect, useRef, useState } from 'react';
import { Camera, Monitor } from 'lucide-react';
import { io } from 'socket.io-client';
import { WebRTCConnection } from './lib/webrtc';

const socket = io('http://localhost:3000');

function App() {
  const [role, setRole] = useState<'sender' | 'receiver' | null>(null);
  const [roomId, setRoomId] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const webrtcRef = useRef<WebRTCConnection | null>(null);

  useEffect(() => {
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    socket.on('signal', async ({ peerId, signal }) => {
      if (webrtcRef.current) {
        await webrtcRef.current.handleSignal(signal);
      }
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('signal');
    };
  }, []);

  const startStreaming = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      socket.emit('join', roomId);
      socket.on('room-peers', async (peers) => {
        if (peers.length > 0) {
          webrtcRef.current = new WebRTCConnection(
            socket,
            peers[0],
            (remoteStream) => {
              if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = remoteStream;
              }
            }
          );
          await webrtcRef.current.startStream(stream);
        }
      });
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const joinRoom = () => {
    socket.emit('join', roomId);
    socket.on('room-peers', (peers) => {
      if (peers.length > 0) {
        webrtcRef.current = new WebRTCConnection(
          socket,
          peers[0],
          (remoteStream) => {
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStream;
            }
          }
        );
      }
    });
  };

  if (!role) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md space-y-6">
          <h1 className="text-2xl font-bold text-center">Choose Your Role</h1>
          <div className="flex gap-4">
            <button
              onClick={() => setRole('sender')}
              className="flex-1 flex flex-col items-center gap-2 p-4 border rounded-lg hover:bg-gray-50"
            >
              <Camera className="w-8 h-8" />
              <span>Sender</span>
            </button>
            <button
              onClick={() => setRole('receiver')}
              className="flex-1 flex flex-col items-center gap-2 p-4 border rounded-lg hover:bg-gray-50"
            >
              <Monitor className="w-8 h-8" />
              <span>Receiver</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4">
            {role === 'sender' ? 'Stream Ultrasound' : 'View Stream'}
          </h1>
          <div className="space-y-4">
            <div className="flex gap-4">
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Enter room ID"
                className="flex-1 px-4 py-2 border rounded"
              />
              <button
                onClick={role === 'sender' ? startStreaming : joinRoom}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {role === 'sender' ? 'Start Streaming' : 'Join Room'}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {role === 'sender' && (
                <div>
                  <h2 className="text-lg font-semibold mb-2">Local Stream</h2>
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full bg-black rounded"
                  />
                </div>
              )}
              <div className={role === 'sender' ? '' : 'col-span-2'}>
                <h2 className="text-lg font-semibold mb-2">Remote Stream</h2>
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full bg-black rounded"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;