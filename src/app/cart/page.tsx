'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatBDT } from '@/lib/utils';

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, totalItems, subtotal } = useCart();
  const freeShippingThreshold = 2500;
  const progressToFreeShipping = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const remainingForFree = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <div className="py-8 md:py-12 bg-[#FFFDF8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="border-b border-[#FCE8EE] pb-4">
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#30252A]">
            Shopping Cart ({totalItems} items)
          </h1>
          <p className="text-xs text-[#796B70] mt-1">
            Review your selected designer dresses, kurtis, and luxury accessories
          </p>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-[#FCE8EE] shadow-sm space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#FCE8EE] flex items-center justify-center text-[#BE3D69]">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-serif font-bold text-[#30252A]">Your shopping cart is empty</h2>
            <p className="text-xs text-[#796B70] max-w-sm mx-auto">
              Add our royal salwar kameez, floral dresses, or handbags to proceed with checkout.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-[#BE3D69] text-white text-xs font-semibold hover:bg-[#D85C83]"
            >
              <span>Explore Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left: Items Table */}
            <div className="lg:col-span-8 space-y-4">
              
              {/* Free shipping progress bar */}
              <div className="p-4 rounded-2xl bg-[#FCE8EE]/60 border border-[#D85C83]/20 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-[#30252A]">
                  <span>
                    {remainingForFree === 0 
                      ? '🎉 You have unlocked Free Shipping nationwide!' 
                      : `Add ${formatBDT(remainingForFree)} more to get Free Shipping!`}
                  </span>
                  <span>{progressToFreeShipping}%</span>
                </div>
                <div className="w-full h-2 bg-white rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#BE3D69] transition-all duration-500 rounded-full"
                    style={{ width: `${progressToFreeShipping}%` }}
                  />
                </div>
              </div>

              {/* Items Card */}
              <div className="bg-white rounded-3xl border border-[#FCE8EE] shadow-luxury divide-y divide-[#FCE8EE] overflow-hidden">
                {items.map((item) => {
                  const imgUrl = item.variant.image_url || item.product.images[0]?.image_url || '/images/products/floral-maxi.jpg';
                  const variantText = Object.entries(item.variant.attributes)
                    .map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}`)
                    .join(' | ');

                  return (
                    <div key={item.variant.id} className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      
                      <div className="flex items-center gap-4">
                        <div className="relative w-20 h-24 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-[#FCE8EE]">
                          <Image
                            src={imgUrl}
                            alt={item.product.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="space-y-1">
                          <Link href={`/products/${item.product.slug}`} className="font-serif text-sm sm:text-base font-bold text-[#30252A] hover:text-[#BE3D69]">
                            {item.product.title}
                          </Link>
                          {variantText && (
                            <p className="text-xs text-[#796B70]">
                              {variantText}
                            </p>
                          )}
                          <p className="text-xs text-[#796B70]">
                            SKU: {item.variant.sku}
                          </p>
                          <p className="text-sm font-bold text-[#BE3D69] sm:hidden pt-1">
                            {formatBDT(item.unit_price)}
                          </p>
                        </div>
                      </div>

                      {/* Quantity & Price */}
                      <div className="flex items-center justify-between w-full sm:w-auto sm:gap-8">
                        <div className="hidden sm:block text-right">
                          <span className="text-xs text-[#796B70] block">Price</span>
                          <span className="text-sm font-bold text-[#BE3D69]">
                            {formatBDT(item.unit_price)}
                          </span>
                        </div>

                        {/* Stepper */}
                        <div className="flex items-center border border-[#D85C83]/30 rounded-xl bg-white shadow-xs">
                          <button
                            onClick={() => updateQuantity(item.variant.id, item.quantity - 1)}
                            className="p-2 text-[#30252A] hover:bg-[#FCE8EE] rounded-l-xl transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-10 text-center font-bold text-xs text-[#30252A]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.variant.id, item.quantity + 1)}
                            className="p-2 text-[#30252A] hover:bg-[#FCE8EE] rounded-r-xl transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-right">
                          <span className="text-xs text-[#796B70] block sm:hidden">Total</span>
                          <span className="text-base font-bold text-[#30252A]">
                            {formatBDT(item.unit_price * item.quantity)}
                          </span>
                        </div>

                        <button
                          onClick={() => removeItem(item.variant.id)}
                          className="p-2 text-[#796B70] hover:text-[#BE3D69] hover:bg-[#FCE8EE] rounded-lg transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={clearCart}
                  className="text-xs text-[#796B70] hover:text-[#BE3D69] underline"
                >
                  Clear Entire Cart
                </button>
                <Link
                  href="/products"
                  className="text-xs font-semibold text-[#BE3D69] hover:underline"
                >
                  ← Continue Shopping
                </Link>
              </div>

            </div>

            {/* Right: Order Summary */}
            <div className="lg:col-span-4 space-y-6">
              <div className="p-6 rounded-3xl bg-white border border-[#FCE8EE] shadow-luxury space-y-5">
                <h3 className="font-serif text-lg font-bold text-[#30252A] border-b border-[#FCE8EE] pb-3">
                  Order Summary
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between text-[#796B70]">
                    <span>Items Subtotal</span>
                    <span className="font-bold text-[#30252A] text-sm">{formatBDT(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#796B70]">
                    <span>Estimated Shipping</span>
                    <span className="font-semibold text-[#30252A]">
                      {subtotal >= freeShippingThreshold ? 'FREE' : '৳ 60 - ৳ 120'}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#FCE8EE] flex items-center justify-between text-base font-bold text-[#30252A]">
                  <span>Estimated Total</span>
                  <span className="text-xl text-[#BE3D69]">{formatBDT(subtotal)}</span>
                </div>

                <Link
                  href="/checkout"
                  className="w-full py-3.5 rounded-full bg-[#BE3D69] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#D85C83] transition-all flex items-center justify-center gap-2 shadow-md shadow-[#BE3D69]/20"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <div className="flex items-center justify-center gap-2 text-[11px] text-[#796B70] pt-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Cash on Delivery & Verified MFS Available</span>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
