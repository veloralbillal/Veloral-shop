import React, { useState } from 'react';
import { AccountItem, User } from '../../types';
import { 
  ArrowLeft, ShieldCheck, Zap, ShoppingBag, Check, Lock, Smartphone, 
  Globe, Key, Award, AlertCircle, Sparkles, CheckCircle2, Share2, Copy 
} from 'lucide-react';

interface AccountDetailScreenProps {
  account: AccountItem;
  onBack: () => void;
  onAddToCart: (account: AccountItem) => void;
  onBuyNow: (account: AccountItem) => void;
  currentUser: User | null;
}

export const AccountDetailScreen: React.FC<AccountDetailScreenProps> = ({
  account,
  onBack,
  onAddToCart,
  onBuyNow,
  currentUser,
}) => {
  const [copied, setCopied] = useState(false);
  const hasDiscount = account.discount_price && account.discount_price > account.price;
  const discountPercent = hasDiscount
    ? Math.round(((account.discount_price! - account.price) / account.discount_price!) * 100)
    : null;

  const handleShare = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('account', account.id);
    navigator.clipboard.writeText(url.toString()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="bg-slate-950 text-slate-100 flex flex-col w-full min-h-screen font-sans pb-12">
      {/* Top Header Bar / Breadcrumb bar right below Navbar */}
      <div className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 sticky top-14 sm:top-16 z-30 px-3 sm:px-6 h-12 sm:h-14 flex items-center justify-between shadow-md">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-300 hover:text-blue-400 bg-slate-800 hover:bg-slate-750 px-3 py-1.5 rounded-xl cursor-pointer transition-all border border-slate-700/60"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>স্টোরে ফিরুন (Back to Store)</span>
        </button>

        <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 font-medium truncate max-w-md">
          <span className="cursor-pointer hover:text-blue-400 transition-colors" onClick={onBack}>হোম</span>
          <span>›</span>
          <span className="text-slate-200 capitalize font-semibold">অ্যাকাউন্টস</span>
          <span>›</span>
          <span className="text-slate-100 font-bold truncate">{account.title}</span>
        </div>

        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 rounded-xl cursor-pointer transition-all border border-blue-500/20"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>লিঙ্ক কপি হয়েছে!</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5" />
              <span>শেয়ার করুন</span>
            </>
          )}
        </button>
      </div>

      {/* Main Account details display layout */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 relative z-10">
        
        {/* Left Column: Icon/Image representation (md:span-5) */}
        <div className="md:col-span-5 space-y-4">
          <div className="rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl relative h-64 sm:h-80 md:h-96 flex items-center justify-center p-8">
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:20px_20px]" />
            <img
              src={account.image_url}
              alt={account.title}
              className="max-w-[70%] max-h-[70%] object-contain bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-2xl relative z-10"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?q=80&w=1470&auto=format&fit=crop';
              }}
            />
            
            {/* Badges on image */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5 items-start z-20">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-blue-500/20 text-blue-400 border border-blue-500/30 backdrop-blur-md">
                {account.category}
              </span>
              {account.badge && (
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 backdrop-blur-md">
                  <Check className="w-3.5 h-3.5" />
                  <span>{account.badge}</span>
                </span>
              )}
            </div>

            {discountPercent && (
              <div className="absolute top-4 right-4 z-20">
                <span className="bg-rose-500 text-white font-extrabold text-xs px-3 py-1 rounded-lg shadow-lg">
                  -{discountPercent}% ছাড়
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Content/Configurator (md:span-7) */}
        <div className="md:col-span-7 flex flex-col justify-between space-y-6 bg-slate-900 border border-slate-800 p-5 sm:p-7 rounded-3xl shadow-xl">
          <div className="space-y-4">
            
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-black bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase">
                Premium Verified Accounts
              </span>
              <span className="px-3 py-1 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>ইনস্ট্যান্ট অটো ডেলিভারি</span>
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white leading-snug">
              {account.title}
            </h1>

            <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-400">
              <span className="font-mono bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 inline-flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-blue-400" />
                <span>SKU/প্রোডাক্ট কোড: #{account.product_code || account.id}</span>
              </span>
            </div>

            {/* Price panel */}
            <div className="p-4 sm:p-5 bg-slate-950/80 border border-slate-800/80 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider">বিক্রয় মূল্য (Price)</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-3xl font-black text-blue-400">
                    ৳{account.price.toLocaleString()}
                  </span>
                  {hasDiscount && (
                    <span className="text-sm font-semibold text-slate-500 line-through">
                      ৳{account.discount_price?.toLocaleString()}
                    </span>
                  )}
                  <span className="text-xs text-slate-400 font-mono font-black">BDT</span>
                </div>
              </div>
              
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider">স্টক স্ট্যাটাস</span>
                <span className="text-sm font-black text-emerald-400 block mt-0.5">
                  {account.stock > 0 ? `${account.stock} টি স্টকে আছে` : 'স্টক শেষ'}
                </span>
              </div>
            </div>

            {/* What you will receive checklist */}
            <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-2xl space-y-3">
              <h4 className="font-black text-white text-xs flex items-center gap-1.5 border-b border-slate-800/80 pb-2">
                <Key className="w-3.5 h-3.5 text-purple-400" />
                <span>এই অর্ডারের সাথে আপনি যা পাবেন:</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
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
                  <span>পূর্ণাঙ্গ পাসওয়ার্ড পরিবর্তন সুবিধা</span>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="p-4 bg-blue-600/10 border border-blue-500/20 text-xs text-blue-300 rounded-2xl flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 shrink-0 text-blue-400 mt-0.5" />
              <p className="leading-relaxed">
                নিরাপত্তা সতর্কতা: পেমেন্ট সম্পন্ন হওয়ার সাথে সাথেই অ্যাকাউন্টের লগইন তথ্য আপনার স্ক্রিনে, অর্ডার ট্র্যাকারে এবং প্রোফাইলের <strong>ডিজিটাল ভল্ট</strong>-এ স্বয়ংক্রিয়ভাবে সংরক্ষিত থাকবে।
              </p>
            </div>

            {/* Description details */}
            <div className="space-y-2 pt-1">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                অ্যাকাউন্টের বিবরণ ও ব্যবহারের নির্দেশনা:
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-wrap bg-slate-950/40 p-4 rounded-2xl border border-slate-800 border-dashed">
                {account.description}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5 pt-4 border-t border-slate-800">
            <button
              onClick={() => onAddToCart(account)}
              disabled={account.stock <= 0}
              className={`py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                account.stock <= 0
                  ? 'bg-slate-800/40 text-slate-500 border-slate-800 cursor-not-allowed'
                  : 'bg-slate-800 hover:bg-slate-750 text-white border-slate-700'
              }`}
            >
              <ShoppingBag className="w-4.5 h-4.5 text-amber-400" />
              <span>কার্টে যোগ করুন</span>
            </button>

            <button
              onClick={() => onBuyNow(account)}
              disabled={account.stock <= 0}
              className={`py-3 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                account.stock <= 0
                  ? 'bg-slate-800 text-slate-500 border border-slate-800 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-xl shadow-blue-600/30 cursor-pointer transform hover:scale-[1.02]'
              }`}
            >
              <Zap className="w-4.5 h-4.5 fill-white" />
              <span>{account.stock <= 0 ? 'স্টক শেষ' : 'এখনই কিনুন'}</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
