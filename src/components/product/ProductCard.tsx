'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, ShoppingCart, Heart, Eye } from 'lucide-react';
import { Product } from '@/types';
import { formatBDT } from '@/lib/utils';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0] || null);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Price calculations
  const displaySalePrice = selectedVariant?.sale_price !== null && selectedVariant?.sale_price !== undefined
    ? selectedVariant.sale_price
    : product.base_sale_price;

  const displayRegularPrice = selectedVariant?.regular_price || product.base_price;

  const hasDiscount = displaySalePrice !== null && displaySalePrice !== undefined && displaySalePrice < displayRegularPrice;
  const discountPercent = hasDiscount 
    ? Math.round(((displayRegularPrice - displaySalePrice!) / displayRegularPrice) * 100)
    : 0;

  const imageUrl = selectedVariant?.image_url || product.images[0]?.image_url || '/images/products/salwar-kameez.jpg';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (selectedVariant) {
      addItem(product, selectedVariant, 1);
    }
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-[#FCE8EE] overflow-hidden hover:border-[#D85C83]/40 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
      
      {/* Top Image & Badges */}
      <div className="relative aspect-4/5 w-full overflow-hidden bg-gray-50">
        <Link href={`/products/${product.slug}`} className="block w-full h-full">
          <Image
            src={imageUrl}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
        </Link>

        {/* Discount Badge */}
        {hasDiscount && (
          <span className="absolute top-3 right-3 bg-[#BE3D69] text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow-sm">
            -{discountPercent}%
          </span>
        )}

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            setIsWishlisted(prev => !prev);
          }}
          className={`absolute top-3 left-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center transition-all shadow-sm ${
            isWishlisted ? 'text-[#BE3D69] fill-[#BE3D69]' : 'text-[#796B70] hover:text-[#BE3D69]'
          }`}
          aria-label="Save to wishlist"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Quick View Button overlay */}
        <Link
          href={`/products/${product.slug}`}
          className="absolute inset-x-4 bottom-3 py-2 rounded-full bg-white/95 text-[#30252A] text-xs font-semibold flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-md hover:text-[#BE3D69]"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Quick View</span>
        </Link>
      </div>

      {/* Product Content Details */}
      <div className="p-4 flex flex-col flex-1 justify-between space-y-3">
        <div className="space-y-1.5">
          <Link href={`/products/${product.slug}`}>
            <h3 className="text-sm font-semibold text-[#30252A] group-hover:text-[#BE3D69] transition-colors line-clamp-1">
              {product.title}
            </h3>
          </Link>

          {/* Pricing */}
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-[#BE3D69]">
              {formatBDT(displaySalePrice ?? displayRegularPrice)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-[#796B70] line-through">
                {formatBDT(displayRegularPrice)}
              </span>
            )}
          </div>

          {/* Star rating and review count */}
          <div className="flex items-center gap-1.5 text-xs text-[#796B70]">
            <div className="flex items-center text-[#C49A52]">
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="font-semibold text-[#30252A]">{product.rating.toFixed(1)}</span>
            <span>({product.review_count})</span>
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          className="w-full py-2.5 rounded-full bg-[#BE3D69] text-white text-xs font-semibold hover:bg-[#D85C83] transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>Add to Cart</span>
        </button>
      </div>

    </div>
  );
}
