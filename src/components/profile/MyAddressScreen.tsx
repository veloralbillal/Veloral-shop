import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { ArrowLeft, MapPin, Save, CheckCircle2, ShieldCheck } from 'lucide-react';
import { SharedHeader } from '../SharedHeader';

interface MyAddressScreenProps {
  currentUser: User;
  onClose: () => void;
}

export const MyAddressScreen: React.FC<MyAddressScreenProps> = ({
  currentUser,
  onClose,
}) => {
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [addressDetails, setAddressDetails] = useState('');
  const [postCode, setPostCode] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // Load persisted address
    const saved = localStorage.getItem(`veloral_address_${currentUser.phone}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setDistrict(parsed.district || '');
        setCity(parsed.city || '');
        setArea(parsed.area || '');
        setAddressDetails(parsed.addressDetails || '');
        setPostCode(parsed.postCode || '');
      } catch (e) {
        console.error(e);
      }
    }
  }, [currentUser]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { district, city, area, addressDetails, postCode };
    localStorage.setItem(`veloral_address_${currentUser.phone}`, JSON.stringify(data));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <SharedHeader title="Delivery Address" onBack={onClose} />

      {/* Content */}
      <main className="flex-1 max-w-xl mx-auto w-full px-4 py-6 relative z-10 space-y-6">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 bg-blue-600/10 text-blue-400 border border-blue-500/20 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/5">
            <MapPin className="w-6 h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">My Delivery Address</h2>
          <p className="text-xs text-slate-400">Set your default shipping address for physical gadget and courier deliveries.</p>
        </div>

        <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold">District / State *</label>
              <input
                type="text"
                required
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="e.g. Dhaka, Chittagong"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold">City / Thana *</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Dhanmondi, Gulshan"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold">Area / Neighborhood *</label>
              <input
                type="text"
                required
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. Road 4, Block C"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold">Postal Code / Zip</label>
              <input
                type="text"
                value={postCode}
                onChange={(e) => setPostCode(e.target.value)}
                placeholder="e.g. 1212"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-slate-300 font-bold">Detailed Street Address *</label>
              <textarea
                rows={3}
                required
                value={addressDetails}
                onChange={(e) => setAddressDetails(e.target.value)}
                placeholder="House / flat number, road, nearby landmark..."
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm rounded-2xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Delivery Address</span>
          </button>

          {isSaved && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs rounded-xl flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Address saved successfully!</span>
            </div>
          )}
        </form>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 text-center text-xs text-slate-600 relative z-10 border-t border-slate-900 bg-slate-950/40">
        <div className="flex items-center justify-center gap-1 text-slate-500 mb-1">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>100% Encrypted & Secure Address Storage</span>
        </div>
        <p>© {new Date().getFullYear()} Veloral Digital & Shop. All rights reserved.</p>
      </footer>
    </div>
  );
};
