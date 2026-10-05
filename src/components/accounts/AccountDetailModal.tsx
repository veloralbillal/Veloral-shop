import React from 'react';
import { AccountItem, User } from '../../types';
import { 
  X, ShieldCheck, Zap, ShoppingBag, Check, Lock, Smartphone, 
  Globe, Key, Award, AlertCircle, Sparkles, CheckCircle2 
} from 'lucide-react';

interface AccountDetailModalProps {
  account: AccountItem;
  onClose: () => void;
  onAddToCart: (account: AccountItem) => void;
  onBuyNow: (account: AccountItem) => void;
  currentUser: User | null;
}

export const AccountDetailModal: React.FC<AccountDetailModalProps> = ({
  account,
  onClose,
  onAddToCart,
  onBuyNow,
  currentUser,
}) => {
  const hasDiscount = account.discount_price && account.discount_price > account.price;
  const discountPercent = hasDiscount
    ? Math.round(((account.discount_price! - account.price) / account.discount_price!) * 100)
    : null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl relative space-y-6 text-slate-100 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Header Info */}
        <div className="flex items-start gap-4">
          <div className="relative">
            <img
              src={account.image_url}
              alt={account.title}
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-2xl bg-slate-950 border border-slate-800 p-2.5 shrink-0 shadow-lg"
            />
            <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
            </span>
          </div>

          <div className="space-y-1.5 flex-1 min-w-0 pr-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-500/20 text-blue-400 border border-blue-500/30">
                {account.category}
              </span>
              {discountPercent && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  -{discountPercent}% ছাড়
                </span>
              )}
              {account.badge && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <Check className="w-2.5 h-2.5" />
                  <span>{account.badge}</span>
                </span>
              )}
            </div>

            <h2 className="text-base sm:text-xl font-black text-white leading-snug">
              {account.title}
            </h2>

            <div className="flex items-center gap-3 font-mono text-xs text-slate-400">
              <span>SKU: {account.product_code || account.id}</span>
              <span>•</span>
              <span className="text-emerald-400 font-bold">স্টক: {account.stock} টি উপলব্ধ</span>
            </div>
          </div>
        </div>

        {/* Pricing & Instant Delivery Bar */}
        <div className="p-4 sm:p-5 bg-slate-950/80 border border-slate-800/90 rounded-2xl flex items-center justify-between shadow-inner">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">অ্যাকাউন্টের বিক্রয় মূল্য</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl sm:text-3xl font-black text-blue-400">৳{account.price}</span>
              {hasDiscount && (
                <span className="text-xs sm:text-sm text-slate-500 line-through">৳{account.discount_price}</span>
              )}
              <span className="text-xs text-slate-400 uppercase font-mono font-bold">BDT</span>
            </div>
          </div>
          
          <div className="text-right">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-black animate-pulse">
              <Zap className="w-3.5 h-3.5 fill-emerald-400" />
              <span>ইনস্ট্যান্ট ডেলিভারি</span>
            </span>
          </div>
        </div>

        {/* What You Will Receive */}
        <div className="p-4 bg-slate-950/50 border border-slate-800/80 rounded-2xl space-y-2.5 text-xs">
          <h4 className="font-black text-white flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-purple-400" />
            <span>অর্ডারের সাথে আপনি যা পাবেন:</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>সম্পূর্ণ লগইন ইউজারনেম ও পাসওয়ার্ড</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>২এফএ ব্যাকআপ সিক্রেট কি / সেশন ফাইল</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>২৪ ঘণ্টার ফুল রিপ্লেসমেন্ট গ্যারান্টি</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>পূর্ণাঙ্গ মালিকানা ও পাসওয়ার্ড পরিবর্তন সুবিধা</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-300 uppercase">অ্যাকাউন্টের বিস্তারিত বিবরণ:</h4>
          <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap bg-slate-950/40 p-4 rounded-2xl border border-slate-800/60 max-h-40 overflow-y-auto">
            {account.description}
          </div>
        </div>

        {/* Security Notice */}
        <div className="p-3.5 bg-blue-600/10 border border-blue-500/20 rounded-2xl flex items-start gap-3 text-xs text-blue-300">
          <ShieldCheck className="w-5 h-5 shrink-0 text-blue-400 mt-0.5" />
          <p className="leading-relaxed">
            পেমেন্ট সফল হওয়ার সাথে সাথেই অ্যাকাউন্টের লগইন তথ্য আপনার স্ক্রিনে, অর্ডার ট্র্যাকারে এবং প্রোফাইলের <strong>ডিজিটাল ভল্ট</strong>-এ স্বয়ংক্রিয়ভাবে দেখতে পাবেন।
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => onAddToCart(account)}
            disabled={account.stock <= 0}
            className={`py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border ${
              account.stock <= 0
                ? 'bg-slate-800/60 text-slate-500 border-slate-800 cursor-not-allowed'
                : 'bg-slate-800 hover:bg-slate-750 text-white border-slate-700'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-amber-400" />
            <span>কার্টে যোগ করুন</span>
          </button>
          
          <button
            onClick={() => onBuyNow(account)}
            disabled={account.stock <= 0}
            className={`py-3 px-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all ${
              account.stock <= 0
                ? 'bg-slate-800 text-slate-500 border border-slate-800 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-xl shadow-blue-600/30 cursor-pointer transform hover:scale-[1.02]'
            }`}
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>{account.stock <= 0 ? 'স্টক শেষ' : 'এখনই কিনুন'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
