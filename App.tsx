
import React, { useState, useEffect } from 'react';
import { User, Role, AuthState } from './types';
import { db } from './services/databaseService';
import Login from './components/Login';
import Register from './components/Register';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';
import { LogOut, Loader2, ShieldCheck, UserCircle, Bell, Settings } from 'lucide-react';

const App: React.FC = () => {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    isAuthenticated: false
  });
  const [view, setView] = useState<'login' | 'register'>('login');
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const savedUser = await db.getCurrentUser();
      if (savedUser) {
        setAuth({ user: savedUser, isAuthenticated: true });
      }
      setIsInitializing(false);
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    await db.setCurrentUser(null);
    setAuth({ user: null, isAuthenticated: false });
    setView('login');
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="relative mb-6">
          <div className="w-16 h-16 border-4 border-indigo-100 rounded-full animate-spin border-t-indigo-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-indigo-600" />
          </div>
        </div>
        <p className="text-slate-500 font-extrabold uppercase tracking-[4px] text-[10px]">EduResolve OS</p>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-lg">
          {view === 'login' ? (
            <Login 
              onLoginSuccess={(user) => setAuth({ user, isAuthenticated: true })} 
              onNavigateToRegister={() => setView('register')} 
            />
          ) : (
            <Register 
              onRegisterSuccess={() => setView('login')} 
              onNavigateToLogin={() => setView('login')} 
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Inter']">
      {/* Premium Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-200">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div className="hidden sm:block">
             <span className="text-lg font-black text-slate-900 tracking-tight">EduResolve</span>
             <div className="flex items-center gap-1">
               <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Network Secure</span>
             </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 md:gap-6">
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
             <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></div>
             <span className="text-xs font-bold text-slate-600">{auth.user?.role.toUpperCase()} PORTAL</span>
          </div>
          
          <div className="h-8 w-[1px] bg-slate-200 mx-2 hidden md:block"></div>
          
          <div className="flex items-center gap-3">
             <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
               <Bell className="w-5 h-5" />
             </button>
             <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
               <Settings className="w-5 h-5" />
             </button>
             <button 
              onClick={handleLogout}
              className="ml-2 flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-2xl text-xs font-black hover:bg-black transition-all shadow-xl shadow-slate-200"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content with subtle background details */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-6 md:px-12 py-12 relative">
        {/* Subtle decorative elements */}
        <div className="fixed top-24 left-10 w-64 h-64 bg-indigo-100/30 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="fixed bottom-10 right-10 w-96 h-96 bg-blue-100/20 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="relative z-10">
          {auth.user?.role === Role.ADMIN ? (
            <AdminDashboard user={auth.user} />
          ) : (
            <StudentDashboard user={auth.user!} />
          )}
        </div>
      </main>

      {/* Modern Footer */}
      <footer className="py-12 px-8 text-center border-t border-slate-200 bg-white">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-6">
          <div className="flex items-center gap-2 opacity-30 grayscale">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-sm font-bold tracking-tighter">EduResolve Intelligence</span>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[3px]">
            &copy; {new Date().getFullYear()} University Grievance System • Level 4 Security Cleared
          </p>
          <div className="flex gap-8">
            <a href="#" className="text-[10px] font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest">Privacy</a>
            <a href="#" className="text-[10px] font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest">Support</a>
            <a href="#" className="text-[10px] font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest">Compliance</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
