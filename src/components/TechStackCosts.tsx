import React, { useState } from 'react';
import { 
  Server, 
  Camera, 
  Volume2, 
  Cpu, 
  Cloud, 
  Bell, 
  HardDrive, 
  CheckCircle, 
  Layers, 
  Calculator, 
  IndianRupee,
  Shield,
  ArrowRight,
  Code2,
  ExternalLink
} from 'lucide-react';

export const TechStackCosts: React.FC = () => {
  // Interactive Calculator State
  const [cameraCount, setCameraCount] = useState(1);
  const [includeEdgeDevice, setIncludeEdgeDevice] = useState(false);
  const [gpuTier, setGpuTier] = useState<'entry' | 'enterprise'>('entry');
  const [cloudMonths, setCloudMonths] = useState(12);

  // Calculation formulas matching blueprint
  const cameraUnitCost = 3000;
  const sirenUnitCost = 1000;
  const gpuCost = gpuTier === 'entry' ? 120000 : 250000;
  const edgeUnitCost = 22000;
  const cloudMonthlyCost = 5750; // Average of 5500-6000

  const totalHardwareCapEx = 
    (cameraCount * cameraUnitCost) + 
    gpuCost + 
    sirenUnitCost + 
    (includeEdgeDevice ? edgeUnitCost * cameraCount : 0);

  const totalCloudOpEx = cloudMonthlyCost * cloudMonths;

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 border border-purple-500/20 p-8 shadow-2xl">
        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold mb-3 border border-purple-500/30">
            <Layers className="w-3.5 h-3.5" />
            <span>Architecture & Cost Blueprint</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            SafeSight AI™ : <span className="text-purple-400">Technical Components Breakdown & Costs</span>
          </h1>
          <p className="mt-2 text-slate-300 text-sm max-w-2xl">
            Essential tech stack, deployment hardware, and infrastructure costs for building and operating the SafeSight AI™ safety platform.
          </p>
        </div>
        <div className="absolute right-0 top-0 -mt-12 -mr-12 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Grid of Main 4 Pillars (Hardware, Software, Cloud, Edge) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 1. Hardware */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-blue-500/40 transition-all shadow-lg">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Hardware</h3>
                <p className="text-xs text-slate-400">Core on-premise devices</p>
              </div>
            </div>

            <div className="space-y-3.5 text-sm">
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/40">
                <div className="flex justify-between items-start">
                  <span className="font-medium text-slate-200 flex items-center">
                    <Camera className="w-4 h-4 mr-1.5 text-blue-400" /> CCTV Camera
                  </span>
                  <span className="text-xs font-semibold text-emerald-400">₹ 3,000</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">IP camera / RTSP webcam</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/40">
                <div className="flex justify-between items-start">
                  <span className="font-medium text-slate-200 flex items-center">
                    <Cpu className="w-4 h-4 mr-1.5 text-purple-400" /> GPU Server
                  </span>
                  <span className="text-xs font-semibold text-emerald-400">₹ 1.2L - 2.5L</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">NVIDIA GPU server (RTX/A-Series)</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/40">
                <div className="flex justify-between items-start">
                  <span className="font-medium text-slate-200 flex items-center">
                    <Volume2 className="w-4 h-4 mr-1.5 text-amber-400" /> Speaker / Siren
                  </span>
                  <span className="text-xs font-semibold text-emerald-400">₹ 1,000</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">USB loudspeaker / alarm relay</p>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800/80 flex justify-between items-center text-xs">
            <span className="text-slate-400">1-Camera Subtotal</span>
            <span className="font-bold text-white">₹ 1,40,000 - ₹ 2,54,000</span>
          </div>
        </div>

        {/* 2. Software */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-emerald-500/40 transition-all shadow-lg">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Software</h3>
                <p className="text-xs text-slate-400">AI models & application code</p>
              </div>
            </div>

            <div className="space-y-3.5 text-sm">
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/40">
                <div className="flex justify-between items-start">
                  <span className="font-medium text-slate-200">Vision Model</span>
                  <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">₹ 0/-</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">YOLOv8 & Pose estimation</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/40">
                <div className="flex justify-between items-start">
                  <span className="font-medium text-slate-200">Backend API</span>
                  <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">₹ 0/-</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Flask / FastAPI (Open-source)</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/40">
                <div className="flex justify-between items-start">
                  <span className="font-medium text-slate-200">Dashboard Frontend</span>
                  <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">₹ 0/-</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">React.js and Tailwind CSS</p>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800/80 flex justify-between items-center text-xs">
            <span className="text-slate-400">Software Cost</span>
            <span className="font-bold text-emerald-400">₹ 0/- (Open-Source)</span>
          </div>
        </div>

        {/* 3. Cloud */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-rose-500/40 transition-all shadow-lg">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Cloud</h3>
                <p className="text-xs text-slate-400">Storage & Notifications</p>
              </div>
            </div>

            <div className="space-y-3.5 text-sm">
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/40">
                <div className="flex justify-between items-start">
                  <span className="font-medium text-slate-200 flex items-center">
                    <HardDrive className="w-4 h-4 mr-1.5 text-rose-400" /> S3 Storage
                  </span>
                  <span className="text-xs font-semibold text-rose-400">₹ 4,000 / mo</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">AWS S3 violation snapshot vault</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/40">
                <div className="flex justify-between items-start">
                  <span className="font-medium text-slate-200 flex items-center">
                    <Bell className="w-4 h-4 mr-1.5 text-amber-400" /> Notifications
                  </span>
                  <span className="text-xs font-semibold text-rose-400">₹ 1,500 - 2,000 / mo</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Twilio SMS / SendGrid APIs</p>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800/80 flex justify-between items-center text-xs">
            <span className="text-slate-400">Cloud Monthly</span>
            <span className="font-bold text-white">₹ 5,500 - ₹ 6,000 / mo</span>
          </div>
        </div>

        {/* 4. Edge Device */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-indigo-500/40 transition-all shadow-lg">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Edge Device</h3>
                <p className="text-xs text-slate-400">Optional Edge Computing</p>
              </div>
            </div>

            <div className="space-y-3.5 text-sm">
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/40">
                <div className="flex justify-between items-start">
                  <span className="font-medium text-slate-200">NVIDIA Jetson Board</span>
                  <span className="text-xs font-semibold text-indigo-300">₹ 22,000</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">NVIDIA Jetson Nano / Orin</p>
                <div className="mt-2 text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 inline-block font-semibold">
                  Optional Standalone Edge
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800/80 flex justify-between items-center text-xs">
            <span className="text-slate-400">Edge Device Cost</span>
            <span className="font-bold text-white">₹ 22,000 (Optional)</span>
          </div>
        </div>
      </div>

      {/* System Architecture Flow Diagram */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center">
          <Shield className="w-5 h-5 mr-2 text-purple-400" />
          Hardware & Data Flow Topology
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center text-center">
          {/* Step 1 */}
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
            <Camera className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <div className="text-xs font-bold text-white">IP CCTV Camera</div>
            <div className="text-[11px] text-slate-400 mt-1">1080p RTSP Stream</div>
          </div>

          <div className="hidden md:flex justify-center text-slate-500">
            <ArrowRight className="w-5 h-5 animate-pulse text-purple-400" />
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/30">
            <Cpu className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <div className="text-xs font-bold text-white">NVIDIA GPU / Jetson</div>
            <div className="text-[11px] text-purple-300 mt-1">YOLOv8 + Pose Model</div>
          </div>

          <div className="hidden md:flex justify-center text-slate-500">
            <ArrowRight className="w-5 h-5 animate-pulse text-purple-400" />
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
            <Volume2 className="w-8 h-8 text-rose-400 mx-auto mb-2" />
            <div className="text-xs font-bold text-white">USB Loudspeaker</div>
            <div className="text-[11px] text-slate-400 mt-1">Immediate On-Site Siren</div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 space-x-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Layers className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-white">React.js & Tailwind Dashboard</div>
              <div className="text-[11px] text-slate-400">Real-time MJPEG live stream & violation evidence gallery</div>
            </div>
          </div>

          <div className="flex items-center p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 space-x-3">
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-white">AWS S3 + Twilio / SendGrid</div>
              <div className="text-[11px] text-slate-400">Encrypted cloud archiving & SMS supervisor alerts</div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Deployment Cost Estimator */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center">
              <Calculator className="w-5 h-5 mr-2 text-emerald-400" />
              Interactive Deployment Estimator
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Adjust cameras and hardware tiers to model deployment CapEx and OpEx.
            </p>
          </div>
          <div className="flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300">
            <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
            <span>Exchange rate baseline: ~₹ 83 / USD</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls */}
          <div className="lg:col-span-2 space-y-5">
            <div>
              <div className="flex justify-between text-sm font-medium mb-1.5">
                <span className="text-slate-300">CCTV Camera Count</span>
                <span className="text-blue-400 font-bold">{cameraCount} {cameraCount === 1 ? 'Camera' : 'Cameras'}</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="16" 
                value={cameraCount} 
                onChange={(e) => setCameraCount(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>1 Camera (Pilot)</span>
                <span>4 Cameras</span>
                <span>8 Cameras</span>
                <span>16 Cameras (Factory Floor)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/60">
                <label className="text-xs font-semibold text-slate-300 block mb-2">GPU Server Specification</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setGpuTier('entry')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                      gpuTier === 'entry' 
                        ? 'bg-purple-600 text-white border-purple-500' 
                        : 'bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600'
                    }`}
                  >
                    Entry (₹1.2L)
                  </button>
                  <button 
                    onClick={() => setGpuTier('enterprise')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                      gpuTier === 'enterprise' 
                        ? 'bg-purple-600 text-white border-purple-500' 
                        : 'bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600'
                    }`}
                  >
                    Enterprise (₹2.5L)
                  </button>
                </div>
              </div>

              <div className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-300 block">Include Edge Jetson Nano</span>
                  <span className="text-[11px] text-slate-400">+₹22,000 per unit</span>
                </div>
                <button 
                  onClick={() => setIncludeEdgeDevice(!includeEdgeDevice)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    includeEdgeDevice ? 'bg-indigo-600' : 'bg-slate-700'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    includeEdgeDevice ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm font-medium mb-1.5">
                <span className="text-slate-300">Cloud Storage & Retention Horizon</span>
                <span className="text-rose-400 font-bold">{cloudMonths} Months</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="36" 
                value={cloudMonths} 
                onChange={(e) => setCloudMonths(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
            </div>
          </div>

          {/* Calculation Card */}
          <div className="p-6 bg-gradient-to-b from-slate-800/80 to-slate-900 rounded-xl border border-slate-700/80 flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Estimated Project Budget
              </div>
              <div className="text-3xl font-extrabold text-white mt-2">
                ₹ {totalHardwareCapEx.toLocaleString('en-IN')}
              </div>
              <div className="text-xs text-emerald-400 font-medium mt-1">One-time Hardware CapEx</div>

              <div className="mt-6 space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-700/40">
                  <span className="text-slate-400">Cameras ({cameraCount}x)</span>
                  <span className="font-semibold text-slate-200">₹ {(cameraCount * cameraUnitCost).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-700/40">
                  <span className="text-slate-400">GPU Server</span>
                  <span className="font-semibold text-slate-200">₹ {gpuCost.toLocaleString('en-IN')}</span>
                </div>
                {includeEdgeDevice && (
                  <div className="flex justify-between py-1 border-b border-slate-700/40">
                    <span className="text-slate-400">Edge Devices ({cameraCount}x)</span>
                    <span className="font-semibold text-slate-200">₹ {(edgeUnitCost * cameraCount).toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between py-1 border-b border-slate-700/40">
                  <span className="text-slate-400">AI Software Stack</span>
                  <span className="font-semibold text-emerald-400">₹ 0/- (Free)</span>
                </div>
                <div className="flex justify-between py-1 pt-2">
                  <span className="text-slate-400">Cloud OpEx ({cloudMonths} mo)</span>
                  <span className="font-semibold text-rose-300">₹ {totalCloudOpEx.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-700/70">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Monthly Run-rate:</span>
                <span className="text-sm font-bold text-white">~₹ {cloudMonthlyCost.toLocaleString('en-IN')} / mo</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
