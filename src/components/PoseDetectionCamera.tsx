
import React, { useRef, useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';
import { Button } from '@/components/ui/button';

interface PoseDetectionCameraProps {
  onClose: () => void;
}

const PoseDetectionCamera: React.FC<PoseDetectionCameraProps> = ({ onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [model, setModel] = useState<poseDetection.PoseDetector | null>(null);
  const [loadingModel, setLoadingModel] = useState<boolean>(false);
  const [modelLoadError, setModelLoadError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize TensorFlow.js
    const setupTf = async () => {
      setLoadingModel(true);
      try {
        await tf.ready();
        const detectorConfig = {
          modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
        };
        
        const detector = await poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet,
          detectorConfig
        );
        setModel(detector);
        setLoadingModel(false);
        console.log('Pose model loaded successfully');
      } catch (error) {
        console.error('Failed to load pose model:', error);
        setModelLoadError('Failed to load pose detection model. Please try refreshing the page.');
        setLoadingModel(false);
      }
    };

    setupTf();

    return () => {
      // Cleanup
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    let animationFrameId: number;
    
    const startCamera = async () => {
      if (!videoRef.current) return;
      
      try {
        const constraints = {
          video: { 
            width: { ideal: 640 },
            height: { ideal: 480 }
          }
        };
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      } catch (err) {
        console.error("Error accessing the camera:", err);
      }
    };

    if (isDetecting) {
      startCamera();
      animationFrameId = requestAnimationFrame(detectPose);
    } else if (videoRef.current && videoRef.current.srcObject) {
      // Stop camera when not detecting
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      cancelAnimationFrame(animationFrameId);
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isDetecting]);

  const detectPose = async () => {
    if (!model || !videoRef.current || !canvasRef.current || videoRef.current.paused || videoRef.current.ended) {
      requestAnimationFrame(detectPose);
      return;
    }

    // Get video properties
    const video = videoRef.current;
    const { videoWidth, videoHeight } = video;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions
    canvas.width = videoWidth;
    canvas.height = videoHeight;
    
    // Detect poses
    try {
      const poses = await model.estimatePoses(video);
      
      if (poses.length > 0) {
        console.log('Pose landmarks:', poses[0].keypoints);
        drawPose(canvas, poses[0]);
      }
    } catch (error) {
      console.error('Error detecting pose:', error);
    }
    
    requestAnimationFrame(detectPose);
  };
  
  const drawPose = (canvas: HTMLCanvasElement, pose: poseDetection.Pose) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw keypoints
    const keypoints = pose.keypoints;
    keypoints.forEach(keypoint => {
      if (keypoint.score && keypoint.score > 0.3) {
        ctx.beginPath();
        ctx.arc(keypoint.x, keypoint.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = 'red';
        ctx.fill();
      }
    });
    
    // Draw skeleton (connecting lines between keypoints)
    const connections = [
      ['nose', 'left_eye'], ['nose', 'right_eye'],
      ['left_eye', 'left_ear'], ['right_eye', 'right_ear'],
      ['left_shoulder', 'right_shoulder'],
      ['left_shoulder', 'left_elbow'], ['right_shoulder', 'right_elbow'],
      ['left_elbow', 'left_wrist'], ['right_elbow', 'right_wrist'],
      ['left_shoulder', 'left_hip'], ['right_shoulder', 'right_hip'],
      ['left_hip', 'right_hip'],
      ['left_hip', 'left_knee'], ['right_hip', 'right_knee'],
      ['left_knee', 'left_ankle'], ['right_knee', 'right_ankle']
    ];
    
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;
    
    connections.forEach(([partA, partB]) => {
      const keypointA = keypoints.find(kp => kp.name === partA);
      const keypointB = keypoints.find(kp => kp.name === partB);
      
      if (
        keypointA && 
        keypointB && 
        keypointA.score && 
        keypointB.score && 
        keypointA.score > 0.3 && 
        keypointB.score > 0.3
      ) {
        ctx.beginPath();
        ctx.moveTo(keypointA.x, keypointA.y);
        ctx.lineTo(keypointB.x, keypointB.y);
        ctx.stroke();
      }
    });
  };

  const handleStartDetecting = () => {
    if (!model) {
      setModelLoadError('Model is not loaded yet. Please wait or refresh the page.');
      return;
    }
    setIsDetecting(true);
  };

  const handleStopDetecting = () => {
    setIsDetecting(false);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative mb-4 border border-gray-300 rounded-lg overflow-hidden">
        <video 
          ref={videoRef}
          className="max-w-full"
          playsInline
          style={{ display: isDetecting ? 'block' : 'none' }}
        />
        <canvas 
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full"
        />
        {!isDetecting && (
          <div className="bg-gray-100 p-12 flex flex-col items-center justify-center">
            {loadingModel ? (
              <p className="text-gray-600 mb-4">Loading pose detection model...</p>
            ) : modelLoadError ? (
              <p className="text-red-600 mb-4">{modelLoadError}</p>
            ) : (
              <p className="text-gray-600 mb-4">Click Start to enable the camera and begin pose detection</p>
            )}
          </div>
        )}
      </div>

      <div className="flex space-x-4">
        {!isDetecting ? (
          <Button 
            onClick={handleStartDetecting} 
            className="bg-orange-500 hover:bg-orange-600"
            disabled={loadingModel || !!modelLoadError}
          >
            {loadingModel ? "Loading..." : "Start Camera"}
          </Button>
        ) : (
          <Button onClick={handleStopDetecting} className="bg-red-500 hover:bg-red-600">
            Stop Camera
          </Button>
        )}
        <Button onClick={onClose} variant="outline">
          Close
        </Button>
      </div>
    </div>
  );
};

export default PoseDetectionCamera;
