import React, { useState } from 'react';
import { AccountItem } from '../../types';
import { Plus, Edit, Trash2, ShieldCheck, Zap, X, Save, Image as ImageIcon, Upload, Link as LinkIcon, Check } from 'lucide-react';

interface AdminAccountManagerProps {
  accounts: AccountItem[];
  onSaveAccounts: (accounts: AccountItem[]) => void;
  showToast: (msg: string) => void;
}

const CATEGORY_PRESETS: Record<string, string> = {
  whatsapp: 'https://cdn-icons-png.flaticon.com/512/733/733585.png',
  telegram: 'https://cdn-icons-png.flaticon.com/512/2111/2111646.png',
  facebook: 'https://cdn-icons-png.flaticon.com/512/733/733547.png',
  gmail: 'https://cdn-icons-png.flaticon.com/512/281/281764.png',
  netflix: 'https://cdn-icons-png.flaticon.com/512/2504/2504929.png',
  other: 'https://cdn-icons-png.flaticon.com/512/1068/1068778.png',
};

export const AdminAccountManager: React.FC<AdminAccountManagerProps> = ({
  accounts,
  onSaveAccounts,
  showToast,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AccountItem | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('whatsapp');
  const [price, setPrice] = useState<number>(300);
  const [discountPrice, setDiscountPrice] = useState<number>(500);
  const [imageUrl, setImageUrl] = useState('');
  const [uploadMode, setUploadMode] = useState<'upload' | 'url'>('upload');
  const [description, setDescription] = useState('');
  const [stock, setStock] = useState<number>(20);
  const [accountCredentials, setAccountCredentials] = useState('');
  const [badge, setBadge] = useState('Verified');

  const openAddModal = () => {
    setEditingAccount(null);
    setTitle('');
    setCategory('whatsapp');
    setPrice(300);
    setDiscountPrice(500);
    setImageUrl(CATEGORY_PRESETS['whatsapp']);
    setUploadMode('upload');
    setDescription('');
    setStock(20);
    setAccountCredentials('');
    setBadge('Verified');
    setIsModalOpen(true);
  };

  const openEditModal = (acc: AccountItem) => {
    setEditingAccount(acc);
    setTitle(acc.title);
    setCategory(acc.category);
    setPrice(acc.price);
    setDiscountPrice(acc.discount_price || acc.price * 1.5);
    setImageUrl(acc.image_url);
    setUploadMode(acc.image_url.startsWith('data:image') ? 'upload' : 'url');
    setDescription(acc.description);
    setStock(acc.stock);
    setAccountCredentials(acc.account_credentials);
    setBadge(acc.badge || 'Verified');
    setIsModalOpen(true);
  };

  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    // If the image is currently a default preset or empty, update to the new preset
    if (!imageUrl || Object.values(CATEGORY_PRESETS).includes(imageUrl)) {
      setImageUrl(CATEGORY_PRESETS[newCat] || CATEGORY_PRESETS['other']);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast('ছবির সাইজ ২MB এর কম হতে হবে।');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      setImageUrl(result);
      showToast('ছবি সফলভাবে আপলোড করা হয়েছে!');
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price || !accountCredentials) {
      showToast('দয়া করে শিরোনাম, মূল্য এবং অ্যাকাউন্ট ক্রেডেনশিয়াল পূরণ করুন।');
      return;
    }

    const finalImage = imageUrl || CATEGORY_PRESETS[category] || CATEGORY_PRESETS['other'];

    const newItem: AccountItem = {
      id: editingAccount ? editingAccount.id : 'acc_' + Date.now(),
      product_code: editingAccount?.product_code || 'ACC-' + Math.floor(1000 + Math.random() * 9000),
      title,
      category,
      price: Number(price),
      discount_price: discountPrice ? Number(discountPrice) : undefined,
      image_url: finalImage,
      description,
      stock: Number(stock),
      account_credentials: accountCredentials,
      badge,
    };

    let updated: AccountItem[];
    if (editingAccount) {
      updated = accounts.map(a => a.id === editingAccount.id ? newItem : a);
      showToast('অ্যাকাউন্ট সফলভাবে আপডেট করা হয়েছে!');
    } else {
      updated = [newItem, ...accounts];
      showToast('নতুন অ্যাকাউন্ট সফলভাবে যুক্ত করা হয়েছে!');
    }

    onSaveAccounts(updated);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('আপনি কি নিশ্চিত এই অ্যাকাউন্টটি মুছে ফেলতে চান?')) {
      const updated = accounts.filter(a => a.id !== id);
      onSaveAccounts(updated);
      showToast('অ্যাকাউন্ট মুছে ফেলা হয়েছে।');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-3xl">
        <div>
          <h2 className="text-lg font-black text-white">অ্যাকাউন্ট বাই & সেল ম্যানেজমেন্ট (Accounts)</h2>
          <p className="text-xs text-slate-400">WhatsApp, Telegram, Facebook, Gmail, Netflix ইত্যাদি অ্যাকাউন্ট যোগ ও এডিট করুন। সরাসরি ডিভাইস থেকে ছবি আপলোড সাপোর্ট করে।</p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-blue-600/30 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন অ্যাকাউন্ট যোগ করুন</span>
        </button>
      </div>

      {/* Accounts List Table / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map(acc => (
          <div key={acc.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-4 shadow-md">
            <div className="flex items-start gap-3">
              <img src={acc.image_url} alt={acc.title} className="w-12 h-12 object-contain rounded-xl bg-slate-950 p-1 border border-slate-800 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">{acc.category}</span>
                  <span className="text-[10px] text-slate-400 font-mono">Stock: {acc.stock}</span>
                </div>
                <h4 className="font-bold text-white text-xs truncate mt-1">{acc.title}</h4>
                <p className="text-xs font-black text-blue-400 mt-0.5">৳{acc.price}</p>
              </div>
            </div>

            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 font-mono text-[10px] text-slate-300 truncate">
              <span className="text-slate-500">Credentials:</span> {acc.account_credentials.substring(0, 35)}...
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => openEditModal(acc)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5 text-blue-400" /> <span>এডিট</span>
              </button>
              <button
                onClick={() => handleDelete(acc.id)}
                className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold flex items-center gap-1 cursor-pointer border border-rose-500/20"
              >
                <Trash2 className="w-3.5 h-3.5" /> <span>ডিলিট</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-5 text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-black text-white">
                {editingAccount ? 'অ্যাকাউন্ট এডিট করুন' : 'নতুন অ্যাকাউন্ট যোগ করুন'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">অ্যাকাউন্টের শিরোনাম (Title)</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="যেমন- Aged WhatsApp Business Account"
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">ক্যাটাগরি (Category)</label>
                  <select
                    value={category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="whatsapp">WhatsApp</option>
                    <option value="telegram">Telegram</option>
                    <option value="facebook">Facebook</option>
                    <option value="gmail">Gmail</option>
                    <option value="netflix">Netflix / OTT</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">স্টক পরিমাণ (Stock)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Direct Image Upload / URL Mode */}
              <div className="space-y-2 p-3 bg-slate-950 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                    <span>অ্যাকাউন্টের ছবি (Image Upload)</span>
                  </label>
                  <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setUploadMode('upload')}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                        uploadMode === 'upload' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      ডাইরেক্ট আপলোড
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadMode('url')}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                        uploadMode === 'url' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      ইমেজ লিংক
                    </button>
                  </div>
                </div>

                {uploadMode === 'upload' ? (
                  <div className="space-y-2">
                    <label className="border-2 border-dashed border-slate-800 hover:border-blue-500 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-slate-900/50">
                      <Upload className="w-6 h-6 text-blue-400" />
                      <div className="text-center">
                        <span className="text-xs font-bold text-slate-200">ডিভাইস থেকে ছবি বেছে নিন</span>
                        <p className="text-[10px] text-slate-500">PNG, JPG, WEBP (সর্বোচ্চ 2MB)</p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://images.example.com/logo.png"
                      className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500"
                    />
                  </div>
                )}

                {/* Image Preview & Quick Presets */}
                {imageUrl && (
                  <div className="flex items-center gap-3 pt-1">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="w-12 h-12 object-contain rounded-xl bg-slate-900 border border-slate-800 p-1 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-slate-300">ইমেজ প্রিভিউ সক্রিয়</p>
                      <button
                        type="button"
                        onClick={() => setImageUrl(CATEGORY_PRESETS[category] || CATEGORY_PRESETS['other'])}
                        className="text-[10px] text-blue-400 hover:underline"
                      >
                        ডিফল্ট আইকনে রিসেট করুন
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">মূল্য (Price BDT)</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">পূর্বের মূল্য (Discount Price)</label>
                  <input
                    type="number"
                    value={discountPrice}
                    onChange={(e) => setDiscountPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">অ্যাকাউন্ট ক্রেডেনশিয়াল / লগইন তথ্য (ইনস্ট্যান্ট ডেলিভারির জন্য)</label>
                <textarea
                  rows={3}
                  required
                  value={accountCredentials}
                  onChange={(e) => setAccountCredentials(e.target.value)}
                  placeholder="Number / Email / Password / Session / PIN..."
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">বিবরণ (Description)</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="অ্যাকাউন্টের বিস্তারিত বিবরণ..."
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>সংরক্ষণ করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
