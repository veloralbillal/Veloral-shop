import React, { useState } from 'react';
import { Product, User, Order } from '../types';
import { ArrowLeft, Zap, Truck, ShoppingCart, ShieldCheck, Share2, Check, Sparkles, Tag, Flame, Copy } from 'lucide-react';
import { ProductReviews } from './ProductReviews';

interface ProductDetailScreenProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (product: Product, quantity?: number) => void;
  onBuyNow: (product: Product, quantity?: number) => void;
  relatedProducts?: Product[];
  onSelectProduct: (product: Product) => void;
  onSelectCategory?: (category: any) => void;
  currentUser?: User | null;
  orders: Order[];
}

export const ProductDetailScreen: React.FC<ProductDetailScreenProps> = ({
  product,
  onBack,
  onAddToCart,
  onBuyNow,
  relatedProducts = [],
  onSelectProduct,
  onSelectCategory,
  currentUser,
  orders,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [copied, setCopied] = useState(false);

  const isDigital = product.category === 'digital';
  const hasDiscount = product.discount_price && product.discount_price > product.price;

  const handleShare = async () => {
    const url = new URL(window.location.href);
    url.searchParams.set('product', product.id);
    const shareUrl = url.toString();

    const shareData = {
      title: product.title,
      text: `Check out ${product.title} for ৳${product.price.toLocaleString()} on Veloral Digital & Shop!`,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Share failed:', err);
        }
        return;
      }
    }

    // Fallback to clipboard copy
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleWhatsAppShare = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('product', product.id);
    const text = encodeURIComponent(`Buy ${product.title} for ৳${product.price.toLocaleString()} on Veloral Shop: ${url.toString()}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleFacebookShare = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('product', product.id);
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url.toString())}`;
    window.open(fbUrl, '_blank', 'width=600,height=400');
  };

  return (
    <div className="bg-slate-50 text-slate-800 flex flex-col w-full">
      {/* Top Header Bar / Breadcrumb bar right below Navbar */}
      <div className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-14 sm:top-16 z-30 px-3 sm:px-6 h-12 sm:h-14 flex items-center justify-between shadow-2xs">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-700 hover:text-blue-600 bg-slate-100 hover:bg-slate-200/80 px-3 py-1.5 rounded-xl cursor-pointer transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>স্টোরে ফিরুন (Back to Store)</span>
        </button>

        <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 font-medium truncate max-w-md">
          <span className="cursor-pointer hover:text-blue-600 transition-colors" onClick={onBack}>হোম</span>
          <span>›</span>
          <span 
            className="capitalize cursor-pointer hover:text-blue-600 transition-colors font-semibold"
            onClick={() => onSelectCategory ? onSelectCategory(product.category) : onBack()}
          >
            {product.category}
          </span>
          <span>›</span>
          <span className="text-slate-900 font-bold truncate">{product.title}</span>
        </div>

        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/80 px-3 py-1.5 rounded-xl cursor-pointer transition-all"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
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

      {/* Main product presentation area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 relative">
        
        {/* Left Column: Image Container (md:span-5) */}
        <div className="md:col-span-5 space-y-4">
          <div className="rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-sm relative h-64 sm:h-80 md:h-96">
            <img
              src={product.image_url}
              alt={product.title}
              className="w-full h-full object-contain bg-slate-50"
              onError={(e) => {
                // Fallback if image fails to load
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?q=80&w=1470&auto=format&fit=crop';
              }}
            />
            
            {/* Badges on image */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
              {product.badge && (
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-full shadow-xs">
                  {product.badge}
                </span>
              )}
              <span
                className={`font-bold text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs ${
                  isDigital ? 'bg-indigo-600 text-white' : 'bg-blue-600 text-white'
                }`}
              >
                {isDigital ? <Zap className="w-3 h-3" /> : <Truck className="w-3 h-3" />}
                {isDigital ? 'Digital Product' : 'Physical Item'}
              </span>
            </div>

            {hasDiscount && (
              <div className="absolute top-3 right-3">
                <span className="bg-rose-500 text-white font-extrabold text-xs px-2.5 py-0.5 rounded-lg shadow-xs">
                  SALE
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Title & Checkout Configurator (md:span-7) */}
        <div className="md:col-span-7 flex flex-col justify-between space-y-6 bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 shadow-xs">
          <div className="space-y-4">
            {/* Meta Tags */}
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
              <span className="cursor-pointer hover:text-blue-600 transition-colors" onClick={onBack}>হোম</span>
              <span>/</span>
              <span 
                className="capitalize cursor-pointer hover:text-blue-600 transition-colors font-semibold"
                onClick={() => onSelectCategory ? onSelectCategory(product.category) : onBack()}
              >
                {product.category}
              </span>
              <span>/</span>
              <span className="text-slate-600 truncate max-w-[200px]">{product.title}</span>
            </div>

            {/* Promo Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              {product.is_flash_sale && (
                <span className="bg-rose-500 text-white font-extrabold text-[11px] px-3 py-1 rounded-full flex items-center gap-1.5 shadow-xs">
                  <Flame className="w-3.5 h-3.5 animate-pulse" />
                  <span>Flash Sale Offer</span>
                </span>
              )}
              {product.is_hot_sale && (
                <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold text-[11px] px-3 py-1 rounded-full flex items-center gap-1.5 shadow-xs">
                  <Flame className="w-3.5 h-3.5" />
                  <span>Hot Sale</span>
                </span>
              )}
              {product.is_for_you && (
                <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-[11px] px-3 py-1 rounded-full flex items-center gap-1.5 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Recommended For You</span>
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
              {product.title}
            </h1>

            {/* Product Code */}
            {product.product_code && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 inline-flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-blue-600" />
                  <span>প্রোডাক্ট কোড: #{product.product_code}</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(product.product_code || '');
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="text-xs text-blue-600 hover:text-blue-700 font-bold px-2.5 py-1 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                  title="কোড কপি করুন"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'কপি হয়েছে' : 'কোড কপি'}</span>
                </button>
              </div>
            )}

            {/* Price tag */}
            <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-baseline gap-2.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">মূল্য:</span>
                <span className="text-3xl font-black text-slate-900">
                  ৳{product.price.toLocaleString()}
                </span>
                {hasDiscount && (
                  <span className="text-sm font-semibold text-slate-400 line-through">
                    ৳{product.discount_price?.toLocaleString()}
                  </span>
                )}
              </div>

              {/* Quick Social Share Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={handleShare}
                  className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                  title="Share product"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{copied ? 'কপি হয়েছে' : 'শেয়ার'}</span>
                </button>
                <button
                  onClick={handleWhatsAppShare}
                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                  title="Share on WhatsApp"
                >
                  <span>WhatsApp</span>
                </button>
                <button
                  onClick={handleFacebookShare}
                  className="px-2.5 py-1.5 bg-blue-800 hover:bg-blue-900 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                  title="Share on Facebook"
                >
                  <span>Facebook</span>
                </button>
              </div>
            </div>

            {/* Genuine Guarantee Stamp */}
            <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-100 text-xs space-y-2.5">
              <div className="flex items-center gap-2 text-slate-700 font-bold">
                <ShieldCheck className="w-4.5 h-4.5 text-blue-600 shrink-0" />
                <span>100% Genuine with Lifetime Activation Guarantee</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 font-semibold">
                {isDigital ? (
                  <>
                    <Zap className="w-4.5 h-4.5 text-amber-500 shrink-0" />
                    <span>Instant activation credentials displayed on-screen & sent via SMS</span>
                  </>
                ) : (
                  <>
                    <Truck className="w-4.5 h-4.5 text-blue-500 shrink-0" />
                    <span>Super fast nationwide delivery with cash on delivery availability</span>
                  </>
                )}
              </div>
            </div>

            {/* Description details */}
            <div className="space-y-1.5 pt-1">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                প্রোডাক্ট বিবরণ ও স্পেসিফিকেশন:
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            {/* Quantity Selector Selector row */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">পরিমাণ (Quantity):</span>
              <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1.5 hover:bg-slate-200/80 text-slate-700 font-bold transition-colors cursor-pointer text-sm"
                >
                  -
                </button>
                <span className="px-4 py-1.5 font-bold font-mono text-xs sm:text-sm text-slate-900 bg-white border-x border-slate-200 min-w-[40px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1.5 hover:bg-slate-200/80 text-slate-700 font-bold transition-colors cursor-pointer text-sm"
                >
                  +
                </button>
              </div>
            </div>

            {/* Actions CTA panel */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  onAddToCart(product, quantity);
                }}
                className="py-3 px-4 rounded-2xl font-black text-xs sm:text-sm bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <ShoppingCart className="w-4.5 h-4.5" />
                <span>কার্টে যোগ করুন</span>
              </button>

              <button
                onClick={() => {
                  onBuyNow(product, quantity);
                }}
                className="py-3 px-4 rounded-2xl font-black text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/10 cursor-pointer"
              >
                <Zap className="w-4.5 h-4.5 text-amber-300" />
                <span>সরাসরি কিনুন (Buy Now)</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Recommended Related products grid */}
      {relatedProducts.length > 0 && (
        <section className="bg-white border-t border-slate-200/60 p-6 sm:p-8 w-full max-w-5xl mx-auto rounded-t-3xl mt-6">
          <div className="flex items-center gap-1.5 mb-5">
            <Sparkles className="w-4.5 h-4.5 text-amber-400" />
            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">সম্পর্কিত অন্যান্য প্রোডাক্টস (You may also like)</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {relatedProducts.slice(0, 4).map(prod => (
              <div
                key={prod.id}
                onClick={() => {
                  onSelectProduct(prod);
                  setQuantity(1);
                  // Update URL parameter dynamically
                  const newUrl = `${window.location.origin}${window.location.pathname}?product=${prod.id}`;
                  window.history.pushState({ path: newUrl }, '', newUrl);
                }}
                className="group bg-slate-50 border border-slate-200/80 rounded-2xl p-2.5 cursor-pointer hover:border-blue-300 hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-full h-24 rounded-xl overflow-hidden bg-slate-100">
                    <img src={prod.image_url} alt={prod.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-[11px] leading-snug mt-2 line-clamp-2">{prod.title}</h4>
                </div>
                <p className="font-mono text-xs font-black text-slate-950 mt-1">৳{prod.price.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </section>
      )}
      {/* Product Reviews Section */}
      <section className="bg-white border-t border-slate-200/60 p-6 sm:p-8 w-full max-w-5xl mx-auto rounded-b-3xl mb-8">
        <ProductReviews 
          productId={product.id} 
          productTitle={product.title}
          currentUser={currentUser}
          orders={orders}
        />
      </section>
    </div>
  );
};
