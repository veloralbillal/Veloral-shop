import React, { useState } from 'react';
import { Review, Product } from '../../types';
import { Star, Trash2, Search, AlertCircle, ShoppingBag, User, Calendar, Filter } from 'lucide-react';

interface MobileReviewsManagerProps {
  reviews: Review[];
  products: Product[];
  onDeleteReview: (id: string) => Promise<void>;
  showToast: (msg: string) => void;
}

export const MobileReviewsManager: React.FC<MobileReviewsManagerProps> = ({
  reviews,
  products,
  onDeleteReview,
  showToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRating, setSelectedRating] = useState<number | 'all'>('all');

  const filteredReviews = reviews.filter((r) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesRating = selectedRating === 'all' || r.rating === selectedRating;
    if (!matchesRating) return false;

    if (!q) return true;
    const prod = products.find((p) => p.id === r.product_id);
    return (
      r.user_name.toLowerCase().includes(q) ||
      r.comment.toLowerCase().includes(q) ||
      r.product_id.toLowerCase().includes(q) ||
      (prod && prod.title.toLowerCase().includes(q))
    );
  });

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : '5.0';

  const fiveStarCount = reviews.filter((r) => r.rating === 5).length;

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`আপনি কি ${name}-এর রিভিউটি ডিলিট করতে চান?`)) {
      await onDeleteReview(id);
      showToast('রিভিউ সফলভাবে ডিলিট করা হয়েছে!');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
          <span>প্রোডাক্ট রিভিউ ম্যানেজমেন্ট ({reviews.length})</span>
        </h2>
        <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-800 px-2 py-1 rounded-full font-bold">
          📱 Mobile Optimized
        </span>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 text-center">
          <span className="text-[10px] text-slate-400 block font-bold">মোট রিভিউ</span>
          <span className="text-base sm:text-lg font-black text-white">{reviews.length}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 text-center">
          <span className="text-[10px] text-amber-400 block font-bold flex items-center justify-center gap-1">
            <Star className="w-3 h-3 fill-amber-400 inline" /> গড় রেটিং
          </span>
          <span className="text-base sm:text-lg font-black text-amber-400">{averageRating}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 text-center">
          <span className="text-[10px] text-emerald-400 block font-bold">৫-স্টার রিভিউ</span>
          <span className="text-base sm:text-lg font-black text-emerald-400">{fiveStarCount}</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="গ্রাহকের নাম, মন্তব্য বা প্রোডাক্ট দিয়ে খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 shadow-inner"
          />
        </div>

        {/* Rating Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: 'all', label: 'সকল রিভিউ' },
            { id: 5, label: '★★★★★ (৫)' },
            { id: 4, label: '★★★★ (৪)' },
            { id: 3, label: '★★★ (৩)' },
            { id: 2, label: '★★ (২)' },
            { id: 1, label: '★ (১)' },
          ].map((chip) => {
            const isActive = selectedRating === chip.id;
            return (
              <button
                key={String(chip.id)}
                onClick={() => setSelectedRating(chip.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Reviews Cards List */}
      {filteredReviews.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl text-xs text-slate-500 space-y-2">
          <AlertCircle className="w-8 h-8 mx-auto text-slate-600" />
          <p className="font-bold text-slate-300">কোনো প্রোডাক্ট রিভিউ পাওয়া যায়নি।</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReviews.map((r) => {
            const prod = products.find((p) => p.id === r.product_id);
            return (
              <div
                key={r.id}
                className="bg-slate-900 border border-slate-800/90 rounded-3xl p-4 space-y-3 shadow-xl transition-all hover:border-slate-700"
              >
                {/* Header: User & Rating */}
                <div className="flex items-start justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-black text-xs shadow-sm">
                      {r.user_name ? r.user_name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-white text-xs">{r.user_name}</h3>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3 inline text-slate-600" />
                        {new Date(r.created_at).toLocaleDateString('bn-BD', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Star Rating Display */}
                  <div className="flex items-center gap-1 bg-slate-950/80 px-2.5 py-1 rounded-xl border border-slate-800">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3 h-3 ${
                            s <= r.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-black text-amber-400 ml-1">{r.rating}.0</span>
                  </div>
                </div>

                {/* Product Info Chip */}
                <div className="bg-slate-950/70 p-2.5 rounded-2xl border border-slate-800/70 flex items-center gap-2 text-xs">
                  <ShoppingBag className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="text-slate-400 font-medium shrink-0">প্রোডাক্ট:</span>
                  <span className="font-bold text-slate-200 truncate" title={prod?.title}>
                    {prod?.title || 'Unknown Product'}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 ml-auto shrink-0">
                    #{r.product_id.slice(0, 8)}
                  </span>
                </div>

                {/* Comment Bubble */}
                <div className="bg-slate-950/40 p-3 rounded-2xl border border-slate-800/50 text-xs text-slate-300 italic leading-relaxed">
                  "{r.comment}"
                </div>

                {/* Action Row */}
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => handleDelete(r.id, r.user_name)}
                    className="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-400 text-xs font-bold rounded-xl border border-rose-800/80 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>রিভিউ মুছুন</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
