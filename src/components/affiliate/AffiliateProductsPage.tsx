import React, { useState, useEffect, useMemo } from 'react';
import { AffiliateProduct, StoreSettings, User } from '../../types';
import { fetchAffiliateProducts, recordAffiliateClick } from '../../services/db';
import { 
  ShoppingBag, Search, SlidersHorizontal, ArrowLeft, ArrowRight,
  ExternalLink, Zap, Flame, Sparkles, RefreshCw, Eye, Tag, Grid 
} from 'lucide-react';

interface AffiliateProductsPageProps {
  settings: StoreSettings;
  currentUser: User | null;
  onBackToHome: () => void;
  onViewDetails: (product: AffiliateProduct) => void;
}

export const AffiliateProductsPage: React.FC<AffiliateProductsPageProps> = ({
  settings,
  currentUser,
  onBackToHome,
  onViewDetails,
}) => {
  const [products, setProducts] = useState<AffiliateProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'latest' | 'price_low' | 'price_high' | 'popular'>('latest');

  const loadAffiliateData = async () => {
    try {
      setLoading(true);
      const list = await fetchAffiliateProducts();
      setProducts(list);
    } catch (e) {
      console.error('Failed to load affiliate products:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAffiliateData();
  }, []);

  const handleBuyNow = async (e: React.MouseEvent, product: AffiliateProduct) => {
    e.stopPropagation(); // Prevent detail screen navigation
    try {
      // Record click inside MySQL
      await recordAffiliateClick(product.id, currentUser?.id || null);
    } catch (err) {
      console.error('Failed to record click:', err);
    } finally {
      // Safely redirect to affiliate URL
      window.open(product.affiliate_url, '_blank', 'noopener,noreferrer');
    }
  };

  // Get active distinct categories
  const categories = useMemo(() => {
    const list = new Set(products.map(p => p.category_id));
    return ['all', ...Array.from(list)];
  }, [products]);

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    let result = products.filter(p => {
      const matchesCategory = selectedCategory === 'all' || p.category_id === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = query === '' || 
        p.name.toLowerCase().includes(query) ||
        p.store_name.toLowerCase().includes(query) ||
        (p.tags && p.tags.toLowerCase().includes(query)) ||
        (p.short_description && p.short_description.toLowerCase().includes(query));
      
      return matchesCategory && matchesSearch;
    });

    if (sortBy === 'price_low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'popular') {
      result.sort((a, b) => b.click_count - a.click_count);
    } else {
      // Latest
      result.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      });
    }

    return result;
  }, [products, searchQuery, selectedCategory, sortBy]);

  // Featured subset
  const featuredProducts = useMemo(() => {
    return products.filter(p => p.featured && p.status === 'active');
  }, [products]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Luxury Affiliate Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-950 border border-slate-800/80 p-6 sm:p-10 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:20px_20px]" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3.5">
            <button
              onClick={onBackToHome}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>হোম পেজে ফিরুন</span>
            </button>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              পার্টনার ডিল ও{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300">
                অ্যাফিলিয়েট ডিলসমূহ
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              সেরা মূল্যে আমাদের বিশ্বস্ত পার্টনার ও রিকমেন্ডেড ব্র্যান্ডগুলোর (Daraz, AliExpress, ইত্যাদি) সেরা সফটওয়্যার, সাবস্ক্রিপশন এবং ইলেকট্রনিক্স গ্যাজেটস সংগ্রহ করুন।
            </p>
          </div>

          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center gap-3 shrink-0 shadow-inner">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">সর্বমোট অফার</span>
              <span className="text-lg font-black text-white">{products.length} টি ডিল উপলব্ধ</span>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Affiliate Showcase */}
      {featuredProducts.length > 0 && !searchQuery && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Flame className="w-4 h-4 text-amber-400" />
            </div>
            <h2 className="text-base sm:text-xl font-black text-white tracking-tight">
              🔥 Featured Partner Deals
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredProducts.slice(0, 3).map(product => {
              const discount = product.old_price 
                ? Math.round(((product.old_price - product.price) / product.old_price) * 100) 
                : 0;

              return (
                <div
                  key={product.id}
                  onClick={() => onViewDetails(product)}
                  className="bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4 flex gap-4 transition-all duration-300 cursor-pointer shadow-lg group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 h-1.5 w-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-bl-lg" />
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-contain bg-slate-950 p-2 border border-slate-800 shrink-0 group-hover:scale-102 transition-transform"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?q=80&w=1470&auto=format&fit=crop';
                    }}
                  />

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-bold text-[9px] border border-blue-500/20 uppercase">
                          {product.store_name}
                        </span>
                        {discount > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-400 font-extrabold text-[9px]">
                            -{discount}%
                          </span>
                        )}
                      </div>
                      <h3 className="font-extrabold text-white text-xs sm:text-sm truncate group-hover:text-blue-400 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-[10px] text-slate-400 line-clamp-1 leading-relaxed">
                        {product.short_description || 'অফারটি দেখতে এখনই ডিল চেক করুন।'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-850">
                      <div>
                        <span className="text-[10px] font-black text-blue-400">৳{product.price.toLocaleString()}</span>
                        {product.old_price && (
                          <span className="text-[8px] text-slate-500 line-through ml-1">৳{product.old_price}</span>
                        )}
                      </div>

                      <button
                        onClick={(e) => handleBuyNow(e, product)}
                        className="py-1 px-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-[10px] flex items-center gap-1 cursor-pointer transition-all shadow shadow-blue-600/30 shrink-0"
                      >
                        <span>কিনুন</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Toolbar / Search & Filter */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-3 sm:p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 shadow-md">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="অ্যাফিলিয়েট প্রোডাক্ট খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 transition-all placeholder:text-slate-500"
          />
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap cursor-pointer transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat === 'all' ? 'সকল ডিল' : cat.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Sorting controls */}
        <div className="flex items-center gap-2.5 justify-end">
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs text-white outline-none cursor-pointer font-bold"
            >
              <option value="latest" className="bg-slate-900">সর্বশেষ ডিল</option>
              <option value="price_low" className="bg-slate-900">মূল্য: কম থেকে বেশি</option>
              <option value="price_high" className="bg-slate-900">মূল্য: বেশি থেকে কম</option>
              <option value="popular" className="bg-slate-900">জনপ্রিয় ডিল</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">অ্যাফিলিয়েট প্রোডাক্ট লোড করা হচ্ছে...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16 space-y-4 bg-slate-900/40 border border-slate-800 rounded-3xl">
          <div className="w-14 h-14 bg-slate-800 text-slate-400 rounded-3xl flex items-center justify-center mx-auto text-2xl">
            🔍
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">কোনো অফার পাওয়া যায়নি</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              অনুগ্রহ করে অন্য কোনো কি-ওয়ার্ড দিয়ে সার্চ করুন অথবা ক্যাটাগরি ফিল্টার পরিবর্তন করুন।
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {filteredProducts.map(product => {
            const discount = product.old_price 
              ? Math.round(((product.old_price - product.price) / product.old_price) * 100) 
              : 0;

            return (
              <div
                key={product.id}
                onClick={() => onViewDetails(product)}
                className="bg-slate-900/40 border border-slate-800/80 hover:border-slate-700 hover:shadow-2xl hover:shadow-blue-500/10 rounded-2xl p-3 flex flex-col justify-between transition-all duration-300 group relative overflow-hidden cursor-pointer"
              >
                {/* Store platform pill */}
                <div className="absolute top-2 left-2 z-10 flex gap-1">
                  <span className="px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tight bg-slate-950/80 border border-slate-800 text-slate-300">
                    {product.store_name}
                  </span>
                  {discount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-md text-[8px] font-black bg-rose-500 text-white">
                      -{discount}%
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="rounded-xl overflow-hidden bg-slate-950 border border-slate-850 h-32 sm:h-40 flex items-center justify-center p-4 relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      className="max-w-full max-h-full object-contain group-hover:scale-102 transition-transform"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?q=80&w=1470&auto=format&fit=crop';
                      }}
                    />
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-extrabold text-white text-xs sm:text-sm line-clamp-1 leading-snug group-hover:text-blue-400 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                      {product.short_description || 'অফারের বিবরণ দেখতে এখনই ক্লিক করুন।'}
                    </p>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-850 flex items-center justify-between gap-1">
                  <div>
                    <div className="text-xs font-black text-blue-400 font-mono">৳{product.price.toLocaleString()}</div>
                    {product.old_price && (
                      <div className="text-[9px] text-slate-500 line-through font-mono">৳{product.old_price}</div>
                    )}
                  </div>

                  <button
                    onClick={(e) => handleBuyNow(e, product)}
                    className="py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] flex items-center gap-1 cursor-pointer transition-all shadow-md shadow-blue-600/20"
                  >
                    <span>অর্ডার ডিল</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
