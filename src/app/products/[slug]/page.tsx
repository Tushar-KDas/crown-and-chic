import { notFound } from 'next/navigation';
import { store } from '@/lib/db/store';
import { ProductDetailsClient } from '@/components/product/ProductDetailsClient';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = store.getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = store.getProducts({ categorySlug: product.categories[0]?.slug }).slice(0, 4);

  return <ProductDetailsClient product={product} relatedProducts={relatedProducts} />;
}
