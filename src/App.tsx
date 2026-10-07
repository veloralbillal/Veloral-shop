import React, { useState, useEffect } from 'react';
import { 
  Product, TopupItem, Order, AliExpressDemandOrder, 
  ProductCategory, StoreSettings, CartItem, OrderStatus, User,
  StoreEvent, CustomCategory, SubCategory, Coupon, Review, AccountItem, OfferItem, OfferSubmission, AffiliateProduct
} from './types';
import { 
  fetchProducts, fetchOrders, fetchAliExpressOrders, 
  fetchStoreSettings, saveStoreSettings, getTopupCatalog,
  createNewOrder, createAliExpressOrder, updateOrderStatus, 
  updateAliExpressOrderStatus, addProduct, removeProduct, updateProduct,
  checkDbConnection, getCurrentUser, logoutUser, startAutoSync,
  fetchEvents, fetchCategories, fetchSubCategories,
  addEvent, updateEvent, deleteEvent,
  saveCategory, deleteCategory,
  saveSubCategory, deleteSubCategory,
  saveCoupons, deleteCoupon,
  initializeDatabaseTables, fetchUsers, getLocalProducts,
  fetchReviews, addReview, deleteReview, fetchAccounts, saveAccounts,
  fetchOffers, saveOffers, fetchOfferSubmissions, saveOfferSubmissions,
  fetchAffiliateProducts, getLocalOrders, getLocalAliExpressOrders, getStoredUsers, getLocalReviews, getLocalSettings
} from './services/db';
import { AccountMarketplace } from './components/accounts/AccountMarketplace';
import { AccountDetailScreen } from './components/accounts/AccountDetailScreen';
import { AffiliateProductsPage } from './components/affiliate/AffiliateProductsPage';
import { AffiliateProductDetailScreen } from './components/affiliate/AffiliateProductDetailScreen';
import { OffersSection } from './components/offers/OffersSection';
import { INITIAL_SETTINGS, INITIAL_PRODUCTS } from './services/initialData';
import { Navbar } from './components/Navbar';
import { BannerNotice } from './components/BannerNotice';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { ProductDetailScreen } from './components/ProductDetailScreen';
import { TopupSection } from './components/TopupSection';
import { AliExpressOrderForm } from './components/AliExpressOrderForm';
import { CartModal } from './components/CartModal';
import { CartScreen } from './components/CartScreen';
import { CheckoutModal } from './components/CheckoutModal';
import { CheckoutScreen } from './components/CheckoutScreen';
import { OrderTrackerScreen } from './components/OrderTrackerScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { MyAddressScreen } from './components/profile/MyAddressScreen';
import { MyOrdersScreen } from './components/profile/MyOrdersScreen';
import { MyLicensesScreen } from './components/profile/MyLicensesScreen';
import { SupportScreen } from './components/profile/SupportScreen';
import { MyWalletScreen } from './components/profile/MyWalletScreen';
import { SidebarMenu } from './components/SidebarMenu';
import { AdminScreen } from './components/AdminScreen';
import { AuthScreen } from './components/AuthScreen';
import { LandingPage } from './components/LandingPage';
import { EventPopup } from './components/EventPopup';
import { ProductsPage } from './components/ProductsPage';
import { GlobalSkeletonLoader } from './components/GlobalSkeletonLoader';
import { getAppUrlState, updateAppUrl } from './utils/urlUtils';
import { 
  Zap, Truck, Smartphone, Globe, 
  CheckCircle2, ArrowRight, Sparkles, Inbox, ShoppingBag, X, Flame, Award, MessageCircle,
  ShieldCheck, PackageCheck, Grid, User as UserIcon, Gift, Shield
} from 'lucide-react';

export default function App() {
  const [activeCategory, setActiveCategory] = useState<ProductCategory>('all');
  const [activeSubCategory, setActiveSubCategory] = useState<string>('all');
  const [activePromoFilter, setActivePromoFilter] = useState<'all' | 'flash_sale' | 'hot_sale' | 'for_you' | 'loot_offer' | 'featured'>('all');
  const [products, setProducts] = useState<Product[]>(getLocalProducts());
  const [affiliateProducts, setAffiliateProducts] = useState<AffiliateProduct[]>([]);
  const [accounts, setAccounts] = useState<AccountItem[]>(fetchAccounts());
  const [offers, setOffers] = useState<OfferItem[]>(fetchOffers());
  const [offerSubmissions, setOfferSubmissions] = useState<OfferSubmission[]>(fetchOfferSubmissions());
  const [orders, setOrders] = useState<Order[]>(() => getLocalOrders());
  const [aliExpressOrders, setAliExpressOrders] = useState<AliExpressDemandOrder[]>(() => getLocalAliExpressOrders());
  const [users, setUsers] = useState<User[]>(() => {
    const stored = getStoredUsers();
    return stored.map(u => ({ id: u.id, name: u.name, phone: u.phone, email: u.email, role: u.role, created_at: u.created_at, wallet_balance: u.wallet_balance }));
  });
  const [reviews, setReviews] = useState<Review[]>(() => getLocalReviews());
  const [topupCatalog, setTopupCatalog] = useState<TopupItem[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(() => getLocalSettings());
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // User Auth & Landing Page Routing State
  const [currentUser, setCurrentUser] = useState<User | null>(getCurrentUser());
  const [currentView, setCurrentView] = useState<'landing' | 'auth' | 'store' | 'products' | 'admin' | 'profile' | 'tracker' | 'profile-address' | 'profile-orders' | 'profile-licenses' | 'profile-support' | 'profile-wallet' | 'cart' | 'product-detail' | 'account-detail' | 'affiliate-deals' | 'affiliate-detail'>(currentUser ? 'store' : 'landing');
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [dbStatus, setDbStatus] = useState<any>(null);

  // Modals state
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<Product | null>(null);
  const [selectedAccountForDetail, setSelectedAccountForDetail] = useState<AccountItem | null>(null);
  const [selectedAffiliateProduct, setSelectedAffiliateProduct] = useState<AffiliateProduct | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [directProductCheckout, setDirectProductCheckout] = useState<{ item: Product; quantity: number } | undefined>(undefined);
  const [directTopupCheckout, setDirectTopupCheckout] = useState<{ item: TopupItem; extra: any } | undefined>(undefined);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [trackOrderNumber, setTrackOrderNumber] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isEventPopupDismissed, setIsEventPopupDismissed] = useState(() => {
    try {
      return sessionStorage.getItem('veloral_event_dismissed') === 'true';
    } catch {
      return false;
    }
  });
  const [lastPopupId, setLastPopupId] = useState<string | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const loadData = async () => {
    try {
      // Non-blocking background database verification
      initializeDatabaseTables().catch(() => {});

      const [sett, evts, cats, subCats, prods, ords, aliOrds, usrs, revs] = await Promise.all([
        fetchStoreSettings(),
        fetchEvents(),
        fetchCategories(),
        fetchSubCategories(),
        fetchProducts(),
        fetchOrders(),
        fetchAliExpressOrders(),
        fetchUsers(),
        fetchReviews()
      ]);

      const mergedSettings = {
        ...sett,
        events: (evts && evts.length > 0) ? evts : (sett.events && sett.events.length > 0 ? sett.events : INITIAL_SETTINGS.events),
        custom_categories: (cats && cats.length > 0) ? cats : (sett.custom_categories && sett.custom_categories.length > 0 ? sett.custom_categories : INITIAL_SETTINGS.custom_categories),
        sub_categories: (subCats && subCats.length > 0) ? subCats : (sett.sub_categories && sett.sub_categories.length > 0 ? sett.sub_categories : INITIAL_SETTINGS.sub_categories)
      };
      setSettings(mergedSettings);

      if (prods && prods.length > 0) {
        setProducts(prods);
      }
      if (ords && ords.length > 0) {
        setOrders(ords);
      }
      if (aliOrds && aliOrds.length > 0) {
        setAliExpressOrders(aliOrds);
      }
      if (usrs && usrs.length > 0) {
        setUsers(usrs);
      }
      if (revs && revs.length > 0) {
        setReviews(revs);
      }

      fetchAffiliateProducts().then(setAffiliateProducts);
      
      setTopupCatalog(getTopupCatalog());
      setAccounts(fetchAccounts());
      setOffers(fetchOffers());
      setOfferSubmissions(fetchOfferSubmissions());
      setCurrentUser(getCurrentUser());

      // Reset dismissal if a new popup is activated in the same session
      if (mergedSettings.active_event_popup_id) {
        if (mergedSettings.active_event_popup_id !== lastPopupId) {
          setLastPopupId(mergedSettings.active_event_popup_id);
          setIsEventPopupDismissed(false);
          try { sessionStorage.removeItem('veloral_event_dismissed'); } catch {}
        }
      } else {
        setLastPopupId(null);
      }

      // Read GitHub Pages SPA 404 redirect query parameter 'p' for deep linking
      const urlParams = new URLSearchParams(window.location.search);
      const redirectPath = urlParams.get('p');
      if (redirectPath) {
        // Clean query parameter 'p' from browser history while retaining any other parameters
        const cleanUrl = new URL(window.location.href);
        cleanUrl.searchParams.delete('p');
        window.history.replaceState(null, '', cleanUrl.toString());

        const normalizedPath = redirectPath.toLowerCase().trim().replace(/^\/+|\/+$/g, '');
        if (normalizedPath === 'admin') {
          setCurrentView('admin');
        } else if (normalizedPath === 'products') {
          setCurrentView('products');
        } else if (normalizedPath === 'cart') {
          setCurrentView('cart');
        } else if (normalizedPath === 'profile' || normalizedPath === 'user') {
          setCurrentView('profile');
        } else if (normalizedPath === 'orders' || normalizedPath === 'profile-orders') {
          setCurrentView('profile-orders');
        } else if (normalizedPath === 'tracker') {
          setCurrentView('tracker');
        } else if (normalizedPath === 'affiliate-deals') {
          setCurrentView('affiliate-deals');
        } else if (normalizedPath === 'auth') {
          setCurrentView('auth');
        } else if (normalizedPath === 'store' || normalizedPath === 'home') {
          setCurrentView('store');
        }
      }

      // Check for order_id query parameter to support Order Tracker deep linking
      const orderIdParam = urlParams.get('order_id');
      if (orderIdParam) {
        setTrackOrderNumber(orderIdParam);
        setCurrentView('tracker');
      }

      // Extract URL parameters for deep linking or shared hosting
      const urlState = getAppUrlState();
      if (urlState.page === 'products') {
        setCurrentView('products');
      }

      const params = new URLSearchParams(window.location.search);
      const prodId = params.get('product');
      if (prodId) {
        // We'll handle this in the fetchProducts.then callback for reliability
        fetchProducts().then(prods => {
          const found = prods.find((p) => p.id === prodId);
          if (found) {
            setSelectedProductForDetail(found);
            setCurrentView('product-detail');
          }
        });
      }

      const accId = params.get('account');
      if (accId) {
        const foundAcc = fetchAccounts().find(a => a.id === accId);
        if (foundAcc) {
          setSelectedAccountForDetail(foundAcc);
          setCurrentView('account-detail');
        }
      }

      const affId = params.get('aff_product');
      if (affId) {
        fetchAffiliateProducts().then((affs: AffiliateProduct[]) => {
          const found = affs.find((a: AffiliateProduct) => a.id === affId);
          if (found) {
            setSelectedAffiliateProduct(found);
            setCurrentView('affiliate-detail');
          }
        });
      }
    } catch (e) {
      console.error('Failed to load initial data:', e);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    loadData();
    
    // Handle device/browser back button
    const handlePopState = (event: PopStateEvent) => {
      const params = new URLSearchParams(window.location.search);
      const prodId = params.get('product');
      if (!prodId) {
        setSelectedProductForDetail(null);
      }
      
      if (isCheckoutOpen) {
        setIsCheckoutOpen(false);
        return;
      }

      if (isCartOpen) {
        setIsCartOpen(false);
        return;
      }

      // Handle sub-views returning to main store
      if (currentView !== 'store' && currentView !== 'landing') {
        setCurrentView('store');
        return;
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    // Continuous background auto-sync without any manual button click needed
    const stopAutoSync = startAutoSync((status) => {
      setDbStatus(status);
    });
    return () => {
      window.removeEventListener('popstate', handlePopState);
      stopAutoSync();
    };
  }, []);

  // Update HTML Document Title and Meta Description for dynamic SEO compliance
  useEffect(() => {
    if (settings) {
      if (settings.seo_title) {
        document.title = settings.seo_title;
      }
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc && settings.seo_description) {
        metaDesc.setAttribute('content', settings.seo_description);
      }
    }
  }, [settings]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Cart Handlers
  const handleAddToCart = (product: Product, quantity: number = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    showToast(`✓ "${product.title}" added to cart!`);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    setCartItems((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i))
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const handleDirectBuy = (product: Product, quantity: number = 1) => {
    setDirectProductCheckout({ item: product, quantity });
    setDirectTopupCheckout(undefined);
    setIsCheckoutOpen(true);
    setSelectedProductForDetail(null);
    
    // Remove URL parameter safely
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.has('product')) {
        url.searchParams.delete('product');
        window.history.pushState({ path: url.toString() }, '', url.toString());
      }
    } catch (e) {
      console.error("Error updating URL", e);
    }
  };

  const handleSelectTopup = (
    item: TopupItem,
    extra: { playerId: string; serverId?: string; operator?: string; rechargeType?: 'prepaid' | 'postpaid' }
  ) => {
    setDirectTopupCheckout({ item, extra });
    setDirectProductCheckout(undefined);
    setIsCheckoutOpen(true);
  };

  const handleProceedCartCheckout = () => {
    setDirectProductCheckout(undefined);
    setDirectTopupCheckout(undefined);
    setIsCheckoutOpen(true);
  };

  // Order Submission
  const handleSubmitRegularOrder = async (
    orderData: Omit<Order, 'id' | 'order_number' | 'created_at'>
  ) => {
    const created = await createNewOrder(orderData);
    setOrders((prev) => [created, ...prev]);
    if (!directProductCheckout && !directTopupCheckout) {
      setCartItems([]);
    }
    return created;
  };

  const handleSubmitAliExpressOrder = async (
    aliData: Omit<AliExpressDemandOrder, 'id' | 'order_number' | 'created_at' | 'status'>
  ) => {
    const created = await createAliExpressOrder(aliData);
    setAliExpressOrders((prev) => [created, ...prev]);
    return created;
  };

  const handleOrderSuccess = (order: Order) => {
    setIsCheckoutOpen(false);
    setTrackOrderNumber(order.order_number);
    setCurrentView('tracker');
    showToast(`✓ Order #${order.order_number} confirmed!`);
  };

  // Admin Actions
  const handleUpdateOrderStatus = async (
    orderId: string,
    status: OrderStatus,
    licenseKey?: string
  ) => {
    await updateOrderStatus(orderId, status, licenseKey);
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status, ...(licenseKey ? { license_key_delivered: licenseKey } : {}) }
          : o
      )
    );
    showToast('Order status updated!');
  };

  const handleUpdateAliExpressStatus = async (
    orderId: string,
    status: AliExpressDemandOrder['status'],
    quotedPrice?: number
  ) => {
    await updateAliExpressOrderStatus(orderId, status, quotedPrice);
    setAliExpressOrders((prev) =>
      prev.map((a) =>
        a.id === orderId
          ? { ...a, status, ...(quotedPrice !== undefined ? { admin_quoted_price: quotedPrice } : {}) }
          : a
      )
    );
    showToast('AliExpress demand updated!');
  };

  const handleAddProduct = async (prod: Omit<Product, 'id'>) => {
    const added = await addProduct(prod);
    setProducts((prev) => [added, ...prev]);
    showToast('Product added successfully!');
  };

  const handleDeleteProduct = async (id: string) => {
    await removeProduct(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast('Product removed!');
  };

  const handleUpdateProduct = async (id: string, updates: Partial<Product>) => {
    await updateProduct(id, updates);
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    showToast('Product updated successfully!');
  };

  const handleLoadMoreOrders = async (offset: number) => {
    const more = await fetchOrders(50, offset);
    if (more.length > 0) {
      setOrders((prev) => [...prev, ...more]);
    }
  };

  const handleLoadMoreProducts = async (offset: number) => {
    const more = await fetchProducts('all', 50, offset);
    if (more.length > 0) {
      setProducts((prev) => [...prev, ...more]);
    }
  };

  const handleSaveSettings = async (newSettings: StoreSettings) => {
    await saveStoreSettings(newSettings);
    setSettings(newSettings);
  };

  const handleAddEvent = async (event: StoreEvent) => {
    // 1. Immediately update React state and local storage so the event is locked in memory
    setSettings(prev => {
      const currentEvts = prev.events || [];
      const exists = currentEvts.some(e => e.id === event.id);
      const newEvts = exists 
        ? currentEvts.map(e => e.id === event.id ? event : e)
        : [event, ...currentEvts];
      const updated = {
        ...prev,
        events: newEvts,
        active_event_popup_id: (event.show_as_popup && event.active) ? event.id : prev.active_event_popup_id
      };
      saveStoreSettings(updated);
      return updated;
    });

    const success = await addEvent(event);
    if (success) {
      await loadData();
      showToast('Event published successfully!');
    } else {
      showToast('Failed to publish event. Please try again.');
    }
  };

  const handleUpdateEvent = async (id: string, updates: Partial<StoreEvent>) => {
    await updateEvent(id, updates);
    await loadData();
  };

  const handleDeleteEvent = async (id: string) => {
    await deleteEvent(id);
    await loadData();
  };

  const handleSaveCategory = async (cat: CustomCategory) => {
    await saveCategory(cat);
    await loadData();
  };

  const handleDeleteCategory = async (id: string) => {
    await deleteCategory(id);
    await loadData();
  };

  const handleSaveSubCategory = async (sub: SubCategory) => {
    await saveSubCategory(sub);
    await loadData();
  };

  const handleDeleteSubCategory = async (id: string) => {
    await deleteSubCategory(id);
    await loadData();
  };

  const handleSaveCoupons = async (coupons: Coupon[]) => {
    await saveCoupons(coupons);
    await loadData();
  };

  const handleDeleteCoupon = async (code: string) => {
    await deleteCoupon(code);
    await loadData();
  };

  const handleDeleteReview = async (id: string) => {
    const success = await deleteReview(id);
    if (success) {
      setReviews(reviews.filter((r) => r.id !== id));
      setToastMessage('রিভিউ সফলভাবে ডিলিট করা হয়েছে।');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    // Promo filter with robust fallback
    if (activePromoFilter === 'flash_sale' && !p.is_flash_sale && products.some(prod => prod.is_flash_sale)) return false;
    if (activePromoFilter === 'hot_sale' && !p.is_hot_sale && products.some(prod => prod.is_hot_sale)) return false;
    if (activePromoFilter === 'for_you' && !p.is_for_you && products.some(prod => prod.is_for_you)) return false;

    const matchesCategory =
      activeCategory === 'all'
        ? true
        : p.category === activeCategory;

    const matchesSubCategory =
      activeSubCategory === 'all'
        ? true
        : p.sub_category === activeSubCategory;

    const matchesSearch = searchQuery
      ? p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.product_code && p.product_code.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;

    return matchesCategory && matchesSubCategory && matchesSearch;
  });

  const handleClearProductDetail = () => {
    setSelectedProductForDetail(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('product');
    window.history.pushState({ path: url.toString() }, '', url.toString());
  };

  const handleViewProductDetail = (product: Product) => {
    setSelectedProductForDetail(product);
    setCurrentView('product-detail');
    const url = new URL(window.location.href);
    url.searchParams.set('product', product.id);
    window.history.pushState({ path: url.toString() }, '', url.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearAccountDetail = () => {
    setSelectedAccountForDetail(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('account');
    window.history.pushState({ path: url.toString() }, '', url.toString());
  };

  const handleViewAccountDetail = (account: AccountItem) => {
    setSelectedAccountForDetail(account);
    setCurrentView('account-detail');
    const url = new URL(window.location.href);
    url.searchParams.set('account', account.id);
    window.history.pushState({ path: url.toString() }, '', url.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearAffiliateProduct = () => {
    setSelectedAffiliateProduct(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('aff_product');
    window.history.pushState({ path: url.toString() }, '', url.toString());
  };

  const handleViewAffiliateProduct = (product: AffiliateProduct) => {
    setSelectedAffiliateProduct(product);
    setCurrentView('affiliate-detail');
    const url = new URL(window.location.href);
    url.searchParams.set('aff_product', product.id);
    window.history.pushState({ path: url.toString() }, '', url.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToView = (view: typeof currentView) => {
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    setIsTrackerOpen(false);
    setIsSidebarOpen(false);
    setDirectProductCheckout(undefined);
    setDirectTopupCheckout(undefined);
    handleClearProductDetail();
    handleClearAccountDetail();
    handleClearAffiliateProduct();
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderActiveScreen = () => {
    if (isCheckoutOpen) {
      return (
        <CheckoutScreen
          cartItems={cartItems}
          directProduct={directProductCheckout}
          directTopup={directTopupCheckout}
          settings={settings}
          currentUser={currentUser}
          onSubmitOrder={handleSubmitRegularOrder}
          onOrderSuccess={(order) => {
            handleOrderSuccess(order);
            setIsCheckoutOpen(false);
          }}
          onCancel={() => {
            setIsCheckoutOpen(false);
            setDirectProductCheckout(undefined);
            setDirectTopupCheckout(undefined);
          }}
        />
      );
    }

    if (currentView === 'products') {
      const urlState = getAppUrlState();
      return (
        <ProductsPage
          products={products}
          settings={settings}
          initialCategory={urlState.category || 'all'}
          initialPromoFilter={(urlState.promo as any) || 'all'}
          onAddToCart={(prod) => handleAddToCart(prod)}
          onQuickBuy={(prod) => handleDirectBuy(prod)}
          onViewDetails={(prod) => {
            handleViewProductDetail(prod);
          }}
          onBackToHome={() => {
            setCurrentView('store');
            updateAppUrl({ page: null, category: null, promo: null });
          }}
        />
      );
    }

    if (currentView === 'cart') {
      return (
        <CartScreen
          cartItems={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveFromCart}
          onClearCart={() => setCartItems([])}
          onProceedToCheckout={handleProceedCartCheckout}
          onContinueShopping={() => setCurrentView('store')}
          onSelectProduct={(p) => {
            setSelectedProductForDetail(p);
            setCurrentView('store');
          }}
          onAddToCart={handleAddToCart}
          popularProducts={products.slice(0, 4)}
          settings={settings}
        />
      );
    }

    // Admin screen is now returned early at the top level for a beautiful full screen layout without dual-sidebar constraints

    if (currentView === 'profile' && currentUser) {
      return (
        <ProfileScreen
          currentUser={currentUser}
          orders={orders}
          aliExpressOrders={aliExpressOrders}
          submissions={offerSubmissions}
          onNavigate={(view) => setCurrentView(view)}
          onSelectCategory={(cat) => {
            setActiveCategory(cat);
            setCurrentView('store');
          }}
          onClose={() => setCurrentView('store')}
          onLogout={() => {
            logoutUser();
            setCurrentUser(null);
            setCurrentView('landing');
            showToast('Signed out successfully.');
          }}
        />
      );
    }

    if (currentView === 'profile-address' && currentUser) {
      return (
        <MyAddressScreen
          currentUser={currentUser}
          onClose={() => setCurrentView('profile')}
        />
      );
    }

    if (currentView === 'profile-orders' && currentUser) {
      return (
        <MyOrdersScreen
          currentUser={currentUser}
          orders={orders}
          aliExpressOrders={aliExpressOrders}
          onClose={() => setCurrentView('profile')}
        />
      );
    }

    if (currentView === 'profile-licenses' && currentUser) {
      return (
        <MyLicensesScreen
          currentUser={currentUser}
          orders={orders}
          onClose={() => setCurrentView('profile')}
        />
      );
    }

    if (currentView === 'profile-support' && currentUser) {
      return (
        <SupportScreen
          settings={settings}
          currentUser={currentUser}
          onClose={() => setCurrentView('profile')}
        />
      );
    }

    if (currentView === 'profile-wallet' && currentUser) {
      return (
        <MyWalletScreen
          currentUser={currentUser}
          submissions={offerSubmissions}
          onNavigate={(view) => setCurrentView(view)}
          onSelectCategory={(cat) => {
            setActiveCategory(cat);
            setCurrentView('store');
          }}
          onClose={() => setCurrentView('profile')}
        />
      );
    }

    if (currentView === 'tracker') {
      return (
        <OrderTrackerScreen
          orders={orders}
          aliExpressOrders={aliExpressOrders}
          initialOrderNumber={trackOrderNumber}
          onClose={() => {
            if (currentUser) {
              setCurrentView('store');
            } else {
              setCurrentView('landing');
            }
          }}
        />
      );
    }

    if (settings.maintenance_mode && currentUser?.role !== 'admin') {
      return (
        <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 text-slate-100 p-6 min-h-[500px] text-center space-y-5">
          <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-3xl flex items-center justify-center text-2xl font-bold animate-pulse">🛠️</div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black tracking-tight text-white">Store is in Maintenance Mode!</h1>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              Our server is undergoing upgrades and maintenance. We sincerely apologize for the temporary inconvenience. We will be back online shortly!
            </p>
          </div>
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm font-mono text-xs text-slate-300">
            For urgent inquiries, contact our helpline:<br/>
            WhatsApp: <span className="text-blue-400 font-bold">{settings.whatsapp_number}</span><br/>
            Mobile: <span className="text-emerald-400 font-bold">{settings.help_phone}</span>
          </div>
          {currentUser && (
            <button
              onClick={() => {
                logoutUser();
                setCurrentUser(null);
                setCurrentView('landing');
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl cursor-pointer"
            >
              সাইন আউট করুন
            </button>
          )}
        </div>
      );
    }

    if (currentView === 'product-detail' && selectedProductForDetail) {
      return (
        <div className="flex-1 flex flex-col bg-slate-50 text-slate-800 pb-20 lg:pb-0">
          <BannerNotice 
            settings={settings} 
            dbStatus={dbStatus} 
            onOpenAdmin={() => {
              handleClearProductDetail();
              setCurrentView('admin');
            }} 
          />
          <Navbar
            activeCategory={activeCategory}
            onSelectCategory={(cat) => {
              handleClearProductDetail();
              setActiveCategory(cat);
              setActiveSubCategory('all');
              setCurrentView('store');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
            onOpenCart={() => setIsCartOpen(true)}
            onOpenTracker={() => {
              handleClearProductDetail();
              setTrackOrderNumber(currentUser ? currentUser.phone : '');
              setCurrentView('tracker');
            }}
            onOpenProfile={() => {
              handleClearProductDetail();
              setCurrentView('profile');
            }}
            onOpenAdmin={() => {
              handleClearProductDetail();
              setCurrentView('admin');
            }}
            onToggleSidebar={() => setIsSidebarOpen(true)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSearchSubmit={() => {
              handleClearProductDetail();
              setCurrentView('store');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            currentUser={currentUser}
            onOpenAuth={() => {
              setAuthModalMode('login');
              setCurrentView('auth');
            }}
            onLogout={() => {
              logoutUser();
              setCurrentUser(null);
              showToast('Signed out successfully.');
            }}
            settings={settings}
            products={products}
            onSelectProduct={(p) => {
              handleViewProductDetail(p);
            }}
          />
          <ProductDetailScreen
            product={selectedProductForDetail}
            onBack={() => {
              handleClearProductDetail();
              setCurrentView('store');
            }}
            onAddToCart={(prod, qty) => handleAddToCart(prod, qty)}
            onBuyNow={(prod, qty) => handleDirectBuy(prod, qty)}
            relatedProducts={products.filter(p => p.id !== selectedProductForDetail.id && p.category === selectedProductForDetail.category)}
            onSelectProduct={(p) => {
              handleViewProductDetail(p);
            }}
            onSelectCategory={(cat) => {
              handleClearProductDetail();
              setActiveCategory(cat);
              setActiveSubCategory('all');
              setCurrentView('store');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            currentUser={currentUser}
            orders={orders}
          />
        </div>
      );
    }

    if (currentView === 'account-detail' && selectedAccountForDetail) {
      return (
        <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 pb-20 lg:pb-0">
          <BannerNotice 
            settings={settings} 
            dbStatus={dbStatus} 
            onOpenAdmin={() => {
              handleClearAccountDetail();
              setCurrentView('admin');
            }} 
          />
          <Navbar
            activeCategory={activeCategory}
            onSelectCategory={(cat) => {
              handleClearAccountDetail();
              setActiveCategory(cat);
              setActiveSubCategory('all');
              setCurrentView('store');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
            onOpenCart={() => setIsCartOpen(true)}
            onOpenTracker={() => {
              handleClearAccountDetail();
              setTrackOrderNumber(currentUser ? currentUser.phone : '');
              setCurrentView('tracker');
            }}
            onOpenProfile={() => {
              handleClearAccountDetail();
              setCurrentView('profile');
            }}
            onOpenAdmin={() => {
              handleClearAccountDetail();
              setCurrentView('admin');
            }}
            onToggleSidebar={() => setIsSidebarOpen(true)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSearchSubmit={() => {
              handleClearAccountDetail();
              setCurrentView('store');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            currentUser={currentUser}
            onOpenAuth={() => {
              setAuthModalMode('login');
              setCurrentView('auth');
            }}
            onLogout={() => {
              logoutUser();
              setCurrentUser(null);
              showToast('Signed out successfully.');
            }}
            settings={settings}
            products={products}
            onSelectProduct={(p) => {
              handleViewProductDetail(p);
            }}
          />
          <AccountDetailScreen
            account={selectedAccountForDetail}
            onBack={() => {
              handleClearAccountDetail();
              setCurrentView('store');
            }}
            onAddToCart={(acc) => {
              handleAddToCart({
                id: acc.id,
                title: acc.title,
                category: acc.category,
                price: acc.price,
                discount_price: acc.discount_price,
                image_url: acc.image_url,
                description: acc.description,
                stock: acc.stock,
                digital_payload: acc.account_credentials,
                badge: acc.badge,
                product_code: acc.product_code
              } as any);
            }}
            onBuyNow={(acc) => {
              handleDirectBuy({
                id: acc.id,
                title: acc.title,
                category: acc.category,
                price: acc.price,
                discount_price: acc.discount_price,
                image_url: acc.image_url,
                description: acc.description,
                stock: acc.stock,
                digital_payload: acc.account_credentials,
                badge: acc.badge,
                product_code: acc.product_code
              } as any);
            }}
            currentUser={currentUser}
          />
        </div>
      );
    }

    if (currentView === 'affiliate-deals') {
      return (
        <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 pb-20 lg:pb-0">
          <BannerNotice 
            settings={settings} 
            dbStatus={dbStatus} 
            onOpenAdmin={() => {
              handleClearAffiliateProduct();
              setCurrentView('admin');
            }} 
          />
          <Navbar
            activeCategory={activeCategory}
            onSelectCategory={(cat) => {
              handleClearAffiliateProduct();
              setActiveCategory(cat);
              setActiveSubCategory('all');
              setCurrentView('store');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
            onOpenCart={() => setIsCartOpen(true)}
            onOpenTracker={() => {
              handleClearAffiliateProduct();
              setTrackOrderNumber(currentUser ? currentUser.phone : '');
              setCurrentView('tracker');
            }}
            onOpenProfile={() => {
              handleClearAffiliateProduct();
              setCurrentView('profile');
            }}
            onOpenAdmin={() => {
              handleClearAffiliateProduct();
              setCurrentView('admin');
            }}
            onToggleSidebar={() => setIsSidebarOpen(true)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSearchSubmit={() => {
              handleClearAffiliateProduct();
              setCurrentView('store');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            currentUser={currentUser}
            onOpenAuth={() => {
              setAuthModalMode('login');
              setCurrentView('auth');
            }}
            onLogout={() => {
              logoutUser();
              setCurrentUser(null);
              showToast('Signed out successfully.');
            }}
            settings={settings}
            products={products}
            onSelectProduct={(p) => {
              handleViewProductDetail(p);
            }}
          />
          <AffiliateProductsPage
            settings={settings}
            currentUser={currentUser}
            onBackToHome={() => setCurrentView('store')}
            onViewDetails={handleViewAffiliateProduct}
          />
        </div>
      );
    }

    if (currentView === 'affiliate-detail' && selectedAffiliateProduct) {
      return (
        <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 pb-20 lg:pb-0">
          <BannerNotice 
            settings={settings} 
            dbStatus={dbStatus} 
            onOpenAdmin={() => {
              handleClearAffiliateProduct();
              setCurrentView('admin');
            }} 
          />
          <Navbar
            activeCategory={activeCategory}
            onSelectCategory={(cat) => {
              handleClearAffiliateProduct();
              setActiveCategory(cat);
              setActiveSubCategory('all');
              setCurrentView('store');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
            onOpenCart={() => setIsCartOpen(true)}
            onOpenTracker={() => {
              handleClearAffiliateProduct();
              setTrackOrderNumber(currentUser ? currentUser.phone : '');
              setCurrentView('tracker');
            }}
            onOpenProfile={() => {
              handleClearAffiliateProduct();
              setCurrentView('profile');
            }}
            onOpenAdmin={() => {
              handleClearAffiliateProduct();
              setCurrentView('admin');
            }}
            onToggleSidebar={() => setIsSidebarOpen(true)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSearchSubmit={() => {
              handleClearAffiliateProduct();
              setCurrentView('store');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            currentUser={currentUser}
            onOpenAuth={() => {
              setAuthModalMode('login');
              setCurrentView('auth');
            }}
            onLogout={() => {
              logoutUser();
              setCurrentUser(null);
              showToast('Signed out successfully.');
            }}
            settings={settings}
            products={products}
            onSelectProduct={(p) => {
              handleViewProductDetail(p);
            }}
          />
          <AffiliateProductDetailScreen
            product={selectedAffiliateProduct}
            onBack={handleClearAffiliateProduct}
            currentUser={currentUser}
          />
        </div>
      );
    }

    // Default 'store' content
    return (
      <div className="flex-1 flex flex-col bg-slate-50 text-slate-800 pb-20 lg:pb-0">
        {/* Top Banner Notice */}
        <BannerNotice 
          settings={settings} 
          dbStatus={dbStatus} 
          onOpenAdmin={() => {
            handleClearProductDetail();
            setCurrentView('admin');
          }} 
        />

        {/* Main Navbar */}
        <Navbar
          activeCategory={activeCategory}
          onSelectCategory={(cat) => {
            handleClearProductDetail();
            setActiveCategory(cat);
            setActiveSubCategory('all');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenTracker={() => {
            handleClearProductDetail();
            setTrackOrderNumber(currentUser ? currentUser.phone : '');
            setCurrentView('tracker');
          }}
          onOpenProfile={() => {
            handleClearProductDetail();
            setCurrentView('profile');
          }}
          onOpenAdmin={() => {
            handleClearProductDetail();
            setCurrentView('admin');
          }}
          onToggleSidebar={() => setIsSidebarOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchSubmit={() => {
            handleClearProductDetail();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          currentUser={currentUser}
          onOpenAuth={() => {
            setAuthModalMode('login');
            setCurrentView('auth');
          }}
          onLogout={() => {
            logoutUser();
            setCurrentUser(null);
            showToast('Signed out successfully.');
          }}
          settings={settings}
          products={products}
          onSelectProduct={(p) => {
            handleViewProductDetail(p);
          }}
        />

        {/* Regular Store Sections */}
        <>
            {/* Hero Showcase (shown on All Items) */}
        {activeCategory === 'all' && !searchQuery && (
          <section className="w-full bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-900 text-white py-8 sm:py-16 px-4 sm:px-6 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:20px_20px]" />
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="max-w-7xl mx-auto relative z-10 w-full">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                {/* Left Column: Brand Pitch */}
                <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[10px] sm:text-xs font-black uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Premium Digital Vault & Smart Shop</span>
                  </div>

                  <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1]">
                    Original Software, <br className="hidden sm:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-amber-300">Fast Game Top-Up</span>
                  </h1>

                  <p className="text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
                    বিকাশ বা নগদে পেমেন্ট করে বুঝে নিন অরিজিনাল লাইসেন্স কী অথবা ইউআইডি টপ-আপ। যেকোনো আলি-এক্সপ্রেস প্রোডাক্ট অর্ডার করুন নিশ্চিন্তে।
                  </p>

                  {/* Quick Action Buttons */}
                  <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-2.5 sm:gap-3">
                    <button
                      onClick={() => setActiveCategory('topup')}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-xl shadow-amber-500/20 transition-all transform hover:scale-[1.03] cursor-pointer"
                    >
                      <Smartphone className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>UID Top-Up</span>
                    </button>

                    <button
                      onClick={() => setActiveCategory('offers')}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm rounded-2xl shadow-xl shadow-purple-600/30 transition-all transform hover:scale-[1.03] cursor-pointer border border-purple-400/30"
                    >
                      <Gift className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 animate-bounce" />
                      <span>টাস্ক অফার (Earn ৳)</span>
                    </button>

                    <button
                      onClick={() => setActiveCategory('accounts')}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs sm:text-sm rounded-2xl shadow-xl shadow-blue-600/20 transition-all transform hover:scale-[1.03] cursor-pointer"
                    >
                      <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-blue-300" />
                      <span>Account Buy/Sell</span>
                    </button>

                    <button
                      onClick={() => setActiveCategory('aliexpress')}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white font-black text-xs sm:text-sm rounded-2xl border border-slate-700 transition-all transform hover:scale-[1.03] cursor-pointer"
                    >
                      <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400" />
                      <span>AliExpress</span>
                    </button>
                  </div>
                </div>

                {/* Right Column: Mini Stats/Visuals (Mobile Responsive Grid) */}
                <div className="lg:col-span-5 grid grid-cols-2 gap-3 sm:gap-4 w-full">
                  <div 
                    onClick={() => setActiveCategory('digital')}
                    className="p-4 sm:p-6 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm space-y-2 hover:bg-white/10 transition-all cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-300 group-hover:scale-110 transition-transform">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-sm sm:text-base text-white">Genuine Keys</h3>
                    <p className="text-[10px] sm:text-xs text-slate-400">Retail license keys with lifetime guarantee.</p>
                  </div>
                  <div 
                    onClick={() => setActiveCategory('topup')}
                    className="p-4 sm:p-6 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm space-y-2 lg:mt-8 hover:bg-white/10 transition-all cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-300 group-hover:scale-110 transition-transform">
                      <Zap className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-sm sm:text-base text-white">Instant Delivery</h3>
                    <p className="text-[10px] sm:text-xs text-slate-400">Automated systems ensure fast delivery.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8">
          
          {/* Promo Filter Bar: Flash Sale, Hot Sale, For You, All Items */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 w-full sm:w-auto">
              <button
                onClick={() => {
                  setActivePromoFilter('all');
                  if (activeCategory === 'topup' || activeCategory === 'aliexpress') {
                    setActiveCategory('all');
                  }
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  activePromoFilter === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                <span>All Products (All Items)</span>
                <span className="text-[10px] font-mono opacity-80">({products.length})</span>
              </button>

              <button
                onClick={() => {
                  setActivePromoFilter('flash_sale');
                  if (activeCategory === 'topup' || activeCategory === 'aliexpress') {
                    setActiveCategory('all');
                  }
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  activePromoFilter === 'flash_sale'
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                <span>⚡ Flash Sale</span>
                <span className="text-[10px] bg-rose-500 text-white px-1.5 py-0.2 rounded-full font-mono">
                  {products.filter(p => p.is_flash_sale).length}
                </span>
              </button>

              <button
                onClick={() => {
                  setActivePromoFilter('hot_sale');
                  if (activeCategory === 'topup' || activeCategory === 'aliexpress') {
                    setActiveCategory('all');
                  }
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  activePromoFilter === 'hot_sale'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-amber-600" />
                <span>🔥 Hot Sale</span>
                <span className="text-[10px] bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full font-mono font-black">
                  {products.filter(p => p.is_hot_sale).length}
                </span>
              </button>

              <button
                onClick={() => {
                  setActivePromoFilter('for_you');
                  if (activeCategory === 'topup' || activeCategory === 'aliexpress') {
                    setActiveCategory('all');
                  }
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  activePromoFilter === 'for_you'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>✨ For You</span>
                <span className="text-[10px] bg-indigo-500 text-white px-1.5 py-0.2 rounded-full font-mono">
                  {products.filter(p => p.is_for_you).length}
                </span>
              </button>

              <button
                onClick={() => {
                  setCurrentView('affiliate-deals');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shrink-0 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200`}
              >
                <Gift className="w-3.5 h-3.5 text-emerald-600 animate-bounce" />
                <span>🎁 Loot Offer</span>
                <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.2 rounded-full font-mono font-bold">
                  {affiliateProducts.length}
                </span>
              </button>

              <button
                onClick={() => {
                  setActivePromoFilter('featured');
                  if (activeCategory === 'topup' || activeCategory === 'aliexpress') {
                    setActiveCategory('all');
                  }
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  activePromoFilter === 'featured'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
                }`}
              >
                <Award className="w-3.5 h-3.5 text-purple-600" />
                <span>⭐ Feature Products</span>
                <span className="text-[10px] bg-purple-600 text-white px-1.5 py-0.2 rounded-full font-mono">
                  {products.filter(p => p.badge || p.is_hot_sale || p.is_flash_sale).length}
                </span>
              </button>
            </div>

            {activePromoFilter !== 'all' && (
              <button
                onClick={() => setActivePromoFilter('all')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>ফিল্টার মুছুন</span>
              </button>
            )}
          </div>

          {/* 6 Structured Sections on Home Page */}
          {activeCategory === 'all' && activePromoFilter === 'all' && !searchQuery && (
            <div className="space-y-12 mb-12">
              {/* 1. ⚡ Flash Sale Products */}
              {products.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-500/30">
                        <Flame className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <h2 className="text-base sm:text-2xl font-black text-slate-900 tracking-tight">
                          <span>⚡ Flash Sale Products (ফ্ল্যাশ সেল অফার)</span>
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">Limited-time mega discounts on verified digital keys and gadgets</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActivePromoFilter('flash_sale')}
                      className="text-xs font-black px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer shrink-0 flex items-center gap-1"
                    >
                      <span>সব দেখুন</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
                    {(products.filter(p => p.is_flash_sale).length > 0 ? products.filter(p => p.is_flash_sale) : products.slice(0, 4)).map(prod => (
                      <ProductCard key={prod.id} product={prod} onAddToCart={handleAddToCart} onQuickBuy={handleDirectBuy} onViewDetails={handleViewProductDetail} />
                    ))}
                  </div>
                </div>
              )}

              {/* 2. 🔥 Hot Sale Products */}
              {products.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-md shadow-amber-500/30">
                        <Flame className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-base sm:text-2xl font-black text-slate-900 tracking-tight">
                          <span>🔥 Hot Sale Products (হট সেল কালেকশন)</span>
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">Most popular trending products chosen by our customers</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActivePromoFilter('hot_sale')}
                      className="text-xs font-black px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer shrink-0 flex items-center gap-1"
                    >
                      <span>সব দেখুন</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
                    {(products.filter(p => p.is_hot_sale).length > 0 ? products.filter(p => p.is_hot_sale) : products.slice(4, 8)).map(prod => (
                      <ProductCard key={prod.id} product={prod} onAddToCart={handleAddToCart} onQuickBuy={handleDirectBuy} onViewDetails={handleViewProductDetail} />
                    ))}
                  </div>
                </div>
              )}

              {/* 3. ✨ Recommended For You */}
              {products.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30">
                        <Sparkles className="w-5 h-5 text-amber-300" />
                      </div>
                      <div>
                        <h2 className="text-base sm:text-2xl font-black text-slate-900 tracking-tight">
                          <span>✨ Recommended For You (আপনার জন্য স্পেশাল)</span>
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">Specially curated premium digital licenses and tech accessories</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActivePromoFilter('for_you')}
                      className="text-xs font-black px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer shrink-0 flex items-center gap-1"
                    >
                      <span>সব দেখুন</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
                    {(products.filter(p => p.is_for_you).length > 0 ? products.filter(p => p.is_for_you) : products.slice(8, 12)).map(prod => (
                      <ProductCard key={prod.id} product={prod} onAddToCart={handleAddToCart} onQuickBuy={handleDirectBuy} onViewDetails={handleViewProductDetail} />
                    ))}
                  </div>
                </div>
              )}

              {/* 4. 🎁 Loot Offer (Affiliate Products Added by Admin) */}
              {affiliateProducts.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30">
                        <Gift className="w-5 h-5 text-amber-300 animate-bounce" />
                      </div>
                      <div>
                        <h2 className="text-base sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                          <span>🎁 Loot Offers & Partner Deals (লুট অফার)</span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-black px-2 py-0.5 rounded-full uppercase hidden xs:inline">
                            Mega Cashback & Deals
                          </span>
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">দারাজ, আলিবাবা, আমাজনসহ পার্টনার সাইটের সেরা ডিসকাউন্ট রিডাইরেক্ট লিঙ্ক ডিলস</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setCurrentView('affiliate-deals');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="text-xs font-black px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer shrink-0 flex items-center gap-1"
                    >
                      <span>সব অফার দেখুন ({affiliateProducts.length})</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
                    {affiliateProducts.slice(0, 8).map(aff => {
                      const discountPct = aff.old_price && aff.old_price > aff.price
                        ? Math.round(((aff.old_price - aff.price) / aff.old_price) * 100)
                        : null;
                      return (
                        <div
                          key={aff.id}
                          onClick={() => handleViewAffiliateProduct(aff)}
                          className="bg-white border border-slate-200 hover:border-emerald-500 rounded-2xl p-3.5 flex flex-col justify-between shadow-2xs hover:shadow-lg transition-all group relative overflow-hidden cursor-pointer"
                        >
                          <div className="space-y-2.5">
                            <div className="relative aspect-square rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center p-2">
                              <img
                                src={aff.image}
                                alt={aff.name}
                                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?q=80&w=1470&auto=format&fit=crop';
                                }}
                              />
                              <span className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase border border-slate-700">
                                {aff.store_name}
                              </span>
                              {discountPct && (
                                <span className="absolute top-2 right-2 bg-rose-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-md animate-pulse">
                                  {discountPct}% OFF
                                </span>
                              )}
                            </div>

                            <div>
                              <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm line-clamp-2 group-hover:text-emerald-600 transition-colors">
                                {aff.name}
                              </h3>
                              {aff.short_description && (
                                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                  {aff.short_description}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="pt-2.5 mt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                            <div>
                              <span className="text-[9px] font-bold text-slate-400 uppercase">অফার মূল্য</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-sm font-black text-emerald-600">৳{aff.price}</span>
                                {aff.old_price && aff.old_price > aff.price && (
                                  <span className="text-[10px] text-slate-400 line-through">৳{aff.old_price}</span>
                                )}
                              </div>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewAffiliateProduct(aff);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-[10px] sm:text-[11px] flex items-center gap-1 shadow-md shadow-emerald-600/20 cursor-pointer"
                            >
                              <span>অফার দেখুন</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 5. ⭐ Feature Products */}
              {products.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/30">
                        <Award className="w-5 h-5 text-amber-300" />
                      </div>
                      <div>
                        <h2 className="text-base sm:text-2xl font-black text-slate-900 tracking-tight">
                          <span>⭐ Feature Products (ফিচারড আইটেম)</span>
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">কাস্টমারদের দ্বারা সর্বাধিক পছন্দের ও শীর্ষ রেটেড ফিচারড প্রোডাক্টসমূহ</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
                    {(products.filter(p => p.badge || p.is_hot_sale || p.is_flash_sale).length > 0 
                      ? products.filter(p => p.badge || p.is_hot_sale || p.is_flash_sale) 
                      : products.slice(0, 4)
                    ).map(prod => (
                      <ProductCard key={prod.id} product={prod} onAddToCart={handleAddToCart} onQuickBuy={handleDirectBuy} onViewDetails={handleViewProductDetail} />
                    ))}
                  </div>
                </div>
              )}

              {/* 6. 🔐 Social & Verified Accounts */}
              {accounts.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/30">
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-base sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                          <span>🔐 Social & Verified Accounts (অ্যাকাউন্ট বাই & সেল)</span>
                          <span className="text-[10px] bg-blue-100 text-blue-800 font-black px-2 py-0.5 rounded-full uppercase hidden xs:inline">Instant Delivery</span>
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">WhatsApp, Telegram, Facebook, Gmail ও OTT ভেরিফাইড অ্যাকাউন্ট কালেকশন</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setActiveCategory('accounts');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="text-xs font-black px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer shrink-0 flex items-center gap-1"
                    >
                      <span>সব দেখুন ({accounts.length})</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
                    {accounts.slice(0, 4).map(acc => (
                      <div
                        key={acc.id}
                        className="bg-white border border-slate-200 hover:border-blue-400 rounded-2xl p-4 flex flex-col justify-between shadow-2xs hover:shadow-md transition-all group"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <img
                              src={acc.image_url}
                              alt={acc.title}
                              className="w-10 h-10 object-contain rounded-xl bg-slate-50 border border-slate-100 p-1"
                            />
                            <div className="flex flex-col items-end gap-1">
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-blue-50 text-blue-600 border border-blue-100">
                                {acc.category}
                              </span>
                              {acc.badge && (
                                <span className="px-1.5 py-0.2 rounded-full text-[8px] font-bold uppercase bg-emerald-50 text-emerald-600 border border-emerald-100">
                                  {acc.badge}
                                </span>
                              )}
                            </div>
                          </div>
                          <div>
                            <h3 className="font-extrabold text-slate-900 text-xs line-clamp-2 group-hover:text-blue-600 transition-colors">
                              {acc.title}
                            </h3>
                            <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                              {acc.description}
                            </p>
                          </div>
                        </div>

                        <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                          <div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase">মূল্য</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-black text-blue-600">৳{acc.price}</span>
                              {acc.discount_price && acc.discount_price > acc.price && (
                                <span className="text-[10px] text-slate-400 line-through">৳{acc.discount_price}</span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              handleDirectBuy({
                                id: acc.id,
                                title: acc.title,
                                category: acc.category,
                                price: acc.price,
                                discount_price: acc.discount_price,
                                image_url: acc.image_url,
                                description: acc.description,
                                stock: acc.stock,
                                digital_payload: acc.account_credentials,
                                badge: acc.badge,
                                product_code: acc.product_code
                              } as any);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                          >
                            <Zap className="w-3 h-3 fill-white" />
                            <span>কিনুন</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Category Header when filtered */}
          {activeCategory !== 'all' && (
            <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-slate-200">
              <div>
                <h2 className="text-lg sm:text-2xl font-black text-slate-900">
                  {activeCategory === 'digital' && 'Digital Software & Genuine License Keys'}
                  {activeCategory === 'physical' && 'Physical Gadgets & Accessories'}
                  {activeCategory === 'topup' && 'Game Diamonds, UC & Mobile Recharge'}
                  {activeCategory === 'offers' && 'টাস্ক অফার ও রিওয়ার্ড (Micro Tasks & Wallet Rewards)'}
                  {activeCategory === 'accounts' && 'Social & Verified Accounts (অ্যাকাউন্ট বাই & সেল)'}
                  {activeCategory === 'aliexpress' && 'AliExpress Link On-Demand Ordering'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {activeCategory === 'digital' && '100% Genuine keys delivered instantly on screen & via SMS'}
                  {activeCategory === 'physical' && 'Fast nationwide courier delivery with Cash on Delivery available'}
                  {activeCategory === 'topup' && 'Enter your Player UID or Mobile Number for 5-15 minute processing'}
                  {activeCategory === 'offers' && 'টাস্ক সম্পন্ন করুন, অ্যাডমিন অ্যাপ্রুভ করলে সাথে সাথে ওয়ালেটে টাকা জমা হবে'}
                  {activeCategory === 'accounts' && 'WhatsApp, Telegram, Facebook, Gmail এবং OTT ভেরিফাইড অ্যাকাউন্ট'}
                  {activeCategory === 'aliexpress' && 'Paste any product link for hassle-free international import'}
                </p>
              </div>

              <button
                onClick={() => setActiveCategory('all')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg cursor-pointer"
              >
                View All Items
              </button>
            </div>
          )}

          {/* TOPUP VIEW */}
          {activeCategory === 'topup' && (
            <TopupSection
              topupItems={topupCatalog}
              onSelectTopupForCheckout={handleSelectTopup}
            />
          )}

          {/* ACCOUNTS MARKETPLACE VIEW */}
          {activeCategory === 'accounts' && (
            <AccountMarketplace
              accounts={accounts}
              settings={settings}
              currentUser={currentUser}
              onAddToCart={(acc) => {
                handleAddToCart({
                  id: acc.id,
                  title: acc.title,
                  category: acc.category,
                  price: acc.price,
                  discount_price: acc.discount_price,
                  image_url: acc.image_url,
                  description: acc.description,
                  stock: acc.stock,
                  digital_payload: acc.account_credentials,
                  badge: acc.badge,
                  product_code: acc.product_code
                } as any);
              }}
              onBuyNow={(acc) => {
                handleDirectBuy({
                  id: acc.id,
                  title: acc.title,
                  category: acc.category,
                  price: acc.price,
                  discount_price: acc.discount_price,
                  image_url: acc.image_url,
                  description: acc.description,
                  stock: acc.stock,
                  digital_payload: acc.account_credentials,
                  badge: acc.badge,
                  product_code: acc.product_code
                } as any);
              }}
              onOpenAuth={() => {
                setAuthModalMode('login');
                setCurrentView('auth');
              }}
              onViewDetails={handleViewAccountDetail}
            />
          )}

          {/* OFFERS & TASKS VIEW */}
          {activeCategory === 'offers' && (
            <OffersSection
              offers={offers}
              submissions={offerSubmissions}
              currentUser={currentUser}
              onRefreshData={loadData}
              onOpenAuth={() => {
                setAuthModalMode('login');
                setCurrentView('auth');
              }}
              showToast={showToast}
            />
          )}

          {/* ALIEXPRESS DEMAND VIEW */}
          {activeCategory === 'aliexpress' && (
            <AliExpressOrderForm
              settings={settings}
              currentUser={currentUser}
              onSubmitOrder={handleSubmitAliExpressOrder}
            />
          )}

          {/* PRODUCTS VIEW (Digital, Physical, All, or Custom Categories) */}
          {(activeCategory === 'all' || activeCategory === 'digital' || activeCategory === 'physical' || (settings.custom_categories && settings.custom_categories.some(c => c.id === activeCategory))) && (
            <div className="space-y-5 animate-in fade-in duration-300">
              
              {/* Header Title segment (desktop only or all) */}
              {activeCategory === 'all' && (
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                      activePromoFilter === 'flash_sale' ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30' :
                      activePromoFilter === 'hot_sale' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30' :
                      activePromoFilter === 'for_you' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                    }`}>
                      {activePromoFilter === 'flash_sale' && <Flame className="w-5 h-5 animate-pulse" />}
                      {activePromoFilter === 'hot_sale' && <Flame className="w-5 h-5" />}
                      {activePromoFilter === 'for_you' && <Sparkles className="w-5 h-5 text-amber-300" />}
                      {activePromoFilter === 'all' && <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />}
                    </div>
                    <div>
                      <h2 className="text-base sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <span>
                          {activePromoFilter === 'flash_sale' && '⚡ Flash Sale Products (ফ্ল্যাশ সেল অফার)'}
                          {activePromoFilter === 'hot_sale' && '🔥 Hot Sale Deals (হট সেল কালেকশন)'}
                          {activePromoFilter === 'for_you' && '✨ Recommended For You (আপনার জন্য স্পেশাল)'}
                          {activePromoFilter === 'all' && 'Featured Products & Hot Deals'}
                        </span>
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {activePromoFilter === 'flash_sale' && 'Limited-time mega discounts on verified digital keys and gadgets'}
                        {activePromoFilter === 'hot_sale' && 'Most popular trending products chosen by our customers'}
                        {activePromoFilter === 'for_you' && 'Specially curated premium digital licenses and tech accessories'}
                        {activePromoFilter === 'all' && 'Curated selection of verified software keys, smart gadgets and games'}
                      </p>
                    </div>
                  </div>

                  {activePromoFilter !== 'all' && (
                    <button
                      onClick={() => setActivePromoFilter('all')}
                      className="text-xs font-black px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer shrink-0"
                    >
                      সব পণ্য দেখুন (View All)
                    </button>
                  )}
                </div>
              )}

              {/* Sub-categories horizontal pill bar (Visible on Mobile/Tablet and filtered desktop view when subcategories exist) */}
              {((settings.sub_categories || []).filter(sub => sub.parent_category_id === activeCategory).length > 0) && (
                <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs space-y-2 lg:hidden">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">সাব-ক্যাটাগরি ফিল্টার:</span>
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                    <button
                      onClick={() => setActiveSubCategory('all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
                        activeSubCategory === 'all'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      All Nested
                    </button>
                    {(settings.sub_categories || [])
                      .filter(sub => sub.parent_category_id === activeCategory)
                      .map(sub => {
                        const count = products.filter(p => p.category === activeCategory && p.sub_category === sub.id).length;
                        return (
                          <button
                            key={sub.id}
                            onClick={() => setActiveSubCategory(sub.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 ${
                              activeSubCategory === sub.id
                                ? 'bg-purple-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            <span>{sub.label}</span>
                            <span className="text-[9px] opacity-70 font-mono bg-black/10 px-1 rounded-sm">{count}</span>
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Grid Store layout with Left Sidebar (Desktop only) and right grid */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                
                {/* Desktop Left Sidebar: Categories & Nested Sub-categories */}
                <div className="hidden lg:block lg:col-span-1 bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4 sticky top-24 z-20">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Inbox className="w-5 h-5 text-blue-600" />
                    <span className="font-extrabold text-sm text-slate-900 font-sans">Category Catalog</span>
                  </div>

                  <div className="space-y-1.5">
                    {/* All Products Category Item */}
                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          setActiveCategory('all');
                          setActiveSubCategory('all');
                        }}
                        className={`w-full px-3 py-2.5 rounded-xl text-left text-xs font-extrabold flex items-center justify-between transition-all cursor-pointer border ${
                          activeCategory === 'all'
                            ? 'bg-blue-50 border-blue-200/80 text-blue-700 font-black'
                            : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <ShoppingBag className="w-4 h-4 shrink-0 text-slate-400" />
                          <span>All Categories</span>
                        </div>
                        <span className="text-[10px] font-mono bg-slate-100 text-slate-500 font-black px-1.5 py-0.5 rounded-md">
                          {products.length}
                        </span>
                      </button>
                    </div>

                    {/* Standard & Custom Categories List */}
                    {(() => {
                      const list = [
                        { id: 'digital', label: 'Digital Keys', icon: <Zap className="w-4 h-4 text-amber-500 shrink-0" /> },
                        { id: 'physical', label: 'Smart Gadgets', icon: <Truck className="w-4 h-4 text-blue-500 shrink-0" /> },
                        { id: 'topup', label: 'Top-Up & Recharge', icon: <Smartphone className="w-4 h-4 text-emerald-500 shrink-0" /> },
                        { id: 'aliexpress', label: 'AliExpress Orders', icon: <Globe className="w-4 h-4 text-rose-500 shrink-0" /> }
                      ];

                      // Merge remaining custom categories from settings
                      if (settings.custom_categories) {
                        settings.custom_categories.forEach(cc => {
                          if (!list.some(existing => existing.id === cc.id)) {
                            list.push({
                              id: cc.id,
                              label: cc.label,
                              icon: cc.icon ? <span className="text-sm shrink-0">{cc.icon}</span> : <Zap className="w-4 h-4 text-indigo-500 shrink-0" />
                            });
                          }
                        });
                      }

                      return list.map((cat) => {
                        const isCatActive = activeCategory === cat.id;
                        const subCats = (settings.sub_categories || []).filter(sub => sub.parent_category_id === cat.id);
                        const catProductsCount = products.filter(p => p.category === cat.id).length;

                        return (
                          <div key={cat.id} className="space-y-1">
                            <button
                              onClick={() => {
                                setActiveCategory(cat.id);
                                setActiveSubCategory('all');
                              }}
                              className={`w-full px-3 py-2.5 rounded-xl text-left text-xs font-bold flex items-center justify-between transition-all cursor-pointer border ${
                                isCatActive
                                  ? 'bg-blue-50 border-blue-200/80 text-blue-700 font-black border-l-4 border-l-blue-600 pl-2'
                                  : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {cat.icon}
                                <span className="truncate max-w-[110px]">{cat.label}</span>
                              </div>
                              <span className="text-[10px] font-mono bg-slate-100 text-slate-500 font-black px-1.5 py-0.5 rounded-md">
                                {cat.id === 'topup' ? topupCatalog.length : catProductsCount}
                              </span>
                            </button>

                            {/* Nested subcategories inside selected category */}
                            {isCatActive && subCats.length > 0 && (
                              <div className="ml-5 pl-2.5 border-l border-slate-200 space-y-1 py-1">
                                <button
                                  onClick={() => setActiveSubCategory('all')}
                                  className={`w-full text-left text-[11px] py-1 px-2 rounded-lg font-bold block transition-all cursor-pointer ${
                                    activeSubCategory === 'all'
                                      ? 'text-purple-600 bg-purple-50 font-black'
                                      : 'text-slate-500 hover:text-slate-800'
                                  }`}
                                >
                                  • All Subcategories
                                </button>
                                {subCats.map(sub => {
                                  const count = products.filter(p => p.category === cat.id && p.sub_category === sub.id).length;
                                  return (
                                    <button
                                      key={sub.id}
                                      onClick={() => setActiveSubCategory(sub.id)}
                                      className={`w-full text-left text-[11px] py-1 px-2 rounded-lg font-bold flex items-center justify-between transition-all cursor-pointer ${
                                        activeSubCategory === sub.id
                                          ? 'text-purple-600 bg-purple-50 font-black'
                                          : 'text-slate-500 hover:text-slate-800'
                                      }`}
                                    >
                                      <span className="truncate max-w-[90px]">• {sub.label}</span>
                                      <span className="text-[9px] font-mono text-slate-400 bg-slate-100 px-1 rounded-sm">{count}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* Right Column: Products Grid */}
                <div className="lg:col-span-3 space-y-4">
                  {filteredProducts.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-6 flex flex-col items-center justify-center space-y-3">
                      <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-xl shadow-2xs">🔍</div>
                      <div className="space-y-1">
                        <p className="font-extrabold text-slate-800 text-sm">পণ্য খুঁজে পাওয়া যায়নি</p>
                        <p className="text-xs text-slate-400 max-w-sm">এই ক্যাটাগরি বা সাব-ক্যাটাগরিতে কোনো প্রোডাক্ট পাওয়া যায়নি। অন্য ফিল্টার বেছে নিন।</p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-2.5 sm:gap-5">
                      {filteredProducts.map((prod) => (
                        <ProductCard
                          key={prod.id}
                          product={prod}
                          onAddToCart={handleAddToCart}
                          onQuickBuy={handleDirectBuy}
                          onViewDetails={(p) => {
                            handleViewProductDetail(p);
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* AliExpress Banner in "All" view */}
          {activeCategory === 'all' && (
            <div className="bg-gradient-to-r from-rose-600 via-orange-500 to-amber-500 rounded-3xl p-5 sm:p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
              <div className="space-y-1.5 text-center md:text-left max-w-xl">
                <span className="bg-white/20 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  AliExpress On-Demand
                </span>
                <h3 className="text-xl sm:text-2xl font-black leading-tight">
                  Can't find the product you're looking for?
                </h3>
                <p className="text-xs sm:text-sm text-white/90">
                  Paste any AliExpress link into our demand portal. We will purchase and ship it right to your doorstep in Bangladesh!
                </p>
              </div>

              <button
                onClick={() => setActiveCategory('aliexpress')}
                className="px-5 py-2.5 sm:py-3 bg-white text-rose-600 hover:bg-slate-100 font-black text-xs sm:text-sm rounded-xl shadow-md active:scale-95 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0"
              >
                <Globe className="w-4 h-4" />
                <span>Order via AliExpress Link</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </main>
      </>

        {/* Enhanced Footer */}
        <footer className="w-full bg-gradient-to-b from-slate-900 to-slate-950 text-slate-300 text-xs py-12 border-t border-slate-800/80 mt-16 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 sm:gap-10 relative z-10">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5 text-white font-black text-base">
                <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs shadow-md shadow-blue-600/30">V</span>
                <span>{settings.footer_title || 'Veloral Digital & Shop'}</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-400">
                {settings.footer_description || 'One-stop online portal for instant software license keys, smart gadgets, Free Fire & PUBG top-up, and AliExpress on-demand shopping in Bangladesh.'}
              </p>
              <div className="flex items-center gap-2 pt-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 text-emerald-400 font-bold text-[10px] rounded-lg border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" /> 100% Trusted
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-500/10 text-blue-400 font-bold text-[10px] rounded-lg border border-blue-500/20">
                  ⚡ Instant Delivery
                </span>
              </div>
            </div>

            <div>
              <h4 className="font-extrabold text-white text-sm mb-3.5 flex items-center gap-2">
                <span className="w-1.5 h-3.5 bg-blue-500 rounded-xs" />
                <span>Shop Categories</span>
              </h4>
              <ul className="space-y-2 text-slate-400">
                <li><button onClick={() => { handleClearProductDetail(); setActiveCategory('digital'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"><span>›</span> Digital Software & Keys</button></li>
                <li><button onClick={() => { handleClearProductDetail(); setActiveCategory('physical'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"><span>›</span> Smart Gadgets & Electronics</button></li>
                <li><button onClick={() => { handleClearProductDetail(); setActiveCategory('topup'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"><span>›</span> Free Fire & PUBG Top-Up</button></li>
                <li><button onClick={() => { handleClearProductDetail(); setActiveCategory('aliexpress'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"><span>›</span> AliExpress On-Demand</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-extrabold text-white text-sm mb-3.5 flex items-center gap-2">
                <span className="w-1.5 h-3.5 bg-emerald-500 rounded-xs" />
                <span>Payment Methods</span>
              </h4>
              <div className="space-y-1.5 text-slate-400 font-medium">
                {(settings.footer_payment_methods || '✓ bKash Personal\n✓ Nagad Personal\n✓ Rocket Personal\n✓ Cash on Delivery').split('\n').map((line, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-xs">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>{line.replace(/^[✓\-\*]\s*/, '')}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-extrabold text-white text-sm mb-3.5 flex items-center gap-2">
                <span className="w-1.5 h-3.5 bg-indigo-500 rounded-xs" />
                <span>Help & Support</span>
              </h4>
              <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                {settings.footer_help_text || 'Need assistance with an order? Contact our support line or chat on WhatsApp.'}
              </p>
              <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 space-y-2">
                <div className="font-mono text-emerald-400 font-black text-xs flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp: {settings.whatsapp_number}</span>
                </div>
                <button
                  onClick={() => {
                    handleClearProductDetail();
                    setTrackOrderNumber('');
                    setCurrentView('tracker');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-xl cursor-pointer shadow-md transition-all text-center block"
                >
                  Track Order Status (অর্ডার ট্র্যাক করুন)
                </button>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-xs relative z-10">
            <p>{settings.footer_copyright || `© ${new Date().getFullYear()} Veloral Digital & Shop. All rights reserved.`}</p>
            <div className="flex items-center gap-4">
              <span className="hover:text-slate-300 cursor-pointer" onClick={() => { handleClearProductDetail(); setActiveCategory('all'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Home</span>
              <span className="hover:text-slate-300 cursor-pointer" onClick={() => { handleClearProductDetail(); setCurrentView('tracker'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Order Tracker</span>
              <span className="hover:text-slate-300 cursor-pointer" onClick={() => { setIsCartOpen(true); }}>Cart</span>
            </div>
          </div>
        </footer>
      </div>
    );
  };

  if (isLoadingData) {
    return <GlobalSkeletonLoader />;
  }

  if (currentView === 'landing') {
    return (
      <div className="min-h-screen bg-slate-950 font-sans relative">
        <LandingPage
          settings={settings}
          featuredProducts={products}
          onOpenAuth={(mode) => {
            setAuthModalMode(mode === 'register' ? 'signup' : 'login');
            setCurrentView('auth');
          }}
        />

        {/* Floating WhatsApp Button */}
        <a
          href={`https://wa.me/${settings.whatsapp_number.replace(/[^0-9+]/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-[0_8px_16px_rgba(37,211,102,0.4)] transition-all duration-300 hover:scale-110 hover:shadow-[0_12px_24px_rgba(37,211,102,0.6)] animate-bounce"
        >
          <MessageCircle className="w-8 h-8" />
        </a>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-4 right-4 z-70 bg-slate-900 text-white px-3.5 py-2.5 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-2 border border-slate-700 animate-in slide-in-from-bottom duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    );
  }

  if (currentView === 'admin') {
    return (
      <div className="min-h-screen bg-slate-950 font-sans text-slate-100 max-w-full overflow-x-hidden relative">
        <AdminScreen
          orders={orders}
          aliExpressOrders={aliExpressOrders}
          products={products}
          users={users}
          settings={settings}
          accounts={accounts}
          offers={offers}
          submissions={offerSubmissions}
          currentUser={currentUser}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onUpdateAliExpressStatus={handleUpdateAliExpressStatus}
          onAddProduct={handleAddProduct}
          onUpdateProduct={handleUpdateProduct}
          onDeleteProduct={handleDeleteProduct}
          onSaveSettings={handleSaveSettings}
          onSaveAccounts={(accs) => {
            setAccounts(accs);
            saveAccounts(accs);
            showToast('Accounts updated successfully!');
          }}
          onSaveOffers={(newOffers) => {
            setOffers(newOffers);
            saveOffers(newOffers);
            showToast('Offers updated successfully!');
          }}
          onAddEvent={handleAddEvent}
          onUpdateEvent={handleUpdateEvent}
          onDeleteEvent={handleDeleteEvent}
          onSaveCategory={handleSaveCategory}
          onDeleteCategory={handleDeleteCategory}
          onSaveSubCategory={handleSaveSubCategory}
          onDeleteSubCategory={handleDeleteSubCategory}
          onSaveCoupons={handleSaveCoupons}
          onDeleteCoupon={handleDeleteCoupon}
          reviews={reviews}
          onDeleteReview={handleDeleteReview}
          onRefreshData={loadData}
          onLoadMoreOrders={handleLoadMoreOrders}
          onLoadMoreProducts={handleLoadMoreProducts}
          onClose={() => setCurrentView('store')}
        />

        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-4 right-4 z-70 bg-slate-900 text-white px-3.5 py-2.5 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-2 border border-slate-700 animate-in slide-in-from-bottom duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    );
  }

  if (currentView === 'auth') {
    return (
      <AuthScreen
        initialMode={authModalMode}
        onBack={() => setCurrentView('landing')}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          if (user.role === 'admin') {
            setCurrentView('admin');
            showToast(`Welcome Admin ${user.name}! Opening Admin Dashboard...`);
          } else {
            setCurrentView('store');
            showToast(`Welcome back, ${user.name}!`);
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans max-w-full overflow-x-hidden relative">
      {/* Persistent / Collapsible Left Sidebar */}
      <SidebarMenu
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'store') {
            setActiveCategory('all');
            setActiveSubCategory('all');
          }
          handleNavigateToView(view);
        }}
        currentUser={currentUser}
        onLogout={() => {
          logoutUser();
          setCurrentUser(null);
          setCurrentView('landing');
          showToast('Signed out successfully.');
        }}
      />

      {/* Main layout contents with left margin on desktop to avoid overlap */}
      <div className="lg:pl-72 min-h-screen flex flex-col justify-between bg-slate-950 text-slate-100 relative">
        <div className="flex-1 flex flex-col w-full max-w-full overflow-x-hidden">
          {renderActiveScreen()}
        </div>

        {/* Central Toast system */}
        {toastMessage && (
          <div className="fixed bottom-4 right-4 z-70 bg-slate-900 text-white px-3.5 py-2.5 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-2 border border-slate-700 animate-in slide-in-from-bottom duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>

      {/* Detail, Cart & Checkout Modals */}

      {/* Mobile Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden px-3 pb-3">
        <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-3xl shadow-2xl flex items-center justify-between px-2 h-16 max-w-md mx-auto">
          <button
            onClick={() => {
              setActiveCategory('all');
              setActiveSubCategory('all');
              handleNavigateToView('store');
            }}
            className={`flex flex-col items-center justify-center w-full gap-1 transition-all ${
              currentView === 'store' && !isCheckoutOpen && activeCategory === 'all' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <ShoppingBag className={`w-5 h-5 ${currentView === 'store' && !isCheckoutOpen && activeCategory === 'all' ? 'fill-blue-600/10' : ''}`} />
            <span className="text-[10px] font-black uppercase tracking-tight">Store</span>
          </button>

          <button
            onClick={() => {
              setTrackOrderNumber(currentUser ? currentUser.phone : '');
              handleNavigateToView('tracker');
            }}
            className={`flex flex-col items-center justify-center w-full gap-1 transition-all ${
              currentView === 'tracker' && !isCheckoutOpen ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <PackageCheck className={`w-5 h-5 ${currentView === 'tracker' && !isCheckoutOpen ? 'fill-blue-600/10' : ''}`} />
            <span className="text-[10px] font-black uppercase tracking-tight">Tracker</span>
          </button>

          {/* Cart Center Button */}
          <div className="relative -top-3">
            <button
              onClick={() => {
                setIsCheckoutOpen(false);
                setIsCartOpen(true);
              }}
              className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/40 flex items-center justify-center transition-transform active:scale-90 cursor-pointer"
            >
              <div className="relative">
                <ShoppingBag className="w-6 h-6" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-rose-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white">
                    {cartItems.reduce((acc, i) => acc + i.quantity, 0)}
                  </span>
                )}
              </div>
            </button>
          </div>

          <button
            onClick={() => {
              handleNavigateToView('profile-orders');
            }}
            className={`flex flex-col items-center justify-center w-full gap-1 transition-all ${
              currentView === 'profile-orders' && !isCheckoutOpen ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Grid className={`w-5 h-5 ${currentView === 'profile-orders' && !isCheckoutOpen ? 'fill-blue-600/10' : ''}`} />
            <span className="text-[10px] font-black uppercase tracking-tight">Orders</span>
          </button>

          <button
            onClick={() => {
              handleNavigateToView('profile');
            }}
            className={`flex flex-col items-center justify-center w-full gap-1 transition-all ${
              currentView === 'profile' && !isCheckoutOpen ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <UserIcon className={`w-5 h-5 ${currentView === 'profile' && !isCheckoutOpen ? 'fill-blue-600/10' : ''}`} />
            <span className="text-[10px] font-black uppercase tracking-tight">Profile</span>
          </button>
        </div>
      </div>

      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onProceedToCheckout={handleProceedCartCheckout}
        onOpenFullCart={() => setCurrentView('cart')}
        onSelectProduct={(p) => {
          setSelectedProductForDetail(p);
          setCurrentView('store');
        }}
        onClearCart={() => setCartItems([])}
        popularProducts={products.slice(0, 4)}
        onAddToCart={handleAddToCart}
      />

      {/* Dynamic Event Popup Overlay */}
      {!isEventPopupDismissed && settings.active_event_popup_id && (
        (() => {
          const activeEvent = settings.events?.find(e => e.id === settings.active_event_popup_id && e.active && e.show_as_popup);
          if (!activeEvent) return null;
          return (
            <EventPopup 
              event={activeEvent}
              onClose={() => {
                setIsEventPopupDismissed(true);
                try { sessionStorage.setItem('veloral_event_dismissed', 'true'); } catch {}
              }}
            />
          );
        })()
      )}
    </div>
  );
}
