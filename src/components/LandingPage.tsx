import React from 'react';
import { 
  Zap, ShieldCheck, Smartphone, Truck, Globe, 
  CheckCircle2, ArrowRight, Star, Clock, Gift, Lock, 
  HelpCircle, MessageCircle, ChevronRight, UserPlus, LogIn,
  Sparkles, Award, Cpu, ShoppingBag, Flame
} from 'lucide-react';
import { StoreSettings, Product } from '../types';
import { BannerNotice } from './BannerNotice';

interface LandingPageProps {
  settings: StoreSettings;
  featuredProducts: Product[];
  onOpenAuth: (initialMode?: 'login' | 'register') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  settings,
  featuredProducts,
  onOpenAuth,
}) => {
  const cleanPhone = settings.whatsapp_number.replace(/[^0-9+]/g, '');

  const flashSaleProducts = featuredProducts.filter(p => p.is_flash_sale);
  const topRankingProducts = featuredProducts.filter(p => p.is_top_ranking);

  const services = [
    {
      icon: <Sparkles className="w-6 h-6 text-amber-400" />,
      title: 'Digital Software & License Keys',
      subtitle: 'Windows 11, Office 365, Canva Pro, Antivirus',
      desc: '100% genuine retail keys with lifetime guarantee. Instant delivery on-screen and to your dashboard immediately after payment.',
      badge: 'Instant Delivery',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      icon: <Flame className="w-6 h-6 text-rose-400" />,
      title: 'Instant Game Top-Up (UID)',
      subtitle: 'Free Fire 💎 Diamonds & PUBG Mobile 🪙 UC',
      desc: 'Complete top-up directly into your game account using just your Player ID within 5 to 15 minutes, with no password required.',
      badge: 'Super Fast',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    },
    {
      icon: <Globe className="w-6 h-6 text-sky-400" />,
      title: 'AliExpress On-Demand Import',
      subtitle: 'Directly from China to your address',
      desc: 'Paste a link for any AliExpress product, get the exact price in BDT instantly, and have it delivered to your home.',
      badge: 'On-Demand Service',
      badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    },
    {
      icon: <Cpu className="w-6 h-6 text-emerald-400" />,
      title: 'Trending Tech & Smart Gadgets',
      subtitle: 'Smartwatches, TWS Earbuds, GaN Chargers',
      desc: 'Original quality products guaranteed, fast home delivery, and a hassle-free replacement policy.',
      badge: '100% Original',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
  ];

  const steps = [
    {
      step: '01',
      title: 'Sign Up or Login',
      desc: 'Complete free registration in 1 minute using your mobile number.',
      icon: <UserPlus className="w-5 h-5 text-blue-400" />,
    },
    {
      step: '02',
      title: 'Select Product or Top-Up',
      desc: 'Choose your preferred digital license, game UID, or AliExpress link.',
      icon: <ShoppingBag className="w-5 h-5 text-indigo-400" />,
    },
    {
      step: '03',
      title: 'Payment via bKash / Nagad',
      desc: 'Send money to our bKash, Nagad, or Rocket account and submit your TrxID.',
      icon: <Lock className="w-5 h-5 text-emerald-400" />,
    },
    {
      step: '04',
      title: 'Get Instant Delivery',
      desc: 'Get your digital key on-screen instantly, and top-ups are credited to your account directly.',
      icon: <Gift className="w-5 h-4 text-amber-400" />,
    },
  ];

  const reviews = [
    {
      name: 'Tanvir Ahmed',
      role: 'Software Developer, Dhaka',
      rating: 5,
      comment: 'Bought a Windows 11 Pro Lifetime key. Received a genuine key within 5 minutes of making the bKash payment. It activated officially from the Microsoft site!',
      product: 'Windows 11 Pro Retail Key',
    },
    {
      name: 'Rakibul Hassan',
      role: 'Gaming Streamer, Chittagong',
      rating: 5,
      comment: 'Free Fire 610 Diamonds top-up arrived in my player ID in just 7 minutes. No password needed, service is outstanding!',
      product: 'Free Fire Top-Up (UID)',
    },
    {
      name: 'Mahmud Karim',
      role: 'Graphic Designer, Sylhet',
      rating: 5,
      comment: 'Received a 1-year Canva Pro account on my personal email. The invite link worked immediately. Price is also very reasonable.',
      product: 'Canva Pro Subscription',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Notice Bar */}
      <BannerNotice settings={settings} />

      {/* Navigation */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-black text-xl">
              V
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-tight text-white">Veloral</span>
                <span className="text-xs font-bold px-1.5 py-0.5 rounded-md bg-blue-600/30 text-blue-400 border border-blue-500/30">
                  DIGITAL
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-none">Smart Shop & Top-Up</p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm font-medium text-slate-300">
            <a href="#services" className="hover:text-blue-400 transition-colors">সার্ভিসসমূহ</a>
            <a href="#featured" className="hover:text-blue-400 transition-colors">টপ প্রডাক্টস</a>
            <a href="#how-it-works" className="hidden sm:inline hover:text-blue-400 transition-colors">অর্ডার পদ্ধতি</a>
            <a href="#reviews" className="hidden sm:inline hover:text-blue-400 transition-colors">রিভিউ</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[250px] bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs text-blue-300 font-semibold shadow-inner">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>১০০% বিশ্বস্ত ও ভেরিফাইড ডিজিটাল প্ল্যাটফর্ম</span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-[1.05] sm:leading-[1.1]">
            ডিজিটাল লাইসেন্স ও <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300">
              স্মার্ট শপিং প্ল্যাটফর্ম
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
            Windows অরিজিনাল লাইসেন্স কি, গেম টপ-আপ এবং AliExpress পণ্য সরাসরি ঘরে পাওয়ার সবচেয়ে বিশ্বস্ত মাধ্যম। পেমেন্ট করুন বিকাশ বা নগদে।
          </p>

          {/* CTA Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onOpenAuth('register')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm sm:text-base shadow-2xl shadow-blue-600/30 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.03] cursor-pointer"
            >
              <span>একাউন্ট তৈরি করুন (ফ্রি)</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => onOpenAuth('login')}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <LogIn className="w-5 h-5 text-blue-400" />
              <span>লগইন করুন</span>
            </button>
          </div>

          {/* Trust Metrics */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto text-left">
            <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-2xl">
              <div className="text-lg sm:text-xl font-black text-white flex items-center gap-1">
                <span>১০,০০০+</span>
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              </div>
              <p className="text-xs text-slate-400 font-medium">সন্তুষ্ট গ্রাহক</p>
            </div>

            <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-2xl">
              <div className="text-lg sm:text-xl font-black text-white flex items-center gap-1">
                <span>৫-১৫ মিনিট</span>
                <Zap className="w-4 h-4 text-rose-400" />
              </div>
              <p className="text-xs text-slate-400 font-medium">ইনস্ট্যান্ট ডেলিভারি</p>
            </div>

            <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-2xl">
              <div className="text-lg sm:text-xl font-black text-emerald-400 flex items-center gap-1">
                <span>১০০% জেনুইন</span>
                <Award className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-xs text-slate-400 font-medium">অফিসিয়াল লাইসেন্স</p>
            </div>

            <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-2xl">
              <div className="text-lg sm:text-xl font-black text-blue-400 flex items-center gap-1">
                <span>bKash / নগদ</span>
                <Lock className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-xs text-slate-400 font-medium">সহজ পেমেন্ট মেথড</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid Section */}
      <section id="services" className="py-16 px-4 sm:px-6 bg-slate-900/40 border-y border-slate-800/60">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-black tracking-widest text-blue-400 uppercase">
              আমাদের সার্ভিসসমূহ
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              একই প্ল্যাটফর্মে সবরকম ডিজিটাল সমাধান
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              নিরাপদ পেমেন্ট, দ্রুত ডেলিভারি ও ২৪/৭ গ্রাহক সেবার সাথে আমাদের সেবা উপভোগ করুন।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {services.map((srv, idx) => (
              <div 
                key={idx}
                className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 hover:border-blue-500/50 transition-all duration-300 group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center group-hover:scale-105 transition-transform">
                      {srv.icon}
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${srv.badgeColor}`}>
                      {srv.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
                      {srv.title}
                    </h3>
                    <p className="text-xs font-semibold text-slate-400 mb-2">
                      {srv.subtitle}
                    </p>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {srv.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> অটোমেটেড ট্র্যাকিং
                  </span>
                  <button 
                    onClick={() => onOpenAuth('register')}
                    className="font-bold text-blue-400 group-hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                  >
                    <span>অর্ডার করুন</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Flash Sale & Top Ranking */}
      <section className="py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          {flashSaleProducts.length > 0 && (
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Flame className="w-6 h-6 text-rose-500" />
                  <h2 className="text-xl font-black text-slate-900">Flash Sale</h2>
                </div>
                <a href="#featured" className="text-blue-600 font-bold text-sm">Shop All</a>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {flashSaleProducts.slice(0, 4).map(prod => (
                  <div key={prod.id} className="border border-slate-100 rounded-xl p-3 space-y-2 hover:shadow-md transition-shadow">
                    <img src={prod.image_url} alt={prod.title} className="w-full h-32 object-contain rounded-lg" />
                    <h3 className="text-xs font-bold text-slate-800 line-clamp-1">{prod.title}</h3>
                    <p className="text-rose-600 font-black">৳{prod.price.toLocaleString()}</p>
                    <button onClick={() => onOpenAuth('register')} className="w-full py-1.5 bg-rose-50 text-rose-600 rounded-lg text-xs font-bold cursor-pointer">Buy Now</button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {topRankingProducts.length > 0 && (
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Award className="w-6 h-6 text-amber-500" />
                  <h2 className="text-xl font-black text-slate-900">Top Ranking</h2>
                </div>
                <a href="#featured" className="text-blue-600 font-bold text-sm">Shop All</a>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {topRankingProducts.slice(0, 4).map(prod => (
                  <div key={prod.id} className="border border-slate-100 rounded-xl p-3 space-y-2 hover:shadow-md transition-shadow">
                    <img src={prod.image_url} alt={prod.title} className="w-full h-32 object-contain rounded-lg" />
                    <h3 className="text-xs font-bold text-slate-800 line-clamp-1">{prod.title}</h3>
                    <p className="text-blue-600 font-black">৳{prod.price.toLocaleString()}</p>
                    <button onClick={() => onOpenAuth('register')} className="w-full py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold cursor-pointer">Buy Now</button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </section>

      {/* Featured Products Showcase */}
      <section id="featured" className="py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-xs font-black tracking-widest text-emerald-400 uppercase">
                জনপ্রিয় প্রোডাক্টস
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                টপ সেলিং ডিজিটাল ও ফিজিক্যাল পণ্য
              </h2>
            </div>

            <button
              onClick={() => onOpenAuth('login')}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs sm:text-sm font-bold text-blue-400 flex items-center gap-1.5 cursor-pointer"
            >
              <span>সবগুলো দেখতে লগইন করুন</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredProducts.slice(0, 6).map((prod) => (
              <div 
                key={prod.id}
                className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden hover:border-slate-700 transition-all flex flex-col justify-between group"
              >
                <div className="relative aspect-video sm:aspect-[4/3] bg-slate-950 overflow-hidden">
                  <img 
                    src={prod.image_url || 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=600&q=80'} 
                    alt={prod.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  {prod.badge && (
                    <span className="absolute top-3 left-3 bg-blue-600/90 backdrop-blur-xs text-white text-[10px] font-black px-2.5 py-1 rounded-lg">
                      {prod.badge}
                    </span>
                  )}
                  <span className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-xs text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase border border-slate-800">
                    {prod.category === 'digital' ? 'ডিজিটাল কি' : 'ফিজিক্যাল'}
                  </span>
                </div>

                <div className="p-4 sm:p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-white line-clamp-1 group-hover:text-blue-400 transition-colors">
                      {prod.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                      {prod.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <div>
                      <div className="text-base sm:text-lg font-black text-emerald-400">
                        ৳{prod.price.toLocaleString()}
                      </div>
                      {prod.discount_price && (
                        <div className="text-xs text-slate-500 line-through">
                          ৳{prod.discount_price.toLocaleString()}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => onOpenAuth('login')}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>কিনুন</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 px-4 sm:px-6 bg-slate-900/60 border-t border-slate-800">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <span className="text-xs font-black tracking-widest text-indigo-400 uppercase">
              সহজ ৪টি ধাপ
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              কীভাবে অর্ডার করবেন?
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              কোনো জটিলতা ছাড়াই মাত্র কয়েক মিনিটে আপনার কাঙ্ক্ষিত পণ্য বা টপ-আপ পেয়ে যান।
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {steps.map((st, idx) => (
              <div 
                key={idx}
                className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-3 relative hover:border-indigo-500/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                    {st.icon}
                  </div>
                  <span className="text-2xl font-black text-slate-700/80">
                    {st.step}
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">
                    {st.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {st.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section id="reviews" className="py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-black tracking-widest text-amber-400 uppercase">
              গ্রাহকদের মতামত
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              আমাদের নিয়মিত কাস্টমারদের রিভিউ
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {reviews.map((rev, idx) => (
              <div 
                key={idx}
                className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-300 italic leading-relaxed">
                    "{rev.comment}"
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800 text-xs">
                  <div className="font-bold text-white">{rev.name}</div>
                  <div className="text-slate-500 text-[11px]">{rev.role}</div>
                  <div className="text-[10px] text-blue-400 font-semibold mt-1">
                    পণ্য: {rev.product}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call To Action Banner */}
      <section className="py-12 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 border border-blue-700/40 rounded-3xl p-6 sm:p-10 text-center space-y-5 shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-2 relative z-10">
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              এখনই যুক্ত হোন Veloral Digital এ
            </h2>
            <p className="text-xs sm:text-sm text-blue-200">
              একটি ফ্রি একাউন্ট তৈরি করে আজই উপভোগ করুন জেনুইন সফটওয়্যার কি, দ্রুততম গেম টপ-আপ এবং সহজ শপিং।
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 relative z-10">
            <button
              onClick={() => onOpenAuth('register')}
              className="px-6 py-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 font-black text-sm shadow-lg transition-transform transform hover:scale-105 cursor-pointer flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>ফ্রি একাউন্ট খুলুন</span>
            </button>

            <a
              href={`https://wa.me/${cleanPhone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg transition-colors flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>সরাসরি হোয়াটসঅ্যাপে কথা বলুন</span>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-950 border-t border-slate-900 py-10 px-4 sm:px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="space-y-1">
            <div className="text-sm font-black text-white flex items-center justify-center md:justify-start gap-1.5">
              <span>Veloral Digital & Shop</span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">BD</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Windows & Software Licenses • Game Top-Up (UID) • AliExpress On-Demand Import
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 text-slate-400 text-xs">
            <button onClick={() => onOpenAuth('login')} className="hover:text-white cursor-pointer">
              সাইন ইন
            </button>
            <span>•</span>
            <button onClick={() => onOpenAuth('register')} className="hover:text-white cursor-pointer">
              রেজিস্ট্রেশন
            </button>
            <span>•</span>
            <a href={`https://wa.me/${cleanPhone}`} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400">
              হেল্পলাইন ({settings.whatsapp_number})
            </a>
          </div>

          <p className="text-[11px] text-slate-600">
            © {new Date().getFullYear()} Veloral Digital. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
