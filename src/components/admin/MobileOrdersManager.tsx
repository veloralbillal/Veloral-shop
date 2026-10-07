import React, { useState } from 'react';
import { Order } from '../../types';
import { Package, Phone, User, Clock, CheckCircle2, XCircle, ShieldCheck, Zap, Download, ExternalLink, Copy, Check, AlertCircle, Search, Filter } from 'lucide-react';

interface MobileOrdersManagerProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: Order['status'], licenseKey?: string) => Promise<any>;
  onRechargeAPI?: (order: Order) => void;
  isRechargingId?: string | null;
  showToast: (msg: string) => void;
}

export const MobileOrdersManager: React.FC<MobileOrdersManagerProps> = ({
  orders,
  onUpdateOrderStatus,
  onRechargeAPI,
  isRechargingId,
  showToast,
}) => {
  const [deliveringOrderId, setDeliveringOrderId] = useState<string | null>(null);
  const [licenseKeyInput, setLicenseKeyInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'cancelled'>('all');

  const filteredOrders = orders.filter((o) => {
    const q = searchQuery.trim().toLowerCase();
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    if (!q) return matchStatus;
    const matchQuery =
      o.order_number.toLowerCase().includes(q) ||
      o.customer_phone.includes(q) ||
      o.customer_name.toLowerCase().includes(q) ||
      (o.trx_id && o.trx_id.toLowerCase().includes(q)) ||
      (o.items_summary && o.items_summary.toLowerCase().includes(q));
    return matchQuery && matchStatus;
  });

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`Copied ${label} to clipboard!`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
          <Package className="w-5 h-5 text-blue-500" />
          <span>রেগুলার অর্ডার ম্যানেজমেন্ট ({filteredOrders.length}/{orders.length})</span>
        </h2>
        <span className="text-[10px] bg-blue-950 text-blue-300 border border-blue-800 px-2 py-1 rounded-full font-bold">
          📱 Mobile Optimized
        </span>
      </div>

      {/* Advanced Search & Filter Bar */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="অর্ডার নম্বর, মোবাইল, নাম বা TrxID দিয়ে খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-inner"
          />
        </div>

        {/* Status filter chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: 'all', label: 'সকল অর্ডার' },
            { id: 'pending', label: '⏳ অপেক্ষমাণ' },
            { id: 'completed', label: '✓ ডেলিভার্ড' },
            { id: 'cancelled', label: '✕ বাতিল' },
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

      {filteredOrders.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl text-xs text-slate-500 space-y-2">
          <AlertCircle className="w-8 h-8 mx-auto text-slate-600" />
          <p className="font-bold text-slate-300">কোনো অর্ডার পাওয়া যায়নি।</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((o) => {
            const isPending = o.status === 'pending';
            const isCompleted = o.status === 'completed';
            const isCancelled = o.status === 'cancelled';

            return (
              <div 
                key={o.id} 
                className={`bg-slate-900 border rounded-3xl p-4 space-y-3.5 shadow-xl transition-all ${
                  isPending ? 'border-amber-500/40 bg-gradient-to-b from-slate-900 to-amber-950/10' :
                  isCompleted ? 'border-emerald-500/30' : 'border-rose-500/30'
                }`}
              >
                {/* Header: Order # and Status */}
                <div className="flex items-start justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                  <div>
                    <span className="font-mono font-black text-white text-sm block">#{o.order_number}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(o.created_at).toLocaleString('bn-BD', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                      isCompleted ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60' :
                      isCancelled ? 'bg-rose-950 text-rose-400 border border-rose-800/60' :
                      'bg-amber-950 text-amber-400 border border-amber-800/60 animate-pulse'
                    }`}>
                      {isCompleted ? '✓ ডেলিভার্ড' : isCancelled ? '✕ বাতিল' : '⏳ অপেক্ষমান'}
                    </span>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="bg-slate-950/60 rounded-2xl p-3 border border-slate-800/60 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-medium">গ্রাহক:</span>
                    <span className="font-bold text-white">{o.customer_name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-medium">মোবাইল:</span>
                    <div className="flex items-center gap-2">
                      <a href={`tel:${o.customer_phone}`} className="font-mono font-bold text-blue-400 hover:underline">
                        {o.customer_phone}
                      </a>
                      <button 
                        onClick={() => handleCopy(o.customer_phone, 'Phone')}
                        className="p-1 bg-slate-900 text-slate-400 hover:text-white rounded-lg border border-slate-800"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  {o.player_id && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-medium">Game UID:</span>
                      <span className="font-mono font-bold text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800">
                        {o.player_id} {o.server_id ? `(${o.server_id})` : ''}
                      </span>
                    </div>
                  )}
                </div>

                {/* Product & Payment summary */}
                <div className="space-y-1.5 text-xs">
                  <div className="font-bold text-slate-200 text-sm leading-snug">
                    📦 {o.items_summary}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <span className="uppercase font-extrabold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                        {o.payment_method}
                      </span>
                      {o.trx_id && (
                        <span className="font-mono text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          TrxID: <strong className="text-amber-300">{o.trx_id}</strong>
                        </span>
                      )}
                    </div>
                    <span className="font-black text-emerald-400 font-mono text-sm">
                      ৳{o.total_amount.toLocaleString()}
                    </span>
                  </div>

                  {o.license_key_delivered && (
                    <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-emerald-300 flex items-center justify-between">
                      <span className="truncate">KEY: {o.license_key_delivered}</span>
                      <button 
                        onClick={() => handleCopy(o.license_key_delivered!, 'License Key')}
                        className="p-1 bg-slate-900 text-slate-400 hover:text-white rounded-lg shrink-0 ml-2"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Actions for Pending Orders */}
                {isPending && (
                  <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
                    {o.order_type === 'topup' && onRechargeAPI && (
                      <button
                        onClick={() => onRechargeAPI(o)}
                        disabled={isRechargingId === o.id}
                        className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>{isRechargingId === o.id ? 'API লোডিং...' : 'রিচার্জ API'}</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setDeliveringOrderId(o.id);
                        setLicenseKeyInput('');
                      }}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>অনুমোদন ও ডেলিভারি</span>
                    </button>

                    <button
                      onClick={async () => {
                        if (confirm(`অর্ডার #${o.order_number} বাতিল করতে চান?`)) {
                          await onUpdateOrderStatus(o.id, 'cancelled');
                          showToast('Order cancelled successfully.');
                        }
                      }}
                      className="px-3 py-2 bg-rose-950/60 hover:bg-rose-900 text-rose-300 font-bold text-xs rounded-xl border border-rose-900 cursor-pointer"
                    >
                      বাতিল
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Deliver Key Modal Dialog */}
      {deliveringOrderId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 w-full max-w-sm space-y-4 relative shadow-2xl">
            <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>অর্ডার ডেলিভারি ও অনুমোদন</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              ডিজিটাল লাইসেন্স কী অথবা ডেলিভারি নির্দেশনা লিখুন। এটি গ্রাহকের একাউন্টের অর্ডার ট্র্যাকিং ও ভল্টে ইনস্ট্যান্টলি সক্রিয় হবে।
            </p>
            <textarea
              rows={3}
              placeholder="লাইসেন্স কী: XXXX-XXXX-XXXX অথবা ডেমো অ্যাকাউন্ট লিংক..."
              value={licenseKeyInput}
              onChange={(e) => setLicenseKeyInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono"
            />
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDeliveringOrderId(null)}
                className="flex-1 py-2.5 text-xs font-bold text-slate-400 bg-slate-800 hover:bg-slate-700 rounded-xl cursor-pointer"
              >
                বাতিল
              </button>
              <button
                onClick={async () => {
                  await onUpdateOrderStatus(deliveringOrderId, 'completed', licenseKeyInput.trim() || 'Verified & Delivered');
                  setDeliveringOrderId(null);
                  showToast('Order approved and delivered successfully!');
                }}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md cursor-pointer"
              >
                ডেলিভারি সম্পন্ন করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
