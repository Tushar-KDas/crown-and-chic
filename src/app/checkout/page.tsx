'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Truck, 
  Banknote, 
  Smartphone, 
  Building, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle,
  ShoppingBag
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { BANGLADESH_DIVISIONS, getShippingCharge } from '@/lib/bangladesh-data';
import { formatBDT, isValidBDPhoneNumber } from '@/lib/utils';
import { PaymentMethodCode } from '@/types';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();

  // Form Fields
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [division, setDivision] = useState('Dhaka');
  const [district, setDistrict] = useState('Dhaka Metro');
  const [thana, setThana] = useState('Dhanmondi');
  const [fullAddress, setFullAddress] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodCode>('cod');

  // Manual MFS Fields
  const [transactionId, setTransactionId] = useState('');
  const [senderPhone, setSenderPhone] = useState('');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Restore draft form info across page reloads
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('cq_checkout_draft');
      if (saved) {
        const d = JSON.parse(saved);
        if (d.customerName) setCustomerName(d.customerName);
        if (d.customerPhone) setCustomerPhone(d.customerPhone);
        if (d.customerEmail) setCustomerEmail(d.customerEmail);
        if (d.division) setDivision(d.division);
        if (d.district) setDistrict(d.district);
        if (d.thana) setThana(d.thana);
        if (d.fullAddress) setFullAddress(d.fullAddress);
        if (d.deliveryNotes) setDeliveryNotes(d.deliveryNotes);
      }
    } catch {
      // Ignore
    }
  }, []);

  // Save draft form info on changes
  useEffect(() => {
    try {
      sessionStorage.setItem('cq_checkout_draft', JSON.stringify({
        customerName,
        customerPhone,
        customerEmail,
        division,
        district,
        thana,
        fullAddress,
        deliveryNotes
      }));
    } catch {
      // Ignore
    }
  }, [customerName, customerPhone, customerEmail, division, district, thana, fullAddress, deliveryNotes]);

  // Find active division districts & thanas
  const activeDivisionData = BANGLADESH_DIVISIONS.find(d => d.name === division) || BANGLADESH_DIVISIONS[0];
  const activeDistrictData = activeDivisionData.districts.find(dist => dist.name === district) || activeDivisionData.districts[0];

  // Auto-cascade districts & thanas when division changes
  const handleDivisionChange = (newDivision: string) => {
    setDivision(newDivision);
    const divData = BANGLADESH_DIVISIONS.find(d => d.name === newDivision);
    if (divData && divData.districts.length > 0) {
      setDistrict(divData.districts[0].name);
      setThana(divData.districts[0].thanas[0] || 'Sadar');
    }
  };

  const handleDistrictChange = (newDistrict: string) => {
    setDistrict(newDistrict);
    const distData = activeDivisionData.districts.find(d => d.name === newDistrict);
    if (distData && distData.thanas.length > 0) {
      setThana(distData.thanas[0]);
    }
  };

  const shippingCharge = getShippingCharge(division, subtotal);
  const finalPayable = subtotal + shippingCharge;

  // Phone validation feedback
  const isPhoneValid = isValidBDPhoneNumber(customerPhone);
  const showPhoneError = customerPhone.length > 0 && !isPhoneValid;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (items.length === 0) {
      setErrorMessage('Your cart is empty. Please add products before checking out.');
      return;
    }

    if (!customerName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!isPhoneValid) {
      setErrorMessage('Please enter a valid Bangladesh mobile number (e.g. 01712345678).');
      return;
    }

    if (!fullAddress.trim()) {
      setErrorMessage('Please enter your complete street and house delivery address.');
      return;
    }

    if (paymentMethod !== 'cod' && !transactionId.trim()) {
      setErrorMessage(`Please enter your ${paymentMethod.toUpperCase()} Transaction ID (TrxID) after completing the payment.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName.trim(),
          customer_phone: customerPhone.trim(),
          customer_email: customerEmail.trim() || undefined,
          division,
          district,
          thana,
          full_address: fullAddress.trim(),
          delivery_notes: deliveryNotes.trim() || undefined,
          payment_method: paymentMethod,
          transaction_id: transactionId.trim() || undefined,
          sender_phone: senderPhone.trim() || customerPhone.trim(),
          items: items.map(i => ({
            variant_id: i.variant.id,
            product_id: i.product.id,
            product_title: i.product.title,
            variant_title: `${i.variant.attributes?.size ? `Size: ${i.variant.attributes.size}` : ''} ${i.variant.attributes?.color ? `| Color: ${i.variant.attributes.color}` : ''}`.trim() || 'Standard',
            sku: i.variant.sku,
            unit_price: i.unit_price,
            image_url: i.variant.image_url || i.product.images[0]?.image_url,
            quantity: i.quantity
          }))
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrorMessage(data.error || 'Failed to place order. Please review your details.');
        setIsSubmitting(false);
        return;
      }

      // Order placed successfully!
      clearCart();
      try { sessionStorage.removeItem('cq_checkout_draft'); } catch {}
      router.push(`/order-confirmation?orderNumber=${encodeURIComponent(data.orderNumber)}`);

    } catch (err) {
      setErrorMessage('Network error occurred. Please check your internet connection and try again.');
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto px-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-[#FCE8EE] flex items-center justify-center text-[#BE3D69]">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-[#30252A]">Your cart is empty</h2>
        <p className="text-xs text-[#796B70]">Add some gorgeous dresses or accessories to your cart first.</p>
        <Link 
          href="/products"
          className="inline-block px-8 py-3 rounded-full bg-[#BE3D69] text-white text-xs font-semibold hover:bg-[#D85C83]"
        >
          Browse Collections
        </Link>
      </div>
    );
  }

  return (
    <div className="py-8 md:py-12 bg-[#FFFDF8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="border-b border-[#FCE8EE] pb-4 mb-8">
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#30252A]">
            Checkout & Delivery Information
          </h1>
          <p className="text-xs text-[#796B70] mt-1">
            Fast, secure shipping across all 64 districts of Bangladesh
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          
          {/* Left: Customer Info & Address Form */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Step 1: Contact Details */}
            <div className="p-6 rounded-3xl bg-white border border-[#FCE8EE] shadow-luxury space-y-4">
              <h2 className="font-serif text-lg font-bold text-[#30252A] flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#BE3D69] text-white text-xs flex items-center justify-center">1</span>
                Customer Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#30252A]">
                    Full Name <span className="text-[#BE3D69]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Ayesha Siddiqa"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#D85C83]/30 bg-white text-xs text-[#30252A] focus:outline-none focus:border-[#BE3D69]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#30252A]">
                    Mobile Phone Number <span className="text-[#BE3D69]">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="e.g. 01712345678"
                    className={`w-full px-4 py-2.5 rounded-xl border bg-white text-xs text-[#30252A] focus:outline-none ${
                      showPhoneError ? 'border-red-500 focus:border-red-500' : 'border-[#D85C83]/30 focus:border-[#BE3D69]'
                    }`}
                  />
                  {showPhoneError && (
                    <span className="text-[10px] text-red-600 block">
                      Invalid BD phone. Format: 013-019XXXXXXXX
                    </span>
                  )}
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-[#30252A]">
                    Email Address <span className="text-gray-400 font-normal">(Optional for order tracking)</span>
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="e.g. yourname@example.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#D85C83]/30 bg-white text-xs text-[#30252A] focus:outline-none focus:border-[#BE3D69]"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Shipping Address with Bangladesh Cascade */}
            <div className="p-6 rounded-3xl bg-white border border-[#FCE8EE] shadow-luxury space-y-4">
              <h2 className="font-serif text-lg font-bold text-[#30252A] flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#BE3D69] text-white text-xs flex items-center justify-center">2</span>
                Delivery Address in Bangladesh
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Division */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#30252A]">
                    Division <span className="text-[#BE3D69]">*</span>
                  </label>
                  <select
                    value={division}
                    onChange={(e) => handleDivisionChange(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#D85C83]/30 bg-white text-xs text-[#30252A] focus:outline-none focus:border-[#BE3D69]"
                  >
                    {BANGLADESH_DIVISIONS.map(div => (
                      <option key={div.name} value={div.name}>{div.name}</option>
                    ))}
                  </select>
                </div>

                {/* District */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#30252A]">
                    District <span className="text-[#BE3D69]">*</span>
                  </label>
                  <select
                    value={district}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#D85C83]/30 bg-white text-xs text-[#30252A] focus:outline-none focus:border-[#BE3D69]"
                  >
                    {activeDivisionData.districts.map(dist => (
                      <option key={dist.name} value={dist.name}>{dist.name}</option>
                    ))}
                  </select>
                </div>

                {/* Upazila / Thana */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#30252A]">
                    Upazila / Thana <span className="text-[#BE3D69]">*</span>
                  </label>
                  <select
                    value={thana}
                    onChange={(e) => setThana(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#D85C83]/30 bg-white text-xs text-[#30252A] focus:outline-none focus:border-[#BE3D69]"
                  >
                    {activeDistrictData.thanas.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                {/* Full Street Address */}
                <div className="sm:col-span-3 space-y-1.5">
                  <label className="text-xs font-bold text-[#30252A]">
                    Detailed Street / House / Road / Area Address <span className="text-[#BE3D69]">*</span>
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={fullAddress}
                    onChange={(e) => setFullAddress(e.target.value)}
                    placeholder="e.g. House 14, Flat 3B, Road 7, Dhanmondi R/A"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#D85C83]/30 bg-white text-xs text-[#30252A] focus:outline-none focus:border-[#BE3D69]"
                  />
                </div>

                {/* Delivery Notes */}
                <div className="sm:col-span-3 space-y-1.5">
                  <label className="text-xs font-bold text-[#30252A]">
                    Special Delivery Instructions <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    placeholder="e.g. Please call before arriving or leave with security"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#D85C83]/30 bg-white text-xs text-[#30252A] focus:outline-none focus:border-[#BE3D69]"
                  />
                </div>

              </div>
            </div>

            {/* Step 3: Payment Method Selection */}
            <div className="p-6 rounded-3xl bg-white border border-[#FCE8EE] shadow-luxury space-y-5">
              <h2 className="font-serif text-lg font-bold text-[#30252A] flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#BE3D69] text-white text-xs flex items-center justify-center">3</span>
                Select Payment Method
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* Cash on Delivery */}
                <label 
                  className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'cod' ? 'border-[#BE3D69] bg-[#FCE8EE]/40 shadow-xs' : 'border-[#FCE8EE] bg-white hover:border-[#D85C83]/30'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="mt-1 accent-[#BE3D69]"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#30252A] block">
                      Cash On Delivery (COD)
                    </span>
                    <span className="text-[11px] text-[#796B70] block mt-0.5">
                      Pay cash to delivery rider at your doorstep
                    </span>
                  </div>
                </label>

                {/* bKash */}
                <label 
                  className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'bkash' ? 'border-[#BE3D69] bg-[#FCE8EE]/40 shadow-xs' : 'border-[#FCE8EE] bg-white hover:border-[#D85C83]/30'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value="bkash"
                    checked={paymentMethod === 'bkash'}
                    onChange={() => setPaymentMethod('bkash')}
                    className="mt-1 accent-[#BE3D69]"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#30252A] block flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-[#BE3D69]" />
                      bKash Payment / Send Money
                    </span>
                    <span className="text-[11px] text-[#796B70] block mt-0.5">
                      Merchant: 01711-XXXXXX
                    </span>
                  </div>
                </label>

                {/* Nagad */}
                <label 
                  className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'nagad' ? 'border-[#BE3D69] bg-[#FCE8EE]/40 shadow-xs' : 'border-[#FCE8EE] bg-white hover:border-[#D85C83]/30'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value="nagad"
                    checked={paymentMethod === 'nagad'}
                    onChange={() => setPaymentMethod('nagad')}
                    className="mt-1 accent-[#BE3D69]"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#30252A] block flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-[#BE3D69]" />
                      Nagad Payment
                    </span>
                    <span className="text-[11px] text-[#796B70] block mt-0.5">
                      Merchant: 01722-XXXXXX
                    </span>
                  </div>
                </label>

                {/* Rocket */}
                <label 
                  className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'rocket' ? 'border-[#BE3D69] bg-[#FCE8EE]/40 shadow-xs' : 'border-[#FCE8EE] bg-white hover:border-[#D85C83]/30'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value="rocket"
                    checked={paymentMethod === 'rocket'}
                    onChange={() => setPaymentMethod('rocket')}
                    className="mt-1 accent-[#BE3D69]"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#30252A] block flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-[#BE3D69]" />
                      Rocket Mobile Banking
                    </span>
                    <span className="text-[11px] text-[#796B70] block mt-0.5">
                      Personal: 01853-XXXXXX
                    </span>
                  </div>
                </label>

              </div>

              {/* MFS Instructions & Transaction ID Input */}
              {paymentMethod !== 'cod' && (
                <div className="p-4 rounded-2xl bg-[#FFFDF8] border border-[#D85C83]/30 space-y-4">
                  <div className="space-y-1 text-xs">
                    <span className="font-bold text-[#BE3D69] block">
                      Payment Instructions for {paymentMethod.toUpperCase()}:
                    </span>
                    <p className="text-[#30252A]">
                      1. Transfer the total amount <strong>{formatBDT(finalPayable)}</strong> to our official {paymentMethod.toUpperCase()} number:
                    </p>
                    <p className="p-2.5 rounded-lg bg-[#FCE8EE] font-mono text-xs font-bold text-[#BE3D69] inline-block">
                      {paymentMethod === 'bkash' && 'bKash Merchant: 01711-987654'}
                      {paymentMethod === 'nagad' && 'Nagad Merchant: 01722-876543'}
                      {paymentMethod === 'rocket' && 'Rocket Personal: 01853-765432'}
                      {paymentMethod === 'bank_transfer' && 'City Bank A/C: 1203498172001 (Crown & Chic Ltd.)'}
                    </p>
                    <p className="text-[#796B70] text-[11px]">
                      2. After completing the payment, input your Transaction ID below for verification.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#30252A]">
                        Transaction ID (TrxID) <span className="text-[#BE3D69]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        placeholder="e.g. 9M8A7B6C5D"
                        className="w-full px-3 py-2 rounded-xl border border-[#D85C83]/30 bg-white text-xs font-mono uppercase text-[#30252A] focus:outline-none focus:border-[#BE3D69]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#30252A]">
                        Sender Mobile Number
                      </label>
                      <input
                        type="tel"
                        value={senderPhone}
                        onChange={(e) => setSenderPhone(e.target.value)}
                        placeholder="e.g. 017XXXXXXXX"
                        className="w-full px-3 py-2 rounded-xl border border-[#D85C83]/30 bg-white text-xs text-[#30252A] focus:outline-none focus:border-[#BE3D69]"
                      />
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>

          {/* Right: Order Summary Sidebar */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-3xl bg-white border border-[#FCE8EE] shadow-luxury space-y-5 sticky top-28">
              <h3 className="font-serif text-lg font-bold text-[#30252A] border-b border-[#FCE8EE] pb-3">
                Order Review ({items.length} items)
              </h3>

              {/* Items List */}
              <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
                {items.map((item) => {
                  const imgUrl = item.variant.image_url || item.product.images[0]?.image_url || '/images/products/floral-maxi.jpg';
                  return (
                    <div key={item.variant.id} className="flex items-center gap-3 text-xs">
                      <div className="relative w-12 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-[#FCE8EE]">
                        <Image src={imgUrl} alt={item.product.title} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-[#30252A] truncate">{item.product.title}</h4>
                        <span className="text-[10px] text-[#796B70]">Qty: {item.quantity}</span>
                      </div>
                      <span className="font-bold text-[#30252A]">
                        {formatBDT(item.unit_price * item.quantity)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2.5 pt-3 border-t border-[#FCE8EE] text-xs">
                <div className="flex items-center justify-between text-[#796B70]">
                  <span>Subtotal</span>
                  <span className="font-bold text-[#30252A] text-sm">{formatBDT(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-[#796B70]">
                  <span>Shipping Fee ({division})</span>
                  <span className="font-semibold text-[#30252A]">
                    {shippingCharge === 0 ? <strong className="text-emerald-700">FREE</strong> : formatBDT(shippingCharge)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#796B70]">
                  <span>Discount</span>
                  <span className="font-semibold text-[#30252A]">৳ 0</span>
                </div>
              </div>

              {/* Total Payable */}
              <div className="pt-3 border-t border-[#FCE8EE] flex items-center justify-between text-base font-bold text-[#30252A]">
                <span>Total Payable</span>
                <span className="text-2xl font-bold text-[#BE3D69]">{formatBDT(finalPayable)}</span>
              </div>

              {/* Submit Order Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-full bg-[#BE3D69] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#D85C83] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#BE3D69]/25 hover:shadow-xl disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Processing Order...</span>
                ) : (
                  <>
                    <span>Confirm & Place Order</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="space-y-2 pt-2 text-[11px] text-[#796B70]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>100% Secure Checkout with Crown &amp; Chic</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#BE3D69] shrink-0" />
                  <span>Doorstep delivery with rider cash collection</span>
                </div>
              </div>

            </div>
          </div>

        </form>

      </div>
    </div>
  );
}
