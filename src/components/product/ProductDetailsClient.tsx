'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  Star, 
  ShoppingCart, 
  Zap, 
  Heart, 
  Share2, 
  Truck, 
  RotateCcw, 
  ShieldCheck, 
  Ruler, 
  Check, 
  Minus, 
  Plus 
} from 'lucide-react';
import { Product, ProductVariant } from '@/types';
import { formatBDT } from '@/lib/utils';
import { useCart } from '@/context/CartContext';

interface ProductDetailsClientProps {
  product: Product;
  relatedProducts: Product[];
}

export function ProductDetailsClient({ product, relatedProducts }: ProductDetailsClientProps) {
  const router = useRouter();
  const { addItem } = useCart();

  // Active variant state
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    product.variants[0] || null
  );

  // Active gallery image
  const [selectedImage, setSelectedImage] = useState<string>(
    selectedVariant?.image_url || product.images[0]?.image_url || '/images/products/salwar-kameez.jpg'
  );

  const [quantity, setQuantity] = useState(1);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews' | 'delivery'>('desc');

  // Extract unique sizes and colors across variants
  const availableSizes = Array.from(
    new Set(product.variants.map(v => v.attributes.size).filter(Boolean))
  ) as string[];

  const availableColors = Array.from(
    new Set(product.variants.map(v => v.attributes.color).filter(Boolean))
  ) as string[];

  const handleSelectSize = (size: string) => {
    const match = product.variants.find(
      v => v.attributes.size === size && (selectedVariant?.attributes.color ? v.attributes.color === selectedVariant.attributes.color : true)
    ) || product.variants.find(v => v.attributes.size === size);

    if (match) {
      setSelectedVariant(match);
      if (match.image_url) setSelectedImage(match.image_url);
      setQuantity(1);
    }
  };

  const handleSelectColor = (color: string) => {
    const match = product.variants.find(
      v => v.attributes.color === color && (selectedVariant?.attributes.size ? v.attributes.size === selectedVariant.attributes.size : true)
    ) || product.variants.find(v => v.attributes.color === color);

    if (match) {
      setSelectedVariant(match);
      if (match.image_url) setSelectedImage(match.image_url);
      setQuantity(1);
    }
  };

  // Prices
  const unitPrice = selectedVariant?.sale_price !== null && selectedVariant?.sale_price !== undefined
    ? selectedVariant.sale_price
    : (selectedVariant?.regular_price || product.base_price);

  const regularPrice = selectedVariant?.regular_price || product.base_price;
  const hasDiscount = unitPrice < regularPrice;
  const isOutOfStock = !selectedVariant || selectedVariant.stock_quantity <= 0;

  const handleAddToCart = () => {
    if (selectedVariant && !isOutOfStock) {
      addItem(product, selectedVariant, quantity);
    }
  };

  const handleBuyNow = () => {
    if (selectedVariant && !isOutOfStock) {
      addItem(product, selectedVariant, quantity);
      router.push('/checkout');
    }
  };

  return (
    <div className="py-8 md:py-12 bg-[#FFFDF8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          
          {/* Left: Gallery */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-4/5 w-full rounded-3xl overflow-hidden bg-gray-50 border border-[#FCE8EE] shadow-luxury">
              <Image
                src={selectedImage}
                alt={product.title}
                fill
                className="object-cover"
                priority
              />
              {hasDiscount && (
                <span className="absolute top-4 right-4 bg-[#BE3D69] text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                  SALE {Math.round(((regularPrice - unitPrice) / regularPrice) * 100)}% OFF
                </span>
              )}
            </div>

            {/* Thumbnail Carousel */}
            {product.images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {product.images.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(img.image_url)}
                    className={`relative w-20 h-24 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      selectedImage === img.image_url ? 'border-[#BE3D69] shadow-md scale-102' : 'border-[#FCE8EE] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={img.image_url}
                      alt={img.alt_text || product.title}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Details & Variant Selection */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Title & SKU */}
            <div className="space-y-2 border-b border-[#FCE8EE] pb-4">
              <span className="text-xs font-semibold text-[#BE3D69] uppercase tracking-wider">
                {product.categories[0]?.name || 'Fashion Collection'}
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#30252A] leading-snug">
                {product.title}
              </h1>

              <div className="flex items-center justify-between text-xs text-[#796B70] pt-1">
                <div className="flex items-center gap-2">
                  <div className="flex items-center text-[#C49A52]">
                    <Star className="w-4 h-4 fill-current" />
                  </div>
                  <span className="font-bold text-[#30252A]">{product.rating.toFixed(1)}</span>
                  <span>({product.review_count} verified reviews)</span>
                </div>
                <span>SKU: <strong className="text-[#30252A]">{selectedVariant?.sku || product.sku}</strong></span>
              </div>
            </div>

            {/* Price section */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-[#BE3D69]">
                {formatBDT(unitPrice)}
              </span>
              {hasDiscount && (
                <span className="text-lg text-[#796B70] line-through">
                  {formatBDT(regularPrice)}
                </span>
              )}
            </div>

            {/* Stock status indicator */}
            <div>
              {isOutOfStock ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                  Out of Stock
                </span>
              ) : selectedVariant.stock_quantity <= selectedVariant.low_stock_threshold ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                  Only {selectedVariant.stock_quantity} left in stock — order soon
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <Check className="w-3.5 h-3.5" />
                  In Stock ({selectedVariant.stock_quantity} available)
                </span>
              )}
            </div>

            {/* Variant Selector: Size */}
            {availableSizes.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#30252A]">
                    Select Size
                  </label>
                  <button
                    onClick={() => setShowSizeGuide(true)}
                    className="flex items-center gap-1 text-xs font-semibold text-[#BE3D69] hover:underline"
                  >
                    <Ruler className="w-3.5 h-3.5" />
                    <span>Size Guide</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {availableSizes.map(size => {
                    const isSelected = selectedVariant?.attributes.size === size;
                    return (
                      <button
                        key={size}
                        onClick={() => handleSelectSize(size)}
                        className={`min-w-12 h-10 px-3 rounded-lg text-xs font-bold border transition-all ${
                          isSelected
                            ? 'border-[#BE3D69] bg-[#BE3D69] text-white shadow-sm'
                            : 'border-[#FCE8EE] bg-white text-[#30252A] hover:border-[#BE3D69]'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Variant Selector: Color */}
            {availableColors.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#30252A]">
                  Select Color: <span className="font-normal text-[#796B70]">{selectedVariant?.attributes.color}</span>
                </label>
                <div className="flex items-center gap-2">
                  {availableColors.map(color => {
                    const isSelected = selectedVariant?.attributes.color === color;
                    return (
                      <button
                        key={color}
                        onClick={() => handleSelectColor(color)}
                        className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${
                          isSelected
                            ? 'border-[#BE3D69] bg-[#FCE8EE] text-[#BE3D69] font-bold shadow-xs'
                            : 'border-[#FCE8EE] bg-white text-[#30252A] hover:border-[#BE3D69]'
                        }`}
                      >
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Stepper */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#30252A]">
                Quantity
              </label>
              <div className="flex items-center w-32 border border-[#D85C83]/30 rounded-xl bg-white shadow-xs">
                <button
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  disabled={quantity <= 1}
                  className="p-2.5 text-[#30252A] hover:bg-[#FCE8EE] disabled:opacity-40 rounded-l-xl transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="flex-1 text-center font-bold text-sm text-[#30252A]">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(prev => Math.min(selectedVariant.stock_quantity, prev + 1))}
                  disabled={quantity >= selectedVariant.stock_quantity}
                  className="p-2.5 text-[#30252A] hover:bg-[#FCE8EE] disabled:opacity-40 rounded-r-xl transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons: Add to Cart & Buy Now */}
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className="w-full py-3.5 rounded-full border-2 border-[#BE3D69] text-[#BE3D69] hover:bg-[#FCE8EE] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className="w-full py-3.5 rounded-full bg-[#BE3D69] text-white hover:bg-[#D85C83] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md shadow-[#BE3D69]/25 hover:shadow-lg disabled:opacity-50"
                >
                  <Zap className="w-4 h-4" />
                  <span>Buy Now</span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-6 pt-1 text-xs text-[#796B70]">
                <button
                  onClick={() => setIsWishlisted(prev => !prev)}
                  className="flex items-center gap-1.5 hover:text-[#BE3D69] transition-colors"
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-[#BE3D69] text-[#BE3D69]' : ''}`} />
                  <span>{isWishlisted ? 'Saved to Wishlist' : 'Add to Wishlist'}</span>
                </button>
                <span>&bull;</span>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href);
                    alert('Product link copied to clipboard!');
                  }}
                  className="flex items-center gap-1.5 hover:text-[#BE3D69] transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share Product</span>
                </button>
              </div>
            </div>

            {/* Delivery Info Snippet */}
            <div className="p-4 rounded-2xl bg-[#FCE8EE]/50 border border-[#D85C83]/20 space-y-2.5 text-xs">
              <div className="flex items-center gap-2.5 text-[#30252A]">
                <Truck className="w-4 h-4 text-[#BE3D69] shrink-0" />
                <span>Inside Dhaka: <strong>24-48 Hours (৳ 60)</strong></span>
              </div>
              <div className="flex items-center gap-2.5 text-[#30252A]">
                <Truck className="w-4 h-4 text-[#BE3D69] shrink-0" />
                <span>Outside Dhaka: <strong>3-5 Days (৳ 120)</strong></span>
              </div>
              <div className="flex items-center gap-2.5 text-[#BE3D69] font-semibold pt-1 border-t border-[#D85C83]/20">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Free delivery on orders over ৳ 2,500</span>
              </div>
            </div>

          </div>

        </div>

        {/* Detailed Tabs: Description, Specifications, Reviews, Delivery */}
        <div className="pt-8 border-t border-[#FCE8EE]">
          <div className="flex items-center gap-4 sm:gap-8 border-b border-[#FCE8EE] pb-3 overflow-x-auto text-xs sm:text-sm font-semibold">
            {[
              { id: 'desc', label: 'Product Description' },
              { id: 'specs', label: 'Fabric & Specifications' },
              { id: 'delivery', label: 'Delivery & Returns' },
              { id: 'reviews', label: `Customer Reviews (${product.review_count})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`pb-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-[#BE3D69] border-b-2 border-[#BE3D69] font-bold'
                    : 'text-[#796B70] hover:text-[#30252A]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="py-6 text-sm text-[#30252A] leading-relaxed max-w-4xl">
            {activeTab === 'desc' && (
              <div className="space-y-4">
                <p>{product.description}</p>
                <p className="text-xs text-[#796B70]">
                  Crafted under stringent quality control to ensure every seam, embroidery thread, and finish represents the pinnacle of luxury.
                </p>
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-white rounded-xl border border-[#FCE8EE]">
                  <span className="text-[#796B70] block">Fabric Material</span>
                  <span className="font-semibold text-[#30252A]">Premium Pure Georgette & Organza</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-[#FCE8EE]">
                  <span className="text-[#796B70] block">Embroidery Style</span>
                  <span className="font-semibold text-[#30252A]">Hand zardozi & micro-sequin threadwork</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-[#FCE8EE]">
                  <span className="text-[#796B70] block">Wash Care</span>
                  <span className="font-semibold text-[#30252A]">Dry clean only for lasting brilliance</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-[#FCE8EE]">
                  <span className="text-[#796B70] block">Origin</span>
                  <span className="font-semibold text-[#30252A]">Boutique Artisan Workshop, Dhaka</span>
                </div>
              </div>
            )}

            {activeTab === 'delivery' && (
              <div className="space-y-3 text-xs">
                <p><strong>Nationwide Delivery:</strong> We ship parcels all over Bangladesh via Steadfast and Pathao Courier.</p>
                <p><strong>Returns:</strong> 7-day hassle-free return policy if damaged, incorrect size, or defective upon delivery.</p>
                <p><strong>Inspection:</strong> Open parcel delivery available with rider present for COD orders.</p>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white border border-[#FCE8EE] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">Sharmin Sultana</span>
                    <div className="flex text-[#C49A52]"><Star className="w-3.5 h-3.5 fill-current" /> 5.0</div>
                  </div>
                  <p className="text-xs text-[#796B70]">
                    "Absolutely stunning dress! The color is just as shown in the pictures and the fabric feels like pure silk. Delivered to Dhanmondi within 24 hours."
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-[#FCE8EE] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">Farzana Haque</span>
                    <div className="flex text-[#C49A52]"><Star className="w-3.5 h-3.5 fill-current" /> 5.0</div>
                  </div>
                  <p className="text-xs text-[#796B70]">
                    "Crown &amp; Chic never disappoints. The fitting for Size M was immaculate. 10/10 recommendation!"
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Size Guide Modal */}
        {showSizeGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl border border-[#FCE8EE]">
              <div className="flex items-center justify-between border-b border-[#FCE8EE] pb-3">
                <h3 className="font-serif font-bold text-lg text-[#30252A]">
                  Crown &amp; Chic Size Chart (Inches)
                </h3>
                <button
                  onClick={() => setShowSizeGuide(false)}
                  className="p-1 rounded-full text-[#796B70] hover:text-[#BE3D69]"
                >
                  ✕
                </button>
              </div>

              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#FCE8EE] text-[#BE3D69]">
                      <th className="p-2.5 font-bold">Size</th>
                      <th className="p-2.5 font-bold">Bust</th>
                      <th className="p-2.5 font-bold">Waist</th>
                      <th className="p-2.5 font-bold">Length</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#FCE8EE]">
                    <tr>
                      <td className="p-2.5 font-bold">S (Small)</td>
                      <td className="p-2.5">36"</td>
                      <td className="p-2.5">32"</td>
                      <td className="p-2.5">42"</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold">M (Medium)</td>
                      <td className="p-2.5">38"</td>
                      <td className="p-2.5">34"</td>
                      <td className="p-2.5">43"</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold">L (Large)</td>
                      <td className="p-2.5">40"</td>
                      <td className="p-2.5">36"</td>
                      <td className="p-2.5">44"</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold">XL (Extra Large)</td>
                      <td className="p-2.5">42"</td>
                      <td className="p-2.5">38"</td>
                      <td className="p-2.5">45"</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <button
                onClick={() => setShowSizeGuide(false)}
                className="w-full py-2.5 rounded-full bg-[#BE3D69] text-white text-xs font-semibold hover:bg-[#D85C83]"
              >
                Got It
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
