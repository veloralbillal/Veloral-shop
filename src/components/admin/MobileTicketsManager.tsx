import React, { useState } from 'react';
import { SupportTicket, TicketMessage } from '../../types';
import {
  MessageCircle,
  Phone,
  Search,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Send,
  Image as ImageIcon,
  X,
  Lock,
  RefreshCw,
  Copy,
  User,
  ShieldCheck,
} from 'lucide-react';

interface MobileTicketsManagerProps {
  tickets: SupportTicket[];
  onUpdateTicketStatus: (ticketId: string, newStatus: 'Open' | 'In Progress' | 'Closed') => void;
  onReplyTicket: (ticketId: string, replyText: string, imageUrl?: string) => void;
  onRefreshTickets: () => void;
  showToast: (msg: string) => void;
}

export const MobileTicketsManager: React.FC<MobileTicketsManagerProps> = ({
  tickets,
  onUpdateTicketStatus,
  onReplyTicket,
  onRefreshTickets,
  showToast,
}) => {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Open' | 'In Progress' | 'Closed'>('all');

  const [replyText, setReplyText] = useState('');
  const [replyImage, setReplyImage] = useState<string | null>(null);

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId);

  const filteredTickets = tickets.filter((t) => {
    const q = searchQuery.trim().toLowerCase();
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    if (!matchStatus) return false;
    if (!q) return true;
    return (
      t.id.toLowerCase().includes(q) ||
      t.user_name.toLowerCase().includes(q) ||
      t.user_phone.includes(q) ||
      t.subject.toLowerCase().includes(q) ||
      t.messages.some((m) => m.message.toLowerCase().includes(q))
    );
  });

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`Copied ${label} to clipboard!`);
  };

  const handleSendReply = () => {
    if (!selectedTicket) return;
    if (!replyText.trim() && !replyImage) return;

    onReplyTicket(selectedTicket.id, replyText.trim(), replyImage || undefined);
    setReplyText('');
    setReplyImage(null);
    showToast('রিপ্লাই সফলভাবে পাঠানো হয়েছে!');
  };

  const handleToggleStatus = (ticket: SupportTicket) => {
    const newStatus = ticket.status === 'Closed' ? 'In Progress' : 'Closed';
    onUpdateTicketStatus(ticket.id, newStatus);
    showToast(`টিকেট স্ট্যাটাস: ${newStatus}`);
  };

  // If a ticket is currently open for detailed chat view
  if (selectedTicket) {
    const isClosed = selectedTicket.status === 'Closed';

    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex flex-col h-[75vh] max-h-[700px] shadow-2xl animate-in fade-in duration-200">
        {/* Chat Header */}
        <div className="p-3 sm:p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={() => setSelectedTicketId(null)}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all cursor-pointer shrink-0"
              title="তালিকায় ফিরুন"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-mono text-[10px] font-black text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded-lg border border-blue-900">
                  #{selectedTicket.id}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                    selectedTicket.status === 'Open'
                      ? 'bg-amber-950 text-amber-400 border border-amber-800'
                      : selectedTicket.status === 'In Progress'
                      ? 'bg-blue-950 text-blue-400 border border-blue-800'
                      : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  }`}
                >
                  {selectedTicket.status}
                </span>
              </div>
              <h3 className="font-bold text-white text-xs sm:text-sm truncate mt-0.5" title={selectedTicket.subject}>
                {selectedTicket.subject}
              </h3>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <a
              href={`tel:${selectedTicket.user_phone}`}
              className="p-2 bg-blue-950 hover:bg-blue-900 text-blue-400 border border-blue-800 rounded-xl cursor-pointer"
              title="কল করুন"
            >
              <Phone className="w-4 h-4" />
            </a>
            <button
              onClick={() => handleToggleStatus(selectedTicket)}
              className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                isClosed
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800'
              }`}
            >
              {isClosed ? <RefreshCw className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
              <span>{isClosed ? 'রিওপেন' : 'ক্লোজ'}</span>
            </button>
          </div>
        </div>

        {/* Customer Info Sub-bar */}
        <div className="bg-slate-950/50 px-4 py-2 border-b border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 truncate">
            <User className="w-3 h-3 text-slate-500 shrink-0" />
            <span className="font-bold text-slate-200 truncate">{selectedTicket.user_name}</span>
          </div>
          <div className="flex items-center gap-1 font-mono shrink-0">
            <span>{selectedTicket.user_phone}</span>
            <button
              onClick={() => handleCopy(selectedTicket.user_phone, 'Phone')}
              className="p-1 hover:text-white"
            >
              <Copy className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 no-scrollbar bg-slate-950/20">
          {selectedTicket.messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2 py-10">
              <MessageCircle className="w-10 h-10 opacity-20" />
              <p className="text-xs italic">কোনো বার্তা পাওয়া যায়নি।</p>
            </div>
          ) : (
            selectedTicket.messages.map((msg) => {
              const isAdmin = msg.sender === 'admin';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'} animate-in fade-in duration-200`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mb-1 px-1">
                    <span className={`font-bold ${isAdmin ? 'text-blue-400' : 'text-slate-300'}`}>
                      {isAdmin ? '🛡️ Veloral Support (Admin)' : msg.sender_name}
                    </span>
                    <span>•</span>
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div
                    className={`p-3.5 rounded-2xl max-w-[88%] text-xs leading-relaxed shadow-md ${
                      isAdmin
                        ? 'bg-blue-600 text-white rounded-tr-xs'
                        : 'bg-slate-800 text-slate-100 border border-slate-700 rounded-tl-xs'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.message}</p>
                    {msg.image_url && (
                      <div className="mt-2.5 rounded-xl overflow-hidden border border-white/20 max-w-full">
                        <img
                          src={msg.image_url}
                          alt="Attachment"
                          className="w-full h-auto object-contain bg-slate-900/50 cursor-zoom-in max-h-56"
                          onClick={() => window.open(msg.image_url!, '_blank')}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Reply Input Bar */}
        <div className="p-3 bg-slate-950/90 border-t border-slate-800 shrink-0">
          {isClosed ? (
            <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-2xl flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-rose-300 font-bold">
                <Lock className="w-3.5 h-3.5" />
                <span>টিকেটটি বন্ধ রয়েছে।</span>
              </div>
              <button
                onClick={() => handleToggleStatus(selectedTicket)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-all"
              >
                রিওপেন করুন
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {replyImage && (
                <div className="flex items-center gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-xl w-fit">
                  <img src={replyImage} alt="Attachment" className="w-10 h-10 object-cover rounded-lg" />
                  <button
                    onClick={() => setReplyImage(null)}
                    className="w-5 h-5 bg-rose-600 text-white rounded-full flex items-center justify-center text-xs hover:bg-rose-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              <div className="flex items-end gap-2">
                <div className="flex-1 relative">
                  <textarea
                    rows={1}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="সাপোর্ট উত্তর লিখুন..."
                    className="w-full pl-3.5 pr-10 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-white outline-none focus:border-blue-500 text-xs resize-none max-h-24"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendReply();
                      }
                    }}
                  />
                  <label
                    className="absolute right-2.5 bottom-2.5 p-1.5 text-slate-400 hover:text-blue-400 cursor-pointer transition-colors"
                    title="ছবি যুক্ত করুন"
                  >
                    <ImageIcon className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > 5 * 1024 * 1024) {
                          alert('ফাইল সাইজ ৫ MB এর কম হতে হবে!');
                          return;
                        }
                        const reader = new FileReader();
                        reader.onload = () => setReplyImage(reader.result as string);
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                </div>

                <button
                  onClick={handleSendReply}
                  disabled={!replyText.trim() && !replyImage}
                  className="h-11 w-11 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl flex items-center justify-center cursor-pointer shadow-lg shadow-blue-600/30 transition-all shrink-0 active:scale-95"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Tickets List View
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-blue-500 animate-pulse" />
          <span>কাস্টমার সাপোর্ট টিকিটস ({tickets.length})</span>
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-blue-950 text-blue-300 border border-blue-800 px-2 py-1 rounded-full font-bold">
            📱 Mobile Optimized
          </span>
          <button
            onClick={onRefreshTickets}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all cursor-pointer"
            title="রিফ্রেশ করুন"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 text-center">
          <span className="text-[10px] text-slate-400 block font-bold">মোট টিকিট</span>
          <span className="text-base font-black text-white">{tickets.length}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 text-center">
          <span className="text-[10px] text-amber-400 block font-bold">অপেক্ষমাণ</span>
          <span className="text-base font-black text-amber-400">
            {tickets.filter((t) => t.status === 'Open' || t.status === 'In Progress').length}
          </span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 text-center">
          <span className="text-[10px] text-emerald-400 block font-bold">সমাধানকৃত</span>
          <span className="text-base font-black text-emerald-400">
            {tickets.filter((t) => t.status === 'Closed').length}
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="টিকিট আইডি, গ্রাহকের নাম, মোবাইল বা বিষয়..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-inner"
          />
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: 'all', label: 'সকল টিকিট' },
            { id: 'Open', label: '⏳ ওপেন (Open)' },
            { id: 'In Progress', label: '💬 চলছে (In Progress)' },
            { id: 'Closed', label: '✓ সম্পন্ন (Closed)' },
          ].map((chip) => {
            const isActive = statusFilter === chip.id;
            return (
              <button
                key={chip.id}
                onClick={() => setStatusFilter(chip.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tickets List */}
      {filteredTickets.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl text-xs text-slate-500 space-y-2">
          <AlertCircle className="w-8 h-8 mx-auto text-slate-600" />
          <p className="font-bold text-slate-300">কোনো সাপোর্ট টিকিট পাওয়া যায়নি।</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTickets.map((t) => {
            const isClosed = t.status === 'Closed';
            const isInProgress = t.status === 'In Progress';
            const lastMsg = t.messages[t.messages.length - 1];

            return (
              <div
                key={t.id}
                className={`bg-slate-900 border rounded-3xl p-4 space-y-3 shadow-xl transition-all ${
                  t.status === 'Open'
                    ? 'border-amber-500/40 bg-gradient-to-b from-slate-900 to-amber-950/10'
                    : isInProgress
                    ? 'border-blue-500/40 bg-gradient-to-b from-slate-900 to-blue-950/10'
                    : 'border-slate-800 opacity-80'
                }`}
              >
                {/* Header: ID, Status, Date */}
                <div className="flex items-start justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-black text-white text-xs sm:text-sm">#{t.id}</span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${
                          t.status === 'Open'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800 animate-pulse'
                            : isInProgress
                            ? 'bg-blue-950 text-blue-400 border border-blue-800'
                            : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      {new Date(t.created_at).toLocaleString('bn-BD', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <span className="text-[10px] text-slate-400 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800 font-bold shrink-0">
                    💬 {t.messages.length} মেসেজ
                  </span>
                </div>

                {/* Subject & User */}
                <div className="space-y-1">
                  <h4 className="font-extrabold text-white text-xs sm:text-sm line-clamp-1">{t.subject}</h4>
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                    <span className="font-medium text-slate-300">{t.user_name}</span>
                    <a
                      href={`tel:${t.user_phone}`}
                      className="font-mono text-blue-400 hover:underline flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{t.user_phone}</span>
                    </a>
                  </div>
                </div>

                {/* Last message preview */}
                {lastMsg && (
                  <div className="bg-slate-950/60 p-2.5 rounded-2xl border border-slate-800/60 text-xs text-slate-400 line-clamp-2">
                    <span className="font-bold text-slate-300 mr-1">
                      {lastMsg.sender === 'admin' ? 'Support:' : `${t.user_name}:`}
                    </span>
                    {lastMsg.message || '[ছবি সংযুক্ত]'}
                  </div>
                )}

                {/* Action button */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => handleToggleStatus(t)}
                    className="text-[11px] font-bold text-slate-400 hover:text-white cursor-pointer"
                  >
                    {isClosed ? '↺ রিওপেন করুন' : '✓ ক্লোজ করুন'}
                  </button>

                  <button
                    onClick={() => setSelectedTicketId(t.id)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-2xl shadow-lg shadow-blue-600/30 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>চ্যাট ও রিপ্লাই</span>
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
