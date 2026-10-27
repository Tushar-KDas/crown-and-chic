'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Crown } from 'lucide-react';
import { Category } from '@/types';

interface CategorySectionProps {
  categories: Category[];
}

export function CategorySection({ categories }: CategorySectionProps) {
  return (
    <section className="py-12 md:py-16 bg-[#FFFDF8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center space-y-2 mb-10">
          <div className="flex items-center justify-center gap-2 text-[#C49A52]">
            <Crown className="w-5 h-5 fill-current" />
          </div>
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#30252A] tracking-tight flex items-center justify-center gap-3">
            <span className="w-12 h-px bg-[#D85C83]/30 hidden sm:inline-block" />
            Shop by Category
            <span className="w-12 h-px bg-[#D85C83]/30 hidden sm:inline-block" />
          </h2>
          <p className="text-xs text-[#796B70]">
            Explore curated collections crafted for every occasion
          </p>
        </div>

        {/* Circular Category Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 md:gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="group flex flex-col items-center text-center space-y-3"
            >
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-[#FCE8EE] p-1 border-2 border-transparent group-hover:border-[#BE3D69] transition-all duration-300 shadow-sm group-hover:shadow-md group-hover:-translate-y-1">
                <div className="relative w-full h-full rounded-full overflow-hidden">
                  <Image
                    src={category.image_url || '/images/categories/womens-fashion.jpg'}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
              </div>

              <div className="space-y-0.5">
                <h3 className="text-xs md:text-sm font-semibold text-[#30252A] group-hover:text-[#BE3D69] transition-colors line-clamp-1">
                  {category.name}
                </h3>
                {category.product_count !== undefined && (
                  <p className="text-[10px] text-[#796B70]">
                    {category.product_count} Items
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
