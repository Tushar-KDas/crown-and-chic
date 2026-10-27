import { notFound } from 'next/navigation';
import { getLiveProductBySlug, getLiveProducts } from '@/lib/db/live-data';
import { ProductDetailsClient } from '@/components/product/ProductDetailsClient';

export const dynamic = 'force-dynamic';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getLiveProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const catSlug = product.categories[0]?.slug;
  const relatedProducts = (await getLiveProducts({ categorySlug: catSlug })).filter(p => p.id !== product.id).slice(0, 4);

  return <ProductDetailsClient product={product} relatedProducts={relatedProducts} />;
}
