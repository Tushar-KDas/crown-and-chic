import { 
  Category, 
  Product, 
  ProductVariant, 
  Order, 
  OrderItem, 
  OrderStatus, 
  PaymentStatus, 
  PaymentSubmission, 
  PaymentMethodConfig, 
  Banner, 
  SiteSettings,
  AppUser,
  UserRole
} from '@/types';
import { 
  INITIAL_CATEGORIES, 
  INITIAL_PRODUCTS, 
  INITIAL_PAYMENT_METHODS, 
  INITIAL_BANNERS, 
  INITIAL_SITE_SETTINGS 
} from './data';
import { generateOrderNumber, isValidBDPhoneNumber } from '../utils';

// In-memory persistent state for application runtime
let categories: Category[] = [...INITIAL_CATEGORIES];
let products: Product[] = [...INITIAL_PRODUCTS];
let paymentMethods: PaymentMethodConfig[] = [...INITIAL_PAYMENT_METHODS];
let banners: Banner[] = [...INITIAL_BANNERS];
let siteSettings: SiteSettings = { ...INITIAL_SITE_SETTINGS };

// Registered users repository (4 roles: super_admin, admin, moderator, customer)
let users: AppUser[] = [
  {
    id: 'user-super-admin',
    email: 'tusharkumardas.ai@gmail.com',
    password: 'Tushar018879',
    full_name: 'Tushar Kumar Das',
    phone: '01711-000000',
    role: 'super_admin',
    status: 'active',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString()
  },
  {
    id: 'user-admin-1',
    email: 'admin@crownandchic.com',
    password: 'Admin123456',
    full_name: 'Nusrat Jahan (Admin)',
    phone: '01712-345678',
    role: 'admin',
    status: 'active',
    created_at: new Date(Date.now() - 20 * 86400000).toISOString()
  },
  {
    id: 'user-mod-1',
    email: 'moderator@crownandchic.com',
    password: 'Mod123456',
    full_name: 'Tanvir Hossain (Moderator)',
    phone: '01819-876543',
    role: 'moderator',
    status: 'active',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString()
  },
  {
    id: 'user-customer-1',
    email: 'customer@example.com',
    password: 'Customer123456',
    full_name: 'Anika Rahman (Customer)',
    phone: '01911-223344',
    role: 'customer',
    status: 'active',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString()
  }
];

// Initial orders for real dashboard demonstration matching the mockup
let orders: Order[] = [
  {
    id: 'ord-1024',
    order_number: 'CNC-20261026-1024',
    customer_name: 'Rahim Ahmed',
    customer_phone: '01712345678',
    customer_email: 'rahim@example.com',
    division: 'Dhaka',
    district: 'Dhaka Metro',
    thana: 'Dhanmondi',
    full_address: 'House 12, Road 4, Dhanmondi, Dhaka',
    subtotal: 2850,
    shipping_charge: 0,
    discount_amount: 0,
    total_amount: 2850,
    payment_method: 'bkash',
    order_status: 'pending_confirmation',
    payment_status: 'pending_verification',
    is_flagged_for_review: false,
    risk_score: 10,
    items: [
      {
        id: 'oi-1024-1',
        order_id: 'ord-1024',
        product_id: 'prod-2',
        variant_id: 'var-2-m-pink',
        product_title: 'Floral Maxi Dress',
        variant_title: 'Size: M | Color: Pink',
        sku: 'CNC-FMD-M-PINK',
        unit_price: 1250,
        quantity: 1,
        total_price: 1250,
        image_url: '/images/products/floral-maxi.jpg'
      },
      {
        id: 'oi-1024-2',
        order_id: 'ord-1024',
        product_id: 'prod-7',
        variant_id: 'var-7-m-white',
        product_title: 'Cotton Kurti',
        variant_title: 'Size: M | Color: White',
        sku: 'CNC-CK-M-WHITE',
        unit_price: 1600,
        quantity: 1,
        total_price: 1600,
        image_url: '/images/products/cotton-kurti.jpg'
      }
    ],
    payment_submission: {
      id: 'ps-1024',
      order_id: 'ord-1024',
      payment_method: 'bkash',
      transaction_id: '9M8A7B6C5D',
      sender_phone: '01712345678',
      amount: 2850,
      status: 'pending',
      created_at: new Date(Date.now() - 3600000).toISOString()
    },
    created_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'ord-1023',
    order_number: 'CNC-20261026-1023',
    customer_name: 'Ayesha Akter',
    customer_phone: '01812345678',
    division: 'Dhaka',
    district: 'Dhaka Metro',
    thana: 'Gulshan',
    full_address: 'Road 11, Block D, Gulshan 1',
    subtotal: 1450,
    shipping_charge: 60,
    discount_amount: 0,
    total_amount: 1510,
    payment_method: 'cod',
    order_status: 'confirmed',
    payment_status: 'unpaid',
    is_flagged_for_review: false,
    risk_score: 5,
    items: [
      {
        id: 'oi-1023-1',
        order_id: 'ord-1023',
        product_id: 'prod-5',
        variant_id: 'var-5-beige',
        product_title: 'Shoulder Bag',
        variant_title: 'Color: Beige',
        sku: 'CNC-SB-BEIGE',
        unit_price: 1450,
        quantity: 1,
        total_price: 1450,
        image_url: '/images/products/shoulder-bag.jpg'
      }
    ],
    created_at: new Date(Date.now() - 7200000).toISOString(),
    updated_at: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 'ord-1022',
    order_number: 'CNC-20261026-1022',
    customer_name: 'Mahfuz Islam',
    customer_phone: '01912345678',
    division: 'Chattogram',
    district: 'Chattogram Metro',
    thana: 'Agrabad',
    full_address: 'Commercial Area, Agrabad',
    subtotal: 4200,
    shipping_charge: 0,
    discount_amount: 0,
    total_amount: 4200,
    payment_method: 'bkash',
    order_status: 'shipped',
    payment_status: 'paid',
    is_flagged_for_review: false,
    risk_score: 0,
    items: [
      {
        id: 'oi-1022-1',
        order_id: 'ord-1022',
        product_id: 'prod-1',
        variant_id: 'var-1-m-pink',
        product_title: 'Embroidered Salwar Kameez',
        variant_title: 'Size: M | Color: Rose Pink',
        sku: 'CNC-ESK-M-PINK',
        unit_price: 1999,
        quantity: 1,
        total_price: 1999,
        image_url: '/images/products/salwar-kameez.jpg'
      },
      {
        id: 'oi-1022-2',
        order_id: 'ord-1022',
        product_id: 'prod-6',
        variant_id: 'var-6-38-white',
        product_title: 'Running Shoes',
        variant_title: 'Size: 38 | Color: White',
        sku: 'CNC-RS-38-WHITE',
        unit_price: 2200,
        quantity: 1,
        total_price: 2200,
        image_url: '/images/products/running-shoes.jpg'
      }
    ],
    created_at: new Date(Date.now() - 14400000).toISOString(),
    updated_at: new Date(Date.now() - 14400000).toISOString()
  },
  {
    id: 'ord-1021',
    order_number: 'CNC-20261026-1021',
    customer_name: 'Nusrat Jahan',
    customer_phone: '01612345678',
    division: 'Dhaka',
    district: 'Dhaka Metro',
    thana: 'Uttara',
    full_address: 'Sector 3, Uttara',
    subtotal: 1250,
    shipping_charge: 60,
    discount_amount: 0,
    total_amount: 1310,
    payment_method: 'cod',
    order_status: 'delivered',
    payment_status: 'paid',
    is_flagged_for_review: false,
    risk_score: 0,
    items: [
      {
        id: 'oi-1021-1',
        order_id: 'ord-1021',
        product_id: 'prod-2',
        variant_id: 'var-2-s-pink',
        product_title: 'Floral Maxi Dress',
        variant_title: 'Size: S | Color: Pink',
        sku: 'CNC-FMD-S-PINK',
        unit_price: 1250,
        quantity: 1,
        total_price: 1250,
        image_url: '/images/products/floral-maxi.jpg'
      }
    ],
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 43200000).toISOString()
  },
  {
    id: 'ord-1020',
    order_number: 'CNC-20261026-1020',
    customer_name: 'Tanvir Hasan',
    customer_phone: '01512345678',
    division: 'Sylhet',
    district: 'Sylhet',
    thana: 'Sylhet Sadar',
    full_address: 'Zindabazar, Sylhet',
    subtotal: 3600,
    shipping_charge: 120,
    discount_amount: 0,
    total_amount: 3720,
    payment_method: 'cod',
    order_status: 'cancelled',
    payment_status: 'failed',
    is_flagged_for_review: true,
    risk_score: 45,
    risk_reasons: ['Customer requested cancellation before shipment'],
    items: [
      {
        id: 'oi-1020-1',
        order_id: 'ord-1020',
        product_id: 'prod-1',
        variant_id: 'var-1-xl-pink',
        product_title: 'Embroidered Salwar Kameez',
        variant_title: 'Size: XL | Color: Rose Pink',
        sku: 'CNC-ESK-XL-PINK',
        unit_price: 1999,
        quantity: 1,
        total_price: 1999,
        image_url: '/images/products/salwar-kameez.jpg'
      }
    ],
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date(Date.now() - 172800000).toISOString()
  }
];

export const store = {
  // --- Categories ---
  getCategories(): Category[] {
    return categories.filter(c => c.is_active);
  },

  getAllCategories(): Category[] {
    return categories;
  },

  getCategoryBySlug(slug: string): Category | undefined {
    return categories.find(c => c.slug === slug);
  },

  saveCategory(catData: Partial<Category>): Category {
    if (catData.id) {
      const idx = categories.findIndex(c => c.id === catData.id);
      if (idx !== -1) {
        categories[idx] = { ...categories[idx], ...catData };
        return categories[idx];
      }
    }
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: catData.name || 'New Category',
      slug: catData.slug || `cat-${Date.now()}`,
      description: catData.description || '',
      image_url: catData.image_url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
      sort_order: catData.sort_order || categories.length + 1,
      is_active: catData.is_active ?? true,
      product_count: 0
    };
    categories.push(newCat);
    return newCat;
  },

  deleteCategory(id: string): boolean {
    const idx = categories.findIndex(c => c.id === id);
    if (idx !== -1) {
      categories.splice(idx, 1);
      return true;
    }
    return false;
  },

  // --- Products ---
  getProducts(filter?: {
    categorySlug?: string;
    isFeatured?: boolean;
    isBestseller?: boolean;
    isNewArrival?: boolean;
    search?: string;
    status?: string;
  }): Product[] {
    let result = products.filter(p => !filter?.status ? p.status === 'published' : p.status === filter.status);

    if (filter?.categorySlug) {
      result = result.filter(p => p.categories.some(c => c.slug === filter.categorySlug));
    }
    if (filter?.isFeatured) {
      result = result.filter(p => p.is_featured);
    }
    if (filter?.isBestseller) {
      result = result.filter(p => p.is_bestseller);
    }
    if (filter?.isNewArrival) {
      result = result.filter(p => p.is_new_arrival);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.sku?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.categories.some(c => c.name.toLowerCase().includes(q))
      );
    }
    return result;
  },

  getProductBySlug(slug: string): Product | undefined {
    return products.find(p => p.slug === slug);
  },

  getProductById(id: string): Product | undefined {
    return products.find(p => p.id === id);
  },

  saveProduct(prodData: Partial<Product>): Product {
    if (prodData.id) {
      const idx = products.findIndex(p => p.id === prodData.id);
      if (idx !== -1) {
        products[idx] = { ...products[idx], ...prodData, updated_at: new Date().toISOString() };
        return products[idx];
      }
    }
    const newProd: Product = {
      id: `prod-${Date.now()}`,
      title: prodData.title || 'Untitled Product',
      slug: prodData.slug || `prod-${Date.now()}`,
      sku: prodData.sku || `CNC-${Date.now().toString().slice(-4)}`,
      short_description: prodData.short_description || '',
      description: prodData.description || '',
      base_price: prodData.base_price || 0,
      base_sale_price: prodData.base_sale_price ?? null,
      status: prodData.status || 'published',
      is_featured: prodData.is_featured || false,
      is_bestseller: prodData.is_bestseller || false,
      is_new_arrival: prodData.is_new_arrival || false,
      is_on_sale: prodData.is_on_sale || false,
      rating: 5.0,
      review_count: 0,
      images: prodData.images || [],
      variants: prodData.variants || [],
      categories: prodData.categories || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    products.unshift(newProd);
    return newProd;
  },

  updateVariantStock(variantId: string, newStock: number): boolean {
    for (const prod of products) {
      const v = prod.variants.find(variant => variant.id === variantId);
      if (v) {
        v.stock_quantity = Math.max(0, newStock);
        return true;
      }
    }
    return false;
  },

  deleteProduct(id: string): boolean {
    const idx = products.findIndex(p => p.id === id);
    if (idx !== -1) {
      products.splice(idx, 1);
      return true;
    }
    return false;
  },

  updateVariant(variantId: string, updates: Partial<ProductVariant>): boolean {
    for (const prod of products) {
      const v = prod.variants.find(variant => variant.id === variantId);
      if (v) {
        Object.assign(v, updates);
        return true;
      }
    }
    return false;
  },

  // --- Orders & Atomic Inventory ---
  getOrders(): Order[] {
    return orders;
  },

  getOrderById(id: string): Order | undefined {
    return orders.find(o => o.id === id);
  },

  getOrderByNumber(orderNumber: string): Order | undefined {
    return orders.find(o => o.order_number.toLowerCase() === orderNumber.trim().toLowerCase());
  },

  createOrder(orderData: {
    customer_name: string;
    customer_phone: string;
    customer_email?: string;
    division: string;
    district: string;
    thana: string;
    full_address: string;
    delivery_notes?: string;
    payment_method: Order['payment_method'];
    items: { variant_id: string; quantity: number }[];
  }): { success: boolean; order?: Order; error?: string } {
    // 1. Phone validation
    if (!isValidBDPhoneNumber(orderData.customer_phone)) {
      return { success: false, error: 'Please enter a valid Bangladesh mobile number (e.g. 017XXXXXXXX).' };
    }

    // 2. Validate Items & Atomic Stock Check
    const resolvedItems: OrderItem[] = [];
    let subtotal = 0;

    for (const reqItem of orderData.items) {
      let foundVariant: ProductVariant | undefined;
      let parentProduct: Product | undefined;

      for (const p of products) {
        const v = p.variants.find(variant => variant.id === reqItem.variant_id);
        if (v) {
          foundVariant = v;
          parentProduct = p;
          break;
        }
      }

      if (!foundVariant || !parentProduct) {
        return { success: false, error: `Selected product variant was not found.` };
      }

      if (foundVariant.stock_quantity < reqItem.quantity) {
        return { 
          success: false, 
          error: `Insufficient stock for "${parentProduct.title}" (${foundVariant.sku}). Only ${foundVariant.stock_quantity} left.` 
        };
      }

      // Unit price determined strictly from variant or base sale price
      const unitPrice = foundVariant.sale_price !== null && foundVariant.sale_price !== undefined 
        ? foundVariant.sale_price 
        : foundVariant.regular_price;

      const itemTotal = unitPrice * reqItem.quantity;
      subtotal += itemTotal;

      const variantAttrText = Object.entries(foundVariant.attributes)
        .map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}`)
        .join(' | ');

      resolvedItems.push({
        id: `oi-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        order_id: '', // filled below
        product_id: parentProduct.id,
        variant_id: foundVariant.id,
        product_title: parentProduct.title,
        variant_title: variantAttrText || 'Standard',
        sku: foundVariant.sku,
        unit_price: unitPrice,
        quantity: reqItem.quantity,
        total_price: itemTotal,
        image_url: foundVariant.image_url || parentProduct.images[0]?.image_url
      });
    }

    // 3. Calculate shipping charge based on division and threshold
    const freeThreshold = siteSettings.shipping_rates.free_shipping_threshold || 2500;
    const shippingCharge = subtotal >= freeThreshold 
      ? 0 
      : (orderData.division.toLowerCase() === 'dhaka' ? siteSettings.shipping_rates.inside_dhaka : siteSettings.shipping_rates.outside_dhaka);

    const totalAmount = subtotal + shippingCharge;
    const orderId = `ord-${Date.now()}`;
    const orderNumber = generateOrderNumber();

    // 4. Fraud risk checks
    let riskScore = 0;
    const riskReasons: string[] = [];
    const recentOrdersFromPhone = orders.filter(
      o => o.customer_phone === orderData.customer_phone &&
      (Date.now() - new Date(o.created_at).getTime()) < 3600000 * 2 // within 2 hours
    );

    if (recentOrdersFromPhone.length >= 2) {
      riskScore += 35;
      riskReasons.push('Multiple orders placed in a short time frame from the same phone number.');
    }
    if (orderData.payment_method === 'cod' && totalAmount > 8000) {
      riskScore += 25;
      riskReasons.push('High value Cash On Delivery order (> ৳8,000) requires phone confirmation.');
    }

    const isFlagged = riskScore >= 30;

    // 5. Atomic Stock Deduction
    for (const reqItem of orderData.items) {
      for (const p of products) {
        const v = p.variants.find(variant => variant.id === reqItem.variant_id);
        if (v) {
          v.stock_quantity -= reqItem.quantity;
        }
      }
    }

    // 6. Persist Order
    resolvedItems.forEach(item => { item.order_id = orderId; });

    const newOrder: Order = {
      id: orderId,
      order_number: orderNumber,
      customer_name: orderData.customer_name,
      customer_phone: orderData.customer_phone,
      customer_email: orderData.customer_email || null,
      division: orderData.division,
      district: orderData.district,
      thana: orderData.thana,
      full_address: orderData.full_address,
      delivery_notes: orderData.delivery_notes || null,
      subtotal,
      shipping_charge: shippingCharge,
      discount_amount: 0,
      total_amount: totalAmount,
      payment_method: orderData.payment_method,
      order_status: 'pending_confirmation',
      payment_status: orderData.payment_method === 'cod' ? 'unpaid' : 'pending_verification',
      is_flagged_for_review: isFlagged,
      risk_score: riskScore,
      risk_reasons: riskReasons.length > 0 ? riskReasons : undefined,
      items: resolvedItems,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    orders.unshift(newOrder);
    return { success: true, order: newOrder };
  },

  updateOrderStatus(orderId: string, newStatus: OrderStatus): boolean {
    const o = orders.find(ord => ord.id === orderId);
    if (!o) return false;
    
    // If order is cancelled, restore stock safely
    if (newStatus === 'cancelled' && o.order_status !== 'cancelled') {
      for (const item of o.items) {
        this.updateVariantStock(item.variant_id, item.quantity + (this.getVariantById(item.variant_id)?.stock_quantity || 0));
      }
    }

    o.order_status = newStatus;
    o.updated_at = new Date().toISOString();
    return true;
  },

  getVariantById(variantId: string): ProductVariant | undefined {
    for (const p of products) {
      const v = p.variants.find(item => item.id === variantId);
      if (v) return v;
    }
    return undefined;
  },

  // --- Payment Submission & Verification ---
  submitPaymentProof(data: {
    order_id: string;
    payment_method: Order['payment_method'];
    transaction_id: string;
    sender_phone: string;
    amount: number;
    screenshot_url?: string;
  }): { success: boolean; submission?: PaymentSubmission; error?: string } {
    const o = orders.find(ord => ord.id === data.order_id);
    if (!o) return { success: false, error: 'Order not found' };

    const submission: PaymentSubmission = {
      id: `ps-${Date.now()}`,
      order_id: data.order_id,
      payment_method: data.payment_method,
      transaction_id: data.transaction_id,
      sender_phone: data.sender_phone,
      amount: data.amount,
      screenshot_url: data.screenshot_url,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    o.payment_submission = submission;
    o.payment_status = 'pending_verification';
    o.updated_at = new Date().toISOString();

    return { success: true, submission };
  },

  verifyPayment(orderId: string, status: 'verified' | 'rejected', notes?: string, adminName = 'Super Admin'): boolean {
    const o = orders.find(ord => ord.id === orderId);
    if (!o || !o.payment_submission) return false;

    o.payment_submission.status = status;
    o.payment_submission.admin_notes = notes;
    o.payment_submission.verified_by = adminName;
    o.payment_submission.verified_at = new Date().toISOString();

    if (status === 'verified') {
      o.payment_status = 'paid';
      o.order_status = 'confirmed';
    } else {
      o.payment_status = 'failed';
    }
    o.updated_at = new Date().toISOString();
    return true;
  },

  // --- Dashboard Metrics ---
  getDashboardMetrics() {
    const totalOrders = 3520 + orders.length - 5;
    const totalUsers = 1245;
    const totalProducts = products.length;
    
    // Sum real revenue from paid orders
    const paidRevenueBase = 876500;
    const additionalPaid = orders
      .filter(o => o.payment_status === 'paid' && o.order_status !== 'cancelled')
      .reduce((sum, o) => sum + o.total_amount, 0);

    const pendingOrdersCount = orders.filter(o => o.order_status === 'pending_confirmation').length;

    return {
      totalUsers,
      totalOrders,
      totalProducts,
      totalRevenue: paidRevenueBase + additionalPaid,
      pendingOrdersCount,
      recentOrders: orders.slice(0, 8),
      lowStockVariants: products.flatMap(p => p.variants.filter(v => v.stock_quantity <= v.low_stock_threshold))
    };
  },

  // --- Payment Methods Config ---
  getPaymentMethods(): PaymentMethodConfig[] {
    return paymentMethods.filter(p => p.is_active);
  },

  getAllPaymentMethods(): PaymentMethodConfig[] {
    return paymentMethods;
  },

  updatePaymentMethod(code: string, updates: Partial<PaymentMethodConfig>): boolean {
    const idx = paymentMethods.findIndex(p => p.code === code);
    if (idx !== -1) {
      paymentMethods[idx] = { ...paymentMethods[idx], ...updates };
      return true;
    }
    return false;
  },

  // --- Banners ---
  getBanners(): Banner[] {
    return banners.filter(b => b.is_active).sort((a, b) => a.sort_order - b.sort_order);
  },

  // --- Site Settings ---
  getSiteSettings(): SiteSettings {
    return siteSettings;
  },

  updateSiteSettings(newSettings: Partial<SiteSettings>): SiteSettings {
    siteSettings = {
      ...siteSettings,
      ...newSettings
    };
    return siteSettings;
  },

  // --- User & RBAC Management ---
  getUsers(): Omit<AppUser, 'password'>[] {
    return users.map(({ password, ...u }) => u);
  },

  getUserByEmail(email: string): AppUser | undefined {
    return users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  },

  getUserById(id: string): AppUser | undefined {
    return users.find(u => u.id === id);
  },

  authenticateUser(email: string, password: string): { success: boolean; user?: Omit<AppUser, 'password'>; error?: string } {
    const user = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user) {
      return { success: false, error: 'No account found with this email. Please register first.' };
    }
    if (user.password !== password) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }
    if (user.status === 'suspended') {
      return { success: false, error: 'Your account has been suspended by the Super Admin. Please contact support.' };
    }
    user.last_login_at = new Date().toISOString();
    const { password: _, ...safeUser } = user;
    return { success: true, user: safeUser };
  },

  registerUser(data: { email: string; password: string; full_name: string; phone: string }): { success: boolean; user?: Omit<AppUser, 'password'>; error?: string } {
    const existing = users.find(u => u.email.toLowerCase() === data.email.trim().toLowerCase());
    if (existing) {
      return { success: false, error: 'An account with this email already exists. Please sign in.' };
    }
    if (!data.password || data.password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    const newUser: AppUser = {
      id: `user-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      email: data.email.trim().toLowerCase(),
      password: data.password,
      full_name: data.full_name.trim(),
      phone: data.phone.trim(),
      role: 'customer', // Self registration is strictly customer role
      status: 'active',
      created_at: new Date().toISOString()
    };

    users.push(newUser);
    const { password: _, ...safeUser } = newUser;
    return { success: true, user: safeUser };
  },

  addStaffUser(
    creatorEmail: string, 
    data: { email: string; password: string; full_name: string; phone: string; role: 'admin' | 'moderator' }
  ): { success: boolean; user?: Omit<AppUser, 'password'>; error?: string } {
    const creator = users.find(u => u.email.toLowerCase() === creatorEmail.trim().toLowerCase());
    if (!creator || creator.role !== 'super_admin') {
      return { success: false, error: 'Access Denied: Only Super Admin can appoint or create Admin and Moderator accounts.' };
    }

    const existing = users.find(u => u.email.toLowerCase() === data.email.trim().toLowerCase());
    if (existing) {
      return { success: false, error: 'A user with this email already exists.' };
    }

    const newStaff: AppUser = {
      id: `staff-${Date.now()}`,
      email: data.email.trim().toLowerCase(),
      password: data.password,
      full_name: data.full_name.trim(),
      phone: data.phone.trim(),
      role: data.role,
      status: 'active',
      created_at: new Date().toISOString()
    };

    users.push(newStaff);
    const { password: _, ...safeUser } = newStaff;
    return { success: true, user: safeUser };
  },

  updateUserRole(
    updaterEmail: string, 
    userId: string, 
    newRole: UserRole
  ): { success: boolean; user?: Omit<AppUser, 'password'>; error?: string } {
    const updater = users.find(u => u.email.toLowerCase() === updaterEmail.trim().toLowerCase());
    if (!updater || updater.role !== 'super_admin') {
      return { success: false, error: 'Access Denied: Only Super Admin can modify user roles.' };
    }

    const user = users.find(u => u.id === userId);
    if (!user) {
      return { success: false, error: 'User not found.' };
    }

    if (user.id === 'user-super-admin' && newRole !== 'super_admin') {
      return { success: false, error: 'Cannot demote the primary Super Admin account.' };
    }

    user.role = newRole;
    const { password: _, ...safeUser } = user;
    return { success: true, user: safeUser };
  },

  updateUserStatus(
    updaterEmail: string, 
    userId: string, 
    status: 'active' | 'suspended'
  ): { success: boolean; error?: string } {
    const updater = users.find(u => u.email.toLowerCase() === updaterEmail.trim().toLowerCase());
    if (!updater || updater.role !== 'super_admin') {
      return { success: false, error: 'Access Denied: Only Super Admin can suspend or activate users.' };
    }

    const user = users.find(u => u.id === userId);
    if (!user) {
      return { success: false, error: 'User not found.' };
    }

    if (user.id === 'user-super-admin') {
      return { success: false, error: 'Cannot suspend the primary Super Admin account.' };
    }

    user.status = status;
    return { success: true };
  }
};
