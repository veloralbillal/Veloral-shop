import React, { useState } from 'react';
import { User, OfferSubmission } from '../../types';
import { SharedHeader } from '../SharedHeader';
import { 
  Wallet, Coins, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle2, 
  XCircle, Gift, Sparkles, ShoppingBag, ShieldCheck, ChevronRight, 
  HelpCircle, RefreshCw, AlertCircle, ExternalLink, Search, X, PlusCircle 
} from 'lucide-react';

interface MyWalletScreenProps {
  currentUser: User;
  submissions: OfferSubmission[];
  onNavigate: (view: any) => void;
  onSelectCategory?: (cat: any) => void;
  onClose: () => void;
}

export const MyWalletScreen: React.FC<MyWalletScreenProps> = ({
  currentUser,
  submissions,
  onNavigate,
  onSelectCategory,
  onClose,
}) => {
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');
  const [activitySearchQuery, setActivitySearchQuery] = useState('');
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);

  // Filter submissions belonging to this user
  const userSubmissions = submissions.filter(
    (s) =>
      (s.user_id && s.user_id === currentUser.id) ||
      s.user_phone === currentUser.phone ||
      (currentUser.email && s.user_email === currentUser.email)
  );

  const walletBalance = currentUser.wallet_balance || 0;

  // Calculate statistics
  const totalEarned = userSubmissions
    .filter((s) => s.status === 'approved')
    .reduce((sum, s) => sum + Number(s.reward_amount || 0), 0);

  const pendingAmount = userSubmissions
    .filter((s) => s.status === 'pending')
    .reduce((sum, s) => sum + Number(s.reward_amount || 0), 0);

  const approvedCount = userSubmissions.filter((s) => s.status === 'approved').length;
  const pendingCount = userSubmissions.filter((s) => s.status === 'pending').length;
  const rejectedCount = userSubmissions.filter((s) => s.status === 'rejected').length;

  const filteredSubmissions = userSubmissions.filter((s) => {
    const matchesFilter = filter === 'all' || s.status === filter;
    const q = activitySearchQuery.trim().toLowerCase();
    const matchesSearch = !q ||
      s.offer_title.toLowerCase().includes(q) ||
      s.submitted_username.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <SharedHeader title="My Wallet & Rewards" onBack={onClose} />

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 relative z-10 space-y-6">
        
        {/* Main Wallet Hero Card */}
        <div className="relative rounded-3xl bg-gradient-to-br from-purple-900 via-indigo-950 to-slate-900 border border-purple-500/30 p-6 sm:p-8 overflow-hidden shadow-2xl">
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#a855f7_1px,transparent_1px)] [background-size:16px_16px]" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 text-xs font-bold">
                <Wallet className="w-3.5 h-3.5 text-purple-400" />
                <span>Veloral Digital Cash Wallet</span>
              </div>
              <p className="text-xs text-slate-400">Available Wallet Balance</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-5xl font-black text-amber-400 tracking-tight">
                  ৳{walletBalance}
                </span>
                <span className="text-sm sm:text-base font-bold text-slate-300">BDT</span>
              </div>
            </div>

            {/* Quick Action CTA buttons */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <button
                onClick={() => {
                  if (onSelectCategory) {
                    onSelectCategory('offers');
                  } else {
                    onNavigate('store');
                  }
                }}
                className="flex-1 md:flex-initial px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer transform hover:scale-[1.02]"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Earn via Tasks</span>
              </button>

              <button
                onClick={() => setIsDepositModalOpen(true)}
                className="flex-1 md:flex-initial px-4 py-3 bg-purple-900/60 hover:bg-purple-800/80 text-purple-200 border border-purple-500/40 font-bold text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-emerald-400" />
                <span>Balance & Recharge Guide</span>
              </button>

              <button
                onClick={() => {
                  if (onSelectCategory) {
                    onSelectCategory('all');
                  } else {
                    onNavigate('store');
                  }
                }}
                className="flex-1 md:flex-initial px-4 py-3 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-blue-400" />
                <span>Go to Shop</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="mt-6 pt-6 border-t border-purple-800/40 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800/80">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Total Earned</span>
              <span className="text-base sm:text-lg font-black text-emerald-400">৳{totalEarned}</span>
              <span className="text-[9px] text-slate-500 block">({approvedCount} Tasks Approved)</span>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800/80">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Pending Rewards</span>
              <span className="text-base sm:text-lg font-black text-amber-400">৳{pendingAmount}</span>
              <span className="text-[9px] text-slate-500 block">({pendingCount} Under Review)</span>
            </div>

            <div className="col-span-2 sm:col-span-1 p-3 bg-slate-950/60 rounded-2xl border border-slate-800/80 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Security Status</span>
              <div className="flex items-center gap-1.5 text-xs text-blue-400 font-bold">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span>Verified Account</span>
              </div>
              <span className="text-[9px] text-slate-500 font-mono">{currentUser.phone}</span>
            </div>
          </div>
        </div>

        {/* Activity Section Header & Filter Tabs */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>Wallet Activity History</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                  {userSubmissions.length}
                </span>
              </h3>
              <p className="text-xs text-slate-400">Track your task submissions, reward approvals, and wallet balance.</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-2xl border border-slate-800 self-stretch sm:self-auto overflow-x-auto">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  filter === 'all'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({userSubmissions.length})
              </button>
              <button
                onClick={() => setFilter('approved')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  filter === 'approved'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-emerald-400'
                }`}
              >
                Approved ({approvedCount})
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  filter === 'pending'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-amber-400'
                }`}
              >
                Pending ({pendingCount})
              </button>
              <button
                onClick={() => setFilter('rejected')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  filter === 'rejected'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-rose-400'
                }`}
              >
                Rejected ({rejectedCount})
              </button>
            </div>
          </div>

          {/* Live Search inside Wallet Activities */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search activity by task title or ID..."
              value={activitySearchQuery}
              onChange={(e) => setActivitySearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 text-xs bg-slate-900 border border-slate-800 rounded-2xl text-white outline-none focus:border-purple-500 placeholder:text-slate-500 transition-colors"
            />
            {activitySearchQuery && (
              <button
                onClick={() => setActivitySearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Activity Cards List */}
          {filteredSubmissions.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/60 border border-slate-800/80 rounded-3xl space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto text-xl">
                <Coins className="w-6 h-6 text-slate-500" />
              </div>
              <h4 className="text-sm font-bold text-white">No activity records found</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                You haven't submitted any tasks yet. Complete Telegram, WhatsApp, or Facebook offers to earn wallet cash.
              </p>
              <button
                onClick={() => {
                  if (onSelectCategory) {
                    onSelectCategory('offers');
                  } else {
                    onNavigate('store');
                  }
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer inline-flex items-center gap-1.5"
              >
                <Gift className="w-4 h-4" />
                <span>Browse Active Offers</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSubmissions.map((sub) => {
                const isApproved = sub.status === 'approved';
                const isPending = sub.status === 'pending';
                const isRejected = sub.status === 'rejected';

                return (
                  <div
                    key={sub.id}
                    className="p-4 sm:p-5 bg-slate-900 border border-slate-800/90 hover:border-slate-700 rounded-3xl shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                  >
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                          isApproved
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : isPending
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}
                      >
                        {isApproved && <CheckCircle2 className="w-5 h-5" />}
                        {isPending && <Clock className="w-5 h-5 animate-pulse" />}
                        {isRejected && <XCircle className="w-5 h-5" />}
                      </div>

                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-extrabold text-white truncate">
                            {sub.offer_title}
                          </h4>
                          {isApproved && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-950 text-emerald-400 border border-emerald-800/80">
                              +৳{sub.reward_amount} Credited to Wallet
                            </span>
                          )}
                          {isPending && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-950 text-amber-400 border border-amber-800/80">
                              Admin Verification Pending
                            </span>
                          )}
                          {isRejected && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-rose-950 text-rose-400 border border-rose-800/80">
                              Submission Rejected
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 font-mono">
                          <span>Username: <strong className="text-purple-300">{sub.submitted_username}</strong></span>
                          <span>•</span>
                          <span>Date: {new Date(sub.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>

                        {sub.admin_note && (
                          <div className="p-2 bg-slate-950/80 rounded-xl border border-rose-900/30 text-[11px] text-rose-300">
                            <strong>Admin Note:</strong> {sub.admin_note}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Amount & Status Badge */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                      <div className="flex items-center gap-1 font-black text-base sm:text-lg">
                        <span className={isApproved ? 'text-emerald-400' : isPending ? 'text-amber-400' : 'text-slate-500'}>
                          {isApproved ? '+' : ''}৳{sub.reward_amount}
                        </span>
                        <span className="text-[10px] text-slate-500 uppercase font-mono">BDT</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium">
                        ID: {sub.id.substring(0, 10)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Informative Guidance Banner */}
        <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/80 border border-slate-800/80 space-y-2 text-xs text-slate-400">
          <div className="flex items-center gap-2 font-bold text-white text-xs">
            <HelpCircle className="w-4 h-4 text-purple-400" />
            <span>How does the Wallet work?</span>
          </div>
          <p className="leading-relaxed text-[11px]">
            1. Complete verified promotional tasks (Telegram, WhatsApp, Surveys) and submit your username or confirmation.
            <br />
            2. Our admin team verifies your submission and credits your wallet balance instantly upon approval.
            <br />
            3. Spend your wallet balance across any store orders (Software keys, Gaming top-ups, AliExpress) with 1-click checkout deduction.
          </p>
        </div>

      </main>

      {/* Deposit Guidance Modal */}
      {isDepositModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-4 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
                  <Wallet className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-black text-white">Wallet Balance & Recharge Guide</h3>
              </div>
              <button 
                onClick={() => setIsDepositModalOpen(false)}
                className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 bg-purple-950/40 border border-purple-800/50 rounded-2xl space-y-1">
                <span className="font-black text-purple-300 block">1. Free Earnings via Task Offers:</span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Join Telegram channels, follow social pages, or complete simple surveys. Balance is credited automatically upon admin approval.
                </p>
              </div>

              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-1">
                <span className="font-black text-emerald-400 block">2. Direct bKash / Nagad Balance Top-Up:</span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Contact our official WhatsApp support or use checkout to deposit funds directly into your account using bKash or Nagad.
                </p>
              </div>

              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-1">
                <span className="font-black text-blue-400 block">3. Instant Spending on Store Orders:</span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Use your accumulated balance to pay for digital software keys, game top-ups, social accounts, and AliExpress orders with 1 click.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsDepositModalOpen(false);
                  if (onSelectCategory) {
                    onSelectCategory('offers');
                  } else {
                    onNavigate('store');
                  }
                }}
                className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/30 transition-all cursor-pointer text-center"
              >
                Explore Task Offers
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-6 px-4 text-center text-xs text-slate-600 relative z-10 border-t border-slate-900 bg-slate-950/40">
        <div className="flex items-center justify-center gap-1 text-slate-500 mb-1">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>100% Secure Encrypted Wallet Ledger System</span>
        </div>
        <p>© {new Date().getFullYear()} Veloral Digital & Shop. All rights reserved.</p>
      </footer>
    </div>
  );
};
