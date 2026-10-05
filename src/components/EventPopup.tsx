import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Calendar, ChevronRight } from 'lucide-react';
import { StoreEvent } from '../types';

interface EventPopupProps {
  event: StoreEvent;
  onClose: () => void;
}

export const EventPopup: React.FC<EventPopupProps> = ({ event, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Small delay to trigger animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleCtaClick = () => {
    if (event.cta_link) {
      window.open(event.cta_link, '_blank');
    }
    onClose();
  };

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div 
        className={`bg-slate-900 border border-slate-800 rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl transition-all duration-500 transform ${isVisible ? 'scale-100 translate-y-0' : 'scale-90 translate-y-10'}`}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-slate-950/40 hover:bg-rose-600 text-white rounded-full transition-all border border-white/10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Event Image */}
        {event.image_url && (
          <div className="relative h-48 w-full overflow-hidden">
            <img 
              src={event.image_url} 
              alt={event.title} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
          </div>
        )}

        <div className={`p-6 ${!event.image_url ? 'pt-10' : ''} space-y-4`}>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/20">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">বিশেষ ইভেন্ট</span>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-black text-white leading-tight">
              {event.title}
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              {event.description}
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-3">
            {event.cta_label && (
              <button
                onClick={handleCtaClick}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black rounded-2xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 group transition-all cursor-pointer"
              >
                <span>{event.cta_label}</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
            
            <button
              onClick={onClose}
              className="w-full py-2.5 text-xs font-bold text-slate-500 hover:text-white transition-colors cursor-pointer"
            >
              এখন না, ধন্যবাদ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
