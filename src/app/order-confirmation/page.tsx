import Link from 'next/link';
import { store } from '@/lib/db/store';
import { CheckCircle2, PackageCheck, Truck, ArrowRight, Printer } from 'lucide-react';
import { formatBDT } from '@/lib/utils';

interface OrderConfirmationProps {
  searchParams: Promise<{ orderNumber?: string }>;
}

export default async function OrderConfirmationPage({ searchParams }: OrderConfirmationProps) {
  const { orderNumber } = await searchParams;
  const order = orderNumber ? store.getOrderByNumber(orderNumber) : undefined;

  return (
    <div className="py-12 md:py-16 bg-[#FFFDF8]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bg-white rounded-3xl border border-[#FCE8EE] p-8 md:p-12 shadow-luxury text-center space-y-6">
          
          {/* Success Icon */}
          <div className="w-20 h-20 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border-4 border-emerald-100 shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold text-[#BE3D69] uppercase tracking-wider">
              Order Confirmed
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#30252A]">
              Thank You! Your Order Has Been Received
            </h1>
            <p className="text-xs text-[#796B70] max-w-md mx-auto">
              Our packaging team has received your order and is preparing your royal fashion parcel for dispatch.
            </p>
          </div>

          {/* Order Details Card */}
          {order ? (
            <div className="p-6 rounded-2xl bg-[#FFFDF8] border border-[#FCE8EE] text-left space-y-4">
              <div className="flex flex-wrap items-center justify-between border-b border-[#FCE8EE] pb-4 gap-2">
                <div>
                  <span className="text-[11px] text-[#796B70] block">Public Order Number</span>
                  <span className="font-mono font-bold text-base text-[#BE3D69]">
                    {order.order_number}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-[#796B70] block">Payment Method</span>
                  <span className="font-bold text-xs uppercase text-[#30252A]">
                    {order.payment_method === 'cod' ? 'Cash On Delivery' : order.payment_method.toUpperCase()}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-[#796B70] block">Payment Status</span>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    order.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {order.payment_status === 'paid' ? 'Paid' : 'Pending Verification'}
                  </span>
                </div>
              </div>

              {/* Delivery recipient */}
              <div className="text-xs space-y-1">
                <span className="font-bold text-[#30252A] block">Delivery Details:</span>
                <p className="text-[#796B70]">
                  Recipient: <strong>{order.customer_name}</strong> ({order.customer_phone})
                </p>
                <p className="text-[#796B70]">
                  Address: {order.full_address}, {order.thana}, {order.district}, {order.division}
                </p>
              </div>

              {/* Items Summary */}
              <div className="pt-3 border-t border-[#FCE8EE] space-y-2">
                <span className="font-bold text-xs text-[#30252A] block">Ordered Items:</span>
                <div className="space-y-1.5 divide-y divide-[#FCE8EE]">
                  {order.items.map(item => (
                    <div key={item.id} className="pt-1.5 flex items-center justify-between text-xs">
                      <span className="text-[#30252A]">{item.product_title} &times; {item.quantity}</span>
                      <span className="font-bold text-[#BE3D69]">{formatBDT(item.total_price)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Row */}
              <div className="pt-3 border-t border-[#FCE8EE] flex items-center justify-between text-sm font-bold text-[#30252A]">
                <span>Total Amount:</span>
                <span className="text-lg text-[#BE3D69]">{formatBDT(order.total_amount)}</span>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-amber-50 text-amber-800 text-xs">
              Order #{orderNumber || 'CNC-XXXX'} has been recorded in our dispatch system.
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href={`/track-order?orderNumber=${encodeURIComponent(orderNumber || '')}`}
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#BE3D69] text-white text-xs font-semibold hover:bg-[#D85C83] transition-all flex items-center justify-center gap-2"
            >
              <Truck className="w-4 h-4" />
              <span>Track Your Order</span>
            </Link>

            <Link
              href="/products"
              className="w-full sm:w-auto px-6 py-3 rounded-full border border-[#BE3D69] text-[#BE3D69] text-xs font-semibold hover:bg-[#FCE8EE] transition-all flex items-center justify-center gap-2"
            >
              <span>Continue Shopping</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
