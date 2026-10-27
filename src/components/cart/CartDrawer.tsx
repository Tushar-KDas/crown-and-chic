'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatBDT } from '@/lib/utils';

export function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, totalItems, subtotal } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          
          {/* Drawer Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#FCE8EE] bg-[#FFFDF8]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#BE3D69]" />
              <h2 className="text-lg font-serif font-bold text-[#30252A]">
                Your Cart ({totalItems})
              </h2>
            </div>
            <button 
              onClick={closeCart}
              className="p-1 rounded-full text-[#796B70] hover:text-[#BE3D69] hover:bg-[#FCE8EE] transition-colors"
              aria-label="Close cart drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#FCE8EE] flex items-center justify-center text-[#BE3D69]">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-[#30252A]">Your cart is empty</h3>
                <p className="text-xs text-[#796B70] max-w-xs mx-auto">
                  Explore our luxury fashion collections and discover your next signature outfit.
                </p>
                <button 
                  onClick={closeCart}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#BE3D69] text-white text-xs font-semibold hover:bg-[#D85C83] transition-all shadow-sm"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              items.map((item) => {
                const imgUrl = item.variant.image_url || item.product.images[0]?.image_url || '/images/products/floral-maxi.jpg';
                
                const variantDetails = Object.entries(item.variant.attributes)
                  .map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}`)
                  .join(' | ');

                return (
                  <div 
                    key={item.variant.id} 
                    className="flex gap-4 p-3 rounded-xl border border-[#FCE8EE] bg-[#FFFDF8] hover:border-[#D85C83]/30 transition-all"
                  >
                    {/* Thumbnail */}
                    <div className="relative w-20 h-24 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      <Image 
                        src={imgUrl} 
                        alt={item.product.title} 
                        fill 
                        className="object-cover"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-[#30252A] line-clamp-1">
                          {item.product.title}
                        </h4>
                        {variantDetails && (
                          <p className="text-xs text-[#796B70] mt-0.5">
                            {variantDetails}
                          </p>
                        )}
                        <p className="text-sm font-bold text-[#BE3D69] mt-1">
                          {formatBDT(item.unit_price)}
                        </p>
                      </div>

                      {/* Quantity stepper & remove */}
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#FCE8EE]">
                        <div className="flex items-center border border-[#D85C83]/30 rounded-md bg-white">
                          <button 
                            onClick={() => updateQuantity(item.variant.id, item.quantity - 1)}
                            className="p-1 hover:bg-[#FCE8EE] text-[#30252A] rounded-l-md transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-xs font-semibold text-[#30252A]">
                            {item.quantity}
                          </span>
                          <button 
                            onClick={() => updateQuantity(item.variant.id, item.quantity + 1)}
                            className="p-1 hover:bg-[#FCE8EE] text-[#30252A] rounded-r-md transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button 
                          onClick={() => removeItem(item.variant.id)}
                          className="p-1 text-[#796B70] hover:text-[#BE3D69] transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Checkout Buttons */}
          {items.length > 0 && (
            <div className="border-t border-[#FCE8EE] p-6 bg-[#FFFDF8] space-y-4">
              <div className="flex items-center justify-between text-base font-semibold text-[#30252A]">
                <span>Subtotal</span>
                <span className="text-lg font-bold text-[#BE3D69]">{formatBDT(subtotal)}</span>
              </div>
              <p className="text-[11px] text-[#796B70]">
                Shipping charges calculated at checkout (Free shipping over ৳ 2,500).
              </p>

              <div className="space-y-2">
                <Link 
                  href="/cart"
                  onClick={closeCart}
                  className="w-full py-2.5 rounded-full border border-[#BE3D69] text-[#BE3D69] text-xs font-semibold hover:bg-[#FCE8EE] transition-all flex items-center justify-center"
                >
                  View Cart
                </Link>
                <Link 
                  href="/checkout"
                  onClick={closeCart}
                  className="w-full py-3 rounded-full bg-[#BE3D69] text-white text-sm font-semibold hover:bg-[#D85C83] transition-all flex items-center justify-center gap-2 shadow-md shadow-[#BE3D69]/20"
                >
                  <span>Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
