
import React, { useState, useEffect, useMemo } from 'react';
import { User, Complaint, ComplaintStatus, ComplaintCategory, ComplaintPriority } from '../types';
import { db } from '../services/databaseService';
import { analyzeComplaint } from '../services/geminiService';
import { 
  Search, Loader2, Sparkles, X, CheckCircle, ShieldCheck, 
  RotateCcw, BarChart3, PieChart as PieChartIcon, 
  ChevronRight, Filter, BrainCircuit, MessageSquareQuote,
  Activity, ArrowUpRight, TrendingUp
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';

interface AdminDashboardProps {
  user: User;
}

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // States for the Processing Modal
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [remarks, setRemarks] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [newStatus, setNewStatus] = useState<ComplaintStatus>(ComplaintStatus.PENDING);
  const [isVerified, setIsVerified] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const all = await db.getComplaints();
    setComplaints(all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    setIsLoading(false);
  };

  const handleAiAnalysis = async () => {
    if (!selectedComplaint) return;
    setIsAiLoading(true);
    const insight = await analyzeComplaint(selectedComplaint.subject, selectedComplaint.description);
    if (insight) {
      setRemarks(`Based on initial review: ${insight.summary}. Action: ${insight.suggestedAction}`);
      setReviewNotes(`AI Suggestion (${insight.recommendedTone}): ${insight.suggestedAction}`);
    }
    setIsAiLoading(false);
  };

  const openProcessModal = (c: Complaint) => {
    setSelectedComplaint(c);
    setNewStatus(c.status);
    setRemarks(c.remarks || '');
    setReviewNotes(c.reviewNotes || '');
    setIsVerified(c.isVerified || false);
  };

  const handleUpdate = async () => {
    if (!selectedComplaint) return;
    setIsUpdating(true);
    const updated: Complaint = {
      ...selectedComplaint,
      status: newStatus,
      remarks: remarks,
      reviewNotes: reviewNotes,
      isVerified: isVerified,
      updatedAt: new Date().toISOString()
    };
    try {
      await db.updateComplaint(updated);
      await fetchData();
      setSelectedComplaint(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const chartData = useMemo(() => {
    const categories = Object.values(ComplaintCategory);
    return categories.map(cat => ({
      name: cat,
      value: complaints.filter(c => c.category === cat).length
    })).filter(d => d.value > 0);
  }, [complaints]);

  const stats = [
    { label: 'Total Requests', count: complaints.length, icon: Activity, color: 'indigo' },
    { label: 'Pending Action', count: complaints.filter(c => [ComplaintStatus.SUBMITTED, ComplaintStatus.PENDING].includes(c.status)).length, icon: TrendingUp, color: 'amber' },
    { label: 'In Progress', count: complaints.filter(c => c.status === ComplaintStatus.IN_PROGRESS).length, icon: RotateCcw, color: 'blue' },
    { label: 'Resolved Today', count: complaints.filter(c => c.status === ComplaintStatus.RESOLVED).length, icon: CheckCircle, color: 'emerald' },
  ];

  const filtered = complaints.filter(c => {
    const matchesSearch = c.subject.toLowerCase().includes(search.toLowerCase()) || c.studentName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All Status' || c.status === statusFilter;
    const matchesCategory = categoryFilter === 'All Categories' || c.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-100 rounded-full animate-spin border-t-indigo-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-indigo-600" />
          </div>
        </div>
        <p className="text-slate-500 font-medium animate-pulse">Synchronizing secure data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700">
      {/* Header with quick stats */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Administrative Suite</h1>
          <p className="text-slate-500 mt-1">Grievance monitoring and institutional oversight</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
            <RotateCcw className="w-4 h-4" /> Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100">
            <ArrowUpRight className="w-4 h-4" /> Export Report
          </button>
        </div>
      </header>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {stats.map((s, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center gap-5">
            <div className={`p-4 rounded-2xl bg-${s.color}-50 text-${s.color}-600`}>
              <s.icon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">{s.count}</div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Charts Section */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" /> Volume by Category
            </h3>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Breakdown Pie */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center">
          <h3 className="text-lg font-bold text-slate-900 w-full mb-8 flex items-center gap-2">
             <PieChartIcon className="w-5 h-5 text-indigo-600" /> Urgency Distribution
          </h3>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4 w-full">
             {chartData.slice(0, 4).map((d, i) => (
               <div key={i} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: COLORS[i]}} />
                  <span className="text-xs font-semibold text-slate-600 truncate">{d.name}</span>
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* Main List & Filters */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/30">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search student or subject..."
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 transition-all text-sm font-medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-3 w-full md:w-auto">
             <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 md:w-40 px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none"
            >
              <option>All Status</option>
              {Object.values(ComplaintStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="flex-1 md:w-40 px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none"
            >
              <option>All Categories</option>
              {Object.values(ComplaintCategory).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Case Details</th>
                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Student</th>
                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Urgency</th>
                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Current Status</th>
                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(c => (
                <React.Fragment key={c.id}>
                  <tr className={`hover:bg-slate-50/50 transition-colors group ${expandedId === c.id ? 'bg-indigo-50/20' : ''}`}>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{c.subject}</span>
                        <span className="text-xs font-medium text-slate-400 mt-0.5">{c.category} • {c.id}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold uppercase">
                          {c.studentName.slice(0, 2)}
                        </div>
                        <span className="text-sm font-semibold text-slate-700">{c.studentName}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        c.priority === ComplaintPriority.URGENT ? 'bg-red-100 text-red-700' :
                        c.priority === ComplaintPriority.HIGH ? 'bg-orange-100 text-orange-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {c.priority.split(' ')[0]}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                       <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        c.status === ComplaintStatus.RESOLVED ? 'bg-emerald-100 text-emerald-700' :
                        c.status === ComplaintStatus.IN_PROGRESS ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          c.status === ComplaintStatus.RESOLVED ? 'bg-emerald-500' : 'bg-amber-500'
                        }`} />
                        {c.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
                        className="p-2 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all"
                      >
                        <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${expandedId === c.id ? 'rotate-90 text-indigo-600' : ''}`} />
                      </button>
                    </td>
                  </tr>
                  {expandedId === c.id && (
                    <tr className="bg-indigo-50/20">
                      <td colSpan={5} className="px-8 pb-8 animate-in slide-in-from-top-2 duration-300">
                        <div className="bg-white rounded-2xl border border-indigo-100 p-8 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                            <div>
                              <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-[2px] mb-3">Complaint Narrative</h5>
                              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50/50 p-5 rounded-2xl italic border-l-4 border-indigo-200">
                                "{c.description}"
                              </p>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-400">
                              <Activity className="w-3.5 h-3.5" />
                              Last activity: {c.updatedAt ? new Date(c.updatedAt).toLocaleString() : new Date(c.createdAt).toLocaleString()}
                            </div>
                          </div>
                          
                          <div className="flex flex-col justify-end gap-4">
                            <div className="bg-slate-50 p-4 rounded-2xl">
                               <h5 className="text-[10px] font-bold text-slate-400 uppercase mb-2">Previous Response</h5>
                               <p className="text-sm font-medium text-slate-600">{c.remarks || "No official response issued yet."}</p>
                            </div>
                            <button 
                              onClick={() => openProcessModal(c)}
                              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-indigo-100 transition-all"
                            >
                              <Filter className="w-5 h-5" /> Take Action & Update Case
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modern Action Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-600 text-white rounded-2xl">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">Case Resolution Panel</h3>
                  <p className="text-sm text-slate-500 font-medium">Editing: {selectedComplaint.id}</p>
                </div>
              </div>
              <button onClick={() => setSelectedComplaint(null)} className="p-2 hover:bg-white rounded-full border border-slate-200 transition-all">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Form Section */}
              <div className="lg:col-span-7 space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Lifecycle Phase</label>
                    <select 
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as ComplaintStatus)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold outline-none focus:ring-4 focus:ring-indigo-50 focus:bg-white transition-all"
                    >
                      {Object.values(ComplaintStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-3 cursor-pointer bg-slate-50 hover:bg-slate-100 px-5 py-3 rounded-2xl w-full transition-colors border border-slate-200">
                      <input 
                        type="checkbox" 
                        checked={isVerified}
                        onChange={(e) => setIsVerified(e.target.checked)}
                        className="w-5 h-5 rounded-lg text-indigo-600 focus:ring-indigo-500 border-slate-300"
                      />
                      <span className="text-sm font-bold text-slate-700">Official Verification</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Public University Feedback</label>
                  <textarea 
                    rows={4}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-[24px] text-sm font-medium outline-none focus:ring-4 focus:ring-indigo-50 focus:bg-white transition-all"
                    placeholder="This response will be visible to the student..."
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Internal Investigation Logs</label>
                  <textarea 
                    rows={3}
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-[24px] text-sm font-medium outline-none focus:ring-4 focus:ring-indigo-50 focus:bg-white transition-all border-dashed"
                    placeholder="Confidential administrative notes..."
                  />
                </div>
              </div>

              {/* AI Insight Sidebar */}
              <div className="lg:col-span-5">
                <div className="bg-indigo-50/50 rounded-[32px] p-8 border border-indigo-100 h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-indigo-600 rounded-lg">
                      <BrainCircuit className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="text-lg font-bold text-indigo-900">AI Investigator</h4>
                  </div>
                  
                  <p className="text-xs font-semibold text-indigo-700/70 mb-6 leading-relaxed">
                    Deploy Gemini Intelligence to analyze the narrative and generate a professional response.
                  </p>

                  <button 
                    onClick={handleAiAnalysis}
                    disabled={isAiLoading}
                    className="w-full flex items-center justify-center gap-2 bg-white border border-indigo-200 py-3.5 rounded-2xl text-indigo-600 font-extrabold text-sm hover:bg-indigo-600 hover:text-white transition-all mb-8 shadow-sm"
                  >
                    {isAiLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                    {isAiLoading ? 'Analyzing Case...' : 'Generate Case Summary'}
                  </button>

                  <div className="flex-1 space-y-6">
                    <div className="p-4 bg-white rounded-2xl border border-indigo-100 shadow-sm">
                       <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                         <MessageSquareQuote className="w-3.5 h-3.5" /> Case Insight
                       </h5>
                       <p className="text-xs text-slate-600 leading-relaxed font-medium">
                         {remarks ? "Analysis applied to response field." : "Waiting for analysis request..."}
                       </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-10 border-t border-slate-50 bg-slate-50/50 flex gap-4">
              <button onClick={() => setSelectedComplaint(null)} className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 font-extrabold rounded-2xl hover:bg-slate-100 transition-all text-sm">
                Discard Changes
              </button>
              <button 
                onClick={handleUpdate}
                disabled={isUpdating}
                className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-3 text-sm"
              >
                {isUpdating && <Loader2 className="w-5 h-5 animate-spin" />}
                {isUpdating ? 'Finalizing Case...' : 'Commit Updates & Notify Student'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
