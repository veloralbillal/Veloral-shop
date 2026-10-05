import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, ArrowRight, Trash2, Plus, Minus, Tag, 
  CheckCircle2, ShieldCheck, Zap, Truck, ArrowLeft, 
  Sparkles, MessageCircle, AlertCircle, Check, ChevronRight
} from 'lucide-react';
import { CartItem, Product, StoreSettings, Coupon } from '../types';
import { fetchCoupons } from '../services/db';

interface CartScreenProps {
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onProceedToCheckout: () => void;
  onContinueShopping: () => void;
  onSelectProduct?: (product: Product) => void;
  onAddToCart?: (product: Product, quantity?: number) => void;
  popularProducts?: Product[];
  settings: StoreSettings;
}

export const CartScreen: React.FC<CartScreenProps> = ({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedToCheckout,
  onContinueShopping,
  onSelectProduct,
  onAddToCart,
  popularProducts = [],
  settings,
}) => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    fetchCoupons().then(setCoupons).catch(console.error);
  }, []);

  const totalItemsCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);
  const subtotalAmount = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const hasPhysical = cartItems.some((item) => item.product.category === 'physical');
  const hasDigital = cartItems.some((item) => item.product.category === 'digital');
  
  // Free delivery threshold: ৳2,000 for physical goods
  const freeDeliveryThreshold = 2000;
  const isFreeDeliveryUnlocked = !hasPhysical || subtotalAmount >= freeDeliveryThreshold;
  const deliveryFee = hasPhysical ? (isFreeDeliveryUnlocked ? 0 : 60) : 0;
  
  // Recalculate discount if cart changes
  useEffect(() => {
    if (appliedCoupon) {
      if (appliedCoupon.min_order_amount && subtotalAmount < appliedCoupon.min_order_amount) {
        setAppliedCoupon(null);
        setAppliedDiscount(0);
        setCouponSuccess('');
        setCouponError(`কুপনটি বজায় রাখতে কমপক্ষে ৳${appliedCoupon.min_order_amount} টাকার অর্ডার প্রয়োজন।`);
      } else {
        let disc = 0;
        if (appliedCoupon.discount_type === 'percent') {
          disc = Math.round((subtotalAmount * appliedCoupon.discount_value) / 100);
        } else {
          disc = appliedCoupon.discount_value;
        }
        setAppliedDiscount(Math.min(disc, subtotalAmount));
      }
    }
  }, [subtotalAmount, appliedCoupon]);

  const handleApplyCoupon = (codeToApply?: string) => {
    setCouponError('');
    setCouponSuccess('');
    const code = (codeToApply || couponCode).trim().toUpperCase();

    if (!code) {
      setCouponError('দয়া করে একটি কুপন কোড লিখুন!');
      return;
    }

    const matched = coupons.find(c => c.code.toUpperCase() === code);
    if (!matched) {
      setCouponError('দুঃখিত! এই কুপন কোডটি সঠিক নয়।');
      return;
    }
    if (!matched.active) {
      setCouponError('দুঃখিত! এই কুপনটির মেয়াদ শেষ হয়েছে।');
      return;
    }
    if (matched.min_order_amount && subtotalAmount < matched.min_order_amount) {
      setCouponError(`এই কুপনটির জন্য কমপক্ষে ৳${matched.min_order_amount} টাকার অর্ডার প্রয়োজন!`);
      return;
    }

    let disc = 0;
    if (matched.discount_type === 'percent') {
      disc = Math.round((subtotalAmount * matched.discount_value) / 100);
    } else {
      disc = matched.discount_value;
    }

    setAppliedCoupon(matched);
    setAppliedDiscount(Math.min(disc, subtotalAmount));
    setCouponCode(matched.code);
    setCouponSuccess(`অভিনন্দন! "${matched.code}" কুপন সফলভাবে প্রয়োগ হয়েছে (-৳${disc})`);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setAppliedDiscount(0);
    setCouponCode('');
    setCouponSuccess('');
    setCouponError('');
  };

  const grandTotal = Math.max(0, subtotalAmount + deliveryFee - appliedDiscount);
  const deliveryShortfall = Math.max(0, freeDeliveryThreshold - subtotalAmount);
  const freeDeliveryProgress = Math.min(100, Math.round((subtotalAmount / freeDeliveryThreshold) * 100));

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 min-h-screen pb-24 lg:pb-16 selection:bg-blue-600 selection:text-white">
      {/* Top Breadcrumb & Navigation */}
      <div className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <button
            onClick={onContinueShopping}
            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:-translate-x-0.5 transition-transform" />
            <span>কেনাকাটায় ফিরে যান (Shop)</span>
          </button>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 hidden sm:inline">হোম</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600 hidden sm:inline" />
            <span className="text-blue-400 font-bold">শপিং কার্ট</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
                <span>আমার শপিং কার্ট</span>
                {cartItems.length > 0 && (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {totalItemsCount} টি আইটেম
                  </span>
                )}
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                অর্ডার নিশ্চিত করতে আইটেমগুলোর পরিমাণ যাচাই করে চেকআউট সম্পন্ন করুন
              </p>
            </div>
          </div>

          {cartItems.length > 0 && (
            <div className="flex items-center gap-2">
              {showClearConfirm ? (
                <div className="flex items-center gap-1.5 bg-rose-950/60 p-1.5 rounded-xl border border-rose-800 animate-in fade-in">
                  <span className="text-[11px] text-rose-300 font-bold px-2">সব মুছবেন?</span>
                  <button
                    onClick={() => {
                      onClearCart();
                      setShowClearConfirm(false);
                    }}
                    className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
                  >
                    হ্যাঁ, মুছুন
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                  >
                    না
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 border border-slate-800 hover:border-rose-900 rounded-xl transition-all cursor-pointer font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>কার্ট খালি করুন</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Free Delivery Meter */}
        {cartItems.length > 0 && hasPhysical && (
          <div className="my-6 p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950/40 border border-slate-800/80 shadow-md">
            <div className="flex items-center justify-between gap-2 text-xs mb-2">
              <span className="flex items-center gap-1.5 font-bold text-slate-200">
                <Truck className="w-4 h-4 text-emerald-400" />
                {isFreeDeliveryUnlocked ? (
                  <span className="text-emerald-400 font-extrabold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    অভিনন্দন! আপনি হোম ডেলিভারি ফ্রি পাচ্ছেন!
                  </span>
                ) : (
                  <span>
                    আর মাত্র <strong className="text-amber-400 font-mono">৳{deliveryShortfall.toLocaleString()}</strong> টাকার গ্যাজেট যোগ করলেই ডেলিভারি সম্পূর্ণ ফ্রি!
                  </span>
                )}
              </span>
              <span className="font-mono text-[11px] text-slate-400 font-bold shrink-0">
                {freeDeliveryProgress}%
              </span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${freeDeliveryProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Digital Products Free Delivery Pill if only digital */}
        {cartItems.length > 0 && !hasPhysical && hasDigital && (
          <div className="my-5 p-3 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 flex items-center gap-2 text-xs text-emerald-300">
            <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              আপনার কার্টের সব আইটেম ডিজিটাল সফটওয়্যার ও লাইসেন্স কি — <strong>১০০% ইনস্ট্যান্ট অন-স্ক্রিন ডেলিভারি ও ডেলিভারি ফি সম্পূর্ণ ফ্রি!</strong>
            </span>
          </div>
        )}

        {/* Main Cart Content Area */}
        {cartItems.length === 0 ? (
          /* Empty Cart State */
          <div className="py-16 text-center space-y-6">
            <div className="w-24 h-24 mx-auto rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 shadow-xl">
              <ShoppingBag className="w-12 h-12 stroke-1 text-slate-500 animate-pulse" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h2 className="text-xl font-black text-white">আপনার কার্ট বর্তমানে খালি!</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                আপনার পছন্দের ডিজিটাল সফটওয়্যার লাইসেন্স, লাইভ গেম টপ-আপ কিংবা গ্যাজেট নির্বাচন করে কার্টে যোগ করুন।
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={onContinueShopping}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-lg shadow-blue-600/20 transition-all cursor-pointer hover:scale-105 active:scale-95"
              >
                <span>কেনাকাটা শুরু করুন</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Popular Items Showcase for empty cart */}
            {popularProducts.length > 0 && (
              <div className="mt-12 pt-8 border-t border-slate-800 text-left">
                <h3 className="text-sm font-black text-slate-200 mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>জনপ্রিয় প্রোডাক্টসমূহ (সরাসরি কার্টে যোগ করুন)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {popularProducts.slice(0, 4).map((product) => (
                    <div 
                      key={product.id}
                      className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition-all group"
                    >
                      <div className="flex gap-3 items-center">
                        <img 
                          src={product.image_url} 
                          alt={product.title} 
                          className="w-14 h-14 rounded-xl object-cover bg-slate-950 border border-slate-800 shrink-0 group-hover:scale-105 transition-transform"
                        />
                        <div className="min-w-0 flex-1">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full inline-block mb-1 ${
                            product.category === 'digital' ? 'bg-indigo-950 text-indigo-300 border border-indigo-800' : 'bg-blue-950 text-blue-300 border border-blue-800'
                          }`}>
                            {product.category === 'digital' ? 'Digital' : 'Physical'}
                          </span>
                          <h4 className="text-xs font-bold text-white truncate">{product.title}</h4>
                          <div className="text-xs font-black text-blue-400 font-mono mt-0.5">
                            ৳{product.price.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => onAddToCart && onAddToCart(product, 1)}
                        className="mt-3 w-full py-2 bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>কার্টে যোগ করুন</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Populated Cart: 2-Column Responsive Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-6">
            
            {/* Left Column: Items List (8 Cols on desktop) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
                <span>আইটেমের বিবরণ</span>
                <span>পরিমাণ ও মোট মূল্য</span>
              </div>

              <div className="space-y-3">
                {cartItems.map((item) => {
                  const isDigital = item.product.category === 'digital';
                  const itemTotal = item.product.price * item.quantity;

                  return (
                    <div
                      key={item.product.id}
                      className="p-3.5 sm:p-4 bg-slate-900/60 border border-slate-800/90 hover:border-slate-700/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all group"
                    >
                      {/* Product Thumbnail & Details */}
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <div 
                          onClick={() => onSelectProduct && onSelectProduct(item.product)}
                          className="relative cursor-pointer shrink-0"
                          title="প্রোডাক্ট বিস্তারিত দেখতে ক্লিক করুন"
                        >
                          <img
                            src={item.product.image_url}
                            alt={item.product.title}
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover bg-slate-950 border border-slate-800 group-hover:scale-102 transition-transform"
                          />
                          <span className={`absolute -top-1.5 -left-1.5 text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full border shadow-sm ${
                            isDigital 
                              ? 'bg-indigo-900/90 text-indigo-200 border-indigo-500/40' 
                              : 'bg-blue-900/90 text-blue-200 border-blue-500/40'
                          }`}>
                            {isDigital ? '⚡ Digital' : '📦 Physical'}
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 
                            onClick={() => onSelectProduct && onSelectProduct(item.product)}
                            className="font-bold text-sm text-white hover:text-blue-400 transition-colors truncate cursor-pointer"
                          >
                            {item.product.title}
                          </h3>

                          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 flex-wrap">
                            <span className="font-mono text-slate-300 font-bold">
                              একক মূল্য: ৳{item.product.price.toLocaleString()}
                            </span>
                            {item.product.discount_price && item.product.discount_price > item.product.price && (
                              <span className="line-through text-slate-500 font-mono text-[10px]">
                                ৳{item.product.discount_price.toLocaleString()}
                              </span>
                            )}
                            <span className="text-slate-600">·</span>
                            <span className="text-emerald-400 text-[10px] font-semibold flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3" />
                              স্টকে আছে
                            </span>
                          </div>

                          <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">
                            {isDigital ? 'পেমেন্ট সম্পন্ন হওয়ার সাথে সাথেই স্ক্রিনে লাইসেন্স কি প্রদর্শিত হবে' : 'সারা বাংলাদেশে দ্রুততম হোম ডেলিভারি'}
                          </p>
                        </div>
                      </div>

                      {/* Quantity Stepper & Price Calculation */}
                      <div className="flex items-center justify-between sm:justify-end gap-5 pt-2 sm:pt-0 border-t border-slate-800/60 sm:border-0">
                        {/* Stepper with comfortable >= 40px touch area */}
                        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                            className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer active:scale-95"
                            title="পরিমাণ কমান"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>

                          <span className="w-9 text-center font-mono font-black text-sm text-white select-none">
                            {item.quantity}
                          </span>

                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer active:scale-95"
                            title="পরিমাণ বাড়ান"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Item Total Price */}
                        <div className="text-right min-w-[90px]">
                          <div className="text-sm sm:text-base font-black font-mono text-white">
                            ৳{itemTotal.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            (৳{item.product.price} × {item.quantity})
                          </div>
                        </div>

                        {/* Delete Button */}
                        <button
                          onClick={() => onRemoveItem(item.product.id)}
                          className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-xl transition-colors cursor-pointer"
                          title="আইটেমটি কার্ট থেকে বাদ দিন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Coupon Drawer in Left Column */}
              <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800 space-y-3 mt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-white">ডিসকাউন্ট কুপন ও প্রোমো কোড</span>
                  </div>
                  {appliedCoupon && (
                    <span className="text-[11px] text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/60">
                      কুপন সক্রিয় আছে
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value.toUpperCase());
                      setCouponError('');
                    }}
                    placeholder="যেমন: VELORAL10, EID2026"
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white uppercase placeholder:normal-case placeholder:text-slate-600 outline-none focus:border-blue-500"
                    disabled={!!appliedCoupon}
                  />

                  {appliedCoupon ? (
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="px-4 py-2 bg-rose-950 text-rose-300 hover:bg-rose-900 border border-rose-800 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                    >
                      বাতিল
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleApplyCoupon()}
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-sm"
                    >
                      প্রয়োগ
                    </button>
                  )}
                </div>

                {couponError && (
                  <p className="text-rose-400 text-xs font-medium flex items-center gap-1.5 animate-in fade-in">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{couponError}</span>
                  </p>
                )}

                {couponSuccess && (
                  <p className="text-emerald-400 text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>{couponSuccess}</span>
                  </p>
                )}

                {/* Available Coupons list */}
                {coupons.length > 0 && !appliedCoupon && (
                  <div className="pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] text-slate-500 font-bold block mb-1.5">
                      ব্যবহারযোগ্য কুপন কোড (ক্লিক করে প্রয়োগ করুন):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {coupons.filter(c => c.active).map((c) => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => handleApplyCoupon(c.code)}
                          className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-400/40 text-amber-300 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Tag className="w-2.5 h-2.5" />
                          <span>{c.code}</span>
                          <span className="text-slate-500 font-sans">
                            ({c.discount_type === 'percent' ? `${c.discount_value}%` : `৳${c.discount_value}`} ছাড়)
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Sticky Order Summary & Checkout Card (4 Cols on desktop) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5 sticky top-20 shadow-xl">
                <h2 className="font-extrabold text-base text-white border-b border-slate-800 pb-3 flex items-center justify-between">
                  <span>অর্ডার সামারি (Summary)</span>
                  <span className="text-xs font-mono font-normal text-slate-400">
                    {totalItemsCount} আইটেম
                  </span>
                </h2>

                <div className="space-y-3 text-xs text-slate-300">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">সাবটোটাল (পণ্য মূল্য):</span>
                    <span className="font-mono font-bold text-white text-sm">
                      ৳{subtotalAmount.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 flex items-center gap-1">
                      <span>ডেলিভারি চার্জ:</span>
                      {hasPhysical && !isFreeDeliveryUnlocked && (
                        <span className="text-[10px] text-slate-500">(হোম ডেলিভারি)</span>
                      )}
                    </span>
                    <span className="font-mono font-bold">
                      {deliveryFee === 0 ? (
                        <span className="text-emerald-400 font-bold">ফ্রি (৳০)</span>
                      ) : (
                        <span className="text-white">৳{deliveryFee}</span>
                      )}
                    </span>
                  </div>

                  {appliedDiscount > 0 && (
                    <div className="flex justify-between items-center text-emerald-400 font-bold bg-emerald-950/30 p-2 rounded-xl border border-emerald-900/40">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5" />
                        কুপন ছাড় ({appliedCoupon?.code}):
                      </span>
                      <span className="font-mono text-sm">- ৳{appliedDiscount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline">
                    <div>
                      <span className="text-sm font-black text-white block">সর্বমোট পরিশোধযোগ্য:</span>
                      <span className="text-[10px] text-slate-500">ভ্যাট ও সার্ভিস চার্জ অন্তর্ভুক্ত</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xl sm:text-2xl font-black text-blue-400 font-mono">
                        ৳{grandTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Primary Proceed CTA */}
                <button
                  onClick={onProceedToCheckout}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-98 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>চেকআউট সম্পন্ন করুন</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={onContinueShopping}
                  className="w-full py-2.5 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white font-bold text-xs rounded-xl border border-slate-800 transition-colors cursor-pointer text-center"
                >
                  আরও কেনাকাটা করুন
                </button>

                {/* Trust & Guarantee signals */}
                <div className="pt-4 border-t border-slate-800/80 space-y-2 text-[11px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>১০০% সুরক্ষিত পেমেন্ট (বিকাশ · নগদ · রকেট)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>ডিজিটাল লাইসেন্স কি অন-স্ক্রিন অটো ডেলিভারি</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>হোয়াটসঅ্যাপ লাইভ সহায়তা: {settings.whatsapp_number}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sticky Bottom Checkout Bar (Thumb friendly for mobile viewports) */}
      {cartItems.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 p-3 px-4 flex items-center justify-between shadow-2xl">
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">সর্বমোট মূল্য</span>
            <span className="text-lg font-black font-mono text-blue-400">
              ৳{grandTotal.toLocaleString()}
            </span>
          </div>

          <button
            onClick={onProceedToCheckout}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>চেকআউট</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
