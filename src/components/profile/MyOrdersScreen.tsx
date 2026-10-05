import React from 'react';
import { User, Order, AliExpressDemandOrder } from '../../types';
import { ArrowLeft, ShoppingBag, Globe, Key, ShieldCheck, HelpCircle } from 'lucide-react';
import { SharedHeader } from '../SharedHeader';

interface MyOrdersScreenProps {
  currentUser: User;
  orders: Order[];
  aliExpressOrders: AliExpressDemandOrder[];
  onClose: () => void;
}

export const MyOrdersScreen: React.FC<MyOrdersScreenProps> = ({
  currentUser,
  orders,
  aliExpressOrders,
  onClose,
}) => {
  const myOrders = orders.filter(
    (o) =>
      o.customer_phone === currentUser.phone ||
      (currentUser.email && o.customer_email === currentUser.email)
  );

  const myAliExpress = aliExpressOrders.filter(
    (a) =>
      a.customer_phone === currentUser.phone ||
      (currentUser.email && a.customer_email === currentUser.email)
  );

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed':
      case 'delivered':
      case 'confirmed':
        return 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300';
      case 'processing':
      case 'shipping':
        return 'bg-blue-500/10 border border-blue-500/20 text-blue-300 animate-pulse';
      case 'cancelled':
        return 'bg-rose-500/10 border border-rose-500/20 text-rose-300';
      default:
        return 'bg-amber-500/10 border border-amber-500/20 text-amber-300 animate-pulse';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Delivered';
      case 'delivered': return 'Delivered';
      case 'confirmed': return 'Confirmed';
      case 'processing': return 'Processing';
      case 'shipping': return 'Shipping';
      case 'cancelled': return 'Cancelled';
      default: return 'Pending';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <SharedHeader title="My Orders" onBack={onClose} />

      {/* Main Container */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 relative z-10 space-y-6">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 bg-blue-600/10 text-blue-400 border border-blue-500/20 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/5">
            <ShoppingBag className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">My Orders</h2>
          <p className="text-xs text-slate-400">All your software license keys, game top-ups, and on-demand shopping orders.</p>
        </div>

        {myOrders.length === 0 && myAliExpress.length === 0 ? (
          <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl text-xs text-slate-500 space-y-2">
            <ShoppingBag className="w-10 h-10 mx-auto stroke-1 text-slate-600" />
            <p>You don't have any orders in your profile yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Regular Orders */}
            {myOrders.map((o) => (
              <div key={o.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <span className="font-mono font-black text-xs text-blue-400 block">{o.order_number}</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Order Date: {new Date(o.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black ${getStatusStyle(o.status)}`}>
                    {getStatusLabel(o.status)}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 block">Product Summary</span>
                    <span className="font-bold text-slate-200 mt-0.5 block">{o.items_summary}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Total Amount</span>
                    <span className="font-bold text-white mt-0.5 block">৳{o.total_amount}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Payment Method</span>
                    <span className="font-bold text-amber-400 mt-0.5 block uppercase">{o.payment_method}</span>
                  </div>
                </div>

                {o.license_key_delivered && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-1 text-xs">
                    <span className="font-bold text-emerald-400 flex items-center gap-1">
                      <Key className="w-3.5 h-3.5" /> Delivered License Key:
                    </span>
                    <pre className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-emerald-300 font-mono text-xs select-all break-all leading-normal whitespace-pre-wrap">
                      {o.license_key_delivered}
                    </pre>
                  </div>
                )}
              </div>
            ))}

            {/* AliExpress Orders */}
            {myAliExpress.map((ali) => (
              <div key={ali.id} className="bg-slate-900 border border-rose-950/20 rounded-3xl p-5 shadow-xl space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-rose-500" />
                    <div>
                      <span className="font-mono font-black text-xs text-rose-400 block">{ali.order_number}</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">Date: {new Date(ali.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black ${getStatusStyle(ali.status)}`}>
                    {getStatusLabel(ali.status)}
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <span className="font-bold text-slate-200 block text-sm">AliExpress: {ali.product_title || 'On-Demand Item'}</span>
                  {ali.variant_info && (
                    <span className="text-slate-400 block">Specifications: {ali.variant_info}</span>
                  )}
                  <div className="flex flex-wrap gap-4 text-xs pt-1.5 text-slate-400">
                    <span>Estimated Price: <strong className="text-slate-200">৳{ali.estimated_bdt_price}</strong></span>
                    {ali.admin_quoted_price && (
                      <span>Final Quoted Price: <strong className="text-emerald-400 font-extrabold">৳{ali.admin_quoted_price}</strong></span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 text-center text-xs text-slate-600 relative z-10 border-t border-slate-900 bg-slate-950/40">
        <div className="flex items-center justify-center gap-1 text-slate-500 mb-1">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>100% Verified & Real-Time Order History</span>
        </div>
        <p>© {new Date().getFullYear()} Veloral Digital & Shop. All rights reserved.</p>
      </footer>
    </div>
  );
};
