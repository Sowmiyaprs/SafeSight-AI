import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Eye,
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  X,
  AlertTriangle,
  Calendar,
  MapPin,
  HardHat
} from 'lucide-react';
import { cn } from '../utils';

export const Violations: React.FC = () => {
  const [violations, setViolations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [activeEvidenceModal, setActiveEvidenceModal] = useState<any | null>(null);

  useEffect(() => {
    const fetchViolations = async () => {
      try {
        const response = await fetch('/api/violations');
        if (response.ok) {
          const data = await response.json();
          setViolations(data);
        }
      } catch (error) {
        console.error("Error fetching violations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchViolations();
  }, []);

  const filteredViolations = violations.filter(v => {
    const matchesSearch = 
      (v.workerId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.location || '').toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesLocation = 
      selectedLocation === 'All Locations' || 
      (v.location || '').includes(selectedLocation);

    return matchesSearch && matchesLocation;
  });

  // Export violations as CSV
  const handleExportCSV = () => {
    if (filteredViolations.length === 0) return;
    const headers = ['Violation ID', 'Timestamp', 'Worker ID', 'Type', 'Location', 'Status', 'Image Evidence'];
    const rows = filteredViolations.map(v => [
      v.id,
      v.time,
      v.workerId,
      v.type,
      `"${v.location}"`,
      v.status,
      v.thumbnail || ''
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `safesight_violations_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-3">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-xs text-slate-400">Loading safety violation records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Safety Violations & Evidence Vault</h1>
          <p className="text-xs text-slate-400 mt-0.5">Recorded PPE compliance incidents with photographic proof</p>
        </div>
        <button 
          onClick={handleExportCSV}
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors text-sm font-semibold shadow-sm"
        >
          <Download className="w-4 h-4 mr-2" />
          Export Audit CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 p-4 bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search by worker ID, location, or violation type..." 
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-100"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select 
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-xl text-sm px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>All Locations</option>
            <option>Zone A</option>
            <option>Zone B</option>
            <option>Zone C</option>
            <option>Zone D</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/60 border-b border-slate-800">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Evidence Preview</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Incident Time</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Worker ID</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Violation Type</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Zone Location</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Severity</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredViolations.length > 0 ? (
                filteredViolations.map((violation) => (
                  <tr key={violation.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-3">
                      {violation.thumbnail ? (
                        <div 
                          className="w-16 h-10 rounded-lg overflow-hidden border border-slate-700 cursor-pointer relative group bg-black"
                          onClick={() => setActiveEvidenceModal(violation)}
                        >
                          <img 
                            src={violation.thumbnail} 
                            alt="Evidence" 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform" 
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Eye className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-16 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-600 text-[10px]">
                          No Image
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300 font-mono">{violation.time}</td>
                    <td className="px-6 py-4 text-sm font-bold text-blue-400">{violation.workerId}</td>
                    <td className="px-6 py-4 text-sm font-medium text-white flex items-center pt-5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-500 mr-2 shrink-0" />
                      {violation.type}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">{violation.location}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold",
                        violation.status === 'Critical' ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                        violation.status === 'Warning' ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                        "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      )}>
                        {violation.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setActiveEvidenceModal(violation)}
                        className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                        title="View Full Resolution Evidence"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500 text-sm">
                    No violation records match your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-6 py-4 bg-slate-800/30 border-t border-slate-800 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            Displaying <span className="font-semibold text-white">{filteredViolations.length}</span> logged incidents
          </p>
          <div className="flex items-center space-x-2">
            <button className="p-1.5 bg-slate-800 border border-slate-700 rounded-lg disabled:opacity-50 text-slate-400" disabled>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="p-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* High-Resolution Evidence Modal */}
      {activeEvidenceModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <HardHat className="w-5 h-5 text-rose-500" />
                <h3 className="font-bold text-white text-base">Violation Proof: {activeEvidenceModal.id}</h3>
              </div>
              <button 
                onClick={() => setActiveEvidenceModal(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-black flex items-center justify-center">
              <img 
                src={activeEvidenceModal.thumbnail} 
                alt="Full Resolution Evidence" 
                className="max-h-[420px] w-auto object-contain rounded-lg border border-slate-800" 
              />
            </div>

            <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs border-t border-slate-800 bg-slate-900/60">
              <div>
                <span className="text-slate-500 block">Worker</span>
                <span className="font-bold text-blue-400">{activeEvidenceModal.workerId}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Timestamp</span>
                <span className="font-mono text-slate-200">{activeEvidenceModal.time}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Location</span>
                <span className="text-slate-200">{activeEvidenceModal.location}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Status</span>
                <span className="text-rose-400 font-bold">{activeEvidenceModal.status}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
