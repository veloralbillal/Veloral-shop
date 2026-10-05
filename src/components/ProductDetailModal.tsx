import React, { useState } from 'react';
import { Product } from '../types';
import { X, Zap, Truck, ShoppingCart, ShieldCheck, Tag, Copy, Check, Flame, Sparkles } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onBuyNow,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);

  if (!product) return null;

  const isDigital = product.category === 'digital';
  const hasDiscount = product.discount_price && product.discount_price > product.price;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="bg-white w-full max-w-xl sm:max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 sm:p-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span
              className={`font-bold text-xs px-2.5 py-1 rounded-full flex items-center gap-1 ${
                isDigital ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'
              }`}
            >
              {isDigital ? <Zap className="w-3.5 h-3.5" /> : <Truck className="w-3.5 h-3.5" />}
              {isDigital ? 'Digital Software & License Key' : 'Physical Delivery Item'}
            </span>
            {product.badge && (
              <span className="bg-amber-100 text-amber-800 font-bold text-xs px-2.5 py-1 rounded-full">
                {product.badge}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-h-[75vh] overflow-y-auto">
          {/* Image */}
          <div className="rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 h-52 sm:h-auto">
            <img
              src={product.image_url}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Details */}
          <div className="flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 flex-wrap mb-2">
                {product.is_flash_sale && (
                  <span className="bg-rose-500 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                    <Flame className="w-3 h-3 animate-pulse" />
                    <span>Flash Sale</span>
                  </span>
                )}
                {product.is_hot_sale && (
                  <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                    <Flame className="w-3 h-3" />
                    <span>Hot Sale</span>
                  </span>
                )}
                {product.is_for_you && (
                  <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>For You</span>
                  </span>
                )}
              </div>

              <h2 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                {product.title}
              </h2>

              {/* Product Code */}
              {product.product_code && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200 inline-flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-blue-600" />
                    <span>প্রোডাক্ট কোড: #{product.product_code}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(product.product_code || '');
                      setCopiedCode(true);
                      setTimeout(() => setCopiedCode(false), 2000);
                    }}
                    className="text-[11px] text-blue-600 hover:text-blue-700 font-bold px-2 py-1 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                    title="কোড কপি করুন"
                  >
                    {copiedCode ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCode ? 'কপি হয়েছে' : 'কোড কপি'}</span>
                  </button>
                </div>
              )}

              {/* Price section */}
              <div className="mt-2.5 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-slate-900">
                  ৳{product.price.toLocaleString()}
                </span>
                {hasDiscount && (
                  <span className="text-xs sm:text-sm font-semibold text-slate-400 line-through">
                    ৳{product.discount_price?.toLocaleString()}
                  </span>
                )}
              </div>

              {/* Delivery method info */}
              <div className="mt-3.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="flex items-center gap-2 text-slate-700 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>100% Genuine with Replacement Guarantee</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 font-semibold">
                  {isDigital ? (
                    <>
                      <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>Instant digital code delivery on screen & SMS</span>
                    </>
                  ) : (
                    <>
                      <Truck className="w-4 h-4 text-blue-500 shrink-0" />
                      <span>Cash on delivery available nationwide</span>
                    </>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="mt-4">
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Description & Specifications:
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3">
              <button
                onClick={() => {
                  onAddToCart(product);
                  onClose();
                }}
                className="flex-1 py-2.5 sm:py-3 px-3 rounded-xl font-bold text-xs sm:text-sm bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onBuyNow(product);
                }}
                className="flex-1 py-2.5 sm:py-3 px-3 rounded-xl font-bold text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-500/20 cursor-pointer"
              >
                <Zap className="w-4 h-4 text-amber-300" />
                <span>Buy Now</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
