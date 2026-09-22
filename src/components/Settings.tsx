import React from 'react';
import { 
  Camera, 
  Bell, 
  Cpu, 
  Shield, 
  Database, 
  Globe,
  Save
} from 'lucide-react';

const SettingSection = ({ title, description, children }: any) => (
  <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
    <div className="mb-6">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-slate-400 mt-1">{description}</p>
    </div>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

const Toggle = ({ label, enabled }: { label: string, enabled: boolean }) => (
  <div className="flex items-center justify-between py-2">
    <span className="text-sm font-medium text-slate-300">{label}</span>
    <button className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${enabled ? 'bg-blue-600' : 'bg-slate-700'}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  </div>
);

export const Settings: React.FC = () => {
  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">System Settings</h1>
        <button className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <SettingSection 
          title="AI Configuration" 
          description="Manage detection sensitivity and model parameters."
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Detection Sensitivity</label>
              <input type="range" className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500" />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>Low (Fast)</span>
                <span>Balanced</span>
                <span>High (Accurate)</span>
              </div>
            </div>
            <Toggle label="Enable Multi-Worker Tracking" enabled={true} />
            <Toggle label="Detect Unauthorized PPE Types" enabled={false} />
          </div>
        </SettingSection>

        <SettingSection 
          title="Camera & Feed" 
          description="Configure video input sources and stream quality."
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Primary Stream URL</label>
                <input 
                  type="text" 
                  defaultValue="rtsp://192.168.1.100:554/stream1"
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Stream Quality</label>
                <select className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>1080p (60 FPS)</option>
                  <option>720p (30 FPS)</option>
                  <option>480p (15 FPS)</option>
                </select>
              </div>
            </div>
            <Toggle label="Enable Edge Processing" enabled={true} />
          </div>
        </SettingSection>

        <SettingSection 
          title="Notifications" 
          description="Configure how and when you receive safety alerts."
        >
          <div className="space-y-2">
            <Toggle label="Push Notifications" enabled={true} />
            <Toggle label="Email Summaries (Daily)" enabled={true} />
            <Toggle label="SMS Alerts for Critical Violations" enabled={false} />
            <Toggle label="Sound Alerts on Dashboard" enabled={true} />
          </div>
        </SettingSection>
      </div>
    </div>
  );
};
