import React, { useState, useEffect } from 'react';
import { CartItem, Order, StoreSettings, TopupItem, User, Coupon } from '../types';
import { fetchCoupons } from '../services/db';
import { 
  ArrowLeft, CheckCircle2, AlertCircle, Copy, Check, 
  ShieldCheck, Gift, MapPin, Sparkles, Tag, HelpCircle, 
  Mail, Phone, ShoppingBag, ShieldAlert, MessageCircle, Wallet 
} from 'lucide-react';

interface CheckoutScreenProps {
  cartItems?: CartItem[];
  directProduct?: { item: any; quantity: number };
  directTopup?: { item: TopupItem; extra: { playerId: string; serverId?: string; operator?: string; rechargeType?: 'prepaid' | 'postpaid' } };
  settings: StoreSettings;
  currentUser?: User | null;
  onSubmitOrder: (orderData: Omit<Order, 'id' | 'order_number' | 'created_at'>) => Promise<Order>;
  onOrderSuccess: (order: Order) => void;
  onCancel: () => void;
}

export const CheckoutScreen: React.FC<CheckoutScreenProps> = ({
  cartItems = [],
  directProduct,
  directTopup,
  settings,
  currentUser,
  onSubmitOrder,
  onOrderSuccess,
  onCancel,
}) => {
  // Determine items and total
  let itemsSummary = '';
  let subtotalAmount = 0;
  let orderType: Order['order_type'] = 'digital';
  let hasPhysical = false;

  if (directTopup) {
    orderType = 'topup';
    subtotalAmount = directTopup.item.price;
    itemsSummary = `${directTopup.item.name} (${directTopup.item.amount_label}) - ID: ${directTopup.extra.playerId}${
      directTopup.extra.operator ? ` [${directTopup.extra.operator} - ${directTopup.extra.rechargeType}]` : ''
    }`;
  } else if (directProduct) {
    orderType = directProduct.item.category;
    hasPhysical = directProduct.item.category === 'physical';
    subtotalAmount = directProduct.item.price * directProduct.quantity;
    itemsSummary = `${directProduct.item.title} x ${directProduct.quantity}`;
  } else if (cartItems.length > 0) {
    hasPhysical = cartItems.some((i) => i.product.category === 'physical');
    // Account purchase check inside cart
    const hasAccounts = cartItems.some(i => i.product.category === 'accounts' || ['whatsapp', 'telegram', 'facebook', 'gmail', 'netflix', 'instagram', 'other'].includes(i.product.category));
    orderType = hasAccounts ? 'accounts' : (hasPhysical ? 'physical' : 'digital');
    subtotalAmount = cartItems.reduce((acc, i) => acc + i.product.price * i.quantity, 0);
    itemsSummary = cartItems.map((i) => `${i.product.title} x ${i.quantity}`).join(', ');
  }

  const deliveryFee = hasPhysical ? 60 : 0;
  const initialTotal = subtotalAmount + deliveryFee;

  // Determine if there are COD or Advance restrictions
  let restrictToCOD = false;
  let restrictToAdvance = false;

  const isAccountPurchase = orderType === 'accounts' || 
    (directProduct && (directProduct.item.category === 'accounts' || ['whatsapp', 'telegram', 'facebook', 'gmail', 'netflix', 'instagram', 'other'].includes(directProduct.item.category))) ||
    (cartItems.some(i => i.product.category === 'accounts' || ['whatsapp', 'telegram', 'facebook', 'gmail', 'netflix', 'instagram', 'other'].includes(i.product.category)));

  if (isAccountPurchase) {
    restrictToCOD = false;
    restrictToAdvance = true;
  }

  if (directProduct && !isAccountPurchase) {
    if (directProduct.item.cod_or_advance === 'cod') {
      restrictToCOD = true;
    } else if (directProduct.item.cod_or_advance === 'advance') {
      restrictToAdvance = true;
    }
  } else if (cartItems.length > 0 && !isAccountPurchase) {
    const hasCodOnly = cartItems.some(i => i.product.cod_or_advance === 'cod');
    const hasAdvanceOnly = cartItems.some(i => i.product.cod_or_advance === 'advance');
    if (hasCodOnly && !hasAdvanceOnly) {
      restrictToCOD = true;
    } else if (hasAdvanceOnly && !hasCodOnly) {
      restrictToAdvance = true;
    }
  }

  // Coupon promo code states
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [couponSuccessMsg, setCouponSuccessMsg] = useState('');
  const [couponErrorMsg, setCouponErrorMsg] = useState('');

  // Fields
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [customerPhone, setCustomerPhone] = useState(
    directTopup?.extra.playerId && directTopup.item.game === 'mobile_recharge'
      ? directTopup.extra.playerId
      : currentUser?.phone || ''
  );
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || '');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [saveAddressForFuture, setSaveAddressForFuture] = useState(true);

  // Saved Address integrations
  const [savedAddress, setSavedAddress] = useState<any>(null);
  const [useSavedAddress, setUseSavedAddress] = useState(false);

  // Payments
  const [paymentMethod, setPaymentMethod] = useState<Order['payment_method']>('bkash');
  const [paymentPhone, setPaymentPhone] = useState('');
  const [trxId, setTrxId] = useState('');
  const [notes, setNotes] = useState('');

  // States
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Processing Animation & Countdown Timer
  const [isProcessingTimer, setIsProcessingTimer] = useState(false);
  const [countdown, setCountdown] = useState(4);
  const [processingStatusText, setProcessingStatusText] = useState('পেমেন্ট ও অর্ডার যাচাই হচ্ছে...');
  const [pendingCreatedOrder, setPendingCreatedOrder] = useState<Order | null>(null);

  // Countdown timer effect
  useEffect(() => {
    if (!isProcessingTimer) return;

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prev) => {
          const next = prev - 1;
          if (next === 3) setProcessingStatusText('১/৩: পেমেন্ট ও প্রেরক তথ্য ভেরিফাই হচ্ছে...');
          else if (next === 2) setProcessingStatusText('২/৩: ডাটাবেজে সিকিউর অর্ডার ও ইনভয়েস তৈরি হচ্ছে...');
          else if (next === 1) setProcessingStatusText('৩/৩: সিস্টেম রেকর্ড সংরক্ষণ ও কনফার্মেশন সম্পন্ন হচ্ছে...');
          else if (next === 0) setProcessingStatusText('✓ সফল হয়েছে! অর্ডার ট্র্যাকিং পেজে নিয়ে যাওয়া হচ্ছে...');
          return next;
        });
      }, 900);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && pendingCreatedOrder) {
      const finishTimer = setTimeout(() => {
        setIsProcessingTimer(false);
        setIsSubmitting(false);
        onOrderSuccess(pendingCreatedOrder);
      }, 600);
      return () => clearTimeout(finishTimer);
    }
  }, [isProcessingTimer, countdown, pendingCreatedOrder, onOrderSuccess]);

  // Fetch Coupons, Address and ZiniPay Callback on Mount
  useEffect(() => {
    fetchCoupons().then(setCoupons);

    // ZiniPay callback redirection verification
    const params = new URLSearchParams(window.location.search);
    const ziniStatus = params.get('status');
    const ziniInvoice = params.get('invoice_id');
    const ziniTrx = params.get('trx_id');

    if (ziniStatus === 'success' && ziniInvoice) {
      const pendingData = localStorage.getItem('veloral_pending_zinipay_order');
      if (pendingData) {
        try {
          const orderPayload = JSON.parse(pendingData);
          orderPayload.trx_id = ziniTrx || ziniInvoice;
          orderPayload.status = 'processing'; // Paid, advance to processing!
          orderPayload.notes = (orderPayload.notes || '') + ` [ZiniPay Invoice: ${ziniInvoice} - Autopaid Verified]`;

          setIsSubmitting(true);
          onSubmitOrder(orderPayload).then((created) => {
            localStorage.removeItem('veloral_pending_zinipay_order');
            // Clean URL query parameters to avoid double submissions
            const url = new URL(window.location.href);
            url.searchParams.delete('status');
            url.searchParams.delete('invoice_id');
            url.searchParams.delete('amount');
            url.searchParams.delete('trx_id');
            window.history.pushState({ path: url.toString() }, '', url.toString());
            onOrderSuccess(created);
          }).catch((err) => {
            setErrorMsg(err.message || 'ZiniPay order confirmation failed');
          }).finally(() => {
            setIsSubmitting(false);
          });
        } catch (e) {
          console.error('Failed to parse pending ZiniPay order:', e);
        }
      }
    }

    // Try loading saved address
    if (currentUser) {
      const saved = localStorage.getItem(`veloral_address_${currentUser.phone}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setSavedAddress(parsed);
          // Set by default if it contains real details
          if (parsed.district && parsed.addressDetails) {
            const formatted = `${parsed.addressDetails}, ${parsed.area}, ${parsed.city}, ${parsed.district} - ${parsed.postCode || ''}`;
            setDeliveryAddress(formatted);
            setUseSavedAddress(true);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [currentUser]);

  // Set Default Payment selection if constraints force it
  useEffect(() => {
    if (isAccountPurchase) {
      setPaymentMethod('wallet');
    } else if (restrictToCOD && paymentMethod !== 'cod') {
      setPaymentMethod('cod');
    } else if (restrictToAdvance && paymentMethod === 'cod') {
      setPaymentMethod('zinipay');
    }
  }, [restrictToCOD, restrictToAdvance, paymentMethod, isAccountPurchase]);

  // Handle Saved Address Selection toggle
  const toggleSavedAddress = (checked: boolean) => {
    setUseSavedAddress(checked);
    if (checked && savedAddress) {
      const formatted = `${savedAddress.addressDetails}, ${savedAddress.area}, ${savedAddress.city}, ${savedAddress.district} - ${savedAddress.postCode || ''}`;
      setDeliveryAddress(formatted);
    } else {
      setDeliveryAddress('');
    }
  };

  // Handle applying Coupon
  const handleApplyCoupon = () => {
    setCouponErrorMsg('');
    setCouponSuccessMsg('');
    setAppliedCoupon(null);
    setAppliedDiscount(0);

    if (!couponCode.trim()) {
      setCouponErrorMsg('দয়া করে একটি কুপন কোড লিখুন!');
      return;
    }

    const matched = coupons.find(c => c.code.toUpperCase() === couponCode.trim().toUpperCase());
    if (!matched) {
      setCouponErrorMsg('দুঃখিত! ভুল কুপন কোড!');
      return;
    }
    if (!matched.active) {
      setCouponErrorMsg('দুঃখিত! এই কুপন কোডটি বর্তমানে সচল নেই!');
      return;
    }
    if (matched.min_order_amount && subtotalAmount < matched.min_order_amount) {
      setCouponErrorMsg(`এই কুপনটির জন্য কমপক্ষে ৳${matched.min_order_amount} টাকার অর্ডার করতে হবে!`);
      return;
    }

    // Calculate discount
    let discount = 0;
    if (matched.discount_type === 'percent') {
      discount = Math.round((subtotalAmount * matched.discount_value) / 100);
    } else {
      discount = matched.discount_value;
    }

    setAppliedCoupon(matched);
    setAppliedDiscount(discount);
    setCouponSuccessMsg(`সফল! "${matched.code}" কুপন প্রযোগ করা হয়েছে এবং ৳${discount} ছাড় পাওয়া গেছে!`);
  };

  const finalTotalAmount = Math.max(0, initialTotal - appliedDiscount);

  // Wallet balances
  const walletBalance = currentUser?.wallet_balance ?? 0;
  const isWalletPayment = paymentMethod === 'wallet';
  const isWalletBalanceInsufficient = isWalletPayment && walletBalance < finalTotalAmount;

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
    setErrorMsg('');

    if (!customerName.trim()) {
      setErrorMsg('দয়া করে আপনার নাম প্রদান করুন।');
      return;
    }
    if (!customerPhone.trim() || !/^(01[3-9]\d{8})$/.test(customerPhone.trim().replace(/\D/g, ''))) {
      setErrorMsg('দয়া করে সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন।');
      return;
    }
    if (hasPhysical && !deliveryAddress.trim()) {
      setErrorMsg('শারীরিক প্রডাক্টের জন্য সঠিক ডেলিভারি ঠিকানা দিন।');
      return;
    }

    if (isAccountPurchase && !currentUser) {
      setErrorMsg('অ্যাকাউন্ট ক্রয়ের জন্য আপনাকে অবশ্যই লগইন করতে হবে।');
      return;
    }

    if (isWalletPayment && isWalletBalanceInsufficient) {
      setErrorMsg('দুঃখিত, আপনার ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই। অনুগ্রহ করে ফান্ড এড করুন।');
      return;
    }

    if (paymentMethod !== 'cod' && paymentMethod !== 'zinipay' && paymentMethod !== 'wallet' && !trxId.trim()) {
      setErrorMsg('দয়া করে পেমেন্টের Transaction ID (TrxID) প্রদান করুন।');
      return;
    }

    try {
      setIsSubmitting(true);

      // Save Address for future checkouts if checked and physical
      if (hasPhysical && saveAddressForFuture && currentUser) {
        const addressData = {
          district: savedAddress?.district || 'ঢাকা',
          city: savedAddress?.city || 'থানা',
          area: savedAddress?.area || 'এলাকা',
          addressDetails: deliveryAddress,
          postCode: savedAddress?.postCode || ''
        };
        localStorage.setItem(`veloral_address_${currentUser.phone}`, JSON.stringify(addressData));
      }

      if (paymentMethod === 'zinipay') {
        const orderPayload = {
          order_type: orderType,
          customer_name: customerName.trim(),
          customer_phone: customerPhone.trim(),
          customer_email: customerEmail.trim() || undefined,
          delivery_address: deliveryAddress.trim() || undefined,
          items_summary: itemsSummary + (appliedCoupon ? ` [কুপন: ${appliedCoupon.code} ৳${appliedDiscount} ছাড়]` : ''),
          total_amount: finalTotalAmount,
          payment_method: 'zinipay' as const,
          player_id: directTopup?.extra.playerId,
          server_id: directTopup?.extra.serverId,
          operator: directTopup?.extra.operator,
          recharge_type: directTopup?.extra.rechargeType,
          notes: notes.trim() || undefined,
        };

        // Save pending order info to LocalStorage
        localStorage.setItem('veloral_pending_zinipay_order', JSON.stringify(orderPayload));

        // Call our secure backend-proxy
        const response = await fetch('/api/zinipay/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            amount: finalTotalAmount,
            redirect_url: window.location.href, // Returns right back to this view
            cus_name: customerName.trim(),
            cus_email: customerEmail.trim() || `${customerPhone}@domain.com`,
            api_key: settings.zinipay_api_key,
          })
        });

        const json = await response.json();
        if (json.success && json.data?.payment_url) {
          // Redirect the customer to ZiniPay Gateway
          window.location.href = json.data.payment_url;
          return;
        } else {
          throw new Error(json.message || 'ZiniPay invoice generation failed');
        }
      }

      const digitalProduct = directProduct?.item.category === 'digital' ? directProduct.item : cartItems.find(i => i.product.category === 'digital')?.product;
      const downloadFileUrl = digitalProduct?.download_file_url || digitalProduct?.digital_payload;
      const fileName = digitalProduct?.file_name;
      const productCode = digitalProduct?.product_code;
      const licenseKey = digitalProduct?.digital_payload;
      
      // ONLY wallet payment is instantly completed! Manual bKash/Nagad/Rocket/COD are strictly pending!
      const isInstantDigital = paymentMethod === 'wallet';

      const orderPromise = onSubmitOrder({
        order_type: orderType,
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        customer_email: customerEmail.trim() || undefined,
        delivery_address: deliveryAddress.trim() || undefined,
        items_summary: itemsSummary + (appliedCoupon ? ` [কুপন: ${appliedCoupon.code} ৳${appliedDiscount} ছাড়]` : ''),
        total_amount: finalTotalAmount,
        payment_method: paymentMethod,
        payment_phone: paymentPhone.trim() || undefined,
        trx_id: trxId.trim() || undefined,
        player_id: directTopup?.extra.playerId,
        server_id: directTopup?.extra.serverId,
        operator: directTopup?.extra.operator,
        recharge_type: directTopup?.extra.rechargeType,
        status: isInstantDigital ? 'completed' : 'pending',
        license_key_delivered: isInstantDigital ? licenseKey : undefined,
        download_file_url: downloadFileUrl,
        file_name: fileName,
        product_code: productCode,
        notes: notes.trim() || undefined,
      });

      // Show interactive processing countdown timer modal
      setIsProcessingTimer(true);
      setCountdown(4);
      setProcessingStatusText('১/৩: পেমেন্ট ট্রানজেকশন (TrxID) তথ্য যাচাই হচ্ছে...');

      const created = await orderPromise;
      setPendingCreatedOrder(created);
    } catch (err: any) {
      setIsProcessingTimer(false);
      setIsSubmitting(false);
      setErrorMsg(err.message || 'অর্ডার সাবমিট করতে সমস্যা হয়েছে, অনুগ্রহ করে আবার চেষ্টা করুন।');
    }
  };

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 min-h-screen pb-24 lg:pb-16 selection:bg-blue-600 selection:text-white">
      
      {/* Top sticky header aligned with Cart page design */}
      <div className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <button
            onClick={onCancel}
            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer group bg-transparent border-0"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:-translate-x-0.5 transition-transform" />
            <span>ফিরে যান (Go Back)</span>
          </button>

          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-400">নিরাপদ চেকআউট (Secure Checkout)</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        
        {/* Title Header matching Cart screen */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span>অর্ডার চেকআউট পেজ</span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase">
                  {orderType} order
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                অর্ডারটি সুরক্ষিতভাবে সম্পন্ন করতে আপনার তথ্য এবং পেমেন্ট সম্পন্ন করুন
              </p>
            </div>
          </div>
        </div>

        {/* Responsive grid container aligned with CartScreen */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-6">
          
          {/* Left Column: Input checkout form details (8 columns) */}
          <form onSubmit={handleFormSubmit} className="lg:col-span-8 space-y-6">
            
            {/* Box 1: Customer Details */}
            <div className="bg-slate-900/60 border border-slate-800/90 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center text-xs font-bold">১</span>
                <h3 className="font-extrabold text-sm sm:text-base text-white">গ্রাহক ও ডেলিভারি বিবরণ (Customer Info)</h3>
              </div>

              <div className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block mb-1">আপনার নাম (Full Name) *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="যেমন: John Doe"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-600 outline-none focus:border-blue-500 transition-all font-sans"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold flex items-center gap-1.5 mb-1">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span>মোবাইল নম্বর (Phone) *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="যেমন: 018XXXXXXXX"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-600 outline-none focus:border-blue-500 transition-all font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold flex items-center gap-1.5 mb-1">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      <span>ইমেইল এড্রেস (Email Address)</span>
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="যেমন: mail@domain.com"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-600 outline-none focus:border-blue-500 transition-all font-mono"
                    />
                  </div>
                </div>

                {/* Digital license warnings */}
                {orderType === 'digital' && (
                  <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-800/60 text-xs text-indigo-300 flex gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block mb-0.5">ডিজিটাল ডেলিভারি সতর্কতা (License Key Notice):</span>
                      আপনার ক্রয়কৃত লাইসেন্স কোড বা ডেলিভারি তথ্য অর্ডার ভেরিফাই হওয়া মাত্র স্ক্রিনে, এসএমএস এবং ডিজিটাল ভল্টে স্বয়ংক্রিয়ভাবে পৌঁছে যাবে।
                    </div>
                  </div>
                )}

                {/* Address selection for physical goods */}
                {hasPhysical && (
                  <div className="space-y-4 pt-4 border-t border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-rose-500" />
                        <span>ডেলিভারি ঠিকানা (Delivery Address) *</span>
                      </span>
                      
                      {savedAddress && (
                        <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-blue-400 font-bold">
                          <input
                            type="checkbox"
                            checked={useSavedAddress}
                            onChange={(e) => toggleSavedAddress(e.target.checked)}
                            className="rounded text-blue-600 border-slate-800 bg-slate-950"
                          />
                          <span>প্রোফাইল এড্রেস ব্যবহার করুন</span>
                        </label>
                      )}
                    </div>

                    {useSavedAddress && savedAddress && (
                      <div className="p-3 bg-blue-950/40 border border-blue-800/60 rounded-xl text-xs text-blue-300 space-y-1">
                        <span className="font-bold block">বাছাইকৃত ঠিকানা:</span>
                        <p>{savedAddress.addressDetails}, {savedAddress.area}, {savedAddress.city}, {savedAddress.district} - {savedAddress.postCode || ''}</p>
                      </div>
                    )}

                    <textarea
                      rows={3}
                      required={hasPhysical}
                      value={deliveryAddress}
                      onChange={(e) => {
                        setDeliveryAddress(e.target.value);
                        if (useSavedAddress) setUseSavedAddress(false);
                      }}
                      placeholder="আপনার বিস্তারিত হোম ডেলিভারি ঠিকানা লিখুন (যেমন: বাড়ি নং, রোড নং, এলাকা, জেলা)..."
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-600 outline-none focus:border-blue-500 transition-all font-sans"
                    />

                    {currentUser && (
                      <label className="flex items-center gap-2 text-slate-400 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={saveAddressForFuture}
                          onChange={(e) => setSaveAddressForFuture(e.target.checked)}
                          className="rounded text-blue-600 border-slate-800 bg-slate-950"
                        />
                        <span>ভবিষ্যতের চেকআউটের জন্য এই ঠিকানাটি প্রোফাইলে সংরক্ষণ করুন</span>
                      </label>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Box 2: Payment Gateway Selection with Strict Account Wallet Condition */}
            <div className="bg-slate-900/60 border border-slate-800/90 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center text-xs font-bold">২</span>
                <h3 className="font-extrabold text-sm sm:text-base text-white">পেমেন্ট মেথড নির্বাচন করুন (Payment Gateway)</h3>
              </div>

              <div className="space-y-4 text-xs">
                
                {/* STRICT wallet-only constraint if account purchase */}
                {isAccountPurchase ? (
                  <div className="p-4 bg-purple-950/45 border border-purple-800/60 text-xs text-purple-300 rounded-2xl font-bold leading-relaxed space-y-1.5 shadow-inner">
                    <div className="flex items-center gap-2 text-purple-400 text-sm font-black">
                      <ShieldAlert className="w-5 h-5 shrink-0" />
                      <span>অ্যাকাউন্ট ক্রয়ের পেমেন্ট পলিসি নোটিশ:</span>
                    </div>
                    <p className="mt-0.5">
                      নিরাপত্তা এবং ইনস্ট্যান্ট অন-স্ক্রিন ডেলিভারির স্বার্থে, **অ্যাকাউন্ট ক্রয়ের জন্য কেবল সিস্টেম ওয়ালেট (Wallet Balance) ব্যবহার করতে হবে।** 
                      বিকাশ বা নগদ দিয়ে সরাসরি অর্ডারের সুযোগ নেই। যদি আপনার ওয়ালেটে পর্যাপ্ত টাকা না থাকে, তবে অনুগ্রহ করে প্রফাইল থেকে আপনার ওয়ালেটে ফান্ড এড করুন।
                    </p>
                  </div>
                ) : (
                  <>
                    {restrictToCOD && (
                      <div className="p-3 bg-amber-950/40 border border-amber-800/60 text-amber-300 rounded-xl font-bold text-xs">
                        ℹ️ এই পণ্যটি কেবল ক্যাশ অন ডেলিভারি (COD) পেমেন্টে অর্ডারযোগ্য।
                      </div>
                    )}
                    {restrictToAdvance && (
                      <div className="p-3 bg-indigo-950/40 border border-indigo-800/60 text-indigo-300 rounded-xl font-bold text-xs">
                        ℹ️ এই পণ্যটি অর্ডারে বিকাশ/নগদ/রকেট অগ্রিম অনলাইন পেমেন্ট প্রযোজ্য।
                      </div>
                    )}
                  </>
                )}

                <div className="grid grid-cols-4 gap-2.5">
                  {/* Wallet Button */}
                  {(isAccountPurchase || currentUser) && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('wallet')}
                      className={`col-span-4 p-4 rounded-2xl border text-center font-bold cursor-pointer transition-all flex items-center justify-between gap-3.5 ${
                        paymentMethod === 'wallet'
                          ? 'border-purple-600 bg-purple-500/10 text-purple-300 ring-2 ring-purple-600/30'
                          : 'border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Wallet className="w-5.5 h-5.5 text-purple-400 shrink-0" />
                        <div className="text-left">
                          <span className="block text-xs font-black text-white">Pay with Wallet Balance (ওয়ালেট ব্যালেন্স)</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            আপনার ওয়ালেট থেকে ইনস্ট্যান্টলি মূল্য কেটে নেওয়া হবে।
                          </span>
                        </div>
                      </div>
                      <div className="text-right bg-purple-500/10 border border-purple-500/30 px-3 py-1 rounded-xl shrink-0">
                        <span className="text-[9px] text-slate-400 font-bold block uppercase">ওয়ালেট ব্যালেন্স:</span>
                        <span className="text-xs font-black text-purple-400">৳{walletBalance.toLocaleString()} BDT</span>
                      </div>
                    </button>
                  )}

                  {/* Other standard gateways only shown if NOT buying account */}
                  {!isAccountPurchase && (
                    <>
                      {/* ZiniPay Auto Secure Gateway */}
                      {!restrictToCOD && (
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('zinipay')}
                          className={`col-span-4 p-4 rounded-2xl border text-center font-bold cursor-pointer transition-all flex items-center gap-3.5 ${
                            paymentMethod === 'zinipay'
                              ? 'border-blue-500 bg-blue-500/10 text-blue-300 ring-2 ring-blue-500/30'
                              : 'border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-400'
                          }`}
                        >
                          <Sparkles className="w-5.5 h-5.5 text-amber-400 animate-pulse shrink-0" />
                          <div className="text-left flex-1">
                            <span className="block text-xs font-black text-white">ZiniPay Gateway (বিকাশ/নগদ অটো গেটওয়ে)</span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">বিকাশ, নগদ বা রকেট দিয়ে ১ ক্লিকে ইনস্ট্যান্ট পেমেন্ট ভেরিফিকেশন!</span>
                          </div>
                        </button>
                      )}

                      {/* Manual payment methods */}
                      {!restrictToCOD && (
                        <>
                          <button
                            type="button"
                            onClick={() => setPaymentMethod('bkash')}
                            className={`p-3 rounded-2xl border text-center font-bold cursor-pointer transition-all ${
                              paymentMethod === 'bkash'
                                ? 'border-pink-500 bg-pink-500/10 text-pink-300 ring-2 ring-pink-500/30'
                                : 'border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-400'
                            }`}
                          >
                            <span className="block text-sm">bKash</span>
                            <span className="text-[9px] text-slate-500 block mt-0.5">Manual Send</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setPaymentMethod('nagad')}
                            className={`p-3 rounded-2xl border text-center font-bold cursor-pointer transition-all ${
                              paymentMethod === 'nagad'
                                ? 'border-orange-500 bg-orange-500/10 text-orange-300 ring-2 ring-orange-500/30'
                                : 'border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-400'
                            }`}
                          >
                            <span className="block text-sm">Nagad</span>
                            <span className="text-[9px] text-slate-500 block mt-0.5">Manual Send</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setPaymentMethod('rocket')}
                            className={`p-3 rounded-2xl border text-center font-bold cursor-pointer transition-all ${
                              paymentMethod === 'rocket'
                                ? 'border-purple-500 bg-purple-500/10 text-purple-300 ring-2 ring-purple-500/30'
                                : 'border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-400'
                            }`}
                          >
                            <span className="block text-sm">Rocket</span>
                            <span className="text-[9px] text-slate-500 block mt-0.5">Manual Send</span>
                          </button>
                        </>
                      )}

                      {/* Cash on Delivery option */}
                      {!restrictToAdvance && (
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('cod')}
                          className={`p-3 rounded-2xl border text-center font-bold cursor-pointer transition-all ${
                            restrictToCOD ? 'col-span-4' : ''
                          } ${
                            paymentMethod === 'cod'
                              ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300 ring-2 ring-indigo-500/30'
                              : 'border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-400'
                          }`}
                        >
                          <span className="block text-sm">COD</span>
                          <span className="text-[9px] text-slate-500 block mt-0.5">Cash on Delivery</span>
                        </button>
                      )}
                    </>
                  )}
                </div>

                {/* Subsections: Displaying dynamic manual or wallet instruction details */}
                {paymentMethod !== 'cod' && paymentMethod !== 'zinipay' && paymentMethod !== 'wallet' ? (
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                    <h4 className="font-extrabold text-white text-xs">ম্যানুয়াল পেমেন্ট করার নিয়মাবলী:</h4>
                    <ol className="list-decimal list-inside space-y-1.5 text-slate-300 leading-relaxed text-[11px]">
                      <li>নিচের পার্সোনাল মার্চেন্ট নম্বরে **Send Money** করুন।</li>
                      <li>পেমেন্ট নম্বর: <span className="font-mono font-black text-white bg-slate-900 border border-slate-800 px-2 py-0.5 rounded ml-1 text-xs">{activePaymentNumber}</span>
                        <button
                          type="button"
                          onClick={handleCopy}
                          className="ml-2 font-bold text-blue-400 hover:text-blue-300 inline-flex items-center gap-0.5 text-[10px] cursor-pointer bg-transparent border-0"
                        >
                          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copied ? 'Copied' : 'নম্বর কপি করুন'}</span>
                        </button>
                      </li>
                      <li>মোট পাঠাতে হবে: <span className="font-black text-white text-xs">৳{finalTotalAmount.toLocaleString()} BDT</span></li>
                      <li>টাকা পাঠানোর পর কনফার্মেশন এসএমএস থেকে TrxID এবং প্রেরক নম্বর নিচে ইনপুট দিন।</li>
                    </ol>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3.5 border-t border-slate-800/80">
                      <div className="space-y-1">
                        <label className="text-slate-400 font-bold block mb-1">প্রেরক মোবাইল নম্বর (Sent From Phone)</label>
                        <input
                          type="text"
                          value={paymentPhone}
                          onChange={(e) => setPaymentPhone(e.target.value)}
                          placeholder="01XXXXXXXXX"
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-400 font-bold block mb-1">পেমেন্ট ট্রানজেকশন আইডি (TrxID) *</label>
                        <input
                          type="text"
                          required
                          value={trxId}
                          onChange={(e) => setTrxId(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                          placeholder="যেমন: K8B9N0M1L2"
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono font-bold outline-none focus:border-blue-500 placeholder:normal-case placeholder:font-normal placeholder:text-slate-600"
                        />
                      </div>
                    </div>
                  </div>
                ) : paymentMethod === 'zinipay' ? (
                  <div className="p-4 bg-blue-950/40 border border-blue-800/50 rounded-2xl text-[11px] text-blue-300 space-y-1 flex items-start gap-2.5">
                    <Sparkles className="w-4.5 h-4.5 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-extrabold block text-white">🛡️ ZiniPay Auto Secure Gateway:</span>
                      <p className="leading-relaxed mt-0.5">বিকাশ, নগদ বা রকেট অ্যাকাউন্ট দিয়ে পেমেন্ট গেটওয়ের মাধ্যমে স্বয়ংক্রিয় পরিশোধ করুন। পেমেন্ট হওয়া মাত্রই অর্ডারটি ইনস্ট্যান্টলি সম্পন্ন হয়ে যাবে।</p>
                    </div>
                  </div>
                ) : paymentMethod === 'wallet' ? (
                  <div className="p-4 bg-purple-950/40 border border-purple-800/50 rounded-2xl text-[11px] text-purple-300 space-y-1 flex items-start gap-2.5">
                    <Wallet className="w-4.5 h-4.5 text-purple-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span className="font-extrabold block text-white">💰 ওয়ালেট থেকে অর্থ পরিশোধ (Wallet System):</span>
                      <p className="leading-relaxed mt-0.5">
                        আপনার ওয়ালেট ব্যালেন্স থেকে মূল্য কেটে নেওয়া হবে। ওয়ালেট পেমেন্টে অর্ডারগুলো তাত্ক্ষণিক এপ্রুভ এবং অটো ডেলিভারি হয়ে যায়।
                      </p>
                      {isWalletBalanceInsufficient && (
                        <p className="text-rose-400 font-bold mt-2 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>আপনার ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই! সর্বমোট পরিশোধযোগ্য: ৳{finalTotalAmount.toLocaleString()} কিন্তু বর্তমান ব্যালেন্স: ৳{walletBalance.toLocaleString()}। অনুগ্রহ করে প্রথমে ফান্ড এড করুন।</span>
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-indigo-950/40 border border-indigo-800/50 rounded-2xl text-[11px] text-indigo-300 space-y-1">
                    <span className="font-extrabold block text-white">📦 Cash on Delivery (COD) Rules:</span>
                    <p className="leading-relaxed">ক্যাশ অন ডেলিভারিতে কোনো অগ্রিম ট্রানজেকশন দিতে হয় না। প্রোডাক্ট হাতে পেয়ে ডেলিভারি ম্যানকে পেমেন্ট বুঝিয়ে দিন।</p>
                  </div>
                )}

                <div className="space-y-1 pt-2">
                  <label className="text-slate-400 font-bold block mb-1">অর্ডার নোট / বিশেষ নির্দেশনা (Optional)</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="অর্ডার সম্পর্কিত কোনো অতিরিক্ত তথ্য বা বিশেষ নির্দেশনা থাকলে এখানে লিখুন..."
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-600 outline-none focus:border-blue-500 font-sans"
                  />
                </div>
              </div>
            </div>

            {/* Error indicators */}
            {errorMsg && (
              <div className="p-4 bg-rose-950/40 border border-rose-800 text-rose-300 rounded-2xl text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Submit checkout CTA button */}
            <button
              type="submit"
              disabled={isSubmitting || isWalletBalanceInsufficient}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-98 text-white font-extrabold text-sm sm:text-base rounded-2xl transition-all shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="animate-pulse">অর্ডারটি ভেরিফাই করা হচ্ছে, অপেক্ষা করুন...</span>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>
                    {isWalletBalanceInsufficient 
                      ? 'ওয়ালেটে পর্যাপ্ত অর্থ নেই (Insufficient Wallet Balance)' 
                      : `অর্ডার নিশ্চিত করুন (Pay ৳${finalTotalAmount.toLocaleString()})`
                    }
                  </span>
                </>
              )}
            </button>
          </form>

          {/* Right Column: Sticky summary aligned with CartScreen */}
          <div className="lg:col-span-4 space-y-4">
            
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5 sticky top-20 shadow-xl">
              <h2 className="font-extrabold text-base text-white border-b border-slate-800 pb-3 flex items-center justify-between">
                <span>অর্ডার সামারি (Summary)</span>
                <span className="text-xs font-mono font-normal text-slate-400">
                  {cartItems.length > 0 ? `${cartItems.reduce((acc, i) => acc + i.quantity, 0)} আইটেম` : '১ আইটেম'}
                </span>
              </h2>

              <div className="space-y-3.5 text-xs text-slate-300">
                <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-2xl">
                  <span className="text-[10px] text-slate-500 font-bold block mb-1">অর্ডারকৃত পণ্যসমূহ:</span>
                  <p className="font-bold text-slate-100 leading-snug">{itemsSummary}</p>
                </div>

                {/* Promo Code Coupon applied display inside summary */}
                <div className="pt-3 border-t border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold block mb-1.5 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-blue-500" />
                    <span>প্রোমো কোড / কুপন কোড</span>
                  </span>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                      placeholder="যেমন: WELORAL100"
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white uppercase placeholder:text-slate-600 outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer border border-slate-700"
                    >
                      প্রয়োগ
                    </button>
                  </div>

                  {couponSuccessMsg && (
                    <p className="text-[11px] font-bold text-emerald-400 mt-2 bg-emerald-950/40 border border-emerald-800/40 p-2.5 rounded-xl">{couponSuccessMsg}</p>
                  )}
                  {couponErrorMsg && (
                    <p className="text-[11px] font-bold text-rose-400 mt-2 bg-rose-950/40 border border-rose-800/40 p-2.5 rounded-xl">{couponErrorMsg}</p>
                  )}
                </div>

                {/* Calculations panel */}
                <div className="pt-4 border-t border-slate-800 space-y-2.5">
                  <div className="flex justify-between items-center text-slate-400">
                    <span>পণ্যের উপ-মোট মূল্য (Subtotal):</span>
                    <span className="font-mono font-bold text-white">৳{subtotalAmount.toLocaleString()}</span>
                  </div>
                  {hasPhysical && (
                    <div className="flex justify-between items-center text-slate-400">
                      <span>ডেলিভারি ফি (Delivery Charge):</span>
                      <span className="font-mono font-bold text-white">৳{deliveryFee.toLocaleString()}</span>
                    </div>
                  )}
                  {appliedDiscount > 0 && (
                    <div className="flex justify-between items-center text-emerald-400 bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-900/40">
                      <span className="font-semibold flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5" />
                        ডিসকাউন্ট ({appliedCoupon?.code}):
                      </span>
                      <span className="font-mono font-black">- ৳{appliedDiscount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline">
                    <div>
                      <span className="text-sm font-black text-white block">সর্বমোট পরিশোধযোগ্য:</span>
                      <span className="text-[10px] text-slate-500">ভ্যাট ও সার্ভিস চার্জ অন্তর্ভুক্ত</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xl sm:text-2xl font-black text-blue-400 font-mono">
                        ৳{finalTotalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Bottom secure payment guarantee tags */}
            <div className="p-4 bg-slate-900/50 border border-slate-800 text-center space-y-2 rounded-3xl">
              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>১০০% নিরাপদ ও এনক্রিপ্টেড পেমেন্ট গেটওয়ে</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Veloral Digital & Shop শতভাগ বিশ্বস্ত এবং দ্রুত পেমেন্ট প্রসেসিং নিশ্চিত করে। কোনো জিজ্ঞাসা বা পেমেন্ট ভেরিফিকেশনে সহায়তার জন্য সরাসরি আমাদের সাপোর্ট টিমকে হোয়াটসঅ্যাপ করুন।
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* Interactive Processing Countdown Animation Modal */}
      {isProcessingTimer && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-blue-500/30 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl text-center space-y-6 relative overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Ambient background glow */}
            <div className="absolute -top-12 -left-12 w-36 h-36 bg-blue-600/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-emerald-600/20 rounded-full blur-2xl pointer-events-none" />

            {/* Countdown circular display */}
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-slate-800"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={264}
                  strokeDashoffset={264 - (264 * (4 - countdown)) / 4}
                  strokeLinecap="round"
                  className="text-blue-500 transition-all duration-700 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {countdown > 0 ? (
                  <span className="text-3xl font-black font-mono text-white animate-pulse">
                    {countdown}
                  </span>
                ) : (
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 animate-in zoom-in duration-300" />
                )}
              </div>
            </div>

            {/* Status texts */}
            <div className="space-y-2">
              <h3 className="text-lg font-black text-white flex items-center justify-center gap-2">
                <span>{countdown === 0 ? 'অর্ডার নিশ্চিত হয়েছে!' : 'পেমেন্ট ও অর্ডার যাচাই হচ্ছে...'}</span>
              </h3>
              <p className="text-xs text-blue-300/90 font-medium min-h-[32px] flex items-center justify-center">
                {processingStatusText}
              </p>
            </div>

            {/* Payment badge details */}
            <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800/80 text-[11px] space-y-1.5">
              <div className="flex justify-between items-center text-slate-400">
                <span>পেমেন্ট মেথড:</span>
                <span className="font-bold text-white uppercase">{paymentMethod}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>মোট পরিশোধিত:</span>
                <span className="font-bold text-emerald-400 font-mono">৳{finalTotalAmount.toLocaleString()}</span>
              </div>
              {trxId && (
                <div className="flex justify-between items-center text-slate-400">
                  <span>TrxID:</span>
                  <span className="font-mono text-amber-300 truncate max-w-[150px]">{trxId}</span>
                </div>
              )}
            </div>

            {/* Trust badge */}
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>নিরাপদ ও এনক্রিপ্টেড ডাটাবেজ প্রসেসিং</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
