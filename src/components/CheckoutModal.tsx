import React, { useState } from 'react';
import { CartItem, Order, StoreSettings, TopupItem, User } from '../types';
import { X, CheckCircle2, AlertCircle, Copy, Check, ShieldCheck } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems?: CartItem[];
  directProduct?: { item: any; quantity: number };
  directTopup?: { item: TopupItem; extra: { playerId: string; serverId?: string; operator?: string; rechargeType?: 'prepaid' | 'postpaid' } };
  settings: StoreSettings;
  currentUser?: User | null;
  onSubmitOrder: (orderData: Omit<Order, 'id' | 'order_number' | 'created_at'>) => Promise<Order>;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems = [],
  directProduct,
  directTopup,
  settings,
  currentUser,
  onSubmitOrder,
  onOrderSuccess,
}) => {
  if (!isOpen) return null;

  // Determine items and total
  let itemsSummary = '';
  let totalAmount = 0;
  let orderType: Order['order_type'] = 'digital';
  let hasPhysical = false;

  if (directTopup) {
    orderType = 'topup';
    totalAmount = directTopup.item.price;
    itemsSummary = `${directTopup.item.name} (${directTopup.item.amount_label}) - ID: ${directTopup.extra.playerId}${
      directTopup.extra.operator ? ` [${directTopup.extra.operator} - ${directTopup.extra.rechargeType}]` : ''
    }`;
  } else if (directProduct) {
    orderType = directProduct.item.category;
    hasPhysical = directProduct.item.category === 'physical';
    const deliveryFee = hasPhysical ? 60 : 0;
    totalAmount = directProduct.item.price * directProduct.quantity + deliveryFee;
    itemsSummary = `${directProduct.item.title} x ${directProduct.quantity}`;
  } else if (cartItems.length > 0) {
    hasPhysical = cartItems.some((i) => i.product.category === 'physical');
    orderType = hasPhysical ? 'physical' : 'digital';
    const subtotal = cartItems.reduce((acc, i) => acc + i.product.price * i.quantity, 0);
    const deliveryFee = hasPhysical ? 60 : 0;
    totalAmount = subtotal + deliveryFee;
    itemsSummary = cartItems.map((i) => `${i.product.title} x ${i.quantity}`).join(', ');
  }

  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [customerPhone, setCustomerPhone] = useState(
    directTopup?.extra.playerId && directTopup.item.game === 'mobile_recharge'
      ? directTopup.extra.playerId
      : currentUser?.phone || ''
  );
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || '');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<Order['payment_method']>('bkash');
  const [paymentPhone, setPaymentPhone] = useState('');
  const [trxId, setTrxId] = useState('');
  const [notes, setNotes] = useState('');

  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const activePaymentNumber =
    paymentMethod === 'bkash'
      ? settings.bkash_number
      : paymentMethod === 'nagad'
      ? settings.nagad_number
      : settings.rocket_number;

  const handleCopy = () => {
    navigator.clipboard.writeText(activePaymentNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      setErrorMsg('Please enter your name.');
      return;
    }
    if (!customerPhone.trim() || !/^(01[3-9]\d{8})$/.test(customerPhone.trim().replace(/\D/g, ''))) {
      setErrorMsg('Please enter a valid 11-digit mobile number.');
      return;
    }
    if (hasPhysical && !deliveryAddress.trim()) {
      setErrorMsg('Please enter delivery address for physical items.');
      return;
    }
    if (paymentMethod !== 'cod' && !trxId.trim()) {
      setErrorMsg('Please provide your payment Transaction ID (TrxID).');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');

      const created = await onSubmitOrder({
        order_type: orderType,
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        customer_email: customerEmail.trim() || undefined,
        delivery_address: deliveryAddress.trim() || undefined,
        items_summary: itemsSummary,
        total_amount: totalAmount,
        payment_method: paymentMethod,
        payment_phone: paymentPhone.trim() || undefined,
        trx_id: trxId.trim() || undefined,
        player_id: directTopup?.extra.playerId,
        server_id: directTopup?.extra.serverId,
        operator: directTopup?.extra.operator,
        recharge_type: directTopup?.extra.rechargeType,
        status: 'pending',
        notes: notes.trim() || undefined,
      });

      onOrderSuccess(created);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-3.5 sm:p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                Checkout & Payment
              </h3>
              <p className="text-[11px] text-slate-500">
                {directTopup ? 'Instant Game & Mobile Top-Up' : 'Secure Online Order'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Summary Strip */}
        <div className="bg-slate-50 px-3.5 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="truncate max-w-[240px] font-semibold text-slate-800">
            {itemsSummary}
          </div>
          <div className="font-black text-slate-900 text-sm whitespace-nowrap pl-2">
            ৳{totalAmount.toLocaleString()}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleFormSubmit} className="p-4 sm:p-5 space-y-3.5 max-h-[70vh] overflow-y-auto">
          {/* Customer Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Your Full Name * :
              </label>
              <input
                type="text"
                required
                placeholder="e.g. John Doe"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Mobile Number (11 Digits) * :
              </label>
              <input
                type="tel"
                required
                placeholder="018XXXXXXXX"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Email Address (For digital license receipt):
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl outline-none"
            />
          </div>

          {/* Delivery Address (if physical) */}
          {hasPhysical && (
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Delivery Address * :
              </label>
              <textarea
                required
                rows={2}
                placeholder="House, Road, Area, City"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl outline-none"
              />
            </div>
          )}

          {/* Payment Method Selector */}
          <div className="pt-1.5 border-t border-slate-100">
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Payment Method:
            </label>

            <div className={`grid ${hasPhysical ? 'grid-cols-4' : 'grid-cols-3'} gap-1.5`}>
              <button
                type="button"
                onClick={() => setPaymentMethod('bkash')}
                className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                  paymentMethod === 'bkash'
                    ? 'border-pink-600 bg-pink-50 ring-1 ring-pink-500/20 text-pink-700 font-extrabold'
                    : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                <div className="text-xs font-bold">bKash</div>
                <div className="text-[9px] text-slate-400">Send Money</div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('nagad')}
                className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                  paymentMethod === 'nagad'
                    ? 'border-orange-600 bg-orange-50 ring-1 ring-orange-500/20 text-orange-700 font-extrabold'
                    : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                <div className="text-xs font-bold">Nagad</div>
                <div className="text-[9px] text-slate-400">Send Money</div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('rocket')}
                className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                  paymentMethod === 'rocket'
                    ? 'border-purple-600 bg-purple-50 ring-1 ring-purple-500/20 text-purple-700 font-extrabold'
                    : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                <div className="text-xs font-bold">Rocket</div>
                <div className="text-[9px] text-slate-400">Send Money</div>
              </button>

              {hasPhysical && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                    paymentMethod === 'cod'
                      ? 'border-emerald-600 bg-emerald-50 ring-1 ring-emerald-500/20 text-emerald-700 font-extrabold'
                      : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold">Cash On</div>
                  <div className="text-[9px] text-slate-400">Delivery</div>
                </button>
              )}
            </div>
          </div>

          {/* Payment Account Strip */}
          {paymentMethod !== 'cod' ? (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">
                    {paymentMethod.toUpperCase()} Personal Number:
                  </span>
                  <span className="text-sm font-black text-slate-900 font-mono tracking-wider">
                    {activePaymentNumber}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Sender Mobile Number:
                  </label>
                  <input
                    type="tel"
                    placeholder="01XXXXXXXXX"
                    value={paymentPhone}
                    onChange={(e) => setPaymentPhone(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Transaction ID (TrxID) * :
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BL9X8K2M1P"
                    value={trxId}
                    onChange={(e) => setTrxId(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg outline-none font-mono uppercase"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
              ✓ Cash on Delivery chosen. Please pay ৳{totalAmount} to the delivery courier upon delivery.
            </div>
          )}

          {errorMsg && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Processing Order...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Confirm Order (৳{totalAmount.toLocaleString()})</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
