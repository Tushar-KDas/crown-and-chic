'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  LayoutDashboard, 
  Users, 
  ShieldAlert, 
  FolderTree, 
  Package, 
  Layers, 
  ShoppingBag, 
  Boxes, 
  Settings, 
  LogOut, 
  CheckCircle, 
  XCircle, 
  Clock, 
  TrendingUp, 
  Search, 
  Eye, 
  CreditCard, 
  AlertTriangle,
  Save,
  ArrowLeft,
  ArrowRight,
  Crown,
  UserPlus,
  ShieldCheck,
  Lock,
  UserX,
  MessageSquare,
  AlertCircle,
  KeyRound,
  Filter,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Sparkles,
  Tag
} from 'lucide-react';
import { Order, Product, ProductVariant, Category, PaymentMethodConfig, SiteSettings, OrderStatus, AppUser, UserRole } from '@/types';
import { formatBDT } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

interface AdminDashboardClientProps {
  initialOrders: Order[];
  products: Product[];
  categories: Category[];
  paymentMethods: PaymentMethodConfig[];
  siteSettings: SiteSettings;
  initialUsers?: AppUser[];
}

export function AdminDashboardClient({
  initialOrders,
  products: initialProducts,
  categories,
  paymentMethods,
  siteSettings: initialSettings,
  initialUsers = []
}: AdminDashboardClientProps) {
  const { user, isStaff, isSuperAdmin, isAdmin, isModerator, logout, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'users' | 'fraud' | 'categories' | 'products' | 'variations' | 'orders' | 'stock' | 'payments' | 'settings'
  >('dashboard');

  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(initialSettings);

  // Status Filter for Orders tab
  const [orderFilter, setOrderFilter] = useState<string>('all');
  const [orderSearch, setOrderSearch] = useState('');

  // Selected Order for Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Settings form states
  const [announcementText, setAnnouncementText] = useState(siteSettings.announcement_bar.text);
  const [bkashNumber, setBkashNumber] = useState(paymentMethods.find(p => p.code === 'bkash')?.recipient_number || '01711-XXXXXX');
  const [nagadNumber, setNagadNumber] = useState(paymentMethods.find(p => p.code === 'nagad')?.recipient_number || '01722-XXXXXX');
  const [rocketNumber, setRocketNumber] = useState(paymentMethods.find(p => p.code === 'rocket')?.recipient_number || '01853-XXXXXX');
  const [insideDhakaFee, setInsideDhakaFee] = useState(siteSettings.shipping_rates.inside_dhaka);
  const [outsideDhakaFee, setOutsideDhakaFee] = useState(siteSettings.shipping_rates.outside_dhaka);
  const [freeThreshold, setFreeThreshold] = useState(siteSettings.shipping_rates.free_shipping_threshold);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Stock editor state
  const [stockUpdates, setStockUpdates] = useState<{ [variantId: string]: number }>({});
  const [stockSuccess, setStockSuccess] = useState('');

  // =========================================================================
  // CATEGORIES MANAGEMENT STATE & HANDLERS
  // =========================================================================
  const [categoriesList, setCategoriesList] = useState<Category[]>(categories);
  const [categorySearch, setCategorySearch] = useState('');
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    description: '',
    image_url: '/images/categories/womens-fashion.jpg',
    sort_order: 1,
    is_active: true
  });
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [categoryActionMsg, setCategoryActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const openAddCategoryModal = () => {
    setEditingCategory(null);
    setCategoryForm({
      name: '',
      slug: '',
      description: '',
      image_url: '/images/categories/womens-fashion.jpg',
      sort_order: categoriesList.length + 1,
      is_active: true
    });
    setCategoryModalOpen(true);
  };

  const openEditCategoryModal = (cat: Category) => {
    setEditingCategory(cat);
    setCategoryForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      image_url: cat.image_url || '/images/categories/womens-fashion.jpg',
      sort_order: cat.sort_order || 1,
      is_active: cat.is_active
    });
    setCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingCategory(true);
    setCategoryActionMsg(null);
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingCategory?.id,
          ...categoryForm
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save category');
      }

      if (editingCategory) {
        setCategoriesList(prev => prev.map(c => c.id === data.category.id ? data.category : c));
        setCategoryActionMsg({ type: 'success', text: `Category "${data.category.name}" updated successfully!` });
      } else {
        setCategoriesList(prev => [...prev, data.category]);
        setCategoryActionMsg({ type: 'success', text: `New category "${data.category.name}" created!` });
      }
      setCategoryModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save category';
      setCategoryActionMsg({ type: 'error', text: msg });
    } finally {
      setIsSavingCategory(false);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete category "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCategoriesList(prev => prev.filter(c => c.id !== id));
        setCategoryActionMsg({ type: 'success', text: `Category "${name}" deleted.` });
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to delete');
      }
    } catch {
      alert('Network error deleting category');
    }
  };

  const handleToggleCategoryActive = async (cat: Category) => {
    const updated = { ...cat, is_active: !cat.is_active };
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      if (res.ok) {
        setCategoriesList(prev => prev.map(c => c.id === cat.id ? updated : c));
      }
    } catch {
      alert('Error updating status');
    }
  };

  // =========================================================================
  // PRODUCTS MANAGEMENT STATE & HANDLERS
  // =========================================================================
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [productStatusFilter, setProductStatusFilter] = useState('all');
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    title: '',
    slug: '',
    sku: '',
    category_slug: 'womens-fashion',
    base_price: 1500,
    base_sale_price: '' as string | number,
    short_description: '',
    description: '',
    image_url: '/images/products/cotton-kurti.jpg',
    status: 'published' as 'published' | 'draft' | 'archived',
    is_featured: false,
    is_bestseller: false,
    is_new_arrival: false,
    initial_stock: 50
  });
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [productActionMsg, setProductActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const openAddProductModal = () => {
    setEditingProduct(null);
    setProductForm({
      title: '',
      slug: '',
      sku: `CNC-${Date.now().toString().slice(-4)}`,
      category_slug: categoriesList[0]?.slug || 'womens-fashion',
      base_price: 1500,
      base_sale_price: '',
      short_description: '',
      description: '',
      image_url: '/images/products/cotton-kurti.jpg',
      status: 'published',
      is_featured: false,
      is_bestseller: false,
      is_new_arrival: false,
      initial_stock: 50
    });
    setProductModalOpen(true);
  };

  const openEditProductModal = (prod: Product) => {
    setEditingProduct(prod);
    setProductForm({
      title: prod.title,
      slug: prod.slug,
      sku: prod.sku || '',
      category_slug: prod.categories[0]?.slug || 'womens-fashion',
      base_price: prod.base_price,
      base_sale_price: prod.base_sale_price ?? '',
      short_description: prod.short_description || '',
      description: prod.description || '',
      image_url: prod.images[0]?.image_url || '/images/products/cotton-kurti.jpg',
      status: prod.status,
      is_featured: prod.is_featured,
      is_bestseller: prod.is_bestseller,
      is_new_arrival: prod.is_new_arrival,
      initial_stock: prod.variants[0]?.stock_quantity || 30
    });
    setProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProduct(true);
    setProductActionMsg(null);

    const matchedCat = categoriesList.find(c => c.slug === productForm.category_slug) || categoriesList[0];
    const generatedSlug = productForm.slug.trim() || productForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    // Default variants if new
    const prodId = editingProduct?.id || `prod-${Date.now()}`;
    const defaultVariants: ProductVariant[] = editingProduct?.variants?.length ? editingProduct.variants : [
      {
        id: `var-${prodId}-s`,
        product_id: prodId,
        sku: `${productForm.sku}-S`,
        regular_price: Number(productForm.base_price),
        sale_price: productForm.base_sale_price ? Number(productForm.base_sale_price) : null,
        stock_quantity: Math.floor(Number(productForm.initial_stock) / 3) || 15,
        low_stock_threshold: 5,
        is_active: true,
        attributes: { size: 'S', color: 'Rose Pink' }
      },
      {
        id: `var-${prodId}-m`,
        product_id: prodId,
        sku: `${productForm.sku}-M`,
        regular_price: Number(productForm.base_price),
        sale_price: productForm.base_sale_price ? Number(productForm.base_sale_price) : null,
        stock_quantity: Math.floor(Number(productForm.initial_stock) / 3) || 20,
        low_stock_threshold: 5,
        is_active: true,
        attributes: { size: 'M', color: 'Rose Pink' }
      },
      {
        id: `var-${prodId}-l`,
        product_id: prodId,
        sku: `${productForm.sku}-L`,
        regular_price: Number(productForm.base_price),
        sale_price: productForm.base_sale_price ? Number(productForm.base_sale_price) : null,
        stock_quantity: Math.floor(Number(productForm.initial_stock) / 3) || 15,
        low_stock_threshold: 5,
        is_active: true,
        attributes: { size: 'L', color: 'Rose Pink' }
      }
    ];

    const payload: Partial<Product> = {
      id: editingProduct?.id,
      title: productForm.title,
      slug: generatedSlug,
      sku: productForm.sku,
      base_price: Number(productForm.base_price),
      base_sale_price: productForm.base_sale_price ? Number(productForm.base_sale_price) : null,
      short_description: productForm.short_description,
      description: productForm.description,
      status: productForm.status,
      is_featured: productForm.is_featured,
      is_bestseller: productForm.is_bestseller,
      is_new_arrival: productForm.is_new_arrival,
      is_on_sale: Boolean(productForm.base_sale_price && Number(productForm.base_sale_price) < Number(productForm.base_price)),
      categories: matchedCat ? [matchedCat] : [],
      images: [
        {
          id: `img-${prodId}-1`,
          product_id: prodId,
          image_url: productForm.image_url,
          alt_text: productForm.title,
          is_primary: true
        }
      ],
      variants: defaultVariants
    };

    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save product');
      }

      if (editingProduct) {
        setProducts(prev => prev.map(p => p.id === data.product.id ? data.product : p));
        setProductActionMsg({ type: 'success', text: `Product "${data.product.title}" updated successfully!` });
      } else {
        setProducts(prev => [data.product, ...prev]);
        setProductActionMsg({ type: 'success', text: `New product "${data.product.title}" added to catalog!` });
      }
      setProductModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error saving product';
      setProductActionMsg({ type: 'error', text: msg });
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      const res = await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts(prev => prev.filter(p => p.id !== id));
        setProductActionMsg({ type: 'success', text: `Product "${title}" deleted from catalog.` });
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to delete');
      }
    } catch {
      alert('Error deleting product');
    }
  };

  const handleToggleProductStatus = async (prod: Product) => {
    const nextStatus = prod.status === 'published' ? 'draft' : 'published';
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: prod.id, status: nextStatus })
      });
      if (res.ok) {
        setProducts(prev => prev.map(p => p.id === prod.id ? { ...p, status: nextStatus } : p));
      }
    } catch {
      alert('Error updating status');
    }
  };

  // =========================================================================
  // VARIATION MANAGEMENT STATE & HANDLERS
  // =========================================================================
  const [variationProductFilter, setVariationProductFilter] = useState('all');
  const [variationSearch, setVariationSearch] = useState('');
  const [variationActionMsg, setVariationActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleUpdateVariantDirect = async (variantId: string, newStock: number, newPrice?: number) => {
    try {
      const stockRes = await fetch('/api/admin/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId, newStock })
      });
      if (stockRes.ok) {
        setProducts(prev => prev.map(p => ({
          ...p,
          variants: p.variants.map(v => v.id === variantId ? { ...v, stock_quantity: Math.max(0, newStock), ...(newPrice ? { regular_price: newPrice } : {}) } : v)
        })));
        setVariationActionMsg({ type: 'success', text: `Variant stock updated to ${newStock} units.` });
        setTimeout(() => setVariationActionMsg(null), 3000);
      }
    } catch {
      alert('Error updating variant');
    }
  };

  // User Management state
  const [usersList, setUsersList] = useState<AppUser[]>(initialUsers);
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | UserRole>('all');
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [staffForm, setStaffForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    role: 'moderator' as 'admin' | 'moderator'
  });
  const [userActionMsg, setUserActionMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isSubmittingStaff, setIsSubmittingStaff] = useState(false);

  // Variation interactive mockup state
  const [varSize, setVarSize] = useState('M');
  const [varColor, setVarColor] = useState('Rose Pink');

  // Order status update
  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await fetch('/api/admin/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_order_status',
          orderId,
          newStatus
        })
      });

      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, order_status: newStatus } : o));
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(prev => prev ? { ...prev, order_status: newStatus } : null);
        }
      }
    } catch {
      alert('Error updating status');
    }
  };

  // Payment Verification
  const handleVerifyPayment = async (orderId: string, status: 'verified' | 'rejected') => {
    try {
      const res = await fetch('/api/admin/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify_payment',
          orderId,
          verificationStatus: status,
          notes: status === 'verified' ? 'Verified by Admin' : 'Transaction ID not found'
        })
      });

      if (res.ok) {
        setOrders(prev => prev.map(o => {
          if (o.id === orderId) {
            return {
              ...o,
              payment_status: status === 'verified' ? 'paid' : 'failed',
              order_status: status === 'verified' ? 'confirmed' : o.order_status,
              payment_submission: o.payment_submission ? {
                ...o.payment_submission,
                status
              } : undefined
            };
          }
          return o;
        }));
      }
    } catch {
      alert('Error verifying payment');
    }
  };

  // Stock Update
  const handleSaveStock = async (variantId: string) => {
    const newStock = stockUpdates[variantId];
    if (newStock === undefined) return;

    try {
      const res = await fetch('/api/admin/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId, newStock })
      });

      if (res.ok) {
        setProducts(prev => prev.map(p => ({
          ...p,
          variants: p.variants.map(v => v.id === variantId ? { ...v, stock_quantity: newStock } : v)
        })));
        setStockSuccess(`Stock updated for ${variantId}`);
        setTimeout(() => setStockSuccess(''), 3000);
      }
    } catch {
      alert('Failed to update stock');
    }
  };

  // Settings Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          announcement_text: announcementText,
          bkash_number: bkashNumber,
          nagad_number: nagadNumber,
          rocket_number: rocketNumber,
          inside_dhaka: insideDhakaFee,
          outside_dhaka: outsideDhakaFee,
          free_shipping_threshold: freeThreshold
        })
      });

      if (res.ok) {
        setSettingsSuccess(true);
        setTimeout(() => setSettingsSuccess(false), 3000);
      }
    } catch {
      alert('Failed to save settings');
    }
  };

  // User Management Handlers
  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      setUserActionMsg({ text: 'Access Denied: Only Super Admin can appoint or create Admin and Moderator accounts.', type: 'error' });
      return;
    }

    setIsSubmittingStaff(true);
    setUserActionMsg(null);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: staffForm.fullName,
          email: staffForm.email,
          phone: staffForm.phone,
          password: staffForm.password,
          role: staffForm.role
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setUserActionMsg({ text: data.error || 'Failed to add staff member.', type: 'error' });
      } else {
        setUserActionMsg({ text: `Staff member ${data.user.full_name} (${data.user.role}) successfully created!`, type: 'success' });
        setUsersList(prev => [data.user, ...prev]);
        setShowAddStaffModal(false);
        setStaffForm({ fullName: '', email: '', phone: '', password: '', role: 'moderator' });
      }
    } catch {
      setUserActionMsg({ text: 'Network error adding staff member.', type: 'error' });
    } finally {
      setIsSubmittingStaff(false);
    }
  };

  const handleChangeRole = async (targetUserId: string, newRole: UserRole) => {
    if (!isSuperAdmin) {
      setUserActionMsg({ text: 'Access Denied: Only Super Admin can modify user roles.', type: 'error' });
      return;
    }

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: targetUserId, role: newRole })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUsersList(prev => prev.map(u => u.id === targetUserId ? { ...u, role: newRole } : u));
        setUserActionMsg({ text: 'User role updated successfully.', type: 'success' });
      } else {
        setUserActionMsg({ text: data.error || 'Failed to update role.', type: 'error' });
      }
    } catch {
      setUserActionMsg({ text: 'Network error updating user role.', type: 'error' });
    }
  };

  const handleToggleStatus = async (targetUserId: string, currentStatus: 'active' | 'suspended') => {
    if (!isSuperAdmin) {
      setUserActionMsg({ text: 'Access Denied: Only Super Admin can suspend or activate accounts.', type: 'error' });
      return;
    }

    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: targetUserId, status: newStatus })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUsersList(prev => prev.map(u => u.id === targetUserId ? { ...u, status: newStatus } : u));
        setUserActionMsg({ text: `Account has been set to ${newStatus}.`, type: 'success' });
      } else {
        setUserActionMsg({ text: data.error || 'Failed to update account status.', type: 'error' });
      }
    } catch {
      setUserActionMsg({ text: 'Network error updating account status.', type: 'error' });
    }
  };

  // KPI Calculations
  const totalRevenue = 876500 + orders
    .filter(o => o.payment_status === 'paid' && o.order_status !== 'cancelled')
    .reduce((sum, o) => sum + o.total_amount, 0);

  const pendingPayments = orders.filter(o => o.payment_status === 'pending_verification');
  const flaggedOrders = orders.filter(o => o.is_flagged_for_review);

  // Filtered orders list
  const filteredOrders = orders.filter(o => {
    if (orderFilter !== 'all' && o.order_status !== orderFilter) return false;
    if (orderSearch) {
      const q = orderSearch.toLowerCase();
      return (
        o.order_number.toLowerCase().includes(q) ||
        o.customer_name.toLowerCase().includes(q) ||
        o.customer_phone.includes(q)
      );
    }
    return true;
  });

  // Loading guard
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFFDF8] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 mx-auto rounded-full border-2 border-[#BE3D69] border-t-transparent animate-spin" />
          <p className="text-xs text-[#796B70]">Verifying secure session...</p>
        </div>
      </div>
    );
  }

  // Guard 1: Not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-[#FFFDF8] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-[#FCE8EE] p-8 shadow-luxury text-center space-y-5">
          <div className="relative w-16 h-16 mx-auto rounded-full overflow-hidden border border-[#D85C83]/20 bg-[#FFFDF8] shadow-sm">
            <Image src="/images/brand/crown-and-chic-emblem.png" alt="Crown & Chic" fill className="object-cover" />
          </div>
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#30252A]">Staff Authentication Required</h2>
            <p className="text-xs text-[#796B70] mt-1.5 leading-relaxed">
              The Administration Console is reserved for Crown &amp; Chic staff accounts (Super Admin, Admin, Moderator). Individual credentials are required.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-left text-xs text-amber-900 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-[#BE3D69]">
              <Crown className="w-4 h-4 text-[#C49A52]" />
              <span>Super Admin Credentials:</span>
            </div>
            <p className="font-mono text-[11px]">Email: <strong>tusharkumardas.ai@gmail.com</strong></p>
            <p className="font-mono text-[11px]">Password: <strong>Tushar018879</strong></p>
          </div>

          <Link
            href="/auth?redirect=/admin&message=staff_required"
            className="w-full py-3.5 rounded-full bg-[#BE3D69] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#D85C83] transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <span>Sign In to Admin Console</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link href="/" className="inline-block text-xs text-[#796B70] hover:text-[#BE3D69] underline">
            &larr; Return to Customer Storefront
          </Link>
        </div>
      </div>
    );
  }

  // Guard 2: Logged in as retail customer (normal user)
  if (user.role === 'customer') {
    return (
      <div className="min-h-screen bg-[#FFFDF8] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-red-200 p-8 shadow-luxury text-center space-y-5">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-50 text-red-600 flex items-center justify-center border border-red-200">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#30252A]">Access Denied — Staff Only</h2>
            <p className="text-xs text-[#796B70] mt-1.5 leading-relaxed">
              You are currently signed in as <strong>{user.full_name}</strong> (<span className="font-mono">{user.email}</span>) with <strong>Customer</strong> privileges.
            </p>
            <p className="text-xs text-[#796B70] mt-1">
              Normal user accounts can browse and shop. The Admin Console is restricted to Super Admin, Admin, and Moderator staff.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href="/"
              className="flex-1 py-3 rounded-full bg-[#BE3D69] text-white text-xs font-semibold hover:bg-[#D85C83] text-center"
            >
              Shop Collections
            </Link>
            <button
              onClick={() => logout()}
              className="flex-1 py-3 rounded-full bg-gray-100 text-[#30252A] text-xs font-semibold hover:bg-gray-200"
            >
              Switch Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      
      {/* Sidebar matching Mockup */}
      <aside className="w-full lg:w-64 bg-white border-r border-[#FCE8EE] p-4 lg:p-6 flex flex-col justify-between shrink-0 shadow-sm">
        <div className="space-y-6">
          
          {/* Logo & Header */}
          <div className="flex items-center gap-3 px-2">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#D85C83]/30 shadow-sm bg-[#FFFDF8] shrink-0">
              <Image 
                src="/images/brand/crown-and-chic-emblem.png" 
                alt="Crown & Chic" 
                fill 
                className="object-cover"
              />
            </div>
            <div>
              <span className="font-serif text-lg font-bold text-[#BE3D69] block leading-tight">
                Crown &amp; Chic
              </span>
              <span className="text-[10px] text-[#796B70] tracking-wider uppercase font-semibold">
                Admin Console
              </span>
            </div>
          </div>

          {/* Navigation Links matching mockup */}
          <nav className="space-y-1 text-xs font-semibold">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'users', label: 'User Management', icon: Users, badge: usersList.length },
              { id: 'fraud', label: 'Fake Order Prevention', icon: ShieldAlert, badge: flaggedOrders.length },
              { id: 'categories', label: 'Category Management', icon: FolderTree },
              { id: 'products', label: 'Product Management', icon: Package },
              { id: 'variations', label: 'Variation Management', icon: Layers },
              { id: 'orders', label: 'Order Management', icon: ShoppingBag, badge: orders.length },
              { id: 'stock', label: 'Stock Management', icon: Boxes },
              { id: 'payments', label: 'Payment Verification', icon: CreditCard, badge: pendingPayments.length },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isRestrictedForMod = isModerator && ['products', 'categories', 'variations', 'stock', 'settings'].includes(item.id);

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as typeof activeTab)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                    isActive
                      ? 'bg-[#BE3D69] text-white shadow-xs'
                      : 'text-[#30252A] hover:bg-[#FCE8EE] hover:text-[#BE3D69]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {isRestrictedForMod && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-gray-100 text-gray-500 font-normal">Restricted</span>
                    )}
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-white text-[#BE3D69]' : 'bg-[#FCE8EE] text-[#BE3D69]'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </nav>

        </div>

        {/* Footer actions */}
        <div className="pt-6 border-t border-[#FCE8EE] space-y-2 text-xs font-semibold">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-[#30252A] hover:bg-[#FCE8EE] hover:text-[#BE3D69] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Storefront View</span>
          </Link>
          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout ({user.email})</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Area */}
      <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* TOP BAR */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 lg:p-6 rounded-3xl border border-[#FCE8EE] shadow-sm">
            <div>
              <h1 className="font-serif text-2xl font-bold text-[#30252A]">
                {activeTab === 'dashboard' && 'Executive Store Overview'}
                {activeTab === 'orders' && 'Order Management & Fulfillment'}
                {activeTab === 'fraud' && 'Fake Order Prevention & Fraud Detection'}
                {activeTab === 'products' && 'Product Catalog Management'}
                {activeTab === 'variations' && 'Product Variation Matrix'}
                {activeTab === 'stock' && 'Real-Time Inventory & Stock Audit'}
                {activeTab === 'payments' && 'MFS Payment Submissions Queue'}
                {activeTab === 'settings' && 'Store Configuration & Payment Credentials'}
                {activeTab === 'users' && 'Customer & Staff Management'}
                {activeTab === 'categories' && 'Category Taxonomy Management'}
              </h1>
              <p className="text-xs text-[#796B70] mt-0.5">
                Crown &amp; Chic E-Commerce Administration Console &bull; Live Connected
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#FCE8EE] text-[#BE3D69] border border-[#D85C83]/20 shadow-2xs">
                {user.role === 'super_admin' && (
                  <span className="flex items-center gap-1 text-[#C49A52]">
                    <Crown className="w-3.5 h-3.5 fill-current" />
                    <span>Super Admin: <strong>{user.full_name}</strong></span>
                  </span>
                )}
                {user.role === 'admin' && (
                  <span className="flex items-center gap-1 text-[#BE3D69]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Admin: <strong>{user.full_name}</strong></span>
                  </span>
                )}
                {user.role === 'moderator' && (
                  <span className="flex items-center gap-1 text-purple-700">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Moderator: <strong>{user.full_name}</strong></span>
                  </span>
                )}
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Active
              </span>
            </div>
          </div>

          {/* ================================================================ */}
          {/* TAB 1: DASHBOARD VIEW (Exact Mockup Match) */}
          {/* ================================================================ */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              
              {/* 4 Metric KPI Cards matching Mockup */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Total Users */}
                <div className="p-5 rounded-2xl bg-white border border-[#FCE8EE] shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#796B70]">
                    <span>Total Users</span>
                    <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                      <TrendingUp className="w-3 h-3" /> +12%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-[#30252A]">1,245</span>
                    <Users className="w-5 h-5 text-[#BE3D69]" />
                  </div>
                </div>

                {/* Total Orders */}
                <div className="p-5 rounded-2xl bg-white border border-[#FCE8EE] shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#796B70]">
                    <span>Total Orders</span>
                    <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                      <TrendingUp className="w-3 h-3" /> +8%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-[#30252A]">
                      {(3520 + orders.length - 5).toLocaleString()}
                    </span>
                    <ShoppingBag className="w-5 h-5 text-[#BE3D69]" />
                  </div>
                </div>

                {/* Total Products */}
                <div className="p-5 rounded-2xl bg-white border border-[#FCE8EE] shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#796B70]">
                    <span>Total Products</span>
                    <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                      <TrendingUp className="w-3 h-3" /> +15%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-[#30252A]">248</span>
                    <Package className="w-5 h-5 text-[#BE3D69]" />
                  </div>
                </div>

                {/* Total Revenue */}
                <div className="p-5 rounded-2xl bg-white border border-[#FCE8EE] shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#796B70]">
                    <span>Total Revenue</span>
                    <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                      <TrendingUp className="w-3 h-3" /> +18%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-[#BE3D69]">
                      {formatBDT(totalRevenue)}
                    </span>
                    <span className="text-xs font-bold text-[#C49A52] uppercase">BDT</span>
                  </div>
                </div>

              </div>

              {/* Grid: Recent Orders (Left) & Manage Products / Variations (Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left 7 cols: Recent Orders Table matching mockup */}
                <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-[#FCE8EE] shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-[#FCE8EE] pb-3">
                    <h3 className="font-serif text-base font-bold text-[#30252A]">
                      Recent Orders
                    </h3>
                    <button 
                      onClick={() => setActiveTab('orders')}
                      className="text-xs font-semibold text-[#BE3D69] hover:underline"
                    >
                      View All Orders →
                    </button>
                  </div>

                  <div className="overflow-x-auto text-xs">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-[#FCE8EE] text-[#796B70] pb-2">
                          <th className="py-2.5 font-bold">#</th>
                          <th className="py-2.5 font-bold">Customer</th>
                          <th className="py-2.5 font-bold">Amount</th>
                          <th className="py-2.5 font-bold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#FCE8EE]">
                        {orders.slice(0, 5).map((o, idx) => (
                          <tr key={o.id} className="hover:bg-[#FFFDF8] transition-colors">
                            <td className="py-3 font-mono font-bold text-[#BE3D69]">
                              #{o.order_number.slice(-4)}
                            </td>
                            <td className="py-3 font-medium text-[#30252A]">
                              {o.customer_name}
                            </td>
                            <td className="py-3 font-bold text-[#30252A]">
                              {formatBDT(o.total_amount)}
                            </td>
                            <td className="py-3">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold capitalize ${
                                o.order_status === 'pending_confirmation' ? 'bg-amber-100 text-amber-800' :
                                o.order_status === 'confirmed' ? 'bg-teal-100 text-teal-800' :
                                o.order_status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                o.order_status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {o.order_status.replace(/_/g, ' ')}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right 5 cols: Manage Products & Product Variation Widget matching mockup */}
                <div className="lg:col-span-5 space-y-6">
                  
                  {/* Manage Products Card */}
                  <div className="bg-white p-6 rounded-3xl border border-[#FCE8EE] shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-[#FCE8EE] pb-3">
                      <h3 className="font-serif text-base font-bold text-[#30252A]">
                        Manage Products
                      </h3>
                      <button
                        onClick={() => setActiveTab('products')}
                        className="px-3 py-1 rounded-full bg-[#BE3D69] text-white text-[11px] font-semibold hover:bg-[#D85C83]"
                      >
                        Add Product
                      </button>
                    </div>

                    <div className="space-y-2 text-xs">
                      {products.slice(0, 4).map((p, idx) => (
                        <div key={p.id} className="flex items-center justify-between p-2 rounded-xl bg-[#FFFDF8] border border-[#FCE8EE]">
                          <div className="flex items-center gap-2.5">
                            <span className="font-mono text-[#796B70]">#{1024 - idx}</span>
                            <span className="font-semibold text-[#30252A] truncate max-w-[130px]">{p.title}</span>
                          </div>
                          <span className="text-[10px] text-[#BE3D69] font-bold">
                            {formatBDT(p.base_sale_price || p.base_price)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Product Variation Example Widget matching Mockup */}
                  <div className="bg-white p-6 rounded-3xl border border-[#FCE8EE] shadow-sm space-y-4">
                    <h3 className="font-serif text-sm font-bold text-[#30252A] border-b border-[#FCE8EE] pb-2">
                      Product Variation Example
                    </h3>

                    {/* Size Selector */}
                    <div className="space-y-1.5 text-xs">
                      <span className="font-bold text-[#796B70] block">Size:</span>
                      <div className="flex items-center gap-1.5">
                        {['S', 'M', 'L', 'XL'].map(s => (
                          <button
                            key={s}
                            onClick={() => setVarSize(s)}
                            className={`w-7 h-7 rounded-md border text-xs font-bold transition-all ${
                              varSize === s ? 'bg-[#BE3D69] text-white border-[#BE3D69]' : 'border-gray-200 text-[#30252A]'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                        <button className="w-7 h-7 rounded-md border border-dashed border-gray-300 text-gray-400 text-xs">
                          +
                        </button>
                      </div>
                    </div>

                    {/* Colour Selector */}
                    <div className="space-y-1.5 text-xs">
                      <span className="font-bold text-[#796B70] block">Colour:</span>
                      <div className="flex items-center gap-2">
                        {[
                          { name: 'Rose Pink', hex: '#D85C83' },
                          { name: 'Deep Pink', hex: '#BE3D69' },
                          { name: 'Black', hex: '#1A1A1A' },
                          { name: 'White', hex: '#FFFFFF' }
                        ].map(c => (
                          <button
                            key={c.name}
                            onClick={() => setVarColor(c.name)}
                            style={{ backgroundColor: c.hex }}
                            className={`w-6 h-6 rounded-full border-2 transition-transform ${
                              varColor === c.name ? 'scale-110 border-[#30252A]' : 'border-gray-300'
                            }`}
                            title={c.name}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Pricing & Stock Display */}
                    <div className="grid grid-cols-2 gap-3 pt-2 text-xs border-t border-[#FCE8EE]">
                      <div>
                        <span className="text-[#796B70] block text-[11px]">Regular Price:</span>
                        <span className="font-semibold text-[#30252A]">৳ 2,500</span>
                      </div>
                      <div>
                        <span className="text-[#796B70] block text-[11px]">Sale Price:</span>
                        <span className="font-bold text-[#BE3D69]">৳ 1,999</span>
                      </div>
                      <div className="col-span-2 flex items-center justify-between pt-1">
                        <span className="text-[#796B70] text-[11px]">Variant Stock:</span>
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          25 in stock
                        </span>
                      </div>
                    </div>

                  </div>

                </div>

              </div>

            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 2: ORDER MANAGEMENT */}
          {/* ================================================================ */}
          {activeTab === 'orders' && (
            <div className="bg-white p-6 rounded-3xl border border-[#FCE8EE] shadow-sm space-y-6">
              
              {/* Filter controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-72">
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Search order #, customer or phone..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#D85C83]/30 text-xs focus:outline-none focus:border-[#BE3D69]"
                  />
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                  {['all', 'pending_confirmation', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(st => (
                    <button
                      key={st}
                      onClick={() => setOrderFilter(st)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap capitalize transition-all ${
                        orderFilter === st ? 'bg-[#BE3D69] text-white' : 'bg-gray-100 text-[#796B70] hover:bg-gray-200'
                      }`}
                    >
                      {st.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Orders Table */}
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#FCE8EE] text-[#796B70]">
                      <th className="py-3 font-bold">Order #</th>
                      <th className="py-3 font-bold">Customer</th>
                      <th className="py-3 font-bold">Contact</th>
                      <th className="py-3 font-bold">Destination</th>
                      <th className="py-3 font-bold">Total</th>
                      <th className="py-3 font-bold">Payment</th>
                      <th className="py-3 font-bold">Status</th>
                      <th className="py-3 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#FCE8EE]">
                    {filteredOrders.map(o => (
                      <tr key={o.id} className="hover:bg-[#FFFDF8] transition-colors">
                        <td className="py-3 font-mono font-bold text-[#BE3D69]">
                          {o.order_number}
                        </td>
                        <td className="py-3 font-semibold text-[#30252A]">
                          {o.customer_name}
                        </td>
                        <td className="py-3 text-[#796B70]">
                          {o.customer_phone}
                        </td>
                        <td className="py-3 text-[#796B70]">
                          {o.thana}, {o.division}
                        </td>
                        <td className="py-3 font-bold text-[#30252A]">
                          {formatBDT(o.total_amount)}
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            o.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {o.payment_method.toUpperCase()} ({o.payment_status})
                          </span>
                        </td>
                        <td className="py-3">
                          <select
                            value={o.order_status}
                            onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value as OrderStatus)}
                            className="px-2 py-1 rounded-md border border-[#D85C83]/30 text-[11px] font-semibold bg-white focus:outline-none"
                          >
                            <option value="pending_confirmation">Pending Confirmation</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => setSelectedOrder(o)}
                            className="p-1.5 rounded-lg text-[#BE3D69] hover:bg-[#FCE8EE] transition-colors"
                            title="Inspect details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 3: PAYMENT VERIFICATION QUEUE */}
          {/* ================================================================ */}
          {activeTab === 'payments' && (
            <div className="bg-white p-6 rounded-3xl border border-[#FCE8EE] shadow-sm space-y-6">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#30252A]">
                  Manual Mobile Financial Services (MFS) Payment Queue
                </h3>
                <p className="text-xs text-[#796B70] mt-0.5">
                  Review customer submitted Transaction IDs for bKash, Nagad, and Rocket before marking orders as confirmed.
                </p>
              </div>

              {pendingPayments.length === 0 ? (
                <div className="text-center py-12 bg-[#FFFDF8] rounded-2xl border border-[#FCE8EE] space-y-2">
                  <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />
                  <p className="font-semibold text-xs text-[#30252A]">All pending payments verified!</p>
                  <p className="text-[11px] text-[#796B70]">No unverified transactions awaiting review.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingPayments.map(o => (
                    <div key={o.id} className="p-4 rounded-2xl border border-[#FCE8EE] bg-[#FFFDF8] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-[#BE3D69]">{o.order_number}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FCE8EE] text-[#BE3D69] uppercase">
                            {o.payment_method}
                          </span>
                        </div>
                        <p className="text-xs text-[#30252A]">
                          Customer: <strong>{o.customer_name}</strong> ({o.customer_phone})
                        </p>
                        <p className="text-xs text-[#796B70]">
                          Transaction ID: <strong className="font-mono text-[#BE3D69]">{o.payment_submission?.transaction_id || 'Not Submitted'}</strong>
                        </p>
                        <p className="text-xs text-[#796B70]">
                          Amount Claimed: <strong className="text-[#30252A]">{formatBDT(o.total_amount)}</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleVerifyPayment(o.id, 'verified')}
                          className="px-4 py-2 rounded-full bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-all flex items-center gap-1.5 shadow-sm"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Approve & Verify</span>
                        </button>
                        <button
                          onClick={() => handleVerifyPayment(o.id, 'rejected')}
                          className="px-4 py-2 rounded-full bg-red-100 text-red-700 text-xs font-semibold hover:bg-red-200 transition-all flex items-center gap-1.5"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 4: FAKE ORDER PREVENTION */}
          {/* ================================================================ */}
          {activeTab === 'fraud' && (
            <div className="bg-white p-6 rounded-3xl border border-[#FCE8EE] shadow-sm space-y-6">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#30252A] flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-[#BE3D69]" />
                  <span>Fake Order Prevention & Risk Review</span>
                </h3>
                <p className="text-xs text-[#796B70] mt-0.5">
                  Automated risk heuristics monitoring rapid consecutive submissions, high-value unverified COD orders, and duplicate phone numbers.
                </p>
              </div>

              {flaggedOrders.length === 0 ? (
                <div className="text-center py-12 bg-emerald-50/50 rounded-2xl border border-emerald-200 space-y-2">
                  <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />
                  <p className="font-semibold text-xs text-[#30252A]">No high-risk fake orders detected!</p>
                  <p className="text-[11px] text-[#796B70]">System integrity check passed.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {flaggedOrders.map(o => (
                    <div key={o.id} className="p-4 rounded-2xl border border-red-200 bg-red-50/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-[#BE3D69]">{o.order_number}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-200 text-red-800">
                            Risk Score: {o.risk_score}/100
                          </span>
                        </div>
                        <p className="text-xs text-[#30252A]">
                          Recipient: {o.customer_name} ({o.customer_phone}) &bull; Total: {formatBDT(o.total_amount)}
                        </p>
                        {o.risk_reasons && (
                          <ul className="text-[11px] text-red-700 list-disc list-inside">
                            {o.risk_reasons.map((r, i) => (
                              <li key={i}>{r}</li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setOrders(prev => prev.map(item => item.id === o.id ? { ...item, is_flagged_for_review: false } : item));
                            alert(`Order #${o.order_number} risk cleared.`);
                          }}
                          className="px-3 py-1.5 rounded-full bg-white border border-gray-300 text-xs font-semibold hover:bg-gray-50"
                        >
                          Clear Flag
                        </button>
                        <button
                          onClick={() => handleUpdateOrderStatus(o.id, 'cancelled')}
                          className="px-3 py-1.5 rounded-full bg-red-600 text-white text-xs font-semibold hover:bg-red-700"
                        >
                          Cancel Order
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 5: STOCK / INVENTORY MANAGEMENT */}
          {/* ================================================================ */}
          {activeTab === 'stock' && (
            <div className="bg-white p-6 rounded-3xl border border-[#FCE8EE] shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#30252A]">
                    Variant-Level Stock & Inventory Audit
                  </h3>
                  <p className="text-xs text-[#796B70] mt-0.5">
                    Live stock balances. Changes instantly sync to storefront variant selectors to prevent overselling.
                  </p>
                </div>
                {stockSuccess && (
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    {stockSuccess}
                  </span>
                )}
              </div>

              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#FCE8EE] text-[#796B70]">
                      <th className="py-2.5 font-bold">SKU</th>
                      <th className="py-2.5 font-bold">Product</th>
                      <th className="py-2.5 font-bold">Variant Specs</th>
                      <th className="py-2.5 font-bold">Price</th>
                      <th className="py-2.5 font-bold">Current Stock</th>
                      <th className="py-2.5 font-bold">Update Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#FCE8EE]">
                    {products.flatMap(p => p.variants.map(v => (
                      <tr key={v.id} className="hover:bg-[#FFFDF8]">
                        <td className="py-3 font-mono font-bold text-[#30252A]">{v.sku}</td>
                        <td className="py-3 font-semibold text-[#30252A]">{p.title}</td>
                        <td className="py-3 text-[#796B70]">
                          Size: {v.attributes.size || 'N/A'} &bull; Color: {v.attributes.color || 'N/A'}
                        </td>
                        <td className="py-3 font-bold text-[#BE3D69]">
                          {formatBDT(v.sale_price || v.regular_price)}
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            v.stock_quantity <= v.low_stock_threshold ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {v.stock_quantity} left
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={0}
                              defaultValue={v.stock_quantity}
                              onChange={(e) => setStockUpdates(prev => ({ ...prev, [v.id]: Number(e.target.value) }))}
                              className="w-16 px-2 py-1 rounded border border-[#D85C83]/30 text-xs"
                            />
                            <button
                              onClick={() => handleSaveStock(v.id)}
                              className="px-2.5 py-1 rounded bg-[#BE3D69] text-white text-[10px] font-semibold hover:bg-[#D85C83]"
                            >
                              Save
                            </button>
                          </div>
                        </td>
                      </tr>
                    )))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 6: SETTINGS MANAGEMENT */}
          {/* ================================================================ */}
          {activeTab === 'settings' && (
            <div className="bg-white p-6 rounded-3xl border border-[#FCE8EE] shadow-sm space-y-6 max-w-3xl">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#30252A]">
                  Store Settings & Payment Recipient Numbers
                </h3>
                <p className="text-xs text-[#796B70] mt-0.5">
                  Manage the top announcement bar, MFS recipient numbers, and nationwide shipping rates.
                </p>
              </div>

              {settingsSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Settings successfully saved and published!</span>
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="space-y-6">
                
                {/* Announcement Bar */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#30252A]">
                    Top Announcement Bar Text
                  </label>
                  <input
                    type="text"
                    value={announcementText}
                    onChange={(e) => setAnnouncementText(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-[#D85C83]/30 text-xs"
                  />
                </div>

                {/* MFS Recipient Numbers */}
                <div className="p-4 rounded-2xl bg-[#FFFDF8] border border-[#FCE8EE] space-y-4">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#BE3D69]">
                    Mobile Financial Service (MFS) Recipient Numbers
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#30252A]">bKash Merchant #</label>
                      <input
                        type="text"
                        value={bkashNumber}
                        onChange={(e) => setBkashNumber(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-[#D85C83]/30 text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#30252A]">Nagad Merchant #</label>
                      <input
                        type="text"
                        value={nagadNumber}
                        onChange={(e) => setNagadNumber(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-[#D85C83]/30 text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#30252A]">Rocket Personal #</label>
                      <input
                        type="text"
                        value={rocketNumber}
                        onChange={(e) => setRocketNumber(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-[#D85C83]/30 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Delivery Rates */}
                <div className="p-4 rounded-2xl bg-[#FFFDF8] border border-[#FCE8EE] space-y-4">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#BE3D69]">
                    Nationwide Delivery Fees (BDT)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#30252A]">Inside Dhaka Rate</label>
                      <input
                        type="number"
                        value={insideDhakaFee}
                        onChange={(e) => setInsideDhakaFee(Number(e.target.value))}
                        className="w-full px-3 py-1.5 rounded-lg border border-[#D85C83]/30 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#30252A]">Outside Dhaka Rate</label>
                      <input
                        type="number"
                        value={outsideDhakaFee}
                        onChange={(e) => setOutsideDhakaFee(Number(e.target.value))}
                        className="w-full px-3 py-1.5 rounded-lg border border-[#D85C83]/30 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#30252A]">Free Shipping Threshold</label>
                      <input
                        type="number"
                        value={freeThreshold}
                        onChange={(e) => setFreeThreshold(Number(e.target.value))}
                        className="w-full px-3 py-1.5 rounded-lg border border-[#D85C83]/30 text-xs"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#BE3D69] text-white text-xs font-semibold hover:bg-[#D85C83] transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Store Settings</span>
                </button>
              </form>
            </div>
          )}

          {/* ================================================================ */}
          {/* TAB: USER MANAGEMENT & STAFF ROLE HIERARCHY */}
          {/* ================================================================ */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              
              {/* Role-Specific Security Banners */}
              {isSuperAdmin && (
                <div className="p-4 sm:p-5 rounded-3xl bg-[#FFFDF8] border border-[#C49A52]/40 text-[#30252A] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#C49A52]/15 text-[#C49A52] flex items-center justify-center shrink-0">
                      <Crown className="w-5 h-5 fill-current" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#BE3D69] flex items-center gap-1.5">
                        <span>Super Admin Supreme Control Active</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold">Unrestricted</span>
                      </h3>
                      <p className="text-xs text-[#796B70] mt-0.5">
                        You have exclusive authority to appoint new <strong>Admin</strong> and <strong>Moderator</strong> staff, modify user roles, and suspend/activate accounts.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAddStaffModal(true)}
                    className="px-4 py-2.5 rounded-full bg-[#BE3D69] text-white font-bold text-xs hover:bg-[#D85C83] transition-colors flex items-center justify-center gap-2 shadow-sm shrink-0"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>+ Appoint Staff (Admin / Moderator)</span>
                  </button>
                </div>
              )}

              {isAdmin && !isSuperAdmin && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3 shadow-xs">
                  <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-amber-950">Administrator Operations View (Staff Role Changes Restricted)</h3>
                    <p className="text-amber-800 mt-0.5 leading-relaxed">
                      You can manage catalog products, stock, and orders. Per system governance, only the primary Super Admin (<strong>tusharkumardas.ai@gmail.com</strong>) has permission to appoint or edit Admin and Moderator roles.
                    </p>
                  </div>
                </div>
              )}

              {isModerator && (
                <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-purple-900 text-xs flex items-start gap-3 shadow-xs">
                  <MessageSquare className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-purple-950">Moderator Customer Client View</h3>
                    <p className="text-purple-800 mt-0.5 leading-relaxed">
                      You are authorized to view client details for order communication and customer care. Modifying administrative hierarchy is restricted to Super Admin.
                    </p>
                  </div>
                </div>
              )}

              {/* Action feedback message */}
              {userActionMsg && (
                <div className={`p-3.5 rounded-2xl text-xs flex items-center gap-2.5 ${
                  userActionMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {userActionMsg.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
                  <span className="font-medium">{userActionMsg.text}</span>
                </div>
              )}

              {/* 4 Role KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-white border border-[#FCE8EE] shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-xs text-[#796B70]">
                    <span className="font-bold">👑 Super Admin</span>
                    <Crown className="w-4 h-4 text-[#C49A52] fill-current" />
                  </div>
                  <span className="text-xl font-bold text-[#30252A]">
                    {usersList.filter(u => u.role === 'super_admin').length}
                  </span>
                  <p className="text-[10px] text-[#796B70]">Full System Control</p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#FCE8EE] shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-xs text-[#796B70]">
                    <span className="font-bold">🛡️ Admins</span>
                    <ShieldCheck className="w-4 h-4 text-[#BE3D69]" />
                  </div>
                  <span className="text-xl font-bold text-[#30252A]">
                    {usersList.filter(u => u.role === 'admin').length}
                  </span>
                  <p className="text-[10px] text-[#796B70]">Catalog &amp; Operations</p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#FCE8EE] shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-xs text-[#796B70]">
                    <span className="font-bold">💬 Moderators</span>
                    <MessageSquare className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-xl font-bold text-[#30252A]">
                    {usersList.filter(u => u.role === 'moderator').length}
                  </span>
                  <p className="text-[10px] text-[#796B70]">Clients &amp; Order Care</p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#FCE8EE] shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-xs text-[#796B70]">
                    <span className="font-bold">👤 Customers</span>
                    <Users className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-xl font-bold text-[#30252A]">
                    {usersList.filter(u => u.role === 'customer').length}
                  </span>
                  <p className="text-[10px] text-[#796B70]">Registered Retail Shoppers</p>
                </div>
              </div>

              {/* Users Table Card */}
              <div className="bg-white p-6 rounded-3xl border border-[#FCE8EE] shadow-sm space-y-4">
                
                {/* Filter Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#FCE8EE] pb-4">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-[#796B70]" />
                    <span className="text-xs font-bold text-[#30252A]">Filter by Role:</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 text-xs">
                    {(['all', 'super_admin', 'admin', 'moderator', 'customer'] as const).map(role => (
                      <button
                        key={role}
                        onClick={() => setUserRoleFilter(role)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition-all ${
                          userRoleFilter === role 
                            ? 'bg-[#BE3D69] text-white shadow-xs' 
                            : 'bg-gray-100 text-[#796B70] hover:bg-gray-200'
                        }`}
                      >
                        {role === 'all' ? `All (${usersList.length})` : role.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-[#FCE8EE] text-[#796B70] pb-2 font-bold">
                        <th className="py-2.5">User</th>
                        <th className="py-2.5">Contact Phone</th>
                        <th className="py-2.5">Role</th>
                        <th className="py-2.5">Status</th>
                        <th className="py-2.5">Joined Date</th>
                        <th className="py-2.5 text-right">Role Governance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#FCE8EE]">
                      {usersList
                        .filter(u => userRoleFilter === 'all' || u.role === userRoleFilter)
                        .map(u => (
                          <tr key={u.id} className="hover:bg-[#FFFDF8] transition-colors">
                            <td className="py-3">
                              <div className="flex flex-col">
                                <span className="font-bold text-[#30252A] flex items-center gap-1.5">
                                  {u.full_name}
                                  {u.id === 'user-super-admin' && (
                                    <Crown className="w-3.5 h-3.5 text-[#C49A52] fill-current" />
                                  )}
                                </span>
                                <span className="text-[11px] text-[#796B70] font-mono">{u.email}</span>
                              </div>
                            </td>

                            <td className="py-3 font-mono text-[11px]">
                              {u.phone || 'N/A'}
                            </td>

                            <td className="py-3">
                              {u.role === 'super_admin' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#C49A52]/15 text-[#C49A52] border border-[#C49A52]/30">
                                  <Crown className="w-2.5 h-2.5 fill-current" /> Super Admin
                                </span>
                              )}
                              {u.role === 'admin' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#BE3D69]/10 text-[#BE3D69] border border-[#BE3D69]/20">
                                  <ShieldCheck className="w-2.5 h-2.5" /> Admin
                                </span>
                              )}
                              {u.role === 'moderator' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                  <MessageSquare className="w-2.5 h-2.5" /> Moderator
                                </span>
                              )}
                              {u.role === 'customer' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  👤 Customer
                                </span>
                              )}
                            </td>

                            <td className="py-3">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                u.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                <span className="capitalize">{u.status}</span>
                              </span>
                            </td>

                            <td className="py-3 text-[11px] text-[#796B70]">
                              {new Date(u.created_at).toLocaleDateString()}
                            </td>

                            <td className="py-3 text-right">
                              {isSuperAdmin ? (
                                <div className="inline-flex items-center gap-2">
                                  {u.id !== 'user-super-admin' ? (
                                    <>
                                      <select
                                        value={u.role}
                                        onChange={(e) => handleChangeRole(u.id, e.target.value as UserRole)}
                                        className="px-2 py-1 rounded-lg border border-[#D85C83]/30 text-xs bg-white text-[#30252A] focus:outline-none"
                                      >
                                        <option value="admin">Admin</option>
                                        <option value="moderator">Moderator</option>
                                        <option value="customer">Customer</option>
                                      </select>
                                      <button
                                        type="button"
                                        onClick={() => handleToggleStatus(u.id, u.status)}
                                        className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                                          u.status === 'active' ? 'text-red-600 hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'
                                        }`}
                                      >
                                        {u.status === 'active' ? 'Suspend' : 'Activate'}
                                      </button>
                                    </>
                                  ) : (
                                    <span className="text-[10px] text-[#C49A52] font-bold px-2 py-1 bg-amber-50 rounded-lg">
                                      Primary Super Admin
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <div className="inline-flex items-center gap-1 text-[#796B70] text-[11px]">
                                  <Lock className="w-3 h-3 text-gray-400" />
                                  <span>Super Admin Protected</span>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

              </div>

            </div>
          )}

          {/* Modal: Add New Staff Member (Super Admin Only) */}
          {showAddStaffModal && isSuperAdmin && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
              <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-[#FCE8EE]">
                <div className="flex items-center justify-between border-b border-[#FCE8EE] pb-3">
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-[#BE3D69]" />
                    <h3 className="font-serif font-bold text-lg text-[#30252A]">
                      Appoint New Staff Member
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowAddStaffModal(false)}
                    className="p-1 rounded-full text-gray-400 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleAddStaff} className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-[#30252A]">Select Staff Role</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setStaffForm(p => ({ ...p, role: 'admin' }))}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          staffForm.role === 'admin'
                            ? 'border-[#BE3D69] bg-[#FCE8EE] text-[#BE3D69] font-bold'
                            : 'border-gray-200 text-[#796B70]'
                        }`}
                      >
                        <span className="block font-bold">🛡️ Admin</span>
                        <span className="text-[10px] block opacity-80">Catalog, variations, inventory &amp; operations</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setStaffForm(p => ({ ...p, role: 'moderator' }))}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          staffForm.role === 'moderator'
                            ? 'border-purple-600 bg-purple-50 text-purple-700 font-bold'
                            : 'border-gray-200 text-[#796B70]'
                        }`}
                      >
                        <span className="block font-bold">💬 Moderator</span>
                        <span className="text-[10px] block opacity-80">Client handling, orders &amp; payments</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-[#30252A]">Full Name</label>
                    <input
                      type="text"
                      required
                      value={staffForm.fullName}
                      onChange={(e) => setStaffForm(p => ({ ...p, fullName: e.target.value }))}
                      placeholder="e.g. Mahfuzur Rahman"
                      className="w-full px-3 py-2 rounded-xl border border-[#D85C83]/30 text-xs focus:outline-none focus:border-[#BE3D69]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-[#30252A]">Staff Official Email</label>
                    <input
                      type="email"
                      required
                      value={staffForm.email}
                      onChange={(e) => setStaffForm(p => ({ ...p, email: e.target.value }))}
                      placeholder="staff@crownandchic.com"
                      className="w-full px-3 py-2 rounded-xl border border-[#D85C83]/30 text-xs focus:outline-none focus:border-[#BE3D69]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-[#30252A]">Phone Number</label>
                    <input
                      type="tel"
                      value={staffForm.phone}
                      onChange={(e) => setStaffForm(p => ({ ...p, phone: e.target.value }))}
                      placeholder="017XXXXXXXX"
                      className="w-full px-3 py-2 rounded-xl border border-[#D85C83]/30 text-xs focus:outline-none focus:border-[#BE3D69]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-[#30252A]">Account Password</label>
                    <input
                      type="password"
                      required
                      value={staffForm.password}
                      onChange={(e) => setStaffForm(p => ({ ...p, password: e.target.value }))}
                      placeholder="Min 6 characters"
                      className="w-full px-3 py-2 rounded-xl border border-[#D85C83]/30 text-xs focus:outline-none focus:border-[#BE3D69]"
                    />
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddStaffModal(false)}
                      className="flex-1 py-2.5 rounded-full bg-gray-100 text-[#30252A] font-semibold hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingStaff}
                      className="flex-1 py-2.5 rounded-full bg-[#BE3D69] text-white font-semibold hover:bg-[#D85C83] disabled:opacity-50"
                    >
                      {isSubmittingStaff ? 'Creating...' : 'Create Staff Account'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}


          {/* ================================================================ */}
          {/* TAB: CATEGORY TAXONOMY MANAGEMENT */}
          {/* ================================================================ */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              
              {/* Top Banner & KPI */}
              <div className="p-5 rounded-3xl bg-white border border-[#FCE8EE] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="font-serif text-xl font-bold text-[#30252A] flex items-center gap-2">
                    <FolderTree className="w-5 h-5 text-[#BE3D69]" />
                    <span>Store Category Taxonomy</span>
                  </h2>
                  <p className="text-xs text-[#796B70]">
                    Organize storefront navigation, banner collections, and catalog taxonomy.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs px-3 py-1.5 rounded-full bg-[#FCE8EE] text-[#BE3D69] font-bold">
                    {categoriesList.length} Categories Total
                  </span>
                  <button
                    onClick={openAddCategoryModal}
                    className="px-4 py-2.5 rounded-full bg-[#BE3D69] text-white text-xs font-bold hover:bg-[#D85C83] transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Add New Category</span>
                  </button>
                </div>
              </div>

              {/* Feedback Alert */}
              {categoryActionMsg && (
                <div className={`p-3.5 rounded-2xl text-xs flex items-center gap-2.5 ${
                  categoryActionMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {categoryActionMsg.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />}
                  <span className="font-medium">{categoryActionMsg.text}</span>
                </div>
              )}

              {/* Search & Filter Bar */}
              <div className="flex items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-[#FCE8EE] shadow-2xs">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    placeholder="Search category by name or slug..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-gray-200 text-xs text-[#30252A] focus:outline-none focus:border-[#BE3D69]"
                  />
                </div>
                <div className="text-xs text-[#796B70]">
                  Showing <strong>{categoriesList.filter(c => c.name.toLowerCase().includes(categorySearch.toLowerCase()) || c.slug.toLowerCase().includes(categorySearch.toLowerCase())).length}</strong> of {categoriesList.length}
                </div>
              </div>

              {/* Categories Table & Cards */}
              <div className="bg-white rounded-3xl border border-[#FCE8EE] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FFFDF8] border-b border-[#FCE8EE] text-[#796B70] uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Image</th>
                        <th className="py-3 px-4">Category Name</th>
                        <th className="py-3 px-4">Slug / URL</th>
                        <th className="py-3 px-4">Sort Order</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {categoriesList
                        .filter(c => c.name.toLowerCase().includes(categorySearch.toLowerCase()) || c.slug.toLowerCase().includes(categorySearch.toLowerCase()))
                        .map(cat => (
                          <tr key={cat.id} className="hover:bg-[#FFFDF8]/50 transition-colors">
                            <td className="py-3 px-4">
                              <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-[#D85C83]/20 bg-gray-50 shrink-0">
                                <Image
                                  src={cat.image_url || '/images/categories/womens-fashion.jpg'}
                                  alt={cat.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-bold text-[#30252A] block text-sm">{cat.name}</span>
                              <span className="text-[11px] text-[#796B70] line-clamp-1">{cat.description || 'No description provided.'}</span>
                            </td>
                            <td className="py-3 px-4">
                              <Link
                                href={`/category/${cat.slug}`}
                                target="_blank"
                                className="font-mono text-[11px] text-[#BE3D69] hover:underline flex items-center gap-1"
                              >
                                <span>/category/{cat.slug}</span>
                                <ExternalLink className="w-3 h-3" />
                              </Link>
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-gray-600">
                              #{cat.sort_order || 1}
                            </td>
                            <td className="py-3 px-4">
                              <button
                                type="button"
                                onClick={() => handleToggleCategoryActive(cat)}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-all ${
                                  cat.is_active
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                    : 'bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200'
                                }`}
                                title="Click to toggle active state"
                              >
                                {cat.is_active ? '● Active' : '○ Inactive'}
                              </button>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => openEditCategoryModal(cat)}
                                  className="p-1.5 rounded-lg text-[#BE3D69] hover:bg-[#FCE8EE] transition-colors"
                                  title="Edit Category"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCategory(cat.id, cat.name)}
                                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                  title="Delete Category"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ================================================================ */}
          {/* TAB: PRODUCT CATALOG MANAGEMENT */}
          {/* ================================================================ */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              
              {/* Top Banner & KPI */}
              <div className="p-5 rounded-3xl bg-white border border-[#FCE8EE] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="font-serif text-xl font-bold text-[#30252A] flex items-center gap-2">
                    <Package className="w-5 h-5 text-[#BE3D69]" />
                    <span>Product Catalog Management</span>
                  </h2>
                  <p className="text-xs text-[#796B70]">
                    Create, edit, price, and publish boutique fashion &amp; lifestyle items.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs px-3 py-1.5 rounded-full bg-[#FCE8EE] text-[#BE3D69] font-bold">
                    {products.length} Products in Catalog
                  </span>
                  <button
                    onClick={openAddProductModal}
                    className="px-4 py-2.5 rounded-full bg-[#BE3D69] text-white text-xs font-bold hover:bg-[#D85C83] transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Add New Product</span>
                  </button>
                </div>
              </div>

              {/* Feedback Alert */}
              {productActionMsg && (
                <div className={`p-3.5 rounded-2xl text-xs flex items-center gap-2.5 ${
                  productActionMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {productActionMsg.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />}
                  <span className="font-medium">{productActionMsg.text}</span>
                </div>
              )}

              {/* Search & Filters */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#FCE8EE] shadow-2xs">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search by title, SKU, or keyword..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-gray-200 text-xs text-[#30252A] focus:outline-none focus:border-[#BE3D69]"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={productCategoryFilter}
                    onChange={(e) => setProductCategoryFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs text-[#30252A] bg-white focus:outline-none focus:border-[#BE3D69]"
                  >
                    <option value="all">All Categories</option>
                    {categoriesList.map(c => (
                      <option key={c.id} value={c.slug}>{c.name}</option>
                    ))}
                  </select>

                  <select
                    value={productStatusFilter}
                    onChange={(e) => setProductStatusFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs text-[#30252A] bg-white focus:outline-none focus:border-[#BE3D69]"
                  >
                    <option value="all">All Status</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              {/* Products Table */}
              <div className="bg-white rounded-3xl border border-[#FCE8EE] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FFFDF8] border-b border-[#FCE8EE] text-[#796B70] uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Product</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Base Price</th>
                        <th className="py-3 px-4">Stock &amp; Variants</th>
                        <th className="py-3 px-4">Badges</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {products
                        .filter(p => {
                          const matchSearch = p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
                            (p.sku && p.sku.toLowerCase().includes(productSearch.toLowerCase()));
                          const matchCat = productCategoryFilter === 'all' || p.categories.some(c => c.slug === productCategoryFilter);
                          const matchStat = productStatusFilter === 'all' || p.status === productStatusFilter;
                          return matchSearch && matchCat && matchStat;
                        })
                        .map(prod => {
                          const totalStock = prod.variants.reduce((acc, v) => acc + (v.stock_quantity || 0), 0);
                          const mainImg = prod.images[0]?.image_url || '/images/products/cotton-kurti.jpg';

                          return (
                            <tr key={prod.id} className="hover:bg-[#FFFDF8]/50 transition-colors">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="relative w-12 h-14 rounded-xl overflow-hidden border border-[#D85C83]/20 bg-gray-50 shrink-0">
                                    <Image
                                      src={mainImg}
                                      alt={prod.title}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                  <div>
                                    <Link
                                      href={`/products/${prod.slug}`}
                                      target="_blank"
                                      className="font-bold text-[#30252A] hover:text-[#BE3D69] text-sm block"
                                    >
                                      {prod.title}
                                    </Link>
                                    <span className="font-mono text-[10px] text-[#796B70]">SKU: {prod.sku || 'N/A'}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span className="inline-block px-2.5 py-1 rounded-full bg-rose-50 text-[#BE3D69] font-medium text-[11px]">
                                  {prod.categories[0]?.name || 'Uncategorized'}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="font-bold text-[#BE3D69] text-sm">
                                  {formatBDT(prod.base_sale_price || prod.base_price)}
                                </div>
                                {prod.base_sale_price && (
                                  <span className="line-through text-gray-400 text-[10px]">
                                    {formatBDT(prod.base_price)}
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                <div className="font-bold text-gray-800">
                                  {totalStock} in stock
                                </div>
                                <span className="text-[10px] text-[#796B70]">
                                  {prod.variants.length} variant{prod.variants.length === 1 ? '' : 's'}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex flex-wrap gap-1">
                                  {prod.is_featured && (
                                    <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[9px] font-bold">Featured</span>
                                  )}
                                  {prod.is_bestseller && (
                                    <span className="px-1.5 py-0.5 rounded bg-rose-100 text-[#BE3D69] text-[9px] font-bold">Bestseller</span>
                                  )}
                                  {prod.is_new_arrival && (
                                    <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 text-[9px] font-bold">New</span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <button
                                  type="button"
                                  onClick={() => handleToggleProductStatus(prod)}
                                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-all ${
                                    prod.status === 'published'
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                      : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                                  }`}
                                  title="Click to toggle status"
                                >
                                  {prod.status}
                                </button>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => openEditProductModal(prod)}
                                    className="p-1.5 rounded-lg text-[#BE3D69] hover:bg-[#FCE8EE] transition-colors"
                                    title="Edit Product Details"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setVariationProductFilter(prod.id);
                                      setActiveTab('variations');
                                    }}
                                    className="p-1.5 rounded-lg text-purple-600 hover:bg-purple-50 transition-colors"
                                    title="Manage Variants"
                                  >
                                    <Layers className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteProduct(prod.id, prod.title)}
                                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                    title="Delete Product"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ================================================================ */}
          {/* TAB: PRODUCT VARIATION MATRIX */}
          {/* ================================================================ */}
          {activeTab === 'variations' && (
            <div className="space-y-6">
              
              {/* Top Banner */}
              <div className="p-5 rounded-3xl bg-white border border-[#FCE8EE] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="font-serif text-xl font-bold text-[#30252A] flex items-center gap-2">
                    <Layers className="w-5 h-5 text-[#BE3D69]" />
                    <span>Product Variation Matrix &amp; Inventory</span>
                  </h2>
                  <p className="text-xs text-[#796B70]">
                    Directly audit and modify size, color, SKU stock units, and variant pricing.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={variationProductFilter}
                    onChange={(e) => setVariationProductFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-[#30252A] bg-white focus:outline-none focus:border-[#BE3D69]"
                  >
                    <option value="all">All Products</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Feedback Alert */}
              {variationActionMsg && (
                <div className="p-3.5 rounded-2xl text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium">{variationActionMsg.text}</span>
                </div>
              )}

              {/* Variations Table */}
              <div className="bg-white rounded-3xl border border-[#FCE8EE] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FFFDF8] border-b border-[#FCE8EE] text-[#796B70] uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Parent Product</th>
                        <th className="py-3 px-4">Size Variant</th>
                        <th className="py-3 px-4">Color Variant</th>
                        <th className="py-3 px-4">Variant SKU</th>
                        <th className="py-3 px-4">Current Stock Units</th>
                        <th className="py-3 px-4">Regular Price</th>
                        <th className="py-3 px-4 text-right">Instant Update</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {products
                        .filter(p => variationProductFilter === 'all' || p.id === variationProductFilter)
                        .flatMap(p => p.variants.map(v => ({ product: p, variant: v })))
                        .map(({ product: p, variant: v }) => {
                          const isLowStock = v.stock_quantity < 10;
                          return (
                            <tr key={v.id} className="hover:bg-[#FFFDF8]/50 transition-colors">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2.5">
                                  <div className="relative w-9 h-11 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 shrink-0">
                                    <Image
                                      src={p.images[0]?.image_url || '/images/products/cotton-kurti.jpg'}
                                      alt={p.title}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                  <span className="font-bold text-[#30252A] line-clamp-1">{p.title}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span className="inline-block px-2.5 py-1 rounded-lg bg-gray-100 text-[#30252A] font-bold text-xs">
                                  {v.attributes.size || 'Standard'}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <span className="inline-flex items-center gap-1.5 font-medium text-gray-700">
                                  <span className="w-3 h-3 rounded-full bg-[#D85C83] border border-gray-200" />
                                  <span>{v.attributes.color || 'Rose Pink'}</span>
                                </span>
                              </td>
                              <td className="py-3 px-4 font-mono text-[11px] text-gray-600">
                                {v.sku}
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <span className={`font-mono text-sm font-bold ${
                                    isLowStock ? 'text-amber-600' : 'text-emerald-700'
                                  }`}>
                                    {v.stock_quantity}
                                  </span>
                                  {isLowStock && (
                                    <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px] font-bold">
                                      Low
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-4 font-bold text-[#BE3D69]">
                                {formatBDT(v.regular_price)}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateVariantDirect(v.id, v.stock_quantity + 10)}
                                    className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[10px] font-bold"
                                    title="Add 10 units"
                                  >
                                    +10 Stock
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateVariantDirect(v.id, Math.max(0, v.stock_quantity - 5))}
                                    className="px-2 py-1 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-[10px] font-bold"
                                    title="Reduce 5 units"
                                  >
                                    -5 Stock
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </div>
      </main>

      
      {/* Category Add/Edit Modal */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl border border-[#FCE8EE] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#FCE8EE] pb-3">
              <h3 className="font-serif font-bold text-lg text-[#30252A] flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-[#BE3D69]" />
                <span>{editingCategory ? 'Edit Category' : 'Create New Category'}</span>
              </h3>
              <button
                onClick={() => setCategoryModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#30252A]">Category Name</label>
                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCategoryForm(prev => ({
                      ...prev,
                      name: val,
                      slug: editingCategory ? prev.slug : val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
                    }));
                  }}
                  placeholder="e.g. Traditional Sarees"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#BE3D69]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#30252A]">Category Slug (URL Path)</label>
                <input
                  type="text"
                  required
                  value={categoryForm.slug}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="traditional-sarees"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 font-mono text-xs focus:outline-none focus:border-[#BE3D69]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#30252A]">Description</label>
                <textarea
                  rows={2}
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Short summary for category banner..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#BE3D69]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#30252A]">Image URL or Asset Path</label>
                <input
                  type="text"
                  required
                  value={categoryForm.image_url}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, image_url: e.target.value }))}
                  placeholder="/images/categories/womens-fashion.jpg"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#BE3D69]"
                />
                <div className="flex flex-wrap gap-1.5 pt-1 text-[10px] text-[#796B70]">
                  <span>Presets:</span>
                  {[
                    '/images/categories/womens-fashion.jpg',
                    '/images/categories/mens-fashion.jpg',
                    '/images/categories/kids-fashion.jpg',
                    '/images/categories/hijab-scarf.jpg',
                    '/images/categories/bags-accessories.jpg',
                    '/images/categories/footwear.jpg',
                    '/images/categories/beauty-personal-care.jpg',
                    '/images/categories/home-living.jpg'
                  ].map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setCategoryForm(p => ({ ...p, image_url: preset }))}
                      className="px-1.5 py-0.5 rounded bg-gray-100 hover:bg-[#FCE8EE] hover:text-[#BE3D69] text-gray-700"
                    >
                      {preset.split('/').pop()?.replace('.jpg', '')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-[#30252A]">Display Order</label>
                  <input
                    type="number"
                    min="1"
                    value={categoryForm.sort_order}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, sort_order: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#BE3D69]"
                  />
                </div>
                <div className="space-y-1 flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer py-2">
                    <input
                      type="checkbox"
                      checked={categoryForm.is_active}
                      onChange={(e) => setCategoryForm(prev => ({ ...prev, is_active: e.target.checked }))}
                      className="rounded text-[#BE3D69] focus:ring-[#BE3D69]"
                    />
                    <span className="font-bold text-[#30252A]">Active in Navigation</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(false)}
                  className="flex-1 py-2.5 rounded-full bg-gray-100 text-[#30252A] font-semibold hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingCategory}
                  className="flex-1 py-2.5 rounded-full bg-[#BE3D69] text-white font-semibold hover:bg-[#D85C83] disabled:opacity-50"
                >
                  {isSavingCategory ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Add/Edit Modal */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full space-y-4 shadow-2xl border border-[#FCE8EE] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#FCE8EE] pb-3">
              <h3 className="font-serif font-bold text-lg text-[#30252A] flex items-center gap-2">
                <Package className="w-5 h-5 text-[#BE3D69]" />
                <span>{editingProduct ? 'Edit Product in Catalog' : 'Add New Product to Catalog'}</span>
              </h3>
              <button
                onClick={() => setProductModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-[#30252A]">Product Title</label>
                  <input
                    type="text"
                    required
                    value={productForm.title}
                    onChange={(e) => {
                      const val = e.target.value;
                      setProductForm(prev => ({
                        ...prev,
                        title: val,
                        slug: editingProduct ? prev.slug : val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
                      }));
                    }}
                    placeholder="e.g. Silk Georgette Anarkali"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#BE3D69]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#30252A]">SKU Code</label>
                  <input
                    type="text"
                    required
                    value={productForm.sku}
                    onChange={(e) => setProductForm(prev => ({ ...prev, sku: e.target.value }))}
                    placeholder="CNC-ESK-01"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 font-mono text-xs focus:outline-none focus:border-[#BE3D69]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-[#30252A]">Primary Category</label>
                  <select
                    value={productForm.category_slug}
                    onChange={(e) => setProductForm(prev => ({ ...prev, category_slug: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white focus:outline-none focus:border-[#BE3D69]"
                  >
                    {categoriesList.map(c => (
                      <option key={c.id} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#30252A]">Regular Price (BDT ৳)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={productForm.base_price}
                    onChange={(e) => setProductForm(prev => ({ ...prev, base_price: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#BE3D69]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#30252A]">Sale Discount Price (Optional ৳)</label>
                  <input
                    type="number"
                    min="1"
                    value={productForm.base_sale_price}
                    onChange={(e) => setProductForm(prev => ({ ...prev, base_sale_price: e.target.value ? Number(e.target.value) : '' }))}
                    placeholder="Optional sale price"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#BE3D69]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#30252A]">Product Slug (URL)</label>
                <input
                  type="text"
                  required
                  value={productForm.slug}
                  onChange={(e) => setProductForm(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="silk-georgette-anarkali"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 font-mono text-xs focus:outline-none focus:border-[#BE3D69]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#30252A]">Primary Image URL</label>
                <input
                  type="text"
                  required
                  value={productForm.image_url}
                  onChange={(e) => setProductForm(prev => ({ ...prev, image_url: e.target.value }))}
                  placeholder="/images/products/cotton-kurti.jpg"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#BE3D69]"
                />
                <div className="flex flex-wrap gap-1.5 pt-1 text-[10px] text-[#796B70]">
                  <span>Presets:</span>
                  {[
                    '/images/products/cotton-kurti.jpg',
                    '/images/products/floral-maxi.jpg',
                    '/images/products/salwar-kameez.jpg',
                    '/images/products/chiffon-hijab.jpg',
                    '/images/products/mens-shirt.jpg',
                    '/images/products/shoulder-bag.jpg',
                    '/images/products/running-shoes.jpg',
                    '/images/products/kids-frock.jpg'
                  ].map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setProductForm(p => ({ ...p, image_url: preset }))}
                      className="px-1.5 py-0.5 rounded bg-gray-100 hover:bg-[#FCE8EE] hover:text-[#BE3D69] text-gray-700"
                    >
                      {preset.split('/').pop()?.replace('.jpg', '')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#30252A]">Short Description</label>
                <input
                  type="text"
                  value={productForm.short_description}
                  onChange={(e) => setProductForm(prev => ({ ...prev, short_description: e.target.value }))}
                  placeholder="Breathable premium cotton fabric with delicate thread embroidery..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#BE3D69]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#30252A]">Full Product Details &amp; Specifications</label>
                <textarea
                  rows={3}
                  value={productForm.description}
                  onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Complete styling notes, fabric care, wash instructions..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#BE3D69]"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div>
                  <label className="font-bold text-[#30252A] block mb-1">Status</label>
                  <select
                    value={productForm.status}
                    onChange={(e) => setProductForm(prev => ({ ...prev, status: e.target.value as typeof productForm.status }))}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-gray-200 text-xs bg-white focus:outline-none focus:border-[#BE3D69]"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-4">
                  <input
                    type="checkbox"
                    id="is_featured"
                    checked={productForm.is_featured}
                    onChange={(e) => setProductForm(prev => ({ ...prev, is_featured: e.target.checked }))}
                    className="rounded text-[#BE3D69]"
                  />
                  <label htmlFor="is_featured" className="font-semibold text-xs text-[#30252A] cursor-pointer">
                    Featured
                  </label>
                </div>

                <div className="flex items-center gap-2 pt-4">
                  <input
                    type="checkbox"
                    id="is_bestseller"
                    checked={productForm.is_bestseller}
                    onChange={(e) => setProductForm(prev => ({ ...prev, is_bestseller: e.target.checked }))}
                    className="rounded text-[#BE3D69]"
                  />
                  <label htmlFor="is_bestseller" className="font-semibold text-xs text-[#30252A] cursor-pointer">
                    Bestseller
                  </label>
                </div>

                <div className="flex items-center gap-2 pt-4">
                  <input
                    type="checkbox"
                    id="is_new_arrival"
                    checked={productForm.is_new_arrival}
                    onChange={(e) => setProductForm(prev => ({ ...prev, is_new_arrival: e.target.checked }))}
                    className="rounded text-[#BE3D69]"
                  />
                  <label htmlFor="is_new_arrival" className="font-semibold text-xs text-[#30252A] cursor-pointer">
                    New Arrival
                  </label>
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="flex-1 py-2.5 rounded-full bg-gray-100 text-[#30252A] font-semibold hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProduct}
                  className="flex-1 py-2.5 rounded-full bg-[#BE3D69] text-white font-semibold hover:bg-[#D85C83] disabled:opacity-50"
                >
                  {isSavingProduct ? 'Saving...' : 'Save Product to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full space-y-4 shadow-2xl border border-[#FCE8EE]">
            <div className="flex items-center justify-between border-b border-[#FCE8EE] pb-3">
              <div>
                <span className="font-mono text-base font-bold text-[#BE3D69] block">
                  {selectedOrder.order_number}
                </span>
                <span className="text-xs text-[#796B70]">
                  Placed on {new Date(selectedOrder.created_at).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-bold text-[#30252A] block">Customer Delivery Details:</span>
                <p>{selectedOrder.customer_name} &bull; {selectedOrder.customer_phone}</p>
                <p className="text-[#796B70]">{selectedOrder.full_address}, {selectedOrder.thana}, {selectedOrder.district}, {selectedOrder.division}</p>
                {selectedOrder.delivery_notes && (
                  <p className="italic text-gray-500 mt-1">Note: {selectedOrder.delivery_notes}</p>
                )}
              </div>

              <div className="pt-2 border-t border-[#FCE8EE]">
                <span className="font-bold text-[#30252A] block mb-1">Ordered Items:</span>
                <div className="space-y-1.5">
                  {selectedOrder.items.map(it => (
                    <div key={it.id} className="flex justify-between py-1 border-b border-gray-100">
                      <span>{it.product_title} ({it.variant_title}) &times; {it.quantity}</span>
                      <span className="font-bold text-[#BE3D69]">{formatBDT(it.total_price)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-between font-bold text-sm text-[#30252A]">
                <span>Total Amount:</span>
                <span className="text-[#BE3D69]">{formatBDT(selectedOrder.total_amount)}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedOrder(null)}
              className="w-full py-2.5 rounded-full bg-gray-100 text-[#30252A] text-xs font-semibold hover:bg-gray-200"
            >
              Close Details
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
