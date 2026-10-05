import React, { useState, useEffect } from 'react';
import { StoreSettings, SupportTicket, TicketMessage, User } from '../../types';
import { fetchTickets, saveTickets } from '../../services/db';
import { ArrowLeft, MessageCircle, Phone, Clock, Mail, CheckCircle2, ChevronDown, HelpCircle, ShieldCheck, Send, Paperclip, X, Image as ImageIcon, Lock, Unlock, AlertCircle, ArrowRight } from 'lucide-react';
import { SharedHeader } from '../SharedHeader';

interface SupportScreenProps {
  settings: StoreSettings;
  currentUser: User | null;
  onClose: () => void;
}

export const SupportScreen: React.FC<SupportScreenProps> = ({
  settings,
  currentUser,
  onClose,
}) => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [ticketSuccess, setTicketSuccess] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // New ticket image attachment
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  // Reply message & image
  const [replyText, setReplyText] = useState('');
  const [replyImage, setReplyImage] = useState<string | null>(null);
  const [replyImageError, setReplyImageError] = useState<string | null>(null);

  useEffect(() => {
    const loaded = fetchTickets();
    setTickets(loaded);
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>, isReply: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check 2MB limit (2 * 1024 * 1024 bytes)
    if (file.size > 2 * 1024 * 1024) {
      if (isReply) {
        setReplyImageError('File size cannot exceed 2 MB. Please select a smaller image.');
      } else {
        setImageError('File size cannot exceed 2 MB. Please select a smaller image.');
      }
      return;
    }

    if (isReply) {
      setReplyImageError(null);
    } else {
      setImageError(null);
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (isReply) {
        setReplyImage(reader.result as string);
      } else {
        setSelectedImage(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) return;

    // Generate ticket number starting around 37373
    const existingTickets = fetchTickets();
    const nextId = existingTickets.length > 0 ? (parseInt(existingTickets[existingTickets.length - 1].id) + 1).toString() : '37373';

    const newTicket: SupportTicket = {
      id: nextId,
      user_id: currentUser?.id || 'u_guest',
      user_name: currentUser?.name || 'Customer',
      user_phone: currentUser?.phone || '01800000000',
      subject,
      status: 'Open',
      created_at: new Date().toISOString(),
      messages: [
        {
          id: 'm_' + Date.now(),
          sender: 'user',
          sender_name: currentUser?.name || 'Customer',
          message,
          image_url: selectedImage || undefined,
          timestamp: new Date().toISOString()
        }
      ]
    };

    const updated = [newTicket, ...existingTickets];
    saveTickets(updated);
    setTickets(updated);

    setSubject('');
    setMessage('');
    setSelectedImage(null);
    setImageError(null);
    setTicketSuccess(true);

    // Open the newly created ticket view automatically
    setTimeout(() => {
      setTicketSuccess(false);
      setActiveTicketId(newTicket.id);
    }, 1000);
  };

  const handleSendReply = (ticketId: string) => {
    if (!replyText.trim() && !replyImage) return;

    const allTickets = fetchTickets();
    const updated = allTickets.map(t => {
      if (t.id === ticketId) {
        if (t.status === 'Closed') return t;
        const newMsg: TicketMessage = {
          id: 'm_' + Date.now(),
          sender: 'user',
          sender_name: currentUser?.name || 'Customer',
          message: replyText,
          image_url: replyImage || undefined,
          timestamp: new Date().toISOString()
        };
        return {
          ...t,
          status: 'In Progress' as const,
          messages: [...t.messages, newMsg]
        };
      }
      return t;
    });

    saveTickets(updated);
    setTickets(updated);
    setReplyText('');
    setReplyImage(null);
    setReplyImageError(null);
  };

  const activeTicket = tickets.find(t => t.id === activeTicketId);

  const faqs = [
    {
      q: 'How long after payment will I receive digital delivery?',
      a: 'Digital license keys are usually verified and automatically delivered within 5-10 minutes. Game top-ups and manual services are fulfilled within 15-30 minutes.'
    },
    {
      q: 'What should I do if my payment transaction ID does not match?',
      a: 'If your transaction ID does not match automatically, please reach out via our WhatsApp helpline or submit a ticket with your payment screenshot for instant review and approval.'
    },
    {
      q: 'Will my purchased license key remain permanently active?',
      a: 'Yes! All our software license keys are 100% genuine retail or OEM licenses with lifetime validity unless specified as a timed subscription in the product description.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <SharedHeader 
        title="Customer Support & Help Desk" 
        onBack={() => {
          if (activeTicketId) {
            setActiveTicketId(null);
          } else {
            onClose();
          }
        }} 
      />

      {/* Content */}
      <main className="flex-1 max-w-xl mx-auto w-full px-4 py-6 relative z-10 space-y-6">
        
        {/* If viewing a specific active ticket chat detail page */}
        {activeTicket ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-xl bg-blue-600/20 text-blue-400 font-mono text-xs font-black shadow-inner">
                    Ticket #{activeTicket.id}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold ${
                    activeTicket.status === 'Open' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                    activeTicket.status === 'In Progress' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    {activeTicket.status}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mt-1.5">{activeTicket.subject}</h3>
              </div>
              <button
                onClick={() => setActiveTicketId(null)}
                className="text-xs text-slate-400 hover:text-white px-3 py-1.5 bg-slate-800 rounded-xl cursor-pointer"
              >
                Back to List
              </button>
            </div>

            {/* Chat Messages */}
            <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
              {activeTicket.messages.map((msg) => {
                const isAdmin = msg.sender === 'admin';
                return (
                  <div key={msg.id} className={`flex flex-col ${isAdmin ? 'items-start' : 'items-end'}`}>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1 px-1">
                      <span className={`font-bold ${isAdmin ? 'text-emerald-400' : 'text-slate-300'}`}>{msg.sender_name}</span>
                      <span>•</span>
                      <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className={`p-3.5 rounded-2xl max-w-[85%] text-xs space-y-2 ${
                      isAdmin ? 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-xs' : 'bg-blue-600 text-white rounded-tr-xs shadow-md'
                    }`}>
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                      {msg.image_url && (
                        <div className="mt-2 rounded-xl overflow-hidden border border-white/25 max-w-xs shadow-md">
                          <img src={msg.image_url} alt="Attachment" className="w-full h-auto object-cover max-h-48" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reply Input Box */}
            {activeTicket.status === 'Closed' ? (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-2xl text-xs text-center font-bold">
                🔒 This ticket is closed. For additional questions, please open a new support ticket.
              </div>
            ) : (
              <div className="space-y-3 pt-2 border-t border-slate-800">
                {replyImageError && (
                  <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-[11px] flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{replyImageError}</span>
                  </div>
                )}

                {replyImage && (
                  <div className="relative inline-block">
                    <img src={replyImage} alt="Preview" className="w-20 h-20 object-cover rounded-xl border border-slate-700" />
                    <button
                      onClick={() => setReplyImage(null)}
                      className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-rose-600 text-white rounded-full flex items-center justify-center text-xs shadow cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <textarea
                    rows={2}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply here..."
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 text-xs resize-none"
                  />
                  <div className="flex flex-col gap-2 shrink-0">
                    <label className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl cursor-pointer transition-colors" title="Attach image (max 2 MB)">
                      <ImageIcon className="w-4 h-4" />
                      <input type="file" accept="image/*" onChange={(e) => handleImageSelect(e, true)} className="hidden" />
                    </label>
                    <button
                      onClick={() => handleSendReply(activeTicket.id)}
                      className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl cursor-pointer transition-colors shadow-md"
                      title="Send Reply"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 text-right">Maximum file size: 2 MB</p>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-blue-600/10 text-blue-400 border border-blue-500/20 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/5">
                <MessageCircle className="w-6 h-6 text-emerald-400 animate-pulse" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">Live Customer Support & Tickets</h2>
              <p className="text-xs text-slate-400">Contact us anytime for order questions, digital keys, or payment assistance.</p>
            </div>

            {/* Quick Contacts */}
            <div className="grid grid-cols-2 gap-3">
              <a
                href={`https://wa.me/${settings.whatsapp_number.replace(/\D/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="p-4 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 rounded-2xl text-center space-y-1 transition-all"
              >
                <MessageCircle className="w-6 h-6 mx-auto" />
                <span className="font-bold text-xs block">WhatsApp Live</span>
                <span className="text-[10px] text-slate-400 block font-mono">{settings.whatsapp_number}</span>
              </a>

              <a
                href={`tel:${settings.help_phone}`}
                className="p-4 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 rounded-2xl text-center space-y-1 transition-all"
              >
                <Phone className="w-6 h-6 mx-auto" />
                <span className="font-bold text-xs block">Helpline Call</span>
                <span className="text-[10px] text-slate-400 block font-mono">{settings.help_phone}</span>
              </a>
            </div>

            {/* My Submitted Tickets List */}
            {tickets.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl space-y-3">
                <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-3.5 bg-blue-500 rounded-xs" />
                  <span>My Support Tickets ({tickets.length})</span>
                </h3>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {tickets.map(t => (
                    <div
                      key={t.id}
                      onClick={() => setActiveTicketId(t.id)}
                      className="p-3 bg-slate-950 hover:bg-slate-855 border border-slate-800 rounded-2xl cursor-pointer transition-all flex items-center justify-between text-xs group"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-blue-400 bg-blue-600/10 px-2 py-0.5 rounded-lg">#{t.id}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            t.status === 'Open' ? 'bg-amber-500/10 text-amber-400' :
                            t.status === 'In Progress' ? 'bg-blue-500/10 text-blue-400' : 'bg-rose-500/10 text-rose-400'
                          }`}>
                            {t.status}
                          </span>
                        </div>
                        <p className="font-bold text-slate-200 truncate max-w-[220px]">{t.subject}</p>
                      </div>
                      <span className="text-[11px] text-blue-400 group-hover:translate-x-1 transition-transform font-extrabold px-2.5 py-1 bg-blue-600/10 rounded-xl flex items-center gap-1">
                        <span>View Chat</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Support Ticket Submission Form */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
              <h3 className="text-sm font-black text-white">Open Support Ticket</h3>
              
              <form onSubmit={handleSubmitTicket} className="space-y-3.5 text-xs">
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-bold">Issue Subject *</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Payment verification issue, license key error"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-bold">Message / Description *</label>
                  <textarea
                    rows={3}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your issue with order number and relevant details..."
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500"
                  />
                </div>

                {imageError && (
                  <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-[11px] flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{imageError}</span>
                  </div>
                )}

                {selectedImage && (
                  <div className="relative inline-block">
                    <img src={selectedImage} alt="Preview" className="w-20 h-20 object-cover rounded-xl border border-slate-700" />
                    <button
                      type="button"
                      onClick={() => setSelectedImage(null)}
                      className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-rose-600 text-white rounded-full flex items-center justify-center text-xs shadow cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <label className="px-3 py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl cursor-pointer text-xs flex items-center gap-1.5 transition-colors">
                    <Paperclip className="w-4 h-4 text-blue-400" />
                    <span>Attach Image (Max 2 MB)</span>
                    <input type="file" accept="image/*" onChange={(e) => handleImageSelect(e, false)} className="hidden" />
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-xl transition-all shadow-md cursor-pointer"
                >
                  Submit Ticket
                </button>
              </form>

              {ticketSuccess && (
                <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl text-xs flex items-center justify-center gap-2 animate-pulse">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Ticket submitted successfully! Redirecting to chat...</span>
                </div>
              )}
            </div>

            {/* Accordion FAQ Section */}
            <div className="space-y-2.5">
              <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-blue-400" />
                <span>Frequently Asked Questions (FAQ)</span>
              </h3>

              <div className="space-y-2">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden text-xs">
                    <button
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      className="w-full px-4 py-3 flex items-center justify-between font-bold text-slate-200 text-left hover:bg-slate-850 transition-colors"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                    </button>
                    {openFaq === idx && (
                      <div className="px-4 pb-4.5 pt-1 text-slate-400 leading-relaxed border-t border-slate-800/40">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 text-center text-xs text-slate-600 relative z-10 border-t border-slate-900 bg-slate-950/40">
        <div className="flex items-center justify-center gap-1 text-slate-500 mb-1">
          <Clock className="w-4 h-4 text-blue-400" />
          <span>Our live support is active daily from 9:00 AM to 12:00 AM (Midnight)</span>
        </div>
        <p>© {new Date().getFullYear()} Veloral Digital & Shop. All rights reserved.</p>
      </footer>
    </div>
  );
};
