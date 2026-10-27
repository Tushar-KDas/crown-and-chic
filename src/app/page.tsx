import { store } from '@/lib/db/store';
import { HeroCarousel } from '@/components/home/HeroCarousel';
import { CategorySection } from '@/components/home/CategorySection';
import { ProductGrid } from '@/components/home/ProductGrid';
import { ValueProps } from '@/components/home/ValueProps';

export default function HomePage() {
  const banners = store.getBanners();
  const categories = store.getCategories();
  const products = store.getProducts();

  return (
    <div>
      <HeroCarousel banners={banners} />
      <CategorySection categories={categories} />
      <ProductGrid products={products} />
      <ValueProps />
    </div>
  );
}
