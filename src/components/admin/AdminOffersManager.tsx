import React, { useState } from 'react';
import { OfferItem, OfferSubmission } from '../../types';
import { approveOfferSubmission, rejectOfferSubmission } from '../../services/db';
import { 
  Gift, Plus, CheckCircle2, XCircle, Clock, Trash2, Edit, 
  Save, X, Shield, Wallet, Send, User as UserIcon, Lock, Sparkles
} from 'lucide-react';

interface AdminOffersManagerProps {
  offers: OfferItem[];
  submissions: OfferSubmission[];
  onSaveOffers: (offers: OfferItem[]) => void;
  onRefreshData: () => void;
  showToast: (msg: string) => void;
}

export const AdminOffersManager: React.FC<AdminOffersManagerProps> = ({
  offers,
  submissions,
  onSaveOffers,
  onRefreshData,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<'submissions' | 'offers_list'>('submissions');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  // New / Edit offer modal state
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<OfferItem | null>(null);
  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState('telegram');
  const [rewardAmount, setRewardAmount] = useState<number>(10);
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [iconUrl, setIconUrl] = useState('');
  const [requiresUsername, setRequiresUsername] = useState(true);
  const [requiresPassword, setRequiresPassword] = useState(true);

  // Reject note modal
  const [rejectingSubId, setRejectingSubId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState('');

  const openAddOfferModal = () => {
    setEditingOffer(null);
    setTitle('');
    setPlatform('telegram');
    setRewardAmount(10);
    setDescription('');
    setInstructions('১. আপনার সঠিক ইউজারনেম দিন।\n২. লগইন পাসওয়ার্ড বা ভেরিফিকেশন কোড দিন।');
    setIconUrl('https://cdn-icons-png.flaticon.com/512/2111/2111646.png');
    setRequiresUsername(true);
    setRequiresPassword(true);
    setIsOfferModalOpen(true);
  };

  const openEditOfferModal = (offer: OfferItem) => {
    setEditingOffer(offer);
    setTitle(offer.title);
    setPlatform(offer.platform);
    setRewardAmount(offer.reward_amount);
    setDescription(offer.description);
    setInstructions(offer.instructions || '');
    setIconUrl(offer.icon_url || '');
    setRequiresUsername(offer.requires_username ?? true);
    setRequiresPassword(offer.requires_password ?? true);
    setIsOfferModalOpen(true);
  };

  const handleSaveOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !rewardAmount) {
      showToast('শিরোনাম ও রিওয়ার্ড মূল্য দেওয়া আবশ্যক।');
      return;
    }

    const newOffer: OfferItem = {
      id: editingOffer ? editingOffer.id : 'off_' + Date.now(),
      title,
      platform,
      reward_amount: Number(rewardAmount),
      description,
      instructions,
      icon_url: iconUrl || 'https://cdn-icons-png.flaticon.com/512/2111/2111646.png',
      active: true,
      requires_username: requiresUsername,
      requires_password: requiresPassword,
    };

    let updated: OfferItem[];
    if (editingOffer) {
      updated = offers.map(o => o.id === editingOffer.id ? newOffer : o);
      showToast('অফার সফলভাবে আপডেট করা হয়েছে!');
    } else {
      updated = [newOffer, ...offers];
      showToast('নতুন অফার সফলভাবে যুক্ত করা হয়েছে!');
    }

    onSaveOffers(updated);
    setIsOfferModalOpen(false);
  };

  const handleDeleteOffer = (id: string) => {
    if (window.confirm('আপনি কি এই অফারটি মুছে ফেলতে চান?')) {
      const updated = offers.filter(o => o.id !== id);
      onSaveOffers(updated);
      showToast('অফার মুছে ফেলা হয়েছে।');
    }
  };

  const handleApproveSubmission = (sub: OfferSubmission) => {
    if (window.confirm(`আপনি কি নিশ্চিত? সাবমিশনটি অ্যাপ্রুভ করলে ইউজারের ওয়ালেটে ৳${sub.reward_amount} সরাসরি যোগ হয়ে যাবে।`)) {
      const res = approveOfferSubmission(sub.id);
      if (res.success) {
        showToast(`✓ সফল! ইউজারের ওয়ালেটে ৳${sub.reward_amount} যুক্ত হয়েছে।`);
        onRefreshData();
      } else {
        showToast(res.message);
      }
    }
  };

  const handleConfirmReject = () => {
    if (!rejectingSubId) return;
    rejectOfferSubmission(rejectingSubId, rejectNote.trim() || 'Invalid details provided');
    showToast('সাবমিশনটি বাতিল করা হয়েছে।');
    setRejectingSubId(null);
    setRejectNote('');
    onRefreshData();
  };

  const filteredSubmissions = submissions.filter(s => {
    if (statusFilter === 'all') return true;
    return s.status === statusFilter;
  });

  const pendingCount = submissions.filter(s => s.status === 'pending').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-3xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-white">টাস্ক & অফার ম্যানেজমেন্ট (Micro Offers)</h2>
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
                {pendingCount} অপেক্ষমাণ
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">টেলিগ্রাম, হোয়াটসঅ্যাপ অফার তৈরি করুন এবং ইউজারের সাবমিট করা পাসওয়ার্ড/ইউজারনেম যাচাই করে ওয়ালেটে টাকা অ্যাপ্রুভ করুন।</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openAddOfferModal}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-purple-600/30 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন অফার যোগ করুন</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('submissions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'submissions'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>ইউজার সাবমিশন রিভিউ ({submissions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('offers_list')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'offers_list'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Gift className="w-3.5 h-3.5" />
            <span>অফার তালিকা ({offers.length})</span>
          </button>
        </div>

        {activeTab === 'submissions' && (
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {(['pending', 'approved', 'rejected', 'all'] as const).map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st === 'pending' ? 'অপেক্ষমাণ' : st === 'approved' ? 'অনুমোদিত' : st === 'rejected' ? 'বাতিল' : 'সবগুলো'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Submissions List */}
      {activeTab === 'submissions' && (
        <div className="space-y-4">
          {filteredSubmissions.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs bg-slate-900/50 rounded-2xl border border-slate-800">
              কোনো সাবমিশন পাওয়া যায়নি।
            </div>
          ) : (
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-xs text-left text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-3">অফার & গ্রাহক</th>
                    <th className="p-3">সাবমিটেড ইউজারনেম</th>
                    <th className="p-3">পাসওয়ার্ড / কোড</th>
                    <th className="p-3">রিওয়ার্ড</th>
                    <th className="p-3">তারিখ</th>
                    <th className="p-3">অবস্থা</th>
                    <th className="p-3 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredSubmissions.map(sub => (
                    <tr key={sub.id} className="hover:bg-slate-950/40">
                      <td className="p-3">
                        <span className="font-bold text-white block">{sub.offer_title}</span>
                        <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                          <UserIcon className="w-3 h-3 text-purple-400" />
                          <span>{sub.user_name} ({sub.user_phone})</span>
                        </span>
                      </td>

                      <td className="p-3">
                        <span className="font-mono text-purple-400 font-bold bg-purple-950/60 border border-purple-800/60 px-2 py-0.5 rounded">
                          {sub.submitted_username}
                        </span>
                      </td>

                      <td className="p-3">
                        {sub.submitted_password ? (
                          <div className="font-mono text-emerald-400 bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-lg w-max flex items-center gap-1.5 select-all">
                            <Lock className="w-3 h-3 text-slate-500" />
                            <span>{sub.submitted_password}</span>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[10px]">N/A</span>
                        )}
                        {sub.submitted_proof && (
                          <p className="text-[10px] text-slate-400 mt-1 max-w-xs">{sub.submitted_proof}</p>
                        )}
                      </td>

                      <td className="p-3 font-black text-amber-400 text-sm">৳{sub.reward_amount}</td>

                      <td className="p-3 text-[10px] text-slate-400">
                        {new Date(sub.created_at).toLocaleString('bn-BD')}
                      </td>

                      <td className="p-3">
                        {sub.status === 'approved' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-950 text-emerald-400 border border-emerald-800">
                            অনুমোদিত
                          </span>
                        ) : sub.status === 'rejected' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-950 text-rose-400 border border-rose-800">
                            বাতিল
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-950 text-amber-400 border border-amber-800 animate-pulse">
                            রিভিউ অপেক্ষমাণ
                          </span>
                        )}
                      </td>

                      <td className="p-3 text-right">
                        {sub.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleApproveSubmission(sub)}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer shadow-md"
                              title="অ্যাপ্রুভ করুন ও ওয়ালেটে টাকা দিন"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>অ্যাপ্রুভ (৳{sub.reward_amount})</span>
                            </button>
                            <button
                              onClick={() => {
                                setRejectingSubId(sub.id);
                                setRejectNote('');
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 font-bold text-[10px] flex items-center gap-1 cursor-pointer border border-rose-800/80"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>বাতিল</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-500">সম্পন্ন</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Offers List */}
      {activeTab === 'offers_list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {offers.map(offer => (
            <div key={offer.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-4">
              <div className="flex items-start gap-3">
                <img
                  src={offer.icon_url || 'https://cdn-icons-png.flaticon.com/512/2111/2111646.png'}
                  alt={offer.title}
                  className="w-12 h-12 object-contain rounded-xl bg-slate-950 p-1.5 border border-slate-800 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      {offer.platform}
                    </span>
                    <span className="text-xs font-black text-amber-400">পুরস্কার: ৳{offer.reward_amount}</span>
                  </div>
                  <h4 className="font-bold text-white text-xs truncate mt-1">{offer.title}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{offer.description}</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => openEditOfferModal(offer)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5 text-purple-400" />
                  <span>এডিট</span>
                </button>
                <button
                  onClick={() => handleDeleteOffer(offer.id)}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold flex items-center gap-1 cursor-pointer border border-rose-500/20"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>ডিলিট</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Offer Modal */}
      {isOfferModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-5 text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-black text-white">
                {editingOffer ? 'অফার এডিট করুন' : 'নতুন মাইক্রো অফার যোগ করুন'}
              </h3>
              <button onClick={() => setIsOfferModalOpen(false)} className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveOffer} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">অফারের শিরোনাম</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="যেমন: Telegram Account Submit Task (১০ টাকা বোনাস)"
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">প্ল্যাটফর্ম</label>
                  <select
                    value={platform}
                    onChange={(e) => {
                      setPlatform(e.target.value);
                      if (e.target.value === 'telegram') setIconUrl('https://cdn-icons-png.flaticon.com/512/2111/2111646.png');
                      if (e.target.value === 'whatsapp') setIconUrl('https://cdn-icons-png.flaticon.com/512/733/733585.png');
                      if (e.target.value === 'facebook') setIconUrl('https://cdn-icons-png.flaticon.com/512/733/733547.png');
                      if (e.target.value === 'gmail') setIconUrl('https://cdn-icons-png.flaticon.com/512/281/281764.png');
                    }}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-purple-500 cursor-pointer"
                  >
                    <option value="telegram">Telegram</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="facebook">Facebook</option>
                    <option value="gmail">Gmail</option>
                    <option value="youtube">YouTube</option>
                    <option value="custom">অন্যান্য</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">রিওয়ার্ড অ্যামাউন্ট (৳ BDT)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={rewardAmount}
                    onChange={(e) => setRewardAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-purple-500 font-mono font-bold text-amber-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">আইকন লিংক (Icon URL)</label>
                <input
                  type="text"
                  value={iconUrl}
                  onChange={(e) => setIconUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-300">
                  <input
                    type="checkbox"
                    checked={requiresUsername}
                    onChange={(e) => setRequiresUsername(e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600 accent-purple-600"
                  />
                  <span>ইউজারনেম প্রয়োজন</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-300">
                  <input
                    type="checkbox"
                    checked={requiresPassword}
                    onChange={(e) => setRequiresPassword(e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600 accent-purple-600"
                  />
                  <span>পাসওয়ার্ড প্রয়োজন</span>
                </label>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">সংক্ষিপ্ত বিবরণ</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="অফারের বিবরণ..."
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">টাস্ক নির্দেশাবলী (Instructions)</label>
                <textarea
                  rows={3}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="১. কীভাবে সাবমিট করবে...\n২. কী পাসওয়ার্ড বা পিন দিতে হবে..."
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-purple-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOfferModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>সংরক্ষণ করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectingSubId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-slate-100">
            <h4 className="text-sm font-black text-white">টাস্ক বাতিলের কারণ লিখুন</h4>
            <textarea
              rows={3}
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="যেমন: ভুল ইউজারনেম বা পাসওয়ার্ড দেওয়া হয়েছে..."
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-rose-500"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRejectingSubId(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold cursor-pointer"
              >
                বাতিল
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
              >
                নিশ্চিত করুন
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
