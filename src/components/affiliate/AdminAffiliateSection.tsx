import React, { useState, useEffect } from 'react';
import { AffiliateProduct, StoreSettings } from '../../types';
import { 
  fetchAffiliateProducts, saveAffiliateProduct, deleteAffiliateProduct, fetchAffiliateAnalytics 
} from '../../services/db';
import { 
  Plus, Edit, Trash2, Eye, ToggleLeft, ToggleRight, Star, 
  BarChart3, RefreshCw, Search, SlidersHorizontal, ArrowUpRight, Copy, Check, X, Upload 
} from 'lucide-react';

interface AdminAffiliateSectionProps {
  settings: StoreSettings;
  showToast: (msg: string) => void;
}

export const AdminAffiliateSection: React.FC<AdminAffiliateSectionProps> = ({
  settings,
  showToast,
}) => {
  const [products, setProducts] = useState<AffiliateProduct[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedFeatured, setSelectedFeatured] = useState<'all' | 'featured' | 'standard'>('all');

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AffiliateProduct | null>(null);
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formStoreName, setFormStoreName] = useState('Daraz BD');
  const [formCategoryId, setFormCategoryId] = useState('digital');
  const [formPrice, setFormPrice] = useState('');
  const [formOldPrice, setFormOldPrice] = useState('');
  const [formCurrency, setFormCurrency] = useState('BDT');
  const [formShortDesc, setFormShortDesc] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formAffiliateUrl, setFormAffiliateUrl] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formFeatured, setFormFeatured] = useState(false);
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active');
  const [formDisplayOrder, setFormDisplayOrder] = useState('0');

  const loadAdminAffiliateData = async () => {
    try {
      setLoading(true);
      const list = await fetchAffiliateProducts();
      setProducts(list);
      const stats = await fetchAffiliateAnalytics();
      setAnalytics(stats);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminAffiliateData();
  }, []);

  const handleNameChange = (name: string) => {
    setFormName(name);
    if (!editingProduct) {
      // Auto-generate slug from name
      const slug = name.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      setFormSlug(slug);
    }
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showToast('ছবির সাইজ ১০MB এর বেশি হতে পারবে না।');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const src = uploadEvent.target?.result as string;
      if (!src) return;

      // Compress via Canvas to max 800px width/height and 82% quality
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 800;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.82);
          setFormImage(compressed);
          showToast('প্রোডাক্ট ছবি প্রসেস ও আপলোড করা হয়েছে!');
        } else {
          setFormImage(src);
          showToast('প্রোডাক্ট ছবি আপলোড করা হয়েছে!');
        }
      };
      img.onerror = () => {
        setFormImage(src);
        showToast('প্রোডাক্ট ছবি আপলোড করা হয়েছে!');
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const handleOpenAddForm = () => {
    setEditingProduct(null);
    setFormName('');
    setFormSlug('');
    setFormImage('');
    setFormStoreName('Daraz BD');
    setFormCategoryId('digital');
    setFormPrice('');
    setFormOldPrice('');
    setFormCurrency('BDT');
    setFormShortDesc('');
    setFormDesc('');
    setFormAffiliateUrl('');
    setFormTags('');
    setFormFeatured(false);
    setFormStatus('active');
    setFormDisplayOrder('0');
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (prod: AffiliateProduct) => {
    setEditingProduct(prod);
    setFormName(prod.name);
    setFormSlug(prod.slug);
    setFormImage(prod.image || '');
    setFormStoreName(prod.store_name);
    setFormCategoryId(prod.category_id);
    setFormPrice(String(prod.price));
    setFormOldPrice(prod.old_price ? String(prod.old_price) : '');
    setFormCurrency(prod.currency || 'BDT');
    setFormShortDesc(prod.short_description || '');
    setFormDesc(prod.description || '');
    setFormAffiliateUrl(prod.affiliate_url);
    setFormTags(prod.tags || '');
    setFormFeatured(prod.featured);
    setFormStatus(prod.status);
    setFormDisplayOrder(String(prod.display_order));
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formSlug || !formPrice || !formAffiliateUrl) {
      showToast('সবগুলো প্রয়োজনীয় ক্ষেত্র পূরণ করুন!');
      return;
    }

    const payload: AffiliateProduct = {
      id: editingProduct ? editingProduct.id : `aff-${Date.now()}`,
      name: formName,
      slug: formSlug,
      image: formImage || undefined,
      store_name: formStoreName,
      category_id: formCategoryId,
      price: Number(formPrice),
      old_price: formOldPrice ? Number(formOldPrice) : undefined,
      currency: formCurrency,
      short_description: formShortDesc || undefined,
      description: formDesc || undefined,
      affiliate_url: formAffiliateUrl,
      tags: formTags || undefined,
      featured: formFeatured,
      status: formStatus,
      display_order: Number(formDisplayOrder),
      click_count: editingProduct ? editingProduct.click_count : 0,
    };

    try {
      await saveAffiliateProduct(payload);
      showToast(editingProduct ? 'অ্যাফিলিয়েট প্রোডাক্ট সফলভাবে আপডেট হয়েছে!' : 'অ্যাফিলিয়েট প্রোডাক্ট সফলভাবে যোগ করা হয়েছে!');
      setIsFormOpen(false);
      loadAdminAffiliateData();
    } catch (err) {
      showToast('অপারেশনটি ব্যর্থ হয়েছে!');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('আপনি কি নিশ্চিতভাবে এই অ্যাফিলিয়েট প্রোডাক্টটি মুছে ফেলতে চান?')) return;
    try {
      await deleteAffiliateProduct(id);
      showToast('অ্যাফিলিয়েট প্রোডাক্ট সফলভাবে মুছে ফেলা হয়েছে!');
      loadAdminAffiliateData();
    } catch (err) {
      showToast('অ্যাফিলিয়েট প্রোডাক্ট মুছতে সমস্যা হয়েছে!');
    }
  };

  const handleToggleStatus = async (prod: AffiliateProduct) => {
    const updated: AffiliateProduct = {
      ...prod,
      status: prod.status === 'active' ? 'inactive' : 'active',
    };
    await saveAffiliateProduct(updated);
    showToast('স্ট্যাটাস সফলভাবে পরিবর্তন হয়েছে!');
    loadAdminAffiliateData();
  };

  const handleToggleFeatured = async (prod: AffiliateProduct) => {
    const updated: AffiliateProduct = {
      ...prod,
      featured: !prod.featured,
    };
    await saveAffiliateProduct(updated);
    showToast('ফিচারড স্ট্যাটাস সফলভাবে পরিবর্তন হয়েছে!');
    loadAdminAffiliateData();
  };

  const handleDuplicate = async (prod: AffiliateProduct) => {
    const duplicated: AffiliateProduct = {
      ...prod,
      id: `aff-${Date.now()}`,
      name: `${prod.name} (Copy)`,
      slug: `${prod.slug}-copy-${Math.floor(Math.random() * 100)}`,
      click_count: 0,
    };
    await saveAffiliateProduct(duplicated);
    showToast('অ্যাফিলিয়েট প্রোডাক্টটি ডুপ্লিকেট করা হয়েছে!');
    loadAdminAffiliateData();
  };

  // Filter products for display in admin table
  const filteredProducts = products.filter(p => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = query === '' || 
      p.name.toLowerCase().includes(query) || 
      p.store_name.toLowerCase().includes(query);
    const matchesCategory = selectedCategory === 'all' || p.category_id === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || p.status === selectedStatus;
    const matchesFeatured = selectedFeatured === 'all' || 
      (selectedFeatured === 'featured' && p.featured) || 
      (selectedFeatured === 'standard' && !p.featured);

    return matchesSearch && matchesCategory && matchesStatus && matchesFeatured;
  });

  return (
    <div className="space-y-6 text-slate-100 font-sans">
      
      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-md">
            <div>
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">মোট প্রোডাক্ট</span>
              <span className="text-xl sm:text-2xl font-black text-white">{analytics.totalProducts}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold">
              📦
            </div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-md">
            <div>
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">সক্রিয় প্রোডাক্ট</span>
              <span className="text-xl sm:text-2xl font-black text-emerald-400">{analytics.activeProducts}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold">
              ✓
            </div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-md">
            <div>
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">ফিচারড প্রোডাক্ট</span>
              <span className="text-xl sm:text-2xl font-black text-amber-400">{analytics.featuredProducts}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Star className="w-5 h-5 fill-amber-400" />
            </div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-md">
            <div>
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">সর্বমোট ক্লিক (Clicks)</span>
              <span className="text-xl sm:text-2xl font-black text-purple-400">{analytics.totalClicks}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
              <BarChart3 className="w-5 h-5" />
            </div>
          </div>
        </div>
      )}

      {/* Main Table controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-400" />
              <span>Affiliate Products Management (অ্যাফিলিয়েট প্রোডাক্ট ম্যানেজমেন্ট)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">পার্টনার সাইটের অ্যাফিলিয়েট প্রোডাক্ট এবং রিডাইরেক্ট লিঙ্ক ম্যানেজ করুন</p>
          </div>

          <button
            onClick={handleOpenAddForm}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-lg shadow-blue-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>প্রোডাক্ট যোগ করুন</span>
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="সার্চ প্রোডাক্ট..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 placeholder:text-slate-600"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 font-bold"
          >
            <option value="all">সকল ক্যাটাগরি</option>
            <option value="digital">Digital Keys</option>
            <option value="physical">Physical Gadgets</option>
            <option value="gaming">Gaming</option>
            <option value="vpn">Premium VPN</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 font-bold"
          >
            <option value="all">সকল স্ট্যাটাস</option>
            <option value="active">Active (সক্রিয়)</option>
            <option value="inactive">Inactive (নিষ্ক্রিয়)</option>
          </select>

          <select
            value={selectedFeatured}
            onChange={(e) => setSelectedFeatured(e.target.value as any)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 font-bold"
          >
            <option value="all">ফিচারড ফিল্টার</option>
            <option value="featured">Featured Only</option>
            <option value="standard">Standard Only</option>
          </select>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-800/80 bg-slate-950/40 shadow-inner">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-black uppercase text-[10px] tracking-wider">
                <th className="p-3">Image</th>
                <th className="p-3">Product Name</th>
                <th className="p-3">Store</th>
                <th className="p-3">Price</th>
                <th className="p-3">Category</th>
                <th className="p-3 text-center">Clicks</th>
                <th className="p-3 text-center">Featured</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-10 text-center text-slate-500 font-bold">
                    কোনো অ্যাফিলিয়েট প্রোডাক্ট পাওয়া যায়নি!
                  </td>
                </tr>
              ) : (
                filteredProducts.map(p => (
                  <tr key={p.id} className="border-b border-slate-900 hover:bg-slate-900/30 transition-colors">
                    <td className="p-3">
                      <img
                        src={p.image}
                        alt=""
                        className="w-10 h-10 object-contain rounded bg-slate-950 border border-slate-800 p-1"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?q=80&w=1470&auto=format&fit=crop';
                        }}
                      />
                    </td>
                    <td className="p-3 font-bold max-w-xs truncate text-white">
                      {p.name}
                      <span className="block text-[10px] text-slate-500 font-mono">slug: /{p.slug}</span>
                    </td>
                    <td className="p-3 font-semibold text-slate-300 capitalize">{p.store_name}</td>
                    <td className="p-3 font-mono font-bold text-blue-400">৳{p.price}</td>
                    <td className="p-3 text-slate-400 capitalize">{p.category_id}</td>
                    <td className="p-3 text-center font-mono font-bold text-purple-400">{p.click_count || 0}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleToggleFeatured(p)}
                        className="mx-auto block text-slate-500 hover:text-amber-400 cursor-pointer transition-colors bg-transparent border-0"
                      >
                        <Star className={`w-4 h-4 ${p.featured ? 'fill-amber-400 text-amber-400' : ''}`} />
                      </button>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleToggleStatus(p)}
                        className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase cursor-pointer border ${
                          p.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}
                      >
                        {p.status}
                      </button>
                    </td>
                    <td className="p-3 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenEditForm(p)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 cursor-pointer inline-flex border border-slate-700/60"
                        title="সম্পাদনা করুন"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDuplicate(p)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-400 cursor-pointer inline-flex border border-slate-700/60"
                        title="ডুপ্লিকেট করুন"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900 text-rose-400 cursor-pointer inline-flex border border-rose-950/60"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Editor Modal / Form overlay */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleFormSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-black text-white">
                {editingProduct ? 'অ্যাফিলিয়েট প্রোডাক্ট এডিট করুন' : 'নতুন অ্যাফিলিয়েট প্রোডাক্ট যোগ করুন'}
              </h3>
              <button 
                type="button"
                onClick={() => setIsFormOpen(false)} 
                className="p-2 rounded-full bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block mb-1">Product Name (নাম) *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="যেমন: RealMe Air Earbuds"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block mb-1">Slug (এসইও-বান্ধব লিঙ্ক) *</label>
                  <input
                    type="text"
                    required
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="যেমন: realme-air-earbuds"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block mb-1">Store/Brand (স্টোর) *</label>
                  <input
                    type="text"
                    required
                    value={formStoreName}
                    onChange={(e) => setFormStoreName(e.target.value)}
                    placeholder="যেমন: Daraz, AliExpress"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block mb-1">Category (ক্যাটাগরি) *</label>
                  <select
                    value={formCategoryId}
                    onChange={(e) => setFormCategoryId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 font-bold"
                  >
                    <option value="digital">Digital Keys</option>
                    <option value="physical">Physical Gadgets</option>
                    <option value="gaming">Gaming</option>
                    <option value="vpn">Premium VPN</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block mb-1">Display Order (সাজানোর ক্রম)</label>
                  <input
                    type="number"
                    value={formDisplayOrder}
                    onChange={(e) => setFormDisplayOrder(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block mb-1">Current Price (বিক্রয় মূল্য) *</label>
                  <input
                    type="number"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="৳ 250"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 font-mono font-bold text-blue-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block mb-1">Old Price (আগের মূল্য/এমআরপি)</label>
                  <input
                    type="number"
                    value={formOldPrice}
                    onChange={(e) => setFormOldPrice(e.target.value)}
                    placeholder="৳ 500"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 font-mono text-slate-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block mb-1">Currency (মুদ্রা)</label>
                  <input
                    type="text"
                    value={formCurrency}
                    onChange={(e) => setFormCurrency(e.target.value)}
                    placeholder="BDT"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-slate-400 font-bold block mb-1">Product Image (প্রোডাক্ট ছবি) *</label>
                
                {/* Upload or URL options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label className="px-3 py-2 bg-slate-800 hover:bg-slate-750 active:scale-98 text-slate-200 rounded-xl text-xs font-bold cursor-pointer transition-all border border-slate-700/80 flex items-center justify-center gap-2">
                    <Upload className="w-4 h-4 text-blue-400" />
                    <span>গ্যালারি থেকে ফাইল আপলোড</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      className="hidden"
                    />
                  </label>

                  <div className="relative">
                    <input
                      type="text"
                      value={formImage}
                      onChange={(e) => setFormImage(e.target.value)}
                      placeholder="অথবা ছবির সরাসরি URL..."
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 font-mono text-xs"
                    />
                  </div>
                </div>

                {/* Live Preview if image is present */}
                {formImage && (
                  <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between gap-3 shadow-inner">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={formImage}
                        alt="Preview"
                        className="w-12 h-12 object-contain rounded-xl bg-slate-900 border border-slate-800 p-1 shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?q=80&w=1470&auto=format&fit=crop';
                        }}
                      />
                      <div className="min-w-0">
                        <span className="text-[10px] text-emerald-400 font-extrabold flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>ছবি সিলেক্ট করা হয়েছে</span>
                        </span>
                        <p className="text-[10px] text-slate-400 truncate font-mono mt-0.5">
                          {formImage.startsWith('data:') ? 'আপলোডকৃত ছবি ফাইল (Base64)' : formImage}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setFormImage('')}
                      className="px-2.5 py-1 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-400 text-[10px] font-bold cursor-pointer border border-rose-900 shrink-0"
                    >
                      মুছে ফেলুন
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold block mb-1">Affiliate URL (অ্যাফিলিয়েট ডেস্টিনেশন লিঙ্ক) *</label>
                <input
                  type="url"
                  required
                  value={formAffiliateUrl}
                  onChange={(e) => setFormAffiliateUrl(e.target.value)}
                  placeholder="https://daraz.com.bd/..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 font-mono text-blue-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold block mb-1">Short Description (সংক্ষিপ্ত বিবরণ)</label>
                <input
                  type="text"
                  value={formShortDesc}
                  onChange={(e) => setFormShortDesc(e.target.value)}
                  placeholder="যেমন: ১ স্ক্রিন শেয়ারড নেটফ্লিক্স সাবস্ক্রিপশন"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold block mb-1">Full Description (বিস্তারিত বিবরণ)</label>
                <textarea
                  rows={3}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="পণ্যটির বিস্তারিত বিবরণ এবং পার্টনার সাইটে ক্রয়ের নির্দেশনা এখানে লিখুন..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 font-sans"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 items-center pt-2">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block mb-1">Tags (ট্যাগসমূহ)</label>
                  <input
                    type="text"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    placeholder="netflix,sub,ott"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer pt-4 select-none font-bold text-slate-300">
                  <input
                    type="checkbox"
                    checked={formFeatured}
                    onChange={(e) => setFormFeatured(e.target.checked)}
                    className="rounded text-blue-600 border-slate-850 bg-slate-950 w-4 h-4"
                  />
                  <span>Featured Product?</span>
                </label>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block mb-1">Status (স্ট্যাটাস)</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 font-bold"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-300 font-bold text-xs cursor-pointer border border-slate-800"
              >
                বাতিল করুন
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs cursor-pointer shadow-lg shadow-blue-600/20"
              >
                {editingProduct ? 'হালনাগাদ করুন' : 'প্রোডাক্ট সংরক্ষণ করুন'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
