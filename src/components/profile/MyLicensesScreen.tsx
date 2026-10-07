import React, { useState } from 'react';
import { User, Order } from '../../types';
import { ArrowLeft, Key, Copy, Check, ShieldCheck, Zap, AlertCircle, Download, FileText, ExternalLink, Tag, Lock, Clock } from 'lucide-react';
import { SharedHeader } from '../SharedHeader';
import { downloadFile } from '../../utils/download';

interface MyLicensesScreenProps {
  currentUser: User;
  orders: Order[];
  onClose: () => void;
}

export const MyLicensesScreen: React.FC<MyLicensesScreenProps> = ({
  currentUser,
  orders,
  onClose,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Filter orders with digital download or license keys (including completed and direct payments)
  const myLicenses = orders.filter(
    (o) =>
      (o.customer_phone === currentUser.phone || (currentUser.email && o.customer_email === currentUser.email)) &&
      (o.license_key_delivered || o.download_file_url || o.order_type === 'digital')
  );

  const handleCopy = (key: string, idx: number) => {
    navigator.clipboard.writeText(key);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleDownload = (fileUrl: string, fileName?: string, orderId?: string) => {
    if (orderId) {
      setDownloadingId(orderId);
      setTimeout(() => setDownloadingId(null), 2000);
    }
    downloadFile(fileUrl, fileName);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <SharedHeader title="Licenses & Downloads Vault" onBack={onClose} />

      {/* Main Container */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 relative z-10 space-y-6">
        <div className="text-center space-y-1.5">
          <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
            <Download className="w-7 h-7 animate-bounce" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">Digital Files & License Vault</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Directly download your purchased software setup files and access your permanent activation license keys.
          </p>
        </div>

        {myLicenses.length === 0 ? (
          <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl text-xs text-slate-500 space-y-3 shadow-xl">
            <AlertCircle className="w-10 h-10 mx-auto text-amber-500/80 stroke-1" />
            <p className="font-bold text-slate-300 text-sm">No digital products or downloads found.</p>
            <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
              Download files and activation license keys will appear here automatically as soon as your digital order is placed.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {myLicenses.map((o, idx) => {
              const isApproved = o.status === 'completed';
              const hasFile = Boolean(o.download_file_url);
              const hasKey = Boolean(o.license_key_delivered);
              const isDownloading = downloadingId === o.id;

              return (
                <div key={o.id} className="bg-slate-900 border border-slate-800/90 hover:border-slate-700/80 rounded-3xl p-5 space-y-4 shadow-lg transition-all">
                  
                  {/* Card Header */}
                  <div className="flex items-start justify-between border-b border-slate-800/80 pb-3 gap-2 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {o.product_code && (
                          <span className="font-mono text-[10px] font-extrabold text-amber-400 bg-amber-950/80 border border-amber-800/50 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                            <Tag className="w-2.5 h-2.5" />
                            <span>#{o.product_code}</span>
                          </span>
                        )}
                        {isApproved ? (
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-800/40 px-2 py-0.5 rounded-md">
                            ✓ Access Granted (Paid)
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-950/70 border border-amber-800/40 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5 animate-pulse" />
                            <span>⏳ অপেক্ষমাণ (Pending Verification)</span>
                          </span>
                        )}
                      </div>
                      <h3 className="font-extrabold text-slate-100 text-sm sm:text-base leading-snug">
                        {o.items_summary}
                      </h3>
                      <p className="text-[10px] text-slate-500 font-mono">
                        Order: #{o.order_number} · {new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>

                    <div className="w-9 h-9 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-400 border border-blue-500/20 shrink-0">
                      <Zap className="w-4.5 h-4.5" />
                    </div>
                  </div>

                  {!isApproved && (
                    <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs space-y-1">
                      <div className="font-bold text-amber-400 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5" />
                        <span>পেমেন্ট অ্যাপ্রুভাল অপেক্ষমাণ</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        এডমিন TrxID যাচাই করে অর্ডারটি অনুমোদন (Approve) করার পর ডাউনলোড ফাইল ও লাইসেন্স কী সক্রিয় হবে।
                      </p>
                    </div>
                  )}

                  {/* Digital File Download Action (If File Exists) */}
                  {hasFile && (
                    <div className="p-3.5 bg-gradient-to-r from-blue-950/50 to-indigo-950/50 border border-blue-800/40 rounded-2xl space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-white block truncate">
                              {o.file_name || 'Software Setup File'}
                            </span>
                            <span className="text-[10px] text-blue-300/80 block">
                              {isApproved ? 'Ready for direct secure download' : 'লকড — এডমিন অনুমোদনের পর ডাউনলোড সক্রিয় হবে'}
                            </span>
                          </div>
                        </div>

                        {isApproved ? (
                          <button
                            onClick={() => handleDownload(o.download_file_url!, o.file_name, o.id)}
                            className={`px-4 py-2 text-xs font-black rounded-xl cursor-pointer shadow-md transition-all flex items-center gap-1.5 shrink-0 active:scale-95 ${
                              isDownloading
                                ? 'bg-emerald-600 text-white'
                                : 'bg-blue-600 hover:bg-blue-500 text-white hover:shadow-blue-500/20'
                            }`}
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>{isDownloading ? 'Downloading...' : '📥 Download File'}</span>
                          </button>
                        ) : (
                          <button
                            disabled
                            className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-800 text-slate-500 cursor-not-allowed flex items-center gap-1.5 shrink-0"
                          >
                            <Lock className="w-3.5 h-3.5 text-amber-500/60" />
                            <span>লকড</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* License Key Access Box (If Key Exists) */}
                  {isApproved && hasKey && (
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-slate-400 font-bold">
                        <span className="flex items-center gap-1">
                          <Key className="w-3.5 h-3.5 text-amber-400" />
                          <span>License Activation Key:</span>
                        </span>
                        <span className="text-[10px] text-slate-500">Use for product activation</span>
                      </div>
                      <div className="flex items-center justify-between bg-slate-950 p-3 rounded-2xl border border-slate-800 font-mono text-emerald-300 font-bold">
                        <span className="break-all select-all text-xs">{o.license_key_delivered}</span>
                        <button
                          onClick={() => handleCopy(o.license_key_delivered!, idx)}
                          className="ml-3 px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1 font-sans font-bold"
                          title="Copy Key"
                        >
                          {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedIndex === idx ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 text-center text-xs text-slate-600 relative z-10 border-t border-slate-900 bg-slate-950/40">
        <div className="flex items-center justify-center gap-1 text-slate-500 mb-1">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Secure Downloads & Verified License Key Vault</span>
        </div>
        <p>© {new Date().getFullYear()} Veloral Digital & Shop. All rights reserved.</p>
      </footer>
    </div>
  );
};

