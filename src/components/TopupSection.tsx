import React, { useState } from 'react';
import { TopupItem } from '../types';
import { Flame, Shield, Smartphone, Zap, CheckCircle2, AlertCircle } from 'lucide-react';

interface TopupSectionProps {
  topupItems: TopupItem[];
  onSelectTopupForCheckout: (item: TopupItem, extra: { playerId: string; serverId?: string; operator?: string; rechargeType?: 'prepaid' | 'postpaid' }) => void;
}

export const TopupSection: React.FC<TopupSectionProps> = ({
  topupItems,
  onSelectTopupForCheckout,
}) => {
  const [activeTab, setActiveTab] = useState<'freefire' | 'pubg' | 'mobile_recharge'>('freefire');
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [playerId, setPlayerId] = useState<string>('');
  const [operator, setOperator] = useState<string>('Grameenphone');
  const [rechargeType, setRechargeType] = useState<'prepaid' | 'postpaid'>('prepaid');
  const [validationError, setValidationError] = useState<string>('');

  const currentItems = topupItems.filter((item) => item.game === activeTab);
  const selectedItem = topupItems.find((item) => item.id === selectedItemId);

  const operators = [
    { id: 'Grameenphone', name: 'Grameenphone (GP)' },
    { id: 'Banglalink', name: 'Banglalink (BL)' },
    { id: 'Robi', name: 'Robi Axiata' },
    { id: 'Airtel', name: 'Airtel BD' },
    { id: 'Teletalk', name: 'Teletalk (Gov)' },
  ];

  const handleProceed = () => {
    if (!selectedItem) {
      setValidationError('Please select a top-up package.');
      return;
    }

    if (!playerId.trim()) {
      if (activeTab === 'mobile_recharge') {
        setValidationError('Please enter your 11-digit mobile number.');
      } else {
        setValidationError('Please enter your Player ID (UID).');
      }
      return;
    }

    if (activeTab === 'mobile_recharge' && !/^(01[3-9]\d{8})$/.test(playerId.trim().replace(/\D/g, ''))) {
      setValidationError('Please enter a valid 11-digit Bangladeshi mobile number (e.g., 017xxxxxxxx).');
      return;
    }

    setValidationError('');
    onSelectTopupForCheckout(selectedItem, {
      playerId: playerId.trim(),
      operator: activeTab === 'mobile_recharge' ? operator : undefined,
      rechargeType: activeTab === 'mobile_recharge' ? rechargeType : undefined,
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-4 sm:p-8 max-w-full overflow-hidden">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
        <span className="text-[11px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
          Instant Auto Top-Up & Recharge
        </span>
        <h2 className="text-xl sm:text-3xl font-black text-slate-900 mt-2">
          Game Diamonds, UC & Mobile Recharge
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Enter your Game UID or Mobile Number and receive instant balance within 5-15 minutes.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-center gap-1.5 sm:gap-3 max-w-lg mx-auto mb-6 sm:mb-8">
        <button
          onClick={() => {
            setActiveTab('freefire');
            setSelectedItemId('');
            setValidationError('');
          }}
          className={`flex-1 py-2.5 sm:py-3 px-2 sm:px-4 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 border-2 transition-all cursor-pointer ${
            activeTab === 'freefire'
              ? 'border-amber-500 bg-amber-50 text-amber-950 shadow-xs'
              : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
          }`}
        >
          <Flame className={`w-3.5 h-3.5 ${activeTab === 'freefire' ? 'text-amber-500' : 'text-slate-400'}`} />
          <span>Free Fire</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('pubg');
            setSelectedItemId('');
            setValidationError('');
          }}
          className={`flex-1 py-2.5 sm:py-3 px-2 sm:px-4 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 border-2 transition-all cursor-pointer ${
            activeTab === 'pubg'
              ? 'border-indigo-600 bg-indigo-50 text-indigo-950 shadow-xs'
              : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
          }`}
        >
          <Shield className={`w-3.5 h-3.5 ${activeTab === 'pubg' ? 'text-indigo-600' : 'text-slate-400'}`} />
          <span>PUBG Mobile</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('mobile_recharge');
            setSelectedItemId('');
            setValidationError('');
          }}
          className={`flex-1 py-2.5 sm:py-3 px-2 sm:px-4 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 border-2 transition-all cursor-pointer ${
            activeTab === 'mobile_recharge'
              ? 'border-emerald-600 bg-emerald-50 text-emerald-950 shadow-xs'
              : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
          }`}
        >
          <Smartphone className={`w-3.5 h-3.5 ${activeTab === 'mobile_recharge' ? 'text-emerald-600' : 'text-slate-400'}`} />
          <span>Mobile Recharge</span>
        </button>
      </div>

      {/* Input Section */}
      <div className="max-w-xl mx-auto bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 mb-6 sm:mb-8">
        {activeTab === 'mobile_recharge' ? (
          <div className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Select Mobile Operator:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {operators.map((op) => (
                  <button
                    key={op.id}
                    type="button"
                    onClick={() => setOperator(op.id)}
                    className={`p-2 rounded-xl text-xs font-bold border transition-all text-left flex items-center justify-between cursor-pointer ${
                      operator === op.id
                        ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-500/20'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    <span className="truncate">{op.name}</span>
                    {operator === op.id && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 ml-1" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Mobile Number (11 Digits):
                </label>
                <input
                  type="tel"
                  placeholder="017XXXXXXXX"
                  value={playerId}
                  onChange={(e) => setPlayerId(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 focus:border-blue-500 rounded-xl outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Connection Type:
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setRechargeType('prepaid')}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      rechargeType === 'prepaid'
                        ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    Prepaid
                  </button>
                  <button
                    type="button"
                    onClick={() => setRechargeType('postpaid')}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      rechargeType === 'postpaid'
                        ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    Postpaid
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              {activeTab === 'freefire' ? 'Free Fire Player UID:' : 'PUBG Mobile Player ID:'}
            </label>
            <input
              type="text"
              placeholder={activeTab === 'freefire' ? 'e.g. 284910284' : 'e.g. 5123456789'}
              value={playerId}
              onChange={(e) => setPlayerId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 focus:border-blue-500 rounded-xl outline-none font-mono"
            />
            <p className="text-[10px] sm:text-[11px] text-slate-500 mt-1">
              * Please copy the Player UID directly from your in-game profile.
            </p>
          </div>
        )}
      </div>

      {/* Package Selection */}
      <div className="max-w-3xl mx-auto">
        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2.5">
          Select Package:
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3">
          {currentItems.map((item) => {
            const isSelected = selectedItemId === item.id;
            return (
              <div
                key={item.id}
                onClick={() => {
                  setSelectedItemId(item.id);
                  setValidationError('');
                }}
                className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between relative ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/70 shadow-sm ring-1 ring-blue-500/20'
                    : 'border-slate-200 hover:border-blue-300 bg-white'
                }`}
              >
                <div>
                  <div className="text-xs sm:text-sm font-extrabold text-slate-900">
                    {item.amount_label}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                    {item.name}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-baseline justify-between">
                  <span className="text-sm sm:text-base font-black text-slate-900">
                    ৳{item.price}
                  </span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {isSelected ? 'Selected' : 'Select'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {validationError && (
          <div className="mt-4 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2 max-w-md mx-auto">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Footer Checkout Bar */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 max-w-lg mx-auto">
          <div className="text-center sm:text-left">
            <div className="text-[11px] text-slate-500">Payable Total:</div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">
              ৳{selectedItem ? selectedItem.price : 0}
            </div>
          </div>

          <button
            onClick={handleProceed}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Zap className="w-4 h-4 text-amber-300" />
            <span>Pay & Complete Top-Up</span>
          </button>
        </div>
      </div>
    </div>
  );
};
