import React, { useState } from 'react';
import { StoreSettings } from '../../types';
import {
  Settings,
  Megaphone,
  Phone,
  Sparkles,
  CheckCircle2,
  Save,
  MessageCircle,
  FileText,
  CreditCard,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

interface MobileWebSettingsManagerProps {
  settings: StoreSettings;
  onSaveSettings: (settings: StoreSettings) => void;
  showToast: (msg: string) => void;
}

export const MobileWebSettingsManager: React.FC<MobileWebSettingsManagerProps> = ({
  settings,
  onSaveSettings,
  showToast,
}) => {
  const [localSettings, setLocalSettings] = useState<StoreSettings>(settings);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const presets = [
    {
      label: '⚡ ইনস্ট্যান্ট ডেলিভারি',
      text: '⚡ ইনস্ট্যান্ট ডেলিভারি! বিকাশ, নগদ বা রকেটে পেমেন্ট করুন। লাইভ সাপোর্ট ৯ AM - ১২ AM।',
    },
    {
      label: '🎁 বিশেষ ছাড়',
      text: '🎁 ধামাকা অফার চলছে! চেকআউটে কুপন কোড ব্যবহার করে অতিরিক্ত ক্যাশব্যাক উপভোগ করুন।',
    },
    {
      label: '💎 গেম টপ-আপ',
      text: '💎 প্লেয়ার আইডি দিয়ে ৫-১৫ মিনিটে ফ্রি ফায়ার ডায়মন্ড ও পাবজি ইউসি ইনস্ট্যান্ট টপ-আপ!',
    },
    {
      label: '💬 লাইভ চ্যাট',
      text: '💬 যেকোনো প্রয়োজনে সরাসরি আমাদের অফিসিয়াল হোয়াটসঅ্যাপ লাইভ চ্যাটে নক করুন।',
    },
  ];

  const handleGenerateNotice = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('./api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt:
            'Generate a short, attractive Bengali store announcement notice emphasizing fast delivery, 24/7 WhatsApp help, and secure bKash/Nagad payments',
          context: 'Online digital services and gaming store announcement banner',
        }),
      });
      const data = await res.json();
      if (data.success && data.text) {
        setLocalSettings((prev) => ({ ...prev, notice_text: data.text.trim() }));
        showToast('AI নোটিশ তৈরি হয়েছে!');
      } else {
        throw new Error('AI generation failed');
      }
    } catch (err) {
      setLocalSettings((prev) => ({
        ...prev,
        notice_text: '⚡ ইনস্ট্যান্ট ডেলিভারি! বিকাশ ও নগদে নিরাপদ পেমেন্ট। যেকোনো প্রয়োজনে ২৪/৭ হোয়াটসঅ্যাপ সাপোর্ট।',
      }));
      showToast('রেডিমেড নোটিশ যুক্ত করা হয়েছে');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    onSaveSettings(localSettings);
    setIsSaved(true);
    showToast('ওয়েবসাইট কন্টেন্ট ও ব্যানার সফলভাবে সেভ হয়েছে!');
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-500 animate-spin-slow" />
          <span>ওয়েবসাইট কন্টেন্ট ও ব্যানার নোটিস</span>
        </h2>
        <span className="text-[10px] bg-blue-950 text-blue-300 border border-blue-800 px-2 py-1 rounded-full font-bold">
          📱 Mobile Optimized
        </span>
      </div>

      {/* 1. Announcement Banner Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 space-y-3.5 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
          <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-amber-400" />
            <span>টপ ব্যানার নোটিশ কন্ট্রোল</span>
          </h3>
          <button
            type="button"
            onClick={handleGenerateNotice}
            disabled={isGenerating}
            className="text-[10px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20 transition-all"
          >
            <Sparkles className="w-3 h-3" />
            <span>{isGenerating ? 'তৈরি হচ্ছে...' : 'AI নোটিশ'}</span>
          </button>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400">ব্যানার নোটিশ টেক্সট (বাংলা/ইংরেজি)</label>
          <textarea
            rows={2}
            value={localSettings.notice_text || ''}
            onChange={(e) => setLocalSettings({ ...localSettings, notice_text: e.target.value })}
            placeholder="যেমন: ⚡ ইনস্ট্যান্ট ডেলিভারি! বিকাশ, নগদ বা রকেটে পেমেন্ট করুন।"
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 resize-none transition-all leading-relaxed"
          />
        </div>

        {/* Preset Chips */}
        <div className="space-y-1.5">
          <span className="text-[10px] text-slate-500 font-bold block">রেডিমেড টেমপ্লেট:</span>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {presets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setLocalSettings((prev) => ({ ...prev, notice_text: p.text }))}
                className="text-[10px] px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-xl transition-all shrink-0 cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Live Mobile Banner Preview */}
        <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800/80 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase">
            <span>রিয়েল-টাইম প্রিভিউ:</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">● লাইভ</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between gap-2 overflow-hidden text-xs">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="px-1.5 py-0.5 bg-amber-400/10 text-amber-400 border border-amber-400/30 rounded-md font-black text-[9px] uppercase">
                নোটিশ
              </span>
            </div>
            <div className="flex-1 truncate text-slate-300 text-[11px] font-medium">
              {localSettings.notice_text || 'কোনো নোটিশ সেট করা নেই'}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Contact & Helpline Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 space-y-3.5 shadow-xl">
        <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800/80 pb-2.5">
          <Phone className="w-4 h-4 text-emerald-400" />
          <span>হেল্পলাইন ও সাপোর্ট নম্বর</span>
        </h3>

        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-slate-400">হোয়াটসঅ্যাপ হেল্পলাইন নম্বর</label>
              {localSettings.whatsapp_number && (
                <a
                  href={`https://wa.me/${localSettings.whatsapp_number.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <MessageCircle className="w-3 h-3" />
                  <span>টেস্ট চ্যাট</span>
                </a>
              )}
            </div>
            <input
              type="text"
              value={localSettings.whatsapp_number || ''}
              onChange={(e) => setLocalSettings({ ...localSettings, whatsapp_number: e.target.value })}
              placeholder="যেমন: +8801700000000"
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-slate-400">সরাসরি ফোন কল নম্বর</label>
              {localSettings.help_phone && (
                <a
                  href={`tel:${localSettings.help_phone}`}
                  className="text-[10px] text-blue-400 hover:underline flex items-center gap-1"
                >
                  <Phone className="w-3 h-3" />
                  <span>কল করুন</span>
                </a>
              )}
            </div>
            <input
              type="text"
              value={localSettings.help_phone || ''}
              onChange={(e) => setLocalSettings({ ...localSettings, help_phone: e.target.value })}
              placeholder="যেমন: 01800000000"
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>
        </div>
      </div>

      {/* 3. Footer & Branding Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 space-y-3.5 shadow-xl">
        <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800/80 pb-2.5">
          <FileText className="w-4 h-4 text-purple-400" />
          <span>ফুটার ও ব্র্যান্ডিং টেক্সট</span>
        </h3>

        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">ফুটার টাইটেল / নাম</label>
              <input
                type="text"
                value={localSettings.footer_title || ''}
                onChange={(e) => setLocalSettings({ ...localSettings, footer_title: e.target.value })}
                placeholder="যেমন: Veloral Shop"
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">কপিরাইট নোটিশ</label>
              <input
                type="text"
                value={localSettings.footer_copyright || ''}
                onChange={(e) => setLocalSettings({ ...localSettings, footer_copyright: e.target.value })}
                placeholder="যেমন: © 2026 Veloral. All Rights Reserved."
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1">ফুটার বিবরণ (Footer Description)</label>
            <textarea
              rows={2}
              value={localSettings.footer_description || ''}
              onChange={(e) => setLocalSettings({ ...localSettings, footer_description: e.target.value })}
              placeholder="স্টোর সম্পর্কে সংক্ষিপ্ত বিবরণ..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1">পেমেন্ট মেথড বিবরণ (প্রতি লাইনে একটি)</label>
            <textarea
              rows={2}
              value={localSettings.footer_payment_methods || ''}
              onChange={(e) => setLocalSettings({ ...localSettings, footer_payment_methods: e.target.value })}
              placeholder="bKash&#10;Nagad&#10;Rocket"
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 font-mono resize-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1">সহায়তা ও হেল্প টেক্সট</label>
            <textarea
              rows={2}
              value={localSettings.footer_help_text || ''}
              onChange={(e) => setLocalSettings({ ...localSettings, footer_help_text: e.target.value })}
              placeholder="সাহায্যের জন্য যোগাযোগ সংক্রান্ত তথ্য..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-2xl shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
      >
        <Save className="w-4 h-4" />
        <span>ওয়েব সেটিংস সেভ করুন</span>
      </button>

      {isSaved && (
        <div className="p-3 bg-emerald-950 border border-emerald-800 text-emerald-400 text-xs font-bold rounded-2xl flex items-center justify-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>সেটিংস সফলভাবে সেভ হয়েছে!</span>
        </div>
      )}
    </div>
  );
};
