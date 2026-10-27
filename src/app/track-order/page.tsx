'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, CheckCircle2, AlertCircle } from 'lucide-react';
import { Order, OrderStatus } from '@/types';
import { formatBDT } from '@/lib/utils';

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialOrderNumber = searchParams.get('orderNumber') || '';

  const [orderNumberInput, setOrderNumberInput] = useState(initialOrderNumber);
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchOrder = async (orderNum: string) => {
    if (!orderNum.trim()) return;
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/orders?orderNumber=${encodeURIComponent(orderNum.trim())}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'No order found with that Order Number.');
        setOrder(null);
      } else {
        setOrder(data.order);
      }
    } catch {
      setError('Unable to reach server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderNumber) {
      fetchOrder(initialOrderNumber);
    }
  }, [initialOrderNumber]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(orderNumberInput);
  };

  const steps: { status: OrderStatus; label: string }[] = [
    { status: 'pending_confirmation', label: 'Order Placed' },
    { status: 'confirmed', label: 'Confirmed' },
    { status: 'processing', label: 'Processing' },
    { status: 'shipped', label: 'Shipped' },
    { status: 'delivered', label: 'Delivered' }
  ];

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'pending_confirmation': return 0;
      case 'confirmed': return 1;
      case 'processing': return 2;
      case 'shipped':
      case 'out_for_delivery': return 3;
      case 'delivered': return 4;
      default: return 0;
    }
  };

  const currentStep = order ? getStepIndex(order.order_status) : 0;

  return (
    <div className="py-12 md:py-16 bg-[#FFFDF8]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="font-serif text-3xl font-bold text-[#30252A]">
            Track Your Order
          </h1>
          <p className="text-xs text-[#796B70]">
            Enter your Order Number to check live packaging, courier dispatch, and delivery status
          </p>
        </div>

        {/* Search Card */}
        <div className="p-6 rounded-3xl bg-white border border-[#FCE8EE] shadow-luxury max-w-xl mx-auto">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#30252A]">
                Order Number
              </label>
              <input
                type="text"
                required
                value={orderNumberInput}
                onChange={(e) => setOrderNumberInput(e.target.value)}
                placeholder="e.g. CNC-20261026-1024"
                className="w-full px-4 py-2.5 rounded-xl border border-[#D85C83]/30 bg-white font-mono uppercase text-xs text-[#30252A] focus:outline-none focus:border-[#BE3D69]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-full bg-[#BE3D69] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#D85C83] transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
              <span>{isLoading ? 'Searching...' : 'Track Parcel'}</span>
            </button>
          </form>

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Order Tracking Timeline & Details */}
        {order && (
          <div className="p-6 md:p-8 rounded-3xl bg-white border border-[#FCE8EE] shadow-luxury space-y-8 animate-in fade-in duration-300">
            
            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between border-b border-[#FCE8EE] pb-4 gap-4">
              <div>
                <span className="text-xs text-[#796B70] block">Order Reference</span>
                <span className="font-mono text-lg font-bold text-[#BE3D69]">
                  {order.order_number}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  order.order_status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                  order.order_status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-[#FCE8EE] text-[#BE3D69]'
                }`}>
                  {order.order_status.replace(/_/g, ' ')}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  order.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  Payment: {order.payment_status}
                </span>
              </div>
            </div>

            {/* Stepper Timeline */}
            <div className="py-4">
              <div className="flex items-center justify-between relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-[#FCE8EE] -z-0" />
                <div 
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#BE3D69] -z-0 transition-all duration-700"
                  style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                />

                {steps.map((st, idx) => {
                  const isCompleted = idx <= currentStep;
                  return (
                    <div key={st.status} className="flex flex-col items-center gap-2 bg-white px-2 z-10">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isCompleted ? 'bg-[#BE3D69] text-white shadow-sm' : 'bg-gray-100 text-gray-400 border border-gray-200'
                      }`}>
                        {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                      </div>
                      <span className={`text-[11px] font-semibold text-center whitespace-nowrap ${
                        isCompleted ? 'text-[#BE3D69]' : 'text-gray-400'
                      }`}>
                        {st.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#FCE8EE] text-xs">
              <div className="space-y-2">
                <h4 className="font-bold text-[#30252A] uppercase tracking-wide">
                  Recipient Information
                </h4>
                <p className="text-[#796B70]">Name: <strong className="text-[#30252A]">{order.customer_name}</strong></p>
                <p className="text-[#796B70]">Phone: <strong className="text-[#30252A]">{order.customer_phone}</strong></p>
                <p className="text-[#796B70]">Delivery Address: {order.full_address}, {order.thana}, {order.district}</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-[#30252A] uppercase tracking-wide">
                  Ordered Products
                </h4>
                <div className="space-y-1">
                  {order.items.map(item => (
                    <div key={item.id} className="flex justify-between py-1 border-b border-[#FCE8EE]">
                      <span>{item.product_title} ({item.variant_title}) &times; {item.quantity}</span>
                      <span className="font-bold text-[#BE3D69]">{formatBDT(item.total_price)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2 font-bold text-sm text-[#30252A]">
                    <span>Total Amount</span>
                    <span className="text-[#BE3D69]">{formatBDT(order.total_amount)}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs text-[#796B70]">Loading order tracking...</div>}>
      <TrackOrderContent />
    </Suspense>
  );
}
