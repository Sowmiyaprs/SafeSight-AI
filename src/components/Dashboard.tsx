import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Loader2
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { cn } from '../utils';
import { Violation } from '../types';

const StatCard = ({ title, value, change, trend, icon: Icon, color }: any) => (
  <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <div className={cn("p-2 rounded-lg", color)}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className={cn(
        "flex items-center text-xs font-medium",
        trend === 'up' ? "text-emerald-400" : "text-rose-400"
      )}>
        {trend === 'up' ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
        {change}
      </div>
    </div>
    <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
    <p className="text-2xl font-bold mt-1">{value}</p>
  </div>
);

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, violationsRes] = await Promise.all([
          fetch('/api/stats'),
          fetch('/api/violations')
        ]);
        
        const statsData = await statsRes.json();
        const violationsData = await violationsRes.json();
        
        setData(statsData);
        setViolations(violationsData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  const { stats, trend } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Safety Overview</h1>
        <div className="text-sm text-slate-400">Last updated: Just now</div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Workers Detected" 
          value={stats.totalWorkers} 
          change={stats.trends.workers} 
          trend="up" 
          icon={Users} 
          color="bg-blue-600"
        />
        <StatCard 
          title="Helmet Compliance" 
          value={stats.helmetCompliance} 
          change={stats.trends.compliance} 
          trend="up" 
          icon={CheckCircle2} 
          color="bg-emerald-600"
        />
        <StatCard 
          title="Violations Today" 
          value={stats.violationsToday} 
          change={stats.trends.violations} 
          trend="down" 
          icon={AlertCircle} 
          color="bg-rose-600"
        />
        <StatCard 
          title="Reports Generated" 
          value={stats.reportsGenerated} 
          change={stats.trends.reports} 
          trend="up" 
          icon={BarChart3} 
          color="bg-amber-600"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Chart */}
        <div className="lg:col-span-2 p-6 bg-slate-900 border border-slate-800 rounded-xl">
          <h3 className="text-lg font-semibold mb-6">Helmet Compliance Trend</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="time" 
                  stroke="#94a3b8" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                  itemStyle={{ color: '#3b82f6' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="compliance" 
                  stroke="#3b82f6" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#0f172a' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Violations */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Recent Violations</h3>
            <button className="text-sm text-blue-500 hover:underline">View all</button>
          </div>
          <div className="space-y-4">
            {violations.slice(0, 4).map((violation) => (
              <div key={violation.id} className="flex items-start space-x-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <div className={cn(
                  "mt-1 w-2 h-2 rounded-full shrink-0",
                  violation.status === 'Critical' ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" : 
                  violation.status === 'Warning' ? "bg-amber-500" : "bg-emerald-500"
                )} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{violation.type}</p>
                  <p className="text-xs text-slate-400 truncate">{violation.location}</p>
                  <p className="text-[10px] text-slate-500 mt-1">{violation.time}</p>
                </div>
                <div className="text-xs font-mono text-slate-500">{violation.workerId}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
