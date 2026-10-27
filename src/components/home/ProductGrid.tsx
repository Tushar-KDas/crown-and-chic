'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Crown, ArrowRight } from 'lucide-react';
import { Product } from '@/types';
import { ProductCard } from '@/components/product/ProductCard';

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'new' | 'bestsellers' | 'sale'>('all');

  const filteredProducts = products.filter(p => {
    if (activeTab === 'new') return p.is_new_arrival;
    if (activeTab === 'bestsellers') return p.is_bestseller;
    if (activeTab === 'sale') return p.is_on_sale;
    return true;
  });

  return (
    <section className="py-12 md:py-16 bg-[#FFFDF8] border-t border-[#FCE8EE]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="flex items-center justify-center gap-2 text-[#C49A52]">
            <Crown className="w-5 h-5 fill-current" />
          </div>
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#30252A] tracking-tight flex items-center justify-center gap-3">
            <span className="w-12 h-px bg-[#D85C83]/30 hidden sm:inline-block" />
            Latest Products
            <span className="w-12 h-px bg-[#D85C83]/30 hidden sm:inline-block" />
          </h2>
          <p className="text-xs text-[#796B70]">
            Fresh arrivals tailored with royal craftsmanship and supreme elegance
          </p>
        </div>

        {/* Collection Filter Tabs */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-8 overflow-x-auto pb-2">
          {[
            { id: 'all', label: 'All Products' },
            { id: 'new', label: 'New Arrivals' },
            { id: 'bestsellers', label: 'Best Sellers' },
            { id: 'sale', label: 'Special Offers' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-5 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#BE3D69] text-white shadow-sm'
                  : 'bg-white text-[#796B70] border border-[#FCE8EE] hover:text-[#BE3D69]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full border border-[#BE3D69] text-[#BE3D69] text-xs font-semibold hover:bg-[#BE3D69] hover:text-white transition-all shadow-xs"
          >
            <span>View All Collections</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}
