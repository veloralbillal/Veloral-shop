import React, { useState } from 'react';
import { OfferItem, OfferSubmission, User } from '../../types';
import { submitOfferTask } from '../../services/db';
import { 
  Gift, Wallet, CheckCircle2, Clock, XCircle, ArrowRight, 
  Send, ShieldCheck, AlertCircle, X, ChevronRight, Sparkles, Coins
} from 'lucide-react';

interface OffersSectionProps {
  offers: OfferItem[];
  submissions: OfferSubmission[];
  currentUser: User | null;
  onRefreshData: () => void;
  onOpenAuth: () => void;
  showToast: (msg: string) => void;
}

export const OffersSection: React.FC<OffersSectionProps> = ({
  offers,
  submissions,
  currentUser,
  onRefreshData,
  onOpenAuth,
  showToast,
}) => {
  const [selectedOffer, setSelectedOffer] = useState<OfferItem | null>(null);
  const [submittedUsername, setSubmittedUsername] = useState('');
  const [submittedPassword, setSubmittedPassword] = useState('');
  const [submittedProof, setSubmittedProof] = useState('');
  const [userPhone, setUserPhone] = useState(currentUser?.phone || '');
  const [userName, setUserName] = useState(currentUser?.name || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'available' | 'my_submissions'>('available');

  const mySubmissions = submissions.filter(s => 
    (currentUser && s.user_id === currentUser.id) || 
    (currentUser && s.user_phone === currentUser.phone)
  );

  const walletBalance = currentUser?.wallet_balance || 0;

  const handleOpenOfferModal = (offer: OfferItem) => {
    if (!currentUser) {
      showToast('টাস্ক সাবমিট করতে প্রথমে লগইন করুন।');
      onOpenAuth();
      return;
    }
    setSelectedOffer(offer);
    setSubmittedUsername('');
    setSubmittedPassword('');
    setSubmittedProof('');
    setUserPhone(currentUser.phone || '');
    setUserName(currentUser.name || '');
  };

  const handleSubmitTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOffer) return;

    if (!userPhone.trim()) {
      showToast('দয়া করে আপনার সচল মোবাইল নম্বর দিন।');
      return;
    }

    if (selectedOffer.requires_username && !submittedUsername.trim()) {
      showToast('ইউজারনেম বা আইডি পূরণ করা আবশ্যক।');
      return;
    }

    if (selectedOffer.requires_password && !submittedPassword.trim()) {
      showToast('পাসওয়ার্ড বা কোড দেওয়া আবশ্যক।');
      return;
    }

    setIsSubmitting(true);
    try {
      submitOfferTask({
        offer_id: selectedOffer.id,
        offer_title: selectedOffer.title,
        reward_amount: selectedOffer.reward_amount,
        user_id: currentUser?.id,
        user_name: userName.trim() || 'User',
        user_phone: userPhone.trim(),
        user_email: currentUser?.email,
        submitted_username: submittedUsername.trim(),
        submitted_password: submittedPassword.trim() || undefined,
        submitted_proof: submittedProof.trim() || undefined,
      });

      showToast(`টাস্ক সাবমিট সম্পন্ন! অ্যাডমিন যাচাই করে ৳${selectedOffer.reward_amount} ওয়ালেটে যোগ করবে।`);
      setSelectedOffer(null);
      setActiveTab('my_submissions');
      onRefreshData();
    } catch (err: any) {
      showToast('সাবমিট করতে সমস্যা হয়েছে, আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Hero Header with Wallet Card */}
      <div className="relative rounded-3xl bg-gradient-to-br from-purple-950 via-indigo-950 to-slate-900 border border-slate-800 p-6 sm:p-8 overflow-hidden shadow-2xl">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#a855f7_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-bold">
              <Gift className="w-4 h-4" /> ইনস্ট্যান্ট টাস্ক রিওয়ার্ড ও মাইক্রো অফার
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              টাস্ক কমপ্লিট করুন ও <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300">ওয়ালেট ব্যালেন্স জিতুন</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              টেলিগ্রাম, হোয়াটসঅ্যাপ বা ফেসবুক অফার সাবমিট করুন। অ্যাডমিন অনুমোদনের সাথে সাথে টাকা সরাসরি আপনার ওয়ালেটে জমা হবে।
            </p>
          </div>

          {/* User Wallet Balance Box */}
          <div className="w-full md:w-auto shrink-0 bg-slate-900/90 border border-purple-500/30 rounded-2xl p-4 sm:p-5 shadow-xl flex items-center justify-between gap-6 backdrop-blur-md">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-purple-400" />
                <span>আপনার ওয়ালেট ব্যালেন্স</span>
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-amber-400">৳{walletBalance}</span>
                <span className="text-xs text-slate-400">BDT</span>
              </div>
            </div>
            {currentUser ? (
              <div className="text-right">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-[10px] font-bold">
                  <CheckCircle2 className="w-3 h-3" /> সক্রিয় ওয়ালেট
                </span>
                <p className="text-[9px] text-slate-500 mt-1">{currentUser.name}</p>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs cursor-pointer shadow-md transition-all"
              >
                লগইন করুন
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('available')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'available'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>চলমান অফার সমূহ ({offers.filter(o => o.active).length})</span>
          </button>

          <button
            onClick={() => setActiveTab('my_submissions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'my_submissions'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>আমার সাবমিশন ({mySubmissions.length})</span>
          </button>
        </div>
      </div>

      {/* Available Offers Grid */}
      {activeTab === 'available' && (
        <div className="space-y-4">
          {offers.filter(o => o.active).length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs bg-slate-900/50 rounded-2xl border border-slate-800">
              বর্তমানে কোনো অফার চালু নেই। অনুগ্রহ করে কিছুক্ষণ পর আবার চেক করুন।
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {offers.filter(o => o.active).map(offer => (
                <div
                  key={offer.id}
                  className="bg-slate-900 border border-slate-800 hover:border-purple-500/50 rounded-3xl p-5 flex flex-col justify-between space-y-4 shadow-lg transition-all group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <img
                        src={offer.icon_url || 'https://cdn-icons-png.flaticon.com/512/2111/2111646.png'}
                        alt={offer.title}
                        className="w-12 h-12 object-contain rounded-2xl bg-slate-950 p-2 border border-slate-800 shrink-0"
                      />
                      <div className="flex items-center gap-1 px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full font-black text-xs">
                        <Coins className="w-3.5 h-3.5" />
                        <span>রিওয়ার্ড: ৳{offer.reward_amount}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-sm font-black text-white group-hover:text-purple-400 transition-colors line-clamp-1">
                        {offer.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {offer.description}
                      </p>
                    </div>

                    {offer.instructions && (
                      <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80 text-[10px] text-slate-300 whitespace-pre-line leading-relaxed">
                        <span className="font-bold text-slate-400 block mb-0.5">নিয়মাবলী:</span>
                        {offer.instructions}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
                    <span className="text-[11px] font-bold text-slate-400">
                      ভেরিফিকেশন: <span className="text-emerald-400">ম্যানুয়াল রিভিউ</span>
                    </span>
                    <button
                      onClick={() => handleOpenOfferModal(offer)}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/20 transition-all cursor-pointer"
                    >
                      <span>টাস্ক সাবমিট করুন</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* User's Submitted Tasks */}
      {activeTab === 'my_submissions' && (
        <div className="space-y-4">
          {!currentUser ? (
            <div className="p-12 text-center text-slate-400 text-xs bg-slate-900/50 rounded-2xl border border-slate-800 space-y-3">
              <p>আপনার পূর্ববর্তী সাবমিশন দেখতে অনুগ্রহ করে লগইন করুন।</p>
              <button
                onClick={onOpenAuth}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
              >
                লগইন করুন
              </button>
            </div>
          ) : mySubmissions.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs bg-slate-900/50 rounded-2xl border border-slate-800">
              আপনি এখনো কোনো অফার সাবমিট করেননি। উপরের চলমান অফারগুলো থেকে টাস্ক সম্পন্ন করুন!
            </div>
          ) : (
            <div className="overflow-x-auto no-scrollbar">
              <div className="min-w-[650px] bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                <table className="w-full text-xs text-left text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="p-4">টাস্ক নাম</th>
                      <th className="p-4">সাবমিটেড ইউজারনেম</th>
                      <th className="p-4">রিওয়ার্ড মূল্য</th>
                      <th className="p-4">তারিখ</th>
                      <th className="p-4">অবস্থা (Status)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {mySubmissions.map(sub => (
                      <tr key={sub.id} className="hover:bg-slate-950/40">
                        <td className="p-4 font-bold text-white">{sub.offer_title}</td>
                        <td className="p-4 font-mono text-purple-400">{sub.submitted_username}</td>
                        <td className="p-4 font-black text-amber-400">৳{sub.reward_amount}</td>
                        <td className="p-4 text-[10px] text-slate-400">
                          {new Date(sub.created_at).toLocaleString('bn-BD')}
                        </td>
                        <td className="p-4">
                          {sub.status === 'approved' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-950 text-emerald-400 border border-emerald-800">
                              <CheckCircle2 className="w-3 h-3" /> অনুমোদিত (৳{sub.reward_amount} ওয়ালেটে যুক্ত)
                            </span>
                          ) : sub.status === 'rejected' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-950 text-rose-400 border border-rose-800">
                              <XCircle className="w-3 h-3" /> বাতিল {sub.admin_note && `(${sub.admin_note})`}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-950 text-amber-400 border border-amber-800 animate-pulse">
                              <Clock className="w-3 h-3" /> রিভিউ অপেক্ষমাণ (অ্যাডমিন যাচাই করছে)
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Task Submission Modal */}
      {selectedOffer && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-5 text-slate-100 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <img
                  src={selectedOffer.icon_url || 'https://cdn-icons-png.flaticon.com/512/2111/2111646.png'}
                  alt={selectedOffer.title}
                  className="w-10 h-10 object-contain rounded-xl bg-slate-950 p-1.5 border border-slate-800"
                />
                <div>
                  <h3 className="text-sm font-black text-white">{selectedOffer.title}</h3>
                  <span className="text-xs font-bold text-amber-400">পুরস্কার: ৳{selectedOffer.reward_amount}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedOffer(null)}
                className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Instruction Warning */}
            <div className="p-3 bg-purple-950/40 border border-purple-800/50 rounded-2xl flex items-start gap-2.5 text-xs text-purple-300">
              <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <p>
                আপনার ইউজারনেম এবং পাসওয়ার্ড বা প্রমাণ সাবমিট করুন। অ্যাডমিন তথ্য যাচাই করে অনুমোদন (Approve) করার পর আপনার ওয়ালেটে ৳{selectedOffer.reward_amount} যুক্ত হবে।
              </p>
            </div>

            <form onSubmit={handleSubmitTask} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">আপনার নাম</label>
                  <input
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-purple-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">মোবাইল নম্বর (Wallet Linked)</label>
                  <input
                    type="text"
                    required
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-purple-500 font-mono"
                  />
                </div>
              </div>

              {selectedOffer.requires_username && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">
                    ইউজারনেম / আইডি (যেমন: টেলিগ্রাম @username বা নম্বর) *
                  </label>
                  <input
                    type="text"
                    required
                    value={submittedUsername}
                    onChange={(e) => setSubmittedUsername(e.target.value)}
                    placeholder="@my_telegram_user অথবা 018XXXXXXXX"
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-purple-500 font-mono"
                  />
                </div>
              )}

              {selectedOffer.requires_password && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">
                    পাসওয়ার্ড / ভেরিফিকেশন পিন (Password / Code) *
                  </label>
                  <input
                    type="text"
                    required
                    value={submittedPassword}
                    onChange={(e) => setSubmittedPassword(e.target.value)}
                    placeholder="পাসওয়ার্ড বা লগইন কোড লিখুন"
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-purple-500 font-mono"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">অতিরিক্ত প্রমাণ বা নোট (ঐচ্ছিক)</label>
                <textarea
                  rows={2}
                  value={submittedProof}
                  onChange={(e) => setSubmittedProof(e.target.value)}
                  placeholder="অন্য কোনো তথ্য বা প্রমাণ থাকলে লিখুন..."
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-purple-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedOffer(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black shadow-lg shadow-purple-600/30 cursor-pointer flex items-center gap-1.5 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'সাবমিট হচ্ছে...' : `সাবমিট করুন (৳${selectedOffer.reward_amount})`}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
