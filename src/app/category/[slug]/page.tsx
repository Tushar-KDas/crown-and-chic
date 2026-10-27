import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getLiveCategoryBySlug, getLiveProducts } from '@/lib/db/live-data';
import { ProductCard } from '@/components/product/ProductCard';
import { ChevronRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getLiveCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const products = await getLiveProducts({ categorySlug: slug });

  return (
    <div className="py-8 md:py-12 bg-[#FFFDF8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#796B70]">
          <Link href="/" className="hover:text-[#BE3D69]">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/products" className="hover:text-[#BE3D69]">Categories</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-[#BE3D69]">{category.name}</span>
        </div>

        {/* Category Banner Header */}
        <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-r from-[#FCE8EE] via-white to-[#FCE8EE] border border-[#FCE8EE] text-center space-y-3 shadow-luxury">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#30252A]">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-xs md:text-sm text-[#796B70] max-w-xl mx-auto">
              {category.description}
            </p>
          )}
          <span className="inline-block text-xs font-semibold text-[#BE3D69] bg-white px-4 py-1.5 rounded-full border border-[#D85C83]/30">
            {products.length} Products Available
          </span>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <p className="text-base font-semibold text-[#30252A]">
              No products found in this category.
            </p>
            <p className="text-xs text-[#796B70]">
              Our designers are creating new fashion pieces for this section.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
