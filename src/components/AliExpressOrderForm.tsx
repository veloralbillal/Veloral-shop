import React, { useState } from 'react';
import { Globe, Link2, ArrowRight, CheckCircle2, AlertCircle, Copy, Check } from 'lucide-react';
import { StoreSettings, AliExpressDemandOrder, User } from '../types';

interface AliExpressOrderFormProps {
  settings: StoreSettings;
  currentUser?: User | null;
  onSubmitOrder: (data: Omit<AliExpressDemandOrder, 'id' | 'order_number' | 'created_at' | 'status'>) => Promise<AliExpressDemandOrder>;
}

export const AliExpressOrderForm: React.FC<AliExpressOrderFormProps> = ({
  settings,
  currentUser,
  onSubmitOrder,
}) => {
  const [productUrl, setProductUrl] = useState('');
  const [productTitle, setProductTitle] = useState('');
  const [variantInfo, setVariantInfo] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [usdPrice, setUsdPrice] = useState<number | ''>(5.0);

  // Customer info
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad' | 'rocket' | 'advance'>('bkash');
  const [paymentPhone, setPaymentPhone] = useState('');
  const [trxId, setTrxId] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<AliExpressDemandOrder | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedNumber, setCopiedNumber] = useState(false);

  // Calculations
  const numericUsd = typeof usdPrice === 'number' ? usdPrice : 0;
  const productBdt = Math.round(numericUsd * settings.usd_to_bdt_rate * quantity);
  const shippingBdt = settings.aliexpress_shipping_flat_bdt;
  const totalEstimatedBdt = productBdt + shippingBdt;
  const suggestedAdvance = Math.round(totalEstimatedBdt * 0.5);

  const selectedNumber =
    paymentMethod === 'bkash'
      ? settings.bkash_number
      : paymentMethod === 'nagad'
      ? settings.nagad_number
      : settings.rocket_number;

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedNumber);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productUrl.trim()) {
      setErrorMsg('Please paste the AliExpress product URL.');
      return;
    }
    if (!name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!phone.trim() || !/^(01[3-9]\d{8})$/.test(phone.trim().replace(/\D/g, ''))) {
      setErrorMsg('Please enter a valid 11-digit mobile number.');
      return;
    }
    if (!address.trim()) {
      setErrorMsg('Please enter your complete delivery address.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');

      const created = await onSubmitOrder({
        customer_name: name.trim(),
        customer_phone: phone.trim(),
        customer_email: email.trim(),
        product_url: productUrl.trim(),
        product_title: productTitle.trim() || 'AliExpress Item',
        variant_info: variantInfo.trim(),
        quantity,
        estimated_usd_price: numericUsd,
        estimated_bdt_price: totalEstimatedBdt,
        delivery_address: address.trim(),
        payment_method: paymentMethod,
        payment_phone: paymentPhone.trim(),
        trx_id: trxId.trim(),
        notes: notes.trim(),
      });

      setOrderSuccess(created);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit order request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-8 max-w-xl mx-auto text-center animate-in fade-in duration-200 shadow-xs">
        <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">
          Request Received
        </span>

        <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
          AliExpress Order Submitted!
        </h3>

        <p className="text-xs text-slate-500 mt-1.5">
          Our team will review your product link and contact you shortly for dispatch details.
        </p>

        <div className="my-5 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2">
          <div className="flex justify-between items-center pb-2 border-b border-slate-200">
            <span className="text-xs text-slate-500">Tracking Order ID:</span>
            <span className="text-sm font-black text-blue-600 font-mono">
              {orderSuccess.order_number}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">Customer:</span>
            <span className="font-bold text-slate-800">{orderSuccess.customer_name}</span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">Phone:</span>
            <span className="font-bold text-slate-800">{orderSuccess.customer_phone}</span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">Estimated Total:</span>
            <span className="font-black text-slate-900 text-sm">৳{orderSuccess.estimated_bdt_price}</span>
          </div>
        </div>

        <button
          onClick={() => {
            setOrderSuccess(null);
            setProductUrl('');
            setProductTitle('');
            setVariantInfo('');
            setNotes('');
            setTrxId('');
          }}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
        >
          Submit Another Request
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-4 sm:p-8 max-w-full overflow-hidden">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
        <span className="text-[11px] font-black uppercase tracking-wider text-rose-600 bg-rose-50 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5" /> AliExpress On-Demand Shopping
        </span>
        <h2 className="text-xl sm:text-3xl font-black text-slate-900 mt-2">
          Order Any Product by AliExpress Link
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-lg mx-auto">
          Simply paste the AliExpress item link. Pay in BDT via bKash / Nagad with full customs clearance and doorstep delivery!
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-5">
        {/* Step 1: Link & Product Details */}
        <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3.5">
          <div className="flex items-center gap-2 text-slate-900 font-extrabold text-xs sm:text-sm border-b border-slate-200 pb-2">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
              1
            </span>
            <span>Paste AliExpress Link & Product Specs</span>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              AliExpress Product URL * :
            </label>
            <div className="relative">
              <input
                type="url"
                required
                placeholder="https://www.aliexpress.com/item/100500...html"
                value={productUrl}
                onChange={(e) => setProductUrl(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-300 focus:border-rose-500 rounded-xl outline-none"
              />
              <Link2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Item Title or Nickname:
              </label>
              <input
                type="text"
                placeholder="e.g. Wireless Smart Watch"
                value={productTitle}
                onChange={(e) => setProductTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Color / Size / Model:
              </label>
              <input
                type="text"
                placeholder="e.g. Black, Size XL, 64GB"
                value={variantInfo}
                onChange={(e) => setVariantInfo(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl outline-none"
              />
            </div>
          </div>

          {/* Quantity & USD Calculator */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Quantity:
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-300 font-bold text-slate-700 hover:bg-slate-100"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 text-center py-1.5 text-xs font-bold bg-white border border-slate-300 rounded-lg outline-none"
                />
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-300 font-bold text-slate-700 hover:bg-slate-100"
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                AliExpress Price in USD ($):
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-500 text-xs">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.1"
                  placeholder="5.50"
                  value={usdPrice}
                  onChange={(e) => setUsdPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className="w-full pl-7 pr-3 py-1.5 text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg outline-none"
                />
              </div>
            </div>
          </div>

          {/* Pricing Estimation Box */}
          <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs space-y-1.5">
            <div className="flex items-center justify-between text-slate-600">
              <span>Item Cost (${numericUsd} × {settings.usd_to_bdt_rate} ৳ × {quantity} pcs):</span>
              <span className="font-bold text-slate-800">৳{productBdt}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Air Freight & Customs Handling:</span>
              <span className="font-bold text-slate-800">৳{shippingBdt}</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-blue-200 text-sm font-black text-blue-900">
              <span>Total Estimated BDT:</span>
              <span>৳{totalEstimatedBdt}</span>
            </div>
          </div>
        </div>

        {/* Step 2: Customer Delivery Details */}
        <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3.5">
          <div className="flex items-center gap-2 text-slate-900 font-extrabold text-xs sm:text-sm border-b border-slate-200 pb-2">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
              2
            </span>
            <span>Delivery & Contact Details</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Your Full Name * :
              </label>
              <input
                type="text"
                required
                placeholder="e.g. John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
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
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Full Delivery Address * :
            </label>
            <textarea
              required
              rows={2}
              placeholder="House, Road, Area, City/District"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Special Instructions / Notes:
            </label>
            <input
              type="text"
              placeholder="e.g. Include original retail box"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl outline-none"
            />
          </div>
        </div>

        {/* Step 3: Payment Section */}
        <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3.5">
          <div className="flex items-center gap-2 text-slate-900 font-extrabold text-xs sm:text-sm border-b border-slate-200 pb-2">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
              3
            </span>
            <span>Advance Payment Verification</span>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              To confirm international booking, a 50% advance (৳{suggestedAdvance}) is recommended via bKash / Nagad / Rocket. You may also submit now and pay once our representative calls you.
            </span>
          </div>

          {/* Payment Method Selector */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setPaymentMethod('bkash')}
              className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                paymentMethod === 'bkash'
                  ? 'border-pink-600 bg-pink-50 text-pink-700 font-black ring-1 ring-pink-500/20'
                  : 'border-slate-200 bg-white text-slate-700'
              }`}
            >
              <div className="text-xs font-bold">bKash</div>
              <div className="text-[9px] text-slate-400">Send Money</div>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('nagad')}
              className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                paymentMethod === 'nagad'
                  ? 'border-orange-600 bg-orange-50 text-orange-700 font-black ring-1 ring-orange-500/20'
                  : 'border-slate-200 bg-white text-slate-700'
              }`}
            >
              <div className="text-xs font-bold">Nagad</div>
              <div className="text-[9px] text-slate-400">Send Money</div>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('rocket')}
              className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                paymentMethod === 'rocket'
                  ? 'border-purple-600 bg-purple-50 text-purple-700 font-black ring-1 ring-purple-500/20'
                  : 'border-slate-200 bg-white text-slate-700'
              }`}
            >
              <div className="text-xs font-bold">Rocket</div>
              <div className="text-[9px] text-slate-400">Send Money</div>
            </button>
          </div>

          {/* Account Number Row */}
          <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                {paymentMethod.toUpperCase()} Personal Number:
              </span>
              <span className="text-sm font-black text-slate-900 font-mono tracking-wider">
                {selectedNumber}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg cursor-pointer"
            >
              {copiedNumber ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedNumber ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Sender Mobile Number:
              </label>
              <input
                type="tel"
                placeholder="01XXXXXXXXX"
                value={paymentPhone}
                onChange={(e) => setPaymentPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Transaction ID (TrxID):
              </label>
              <input
                type="text"
                placeholder="e.g. BL9X8K2M1P"
                value={trxId}
                onChange={(e) => setTrxId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl outline-none font-mono uppercase"
              />
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 bg-gradient-to-r from-rose-600 via-red-600 to-orange-500 hover:from-rose-700 hover:to-orange-600 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? (
            <span>Submitting Request...</span>
          ) : (
            <>
              <Globe className="w-4 h-4" />
              <span>Submit AliExpress Order (৳{totalEstimatedBdt})</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
