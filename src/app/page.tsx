import { getLiveBanners, getLiveCategories, getLiveProducts } from '@/lib/db/live-data';
import { HeroCarousel } from '@/components/home/HeroCarousel';
import { CategorySection } from '@/components/home/CategorySection';
import { ProductGrid } from '@/components/home/ProductGrid';
import { ValueProps } from '@/components/home/ValueProps';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [banners, categories, products] = await Promise.all([
    getLiveBanners(),
    getLiveCategories(),
    getLiveProducts()
  ]);

  return (
    <div>
      <HeroCarousel banners={banners} />
      <CategorySection categories={categories} />
      <ProductGrid products={products} />
      <ValueProps />
    </div>
  );
}
