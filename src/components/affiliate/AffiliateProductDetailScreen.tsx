import React, { useState } from 'react';
import { AffiliateProduct, User } from '../../types';
import { recordAffiliateClick } from '../../services/db';
import { 
  ArrowLeft, ExternalLink, ShieldCheck, Zap, Share2, Check, Sparkles, Tag, HelpCircle, AlertCircle 
} from 'lucide-react';

interface AffiliateProductDetailScreenProps {
  product: AffiliateProduct;
  onBack: () => void;
  currentUser: User | null;
}

export const AffiliateProductDetailScreen: React.FC<AffiliateProductDetailScreenProps> = ({
  product,
  onBack,
  currentUser,
}) => {
  const [copied, setCopied] = useState(false);
  const discount = product.old_price 
    ? Math.round(((product.old_price - product.price) / product.old_price) * 100) 
    : 0;

  const handleShare = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('aff_product', product.id);
    navigator.clipboard.writeText(url.toString()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleBuyNow = async () => {
    try {
      await recordAffiliateClick(product.id, currentUser?.id || null);
    } catch (err) {
      console.error('Failed to record click:', err);
    } finally {
      window.open(product.affiliate_url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="bg-slate-950 text-slate-100 flex flex-col w-full min-h-screen font-sans pb-12">
      
      {/* Navigation & Share bar */}
      <div className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 sticky top-14 sm:top-16 z-30 px-3 sm:px-6 h-12 sm:h-14 flex items-center justify-between shadow-md">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-300 hover:text-blue-400 bg-slate-800 hover:bg-slate-750 px-3 py-1.5 rounded-xl cursor-pointer transition-all border border-slate-700/60"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ডিল তালিকায় ফিরুন (Back to Deals)</span>
        </button>

        <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 font-medium truncate max-w-md">
          <span className="cursor-pointer hover:text-blue-400 transition-colors" onClick={onBack}>অ্যাফিলিয়েট</span>
          <span>›</span>
          <span className="text-slate-200 capitalize font-semibold">{product.category_id}</span>
          <span>›</span>
          <span className="text-slate-100 font-bold truncate">{product.name}</span>
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
              <span>ডিল লিঙ্ক শেয়ার করুন</span>
            </>
          )}
        </button>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 relative z-10">
        
        {/* Left Column: Product Image */}
        <div className="md:col-span-5 space-y-4">
          <div className="rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl relative h-64 sm:h-80 md:h-96 flex items-center justify-center p-8">
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:20px_20px]" />
            <img
              src={product.image}
              alt={product.name}
              className="max-w-[75%] max-h-[75%] object-contain bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-2xl relative z-10"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?q=80&w=1470&auto=format&fit=crop';
              }}
            />

            <div className="absolute top-4 left-4 flex flex-col gap-1.5 items-start z-20">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-blue-500/20 text-blue-400 border border-blue-500/30 backdrop-blur-md">
                {product.category_id}
              </span>
              {product.featured && (
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1 backdrop-blur-md">
                  <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>FEATURED DEAL</span>
                </span>
              )}
            </div>

            {discount > 0 && (
              <div className="absolute top-4 right-4 z-20">
                <span className="bg-rose-500 text-white font-extrabold text-xs px-3 py-1 rounded-lg shadow-lg">
                  -{discount}% অফার ডিল
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Descriptions & External CTA */}
        <div className="md:col-span-7 flex flex-col justify-between space-y-6 bg-slate-900 border border-slate-800 p-5 sm:p-7 rounded-3xl shadow-xl">
          <div className="space-y-4">
            
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-black bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase">
                {product.store_name} Verified Deal
              </span>
              <span className="px-3 py-1 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>ডিসকাউন্টেড প্রাইস</span>
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white leading-snug">
              {product.name}
            </h1>

            {/* Price display block */}
            <div className="p-4 sm:p-5 bg-slate-950/80 border border-slate-800/80 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider">ডিল বিক্রয় মূল্য (Offer Price)</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-3xl font-black text-blue-400">
                    ৳{product.price.toLocaleString()}
                  </span>
                  {product.old_price && (
                    <span className="text-sm font-semibold text-slate-500 line-through">
                      ৳{product.old_price.toLocaleString()}
                    </span>
                  )}
                  <span className="text-xs text-slate-400 font-mono font-black">{product.currency || 'BDT'}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider">রিসোর্স পার্টনার</span>
                <span className="text-sm font-black text-amber-400 block mt-0.5 capitalize">
                  {product.store_name}
                </span>
              </div>
            </div>

            {/* Critical Affiliate Disclaimer Notice */}
            <div className="p-4 bg-blue-600/10 border border-blue-500/20 text-xs text-blue-300 rounded-2xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-blue-400 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-white block">পার্টনার সাইট নোটিশ (Affiliate Disclaimer):</span>
                <p className="leading-relaxed">
                  এই প্রোডাক্টটি আমাদের একটি বহির্গামী পার্টনার ডিল সাইটে (যেমন: Daraz, AliExpress, ইত্যাদি) উপলব্ধ রয়েছে। "কিনুন / Buy Now" বাটনে ক্লিক করলে আপনি পার্টনার সাইটে স্থানান্তরিত হবেন এবং ডিলটি সম্পন্ন করতে পারবেন। আমরা সরাসরি পণ্যটি বিক্রি বা শিপ করি না।
                </p>
              </div>
            </div>

            {/* Short description */}
            {product.short_description && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">সংক্ষিপ্ত বিবরণ</span>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {product.short_description}
                </p>
              </div>
            )}

            {/* Full description */}
            <div className="space-y-2 pt-2 border-t border-slate-850">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                পণ্যটির বিস্তারিত বিবরণ:
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-wrap bg-slate-950/40 p-4 rounded-2xl border border-slate-800 border-dashed">
                {product.description || 'পণ্যটির বিস্তারিত বিবরণ বর্তমানে পাওয়া যায়নি। অফারটি চেক করতে সরাসরি পার্টনার সাইটে ভিজিট করুন।'}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={handleBuyNow}
              className="w-full py-3.5 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-xl shadow-blue-600/30 cursor-pointer transform hover:scale-[1.01]"
            >
              <ExternalLink className="w-4.5 h-4.5" />
              <span>পার্টনার সাইটে ডিলটি দেখুন (Buy on {product.store_name})</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
