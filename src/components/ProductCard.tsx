import React from 'react';
import { Product } from '../types';
import { Zap, Truck, ShoppingCart, Eye, Tag, Flame, Sparkles } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onQuickBuy: (product: Product) => void;
  onViewDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onQuickBuy,
  onViewDetails,
}) => {
  const isDigital = product.category === 'digital';
  const hasDiscount = product.discount_price && product.discount_price > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.discount_price! - product.price) / product.discount_price!) * 100)
    : 0;

  return (
    <div 
      onClick={() => onViewDetails(product)}
      className="group bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-lg hover:border-blue-300 transition-all duration-200 flex flex-col overflow-hidden relative w-full cursor-pointer"
    >
      
      {/* Top badges */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 items-start">
        {product.is_flash_sale && (
          <span className="bg-rose-500 text-white font-extrabold text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs animate-in fade-in">
            <Flame className="w-2.5 h-2.5 animate-pulse" />
            <span>Flash Sale</span>
          </span>
        )}
        {product.is_hot_sale && (
          <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs animate-in fade-in">
            <Flame className="w-2.5 h-2.5" />
            <span>Hot Sale</span>
          </span>
        )}
        {product.is_for_you && (
          <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs animate-in fade-in">
            <Sparkles className="w-2.5 h-2.5 text-amber-300" />
            <span>For You</span>
          </span>
        )}
        {product.badge && (
          <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full shadow-xs">
            {product.badge}
          </span>
        )}
        <span
          className={`font-bold text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs ${
            isDigital ? 'bg-indigo-600 text-white' : 'bg-blue-600 text-white'
          }`}
        >
          {isDigital ? <Zap className="w-2.5 h-2.5" /> : <Truck className="w-2.5 h-2.5" />}
          {isDigital ? 'Digital Key' : 'Physical Item'}
        </span>
      </div>

      {hasDiscount && (
        <div className="absolute top-2 right-2 z-10">
          <span className="bg-rose-500 text-white font-extrabold text-[10px] px-1.5 py-0.5 rounded-md shadow-xs">
            -{discountPercent}%
          </span>
        </div>
      )}

      {/* Image container */}
      <div className="w-full h-36 sm:h-48 bg-slate-100 relative overflow-hidden">
        <img
          src={product.image_url}
          alt={product.title}
          className="w-full h-full object-contain bg-white group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?q=80&w=1470&auto=format&fit=crop';
          }}
        />
        <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <span className="bg-white/95 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" /> View Details
          </span>
        </div>
      </div>

      {/* Content info */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Product Code */}
          {product.product_code && (
            <div className="mb-1">
              <span className="text-[9px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/80 inline-flex items-center gap-1">
                <Tag className="w-2.5 h-2.5 text-blue-500" />
                <span>Code: #{product.product_code}</span>
              </span>
            </div>
          )}

          <h3 className="font-extrabold text-slate-900 text-[11px] sm:text-sm leading-snug hover:text-blue-600 transition-colors line-clamp-2">
            {product.title}
          </h3>
        </div>

        {/* Pricing & Stock */}
        <div className="mt-2.5">
          <div className="flex items-center gap-1.5 mb-2.5">
            <span className="text-sm sm:text-lg font-black text-blue-600 tracking-tight">
              ৳{product.price.toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="text-[10px] sm:text-[11px] font-medium text-slate-400 line-through">
                ৳{product.discount_price?.toLocaleString()}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product);
              }}
              className="flex-1 flex items-center justify-center gap-1 py-2 sm:py-2.5 px-1 sm:px-2 text-[10px] sm:text-xs font-black uppercase tracking-tight text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-95 rounded-xl transition-all cursor-pointer border border-slate-200"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Add to Cart</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickBuy(product);
              }}
              className="flex items-center justify-center gap-1 py-2 sm:py-2.5 px-3 sm:px-4 text-[10px] sm:text-xs font-black text-white bg-blue-600 hover:bg-blue-500 active:scale-95 rounded-xl transition-all shadow-md shadow-blue-600/20 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
