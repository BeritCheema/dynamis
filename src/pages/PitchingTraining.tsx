import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { NavigationBar } from "@/components/NavigationBar";
import { Pose, POSE_CONNECTIONS, Results } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";
import { UserRoundPen } from "lucide-react";

const TrainingPrep = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState<number>(5);
  const [started, setStarted] = useState(false);
  const [cameraStarted, setCameraStarted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const poseRef = useRef<Pose | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [waitingForFeedback, setWaitingForFeedback] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  // Countdown logic
  useEffect(() => {
    if (started && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (started && countdown === 0) {
      startCamera();
    }
  }, [countdown, started]);

  const startCamera = async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      console.log("Cleared old interval.");
    }
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
        if (latestLandmarks.current && !waitingForFeedback) {
          sendLandmarks(latestLandmarks.current);
        }
      }, 1000);
    } catch (error) {
      console.error("Failed to start camera:", error);
    }

    poseRef.current = pose;
    cameraRef.current = camera;
  };

  const latestLandmarks = useRef<Results["poseLandmarks"] | null>(null);

  const onResults = (results: Results) => {
    if (results.poseLandmarks && canvasRef.current && videoRef.current) {
      latestLandmarks.current = results.poseLandmarks;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Set canvas size to match video
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;

      // Clear previous drawings
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connections
      ctx.strokeStyle = "#00FF00"; // bright green for connections
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

      // Draw points
      ctx.fillStyle = "#FF0000"; // red for keypoints
      results.poseLandmarks.forEach((landmark) => {
        const x = landmark.x * canvas.width;
        const y = landmark.y * canvas.height;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
      });
    }
  };

  let canSpeak = true;

  const generateSpeech = async (text: string) => {
    if (!canSpeak) {
      console.log("Blocked from speaking: waiting 20s cooldown.");
      return;
    }

    canSpeak = false;

    try {
      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer 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`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "gpt-4o-mini-tts",
          voice: "Nova",
          input: text,
          speed: 2.50,
          response_format: "mp3",
          instructions: "be seductive, flirty and sexy"
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        console.error("TTS API Error:", err);
        canSpeak = true; // Reset if error
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const audio = new Audio(url);
      await audio.play();
      console.log("Speech played.");

      setTimeout(() => {
        canSpeak = true;
        console.log("Ready to speak again.");
      }, 25000); // <-- unlock after 20 seconds
    } catch (error) {
      console.error("Failed to generate speech:", error);
      canSpeak = true; // Reset if error
    }
  };
  const connectWebSocket = () => {
    const ws = new WebSocket("ws://localhost:8000/baseball");
    ws.onopen = () => {
      console.log("WebSocket connection opened.");
    };
    ws.onmessage = (event) => {
      const rawData = event.data;
      try {
        const data = JSON.parse(rawData);
        console.log("Received from server:", data);

        if (data.Text) {
          console.log("LLM Feedback:", data.Text);
          setWaitingForFeedback(true);
          generateSpeech(data.Text);
          setWaitingForFeedback(false);
        } else {
          console.log("Server message:", data.message);
        }
      } catch (e) {
        console.error("Error parsing server message:", e);
      }
    };
    ws.onclose = () => {
      console.log("WebSocket closed.");
    };
    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    wsRef.current = ws;
  };

  const sendLandmarks = (landmarks: Results["poseLandmarks"]) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error("WebSocket is not open.");
      return;
    }

    wsRef.current.send(JSON.stringify({ points: landmarks }));
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (cameraRef.current) cameraRef.current.stop();
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  return (
    <>
      <NavigationBar variant="dashboard" />
      <div className="container mx-auto px-4 py-8 pt-20">

        <Button onClick={() => generateSpeech("Hello! Test audio.")}>
          Test TTS
        </Button>
        <h1 className="text-3xl font-bold text-center mb-8">Prepare for Training</h1>
        <div className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-md relative">

          {/* Always render video, just hide it if not ready */}
          <video
            ref={videoRef}
            className={`absolute top-0 left-0 w-full rounded-lg ${cameraStarted ? '' : 'hidden'}`}
            autoPlay
            muted
            playsInline
          ></video>

          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full rounded-lg pointer-events-none"
          />

          {!started && !cameraStarted ? (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-4">Before We Begin</h2>
                <ul className="text-left space-y-3 mb-6">
                  <li>✓ Find a well-lit area</li>
                  <li>✓ Ensure your whole body is visible</li>
                  <li>✓ Clear the space around you</li>
                  <li>✓ Have your basketball ready</li>
                </ul>
              </div>
              <div className="flex justify-center space-x-4">
                <Button
                  onClick={() => setStarted(true)}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  Start Countdown
                </Button>
                <Button
                  onClick={() => navigate('/basketball')}
                  variant="outline"
                >
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
                <>
                  <p className="text-lg">Camera session started! Move around to begin training.</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
export default TrainingPrep;
