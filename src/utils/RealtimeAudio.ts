
import { supabase } from "@/integrations/supabase/client";

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
          sampleRate: 16000, // Gemini requires 16kHz for input
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      this.audioContext = new AudioContext({
        sampleRate: 16000, // Match Gemini's required input sample rate
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

export class RealtimeChat {
  private ws: WebSocket | null = null;
  private audioEl: HTMLAudioElement;
  private recorder: AudioRecorder | null = null;
  private apiKey: string | null = null;

  constructor(private onMessage: (message: any) => void) {
    this.audioEl = document.createElement("audio");
    this.audioEl.autoplay = true;
  }

  async init() {
    try {
      // Get the API key from our edge function
      const tokenResponse = await supabase.functions.invoke("realtime-chat-token");
      const data = tokenResponse.data;
      
      if (!data?.sessionHandle) {
        throw new Error("Failed to get session handle");
      }

      this.apiKey = data.sessionHandle;
      const modelName = data.modelName || "gemini-2.0-flash-live-001";

      // Create WebSocket connection to Gemini with the API key
      const wsUrl = `wss://generativelanguage.googleapis.com/v1beta/models/${modelName}:streamGenerateContent?key=${this.apiKey}`;
      this.ws = new WebSocket(wsUrl);
      
      // Set up WebSocket handlers
      this.ws.onopen = () => {
        console.log("WebSocket connection established");
        // Send initial configuration
        this.ws.send(JSON.stringify({
          "contents": [{
            "role": "user",
            "parts": [{
              "text": "Hello, I'm ready to talk about baseball pitching."
            }]
          }],
          "generation_config": {
            "response_modalities": ["AUDIO"],
            "speech_config": {
              "voice_config": {
                "prebuilt_voice_config": {
                  "voice_name": "Puck"
                }
              }
            }
          }
        }));
      };
      
      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("Received event:", data);
        this.onMessage(data);

        // Handle audio responses
        if (data.candidates && data.candidates[0] && data.candidates[0].content && 
            data.candidates[0].content.parts && data.candidates[0].content.parts[0] && 
            data.candidates[0].content.parts[0].audio_data) {
          
          const audioData = data.candidates[0].content.parts[0].audio_data;
          const audioBytes = atob(audioData);
          
          // Convert base64 to audio buffer
          const arrayBuffer = new ArrayBuffer(audioBytes.length);
          const view = new Uint8Array(arrayBuffer);
          for (let i = 0; i < audioBytes.length; i++) {
            view[i] = audioBytes.charCodeAt(i);
          }
          
          const blob = new Blob([arrayBuffer], { type: 'audio/wav' });
          this.audioEl.src = URL.createObjectURL(blob);
        }
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      this.ws.onclose = (event) => {
        console.log("WebSocket closed:", event);
      };

      // Start recording
      this.recorder = new AudioRecorder((audioData) => {
        if (this.ws?.readyState === WebSocket.OPEN) {
          // Convert audio format for Gemini (Float32Array to base64)
          const base64Audio = this.encodeAudioData(audioData);
          
          this.ws.send(JSON.stringify({
            "contents": [{
              "role": "user",
              "parts": [{
                "audio_data": base64Audio
              }]
            }]
          }));
        }
      });
      
      await this.recorder.start();

    } catch (error) {
      console.error("Error initializing chat:", error);
      throw error;
    }
  }

  private encodeAudioData(float32Array: Float32Array): string {
    // Convert Float32 to Int16 (required by Gemini)
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    
    // Convert to base64
    const uint8Array = new Uint8Array(int16Array.buffer);
    let binary = '';
    const chunkSize = 0x8000;
    
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    
    return btoa(binary);
  }

  disconnect() {
    this.recorder?.stop();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
