import React from 'react';
import { 
  ShoppingBag, PackageCheck, User as UserIcon, MapPin, Key, 
  MessageCircle, ShieldCheck, LogOut, Home, Menu, X, ArrowRight, Zap, Globe, Wallet, Grid, Gift
} from 'lucide-react';
import { User } from '../types';

interface SidebarMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: string;
  onNavigate: (view: any) => void;
  currentUser: User | null;
  onLogout: () => void;
}

export const SidebarMenu: React.FC<SidebarMenuProps> = ({
  isOpen,
  onClose,
  currentView,
  onNavigate,
  currentUser,
  onLogout,
}) => {
  const menuItems = [
    { id: 'store', label: 'Shop Home', icon: <Home className="w-4 h-4 text-emerald-400" />, view: 'store' },
    { id: 'products', label: 'All Products', icon: <Grid className="w-4 h-4 text-blue-400" />, view: 'products' },
    { id: 'affiliate-deals', label: 'Affiliate & Special Deals', icon: <Globe className="w-4 h-4 text-rose-400" />, view: 'affiliate-deals' },
    { id: 'cart', label: 'My Cart', icon: <ShoppingBag className="w-4 h-4 text-amber-400" />, view: 'cart' },
    { id: 'tracker', label: 'Order Tracker', icon: <PackageCheck className="w-4 h-4 text-teal-400" />, view: 'tracker' },
  ];

  const profileItems = currentUser ? [
    { id: 'profile', label: 'My Profile', icon: <UserIcon className="w-4 h-4 text-indigo-400" />, view: 'profile' },
    { id: 'profile-wallet', label: 'My Wallet', icon: <Wallet className="w-4 h-4 text-purple-400" />, view: 'profile-wallet' },
    { id: 'profile-address', label: 'Delivery Address', icon: <MapPin className="w-4 h-4 text-rose-400" />, view: 'profile-address' },
    { id: 'profile-orders', label: 'My Orders', icon: <ShoppingBag className="w-4 h-4 text-amber-400" />, view: 'profile-orders' },
    { id: 'profile-licenses', label: 'License & Files Vault', icon: <Key className="w-4 h-4 text-emerald-400" />, view: 'profile-licenses' },
    { id: 'profile-support', label: 'Live Support', icon: <MessageCircle className="w-4 h-4 text-purple-400" />, view: 'profile-support' },
  ] : [];

  const handleItemClick = (view: any) => {
    onNavigate(view);
    onClose();
  };

  return (
    <>
      {/* Mobile Overlay Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar Drawer Container */}
      <aside className={`fixed top-0 left-0 h-screen w-72 bg-slate-950 border-r border-slate-900 z-50 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        
        {/* Upper Header portion */}
        <div>
          <div className="h-16 border-b border-slate-900 px-5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-black text-xs shadow-md shadow-blue-600/30">V</div>
              <span className="text-sm font-black text-white tracking-wider">Veloral Digital Menu</span>
            </div>
            <button 
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white lg:hidden cursor-pointer bg-slate-900/60 rounded-lg hover:bg-slate-900"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Menu items block */}
          <div className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-14rem)] scrollbar-none">
            {/* General Navigation */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-3 block">Shop Navigation</span>
              <div className="space-y-1">
                {menuItems.map((item) => {
                  const isActive = currentView === item.view;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item.view)}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-left text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                        isActive 
                          ? 'bg-blue-600/15 border border-blue-500/30 text-white font-black shadow-md' 
                          : 'text-slate-400 hover:bg-slate-900/60 hover:text-white border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {item.icon}
                        <span>{item.label}</span>
                      </div>
                      {isActive && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Profile sub-menus (Only when logged in) */}
            {currentUser && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-3 block">Customer Account</span>
                <div className="space-y-1">
                  {profileItems.map((item) => {
                    const isActive = currentView === item.view;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleItemClick(item.view)}
                        className={`w-full px-3.5 py-2.5 rounded-xl text-left text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                          isActive 
                            ? 'bg-blue-600/15 border border-blue-500/30 text-white font-black shadow-md' 
                            : 'text-slate-400 hover:bg-slate-900/60 hover:text-white border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {item.icon}
                          <span>{item.label}</span>
                        </div>
                        {isActive && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Admin control option if authenticated as admin */}
            {currentUser?.role === 'admin' && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-3 block">Admin Controls</span>
                <button
                  onClick={() => handleItemClick('admin')}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-left text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                    currentView === 'admin' 
                      ? 'bg-blue-600/15 border border-blue-500/30 text-white font-black' 
                      : 'text-slate-400 hover:bg-slate-900/60 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-blue-500 animate-pulse" />
                    <span>Admin Control Panel</span>
                  </div>
                  {currentView === 'admin' && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Lower footer portion */}
        <div className="p-4 border-t border-slate-900 space-y-3 bg-slate-950">
          {currentUser ? (
            <div className="space-y-3">
              <div 
                onClick={() => handleItemClick('profile-wallet')}
                className="px-3.5 py-2.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/40 border border-purple-800/40 hover:border-purple-600/50 flex items-center justify-between cursor-pointer transition-all group"
              >
                <div>
                  <p className="text-xs font-black text-white truncate">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-400 truncate font-mono mt-0.5">{currentUser.phone}</p>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-purple-300 block font-bold group-hover:underline">Wallet</span>
                  <span className="text-xs font-black text-amber-400 font-mono">৳{currentUser.wallet_balance || 0}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="w-full py-2.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-900/25 hover:border-rose-500/20 text-rose-400 rounded-xl transition-colors cursor-pointer text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleItemClick('auth')}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors cursor-pointer text-xs font-bold flex items-center justify-center gap-1 shadow-md shadow-blue-600/30"
            >
              <span>Login / Register</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <div className="text-[9px] text-center text-slate-600 font-mono tracking-wider">
            VELORAL ECOSYSTEM v2.0
          </div>
        </div>
      </aside>
    </>
  );
};
