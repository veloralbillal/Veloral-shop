import React, { useState } from 'react';
import { StoreSettings, CustomCategory, SubCategory } from '../../types';
import { Inbox, Plus, Trash2, Tag, Layers, CheckCircle2, AlertCircle } from 'lucide-react';

interface MobileCategoriesManagerProps {
  settings: StoreSettings;
  onSaveCategory: (cat: CustomCategory) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
  onSaveSubCategory: (sub: SubCategory) => Promise<void>;
  onDeleteSubCategory: (id: string) => Promise<void>;
  showToast: (msg: string) => void;
}

export const MobileCategoriesManager: React.FC<MobileCategoriesManagerProps> = ({
  settings,
  onSaveCategory,
  onDeleteCategory,
  onSaveSubCategory,
  onDeleteSubCategory,
  showToast,
}) => {
  const [newCatId, setNewCatId] = useState('');
  const [newCatLabel, setNewCatLabel] = useState('');

  const [newSubId, setNewSubId] = useState('');
  const [newSubLabel, setNewSubLabel] = useState('');
  const [newSubParentId, setNewSubParentId] = useState(settings.custom_categories?.[0]?.id || 'digital');

  const categories = settings.custom_categories || [];
  const subCategories = settings.sub_categories || [];

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatId.trim() || !newCatLabel.trim()) {
      showToast('দয়া করে ক্যাটাগরি আইডি এবং লেবেল দিন');
      return;
    }
    const cleanId = newCatId.trim().toLowerCase().replace(/\s+/g, '_');
    await onSaveCategory({ id: cleanId, label: newCatLabel.trim() });
    showToast('ক্যাটাগরি সফলভাবে যোগ করা হয়েছে!');
    setNewCatId('');
    setNewCatLabel('');
  };

  const handleAddSubCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubId.trim() || !newSubLabel.trim() || !newSubParentId) {
      showToast('সব ফিল্ড পূরণ করুন');
      return;
    }
    const cleanId = newSubId.trim().toLowerCase().replace(/\s+/g, '_');
    await onSaveSubCategory({
      id: cleanId,
      parent_category_id: newSubParentId,
      label: newSubLabel.trim(),
    });
    showToast('সাব-ক্যাটাগরি সফলভাবে যোগ করা হয়েছে!');
    setNewSubId('');
    setNewSubLabel('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
          <Inbox className="w-5 h-5 text-blue-500" />
          <span>ক্যাটাগরি ও সাব-ক্যাটাগরি ম্যানেজমেন্ট</span>
        </h2>
        <span className="text-[10px] bg-blue-950 text-blue-300 border border-blue-800 px-2 py-1 rounded-full font-bold">
          📱 Mobile Optimized
        </span>
      </div>

      {/* Add Main Category Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 space-y-4 shadow-xl">
        <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
          <Tag className="w-4 h-4 text-blue-400" />
          <span>নতুন প্রধান ক্যাটাগরি যোগ করুন</span>
        </h3>
        <form onSubmit={handleAddCategory} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">ক্যাটাগরি আইডি (যেমন: gaming, vpn)</label>
              <input
                type="text"
                placeholder="যেমন: software"
                value={newCatId}
                onChange={(e) => setNewCatId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">ক্যাটাগরি নাম (বাংলা বা ইংরেজি)</label>
              <input
                type="text"
                placeholder="যেমন: সফটওয়্যার ও অ্যাপস"
                value={newCatLabel}
                onChange={(e) => setNewCatLabel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>প্রধান ক্যাটাগরি সেভ করুন</span>
          </button>
        </form>
      </div>

      {/* Categories List */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 space-y-3 shadow-xl">
        <h3 className="text-xs font-black text-white uppercase tracking-wider">
          বর্তমান প্রধান ক্যাটাগরি তালিকা ({categories.length})
        </h3>
        <div className="space-y-2">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-slate-950 border border-slate-800/80 rounded-2xl p-3 flex items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-white text-xs">{cat.label}</h4>
                <span className="text-[10px] font-mono text-slate-500">ID: {cat.id}</span>
              </div>
              <button
                onClick={() => {
                  if (confirm(`Are you sure you want to delete category "${cat.label}"?`)) {
                    onDeleteCategory(cat.id);
                    showToast('Category deleted!');
                  }
                }}
                className="p-2 bg-rose-950/60 hover:bg-rose-900 text-rose-400 rounded-xl border border-rose-800/80 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add Sub Category Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 space-y-4 shadow-xl">
        <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          <span>নতুন সাব-ক্যাটাগরি যোগ করুন</span>
        </h3>
        <form onSubmit={handleAddSubCategory} className="space-y-3">
          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1">প্রধান ক্যাটাগরি সিলেক্ট করুন</label>
            <select
              value={newSubParentId}
              onChange={(e) => setNewSubParentId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.label} ({c.id})</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">সাব-ক্যাটাগরি আইডি</label>
              <input
                type="text"
                placeholder="যেমন: pubg_uc"
                value={newSubId}
                onChange={(e) => setNewSubId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">সাব-ক্যাটাগরি নাম</label>
              <input
                type="text"
                placeholder="যেমন: PUBG Mobile UC"
                value={newSubLabel}
                onChange={(e) => setNewSubLabel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>সাব-ক্যাটাগরি সেভ করুন</span>
          </button>
        </form>
      </div>

      {/* Sub Categories List */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 space-y-3 shadow-xl">
        <h3 className="text-xs font-black text-white uppercase tracking-wider">
          বর্তমান সাব-ক্যাটাগরি তালিকা ({subCategories.length})
        </h3>
        <div className="space-y-2">
          {subCategories.map((sub) => {
            const parentCat = categories.find((c) => c.id === sub.parent_category_id);
            return (
              <div key={sub.id} className="bg-slate-950 border border-slate-800/80 rounded-2xl p-3 flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-white text-xs">{sub.label}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-900">
                      Parent: {parentCat?.label || sub.parent_category_id}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">ID: {sub.id}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete sub-category "${sub.label}"?`)) {
                      onDeleteSubCategory(sub.id);
                      showToast('Sub-category deleted!');
                    }
                  }}
                  className="p-2 bg-rose-950/60 hover:bg-rose-900 text-rose-400 rounded-xl border border-rose-800/80 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
