'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, ProductVariant } from '@/types';

export interface CartItemType {
  id: string;
  product: Product;
  variant: ProductVariant;
  quantity: number;
  unit_price: number;
}

interface CartContextType {
  items: CartItemType[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (product: Product, variant: ProductVariant, quantity?: number) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItemType[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart from localStorage on client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cq_cart');
      if (saved) {
        const parsed: CartItemType[] = JSON.parse(saved);
        // Filter out legacy mock cart items if any exist from older sessions
        const realItems = parsed.filter(i => !i.id?.startsWith('mock-cart'));
        setItems(realItems);
      } else {
        setItems([]);
      }
    } catch {
      setItems([]);
    }
    setIsInitialized(true);
  }, []);

  // Save cart to localStorage on changes
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem('cq_cart', JSON.stringify(items));
      } catch {
        // Storage fail
      }
    }
  }, [items, isInitialized]);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);
  const toggleCart = () => setIsOpen(prev => !prev);

  const addItem = (product: Product, variant: ProductVariant, quantity = 1) => {
    setItems(prev => {
      const existingIdx = prev.findIndex(item => item.variant.id === variant.id);
      const unitPrice = variant.sale_price !== null && variant.sale_price !== undefined 
        ? variant.sale_price 
        : variant.regular_price;

      if (existingIdx !== -1) {
        const updated = [...prev];
        const newQty = updated[existingIdx].quantity + quantity;
        updated[existingIdx].quantity = Math.min(newQty, variant.stock_quantity);
        return updated;
      } else {
        const newItem: CartItemType = {
          id: `cart-${Date.now()}-${variant.id}`,
          product,
          variant,
          quantity: Math.min(quantity, variant.stock_quantity),
          unit_price: unitPrice
        };
        return [...prev, newItem];
      }
    });
    setIsOpen(true);
  };

  const updateQuantity = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(variantId);
      return;
    }
    setItems(prev => 
      prev.map(item => {
        if (item.variant.id === variantId) {
          const validQty = Math.min(quantity, item.variant.stock_quantity);
          return { ...item, quantity: validQty };
        }
        return item;
      })
    );
  };

  const removeItem = (variantId: string) => {
    setItems(prev => prev.filter(item => item.variant.id !== variantId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        openCart,
        closeCart,
        toggleCart,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        totalItems,
        subtotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
