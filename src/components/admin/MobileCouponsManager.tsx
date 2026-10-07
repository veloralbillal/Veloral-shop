import React, { useState } from 'react';
import { Coupon } from '../../types';
import { Tag, Plus, Trash2, CheckCircle2, AlertCircle, Search, Percent, DollarSign } from 'lucide-react';

interface MobileCouponsManagerProps {
  coupons: Coupon[];
  onSaveCoupons: (coupons: Coupon[]) => Promise<void>;
  onDeleteCoupon: (code: string) => Promise<void>;
  showToast: (msg: string) => void;
}

export const MobileCouponsManager: React.FC<MobileCouponsManagerProps> = ({
  coupons,
  onSaveCoupons,
  onDeleteCoupon,
  showToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponType, setNewCouponType] = useState<'percent' | 'flat'>('flat');
  const [newCouponValue, setNewCouponValue] = useState<number | ''>(50);
  const [newCouponMin, setNewCouponMin] = useState<number | ''>(0);

  const filteredCoupons = coupons.filter((c) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return c.code.toLowerCase().includes(q);
  });

  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim() || newCouponValue === '' || newCouponValue <= 0) {
      showToast('দয়া করে কোড এবং ডিসকাউন্টের সঠিক পরিমাণ দিন');
      return;
    }
    const cleanCode = newCouponCode.trim().toUpperCase();
    if (coupons.some((c) => c.code === cleanCode)) {
      showToast('এই কুপন কোডটি ইতিমধ্যে বিদ্যমান!');
      return;
    }

    const newCoupon: Coupon = {
      code: cleanCode,
      discount_type: newCouponType,
      discount_value: Number(newCouponValue),
      min_order_amount: newCouponMin !== '' ? Number(newCouponMin) : undefined,
      active: true,
    };

    const updated = [...coupons, newCoupon];
    await onSaveCoupons(updated);
    showToast('কুপন সফলভাবে তৈরি হয়েছে!');
    setNewCouponCode('');
    setNewCouponValue(50);
    setNewCouponMin(0);
  };

  const handleToggleActive = async (code: string) => {
    const updated = coupons.map((c) => (c.code === code ? { ...c, active: !c.active } : c));
    await onSaveCoupons(updated);
    showToast('কুপন স্ট্যাটাস আপডেট হয়েছে!');
  };

  const handleDelete = async (code: string) => {
    if (confirm(`Are you sure you want to delete coupon "${code}"?`)) {
      await onDeleteCoupon(code);
      showToast('কুপন মুছে ফেলা হয়েছে!');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
          <Tag className="w-5 h-5 text-blue-500" />
          <span>ডিসকাউন্ট কুপন ম্যানেজমেন্ট ({coupons.length})</span>
        </h2>
        <span className="text-[10px] bg-blue-950 text-blue-300 border border-blue-800 px-2 py-1 rounded-full font-bold">
          📱 Mobile Optimized
        </span>
      </div>

      {/* Add New Coupon Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 space-y-4 shadow-xl">
        <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
          <Plus className="w-4 h-4 text-emerald-400" />
          <span>নতুন ডিসকাউন্ট কুপন তৈরি করুন</span>
        </h3>
        <form onSubmit={handleAddCoupon} className="space-y-3">
          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1">কুপন কোড (যেমন: EID50, DISCOUNT100)</label>
            <input
              type="text"
              placeholder="যেমন: EID2026"
              value={newCouponCode}
              onChange={(e) => setNewCouponCode(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono uppercase"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">ডিসকাউন্ট টাইপ</label>
              <select
                value={newCouponType}
                onChange={(e) => setNewCouponType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="flat">ফ্ল্যাট ডিসকাউন্ট (৳)</option>
                <option value="percent">শতকরা ডিসকাউন্ট (%)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">পরিমাণ (Value)</label>
              <input
                type="number"
                placeholder="যেমন: 50 বা 10"
                value={newCouponValue}
                onChange={(e) => setNewCouponValue(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">সর্বনিম্ন অর্ডার (৳)</label>
              <input
                type="number"
                placeholder="যেমন: 500 (ঐচ্ছিক)"
                value={newCouponMin}
                onChange={(e) => setNewCouponMin(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>কুপন কোড সেভ করুন</span>
          </button>
        </form>
      </div>

      {/* Search & Coupons List */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="কুপন কোড দিয়ে খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-inner uppercase font-mono"
          />
        </div>

        {filteredCoupons.length === 0 ? (
          <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl text-xs text-slate-500 space-y-2">
            <AlertCircle className="w-8 h-8 mx-auto text-slate-600" />
            <p className="font-bold text-slate-300">কোনো কুপন পাওয়া যায়নি।</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCoupons.map((c) => {
              const isActive = c.active;
              return (
                <div
                  key={c.code}
                  className={`bg-slate-900 border rounded-3xl p-4 space-y-3 shadow-xl transition-all ${
                    isActive ? 'border-emerald-500/30 bg-gradient-to-b from-slate-900 to-emerald-950/10' : 'border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-blue-950/80 text-blue-400 rounded-xl border border-blue-900">
                        <Tag className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-mono font-black text-white text-sm tracking-wider">{c.code}</span>
                        <span className="text-[10px] text-slate-500 block">
                          {c.discount_type === 'percent' ? 'শতকরা ডিসকাউন্ট' : 'ফ্ল্যাট ডিসকাউন্ট'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleActive(c.code)}
                      className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase cursor-pointer transition-all ${
                        isActive
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800 shadow-sm'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {isActive ? '✓ সক্রিয়' : '✕ নিষ্ক্রিয়'}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-950/60 p-2.5 rounded-2xl border border-slate-800/60">
                      <span className="text-[10px] text-slate-400 block">ছাড়ের পরিমাণ</span>
                      <span className="font-mono font-black text-amber-400 text-sm">
                        {c.discount_type === 'percent' ? `${c.discount_value}%` : `৳${c.discount_value}`}
                      </span>
                    </div>

                    <div className="bg-slate-950/60 p-2.5 rounded-2xl border border-slate-800/60">
                      <span className="text-[10px] text-slate-400 block">সর্বনিম্ন অর্ডার</span>
                      <span className="font-mono font-bold text-white text-xs">
                        {c.min_order_amount ? `৳${c.min_order_amount}` : 'কোনো লিমিট নেই'}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => handleDelete(c.code)}
                      className="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-400 text-xs font-bold rounded-xl border border-rose-800/80 flex items-center gap-1.5 cursor-pointer transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>মুছে ফেলুন</span>
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
