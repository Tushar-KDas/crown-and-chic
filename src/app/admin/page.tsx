import { store } from '@/lib/db/store';
import { AdminDashboardClient } from '@/components/admin/AdminDashboardClient';

export default function AdminPage() {
  const initialOrders = store.getOrders();
  const products = store.getProducts();
  const categories = store.getAllCategories();
  const paymentMethods = store.getAllPaymentMethods();
  const siteSettings = store.getSiteSettings();
  const initialUsers = store.getUsers();

  return (
    <AdminDashboardClient
      initialOrders={initialOrders}
      products={products}
      categories={categories}
      paymentMethods={paymentMethods}
      siteSettings={siteSettings}
      initialUsers={initialUsers}
    />
  );
}
