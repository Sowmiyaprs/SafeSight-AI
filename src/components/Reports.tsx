import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Plus, 
  History, 
  ShieldCheck,
  Calendar,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { Report } from '../types';
import { cn } from '../utils';

export const Reports: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch('/api/reports');
        const data = await response.json();
        setReports(data);
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Safety Reports</h1>
        <div className="flex gap-2">
          <button className="flex items-center px-4 py-2 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white rounded-lg transition-colors text-sm font-medium">
            <Download className="w-4 h-4 mr-2" />
            Insurance Export
          </button>
          <button className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium">
            <Plus className="w-4 h-4 mr-2" />
            Generate Report
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-600/20 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-blue-500" />
            </div>
            <span className="text-xs font-bold text-emerald-500">+4.2%</span>
          </div>
          <h3 className="text-slate-400 text-sm font-medium">Compliance Score</h3>
          <p className="text-2xl font-bold mt-1">96.8%</p>
          <p className="text-xs text-slate-500 mt-2">Above industry average (85%)</p>
        </div>
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-amber-600/20 rounded-lg">
              <Calendar className="w-5 h-5 text-amber-500" />
            </div>
            <span className="text-xs font-bold text-slate-400">Monthly</span>
          </div>
          <h3 className="text-slate-400 text-sm font-medium">Total Inspections</h3>
          <p className="text-2xl font-bold mt-1">1,420</p>
          <p className="text-xs text-slate-500 mt-2">24 inspections per day avg</p>
        </div>
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-rose-600/20 rounded-lg">
              <History className="w-5 h-5 text-rose-500" />
            </div>
            <span className="text-xs font-bold text-rose-500">-12%</span>
          </div>
          <h3 className="text-slate-400 text-sm font-medium">Incident Rate</h3>
          <p className="text-2xl font-bold mt-1">0.42</p>
          <p className="text-xs text-slate-500 mt-2">Per 1,000 work hours</p>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Previous Reports</h3>
          <div className="text-sm text-slate-400">Total: {reports.length}</div>
        </div>
        <div className="divide-y divide-slate-800">
          {reports.map((report) => (
            <div key={report.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-slate-800 rounded-lg">
                  <FileText className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">{report.name}</p>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className="text-xs text-slate-500">{report.date}</span>
                    <span className="text-xs px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded border border-slate-700 uppercase tracking-tighter font-bold">
                      {report.type}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className={cn(
                  "text-xs font-medium px-2 py-1 rounded-full",
                  report.status === 'Ready' ? "text-emerald-500 bg-emerald-500/10" : "text-amber-500 bg-amber-500/10 animate-pulse"
                )}>
                  {report.status}
                </span>
                <button className="p-2 text-slate-400 hover:text-white transition-colors">
                  <Download className="w-4 h-4" />
                </button>
                <button className="p-2 text-slate-400 hover:text-white transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
