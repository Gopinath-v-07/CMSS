
import React, { useState, useEffect } from 'react';
import { User, Complaint, ComplaintStatus, ComplaintCategory, ComplaintPriority } from '../types';
import { db } from '../services/databaseService';
// Added missing X icon to the imports from lucide-react
import { 
  Plus, MessageSquare, Clock, CheckCircle, ShieldCheck, 
  Filter, Loader2, Info, ChevronRight, FileText, 
  AlertCircle, LayoutDashboard, History, Zap, X
} from 'lucide-react';

interface StudentDashboardProps {
  user: User;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user }) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  // Form states
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>(ComplaintCategory.HOSTEL);
  const [priority, setPriority] = useState<ComplaintPriority>(ComplaintPriority.LOW);
  
  const [filter, setFilter] = useState<ComplaintStatus | 'All'>('All');

  useEffect(() => {
    fetchComplaints();
  }, [user.id]);

  const fetchComplaints = async () => {
    setIsLoading(true);
    const all = await db.getComplaints();
    setComplaints(all.filter(c => c.studentId === user.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const newComplaint: Complaint = {
      id: `C-${Date.now()}`,
      studentId: user.id,
      studentName: user.name,
      subject,
      description,
      status: ComplaintStatus.SUBMITTED,
      category,
      priority,
      remarks: '',
      createdAt: new Date().toISOString()
    };
    
    try {
      await db.saveComplaint(newComplaint);
      await fetchComplaints();
      setSubject('');
      setDescription('');
      setShowForm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredComplaints = filter === 'All' 
    ? complaints 
    : complaints.filter(c => c.status === filter);

  const getStatusColor = (status: ComplaintStatus) => {
    switch (status) {
      case ComplaintStatus.SUBMITTED: return "text-blue-600 bg-blue-50";
      case ComplaintStatus.RESOLVED: return "text-emerald-600 bg-emerald-50";
      case ComplaintStatus.IN_PROGRESS: return "text-indigo-600 bg-indigo-50";
      default: return "text-slate-500 bg-slate-50";
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-500">
      {/* Dynamic Welcome Header */}
      <div className="relative overflow-hidden bg-white p-8 md:p-12 rounded-[32px] border border-slate-100 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Hello, {user.name.split(' ')[0]}</h2>
            <p className="text-slate-500 mt-2 font-medium">Your university support hub. We're here to listen and resolve.</p>
            <div className="flex gap-4 mt-6">
              <div className="px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
                 <span className="text-xl font-bold text-slate-900">{complaints.length}</span>
                 <span className="text-xs font-bold text-slate-400 uppercase ml-2 tracking-widest">Total Cases</span>
              </div>
              <div className="px-4 py-2 bg-emerald-50 rounded-2xl border border-emerald-100">
                 <span className="text-xl font-bold text-emerald-700">{complaints.filter(c => c.status === ComplaintStatus.RESOLVED).length}</span>
                 <span className="text-xs font-bold text-emerald-400 uppercase ml-2 tracking-widest">Resolved</span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setShowForm(!showForm)}
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black transition-all shadow-xl ${
              showForm 
                ? 'bg-slate-100 text-slate-600 shadow-slate-100 hover:bg-slate-200' 
                : 'bg-indigo-600 text-white shadow-indigo-100 hover:bg-indigo-700 hover:scale-[1.02]'
            }`}
          >
            {showForm ? <X className="w-5 h-5" /> : <Plus className="w-6 h-6" />}
            {showForm ? 'Cancel Submission' : 'Submit New Grievance'}
          </button>
        </div>
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 p-24 bg-indigo-50 rounded-full blur-3xl opacity-50"></div>
      </div>

      {/* Modern Submission Form */}
      {showForm && (
        <div className="bg-white rounded-[32px] p-10 border border-indigo-100 shadow-2xl animate-in slide-in-from-top-4 duration-500 relative overflow-hidden">
          <div className="flex items-center gap-3 mb-8">
             <div className="p-2 bg-indigo-600 rounded-xl">
               <Zap className="w-5 h-5 text-white" />
             </div>
             <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Case Details</h3>
          </div>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-2">
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Case Subject</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 focus:bg-white transition-all font-semibold"
                  placeholder="Summarize the core issue (e.g., Library WiFi Downtime)"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Service Area</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 focus:bg-white transition-all font-semibold appearance-none"
                >
                  {Object.values(ComplaintCategory).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Urgency Rating</label>
                <select 
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as ComplaintPriority)}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 focus:bg-white transition-all font-semibold appearance-none"
                >
                  {Object.values(ComplaintPriority).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Narrative Description</label>
              <textarea 
                required
                rows={5}
                className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-[28px] outline-none focus:ring-4 focus:ring-indigo-50 focus:bg-white transition-all font-medium resize-none"
                placeholder="Provide specific details, dates, and names if applicable..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="flex justify-end pt-4">
              <button 
                type="submit"
                disabled={isSubmitting}
                className="bg-slate-900 hover:bg-black text-white px-12 py-5 rounded-2xl font-black shadow-2xl transition-all flex items-center gap-3 disabled:opacity-50 group"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />}
                {isSubmitting ? 'Transmitting Data...' : 'Submit to Administration'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* History Grid */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
             <History className="w-6 h-6 text-indigo-600" /> Resolution History
          </h3>
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm">
            <Filter className="w-4 h-4 text-slate-400" />
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="bg-transparent text-sm font-bold text-slate-600 outline-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              {Object.values(ComplaintStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isLoading ? (
            <div className="col-span-full py-32 text-center">
               <div className="w-12 h-12 border-4 border-indigo-100 rounded-full animate-spin border-t-indigo-600 mx-auto mb-4"></div>
               <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Retrieving case records...</p>
            </div>
          ) : filteredComplaints.length > 0 ? (
            filteredComplaints.map(c => (
              <div key={c.id} className="group bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
                <div className="flex justify-between items-start mb-6">
                   <div className={`p-3 rounded-2xl ${getStatusColor(c.status)}`}>
                      <FileText className="w-6 h-6" />
                   </div>
                   <div className="flex flex-col items-end">
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">{c.id}</span>
                      <span className="text-xs font-bold text-slate-400">{new Date(c.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                   </div>
                </div>
                
                <h4 className="text-xl font-extrabold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">{c.subject}</h4>
                <div className="flex flex-wrap gap-2 mb-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusColor(c.status)}`}>
                      {c.status}
                    </span>
                    <span className="px-3 py-1 bg-slate-50 text-slate-400 rounded-full text-[10px] font-black uppercase tracking-wider">
                      {c.category}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      c.priority === ComplaintPriority.URGENT ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-600'
                    }`}>
                      {c.priority}
                    </span>
                </div>

                <p className="text-sm text-slate-500 line-clamp-3 mb-8 font-medium italic">
                  "{c.description}"
                </p>
                
                <div className="mt-auto">
                  {c.remarks ? (
                    <div className="p-6 bg-indigo-50/50 rounded-[24px] border border-indigo-100 relative">
                      <div className="absolute -top-3 left-6 px-3 py-1 bg-indigo-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 flex items-center gap-1.5">
                        <Info className="w-3 h-3" /> Official Update
                      </div>
                      <p className="text-sm text-indigo-900 font-bold leading-relaxed">
                        {c.remarks}
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 px-6 py-4 bg-slate-50 rounded-[24px] text-slate-400">
                       <Clock className="w-5 h-5" />
                       <span className="text-xs font-bold uppercase tracking-widest">Awaiting Admin Response</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-40 bg-slate-50/50 rounded-[40px] border-4 border-dashed border-slate-200">
              <div className="max-w-xs mx-auto space-y-4">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                   <LayoutDashboard className="w-10 h-10 text-slate-200" />
                </div>
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest">Records Clean</h3>
                <p className="text-sm text-slate-400 font-medium">You haven't initiated any grievance requests. Use the button above to start.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
