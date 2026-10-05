import React, { useState, useMemo, useEffect } from 'react';
import { Product, StoreSettings } from '../types';
import { ProductCard } from './ProductCard';
import { 
  Sparkles, Flame, Tag, Search, X, SlidersHorizontal, ArrowLeft, 
  ChevronRight, Laptop, Headphones, ShieldCheck, Grid, Layers, Filter
} from 'lucide-react';
import { updateAppUrl } from '../utils/urlUtils';

interface ProductsPageProps {
  products: Product[];
  settings: StoreSettings;
  initialCategory?: string;
  initialPromoFilter?: 'all' | 'flash_sale' | 'hot_sale' | 'for_you';
  initialSearchQuery?: string;
  onAddToCart: (product: Product) => void;
  onQuickBuy: (product: Product) => void;
  onViewDetails: (product: Product) => void;
  onBackToHome: () => void;
}

export const ProductsPage: React.FC<ProductsPageProps> = ({
  products,
  settings,
  initialCategory = 'all',
  initialPromoFilter = 'all',
  initialSearchQuery = '',
  onAddToCart,
  onQuickBuy,
  onViewDetails,
  onBackToHome,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
  const [promoFilter, setPromoFilter] = useState<'all' | 'flash_sale' | 'hot_sale' | 'for_you'>(initialPromoFilter);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearchQuery);
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'discount' | 'newest'>('featured');

  // Sync state to URL safely using dynamic query parameters (Shared hosting safe)
  useEffect(() => {
    updateAppUrl({
      page: 'products',
      category: selectedCategory !== 'all' ? selectedCategory : null,
      promo: promoFilter !== 'all' ? promoFilter : null,
      q: searchQuery.trim() ? searchQuery.trim() : null,
    });
  }, [selectedCategory, promoFilter, searchQuery]);

  // Available categories
  const categories = useMemo(() => {
    const list = [
      { id: 'all', label: 'সকল ক্যাটাগরি (All Items)', icon: Grid },
      { id: 'digital', label: 'ডিজিটাল সফটওয়্যার (Digital)', icon: Laptop },
      { id: 'physical', label: 'স্মার্ট গ্যাজেটস (Physical)', icon: Headphones },
    ];
    if (settings.custom_categories && settings.custom_categories.length > 0) {
      settings.custom_categories.forEach(c => {
        if (!list.some(item => item.id === c.id)) {
          list.push({ id: c.id, label: c.label, icon: Layers });
        }
      });
    }
    return list;
  }, [settings.custom_categories]);

  // Subcategories for active category
  const activeSubCategories = useMemo(() => {
    if (!settings.sub_categories || selectedCategory === 'all') return [];
    return settings.sub_categories.filter(s => s.parent_category_id === selectedCategory);
  }, [settings.sub_categories, selectedCategory]);

  // Filtered and sorted products
  const displayedProducts = useMemo(() => {
    let result = products.filter(p => {
      // Category filter
      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }

      // Subcategory filter
      if (selectedSubCategory !== 'all' && p.sub_category !== selectedSubCategory) {
        return false;
      }

      // Promo filter
      if (promoFilter === 'flash_sale' && !p.is_flash_sale) return false;
      if (promoFilter === 'hot_sale' && !p.is_hot_sale) return false;
      if (promoFilter === 'for_you' && !p.is_for_you) return false;

      // Search query (matches title, description, and product_code)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = p.title.toLowerCase().includes(query);
        const matchesDesc = p.description.toLowerCase().includes(query);
        const matchesCode = p.product_code ? p.product_code.toLowerCase().includes(query) : false;
        if (!matchesTitle && !matchesDesc && !matchesCode) {
          return false;
        }
      }

      return true;
    });

    // Sorting
    if (sortBy === 'price_asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'discount') {
      result.sort((a, b) => {
        const discA = a.discount_price ? a.discount_price - a.price : 0;
        const discB = b.discount_price ? b.discount_price - b.price : 0;
        return discB - discA;
      });
    } else if (sortBy === 'newest') {
      result.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
    }

    return result;
  }, [products, selectedCategory, selectedSubCategory, promoFilter, searchQuery, sortBy]);

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedSubCategory('all');
    setPromoFilter('all');
    setSearchQuery('');
    setSortBy('featured');
  };

  const flashSaleCount = products.filter(p => p.is_flash_sale).length;
  const hotSaleCount = products.filter(p => p.is_hot_sale).length;
  const forYouCount = products.filter(p => p.is_for_you).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      
      {/* Top Breadcrumb & Header Bar */}
      <section className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={onBackToHome}
              className="flex items-center gap-1.5 font-bold text-slate-500 hover:text-blue-600 transition-colors cursor-pointer group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span>হোমপেজ</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-extrabold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
              প্রোডাক্ট পেজ (Products Catalog)
            </span>
          </div>

          {/* Quick Counter */}
          <div className="flex items-center gap-2 text-xs text-slate-500 font-bold">
            <span>প্রদর্শিত পণ্য:</span>
            <span className="font-mono bg-blue-50 text-blue-700 font-extrabold px-2 py-0.5 rounded-full border border-blue-200">
              {displayedProducts.length} / {products.length}
            </span>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-5">
        
        {/* Page Hero Banner */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white p-5 sm:p-7 rounded-3xl border border-slate-800 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-black uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>100% Genuine Digital & Physical Store</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black leading-tight">
              সমস্ত প্রোডাক্ট ক্যাটালগ (All Products)
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              জেনুইন সফটওয়্যার লাইসেন্স কি, ডিজিটাল ডাউনলোড ও গ্যাজেট সামগ্রী। সাথে সাথে কোড ও ফাইল ডেলিভারি।
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setPromoFilter('flash_sale');
                setSelectedCategory('all');
              }}
              className="px-3 py-2 bg-rose-600/30 hover:bg-rose-600 text-rose-200 hover:text-white border border-rose-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Flame className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span>ফ্ল্যাশ সেল ({flashSaleCount})</span>
            </button>
            <button
              onClick={() => {
                setPromoFilter('hot_sale');
                setSelectedCategory('all');
              }}
              className="px-3 py-2 bg-amber-600/30 hover:bg-amber-600 text-amber-200 hover:text-white border border-amber-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>হট সেল ({hotSaleCount})</span>
            </button>
          </div>
        </div>

        {/* 3-Option Promotional Selector Bar: Flash Sale, Hot Sale, For You */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 w-full sm:w-auto">
            <button
              onClick={() => setPromoFilter('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                promoFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Grid className="w-3.5 h-3.5 text-blue-500" />
              <span>সকল পণ্য (All Items)</span>
              <span className="text-[10px] font-mono opacity-80">({products.length})</span>
            </button>

            <button
              onClick={() => setPromoFilter('flash_sale')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                promoFilter === 'flash_sale'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
              <span>⚡ Flash Sale</span>
              <span className="text-[10px] bg-rose-500 text-white px-1.5 py-0.2 rounded-full font-mono">
                {flashSaleCount}
              </span>
            </button>

            <button
              onClick={() => setPromoFilter('hot_sale')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                promoFilter === 'hot_sale'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-600" />
              <span>🔥 Hot Sale</span>
              <span className="text-[10px] bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full font-mono font-black">
                {hotSaleCount}
              </span>
            </button>

            <button
              onClick={() => setPromoFilter('for_you')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                promoFilter === 'for_you'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>✨ For You (আপনার জন্য)</span>
              <span className="text-[10px] bg-indigo-500 text-white px-1.5 py-0.2 rounded-full font-mono">
                {forYouCount}
              </span>
            </button>
          </div>

          {promoFilter !== 'all' && (
            <button
              onClick={() => setPromoFilter('all')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>প্রমো ফিল্টার রিসেট</span>
            </button>
          )}
        </div>

        {/* Search, Category Bar & Sort Controls */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Search Input (Supports Name, Description and Product Code) */}
            <div className="md:col-span-7 relative">
              <input
                type="text"
                placeholder="প্রোডাক্ট নাম বা প্রোডাক্ট কোড (যেমন: VEL-WIN11, TWS-M10)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="md:col-span-5 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all font-bold text-slate-700 cursor-pointer"
              >
                <option value="featured">ফিচার্ড প্রোডাক্টস (Featured)</option>
                <option value="price_asc">মূল্য: কম থেকে বেশি (Price: Low to High)</option>
                <option value="price_desc">মূল্য: বেশি থেকে কম (Price: High to Low)</option>
                <option value="discount">সর্বোচ্চ ছাড়ের অফার (Biggest Discount)</option>
                <option value="newest">নতুন সংযোজিত (Newest First)</option>
              </select>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="pt-2 border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider shrink-0 flex items-center gap-1">
              <Filter className="w-3 h-3" /> ক্যাটাগরি:
            </span>
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              const count = cat.id === 'all' 
                ? products.length 
                : products.filter(p => p.category === cat.id).length;

              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setSelectedSubCategory('all');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs shadow-blue-600/20'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Subcategories (if available for chosen category) */}
          {activeSubCategories.length > 0 && (
            <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                সাব-ক্যাটাগরি:
              </span>
              <button
                onClick={() => setSelectedSubCategory('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer whitespace-nowrap transition-colors ${
                  selectedSubCategory === 'all'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                • সব সাব-ক্যাটাগরি
              </button>
              {activeSubCategories.map((sub) => {
                const isSubSelected = selectedSubCategory === sub.id;
                const subCount = products.filter(p => p.category === selectedCategory && p.sub_category === sub.id).length;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubCategory(sub.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer whitespace-nowrap transition-colors flex items-center gap-1 ${
                      isSubSelected
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>• {sub.label}</span>
                    <span className="text-[10px] opacity-75 font-mono">({subCount})</span>
                  </button>
                );
              })}
            </div>
          )}

        </div>

        {/* Active Filter Indicator Tag Bar */}
        {(selectedCategory !== 'all' || promoFilter !== 'all' || searchQuery.trim()) && (
          <div className="flex items-center gap-2 flex-wrap text-xs text-slate-600">
            <span className="font-bold">সক্রিয় ফিল্টার:</span>
            {selectedCategory !== 'all' && (
              <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
                ক্যাটাগরি: {categories.find(c => c.id === selectedCategory)?.label || selectedCategory}
                <button onClick={() => setSelectedCategory('all')} className="cursor-pointer hover:text-blue-900"><X className="w-3 h-3" /></button>
              </span>
            )}
            {promoFilter !== 'all' && (
              <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
                প্রমো: {promoFilter === 'flash_sale' ? '⚡ Flash Sale' : promoFilter === 'hot_sale' ? '🔥 Hot Sale' : '✨ For You'}
                <button onClick={() => setPromoFilter('all')} className="cursor-pointer hover:text-rose-900"><X className="w-3 h-3" /></button>
              </span>
            )}
            {searchQuery.trim() && (
              <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
                সার্চ: "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="cursor-pointer hover:text-slate-900"><X className="w-3 h-3" /></button>
              </span>
            )}
            <button
              onClick={handleResetFilters}
              className="text-blue-600 hover:underline font-bold text-xs ml-auto cursor-pointer"
            >
              সব মুছে ফেলুন
            </button>
          </div>
        )}

        {/* Product Grid */}
        {displayedProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 space-y-4 shadow-2xs">
            <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center text-3xl mx-auto">
              🔍
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="font-black text-slate-900 text-base sm:text-lg">কোনো প্রোডাক্ট পাওয়া যায়নি</h3>
              <p className="text-xs text-slate-500">
                আপনার দেওয়া ফিল্টার বা সার্চ কিওয়ার্ডের সাথে কোনো প্রোডাক্ট মেলেনি। ফিল্টার রিসেট করে আবার চেষ্টা করুন।
              </p>
            </div>
            <button
              onClick={handleResetFilters}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer"
            >
              সকল পণ্য পুনরায় দেখুন
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {displayedProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onAddToCart={onAddToCart}
                onQuickBuy={onQuickBuy}
                onViewDetails={onViewDetails}
              />
            ))}
          </div>
        )}

      </main>

      {/* Footer Info */}
      <footer className="mt-12 py-6 bg-white border-t border-slate-200 text-center text-xs text-slate-500 space-y-2">
        <div className="flex items-center justify-center gap-2 text-slate-700 font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>অফিসিয়াল রিটেইল লাইসেন্স ও ক্যাশ অন ডেলিভারি সুবিধা</span>
        </div>
        <p>© {new Date().getFullYear()} Veloral Digital & Shop. সর্বস্বত্ব সংরক্ষিত।</p>
      </footer>

    </div>
  );
};
