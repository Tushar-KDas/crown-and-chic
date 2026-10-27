import Link from 'next/link';
import { store } from '@/lib/db/store';
import { ProductCard } from '@/components/product/ProductCard';
import { ChevronRight } from 'lucide-react';

interface ProductsPageProps {
  searchParams: Promise<{ search?: string; category?: string; sort?: string }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { search, category } = await searchParams;

  const products = store.getProducts({
    search,
    categorySlug: category
  });

  const categories = store.getCategories();

  return (
    <div className="py-8 md:py-12 bg-[#FFFDF8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#796B70]">
          <Link href="/" className="hover:text-[#BE3D69]">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-[#BE3D69]">All Products</span>
          {search && (
            <>
              <ChevronRight className="w-3.5 h-3.5" />
              <span>Search: "{search}"</span>
            </>
          )}
        </div>

        {/* Page Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#FCE8EE] pb-6">
          <div>
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#30252A]">
              {search ? `Search Results for "${search}"` : 'All Fashion Collections'}
            </h1>
            <p className="text-xs text-[#796B70] mt-1">
              Showing {products.length} elegant items
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <Link
              href="/products"
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-all ${
                !category
                  ? 'bg-[#BE3D69] text-white border-[#BE3D69]'
                  : 'bg-white text-[#796B70] border-[#FCE8EE] hover:text-[#BE3D69]'
              }`}
            >
              All
            </Link>
            {categories.map(cat => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-all ${
                  category === cat.slug
                    ? 'bg-[#BE3D69] text-white border-[#BE3D69]'
                    : 'bg-white text-[#796B70] border-[#FCE8EE] hover:text-[#BE3D69]'
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        {products.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <p className="text-lg font-serif font-bold text-[#30252A]">
              No products found matching your criteria.
            </p>
            <p className="text-xs text-[#796B70]">
              Try searching with different keywords or exploring our categories.
            </p>
            <Link
              href="/products"
              className="inline-block px-6 py-2.5 rounded-full bg-[#BE3D69] text-white text-xs font-semibold hover:bg-[#D85C83]"
            >
              Reset Filters
            </Link>
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
