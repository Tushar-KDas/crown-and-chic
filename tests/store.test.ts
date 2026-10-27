import { describe, it, expect } from 'vitest';
import { store } from '../src/lib/db/store';
import { formatBDT, isValidBDPhoneNumber, normalizeBDPhoneNumber, generateOrderNumber } from '../src/lib/utils';
import { BANGLADESH_DIVISIONS, getShippingCharge } from '../src/lib/bangladesh-data';

describe('Utility & Formatting Tests', () => {
  it('formats BDT amounts correctly', () => {
    expect(formatBDT(1250)).toBe('৳ 1,250');
    expect(formatBDT(1999)).toBe('৳ 1,999');
    expect(formatBDT(876500)).toBe('৳ 8,76,500');
    expect(formatBDT(0)).toBe('৳ 0');
    expect(formatBDT(null)).toBe('৳ 0');
  });

  it('validates Bangladesh mobile numbers correctly', () => {
    expect(isValidBDPhoneNumber('01712345678')).toBe(true);
    expect(isValidBDPhoneNumber('01812345678')).toBe(true);
    expect(isValidBDPhoneNumber('+8801912345678')).toBe(true);
    expect(isValidBDPhoneNumber('8801512345678')).toBe(true);
    expect(isValidBDPhoneNumber('01212345678')).toBe(false); // Invalid operator prefix
    expect(isValidBDPhoneNumber('123456')).toBe(false);
  });

  it('normalizes Bangladesh phone numbers', () => {
    expect(normalizeBDPhoneNumber('+8801712345678')).toBe('01712345678');
    expect(normalizeBDPhoneNumber('8801712345678')).toBe('01712345678');
    expect(normalizeBDPhoneNumber('01712345678')).toBe('01712345678');
  });

  it('generates unique order numbers matching format', () => {
    const num = generateOrderNumber();
    expect(num).toMatch(/^CNC-\d{8}-\d{4}$/);
  });

  it('calculates shipping charges accurately', () => {
    // Inside Dhaka: 60 BDT
    expect(getShippingCharge('Dhaka', 1000)).toBe(60);
    // Outside Dhaka: 120 BDT
    expect(getShippingCharge('Chattogram', 1000)).toBe(120);
    // Free shipping threshold >= 2500 BDT
    expect(getShippingCharge('Dhaka', 2500)).toBe(0);
    expect(getShippingCharge('Sylhet', 3000)).toBe(0);
  });

  it('contains complete Bangladesh divisions and districts', () => {
    expect(BANGLADESH_DIVISIONS.length).toBe(8);
    const dhaka = BANGLADESH_DIVISIONS.find(d => d.name === 'Dhaka');
    expect(dhaka).toBeDefined();
    expect(dhaka?.districts.some(dist => dist.name === 'Dhaka Metro')).toBe(true);
  });
});

describe('Store & Atomic Inventory Tests', () => {
  it('loads active categories and published products', () => {
    const categories = store.getCategories();
    expect(categories.length).toBeGreaterThan(0);

    const products = store.getProducts();
    expect(products.length).toBeGreaterThan(0);
    expect(products[0].variants.length).toBeGreaterThan(0);
  });

  it('executes atomic order placement and reduces stock', () => {
    const products = store.getProducts();
    const testProduct = products[0];
    const testVariant = testProduct.variants[0];
    const initialStock = testVariant.stock_quantity;

    const result = store.createOrder({
      customer_name: 'Test Customer',
      customer_phone: '01711122233',
      division: 'Dhaka',
      district: 'Dhaka Metro',
      thana: 'Dhanmondi',
      full_address: 'House 1, Road 2',
      payment_method: 'cod',
      items: [{ variant_id: testVariant.id, quantity: 2 }]
    });

    expect(result.success).toBe(true);
    expect(result.order).toBeDefined();
    expect(result.order?.order_number).toMatch(/^CNC-\d{8}-\d{4}$/);

    // Stock must be reduced by 2
    const updatedVariant = store.getVariantById(testVariant.id);
    expect(updatedVariant?.stock_quantity).toBe(initialStock - 2);
  });

  it('prevents overselling when requested quantity exceeds stock', () => {
    const products = store.getProducts();
    const testVariant = products[0].variants[0];

    const result = store.createOrder({
      customer_name: 'Over buyer',
      customer_phone: '01711122233',
      division: 'Dhaka',
      district: 'Dhaka Metro',
      thana: 'Mirpur',
      full_address: 'Mirpur 10',
      payment_method: 'cod',
      items: [{ variant_id: testVariant.id, quantity: 99999 }]
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Insufficient stock');
  });

  it('handles payment submission and admin verification flow', () => {
    // 1. Create order
    const orderResult = store.createOrder({
      customer_name: 'Payment Tester',
      customer_phone: '01811223344',
      division: 'Dhaka',
      district: 'Dhaka Metro',
      thana: 'Gulshan',
      full_address: 'Gulshan 2',
      payment_method: 'bkash',
      items: [{ variant_id: 'var-2-m-pink', quantity: 1 }]
    });

    expect(orderResult.success).toBe(true);
    const orderId = orderResult.order!.id;

    // 2. Submit payment proof
    const subResult = store.submitPaymentProof({
      order_id: orderId,
      payment_method: 'bkash',
      transaction_id: 'TESTTRX123',
      sender_phone: '01811223344',
      amount: orderResult.order!.total_amount
    });

    expect(subResult.success).toBe(true);
    expect(store.getOrderById(orderId)?.payment_status).toBe('pending_verification');

    // 3. Admin verifies payment
    const verifyResult = store.verifyPayment(orderId, 'verified', 'Payment received in full');
    expect(verifyResult).toBe(true);

    const verifiedOrder = store.getOrderById(orderId);
    expect(verifiedOrder?.payment_status).toBe('paid');
    expect(verifiedOrder?.order_status).toBe('confirmed');
  });

  it('calculates dashboard metrics properly', () => {
    const metrics = store.getDashboardMetrics();
    expect(metrics.totalUsers).toBe(1245);
    expect(metrics.totalOrders).toBeGreaterThanOrEqual(3520);
    expect(metrics.totalRevenue).toBeGreaterThanOrEqual(876500);
    expect(metrics.recentOrders.length).toBeGreaterThan(0);
  });
});

describe('4-Tier User Roles & Authentication Tests', () => {
  it('authenticates Super Admin with specified credentials', () => {
    const auth = store.authenticateUser('tusharkumardas.ai@gmail.com', 'Nishita018879');
    expect(auth.success).toBe(true);
    expect(auth.user?.role).toBe('super_admin');
    expect(auth.user?.email).toBe('tusharkumardas.ai@gmail.com');
  });

  it('rejects incorrect password for Super Admin', () => {
    const auth = store.authenticateUser('tusharkumardas.ai@gmail.com', 'WrongPassword123');
    expect(auth.success).toBe(false);
    expect(auth.error).toContain('Incorrect password');
  });

  it('rejects login for unregistered email', () => {
    const auth = store.authenticateUser('nonexistent@example.com', 'Password123');
    expect(auth.success).toBe(false);
    expect(auth.error).toContain('No account found');
  });

  it('allows normal users to register their own account', () => {
    const reg = store.registerUser({
      full_name: 'Sabina Yasmin',
      email: 'sabina.test@example.com',
      phone: '01755123456',
      password: 'MySecretPassword'
    });
    expect(reg.success).toBe(true);
    expect(reg.user?.role).toBe('customer');

    // Can now log in with their credentials
    const login = store.authenticateUser('sabina.test@example.com', 'MySecretPassword');
    expect(login.success).toBe(true);
    expect(login.user?.role).toBe('customer');
  });

  it('allows Super Admin to appoint new Admin and Moderator staff', () => {
    const newAdmin = store.addStaffUser('tusharkumardas.ai@gmail.com', {
      full_name: 'New Admin Member',
      email: 'newadmin@crownandchic.com',
      phone: '01711998877',
      password: 'StaffPassword123',
      role: 'admin'
    });
    expect(newAdmin.success).toBe(true);
    expect(newAdmin.user?.role).toBe('admin');

    const newMod = store.addStaffUser('tusharkumardas.ai@gmail.com', {
      full_name: 'New Moderator Member',
      email: 'newmod@crownandchic.com',
      phone: '01711554433',
      password: 'StaffPassword123',
      role: 'moderator'
    });
    expect(newMod.success).toBe(true);
    expect(newMod.user?.role).toBe('moderator');
  });

  it('strictly forbids non-Super Admin from appointing staff', () => {
    // Normal admin attempts to add another admin
    const attempt = store.addStaffUser('admin@crownandchic.com', {
      full_name: 'Hacker Admin',
      email: 'hacker@example.com',
      phone: '01700000000',
      password: 'Hacked123',
      role: 'admin'
    });
    expect(attempt.success).toBe(false);
    expect(attempt.error).toContain('Only Super Admin');
  });

  it('allows Super Admin to update user roles and suspend accounts', () => {
    const user = store.getUserByEmail('customer@example.com');
    expect(user).toBeDefined();

    // Promote to moderator
    const updateRole = store.updateUserRole('tusharkumardas.ai@gmail.com', user!.id, 'moderator');
    expect(updateRole.success).toBe(true);
    expect(updateRole.user?.role).toBe('moderator');

    // Suspend account
    const suspend = store.updateUserStatus('tusharkumardas.ai@gmail.com', user!.id, 'suspended');
    expect(suspend.success).toBe(true);

    // Suspended account cannot log in
    const login = store.authenticateUser('customer@example.com', 'Customer123456');
    expect(login.success).toBe(false);
    expect(login.error).toContain('suspended');
  });
});
