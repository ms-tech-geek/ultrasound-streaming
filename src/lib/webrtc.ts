export class WebRTCConnection {
  private peerConnection: RTCPeerConnection;
  private dataChannel: RTCDataChannel | null = null;
  private stream: MediaStream | null = null;

  constructor(
    private socket: any,
    private peerId: string,
    private onStream: (stream: MediaStream) => void
  ) {
    this.peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    });

    this.setupPeerConnectionHandlers();
  }

  private setupPeerConnectionHandlers() {
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.emit('signal', {
          peerId: this.peerId,
          signal: { type: 'candidate', candidate: event.candidate },
        });
      }
    };

    this.peerConnection.ontrack = (event) => {
      this.onStream(event.streams[0]);
    };
  }

  async startStream(stream: MediaStream) {
    this.stream = stream;
    stream.getTracks().forEach(track => {
      this.peerConnection.addTrack(track, stream);
    });

    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    
    this.socket.emit('signal', {
      peerId: this.peerId,
      signal: { type: 'offer', sdp: offer },
    });
  }

  async handleSignal(signal: any) {
    if (signal.type === 'offer') {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(signal));
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      
      this.socket.emit('signal', {
        peerId: this.peerId,
        signal: { type: 'answer', sdp: answer },
      });
    } else if (signal.type === 'answer') {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(signal));
    } else if (signal.type === 'candidate') {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(signal.candidate));
    }
  }

  close() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
    this.peerConnection.close();
  }
}