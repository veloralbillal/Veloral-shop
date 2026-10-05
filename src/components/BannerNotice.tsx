import React, { useState, useEffect } from 'react';
import { 
  Megaphone, MessageCircle, Clock, X, Bell, ExternalLink, 
  Copy, Check, Sparkles, AlertCircle, Info, ChevronRight
} from 'lucide-react';
import { StoreSettings, DbStatus } from '../types';

interface BannerNoticeProps {
  settings: StoreSettings;
  dbStatus?: DbStatus | null;
  onOpenAdmin?: () => void;
}

export const BannerNotice: React.FC<BannerNoticeProps> = ({ settings, dbStatus, onOpenAdmin }) => {
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    return sessionStorage.getItem('veloral_notice_dismissed') === 'true';
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const cleanPhone = (settings.whatsapp_number || '01859000000').replace(/[^0-9+]/g, '');
  const noticeText = settings.notice_text?.trim() || 'Welcome! Instant digital key delivery and 24/7 customer support active.';

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('veloral_notice_dismissed', 'true');
  };

  const handleRestore = () => {
    setIsDismissed(false);
    sessionStorage.removeItem('veloral_notice_dismissed');
  };

  const handleCopyNotice = () => {
    navigator.clipboard.writeText(noticeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isDismissed) {
    return (
      <div className="w-full bg-slate-950/80 border-b border-slate-800/60 py-1 px-3 flex items-center justify-end">
        <button
          onClick={handleRestore}
          className="text-[10px] text-slate-400 hover:text-amber-400 font-bold flex items-center gap-1.5 transition-colors cursor-pointer py-0.5 px-2 rounded-full hover:bg-slate-900"
          title="View notice board"
        >
          <Bell className="w-3 h-3 text-amber-400 animate-bounce" />
          <span>View Notice</span>
        </button>
      </div>
    );
  }

  return (
    <>
      <aside 
        aria-label="Announcement Notice Bar"
        className="w-full bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white border-b border-slate-800/80 shadow-inner relative z-30 transition-all select-none"
      >
        <div className="max-w-7xl mx-auto h-9 sm:h-10 px-2 sm:px-4 flex items-center justify-between gap-2">
          
          {/* Left: Live beacon + Notice Tag */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Live radar beacon */}
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>

            {/* Notice Badge */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/30 rounded-full font-black text-[9px] sm:text-[10px] uppercase tracking-wider cursor-pointer transition-colors"
              title="Click to view full notice details"
            >
              <Megaphone className="w-3 h-3 text-amber-400 shrink-0" />
              <span>NOTICE</span>
            </button>
          </div>

          {/* Center: Dynamic Marquee Ticker */}
          <div 
            onClick={() => setIsModalOpen(true)}
            className="flex-1 min-w-0 overflow-hidden cursor-pointer mask-linear-fade relative group py-1"
            title="Click to view full notice"
          >
            <div className="animate-marquee inline-flex items-center gap-8 whitespace-nowrap text-[11px] sm:text-xs text-slate-200 font-medium">
              <span className="flex items-center gap-2 hover:text-amber-300 transition-colors">
                <span>{noticeText}</span>
                <span className="text-amber-400/60 font-black">✦</span>
              </span>
              <span className="flex items-center gap-2 hover:text-amber-300 transition-colors" aria-hidden="true">
                <span>{noticeText}</span>
                <span className="text-amber-400/60 font-black">✦</span>
              </span>
              <span className="flex items-center gap-2 hover:text-amber-300 transition-colors" aria-hidden="true">
                <span>{noticeText}</span>
                <span className="text-amber-400/60 font-black">✦</span>
              </span>
            </div>
          </div>

          {/* Right: Support Hours + WhatsApp Action + Dismiss Button */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Business Hours on larger screens */}
            <div className="hidden lg:flex items-center gap-1 text-[11px] text-slate-400 font-medium bg-slate-900/60 px-2 py-0.5 rounded-full border border-slate-800">
              <Clock className="w-3 h-3 text-emerald-400" />
              <span>9:00 AM - 12:00 AM</span>
            </div>

            {/* WhatsApp Direct Help Button */}
            <a
              href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent('Hello Veloral Support, I need help with an order/inquiry.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 bg-emerald-500/15 hover:bg-emerald-500/25 active:scale-95 text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 rounded-full font-bold text-[10px] sm:text-[11px] transition-all cursor-pointer whitespace-nowrap shadow-sm"
              title="Chat directly on WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-emerald-500/20 text-emerald-400 shrink-0" />
              <span>WhatsApp</span>
            </a>

            {/* Dismiss X button */}
            <button
              onClick={handleDismiss}
              className="p-1 text-slate-500 hover:text-slate-300 hover:bg-slate-800/80 rounded-full transition-colors cursor-pointer"
              title="Dismiss notice"
              aria-label="Dismiss banner"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      </aside>

      {/* Full Notice Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-emerald-400 to-blue-500"></div>

            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">Important Notice & Announcement</h3>
                  <p className="text-[11px] text-slate-400">Veloral Digital & Shop Official Notice</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notice Body */}
            <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-2xl mb-4">
              <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap select-text">
                {noticeText}
              </p>
            </div>

            {/* Quick Details & Badges */}
            <div className="grid grid-cols-2 gap-2 text-xs mb-5">
              <div className="p-2.5 bg-slate-950/50 border border-slate-800 rounded-xl flex items-center gap-2 text-slate-300">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Support Hours</p>
                  <p className="font-semibold text-[11px]">9:00 AM - 12:00 AM</p>
                </div>
              </div>
              <div className="p-2.5 bg-slate-950/50 border border-slate-800 rounded-xl flex items-center gap-2 text-slate-300">
                <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Live Chat</p>
                  <p className="font-semibold text-[11px]">WhatsApp Active</p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5">
              <a
                href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent('Hello Veloral Support, regarding the announcement: ' + noticeText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-950/40"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Contact on WhatsApp</span>
              </a>

              <button
                onClick={handleCopyNotice}
                className="w-full sm:w-auto py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy Notice'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
