import React, { useState, useEffect } from 'react';
import { 
  X, Trash2, ArrowRight, ShoppingBag, Plus, Minus, Tag, 
  CheckCircle2, ShieldCheck, Zap, Truck, AlertCircle, Maximize2, Sparkles
} from 'lucide-react';
import { CartItem, Product, Coupon } from '../types';
import { fetchCoupons } from '../services/db';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: () => void;
  onOpenFullCart?: () => void;
  onSelectProduct?: (product: Product) => void;
  onClearCart?: () => void;
  popularProducts?: Product[];
  onAddToCart?: (product: Product, quantity?: number) => void;
}

export const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  onOpenFullCart,
  onSelectProduct,
  onClearCart,
  popularProducts = [],
  onAddToCart,
}) => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [isCouponOpen, setIsCouponOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCoupons().then(setCoupons).catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const totalItemsCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);
  const subtotalAmount = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const hasPhysical = cartItems.some((item) => item.product.category === 'physical');
  const hasDigital = cartItems.some((item) => item.product.category === 'digital');

  const freeDeliveryThreshold = 2000;
  const isFreeDeliveryUnlocked = !hasPhysical || subtotalAmount >= freeDeliveryThreshold;
  const deliveryFee = hasPhysical ? (isFreeDeliveryUnlocked ? 0 : 60) : 0;
  const deliveryShortfall = Math.max(0, freeDeliveryThreshold - subtotalAmount);
  const freeDeliveryProgress = Math.min(100, Math.round((subtotalAmount / freeDeliveryThreshold) * 100));

  const handleApplyCoupon = (codeToApply?: string) => {
    setCouponError('');
    setCouponSuccess('');
    const code = (codeToApply || couponCode).trim().toUpperCase();

    if (!code) {
      setCouponError('কুপন কোড লিখুন');
      return;
    }

    const matched = coupons.find(c => c.code.toUpperCase() === code);
    if (!matched) {
      setCouponError('ভুল কুপন কোড');
      return;
    }
    if (!matched.active) {
      setCouponError('কুপনটির মেয়াদ শেষ');
      return;
    }
    if (matched.min_order_amount && subtotalAmount < matched.min_order_amount) {
      setCouponError(`কমপক্ষে ৳${matched.min_order_amount} টাকার অর্ডার প্রয়োজন`);
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
    setCouponSuccess(`-৳${disc} ছাড় যুক্ত হয়েছে!`);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setAppliedDiscount(0);
    setCouponCode('');
    setCouponSuccess('');
    setCouponError('');
  };

  const grandTotal = Math.max(0, subtotalAmount + deliveryFee - appliedDiscount);

  return (
    <div 
      className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-xs flex justify-end animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md sm:max-w-lg bg-slate-900 border-l border-slate-800 text-slate-100 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300 relative select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cart Drawer Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
                <span>শপিং কার্ট</span>
                {cartItems.length > 0 && (
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {totalItemsCount} আইটেম
                  </span>
                )}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {onOpenFullCart && cartItems.length > 0 && (
              <button
                onClick={() => {
                  onClose();
                  onOpenFullCart();
                }}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1 font-bold"
                title="পূর্ণাঙ্গ কার্ট পেজে যান"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">ফুল পেজ</span>
              </button>
            )}

            {onClearCart && cartItems.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('আপনি কি কার্টের সব আইটেম মুছে ফেলতে চান?')) {
                    onClearCart();
                  }
                }}
                className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 rounded-lg transition-colors cursor-pointer"
                title="কার্ট খালি করুন"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer ml-1"
              title="বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Free Delivery Bar in Drawer */}
        {cartItems.length > 0 && hasPhysical && (
          <div className="px-4 py-2 bg-slate-950 border-b border-slate-800/80 shrink-0">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-slate-300 font-bold flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-emerald-400" />
                {isFreeDeliveryUnlocked ? (
                  <span className="text-emerald-400 font-extrabold">ফ্রি হোম ডেলিভারি আনলক হয়েছে!</span>
                ) : (
                  <span>আর ৳{deliveryShortfall.toLocaleString()} হলেই ফ্রি ডেলিভারি</span>
                )}
              </span>
              <span className="font-mono text-[10px] text-slate-400 font-bold">
                {freeDeliveryProgress}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full transition-all duration-300"
                style={{ width: `${freeDeliveryProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-600">
                <ShoppingBag className="w-8 h-8 text-slate-500 stroke-1" />
              </div>
              <div className="space-y-1">
                <p className="font-extrabold text-sm text-white">আপনার কার্ট বর্তমানে খালি!</p>
                <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                  ডিজিটাল সফটওয়্যার লাইসেন্স বা গ্যাজেট ব্রাউজ করে আপনার পছন্দের পণ্য কার্টে যোগ করুন।
                </p>
              </div>

              {popularProducts.length > 0 && (
                <div className="w-full pt-4 border-t border-slate-800/80 text-left">
                  <span className="text-[11px] font-bold text-slate-400 block mb-2 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>জনপ্রিয় আইটেম:</span>
                  </span>
                  <div className="space-y-2">
                    {popularProducts.slice(0, 3).map(p => (
                      <div key={p.id} className="p-2 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <img src={p.image_url} alt={p.title} className="w-9 h-9 rounded-lg object-cover bg-slate-900 border border-slate-800 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[11px] font-bold text-white truncate">{p.title}</p>
                            <p className="text-[10px] font-mono text-blue-400">৳{p.price.toLocaleString()}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => onAddToCart && onAddToCart(p, 1)}
                          className="px-2 py-1 bg-slate-800 hover:bg-blue-600 text-white rounded-lg text-[10px] font-bold cursor-pointer transition-colors shrink-0"
                        >
                          + যোগ করুন
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            cartItems.map((item) => {
              const isDigital = item.product.category === 'digital';
              const lineTotal = item.product.price * item.quantity;

              return (
                <div
                  key={item.product.id}
                  className="p-3 bg-slate-950/70 border border-slate-800/90 hover:border-slate-700/80 rounded-2xl flex items-center gap-3 relative group transition-all"
                >
                  <div 
                    onClick={() => {
                      if (onSelectProduct) {
                        onSelectProduct(item.product);
                        onClose();
                      }
                    }}
                    className="relative cursor-pointer shrink-0"
                  >
                    <img
                      src={item.product.image_url}
                      alt={item.product.title}
                      className="w-16 h-16 rounded-xl object-cover bg-slate-900 border border-slate-800"
                    />
                    <span className={`absolute -top-1 -left-1 text-[7px] font-black uppercase px-1 py-0.2 rounded-full border ${
                      isDigital ? 'bg-indigo-950 text-indigo-300 border-indigo-700' : 'bg-blue-950 text-blue-300 border-blue-700'
                    }`}>
                      {isDigital ? 'Digital' : 'Physical'}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 
                      onClick={() => {
                        if (onSelectProduct) {
                          onSelectProduct(item.product);
                          onClose();
                        }
                      }}
                      className="font-bold text-xs text-white hover:text-blue-400 transition-colors truncate cursor-pointer"
                    >
                      {item.product.title}
                    </h4>

                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-black font-mono text-blue-400">
                        ৳{lineTotal.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        (৳{item.product.price} × {item.quantity})
                      </span>
                    </div>

                    {/* Quantity Stepper with >= 40px touch padding */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                          className="w-7 h-7 rounded-md bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center cursor-pointer transition-colors active:scale-95"
                          title="কমান"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-mono font-black text-white w-6 text-center select-none">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                          className="w-7 h-7 rounded-md bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center cursor-pointer transition-colors active:scale-95"
                          title="বাড়ান"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.product.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 rounded-lg transition-colors cursor-pointer"
                        title="আইটেমটি বাদ দিন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer with Coupon, Subtotal & Proceed CTA */}
        {cartItems.length > 0 && (
          <div className="p-4 border-t border-slate-800 bg-slate-950/90 space-y-3 shrink-0 shadow-2xl">
            {/* Quick Coupon Accordion */}
            <div className="border border-slate-800/80 rounded-xl p-2.5 bg-slate-900/50">
              <div 
                onClick={() => setIsCouponOpen(!isCouponOpen)}
                className="flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                  <Tag className="w-3.5 h-3.5 text-amber-400" />
                  <span>কুপন কোড (Promo Code)</span>
                </div>
                {appliedCoupon ? (
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                    সক্রিয় (-৳{appliedDiscount})
                  </span>
                ) : (
                  <span className="text-[10px] text-blue-400 font-bold">
                    {isCouponOpen ? 'লুকান' : 'প্রয়োগ করুন'}
                  </span>
                )}
              </div>

              {isCouponOpen && (
                <div className="mt-2.5 pt-2 border-t border-slate-800/80 space-y-2">
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value.toUpperCase());
                        setCouponError('');
                      }}
                      placeholder="কুপন কোড দিন..."
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white uppercase placeholder:normal-case placeholder:text-slate-600 outline-none focus:border-blue-500"
                      disabled={!!appliedCoupon}
                    />
                    {appliedCoupon ? (
                      <button
                        onClick={handleRemoveCoupon}
                        className="px-3 py-1.5 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                      >
                        বাতিল
                      </button>
                    ) : (
                      <button
                        onClick={() => handleApplyCoupon()}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-sm"
                      >
                        প্রয়োগ
                      </button>
                    )}
                  </div>

                  {couponError && <p className="text-rose-400 text-[11px]">{couponError}</p>}
                  {couponSuccess && <p className="text-emerald-400 text-[11px] font-bold">{couponSuccess}</p>}

                  {/* Preset Coupons click chips */}
                  {coupons.length > 0 && !appliedCoupon && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {coupons.filter(c => c.active).slice(0, 3).map(c => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => handleApplyCoupon(c.code)}
                          className="px-2 py-0.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-amber-300 rounded text-[9px] font-mono font-bold cursor-pointer"
                        >
                          {c.code}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Price Calculations */}
            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">সাবটোটাল:</span>
                <span className="font-mono font-bold text-white">৳{subtotalAmount.toLocaleString()}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">ডেলিভারি চার্জ:</span>
                <span className="font-mono font-bold">
                  {deliveryFee === 0 ? <span className="text-emerald-400">ফ্রি (৳০)</span> : `৳${deliveryFee}`}
                </span>
              </div>

              {appliedDiscount > 0 && (
                <div className="flex justify-between text-emerald-400 font-bold">
                  <span>কুপন ছাড় ({appliedCoupon?.code}):</span>
                  <span className="font-mono">- ৳{appliedDiscount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between pt-2 border-t border-slate-800 text-sm font-black text-white">
                <span>সর্বমোট:</span>
                <span className="text-base text-blue-400 font-mono">৳{grandTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={() => {
                onClose();
                onProceedToCheckout();
              }}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-98 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>চেকআউট সম্পন্ন করুন</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Trust Badges footer */}
            <div className="pt-2 flex items-center justify-center gap-3 text-[10px] text-slate-400 text-center">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>নিরাপদ পেমেন্ট</span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>ইনস্ট্যান্ট ডেলিভারি</span>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
