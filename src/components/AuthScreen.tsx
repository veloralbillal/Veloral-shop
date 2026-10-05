import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { loginUser, registerUser } from '../services/db';
import { 
  Lock, Mail, Phone, User as UserIcon, Eye, EyeOff, 
  CheckCircle2, AlertCircle, ArrowLeft, ShieldCheck, Sparkles 
} from 'lucide-react';

interface AuthScreenProps {
  initialMode?: 'login' | 'signup';
  onBack: () => void;
  onAuthSuccess: (user: User) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  initialMode = 'login',
  onBack,
  onAuthSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  
  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Signup form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    setMode(initialMode);
    setErrorMsg('');
    setSuccessMsg('');
  }, [initialMode]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!loginIdentifier.trim() || !loginPassword) {
      setErrorMsg('মোবাইল/ইমেইল এবং পাসওয়ার্ড উভয়ই প্রদান করুন।');
      return;
    }

    try {
      setIsLoading(true);
      const res = await loginUser(loginIdentifier.trim(), loginPassword);
      if (res.success && res.user) {
        if (res.user.role === 'admin') {
          setSuccessMsg('✅ এডমিন ক্রেডেনশিয়াল ভেরিফাইড! এডমিন ড্যাশবোর্ড ওপেন হচ্ছে...');
        } else {
          setSuccessMsg(`স্বাগতম, ${res.user.name}! লগইন সফল হয়েছে।`);
        }
        setTimeout(() => {
          onAuthSuccess(res.user!);
        }, 800);
      } else {
        setErrorMsg(res.message || 'লগইন ব্যর্থ হয়েছে। সঠিক তথ্য প্রদান করুন।');
      }
    } catch (err: any) {
      setErrorMsg('সার্ভার কানেকশন এরর। আবার চেষ্টা করুন।');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanPhone = phone.trim().replace(/\D/g, '');

    if (!name.trim()) {
      setErrorMsg('অনুগ্রহ করে আপনার নাম প্রদান করুন।');
      return;
    }
    if (cleanPhone.length < 11) {
      setErrorMsg('একটি সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন।');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('একটি সঠিক ইমেইল এড্রেস দিন।');
      return;
    }
    if (password.length < 4) {
      setErrorMsg('পাসওয়ার্ড অন্তত ৪ ডিজিটের হতে হবে।');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('পাসওয়ার্ড দুটি মেলেনি। আবার চেক করুন।');
      return;
    }

    try {
      setIsLoading(true);
      const res = await registerUser(name.trim(), phone.trim(), email.trim().toLowerCase(), password);
      if (res.success && res.user) {
        setSuccessMsg(`অভিনন্দন ${res.user.name}! আপনার একাউন্ট তৈরি সফল হয়েছে।`);
        setTimeout(() => {
          onAuthSuccess(res.user!);
        }, 800);
      } else {
        setErrorMsg(res.message || 'রেজিস্ট্রেশন ব্যর্থ হয়েছে। এই নম্বর বা ইমেইলে অলরেডি একাউন্ট থাকতে পারে।');
      }
    } catch (err: any) {
      setErrorMsg('সার্ভার কানেকশন এরর। আবার চেষ্টা করুন।');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="max-w-7xl mx-auto w-full px-4 h-16 flex items-center justify-between relative z-10">
        <button 
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-400 hover:text-white transition-colors cursor-pointer group py-2"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>ওয়েলকাম পেজে ফিরুন</span>
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-black text-sm">V</div>
          <span className="text-sm font-black text-white">Veloral Digital</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <div className="w-full max-w-md bg-slate-900/80 border border-slate-800/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          
          {/* Tabs */}
          <div className="grid grid-cols-2 p-1.5 bg-slate-950 rounded-2xl border border-slate-800">
            <button
              onClick={() => {
                setMode('login');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                mode === 'login' 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              লগইন করুন
            </button>
            <button
              onClick={() => {
                setMode('signup');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                mode === 'signup' 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              নতুন একাউন্ট
            </button>
          </div>

          {/* Intro Text */}
          <div className="text-center space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {mode === 'login' ? 'স্বাগতম ব্যাক!' : 'ফ্রি একাউন্ট খুলুন'}
            </h2>
            <p className="text-xs text-slate-400">
              {mode === 'login' 
                ? 'আপনার একাউন্টে লগইন করে স্টোর অ্যাক্সেস করুন' 
                : '১ মিনিটে রেজিস্ট্রেশন করে স্টোর অ্যাক্সেস করুন'
              }
            </p>
          </div>

          {/* Feedback messages */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 animate-bounce" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Forms */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">মোবাইল নম্বর অথবা ইমেইল</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="যেমন: 018XXXXXXXX বা email@domain.com"
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">পাসওয়ার্ড</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="আপনার একাউন্ট পাসওয়ার্ড"
                    className="w-full pl-10 pr-10 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:text-blue-400 text-slate-500"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 font-extrabold text-sm text-white shadow-lg shadow-blue-600/20 transition-all cursor-pointer transform active:scale-95 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'লগইন করুন'
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">আপনার পুরো নাম</label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="যেমন: Billal Hossain"
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">১১ ডিজিটের মোবাইল নম্বর</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="যেমন: 018XXXXXXXX"
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">ইমেইল এড্রেস</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="যেমন: billal7393@gmail.com"
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">পাসওয়ার্ড সেট করুন</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="অন্তত ৪ সংখ্যার পাসওয়ার্ড দিন"
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">পাসওয়ার্ড নিশ্চিত করুন</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="আবার একই পাসওয়ার্ড লিখুন"
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 font-extrabold text-sm text-white shadow-lg shadow-blue-600/20 transition-all cursor-pointer transform active:scale-95 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'একাউন্ট তৈরি করুন'
                )}
              </button>
            </form>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 text-center text-xs text-slate-600 relative z-10 border-t border-slate-900 bg-slate-950/40">
        <div className="flex items-center justify-center gap-1 text-slate-500 mb-1">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>১০০% সুরক্ষিত ডাটা ট্রান্সমিশন ও বিকাশ পেমেন্ট সুবিধা</span>
        </div>
        <p>© {new Date().getFullYear()} Veloral Digital & Shop. All rights reserved.</p>
      </footer>
    </div>
  );
};
