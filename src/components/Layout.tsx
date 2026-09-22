import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Video, 
  AlertTriangle, 
  FileText, 
  Settings, 
  Menu, 
  X, 
  Bell, 
  User,
  Search,
  HardHat,
  Layers
} from 'lucide-react';
import { cn } from '../utils';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

interface SidebarItemProps {
  icon: any;
  label: string;
  active: boolean;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ 
  icon: Icon, 
  label, 
  active, 
  onClick 
}) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center w-full px-4 py-3 text-sm font-medium transition-colors rounded-lg group",
      active 
        ? "bg-blue-600 text-white" 
        : "text-slate-400 hover:bg-slate-800 hover:text-white"
    )}
  >
    <Icon className={cn("w-5 h-5 mr-3", active ? "text-white" : "text-slate-400 group-hover:text-white")} />
    {label}
  </button>
);

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'live', label: 'Live Monitoring', icon: Video },
    { id: 'violations', label: 'Violations', icon: AlertTriangle },
    { id: 'costs', label: 'Architecture & Costs', icon: Layers },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 transition-transform lg:relative lg:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="flex items-center h-16 px-6 border-b border-slate-800">
            <HardHat className="w-8 h-8 text-blue-500 mr-2" />
            <span className="text-xl font-bold tracking-tight">SafeSight <span className="text-blue-500">AI</span></span>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {menuItems.map((item) => (
              <SidebarItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                active={activeTab === item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsSidebarOpen(false);
                }}
              />
            ))}
          </nav>

          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center p-2 space-x-3 rounded-lg bg-slate-800/50">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold">JD</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">John Doe</p>
                <p className="text-xs text-slate-400 truncate">Safety Manager</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between h-16 px-6 bg-slate-900 border-b border-slate-800 shrink-0">
          <div className="flex items-center">
            <button 
              className="p-2 mr-4 text-slate-400 lg:hidden hover:text-white"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search analytics..." 
                className="w-64 pl-10 pr-4 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-900"></span>
            </button>
            <button className="p-2 text-slate-400 hover:text-white transition-colors">
              <User className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Viewport */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-950">
          {children}
        </main>
      </div>
    </div>
  );
};
