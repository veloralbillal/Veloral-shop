import React, { useState } from 'react';
import { StoreEvent } from '../../types';
import {
  Calendar,
  Plus,
  Trash2,
  Sparkles,
  Upload,
  Link,
  X,
  CheckCircle2,
  AlertCircle,
  Eye,
  Megaphone,
  ExternalLink,
} from 'lucide-react';

interface MobileEventsManagerProps {
  events: StoreEvent[];
  activePopupId?: string | null;
  onAddEvent: (event: StoreEvent) => Promise<void>;
  onUpdateEvent: (id: string, updates: Partial<StoreEvent>) => Promise<void>;
  onDeleteEvent: (id: string) => Promise<void>;
  onSetActivePopupId: (id: string | null) => Promise<void>;
  showToast: (msg: string) => void;
}

export const MobileEventsManager: React.FC<MobileEventsManagerProps> = ({
  events,
  activePopupId,
  onAddEvent,
  onUpdateEvent,
  onDeleteEvent,
  onSetActivePopupId,
  showToast,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDesc, setNewEventDesc] = useState('');
  const [newEventImageUrl, setNewEventImageUrl] = useState('');
  const [imageUploadMode, setImageUploadMode] = useState<'upload' | 'url'>('upload');
  const [fileInputKey, setFileInputKey] = useState(0);
  const [newEventCtaLabel, setNewEventCtaLabel] = useState('');
  const [newEventCtaLink, setNewEventCtaLink] = useState('');
  const [newEventPopup, setNewEventPopup] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  const activeEventsCount = events.filter((e) => e.active).length;

  const handleGenerateAI = async (field: 'title' | 'desc') => {
    setIsGenerating(field);
    try {
      const prompt =
        field === 'title'
          ? 'Generate a short catchy Bengali title for a digital/gadget store special promotional offer'
          : `Write a short attractive Bengali promotional description for: ${newEventTitle || 'Special Store Offer'}`;
      const res = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, context: 'Store promotions' }),
      });
      const data = await res.json();
      if (data.success && data.text) {
        if (field === 'title') setNewEventTitle(data.text.trim());
        else setNewEventDesc(data.text.trim());
        showToast('AI কন্টেন্ট তৈরি হয়েছে!');
      } else {
        throw new Error(data.message || 'AI generation failed');
      }
    } catch (err: any) {
      if (field === 'title') setNewEventTitle('🔥 ধামাকা অফার! সীমিত সময়ের ডিসকাউন্ট');
      else setNewEventDesc('আমাদের স্পেশাল অফারে উপভোগ করুন আকর্ষণীয় ক্যাশব্যাক ও দ্রুততম ইনস্ট্যান্ট ডেলিভারি!');
      showToast('রেডিমেড টেমপ্লেট যোগ করা হয়েছে');
    } finally {
      setIsGenerating(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim() || !newEventDesc.trim()) {
      showToast('টাইটেল এবং বিবরণ উভয়ই প্রয়োজন!');
      return;
    }

    setIsSubmitting(true);
    const newEvent: StoreEvent = {
      id: `evt-${Date.now()}`,
      title: newEventTitle.trim(),
      description: newEventDesc.trim(),
      image_url: newEventImageUrl || undefined,
      cta_label: newEventCtaLabel.trim() || undefined,
      cta_link: newEventCtaLink.trim() || undefined,
      active: true,
      show_as_popup: newEventPopup,
      created_at: new Date().toISOString(),
    };

    try {
      await onAddEvent(newEvent);
      if (newEvent.show_as_popup && newEvent.active) {
        await onSetActivePopupId(newEvent.id);
      }
      showToast('ইভেন্ট সফলভাবে পাবলিশ করা হয়েছে!');
      setNewEventTitle('');
      setNewEventDesc('');
      setNewEventImageUrl('');
      setNewEventCtaLabel('');
      setNewEventCtaLink('');
      setIsFormOpen(false);
    } catch (err) {
      console.error(err);
      showToast('ইভেন্ট তৈরি করতে সমস্যা হয়েছে');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (evt: StoreEvent) => {
    const newActive = !evt.active;
    await onUpdateEvent(evt.id, { active: newActive });
    if (newActive && evt.show_as_popup) {
      await onSetActivePopupId(evt.id);
    } else if (!newActive && activePopupId === evt.id) {
      await onSetActivePopupId(null);
    }
    showToast(`ইভেন্ট ${newActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'} করা হয়েছে`);
  };

  const handleTogglePopup = async (evt: StoreEvent) => {
    const newPopup = !evt.show_as_popup;
    await onUpdateEvent(evt.id, { show_as_popup: newPopup });
    if (newPopup && evt.active) {
      await onSetActivePopupId(evt.id);
    } else if (!newPopup && activePopupId === evt.id) {
      await onSetActivePopupId(null);
    }
    showToast(`পপআপ ${newPopup ? 'অন' : 'অফ'} করা হয়েছে`);
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`আপনি কি "${title}" ইভেন্টটি ডিলিট করতে চান?`)) {
      await onDeleteEvent(id);
      if (activePopupId === id) {
        await onSetActivePopupId(null);
      }
      showToast('ইভেন্ট ডিলিট করা হয়েছে!');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-500" />
          <span>ইভেন্ট ও অফার পপআপ ({events.length})</span>
        </h2>
        <span className="text-[10px] bg-blue-950 text-blue-300 border border-blue-800 px-2 py-1 rounded-full font-bold">
          📱 Mobile Optimized
        </span>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 text-center">
          <span className="text-[10px] text-slate-400 block font-bold">মোট ইভেন্ট</span>
          <span className="text-base font-black text-white">{events.length}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 text-center">
          <span className="text-[10px] text-emerald-400 block font-bold">সক্রিয়</span>
          <span className="text-base font-black text-emerald-400">{activeEventsCount}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 text-center">
          <span className="text-[10px] text-blue-400 block font-bold">লাইভ পপআপ</span>
          <span className="text-base font-black text-blue-400">{activePopupId ? '১টি অন' : 'নাই'}</span>
        </div>
      </div>

      {/* Toggle Add Event Form Button */}
      <button
        onClick={() => setIsFormOpen(!isFormOpen)}
        className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
      >
        <Plus className="w-4 h-4" />
        <span>{isFormOpen ? 'ফর্ম লুকান' : 'নতুন ইভেন্ট বা অফার পপআপ তৈরি করুন'}</span>
      </button>

      {/* Add New Event Form (Mobile-Optimized) */}
      {isFormOpen && (
        <form
          onSubmit={handleSubmit}
          className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 space-y-3.5 shadow-xl animate-in slide-in-from-top-2 duration-200"
        >
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-amber-400" />
              <span>ইভেন্টের তথ্য দিন</span>
            </h3>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="text-slate-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Title with AI assistant */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-slate-400">ইভেন্ট টাইটেল *</label>
              <button
                type="button"
                onClick={() => handleGenerateAI('title')}
                disabled={isGenerating !== null}
                className="text-[10px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20"
              >
                <Sparkles className="w-3 h-3" />
                <span>{isGenerating === 'title' ? 'তৈরি হচ্ছে...' : 'AI আইডিয়া'}</span>
              </button>
            </div>
            <input
              type="text"
              placeholder="যেমন: ধামাকা ঈদ অফার ২০২৬!"
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Image Upload Mode Switch */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-slate-400">ইভেন্ট ব্যানার ইমেজ (ঐচ্ছিক)</label>
              <div className="flex bg-slate-950 p-0.5 rounded-xl border border-slate-800 text-[10px]">
                <button
                  type="button"
                  onClick={() => setImageUploadMode('upload')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    imageUploadMode === 'upload' ? 'bg-blue-600 text-white' : 'text-slate-400'
                  }`}
                >
                  আপলোড
                </button>
                <button
                  type="button"
                  onClick={() => setImageUploadMode('url')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    imageUploadMode === 'url' ? 'bg-blue-600 text-white' : 'text-slate-400'
                  }`}
                >
                  লিংক
                </button>
              </div>
            </div>

            {imageUploadMode === 'upload' ? (
              <div>
                <input
                  key={fileInputKey}
                  type="file"
                  accept="image/*"
                  id="mobile-event-img"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 5 * 1024 * 1024) {
                        alert('ফাইল সাইজ ৫ MB এর কম হতে হবে!');
                        return;
                      }
                      const reader = new FileReader();
                      reader.onloadend = () => setNewEventImageUrl(reader.result as string);
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <label
                  htmlFor="mobile-event-img"
                  className="flex items-center justify-center p-3 border border-dashed border-slate-800 hover:border-blue-500 rounded-2xl bg-slate-950/60 cursor-pointer text-xs text-slate-400 gap-2 transition-all"
                >
                  <Upload className="w-4 h-4 text-blue-400" />
                  <span>{newEventImageUrl ? 'ছবি পরিবর্তন করুন' : 'ডিভাইস থেকে ছবি বেছে নিন'}</span>
                </label>
              </div>
            ) : (
              <div className="relative">
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={newEventImageUrl}
                  onChange={(e) => setNewEventImageUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono"
                />
                <Link className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            )}

            {newEventImageUrl && (
              <div className="relative w-fit mt-1">
                <img
                  src={newEventImageUrl}
                  alt="Preview"
                  className="h-20 w-36 object-cover rounded-xl border border-slate-700 shadow-md"
                />
                <button
                  type="button"
                  onClick={() => {
                    setNewEventImageUrl('');
                    setFileInputKey((p) => p + 1);
                  }}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-600 text-white rounded-full flex items-center justify-center text-xs shadow-md"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Description with AI */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-slate-400">বিস্তারিত অফার বর্ণনা *</label>
              <button
                type="button"
                onClick={() => handleGenerateAI('desc')}
                disabled={isGenerating !== null}
                className="text-[10px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20"
              >
                <Sparkles className="w-3 h-3" />
                <span>{isGenerating === 'desc' ? 'তৈরি হচ্ছে...' : 'AI বর্ণনা'}</span>
              </button>
            </div>
            <textarea
              rows={2}
              placeholder="অফারের বিস্তারিত নিয়ম ও সময়সীমা লিখুন..."
              value={newEventDesc}
              onChange={(e) => setNewEventDesc(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {/* Call to action (button text & link) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">বাটন টেক্সট (CTA)</label>
              <input
                type="text"
                placeholder="যেমন: এখনই কিনুন"
                value={newEventCtaLabel}
                onChange={(e) => setNewEventCtaLabel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">বাটন লিংক (CTA Link)</label>
              <input
                type="text"
                placeholder="https://..."
                value={newEventCtaLink}
                onChange={(e) => setNewEventCtaLink(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          {/* Popup checkbox */}
          <div className="flex items-center justify-between bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
            <span className="text-xs font-bold text-slate-300">স্টোর ওপেন হলে পপআপ দেখান</span>
            <input
              type="checkbox"
              checked={newEventPopup}
              onChange={(e) => setNewEventPopup(e.target.checked)}
              className="w-5 h-5 accent-blue-600 cursor-pointer"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>ইভেন্ট পাবলিশ করুন</span>
          </button>
        </form>
      )}

      {/* Events List Cards */}
      <div className="space-y-3">
        <h3 className="text-xs font-black text-white uppercase tracking-wider">
          বর্তমান ইভেন্ট তালিকা ({events.length})
        </h3>

        {events.length === 0 ? (
          <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl text-xs text-slate-500 space-y-2">
            <AlertCircle className="w-8 h-8 mx-auto text-slate-600" />
            <p className="font-bold text-slate-300">কোনো ইভেন্ট খুঁজে পাওয়া যায়নি।</p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((evt) => {
              const isLivePopup = activePopupId === evt.id;

              return (
                <div
                  key={evt.id}
                  className={`bg-slate-900 border rounded-3xl p-4 space-y-3 shadow-xl transition-all ${
                    isLivePopup
                      ? 'border-blue-500/50 bg-gradient-to-b from-slate-900 to-blue-950/20'
                      : evt.active
                      ? 'border-emerald-500/30'
                      : 'border-slate-800 opacity-75'
                  }`}
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${
                            evt.active
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {evt.active ? '✓ সক্রিয়' : 'নিষ্ক্রিয়'}
                        </span>
                        {evt.show_as_popup && (
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-black bg-blue-950 text-blue-400 border border-blue-800">
                            পপআপ
                          </span>
                        )}
                        {isLivePopup && (
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-black bg-amber-950 text-amber-400 border border-amber-800 animate-pulse">
                            ● লাইভ পপআপ
                          </span>
                        )}
                      </div>
                      <h4 className="font-extrabold text-white text-xs sm:text-sm truncate">{evt.title}</h4>
                    </div>

                    <button
                      onClick={() => handleDelete(evt.id, evt.title)}
                      className="p-1.5 text-rose-400 hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
                      title="ডিলিট"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Body description & image preview */}
                  <div className="flex gap-3 items-start text-xs text-slate-300">
                    {evt.image_url && (
                      <img
                        src={evt.image_url}
                        alt={evt.title}
                        className="w-16 h-16 object-cover rounded-2xl border border-slate-800 shrink-0"
                      />
                    )}
                    <p className="line-clamp-3 text-slate-400 text-xs leading-relaxed flex-1">
                      {evt.description}
                    </p>
                  </div>

                  {/* CTA info if present */}
                  {evt.cta_label && (
                    <div className="flex items-center gap-1.5 text-[11px] text-blue-400 bg-blue-950/40 px-3 py-1.5 rounded-xl border border-blue-900/40">
                      <ExternalLink className="w-3 h-3 shrink-0" />
                      <span className="font-bold">{evt.cta_label}</span>
                      {evt.cta_link && <span className="text-slate-500 font-mono truncate">({evt.cta_link})</span>}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => handleToggleActive(evt)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        evt.active
                          ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      }`}
                    >
                      {evt.active ? 'নিষ্ক্রিয় করুন' : 'সক্রিয় করুন'}
                    </button>

                    <button
                      onClick={() => handleTogglePopup(evt)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        evt.show_as_popup
                          ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {evt.show_as_popup ? 'পপআপ অন' : 'পপআপ অফ'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
