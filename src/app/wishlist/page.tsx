'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, ArrowRight } from 'lucide-react';

export default function WishlistPage() {
  return (
    <div className="py-12 md:py-16 bg-[#FFFDF8]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="border-b border-[#FCE8EE] pb-4">
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#30252A]">
            My Wishlist
          </h1>
          <p className="text-xs text-[#796B70] mt-1">
            Curate your dream boutique wardrobe
          </p>
        </div>

        <div className="p-12 text-center bg-white rounded-3xl border border-[#FCE8EE] shadow-sm space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#FCE8EE] flex items-center justify-center text-[#BE3D69]">
            <Heart className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-xl font-bold text-[#30252A]">Your wishlist is currently empty</h2>
          <p className="text-xs text-[#796B70] max-w-sm mx-auto">
            Click the heart icon on any salwar kameez, kurti, or bag to save it here for later.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-[#BE3D69] text-white text-xs font-semibold hover:bg-[#D85C83]"
          >
            <span>Explore Collections</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
