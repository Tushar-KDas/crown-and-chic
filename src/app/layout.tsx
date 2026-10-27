import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: 'Crown & Chic — Fashion, Beauty & Lifestyle | Premium Fashion E-Commerce',
  description: 'Crown & Chic: Discover exquisite women\'s salwar kameez, floral maxi dresses, designer kurtis, chic bags, hijabs and footwear in Bangladesh.',
  icons: {
    icon: '/images/brand/crown-and-chic-icon.png',
    shortcut: '/images/brand/crown-and-chic-icon.png',
    apple: '/images/brand/crown-and-chic-icon.png',
  },
  openGraph: {
    title: 'Crown & Chic — Fashion, Beauty & Lifestyle',
    description: 'Premium boutique fashion store in Bangladesh. Trendy • Elegant • Royal.',
    images: ['/images/brand/crown-and-chic-logo.png'],
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased text-[#30252A] bg-[#FFFDF8]">
        <AuthProvider>
          <CartProvider>
            <AppShell>{children}</AppShell>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
