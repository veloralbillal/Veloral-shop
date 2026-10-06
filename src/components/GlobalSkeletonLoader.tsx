import React from 'react';
import { Shield, Sparkles } from 'lucide-react';

export const GlobalSkeletonLoader: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-start p-4 sm:p-8 space-y-8 animate-pulse">
      {/* Navbar Skeleton */}
      <div className="w-full max-w-7xl h-16 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-800" />
          <div className="w-32 h-5 bg-slate-800 rounded-lg" />
        </div>
        <div className="hidden sm:flex items-center gap-4">
          <div className="w-20 h-4 bg-slate-800 rounded-lg" />
          <div className="w-20 h-4 bg-slate-800 rounded-lg" />
          <div className="w-20 h-4 bg-slate-800 rounded-lg" />
        </div>
        <div className="w-24 h-9 bg-slate-800 rounded-xl" />
      </div>

      {/* Hero Banner Skeleton */}
      <div className="w-full max-w-7xl h-64 sm:h-80 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 flex flex-col justify-between relative overflow-hidden">
        <div className="space-y-4 max-w-lg">
          <div className="w-48 h-6 bg-slate-800 rounded-full" />
          <div className="w-full h-10 bg-slate-800 rounded-xl" />
          <div className="w-3/4 h-10 bg-slate-800 rounded-xl" />
          <div className="w-2/3 h-4 bg-slate-800 rounded-lg" />
        </div>
        <div className="flex items-center gap-4 pt-4">
          <div className="w-32 h-10 bg-slate-800 rounded-xl" />
          <div className="w-32 h-10 bg-slate-800 rounded-xl" />
        </div>

        {/* Center Pulsing Logo Badge */}
        <div className="absolute top-1/2 right-12 -translate-y-1/2 hidden lg:flex flex-col items-center gap-3 bg-slate-950/80 border border-slate-800 p-6 rounded-3xl shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Shield className="w-8 h-8 text-blue-400 animate-bounce" />
          </div>
          <div className="text-center space-y-1">
            <span className="text-xs font-black text-white flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Veloral Shop Loading...
            </span>
            <span className="text-[10px] text-slate-400 block">ডাটাবেস কানেক্ট হচ্ছে...</span>
          </div>
        </div>
      </div>

      {/* Grid Skeleton Cards */}
      <div className="w-full max-w-7xl grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="bg-slate-900 border border-slate-800/90 rounded-2xl p-4 space-y-3">
            <div className="w-full h-36 bg-slate-800 rounded-xl" />
            <div className="w-3/4 h-4 bg-slate-800 rounded-lg" />
            <div className="w-1/2 h-3 bg-slate-800 rounded-lg" />
            <div className="flex items-center justify-between pt-2">
              <div className="w-16 h-6 bg-slate-800 rounded-lg" />
              <div className="w-20 h-8 bg-slate-800 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
