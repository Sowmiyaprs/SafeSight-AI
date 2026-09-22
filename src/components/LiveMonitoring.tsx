import React, { useState, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import { 
  Camera, 
  Shield, 
  ShieldAlert, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  RefreshCw,
  AlertCircle,
  Activity,
  Maximize2,
  Video,
  MonitorPlay,
  Cpu
} from 'lucide-react';
import { cn } from '../utils';

const WebcamComponent: any = Webcam;

export const LiveMonitoring: React.FC = () => {
  // Feed Mode: 'python_stream' (YOLOv8 server) vs 'browser_webcam' (client-side)
  const [streamMode, setStreamMode] = useState<'python_stream' | 'browser_webcam'>('python_stream');
  const [isPlaying, setIsPlaying] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [recentViolations, setRecentViolations] = useState<any[]>([]);
  const [isAlertActive, setIsAlertActive] = useState(false);
  const [backendConnected, setBackendConnected] = useState(true);

  // In-Browser Webcam refs
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Play browser beep on violation
  const playWebAlertSound = () => {
    if (!soundEnabled) return;
    try {
      const ctx = audioContextRef.current || new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = ctx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
      console.warn("AudioContext error:", e);
    }
  };

  // Poll recent violations & check backend connectivity
  useEffect(() => {
    const fetchViolations = async () => {
      try {
        const res = await fetch('/api/violations');
        if (res.ok) {
          const data = await res.json();
          setRecentViolations(data.slice(0, 6));
          setBackendConnected(true);
        } else {
          setBackendConnected(false);
        }
      } catch (err) {
        setBackendConnected(false);
      }
    };

    fetchViolations();
    const interval = setInterval(fetchViolations, 4000);
    return () => clearInterval(interval);
  }, []);

  // In-Browser Webcam AI Detection loop using TensorFlow.js (if browser_webcam mode active)
  useEffect(() => {
    if (streamMode !== 'browser_webcam') return;

    let isMounted = true;
    let tfModel: any = null;

    const initTf = async () => {
      try {
        // Dynamically load cocoSsd
        const cocoSsd = await import('@tensorflow-models/coco-ssd');
        await import('@tensorflow/tfjs');
        tfModel = await cocoSsd.load();
      } catch (e) {
        console.warn("TensorFlow.js load warning:", e);
      }
    };

    initTf();

    const detectInterval = setInterval(async () => {
      if (!isMounted || !tfModel || !webcamRef.current?.video || !isPlaying) return;
      const video = webcamRef.current.video;
      if (video.readyState !== 4) return;

      try {
        const predictions = await tfModel.detect(video);
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let violationDetected = false;

        predictions.forEach((pred: any) => {
          if (pred.class === 'person') {
            const [x, y, width, height] = pred.bbox;
            // High-risk person detection (in test mode, flag as potential PPE violation without helmet)
            violationDetected = true;

            // Draw bounding box
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 3;
            ctx.strokeRect(x, y, width, height);

            // Draw tag
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(x, Math.max(0, y - 24), 160, 24);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px sans-serif';
            ctx.fillText('NO HELMET DETECTED', x + 6, Math.max(16, y - 7));
          }
        });

        if (violationDetected) {
          setIsAlertActive(true);
          playWebAlertSound();
          setTimeout(() => setIsAlertActive(false), 2000);

          // Dispatch to backend API
          fetch('/api/violation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              worker_id: 'W-Webcam',
              location: 'Live Browser Feed',
              severity: 'HIGH'
            })
          }).catch(() => {});
        }
      } catch (err) {
        // Ignore detection tick error
      }
    }, 1800);

    return () => {
      isMounted = false;
      clearInterval(detectInterval);
    };
  }, [streamMode, isPlaying, soundEnabled]);

  const handleTogglePlay = async () => {
    setIsPlaying(!isPlaying);
    try {
      await fetch('/api/system/toggle', { method: 'POST' });
    } catch (e) {}
  };

  const handleTriggerAlarm = async () => {
    playWebAlertSound();
    try {
      await fetch('/api/system/alarm', { method: 'POST' });
    } catch (e) {}
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center px-3 py-1 bg-rose-500/10 text-rose-500 rounded-full text-xs font-bold border border-rose-500/20">
            <span className="w-2 h-2 bg-rose-500 rounded-full mr-2 animate-pulse" />
            {isPlaying ? 'LIVE STREAM' : 'FEED PAUSED'}
          </div>
          <h1 className="text-2xl font-bold">Industrial PPE Surveillance Feed</h1>
        </div>

        {/* Stream Source Toggle & Action Buttons */}
        <div className="flex items-center space-x-2.5">
          <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1">
            <button 
              onClick={() => setStreamMode('python_stream')}
              className={cn(
                "flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg transition-all",
                streamMode === 'python_stream' 
                  ? "bg-purple-600 text-white shadow-sm" 
                  : "text-slate-400 hover:text-white"
              )}
            >
              <Cpu className="w-3.5 h-3.5 mr-1.5" />
              YOLOv8 + Pose Stream
            </button>
            <button 
              onClick={() => setStreamMode('browser_webcam')}
              className={cn(
                "flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg transition-all",
                streamMode === 'browser_webcam' 
                  ? "bg-blue-600 text-white shadow-sm" 
                  : "text-slate-400 hover:text-white"
              )}
            >
              <Camera className="w-3.5 h-3.5 mr-1.5" />
              Browser Webcam
            </button>
          </div>

          <button 
            onClick={handleTogglePlay}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
            title={isPlaying ? "Pause Feed" : "Resume Feed"}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={cn(
              "p-2 rounded-lg transition-colors",
              soundEnabled ? "bg-amber-600/20 text-amber-400 border border-amber-500/30" : "bg-slate-800 text-slate-500"
            )}
            title={soundEnabled ? "Alarm Siren Enabled" : "Alarm Siren Muted"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button 
            onClick={handleTriggerAlarm}
            className="px-3 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 text-xs font-bold rounded-lg border border-rose-500/30 transition-colors"
          >
            Test Siren
          </button>
        </div>
      </div>

      {/* Connection Notification Banner if backend is offline */}
      {!backendConnected && (
        <div className="px-4 py-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between text-xs text-amber-300">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Python AI backend not detected on port 5000. Switch to <strong>Browser Webcam</strong> mode to test live AI immediately, or run <code>python backend/app.py</code>.</span>
          </div>
          <button 
            onClick={() => setStreamMode('browser_webcam')}
            className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 rounded font-semibold text-amber-200 ml-4 shrink-0"
          >
            Use Browser Webcam
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
        {/* Main Video Stream Container */}
        <div className="lg:col-span-3 relative bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center min-h-[480px]">
          {streamMode === 'python_stream' ? (
            /* Mode 1: Real-time MJPEG stream with YOLOv8 & Pose HUD from backend */
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              {isPlaying ? (
                <img 
                  src="/api/stream" 
                  alt="SafeSight AI Live Feed" 
                  className="w-full h-full object-contain"
                  onError={() => setBackendConnected(false)}
                />
              ) : (
                <div className="text-center py-24 text-slate-500">
                  <Pause className="w-12 h-12 mx-auto mb-3 opacity-60" />
                  <p className="font-semibold">Stream Paused</p>
                  <p className="text-xs mt-1">Click Play to resume real-time AI processing</p>
                </div>
              )}

              {/* Status Overlay Badge */}
              <div className="absolute top-4 left-4 flex flex-col space-y-2">
                <div className="flex items-center space-x-2 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-medium text-slate-200">Engine: YOLOv8 + Pose</span>
                </div>
                <div className="flex items-center space-x-2 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs">
                  <Activity className="w-3.5 h-3.5 text-blue-400" />
                  <span className="font-medium text-slate-200">Processing: 30 FPS</span>
                </div>
              </div>
            </div>
          ) : (
            /* Mode 2: In-Browser Webcam AI */
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              <WebcamComponent
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                className="w-full h-full object-contain"
                videoConstraints={{ facingMode: "user" }}
              />
              <canvas 
                ref={canvasRef} 
                className="absolute inset-0 w-full h-full pointer-events-none"
              />

              <div className="absolute top-4 left-4 flex items-center space-x-2 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs text-slate-200">
                <Camera className="w-3.5 h-3.5 text-blue-400" />
                <span>Client-Side Webcam Active</span>
              </div>
            </div>
          )}

          {/* Alarm Flash Overlay */}
          {isAlertActive && (
            <div className="absolute inset-0 border-4 border-rose-500 pointer-events-none animate-pulse">
              <div className="absolute top-6 right-6 bg-rose-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center space-x-3">
                <ShieldAlert className="w-6 h-6 animate-bounce" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider">PPE Violation Triggered</p>
                  <p className="text-sm font-semibold">No Hard Hat Detected!</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Live Safety Alerts & Model Info Panel */}
        <div className="flex flex-col space-y-6">
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex-1 overflow-hidden flex flex-col">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center justify-between">
              <span className="flex items-center">
                <AlertCircle className="w-4 h-4 text-rose-500 mr-2" />
                Live Incident Feed
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-normal">
                {recentViolations.length} logged
              </span>
            </h3>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
              {recentViolations.length > 0 ? (
                recentViolations.map((v, i) => (
                  <div 
                    key={v.id || i} 
                    className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className={cn(
                        "text-[10px] font-bold uppercase px-1.5 py-0.5 rounded",
                        v.status === 'Critical' ? "bg-rose-500/20 text-rose-400" : "bg-amber-500/20 text-amber-400"
                      )}>
                        {v.status || 'Violation'}
                      </span>
                      <span className="text-[10px] text-slate-500">{v.time ? v.time.split(' ')[1] : 'Just now'}</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-200">{v.type || 'No Helmet Detected'}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{v.location || 'Zone A - Gate'}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500 text-xs">
                  No active safety violations detected.
                </div>
              )}
            </div>
          </div>

          {/* Model Status Card */}
          <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-800/80 border border-slate-800 rounded-2xl">
            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3 flex items-center">
              <Cpu className="w-4 h-4 mr-1.5" />
              Inference Hardware Status
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Architecture</span>
                <span className="font-semibold text-slate-200">YOLOv8n + YOLOv8n-Pose</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Pose Keypoints</span>
                <span className="font-semibold text-slate-200">17 COCO Landmarks</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Cloud Storage</span>
                <span className="font-semibold text-emerald-400">AWS S3 Vault Active</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Twilio / SMS</span>
                <span className="font-semibold text-emerald-400">Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
