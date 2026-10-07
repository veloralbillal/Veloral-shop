import React, { useState } from 'react';
import { User } from '../../types';
import { Users, Phone, Mail, Shield, Wallet, Search, CheckCircle2, AlertCircle, Copy, Edit3, Award } from 'lucide-react';

interface MobileUsersManagerProps {
  users: User[];
  onUpdateUserWallet?: (userId: string, newBalance: number) => void;
  showToast: (msg: string) => void;
}

export const MobileUsersManager: React.FC<MobileUsersManagerProps> = ({
  users,
  onUpdateUserWallet,
  showToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [walletInput, setWalletInput] = useState('');

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      u.name.toLowerCase().includes(q) ||
      u.phone.includes(q) ||
      (u.email && u.email.toLowerCase().includes(q))
    );
  });

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`Copied ${label} to clipboard!`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-500" />
          <span>গ্রাহক একাউন্ট ম্যানেজমেন্ট ({users.length})</span>
        </h2>
        <span className="text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-800 px-2 py-1 rounded-full font-bold">
          📱 Mobile Optimized
        </span>
      </div>

      {/* Advanced Search bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="নাম, মোবাইল নম্বর বা ইমেইল দিয়ে খুঁজুন..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-inner"
        />
      </div>

      {filteredUsers.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl text-xs text-slate-500 space-y-2">
          <AlertCircle className="w-8 h-8 mx-auto text-slate-600" />
          <p className="font-bold text-slate-300">কোনো গ্রাহক একাউন্ট পাওয়া যায়নি।</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredUsers.map((u) => {
            const isAdmin = u.role === 'admin';
            const isEditing = editingUserId === u.id;

            return (
              <div 
                key={u.id}
                className="bg-slate-900 border border-slate-800/90 rounded-3xl p-4 space-y-3 shadow-xl transition-all hover:border-slate-700"
              >
                {/* Header: Name and Role */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-white font-black text-xs shadow-md">
                      {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-white text-sm">{u.name}</h3>
                      <span className="text-[10px] text-slate-500 font-mono">
                        ID: {u.id.slice(0, 10)}...
                      </span>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase ${
                    isAdmin 
                      ? 'bg-blue-950 text-blue-400 border border-blue-800' 
                      : 'bg-slate-950 text-slate-400 border border-slate-800'
                  }`}>
                    {isAdmin ? '🛡️ Admin' : '👤 Customer'}
                  </span>
                </div>

                {/* Contact & Wallet Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-950/60 p-2.5 rounded-2xl border border-slate-800/60 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-300 min-w-0">
                      <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <a href={`tel:${u.phone}`} className="font-mono font-bold hover:underline truncate">{u.phone}</a>
                    </div>
                    <button 
                      onClick={() => handleCopy(u.phone, 'Phone')}
                      className="p-1 text-slate-500 hover:text-white"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="bg-slate-950/60 p-2.5 rounded-2xl border border-slate-800/60 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-300 min-w-0">
                      <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span className="truncate font-mono">{u.email || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Wallet Balance & Action */}
                <div className="flex items-center justify-between bg-purple-950/20 border border-purple-900/30 rounded-2xl p-3">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-purple-400" />
                    <span className="text-xs text-slate-300">ওয়ালেট ব্যালেন্স:</span>
                    <span className="font-black text-amber-400 font-mono text-sm">৳{Number(u.wallet_balance || 0).toLocaleString()}</span>
                  </div>

                  {onUpdateUserWallet && (
                    isEditing ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          placeholder="নতুন ব্যালেন্স"
                          value={walletInput}
                          onChange={(e) => setWalletInput(e.target.value)}
                          className="w-24 bg-slate-950 border border-slate-700 rounded-xl px-2 py-1 text-xs text-white font-mono focus:outline-none"
                        />
                        <button
                          onClick={() => {
                            const val = parseFloat(walletInput);
                            if (!isNaN(val)) {
                              onUpdateUserWallet(u.id, val);
                              showToast('Wallet updated successfully!');
                            }
                            setEditingUserId(null);
                          }}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs"
                        >
                          সেভ
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingUserId(u.id);
                          setWalletInput(String(u.wallet_balance || 0));
                        }}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>ব্যালেন্স এডিট</span>
                      </button>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
