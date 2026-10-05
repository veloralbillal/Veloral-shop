import React, { useState } from 'react';
import { ShoppingBag, Search, Shield, Truck, Zap, Smartphone, Globe, PackageCheck, X, User as UserIcon, LogOut, Menu, Gift, Wallet } from 'lucide-react';
import { ProductCategory, User, StoreSettings, Product } from '../types';

interface NavbarProps {
  activeCategory: ProductCategory;
  onSelectCategory: (cat: ProductCategory) => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenTracker: () => void;
  onOpenProfile: () => void;
  onOpenAdmin: () => void;
  onToggleSidebar?: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearchSubmit?: () => void;
  currentUser: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  settings?: StoreSettings;
  products?: Product[];
  onSelectProduct?: (product: Product) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeCategory,
  onSelectCategory,
  cartCount,
  onOpenCart,
  onOpenTracker,
  onOpenProfile,
  onOpenAdmin,
  onToggleSidebar,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  currentUser,
  onOpenAuth,
  onLogout,
  settings,
  products = [],
  onSelectProduct,
}) => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const matchingProducts = searchQuery.trim()
    ? products.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.product_code && p.product_code.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 6)
    : [];

  // Dynamic Navigation Items
  const navItems: { id: ProductCategory; label: string; icon?: React.ReactNode }[] = [
    { id: 'all', label: 'All Items', icon: <ShoppingBag className="w-3.5 h-3.5" /> },
  ];

  const customCats = settings?.custom_categories || [
    { id: 'digital', label: 'Digital Keys' },
    { id: 'physical', label: 'Physical Gadgets' }
  ];

  customCats.forEach(cat => {
    let icon = <Zap className="w-3.5 h-3.5 text-amber-400" />;
    if (cat.id.includes('physical') || cat.id.includes('gadget')) {
      icon = <Truck className="w-3.5 h-3.5 text-blue-400" />;
    } else if (cat.id.includes('vpn')) {
      icon = <Shield className="w-3.5 h-3.5 text-purple-400" />;
    } else if (cat.id.includes('game') || cat.id.includes('gift')) {
      icon = <Smartphone className="w-3.5 h-3.5 text-emerald-400" />;
    }
    navItems.push({ id: cat.id, label: cat.label, icon });
  });

  navItems.push(
    { id: 'topup', label: 'Top-Up & Recharge', icon: <Smartphone className="w-3.5 h-3.5 text-emerald-400" /> },
    { id: 'offers', label: 'Task Offers (Earn ৳)', icon: <Gift className="w-3.5 h-3.5 text-purple-400" /> },
    { id: 'aliexpress', label: 'AliExpress Demand', icon: <Globe className="w-3.5 h-3.5 text-rose-400" /> },
    { id: 'accounts', label: 'Account Buy/Sell', icon: <Shield className="w-3.5 h-3.5 text-blue-400" /> }
  );

  return (
    <header className="w-full max-w-full sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-xl text-slate-100">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Top Navbar Row */}
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          
          <div className="flex items-center gap-1">
            {/* Hamburger Menu Button */}
            <button
              onClick={onToggleSidebar}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer lg:hidden"
              title="Open Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Logo & Brand */}
            <button
              onClick={() => onSelectCategory('all')}
              className="flex items-center gap-2 text-left focus:outline-none shrink-0 cursor-pointer"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-base sm:text-lg shadow-md">
                V
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base sm:text-lg tracking-tight text-white leading-none">
                    Veloral
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 hidden xs:inline-block">
                    Shop
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium hidden sm:block">
                  Digital & Gadgets Store
                </span>
              </div>
            </button>
          </div>

          {/* Search bar for desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-3 relative">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search products, software, game top-up..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setIsSearchFocused(false);
                    (e.target as HTMLInputElement).blur();
                    onSearchSubmit?.();
                  }
                }}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                className="w-full pl-9 pr-8 py-2 text-xs bg-slate-950 hover:bg-slate-950/80 focus:bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-white outline-none transition-all placeholder:text-slate-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  onClick={() => {
                    onSearchChange('');
                    onSearchSubmit?.();
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Live Search Dropdown */}
            {isSearchFocused && searchQuery.trim() && products && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 p-2 z-50 max-h-96 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2.5 py-1.5 text-[10px] font-black uppercase text-slate-400 border-b border-slate-800 flex items-center justify-between">
                  <span>Live Search Results</span>
                  <span>{matchingProducts.length} found</span>
                </div>
                {matchingProducts.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No products found matching "{searchQuery}".
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800">
                    {matchingProducts.map(p => (
                      <div
                        key={p.id}
                        onMouseDown={() => {
                          if (onSelectProduct) onSelectProduct(p);
                          onSearchChange('');
                          setIsSearchFocused(false);
                        }}
                        className="flex items-center gap-3 p-2 hover:bg-slate-800 rounded-xl cursor-pointer transition-colors group"
                      >
                        <img 
                          src={p.image_url} 
                          alt={p.title} 
                          className="w-10 h-10 object-contain rounded-lg bg-slate-950 shrink-0 border border-slate-800" 
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white truncate group-hover:text-blue-400 transition-colors">{p.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-black text-blue-400">৳{p.price}</span>
                            {p.discount_price && p.discount_price > p.price && (
                              <span className="text-[10px] text-slate-500 line-through">৳{p.discount_price}</span>
                            )}
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 ml-auto uppercase">
                              {p.category}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* User Wallet Balance */}
            {currentUser && (
              <button
                onClick={() => onSelectCategory('offers')}
                className="hidden xs:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-purple-500/30 bg-purple-950/40 hover:bg-purple-900/40 text-xs font-bold transition-all cursor-pointer"
                title="Your Wallet Balance - Click to Earn More"
              >
                <Wallet className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-amber-400 font-black font-mono">৳{currentUser.wallet_balance || 0}</span>
              </button>
            )}

            {/* User Profile / Login */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-blue-500/30 bg-blue-600/10 hover:bg-blue-600/20 text-blue-300 text-xs font-bold transition-all cursor-pointer"
                  title="My Account"
                >
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black uppercase">
                    {currentUser.name.charAt(0)}
                  </div>
                  <span className="hidden sm:inline max-w-[80px] truncate">{currentUser.name.split(' ')[0]}</span>
                </button>

                {userDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-1.5 w-48 bg-slate-900 rounded-2xl shadow-xl border border-slate-800 p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="p-2 border-b border-slate-800">
                      <p className="font-extrabold text-xs text-white truncate">{currentUser.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono truncate">{currentUser.phone}</p>
                    </div>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenProfile();
                      }}
                      className="w-full mt-1 px-2.5 py-1.5 text-left text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg flex items-center gap-2 cursor-pointer"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-blue-400" />
                      <span>My Profile & Orders</span>
                    </button>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full mt-1 px-2.5 py-1.5 text-left text-xs font-semibold text-rose-400 hover:bg-rose-950/40 rounded-lg flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-all border border-slate-800 cursor-pointer"
                title="Customer Sign In / Sign Up"
              >
                <UserIcon className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="hidden xs:inline">Sign In</span>
              </button>
            )}

            {/* Order Tracker */}
            <button
              onClick={onOpenTracker}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-all border border-slate-800 cursor-pointer"
              title="Track Order Status"
            >
              <PackageCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="hidden md:inline">Track</span>
            </button>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-md cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="ml-0.5 bg-rose-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search input */}
        <div className="md:hidden pb-2 pt-0.5 relative">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search products, games, keys..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setIsSearchFocused(false);
                  (e.target as HTMLInputElement).blur();
                  onSearchSubmit?.();
                }
              }}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white outline-none placeholder:text-slate-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                onClick={() => {
                  onSearchChange('');
                  onSearchSubmit?.();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Mobile Live Search Dropdown */}
          {isSearchFocused && searchQuery.trim() && products && (
            <div className="absolute top-full left-3 right-3 mt-1 bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 p-2 z-50 max-h-80 overflow-y-auto">
              <div className="px-2.5 py-1 text-[9px] font-black uppercase text-slate-400 border-b border-slate-800 flex items-center justify-between">
                <span>Live Search Results</span>
                <span>{matchingProducts.length} found</span>
              </div>
              {matchingProducts.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  No products found matching "{searchQuery}".
                </div>
              ) : (
                <div className="divide-y divide-slate-800">
                  {matchingProducts.map(p => (
                    <div
                      key={p.id}
                      onMouseDown={() => {
                        if (onSelectProduct) onSelectProduct(p);
                        onSearchChange('');
                        setIsSearchFocused(false);
                      }}
                      className="flex items-center gap-2.5 p-2 hover:bg-slate-800 rounded-xl cursor-pointer transition-colors"
                    >
                      <img 
                        src={p.image_url} 
                        alt={p.title} 
                        className="w-8 h-8 object-contain rounded-lg bg-slate-950 shrink-0 border border-slate-800" 
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate">{p.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-black text-blue-400">৳{p.price}</span>
                          {p.discount_price && p.discount_price > p.price && (
                            <span className="text-[10px] text-slate-500 line-through">৳{p.discount_price}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Categories Bar */}
        <nav className="flex items-center gap-1.5 overflow-x-auto py-2 no-scrollbar border-t border-slate-800 -mx-3 px-3 sm:mx-0 sm:px-0">
          {navItems.map((item) => {
            const isActive = activeCategory === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectCategory(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
