
export class AudioRecorder {
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;

  constructor(private onAudioData: (audioData: Float32Array) => void) {}

  async start() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      this.audioContext = new AudioContext({
        sampleRate: 24000,
      });
      
      this.source = this.audioContext.createMediaStreamSource(this.stream);
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);
      
      this.processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        this.onAudioData(new Float32Array(inputData));
      };
      
      this.source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      throw error;
    }
  }

  stop() {
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

export const encodeAudioForAPI = (float32Array: Float32Array): string => {
  const int16Array = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  
  const uint8Array = new Uint8Array(int16Array.buffer);
  let binary = '';
  const chunkSize = 0x8000;
  
  for (let i = 0; i < uint8Array.length; i += chunkSize) {
    const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  
  return btoa(binary);
};

class AudioQueue {
  private queue: Uint8Array[] = [];
  private isPlaying = false;
  private audioContext: AudioContext;

  constructor() {
    this.audioContext = new AudioContext({
      sampleRate: 24000,
    });
  }

  async addToQueue(audioData: Uint8Array) {
    this.queue.push(audioData);
    if (!this.isPlaying) {
      await this.playNext();
    }
  }

  private async playNext() {
    if (this.queue.length === 0) {
      this.isPlaying = false;
      return;
    }

    this.isPlaying = true;
    const audioData = this.queue.shift()!;

    try {
      const audioBuffer = await this.createAudioBuffer(audioData);
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);
      
      source.onended = () => this.playNext();
      source.start(0);
    } catch (error) {
      console.error('Error playing audio:', error);
      this.playNext(); // Continue with next segment even if current fails
    }
  }

  private async createAudioBuffer(pcmData: Uint8Array): Promise<AudioBuffer> {
    // Create a buffer with PCM data
    const audioBuffer = this.audioContext.createBuffer(1, pcmData.length / 2, 24000);
    
    // Fill the buffer with PCM data
    const channelData = audioBuffer.getChannelData(0);
    for (let i = 0; i < pcmData.length; i += 2) {
      // Convert from 16-bit PCM to float
      const sample = ((pcmData[i+1] << 8) | pcmData[i]) / 32768.0;
      channelData[i/2] = sample;
    }
    
    return audioBuffer;
  }
}

export class CoachConversation {
  private ws: WebSocket | null = null;
  private recorder: AudioRecorder | null = null;
  private audioQueue: AudioQueue;
  private onTranscriptUpdate: (text: string) => void;
  private onStatusChange: (status: string) => void;
  private currentTranscript: string = '';

  constructor(
    onTranscriptUpdate: (text: string) => void,
    onStatusChange: (status: string) => void
  ) {
    this.onTranscriptUpdate = onTranscriptUpdate;
    this.onStatusChange = onStatusChange;
    this.audioQueue = new AudioQueue();
  }

  async start(): Promise<void> {
    try {
      this.onStatusChange('Connecting to coach...');
      
      // Get session token from edge function
      const response = await fetch('/api/realtime-coach-session', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to start session');
      }
      
      const { token } = await response.json();
      
      // Connect WebSocket
      this.ws = new WebSocket(`wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17`);
      
      this.ws.onopen = () => {
        console.log('WebSocket connection established');
        this.ws?.send(JSON.stringify({
          type: 'authentication',
          token
        }));
      };
      
      this.ws.onmessage = (event) => {
        this.handleWebSocketMessage(event);
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.onStatusChange('Connection error');
      };
      
      this.ws.onclose = () => {
        console.log('WebSocket connection closed');
        this.onStatusChange('Disconnected');
      };
      
      // Start microphone recording
      this.recorder = new AudioRecorder((audioData) => {
        if (this.ws?.readyState === WebSocket.OPEN) {
          const encodedAudio = encodeAudioForAPI(audioData);
          this.ws.send(JSON.stringify({
            type: 'input_audio_buffer.append',
            audio: encodedAudio
          }));
        }
      });
      
      await this.recorder.start();
      this.onStatusChange('Connected to coach');
      
      // Configure session after connection
      setTimeout(() => {
        if (this.ws?.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({
            event_id: 'config_event',
            type: 'session.update',
            session: {
              modalities: ["text", "audio"],
              instructions: "You are an expert baseball pitching coach. You'll help the user understand pitching mechanics, the mental aspects of pitching, different types of pitches, and how to improve their baseball pitching skills. Be conversational, knowledgeable, and encouraging. Answer questions knowledgeably and clearly, like a college-level baseball coach would. Keep your answers brief but informative. Ask follow-up questions if needed.",
              voice: "onyx",
              input_audio_format: "pcm16",
              output_audio_format: "pcm16",
              input_audio_transcription: {
                model: "whisper-1"
              },
              turn_detection: {
                type: "server_vad",
                threshold: 0.5,
                prefix_padding_ms: 300,
                silence_duration_ms: 1000
              },
              temperature: 0.7,
              max_response_output_tokens: "inf"
            }
          }));
        }
      }, 1000);
      
    } catch (error) {
      console.error('Error starting session:', error);
      this.onStatusChange('Failed to connect');
      throw error;
    }
  }
  
  private handleWebSocketMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);
      console.log('Received message:', data);
      
      switch (data.type) {
        case 'session.created':
          console.log('Session created successfully');
          break;
          
        case 'response.audio.delta':
          this.handleAudioDelta(data);
          break;
          
        case 'response.audio_transcript.delta':
          this.handleTranscriptDelta(data);
          break;
          
        case 'response.audio.done':
          console.log('Audio response completed');
          break;
          
        case 'error':
          console.error('Error from server:', data.error);
          this.onStatusChange(`Error: ${data.error?.message || 'Unknown error'}`);
          break;
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
    }
  }
  
  private handleAudioDelta(data: any): void {
    if (!data.delta) return;
    
    const binaryString = atob(data.delta);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    this.audioQueue.addToQueue(bytes);
  }
  
  private handleTranscriptDelta(data: any): void {
    if (!data.delta) return;
    
    this.currentTranscript += data.delta;
    this.onTranscriptUpdate(this.currentTranscript);
  }
  
  stop(): void {
    if (this.recorder) {
      this.recorder.stop();
      this.recorder = null;
    }
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.currentTranscript = '';
    this.onStatusChange('Disconnected');
  }
  
  sendMessage(text: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not open');
      return;
    }
    
    const event = {
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [
          {
            type: 'input_text',
            text
          }
        ]
      }
    };
    
    this.ws.send(JSON.stringify(event));
    this.ws.send(JSON.stringify({type: 'response.create'}));
  }
}
