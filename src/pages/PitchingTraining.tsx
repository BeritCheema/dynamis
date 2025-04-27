import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { NavigationBar } from "@/components/NavigationBar";
import { Pose, POSE_CONNECTIONS, Results } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";

const TrainingPrep = () => {
  const navigate = useNavigate();

  const [countdown, setCountdown] = useState(5);
  const [started, setStarted] = useState(false);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [waitingForFeedback, setWaitingForFeedback] = useState(false);

  const [isThrowPeriod, setIsThrowPeriod] = useState(false);
  const isThrowPeriodRef = useRef(false);

  const [currentTime, setCurrentTime] = useState(Date.now());
  const periodEndTimeRef = useRef(Date.now() + 5000);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const poseRef = useRef<Pose | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const latestLandmarks = useRef<Results["poseLandmarks"] | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const phaseFlipRef = useRef<NodeJS.Timeout | null>(null);
  const timerUpdateRef = useRef<NodeJS.Timeout | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const THROW_DURATION = 1 * 1000; // milliseconds
  const REST_DURATION = 5 * 1000;  // milliseconds

  // --- Period Control ---
  const startPeriodLoop = () => {
    isThrowPeriodRef.current = false;
    setIsThrowPeriod(false);
    periodEndTimeRef.current = Date.now() + REST_DURATION;
    sendClearToServer();

    phaseFlipRef.current = setInterval(() => {
      isThrowPeriodRef.current = !isThrowPeriodRef.current;
      setIsThrowPeriod(isThrowPeriodRef.current);

      if (isThrowPeriodRef.current) {
        periodEndTimeRef.current = Date.now() + THROW_DURATION;
        sendAudioToServer();
      } else {
        periodEndTimeRef.current = Date.now() + REST_DURATION;
        sendClearToServer();
        sendAudioToServer();
      }
    }, THROW_DURATION + REST_DURATION);

    timerUpdateRef.current = setInterval(() => {
      setCurrentTime(Date.now());
    }, 100);
  };

  const periodCountdown = Math.max(0, Math.ceil((periodEndTimeRef.current - currentTime) / 1000));

  useEffect(() => {
    if (started && countdown > 0) {
      const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (started && countdown === 0) {
      startCamera();
    }
  }, [countdown, started]);

  const startCamera = async () => {
    startPeriodLoop();

    if (intervalRef.current) clearInterval(intervalRef.current);

    if (!videoRef.current) {
      console.error("Video element not found");
      return;
    }

    const pose = new Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    pose.onResults(onResults);

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        if (videoRef.current) {
          await pose.send({ image: videoRef.current });
        }
      },
      width: 640,
      height: 480,
    });

    try {
      await camera.start();
      console.log("Camera started!");
      setCameraStarted(true);
      connectWebSocket();

      intervalRef.current = setInterval(() => {
        if (latestLandmarks.current && !waitingForFeedback && isThrowPeriodRef.current) {
          sendLandmarks(latestLandmarks.current);
        }
      }, 100);
    } catch (error) {
      console.error("Failed to start camera:", error);
    }

    poseRef.current = pose;
    cameraRef.current = camera;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);

          // Keep only roughly last 15 seconds of audio chunks
          const maxChunks = Math.ceil(15000 / 1000); // assuming ~1 chunk per second
          if (audioChunksRef.current.length > maxChunks) {
            audioChunksRef.current.shift();
          }
        }
      };

      mediaRecorder.start(1000); // capture every 1 second
      mediaRecorderRef.current = mediaRecorder;
      console.log("Microphone recording started.");
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const sendAudioToServer = async () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error("WebSocket not open for audio send.");
      return;
    }
    if (audioChunksRef.current.length === 0) {
      console.log("No audio to send.");
      return;
    }

    const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Audio = (reader.result as string).split(',')[1];
      wsRef.current?.send(JSON.stringify({
        type: "audio",
        data: base64Audio,
      }));
      console.log("Sent audio data to server.");
    };
    reader.readAsDataURL(audioBlob);
  };
  const onResults = (results: Results) => {
    if (results.poseLandmarks && canvasRef.current && videoRef.current) {
      latestLandmarks.current = results.poseLandmarks;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = "#00FF00";
      ctx.lineWidth = 2;
      POSE_CONNECTIONS.forEach(([startIdx, endIdx]) => {
        const start = results.poseLandmarks[startIdx];
        const end = results.poseLandmarks[endIdx];
        if (start && end) {
          ctx.beginPath();
          ctx.moveTo(start.x * canvas.width, start.y * canvas.height);
          ctx.lineTo(end.x * canvas.width, end.y * canvas.height);
          ctx.stroke();
        }
      });

      ctx.fillStyle = "#FF0000";
      results.poseLandmarks.forEach((landmark) => {
        const x = landmark.x * canvas.width;
        const y = landmark.y * canvas.height;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
      });
    }
  };
  const generateSpeech = async (text: string) => {
    try {
      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer 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`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "gpt-4o-mini-tts",
          voice: "nova",
          input: text,
          speed: 2.0,
          response_format: "mp3",
          instructions: "Be seductive, flirty and sexy."
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        console.error("TTS API Error:", err);
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const audio = new Audio(url);
      await audio.play();

      console.log("Speech played. Waiting 20 seconds...");

      await new Promise((resolve) => setTimeout(resolve, 20000)); // <-- 20 second wait after playing
      console.log("Ready for next speech.");
    } catch (error) {
      console.error("Failed to generate speech:", error);
    }
  };
  const connectWebSocket = () => {
    const ws = new WebSocket("ws://localhost:8000/baseball");
    ws.onopen = () => console.log("WebSocket connection opened.");
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Received from server:", data);
        if (data.Text) {
          setWaitingForFeedback(true);
          generateSpeech(data.Text); // Uncomment if needed
          setWaitingForFeedback(false);
        }
      } catch (e) {
        console.error("Error parsing server message:", e);
      }
    };
    ws.onclose = () => console.log("WebSocket closed.");
    ws.onerror = (err) => console.error("WebSocket error:", err);
    wsRef.current = ws;
  };

  const sendLandmarks = (landmarks: Results["poseLandmarks"]) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error("WebSocket is not open.");
      return;
    }
    wsRef.current.send(JSON.stringify({ points: landmarks }));
    console.log('sent');
  };

  const sendClearToServer = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error("WebSocket not open for clear.");
      return;
    }
    wsRef.current.send(JSON.stringify({ type: "clear" }));
    console.log("Sent CLEAR");
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (phaseFlipRef.current) clearInterval(phaseFlipRef.current);
      if (timerUpdateRef.current) clearInterval(timerUpdateRef.current);
      if (cameraRef.current) cameraRef.current.stop();
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  return (
    <>
      <NavigationBar variant="dashboard" />
      <div className="container mx-auto px-4 py-8 pt-20">
        <h1 className="text-3xl font-bold text-center mb-8">Prepare for Training</h1>

        {cameraStarted && (
          <div className="text-center mb-6">
            <h2 className={`text-2xl font-bold ${isThrowPeriod ? "text-green-500" : "text-blue-500"}`}>
              {isThrowPeriod ? "🚀 THROW PERIOD!" : "😌 REST PERIOD"}
            </h2>
            <p className="text-lg mt-2">Next phase in {periodCountdown} seconds</p>
          </div>
        )}

        <div className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-md relative">
          <video
            ref={videoRef}
            className={`absolute top-0 left-0 w-full rounded-lg ${cameraStarted ? "" : "hidden"}`}
            autoPlay
            muted
            playsInline
          ></video>

          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full rounded-lg pointer-events-none"
          />

          {!started && !cameraStarted ? (
            <div className="space-y-6 text-center">
              <h2 className="text-xl font-semibold mb-4">Before We Begin</h2>
              <ul className="text-left space-y-3 mb-6">
                <li>✓ Find a well-lit area</li>
                <li>✓ Ensure your whole body is visible</li>
                <li>✓ Clear the space around you</li>
                <li>✓ Have your basketball ready</li>
              </ul>
              <div className="flex justify-center space-x-4">
                <Button onClick={() => setStarted(true)} className="bg-orange-500 hover:bg-orange-600">
                  Start Countdown
                </Button>
                <Button onClick={() => navigate("/basketball")} variant="outline">
                  Back
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-6">
              {!cameraStarted ? (
                <>
                  <div className="text-6xl font-bold text-orange-500">{countdown}</div>
                  <p className="text-lg">Starting camera session...</p>
                </>
              ) : (
                <p className="text-lg">Camera session started! Move around to begin training.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TrainingPrep;
