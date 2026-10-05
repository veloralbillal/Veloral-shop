import React, { useState } from 'react';
import { Order, AliExpressDemandOrder } from '../types';
import { 
  ArrowLeft, Search, PackageCheck, AlertCircle, Copy, Check, Zap, Globe, 
  Clock, CreditCard, ShoppingBag, Truck, ShieldCheck, Heart, Download, FileText, CheckCircle2, Sparkles
} from 'lucide-react';
import { SharedHeader } from './SharedHeader';

interface OrderTrackerScreenProps {
  orders: Order[];
  aliExpressOrders: AliExpressDemandOrder[];
  initialOrderNumber?: string;
  onClose: () => void;
}

export const OrderTrackerScreen: React.FC<OrderTrackerScreenProps> = ({
  orders,
  aliExpressOrders,
  initialOrderNumber = '',
  onClose,
}) => {
  const [query, setQuery] = useState(initialOrderNumber);
  const [copiedKey, setCopiedKey] = useState(false);

  const trimmed = query.trim().toLowerCase();
  const matchedOrders = trimmed
    ? orders.filter(
        (o) =>
          o.order_number.toLowerCase().includes(trimmed) ||
          o.customer_phone.includes(trimmed)
      )
    : [];

  const matchedAliExpress = trimmed
    ? aliExpressOrders.filter(
        (a) =>
          a.order_number.toLowerCase().includes(trimmed) ||
          a.customer_phone.includes(trimmed)
      )
    : [];

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleDownload = (fileUrl: string, fileName?: string) => {
    try {
      // Use the server-side proxy for more reliable downloads (handles CORS and base64 correctly)
      const proxyUrl = `/api/download?url=${encodeURIComponent(fileUrl)}&filename=${encodeURIComponent(fileName || 'digital_product')}`;
      window.location.href = proxyUrl;
    } catch (err) {
      console.error('Download failed:', err);
      window.open(fileUrl, '_blank');
    }
  };

  const getStatusSteps = (status: string) => {
    const steps = [
      { label: 'Order Submitted', desc: 'Order received successfully' },
      { label: 'Payment Verification', desc: 'bKash/Nagad transaction being verified' },
      { label: 'Processing', desc: 'Item delivery being prepared' },
      { label: 'Delivered', desc: 'Your account or license key has been sent' }
    ];

    let activeStep = 0;
    if (status === 'processing') activeStep = 2;
    else if (status === 'completed' || status === 'delivered') activeStep = 3;
    else if (status === 'cancelled') activeStep = -1; // cancelled
    else activeStep = 1; // pending / verifying payment

    return { steps, activeStep };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
      case 'delivered':
      case 'confirmed':
        return <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-extrabold px-2.5 py-1 rounded-xl text-[11px]">✓ Completed</span>;
      case 'processing':
      case 'shipping':
        return <span className="bg-blue-500/10 border border-blue-500/30 text-blue-300 font-extrabold px-2.5 py-1 rounded-xl text-[11px] animate-pulse">⟳ Processing</span>;
      case 'cancelled':
        return <span className="bg-rose-500/10 border border-rose-500/30 text-rose-300 font-extrabold px-2.5 py-1 rounded-xl text-[11px]">✕ Cancelled</span>;
      default:
        return <span className="bg-amber-500/10 border border-amber-500/30 text-amber-300 font-extrabold px-2.5 py-1 rounded-xl text-[11px] animate-pulse">⏱ Payment Verification</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans relative overflow-hidden">
      {/* Background radial highlights */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 w-[500px] h-[500px] bg-emerald-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <SharedHeader title="Order Tracker (Live Tracker)" onBack={onClose} />

      {/* Main Track Grid */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 relative z-10 space-y-8">
        
        {/* Intro */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-blue-600/10 text-blue-400 border border-blue-500/20 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/5">
            <PackageCheck className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">লাইভ অর্ডার ট্র্যাকার (Live Tracking)</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            আপনার অর্ডারটি কোন অবস্থায় রয়েছে তা দেখতে নিচের ঘরে আপনার অর্ডার আইডি অথবা ১১ ডিজিটের মোবাইল নম্বরটি লিখুন।
          </p>
        </div>

        {/* Input Card */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">অর্ডার আইডি (যেমন- ORD-XXXXXX) অথবা মোবাইল নম্বর</label>
            <div className="relative">
              <input
                type="text"
                placeholder="যেমন: ORD-123456 বা 018XXXXXXXX"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>

        {/* Search results container */}
        <div className="space-y-6">
          {!query ? (
            <div className="text-center py-12 bg-slate-900/40 border border-slate-900 rounded-3xl">
              <Clock className="w-10 h-10 stroke-1 mx-auto mb-2 text-slate-600" />
              <p className="text-xs text-slate-400">অর্ডার নম্বর অথবা মোবাইল নম্বর দিয়ে সার্চ করুন।</p>
            </div>
          ) : matchedOrders.length === 0 && matchedAliExpress.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/40 border border-slate-900 rounded-3xl text-xs text-slate-400 space-y-2">
              <AlertCircle className="w-10 h-10 text-rose-500/80 mx-auto stroke-1" />
              <p className="font-bold text-slate-200">কোনো অর্ডার খুঁজে পাওয়া যায়নি।</p>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">দয়া করে আপনার অর্ডার নম্বর (যেমন- ORD-718292) অথবা ১১ ডিজিটের মোবাইল নম্বরটি চেক করে পুনরায় লিখুন।</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Smooth Success Visual Feedback Banner */}
              <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-indigo-950/80 border border-emerald-500/30 shadow-2xl shadow-emerald-500/10 animate-in zoom-in-95 slide-in-from-top-4 duration-500 flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex items-center gap-3.5 z-10">
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/30 font-black animate-bounce">
                      <CheckCircle2 className="w-7 h-7 text-slate-950" />
                    </div>
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-400"></span>
                    </span>
                  </div>

                  <div className="text-left space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-black text-emerald-300 tracking-tight">
                        অর্ডার সফলভাবে ভেরিফাই ও ট্র্যাক হয়েছে!
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse">
                        ✓ Live Status Verified
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug">
                      আপনার ক্রয়ের বর্তমান আপডেট, লাইভ ডেলিভারি স্ট্যাটাস এবং লাইসেন্স কোড নিচে প্রদর্শন করা হচ্ছে।
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 z-10 w-full sm:w-auto justify-end border-t sm:border-t-0 border-slate-800 pt-2 sm:pt-0">
                  <span className="text-xs font-mono font-bold text-slate-400">
                    {matchedOrders.length + matchedAliExpress.length} টি অর্ডার পাওয়া গেছে
                  </span>
                  <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
                </div>
              </div>

              {/* Regular Orders */}
              {matchedOrders.map((ord) => {
                const { steps, activeStep } = getStatusSteps(ord.status);
                return (
                  <div key={ord.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-md space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                      <div>
                        <div className="text-xs font-mono font-bold text-blue-400 flex items-center gap-1">
                          <PackageCheck className="w-3.5 h-3.5" />
                          <span>{ord.order_number}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          তারিখ: {new Date(ord.created_at).toLocaleString('bn-BD')}
                        </div>
                      </div>
                      {getStatusBadge(ord.status)}
                    </div>

                    {/* Order Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1">
                        <span className="text-slate-500 block">ক্রয়কৃত প্রডাক্ট</span>
                        <span className="font-bold text-white block text-sm">{ord.items_summary}</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-slate-500 block">কাস্টমার নাম ও মোবাইল</span>
                        <span className="font-bold text-slate-200 block">{ord.customer_name} ({ord.customer_phone})</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-slate-500 block">পেমেন্ট মেথড ও মূল্য</span>
                        <span className="font-bold text-amber-400 block uppercase">{ord.payment_method} | ৳{ord.total_amount}</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-slate-500 block">প্লেয়ার আইডি / ইনফো</span>
                        <span className="font-bold text-indigo-300 block font-mono">{ord.player_id ? `UID: ${ord.player_id}` : 'N/A'}</span>
                      </div>
                    </div>

                    {/* Visual Stepper Timeline */}
                    {ord.status !== 'cancelled' && (
                      <div className="pt-3 border-t border-slate-800/60">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-4">অর্ডার প্রগ্রেস ট্র্যাকিং</span>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
                          {steps.map((st, idx) => {
                            const isPassed = idx <= activeStep;
                            const isCurrent = idx === activeStep;
                            return (
                              <div key={idx} className="flex sm:flex-col items-start sm:items-center text-left sm:text-center gap-3 sm:gap-1.5 relative">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                                  isCurrent 
                                    ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-600/30 scale-105' 
                                    : isPassed 
                                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400' 
                                    : 'bg-slate-950 border-slate-800 text-slate-600'
                                }`}>
                                  {isPassed && idx < activeStep ? (
                                    <Check className="w-4 h-4" />
                                  ) : (
                                    <span className="text-xs font-black">{idx + 1}</span>
                                  )}
                                </div>
                                <div>
                                  <span className={`block text-xs font-bold ${isCurrent ? 'text-white' : isPassed ? 'text-slate-300' : 'text-slate-600'}`}>
                                    {st.label}
                                  </span>
                                  <span className="block text-[10px] text-slate-500 mt-0.5 sm:hidden">{st.desc}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* License Key Delivery Content */}
                    {ord.license_key_delivered && (
                      <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xs space-y-2">
                        <div className="font-extrabold text-emerald-400 flex items-center gap-1.5">
                          <Zap className="w-4 h-4 text-amber-400 animate-bounce" />
                          <span>আপনার লাইসেন্স কী / ডেলিভারি কন্টেন্ট:</span>
                        </div>
                        <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-emerald-300 font-bold text-xs">
                          <span className="break-all">{ord.license_key_delivered}</span>
                          <button
                            onClick={() => handleCopyKey(ord.license_key_delivered!)}
                            className="ml-3 p-1 text-slate-400 hover:text-white cursor-pointer shrink-0 bg-slate-900 rounded hover:bg-slate-800"
                            title="Copy Delivered Content"
                          >
                            {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Download File Content */}
                    {ord.download_file_url && (
                      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-xs space-y-2">
                        <div className="font-extrabold text-blue-400 flex items-center gap-1.5">
                          <Download className="w-4 h-4 text-blue-400" />
                          <span>আপনার ডাউনলোড ফাইল:</span>
                        </div>
                        <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="w-4 h-4 text-slate-500" />
                            <span className="font-bold text-slate-300 truncate">{ord.file_name || 'Downloadable File'}</span>
                          </div>
                          <button
                            onClick={() => handleDownload(ord.download_file_url!, ord.file_name)}
                            className="ml-3 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>ডাউনলোড</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* AliExpress Orders */}
              {matchedAliExpress.map((ali) => (
                <div key={ali.id} className="bg-slate-900 border border-rose-900/30 rounded-3xl p-5 sm:p-6 shadow-md space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-rose-500" />
                      <div>
                        <div className="text-xs font-mono font-bold text-rose-400">
                          {ali.order_number}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          তারিখ: {new Date(ali.created_at).toLocaleString('bn-BD')}
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(ali.status)}
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="text-white font-bold text-sm">AliExpress: {ali.product_title || 'অন-ডিমান্ড পণ্য'}</div>
                    {ali.variant_info && (
                      <div className="text-slate-400">স্পেসিফিকেশন: {ali.variant_info}</div>
                    )}
                    <div className="text-slate-400">
                      আনুমানিক মূল্য: <span className="font-bold text-slate-200">৳{ali.estimated_bdt_price}</span>
                      {ali.admin_quoted_price && (
                        <span className="text-emerald-400 font-extrabold ml-2">
                          (নির্ধারিত ফাইনাল প্রাইস: ৳{ali.admin_quoted_price})
                        </span>
                      )}
                    </div>
                    <div className="text-slate-500 truncate mt-1">
                      মূল লিংক: <a href={ali.product_url} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">{ali.product_url}</a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 text-center text-xs text-slate-600 relative z-10 border-t border-slate-900 bg-slate-950/40">
        <div className="flex items-center justify-center gap-1 text-slate-500 mb-1">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>১০০% সুরক্ষিত ডাটা ও অর্ডার ট্রেসিং সিস্টেম</span>
        </div>
        <p>© {new Date().getFullYear()} Veloral Digital & Shop. All rights reserved.</p>
      </footer>
    </div>
  );
};
