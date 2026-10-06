import React, { useState, useMemo } from 'react';
import { AccountItem, User, StoreSettings } from '../../types';
import { 
  ShoppingBag, Search, ShieldCheck, Zap, Smartphone, Globe, 
  MessageCircle, ExternalLink, ArrowRight, Upload, X, Check, 
  Image as ImageIcon, Send, SlidersHorizontal, Sparkles, Lock, 
  Clock, Award, HelpCircle, AlertCircle, Eye, Tag, ChevronDown, CheckCircle2,
  Filter, ShoppingCart, RefreshCw
} from 'lucide-react';
import { AccountDetailModal } from './AccountDetailModal';

interface AccountMarketplaceProps {
  accounts: AccountItem[];
  settings?: StoreSettings;
  currentUser: User | null;
  onAddToCart: (account: AccountItem) => void;
  onBuyNow: (account: AccountItem) => void;
  onOpenAuth: () => void;
  onViewDetails: (account: AccountItem) => void;
}

const CATEGORY_STYLES: Record<string, { bg: string; activeBg: string; text: string; border: string; glow: string; label: string; icon: string; accentColor: string }> = {
  all: { 
    bg: 'bg-blue-600', 
    activeBg: 'from-blue-600 to-indigo-600',
    text: 'text-white', 
    border: 'border-blue-500', 
    glow: 'shadow-blue-500/25', 
    label: 'সকল অ্যাকাউন্ট', 
    icon: '⚡',
    accentColor: '#3b82f6'
  },
  whatsapp: { 
    bg: 'bg-emerald-600', 
    activeBg: 'from-emerald-600 to-teal-600',
    text: 'text-white', 
    border: 'border-emerald-500', 
    glow: 'shadow-emerald-500/25', 
    label: 'WhatsApp', 
    icon: '💬',
    accentColor: '#10b981'
  },
  telegram: { 
    bg: 'bg-sky-500', 
    activeBg: 'from-sky-500 to-blue-600',
    text: 'text-white', 
    border: 'border-sky-400', 
    glow: 'shadow-sky-500/25', 
    label: 'Telegram', 
    icon: '✈️',
    accentColor: '#0ea5e9'
  },
  facebook: { 
    bg: 'bg-blue-700', 
    activeBg: 'from-blue-700 to-indigo-800',
    text: 'text-white', 
    border: 'border-blue-600', 
    glow: 'shadow-blue-600/25', 
    label: 'Facebook', 
    icon: '🌐',
    accentColor: '#1d4ed8'
  },
  gmail: { 
    bg: 'bg-rose-600', 
    activeBg: 'from-rose-600 to-red-700',
    text: 'text-white', 
    border: 'border-rose-500', 
    glow: 'shadow-rose-500/25', 
    label: 'Gmail', 
    icon: '✉️',
    accentColor: '#e11d48'
  },
  netflix: { 
    bg: 'bg-red-700', 
    activeBg: 'from-red-700 to-rose-900',
    text: 'text-white', 
    border: 'border-red-600', 
    glow: 'shadow-red-600/25', 
    label: 'Netflix / OTT', 
    icon: '🎬',
    accentColor: '#b91c1c'
  },
  instagram: {
    bg: 'bg-pink-600',
    activeBg: 'from-pink-600 to-purple-600',
    text: 'text-white',
    border: 'border-pink-500',
    glow: 'shadow-pink-500/25',
    label: 'Instagram',
    icon: '📸',
    accentColor: '#db2777'
  },
  other: { 
    bg: 'bg-purple-600', 
    activeBg: 'from-purple-600 to-indigo-700',
    text: 'text-white', 
    border: 'border-purple-500', 
    glow: 'shadow-purple-500/25', 
    label: 'অন্যান্য', 
    icon: '⭐',
    accentColor: '#9333ea'
  },
};

export const AccountMarketplace: React.FC<AccountMarketplaceProps> = ({
  accounts,
  settings,
  currentUser,
  onAddToCart,
  onBuyNow,
  onOpenAuth,
  onViewDetails,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [priceRange, setPriceRange] = useState<'all' | 'under200' | '200to500' | 'above500'>('all');
  const [sortBy, setSortBy] = useState<'default' | 'price_low' | 'price_high' | 'stock'>('default');
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [activeDetailAccount, setActiveDetailAccount] = useState<AccountItem | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Sell Account Modal State
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [sellTitle, setSellTitle] = useState('');
  const [sellCategory, setSellCategory] = useState('whatsapp');
  const [sellPrice, setSellPrice] = useState('');
  const [sellContact, setSellContact] = useState(currentUser?.phone || '');
  const [sellDescription, setSellDescription] = useState('');
  const [sellImage, setSellImage] = useState<string | null>(null);
  const [sellSubmitted, setSellSubmitted] = useState(false);

  const categories = [
    { id: 'all', label: 'সকল অ্যাকাউন্ট', icon: '⚡' },
    { id: 'whatsapp', label: 'WhatsApp', icon: '💬' },
    { id: 'telegram', label: 'Telegram', icon: '✈️' },
    { id: 'facebook', label: 'Facebook', icon: '🌐' },
    { id: 'gmail', label: 'Gmail', icon: '✉️' },
    { id: 'netflix', label: 'Netflix / OTT', icon: '🎬' },
  ];

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: accounts.length };
    accounts.forEach(acc => {
      const c = acc.category.toLowerCase();
      counts[c] = (counts[c] || 0) + 1;
    });
    return counts;
  }, [accounts]);

  // Filtered & Sorted accounts
  const filteredAccounts = useMemo(() => {
    let list = accounts.filter(acc => {
      const matchesCat = selectedCategory === 'all' || acc.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchesStock = !onlyInStock || acc.stock > 0;
      
      // Price range
      let matchesPrice = true;
      if (priceRange === 'under200') matchesPrice = acc.price < 200;
      else if (priceRange === '200to500') matchesPrice = acc.price >= 200 && acc.price <= 500;
      else if (priceRange === 'above500') matchesPrice = acc.price > 500;

      const query = searchQuery.trim().toLowerCase();
      const matchesSearch = query === '' || 
        acc.title.toLowerCase().includes(query) ||
        acc.description.toLowerCase().includes(query) ||
        (acc.product_code && acc.product_code.toLowerCase().includes(query));
      
      return matchesCat && matchesStock && matchesPrice && matchesSearch;
    });

    if (sortBy === 'price_low') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_high') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'stock') {
      list.sort((a, b) => b.stock - a.stock);
    }

    return list;
  }, [accounts, selectedCategory, searchQuery, priceRange, sortBy, onlyInStock]);

  const handleSellImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert('ছবির সাইজ ৩MB এর বেশি হতে পারবে না।');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setSellImage(uploadEvent.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSellSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellTitle || !sellPrice || !sellContact) {
      alert('দয়া করে অ্যাকাউন্টের শিরোনাম, প্রত্যাশিত মূল্য ও যোগাযোগের নম্বর দিন।');
      return;
    }

    setSellSubmitted(true);
    setTimeout(() => {
      setSellSubmitted(false);
      setIsSellModalOpen(false);
      setSellTitle('');
      setSellPrice('');
      setSellDescription('');
      setSellImage(null);
    }, 2500);
  };

  const faqs = [
    {
      q: 'অ্যাকাউন্ট ক্রয়ের পর লগইন তথ্য কিভাবে এবং কতক্ষণে পাবো?',
      a: 'পেমেন্ট সম্পন্ন হওয়ার সাথে সাথেই স্ক্রিনে ইনস্ট্যান্ট ডেলিভারি বক্সে আপনার ইউজারনেম, পাসওয়ার্ড ও ২এফএ কি প্রদর্শিত হবে। এছাড়াও আপনার প্রোফাইল ভল্টে এটি আজীবনের জন্য সংরক্ষিত থাকবে।'
    },
    {
      q: 'ক্রয় করার পর পাসওয়ার্ড ও রিকভারি তথ্য পরিবর্তন করা যাবে কি?',
      a: 'হ্যাঁ, ১০০% ফুল এক্সেস দেওয়া হয়। ক্রয়ের পর আপনি নিজের পাসওয়ার্ড, রিকভারি ইমেইল ও ২এফএ সিকিউরিটি পরিবর্তন করে নিতে পারবেন।'
    },
    {
      q: 'লগইনে কোনো সমস্যা হলে কি সমাধান বা রিপ্লেসমেন্ট দেওয়া হবে?',
      a: 'প্রতিটি অ্যাকাউন্টে ২৪ ঘণ্টা থেকে ৩০ দিনের ফুল রিপ্লেসমেন্ট ওয়ারেন্টি থাকে। কোনো সমস্যা হলে আমাদের হেল্পলাইন বা হোয়াটসঅ্যাপে জানালে সাথে সাথে নতুন অ্যাকাউন্ট প্রদান করা হয়।'
    },
    {
      q: 'আমি কি নিজের অব্যবহৃত পুরাতন অ্যাকাউন্ট বিক্রি করতে পারবো?',
      a: 'হ্যাঁ! উপরের "অ্যাকাউন্ট বিক্রি করুন" বাটনে ক্লিক করে আপনার অ্যাকাউন্টের বিবরণ ও স্ক্রিনশট সাবমিট করুন। আমাদের টিম দ্রুত যাচাই করে আপনার বিকাশ/নগদে টাকা পাঠিয়ে দিবে।'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* High-Tech Luxury Hero Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/80 to-slate-950 border border-slate-800/90 p-6 sm:p-10 overflow-hidden shadow-2xl">
        {/* Glow ambient backdrops */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 -mb-10 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:20px_20px]" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs font-black backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>১০০% ভেরিফাইড প্রিমিয়াম অ্যাকাউন্ট মার্কেটপ্লেস</span>
            </div>
            
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              ইনস্ট্যান্ট ডেলিভারি <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300">
                সোশ্যাল ও ওটিটি অ্যাকাউন্টস
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              WhatsApp, Telegram, Facebook, Gmail এবং Netflix সহ বিভিন্ন এইজড ও ফুল ভেরিফাইড অ্যাকাউন্ট কিনুন ইনস্ট্যান্ট লগইন ডেলিভারি এবং ফুল রিপ্লেসমেন্ট ওয়ারেন্টি সহ।
            </p>

            {/* Quick Guarantees Badge Row */}
            <div className="pt-1 flex flex-wrap items-center gap-2.5 text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-amber-300">
                <Zap className="w-3.5 h-3.5 fill-amber-300" /> ইনস্ট্যান্ট অটো ডেলিভারি
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-emerald-300">
                <Award className="w-3.5 h-3.5 text-emerald-400" /> ২৪ ঘণ্টার রিপ্লেসমেন্ট ওয়ারেন্টি
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sky-300">
                <Lock className="w-3.5 h-3.5 text-sky-400" /> পাসওয়ার্ড পরিবর্তনযোগ্য ফুল এক্সেস
              </span>
            </div>

            {/* Live Metrics Ribbon */}
            <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg">
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center">
                <span className="text-base sm:text-lg font-black text-white block">{accounts.length}+</span>
                <span className="text-[10px] text-slate-400 font-medium uppercase">অ্যাকাউন্ট স্টক</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center">
                <span className="text-base sm:text-lg font-black text-emerald-400 block">&lt;৬০ সে.</span>
                <span className="text-[10px] text-slate-400 font-medium uppercase">গড় ডেলিভারি</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center">
                <span className="text-base sm:text-lg font-black text-sky-400 block">১০০%</span>
                <span className="text-[10px] text-slate-400 font-medium uppercase">সিকিউর লগইন</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center">
                <span className="text-base sm:text-lg font-black text-amber-400 block">২৪/৭</span>
                <span className="text-[10px] text-slate-400 font-medium uppercase">লাইভ সাপোর্ট</span>
              </div>
            </div>
          </div>

          {/* Sell Account CTA Card */}
          <div className="w-full lg:w-auto shrink-0 bg-slate-950/90 border border-slate-800 hover:border-amber-500/40 rounded-3xl p-5 sm:p-6 backdrop-blur-md shadow-2xl space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>নিজের অ্যাকাউন্ট বিক্রি করতে চান?</span>
              </span>
              <h4 className="text-sm sm:text-base font-black text-white">ইনস্ট্যান্ট বিকাশ/নগদে ক্যাশ নিন</h4>
              <p className="text-[11px] text-slate-400 max-w-xs leading-relaxed">
                আপনার পুরাতন ফেসবুক, টেলিগ্রাম, হোয়াটসঅ্যাপ বা ওটিটি অ্যাকাউন্ট বিক্রি করে আকর্ষণীয় মূল্য পান।
              </p>
            </div>

            <button
              onClick={() => setIsSellModalOpen(true)}
              className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 transition-all transform hover:scale-[1.02] cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>অ্যাকাউন্ট বিক্রি সাবমিট করুন</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category Navigation Pills */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
          {categories.map(cat => {
            const isSelected = selectedCategory === cat.id;
            const count = categoryCounts[cat.id] || 0;
            const style = CATEGORY_STYLES[cat.id] || CATEGORY_STYLES['all'];

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-2 border ${
                  isSelected
                    ? `bg-gradient-to-r ${style.activeBg} ${style.text} ${style.border} ${style.glow} shadow-lg scale-105`
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-850 border-slate-800'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                  isSelected ? 'bg-white/20 text-white font-bold' : 'bg-slate-800 text-slate-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filter, Sort & Search Toolbar */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-3 sm:p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 shadow-md">
          {/* Live Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="অ্যাকাউন্টের নাম, SKU বা প্ল্যাটফর্ম দিয়ে খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 transition-all placeholder:text-slate-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Price Range Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 hidden sm:inline">মূল্য:</span>
            <button
              onClick={() => setPriceRange('all')}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap cursor-pointer transition-all ${
                priceRange === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              সব মূল্য
            </button>
            <button
              onClick={() => setPriceRange('under200')}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap cursor-pointer transition-all ${
                priceRange === 'under200'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              ৳২০০ এর নিচে
            </button>
            <button
              onClick={() => setPriceRange('200to500')}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap cursor-pointer transition-all ${
                priceRange === '200to500'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              ৳২০০ - ৳৫০০
            </button>
            <button
              onClick={() => setPriceRange('above500')}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap cursor-pointer transition-all ${
                priceRange === 'above500'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              ৳৫০০+
            </button>
          </div>

          {/* Controls: Stock toggle and Sort */}
          <div className="flex items-center gap-2.5 shrink-0 justify-between lg:justify-end">
            <label className="flex items-center gap-1.5 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 cursor-pointer hover:border-slate-700 transition-colors">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-blue-600 accent-blue-600"
              />
              <span className="text-[11px] whitespace-nowrap">কেবল ইন-স্টক</span>
            </label>

            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs text-white outline-none cursor-pointer font-bold"
              >
                <option value="default" className="bg-slate-900">ডিফল্ট সাজানো</option>
                <option value="price_low" className="bg-slate-900">মূল্য: কম থেকে বেশি</option>
                <option value="price_high" className="bg-slate-900">মূল্য: বেশি থেকে কম</option>
                <option value="stock" className="bg-slate-900">বেশি স্টক অনুযায়ী</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Accounts Grid */}
      {filteredAccounts.length === 0 ? (
        <div className="text-center py-20 space-y-4 bg-slate-900/40 border border-slate-800 rounded-3xl">
          <div className="w-14 h-14 bg-slate-800 text-slate-400 rounded-3xl flex items-center justify-center mx-auto text-2xl">
            🔍
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">কোনো অ্যাকাউন্ট পাওয়া যায়নি</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              আপনার ফিল্টার বা সার্চ কি-ওয়ার্ড পরিবর্তন করে আবার চেষ্টা করুন।
            </p>
          </div>
          {(selectedCategory !== 'all' || searchQuery || onlyInStock || priceRange !== 'all') && (
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
                setOnlyInStock(false);
                setPriceRange('all');
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>ফিল্টার রিসেট করুন</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAccounts.map(account => {
            const hasDiscount = account.discount_price && account.discount_price > account.price;
            const discountPercent = hasDiscount
              ? Math.round(((account.discount_price! - account.price) / account.discount_price!) * 100)
              : null;
            const savingsAmount = hasDiscount ? account.discount_price! - account.price : 0;

            const categoryStyle = CATEGORY_STYLES[account.category] || CATEGORY_STYLES['all'];

            return (
              <div
                key={account.id}
                className="bg-slate-900/95 border border-slate-800 hover:border-slate-700 hover:shadow-2xl hover:shadow-blue-500/10 rounded-3xl p-5 flex flex-col justify-between transition-all duration-300 group relative overflow-hidden ring-1 ring-white/5"
              >
                {/* Platform gradient top indicator */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${categoryStyle.activeBg} opacity-80 group-hover:opacity-100 transition-opacity`} />

                <div className="space-y-4">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="relative">
                      <img
                        src={account.image_url}
                        alt={account.title}
                        loading="lazy"
                        className="w-14 h-14 object-contain rounded-2xl bg-slate-950 border border-slate-800 p-2 shrink-0 group-hover:scale-105 transition-transform shadow-inner"
                      />
                      <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
                      </span>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {account.category}
                        </span>
                        {discountPercent && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-rose-500/15 text-rose-400 border border-rose-500/30">
                            -{discountPercent}%
                          </span>
                        )}
                      </div>

                      {account.badge && (
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" />
                          <span>{account.badge}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1.5">
                    <h3 
                      onClick={() => onViewDetails(account)}
                      className="font-black text-white text-sm sm:text-base group-hover:text-blue-400 transition-colors cursor-pointer line-clamp-2 leading-snug"
                    >
                      {account.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {account.description}
                    </p>
                  </div>

                  {/* Highlights Checklist */}
                  <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800/80 space-y-1.5 text-[11px]">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>ইনস্ট্যান্ট অটো লগইন ডেলিভারি</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>পাসওয়ার্ড পরিবর্তনযোগ্য ও ফুল এক্সেস</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>১০০% ওয়ারেন্টি ও রিপ্লেসমেন্ট সুবিধা</span>
                    </div>
                  </div>

                  {/* Key Feature Tags */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400">
                    <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 font-mono">
                      SKU: {account.product_code || account.id.substring(0, 8)}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                      ⚡ অটো ডেলিভারি
                    </span>
                  </div>
                </div>

                {/* Card Footer: Price & Buttons */}
                <div className="pt-4 mt-4 border-t border-slate-800/90 space-y-3.5">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-[9px] font-bold text-slate-500 uppercase block">বিক্রয় মূল্য</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-blue-400 tracking-tight">৳{account.price}</span>
                        {hasDiscount && (
                          <span className="text-xs text-slate-500 line-through">৳{account.discount_price}</span>
                        )}
                        <span className="text-[10px] text-slate-400 font-mono font-bold">BDT</span>
                      </div>
                      {savingsAmount > 0 && (
                        <span className="text-[9px] font-bold text-emerald-400 block mt-0.5">
                          (৳{savingsAmount} সাশ্রয়)
                        </span>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 block">স্টক স্ট্যাটাস</span>
                      {account.stock > 0 ? (
                        account.stock <= 5 ? (
                          <span className="text-xs font-black text-amber-400 flex items-center justify-end gap-1 animate-pulse">
                            <span>🔥 মাত্র {account.stock} টি বাকি</span>
                          </span>
                        ) : (
                          <span className="text-xs font-black text-emerald-400">
                            {account.stock} টি স্টকে আছে
                          </span>
                        )
                      ) : (
                        <span className="text-xs font-black text-rose-400">স্টক শেষ</span>
                      )}
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onViewDetails(account)}
                      className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold transition-all cursor-pointer border border-slate-700 flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      <span>বিস্তারিত</span>
                    </button>
                    
                    <button
                      onClick={() => onBuyNow(account)}
                      disabled={account.stock <= 0}
                      className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                        account.stock <= 0
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-800'
                          : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/25 cursor-pointer transform hover:scale-[1.02]'
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5 fill-white" />
                      <span>এখনই কিনুন</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Trust & Guarantee Banner */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 shadow-xl">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <Zap className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h4 className="text-sm font-black text-white">ইনস্ট্যান্ট ডেলিভারি</h4>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
              পেমেন্ট সফল হওয়ার সাথে সাথে স্ক্রিনে এবং আপনার ভল্টে ইউজারনেম/পাসওয়ার্ড পৌঁছে যায়।
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h4 className="text-sm font-black text-white">১০০% রিপ্লেসমেন্ট গ্যারান্টি</h4>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
              লগইন বা এক্সেসে কোনো সমস্যা হলে ২৪ ঘণ্টার মধ্যে নতুন অ্যাকাউন্ট বা সমাধান নিশ্চিত।
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
            <Lock className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h4 className="text-sm font-black text-white">পূর্ণাঙ্গ ওনারশিপ</h4>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
              পাসওয়ার্ড ও রিকভারি ইমেইল পরিবর্তন করে অ্যাকাউন্টটি চিরতরে নিজের করে নিতে পারবেন।
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-600/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <MessageCircle className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h4 className="text-sm font-black text-white">২৪/৭ হোয়াটসঅ্যাপ সাপোর্ট</h4>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
              যেকোনো জিজ্ঞাসা বা প্রয়োজনে আমাদের অফিসিয়াল হোয়াটসঅ্যাপে সরাসরি যোগাযোগ করুন।
            </p>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions Accordion */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <HelpCircle className="w-5 h-5 text-blue-400" />
          <h3 className="text-base sm:text-lg font-black text-white">
            অ্যাকাউন্ট ক্রয় সংক্রান্ত সাধারণ প্রশ্নোত্তর (FAQs)
          </h3>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div 
                key={idx}
                className="rounded-2xl bg-slate-950/70 border border-slate-800 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-slate-200 hover:text-white cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center text-xs shrink-0 font-mono">
                      ?
                    </span>
                    <span>{faq.q}</span>
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-400' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-slate-400 border-t border-slate-800/60 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Modal */}
      {activeDetailAccount && (
        <AccountDetailModal
          account={activeDetailAccount}
          onClose={() => setActiveDetailAccount(null)}
          onAddToCart={(acc) => {
            onAddToCart(acc);
            setActiveDetailAccount(null);
          }}
          onBuyNow={(acc) => {
            onBuyNow(acc);
            setActiveDetailAccount(null);
          }}
          currentUser={currentUser}
        />
      )}

      {/* Sell Account Modal with Direct Image Upload */}
      {isSellModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-5 text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-black text-white">অ্যাকাউন্ট বিক্রি করুন (Sell Account)</h3>
                <p className="text-[11px] text-slate-400">আপনার অ্যাকাউন্ট ভেরিফিকেশনের জন্য ছবি ও বিবরণ সাবমিট করুন।</p>
              </div>
              <button 
                onClick={() => setIsSellModalOpen(false)} 
                className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {sellSubmitted ? (
              <div className="p-8 text-center space-y-3 bg-emerald-950/40 border border-emerald-800/60 rounded-2xl">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="text-base font-black text-white">আবেদন সফল হয়েছে!</h4>
                <p className="text-xs text-slate-300">
                  আমাদের এডমিন টিম আপনার দেওয়া ছবি ও বিবরণ যাচাই করে আপনার নম্বরে অতিদ্রুত যোগাযোগ করবে।
                </p>
              </div>
            ) : (
              <form onSubmit={handleSellSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">অ্যাকাউন্টের টাইটেল</label>
                  <input
                    type="text"
                    required
                    value={sellTitle}
                    onChange={(e) => setSellTitle(e.target.value)}
                    placeholder="যেমন: 2021 Facebook Aged Account"
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">ক্যাটাগরি</label>
                    <select
                      value={sellCategory}
                      onChange={(e) => setSellCategory(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500"
                    >
                      <option value="whatsapp">WhatsApp</option>
                      <option value="telegram">Telegram</option>
                      <option value="facebook">Facebook</option>
                      <option value="gmail">Gmail</option>
                      <option value="netflix">Netflix / OTT</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">প্রত্যাশিত মূল্য (৳ BDT)</label>
                    <input
                      type="number"
                      required
                      value={sellPrice}
                      onChange={(e) => setSellPrice(e.target.value)}
                      placeholder="৳ 500"
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">আপনার মোবাইল / WhatsApp নম্বর</label>
                  <input
                    type="text"
                    required
                    value={sellContact}
                    onChange={(e) => setSellContact(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                {/* Direct Image Upload for Sell Request */}
                <div className="space-y-2 p-3 bg-slate-950 rounded-2xl border border-slate-800">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                    <span>অ্যাকাউন্টের স্ক্রিনশট / প্রমাণ ছবি আপলোড করুন</span>
                  </label>
                  
                  <label className="border-2 border-dashed border-slate-800 hover:border-blue-500 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-slate-900/50">
                    <Upload className="w-6 h-6 text-blue-400" />
                    <div className="text-center">
                      <span className="text-xs font-bold text-slate-200">সরাসরি ডিভাইস থেকে স্ক্রিনশট আপলোড করুন</span>
                      <p className="text-[10px] text-slate-500">গ্যালারি বা ফাইল থেকে ছবি সিলেক্ট করুন</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleSellImageUpload}
                      className="hidden"
                    />
                  </label>

                  {sellImage && (
                    <div className="flex items-center gap-3 pt-2">
                      <img
                        src={sellImage}
                        alt="Proof Preview"
                        loading="lazy"
                        className="w-16 h-16 object-cover rounded-xl border border-slate-700 shrink-0"
                      />
                      <div className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                        <Check className="w-4 h-4" />
                        <span>ছবি আপলোড সম্পন্ন</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">অ্যাকাউন্টের বিবরণ (বয়স, অ্যাক্টিভিটি ইত্যাদি)</label>
                  <textarea
                    rows={2}
                    value={sellDescription}
                    onChange={(e) => setSellDescription(e.target.value)}
                    placeholder="অ্যাকাউন্ট সম্পর্কে বিস্তারিত লিখুন..."
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSellModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 cursor-pointer flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>বিক্রয় রিকোয়েস্ট পাঠান</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
