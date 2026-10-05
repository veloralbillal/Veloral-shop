import React, { useState } from 'react';
import { User, Order, AliExpressDemandOrder, OfferSubmission } from '../types';
import { 
  ArrowLeft, ArrowRight, User as UserIcon, Mail, Phone, MapPin, 
  ShoppingBag, Key, MessageCircle, ChevronRight, ShieldCheck, LogOut, Download,
  Wallet, Coins, Sparkles, Gift, CheckCircle2, Clock, XCircle, ArrowUpRight, PlusCircle
} from 'lucide-react';
import { SharedHeader } from './SharedHeader';

interface ProfileScreenProps {
  currentUser: User;
  orders: Order[];
  aliExpressOrders: AliExpressDemandOrder[];
  submissions?: OfferSubmission[];
  onNavigate: (view: 'profile-address' | 'profile-orders' | 'profile-licenses' | 'profile-support' | 'profile-wallet') => void;
  onSelectCategory?: (category: any) => void;
  onClose: () => void;
  onLogout: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  currentUser,
  orders,
  aliExpressOrders,
  submissions = [],
  onNavigate,
  onSelectCategory,
  onClose,
  onLogout,
}) => {
  const [profileActivityFilter, setProfileActivityFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');

  // Filter submissions belonging to this user
  const userSubmissions = submissions.filter(
    (s) =>
      (s.user_id && s.user_id === currentUser.id) ||
      s.user_phone === currentUser.phone ||
      (currentUser.email && s.user_email === currentUser.email)
  );

  const walletBalance = currentUser.wallet_balance || 0;

  const totalEarned = userSubmissions
    .filter((s) => s.status === 'approved')
    .reduce((sum, s) => sum + Number(s.reward_amount || 0), 0);

  const pendingAmount = userSubmissions
    .filter((s) => s.status === 'pending')
    .reduce((sum, s) => sum + Number(s.reward_amount || 0), 0);

  const approvedCount = userSubmissions.filter((s) => s.status === 'approved').length;
  const pendingCount = userSubmissions.filter((s) => s.status === 'pending').length;

  const filteredSubmissions = userSubmissions.filter((s) => {
    if (profileActivityFilter === 'all') return true;
    return s.status === profileActivityFilter;
  });

  // Count counts of each item
  const myOrdersCount = orders.filter(
    (o) =>
      o.customer_phone === currentUser.phone ||
      (currentUser.email && o.customer_email === currentUser.email)
  ).length + aliExpressOrders.filter(
    (a) =>
      a.customer_phone === currentUser.phone ||
      (currentUser.email && a.customer_email === currentUser.email)
  ).length;

  const myLicensesCount = orders.filter(
    (o) =>
      (o.customer_phone === currentUser.phone || (currentUser.email && o.customer_email === currentUser.email)) &&
      o.license_key_delivered &&
      o.status === 'completed'
  ).length;

  // Retrieve saved address for preview
  const savedAddress = localStorage.getItem(`veloral_address_${currentUser.phone}`);
  let addressPreview = 'No address added yet.';
  if (savedAddress) {
    try {
      const parsed = JSON.parse(savedAddress);
      addressPreview = `${parsed.district || ''}, ${parsed.city || ''}, ${parsed.area || ''}`;
    } catch (e) {}
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans relative overflow-hidden">
      {/* Background radial highlights */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <SharedHeader title="Customer Profile & Dashboard" onBack={onClose} />

      {/* Profile Body */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 relative z-10 space-y-6">
        
        {/* User Card */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-blue-500/20 uppercase shrink-0">
            {currentUser.name.charAt(0)}
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-center sm:justify-start gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white">{currentUser.name}</h2>
                <span className="bg-blue-600/20 text-blue-400 border border-blue-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase w-max mx-auto sm:mx-0">
                  {currentUser.role || 'Customer'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Customer Account ID: {currentUser.id.substring(0, 12)}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <Phone className="w-3.5 h-3.5 text-blue-500" />
                <span>{currentUser.phone}</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <Mail className="w-3.5 h-3.5 text-blue-500" />
                <span>{currentUser.email}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white rounded-xl transition-all cursor-pointer font-bold text-xs border border-rose-500/20 flex items-center gap-1.5 shrink-0"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Feature: Main Digital Wallet & Rewards Hub */}
        <div className="relative rounded-3xl bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950 border border-purple-500/40 p-6 sm:p-7 shadow-2xl overflow-hidden space-y-5">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#c084fc_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 text-xs font-bold">
                <Wallet className="w-3.5 h-3.5 text-purple-400" />
                <span>Veloral Digital Wallet</span>
              </div>
              <p className="text-xs text-slate-400">Available Wallet Balance</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-amber-400 tracking-tight">
                  ৳{walletBalance}
                </span>
                <span className="text-xs font-bold text-slate-400 font-mono">BDT CASH</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              <button
                onClick={() => {
                  if (onSelectCategory) {
                    onSelectCategory('offers');
                  } else {
                    onNavigate('profile-wallet');
                  }
                }}
                className="flex-1 md:flex-initial px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer transform hover:scale-[1.02]"
              >
                <Gift className="w-4 h-4 text-amber-300" />
                <span>Earn via Tasks</span>
              </button>

              <button
                onClick={() => onNavigate('profile-wallet')}
                className="flex-1 md:flex-initial px-4 py-2.5 bg-slate-900/90 hover:bg-slate-800 text-purple-300 hover:text-white border border-purple-500/30 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span>View Full History</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Wallet Highlights Strip */}
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-purple-800/30">
            <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800/90">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Total Earned</span>
              <span className="text-base sm:text-lg font-black text-emerald-400">৳{totalEarned}</span>
              <span className="text-[9px] text-slate-500 block">({approvedCount} Tasks Approved)</span>
            </div>

            <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800/90">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Pending Rewards</span>
              <span className="text-base sm:text-lg font-black text-amber-400">৳{pendingAmount}</span>
              <span className="text-[9px] text-slate-500 block">({pendingCount} Under Review)</span>
            </div>

            <div className="col-span-2 sm:col-span-1 p-3 bg-slate-950/70 rounded-2xl border border-slate-800/90 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Security & Status</span>
              <div className="flex items-center gap-1.5 text-xs text-blue-400 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verified Account</span>
              </div>
              <span className="text-[9px] text-slate-500 font-mono">Eligible for checkout</span>
            </div>
          </div>
        </div>

        {/* Embedded Recent Wallet Activities Log directly in Profile */}
        <div className="bg-slate-900 border border-slate-800/90 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm sm:text-base font-black text-white">
                  Wallet Activity Log
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-purple-400 font-mono font-bold">
                  {userSubmissions.length}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Real-time updates on your task submissions, cashbacks, and rewards.</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 self-stretch sm:self-auto overflow-x-auto">
              <button
                onClick={() => setProfileActivityFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                  profileActivityFilter === 'all'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({userSubmissions.length})
              </button>
              <button
                onClick={() => setProfileActivityFilter('approved')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                  profileActivityFilter === 'approved'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-emerald-400'
                }`}
              >
                Approved ({approvedCount})
              </button>
              <button
                onClick={() => setProfileActivityFilter('pending')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                  profileActivityFilter === 'pending'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-amber-400'
                }`}
              >
                Pending ({pendingCount})
              </button>
            </div>
          </div>

          {/* Activity List */}
          {filteredSubmissions.length === 0 ? (
            <div className="py-8 text-center bg-slate-950/60 rounded-2xl border border-slate-800/80 space-y-2">
              <Coins className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs font-bold text-slate-300">No activity found</p>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                Complete Telegram, Facebook, or WhatsApp tasks to earn balance into your wallet.
              </p>
              <button
                onClick={() => {
                  if (onSelectCategory) {
                    onSelectCategory('offers');
                  } else {
                    onNavigate('profile-wallet');
                  }
                }}
                className="mt-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Gift className="w-3.5 h-3.5" />
                <span>View Task Offers</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredSubmissions.slice(0, 5).map((sub) => {
                const isApproved = sub.status === 'approved';
                const isPending = sub.status === 'pending';
                const isRejected = sub.status === 'rejected';

                return (
                  <div
                    key={sub.id}
                    className="p-3 sm:p-4 bg-slate-950/70 border border-slate-800 hover:border-purple-500/30 rounded-2xl flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                          isApproved
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : isPending
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}
                      >
                        {isApproved && <CheckCircle2 className="w-4 h-4" />}
                        {isPending && <Clock className="w-4 h-4 animate-pulse" />}
                        {isRejected && <XCircle className="w-4 h-4" />}
                      </div>

                      <div className="space-y-0.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white truncate">{sub.offer_title}</h4>
                          {isApproved && (
                            <span className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase bg-emerald-950 text-emerald-400 border border-emerald-800/80">
                              +৳{sub.reward_amount} Credited
                            </span>
                          )}
                          {isPending && (
                            <span className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase bg-amber-950 text-amber-400 border border-amber-800/80">
                              Under Review
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                          <span>User: <strong className="text-slate-400">{sub.submitted_username}</strong></span>
                          <span>•</span>
                          <span>{new Date(sub.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`text-xs sm:text-sm font-black ${
                        isApproved ? 'text-emerald-400' : isPending ? 'text-amber-400' : 'text-slate-500'
                      }`}>
                        {isApproved ? '+' : ''}৳{sub.reward_amount}
                      </span>
                      <span className="text-[9px] text-slate-500 block uppercase font-mono">BDT</span>
                    </div>
                  </div>
                );
              })}

              {filteredSubmissions.length > 5 && (
                <div className="pt-2 text-center">
                  <button
                    onClick={() => onNavigate('profile-wallet')}
                    className="text-xs text-purple-400 hover:text-purple-300 font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>View all {filteredSubmissions.length} activities</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Menu Grid - Other Profile Sections */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Card: My Wallet & Task Earnings */}
          <button
            onClick={() => onNavigate('profile-wallet')}
            className="p-5 bg-gradient-to-br from-slate-900 via-purple-950/20 to-slate-900 hover:border-purple-500/40 border border-purple-500/20 rounded-3xl text-left space-y-3 shadow-md group transition-all duration-200 cursor-pointer flex flex-col justify-between h-40"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-10 h-10 bg-purple-600/10 border border-purple-500/30 rounded-xl flex items-center justify-center text-purple-400">
                <Wallet className="w-5 h-5 text-purple-400" />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs font-black text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full">
                  ৳{walletBalance}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
            <div>
              <h4 className="font-extrabold text-white text-sm group-hover:text-purple-300 transition-colors">My Wallet & Rewards</h4>
              <p className="text-[11px] text-slate-400 mt-1">View task reward approvals, transactions, and full wallet activity.</p>
            </div>
          </button>

          {/* Card 1: My Address */}
          <button
            onClick={() => onNavigate('profile-address')}
            className="p-5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-3xl text-left space-y-3 shadow-md group transition-all duration-200 cursor-pointer flex flex-col justify-between h-40"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-10 h-10 bg-blue-600/10 border border-blue-500/20 rounded-xl flex items-center justify-center text-blue-400">
                <MapPin className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>
            <div>
              <h4 className="font-extrabold text-white text-sm">Delivery Address</h4>
              <p className="text-[11px] text-slate-400 truncate mt-1">{addressPreview}</p>
            </div>
          </button>

          {/* Card 2: My Orders */}
          <button
            onClick={() => onNavigate('profile-orders')}
            className="p-5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-3xl text-left space-y-3 shadow-md group transition-all duration-200 cursor-pointer flex flex-col justify-between h-40"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-10 h-10 bg-indigo-600/10 border border-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>
            <div>
              <h4 className="font-extrabold text-white text-sm">My Orders</h4>
              <p className="text-[11px] text-slate-400 mt-1">Click to view full order history ({myOrdersCount} total orders).</p>
            </div>
          </button>

          {/* Card 3: Digital Downloads & License Vault */}
          <button
            onClick={() => onNavigate('profile-licenses')}
            className="p-5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-3xl text-left space-y-3 shadow-md group transition-all duration-200 cursor-pointer flex flex-col justify-between h-40"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-10 h-10 bg-emerald-600/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
                <Download className="w-5 h-5 animate-pulse" />
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>
            <div>
              <h4 className="font-extrabold text-white text-sm">Digital Downloads & Licenses</h4>
              <p className="text-[11px] text-slate-400 mt-1">Access purchased license keys, download links, and digital codes.</p>
            </div>
          </button>

          {/* Card 4: Customer Support */}
          <button
            onClick={() => onNavigate('profile-support')}
            className="p-5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-3xl text-left space-y-3 shadow-md group transition-all duration-200 cursor-pointer flex flex-col justify-between h-40"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-10 h-10 bg-amber-600/10 border border-amber-500/20 rounded-xl flex items-center justify-center text-amber-400">
                <MessageCircle className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>
            <div>
              <h4 className="font-extrabold text-white text-sm">Live Help & Support</h4>
              <p className="text-[11px] text-slate-400 mt-1">Get fast support for any questions or order inquiries.</p>
            </div>
          </button>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 text-center text-xs text-slate-600 relative z-10 border-t border-slate-900 bg-slate-950/40">
        <div className="flex items-center justify-center gap-1 text-slate-500 mb-1">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>100% Secure Customer Portal & Protected Wallet System</span>
        </div>
        <p>© {new Date().getFullYear()} Veloral Digital & Shop. All rights reserved.</p>
      </footer>
    </div>
  );
};
