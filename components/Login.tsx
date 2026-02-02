
import React, { useState } from 'react';
import { User } from '../types';
import { db } from '../services/databaseService';
import { LogIn, Key, Mail, AlertCircle, Loader2, ShieldCheck, ChevronRight } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
  onNavigateToRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, onNavigateToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const users = await db.getUsers();
      const user = users.find(u => u.email === email && u.password === password);
      
      if (user) {
        await db.setCurrentUser(user);
        onLoginSuccess(user);
      } else {
        setError('Invalid credentials. Please verify your identity.');
      }
    } catch (err) {
      setError('Connection disrupted. Retry authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="px-10 pt-12 pb-10 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-20 bg-indigo-600/20 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="p-4 bg-indigo-600 rounded-[20px] mb-6 shadow-xl shadow-indigo-900/40">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-black tracking-tight mb-2 uppercase tracking-widest">EduResolve</h2>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-[3px]">Institutional Secure Login</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="p-10 space-y-8 bg-white">
        {error && (
          <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-600 animate-in shake duration-300">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-xs font-bold uppercase tracking-wider">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          <div className="group">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-indigo-600 transition-colors">Official Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-50 outline-none transition-all disabled:opacity-50 font-semibold text-slate-700 placeholder:text-slate-300"
                placeholder="name@university.edu"
              />
            </div>
          </div>

          <div className="group">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-indigo-600 transition-colors">Access Key</label>
            <div className="relative">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-50 outline-none transition-all disabled:opacity-50 font-semibold text-slate-700 placeholder:text-slate-300"
                placeholder="••••••••"
              />
            </div>
          </div>
        </div>

        <button 
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-[24px] transition-all shadow-xl shadow-indigo-100 disabled:opacity-70 group"
        >
          {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <LogIn className="w-6 h-6 group-hover:translate-x-1 transition-transform" />}
          <span className="uppercase tracking-[2px] text-sm">{isLoading ? 'Validating...' : 'Authorize Session'}</span>
        </button>

        <div className="text-center">
          <button 
            type="button"
            onClick={onNavigateToRegister}
            disabled={isLoading}
            className="text-xs text-slate-400 hover:text-indigo-600 font-black uppercase tracking-widest transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mx-auto"
          >
            Request New Enrollment <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;
