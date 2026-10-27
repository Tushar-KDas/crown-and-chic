export type ProductStatus = 'draft' | 'published' | 'archived';
export type OrderStatus = 'pending_confirmation' | 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'returned' | 'refunded';
export type PaymentStatus = 'unpaid' | 'pending_verification' | 'paid' | 'failed' | 'refunded';
export type PaymentMethodCode = 'cod' | 'bkash' | 'nagad' | 'rocket' | 'bank_transfer';
export type UserRole = 'super_admin' | 'admin' | 'moderator' | 'customer';

export interface AppUser {
  id: string;
  email: string;
  password?: string;
  full_name: string;
  phone: string;
  role: UserRole;
  status: 'active' | 'suspended';
  created_at: string;
  last_login_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  sort_order: number;
  is_active: boolean;
  product_count?: number;
}

export interface ProductAttributeValue {
  id: string;
  attribute_id: string;
  attribute_name: string; // e.g. "Size", "Color"
  value: string; // e.g. "S", "M", "Pink", "Black"
  color_hex?: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  regular_price: number;
  sale_price: number | null;
  stock_quantity: number;
  low_stock_threshold: number;
  is_active: boolean;
  image_url?: string;
  attributes: {
    size?: string;
    color?: string;
    [key: string]: string | undefined;
  };
}

export interface ProductImage {
  id: string;
  product_id: string;
  variant_id?: string;
  image_url: string;
  alt_text?: string;
  is_primary: boolean;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  sku?: string;
  short_description?: string;
  description?: string;
  base_price: number;
  base_sale_price: number | null;
  status: ProductStatus;
  is_featured: boolean;
  is_bestseller: boolean;
  is_new_arrival: boolean;
  is_on_sale: boolean;
  rating: number;
  review_count: number;
  images: ProductImage[];
  variants: ProductVariant[];
  categories: Category[];
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  product_id: string;
  variant_id: string;
  product: Product;
  variant: ProductVariant;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string;
  product_title: string;
  variant_title: string;
  sku: string;
  unit_price: number;
  quantity: number;
  total_price: number;
  image_url?: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  division: string;
  district: string;
  thana: string;
  full_address: string;
  delivery_notes?: string | null;
  subtotal: number;
  shipping_charge: number;
  discount_amount: number;
  total_amount: number;
  payment_method: PaymentMethodCode;
  order_status: OrderStatus;
  payment_status: PaymentStatus;
  is_flagged_for_review: boolean;
  risk_score: number;
  risk_reasons?: string[];
  items: OrderItem[];
  payment_submission?: PaymentSubmission;
  created_at: string;
  updated_at: string;
}

export interface PaymentSubmission {
  id: string;
  order_id: string;
  payment_method: PaymentMethodCode;
  transaction_id: string;
  sender_phone: string;
  amount: number;
  screenshot_url?: string;
  status: 'pending' | 'verified' | 'rejected';
  admin_notes?: string;
  verified_by?: string;
  verified_at?: string;
  created_at: string;
}

export interface PaymentMethodConfig {
  code: PaymentMethodCode;
  name: string;
  description: string;
  is_active: boolean;
  account_type?: string;
  recipient_number?: string;
  instructions: string;
  sort_order: number;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  desktop_image: string;
  mobile_image?: string;
  cta_text?: string;
  cta_link?: string;
  is_active: boolean;
  sort_order: number;
}

export interface SiteSettings {
  announcement_bar: {
    enabled: boolean;
    text: string;
  };
  brand_info: {
    name: string;
    tagline: string;
    address: string;
    phone: string;
    email: string;
    whatsapp: string;
  };
  social_links: {
    facebook: string;
    instagram: string;
    youtube: string;
    tiktok: string;
    twitter: string;
  };
  shipping_rates: {
    inside_dhaka: number;
    outside_dhaka: number;
    free_shipping_threshold: number;
  };
}
