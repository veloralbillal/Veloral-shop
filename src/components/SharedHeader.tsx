import React from 'react';
import { ArrowLeft, ShoppingBag } from 'lucide-react';

interface SharedHeaderProps {
  title: string;
  onBack: () => void;
  onOpenCart?: () => void;
  cartCount?: number;
}

export const SharedHeader: React.FC<SharedHeaderProps> = ({
  title,
  onBack,
  onOpenCart,
  cartCount = 0,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 h-16 flex items-center justify-between shadow-xl">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-300 hover:text-white transition-colors cursor-pointer group py-2"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Store</span>
      </button>

      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md">
          V
        </div>
        <span className="text-sm font-black text-white tracking-tight hidden xs:inline">{title}</span>
      </div>

      <div className="flex items-center gap-2">
        {onOpenCart && (
          <button
            onClick={onOpenCart}
            className="relative p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer border border-slate-700"
            title="Cart"
          >
            <ShoppingBag className="w-4 h-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-slate-900">
                {cartCount}
              </span>
            )}
          </button>
        )}
      </div>
    </header>
  );
};
