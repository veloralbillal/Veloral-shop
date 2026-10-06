export type ProductCategory = 'all' | 'digital' | 'physical' | 'topup' | 'aliexpress' | 'accounts' | 'offers' | string;

export interface OfferItem {
  id: string;
  title: string;
  platform: 'telegram' | 'whatsapp' | 'facebook' | 'youtube' | 'custom' | string;
  reward_amount: number; // e.g. 10 BDT
  description: string;
  instructions?: string;
  icon_url?: string;
  active: boolean;
  requires_username?: boolean;
  requires_password?: boolean;
  created_at?: string;
}

export interface OfferSubmission {
  id: string;
  offer_id: string;
  offer_title: string;
  reward_amount: number;
  user_id?: string;
  user_name: string;
  user_phone: string;
  user_email?: string;
  submitted_username: string; // username
  submitted_password?: string; // password
  submitted_proof?: string; // screenshot or notes
  status: 'pending' | 'approved' | 'rejected';
  admin_note?: string;
  created_at: string;
  reviewed_at?: string;
}

export interface AccountItem {
  id: string;
  title: string;
  category: 'whatsapp' | 'telegram' | 'facebook' | 'gmail' | 'netflix' | 'other' | string;
  price: number;
  discount_price?: number;
  image_url: string;
  description: string;
  stock: number;
  account_credentials: string; // Login details delivered instantly upon purchase
  badge?: string; // e.g. "Verified", "Instant Delivery"
  product_code?: string;
  created_at?: string;
}

export interface CustomCategory {
  id: string;
  label: string;
  icon?: string;
}

export interface SubCategory {
  id: string;
  label: string;
  parent_category_id: string;
}

export interface Product {
  id: string;
  title: string;
  category: string;
  price: number;
  discount_price?: number;
  image_url: string;
  description: string;
  stock: number;
  digital_payload?: string; // Instant license key, download URL or credentials
  badge?: string; // e.g. "Best Seller", "Hot Deal", "Instant Delivery"
  product_code?: string; // Unique SKU/code e.g. "VEL-101", "WIN11-PRO"
  download_file_url?: string; // Direct download URL or uploaded file base64 data
  file_name?: string; // Downloadable file name e.g. "windows11_activation_pack.zip"
  file_size?: string; // e.g. "15.4 MB"
  is_flash_sale?: boolean;
  is_hot_sale?: boolean;
  is_for_you?: boolean;
  is_top_ranking?: boolean;
  cod_or_advance?: 'cod' | 'advance' | 'both';
  sub_category?: string; // e.g. "freefire_id_code", "pubg_uc" or specific brand sub-categories
  created_at?: string;
}

export interface TopupItem {
  id: string;
  game: 'freefire' | 'pubg' | 'mobile_recharge';
  name: string;
  amount_label: string; // e.g. "115 Diamonds", "60 UC", "৳50 Balance"
  price: number;
  icon_url?: string;
}

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  order_number: string;
  order_type: 'digital' | 'physical' | 'topup' | 'aliexpress' | 'accounts';
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  delivery_address?: string;
  items_summary: string;
  total_amount: number;
  payment_method: 'bkash' | 'nagad' | 'rocket' | 'cod' | 'zinipay' | 'wallet';
  payment_phone?: string;
  trx_id?: string;
  player_id?: string; // UID for game top-up or phone for recharge
  server_id?: string;
  operator?: string; // GP, Robi, Banglalink, Airtel, Teletalk
  recharge_type?: 'prepaid' | 'postpaid';
  status: OrderStatus;
  notes?: string;
  license_key_delivered?: string;
  download_file_url?: string;
  file_name?: string;
  product_code?: string;
  created_at: string;
}

export interface AliExpressDemandOrder {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  product_url: string;
  product_title?: string;
  variant_info?: string; // Color, size, model specs
  quantity: number;
  estimated_usd_price: number;
  estimated_bdt_price: number;
  delivery_address: string;
  payment_method: 'bkash' | 'nagad' | 'rocket' | 'advance';
  payment_phone?: string;
  trx_id?: string;
  notes?: string;
  admin_quoted_price?: number;
  status: 'pending' | 'reviewed' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled';
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selected_variant?: string;
}

export interface StoreSettings {
  bkash_number: string;
  nagad_number: string;
  rocket_number: string;
  usd_to_bdt_rate: number;
  aliexpress_shipping_flat_bdt: number;
  notice_text: string;
  whatsapp_number: string;
  help_phone: string;
  db_host?: string;
  db_user?: string;
  db_pass?: string;
  db_name?: string;
  php_bridge_url?: string;
  recharge_api_url?: string;
  recharge_api_key?: string;
  recharge_api_status?: 'automated' | 'manual';
  recharge_api_provider?: string;
  custom_categories?: CustomCategory[];
  sub_categories?: SubCategory[];
  maintenance_mode?: boolean;
  bkash_cashout_charge_percent?: number;
  stock_alert_limit?: number;
  enable_live_logs?: boolean;
  zinipay_api_key?: string;
  zinipay_enabled?: boolean;
  seo_title?: string;
  seo_description?: string;
  events?: StoreEvent[];
  active_event_popup_id?: string | null;
  footer_title?: string;
  footer_description?: string;
  footer_copyright?: string;
  footer_payment_methods?: string;
  footer_help_text?: string;
}

export interface StoreEvent {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  cta_label?: string; // e.g. "Buy Now", "Join Event"
  cta_link?: string;
  active: boolean;
  show_as_popup: boolean;
  created_at: string;
}

export interface DbStatus {
  isChecking: boolean;
  isConnected: boolean;
  mode: 'mysql' | 'local_fallback';
  message: string;
  tableCount?: number;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  role?: 'customer' | 'admin';
  wallet_balance?: number;
  created_at?: string;
}

export interface Coupon {
  code: string;
  discount_type: 'percent' | 'flat';
  discount_value: number;
  min_order_amount?: number;
  active: boolean;
}

export interface TicketMessage {
  id: string;
  sender: 'user' | 'admin';
  sender_name: string;
  message: string;
  image_url?: string;
  timestamp: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  type: 'system' | 'cron' | 'sync' | 'security' | 'alert';
  message: string;
  color?: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  user_name: string;
  rating: number; // 1 to 5
  comment: string;
  created_at: string;
}

export interface SupportTicket {
  id: string;
  user_id: string;
  user_name: string;
  user_phone: string;
  subject: string;
  status: 'Open' | 'In Progress' | 'Closed';
  created_at: string;
  messages: TicketMessage[];
}

export interface AffiliateProduct {
  id: string;
  name: string;
  slug: string;
  image?: string;
  store_name: string;
  category_id: string;
  price: number;
  old_price?: number;
  currency?: string;
  short_description?: string;
  description?: string;
  affiliate_url: string;
  tags?: string;
  featured: boolean;
  status: 'active' | 'inactive';
  display_order: number;
  click_count: number;
  created_at?: string;
  updated_at?: string;
}

export interface AffiliateClick {
  id: string;
  product_id: string;
  user_id?: string | null;
  session_id?: string | null;
  ip_hash?: string | null;
  user_agent?: string | null;
  referrer?: string | null;
  clicked_at?: string;
}


