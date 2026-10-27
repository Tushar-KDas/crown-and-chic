'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  User, 
  Heart, 
  ShoppingBag, 
  Menu, 
  X,
  ShieldAlert,
  Crown,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { FacebookIcon, InstagramIcon, YoutubeIcon } from '@/components/ui/SocialIcons';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { formatBDT } from '@/lib/utils';

export function Header() {
  const router = useRouter();
  const { toggleCart, totalItems, subtotal } = useCart();
  const { user, logout, isStaff } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FFFDF8]/95 backdrop-blur-md border-b border-[#FCE8EE] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4 md:gap-6">
          
          {/* Mobile menu button */}
          <button 
            type="button" 
            onClick={() => setMobileMenuOpen(prev => !prev)}
            className="md:hidden p-2 text-[#30252A] hover:text-[#BE3D69]"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Logo on far left */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden border border-[#D85C83]/20 shadow-sm bg-[#FFFDF8]">
              <Image 
                src="/images/brand/crown-and-chic-emblem.png" 
                alt="Crown & Chic Logo" 
                fill 
                className="object-cover"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-xl md:text-2xl font-bold tracking-tight text-[#BE3D69]">
                Crown &amp; Chic
              </span>
              <span className="text-[9px] md:text-[10px] tracking-widest uppercase font-medium text-[#C49A52] -mt-1">
                Fashion &bull; Beauty &bull; Lifestyle
              </span>
            </div>
          </Link>

          {/* Product search bar beside the logo */}
          <div className="hidden md:flex flex-1 max-w-md mx-2 lg:mx-4">
            <form onSubmit={handleSearch} className="w-full relative flex items-center">
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products..."
                className="w-full pl-4 pr-12 py-2.5 rounded-full border border-[#D85C83]/30 bg-white/80 text-sm text-[#30252A] placeholder-[#796B70] focus:outline-none focus:border-[#BE3D69] focus:ring-1 focus:ring-[#BE3D69] transition-all"
              />
              <button 
                type="submit"
                aria-label="Submit search"
                className="absolute right-1.5 w-8 h-8 rounded-full bg-[#BE3D69] text-white flex items-center justify-center hover:bg-[#D85C83] transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Right actions: Login, Social, Wishlist, Cart, Admin shortcut */}
          <div className="flex items-center gap-3 md:gap-5">
            
            {/* User Session Info or Login/Register */}
            {user ? (
              <div className="hidden lg:flex items-center gap-3">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-bold text-[#30252A] max-w-[130px] truncate" title={user.full_name}>
                    {user.full_name}
                  </span>
                  <div className="flex items-center gap-1">
                    {user.role === 'super_admin' && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#C49A52]/15 text-[#C49A52] border border-[#C49A52]/30 flex items-center gap-0.5">
                        <Crown className="w-2.5 h-2.5 fill-current" /> Super Admin
                      </span>
                    )}
                    {user.role === 'admin' && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#BE3D69]/10 text-[#BE3D69] border border-[#BE3D69]/20 flex items-center gap-0.5">
                        <ShieldCheck className="w-2.5 h-2.5" /> Admin
                      </span>
                    )}
                    {user.role === 'moderator' && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                        Moderator
                      </span>
                    )}
                    {user.role === 'customer' && (
                      <span className="text-[9px] font-medium text-[#796B70]">
                        Customer
                      </span>
                    )}
                  </div>
                </div>

                {isStaff && (
                  <Link
                    href="/admin"
                    className="p-1.5 rounded-lg bg-[#FCE8EE] text-[#BE3D69] hover:bg-[#BE3D69] hover:text-white transition-colors text-xs font-semibold flex items-center gap-1"
                    title="Access Admin Console"
                  >
                    <Crown className="w-3.5 h-3.5" />
                    <span className="hidden xl:inline">Portal</span>
                  </Link>
                )}

                <button
                  type="button"
                  onClick={() => logout()}
                  className="p-1.5 rounded-lg text-[#796B70] hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link 
                href="/auth" 
                className="hidden lg:flex items-center gap-1.5 text-xs font-medium text-[#30252A] hover:text-[#BE3D69] transition-colors"
              >
                <User className="w-4 h-4 text-[#BE3D69]" />
                <span>Login | Register</span>
              </Link>
            )}

            {/* Social media icons */}
            <div className="hidden xl:flex items-center gap-2 border-l border-r border-[#FCE8EE] px-3">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noreferrer" 
                className="w-7 h-7 rounded-full bg-[#FCE8EE] flex items-center justify-center text-[#BE3D69] hover:bg-[#BE3D69] hover:text-white transition-all"
                title="Facebook"
              >
                <FacebookIcon className="w-3.5 h-3.5" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noreferrer" 
                className="w-7 h-7 rounded-full bg-[#FCE8EE] flex items-center justify-center text-[#BE3D69] hover:bg-[#BE3D69] hover:text-white transition-all"
                title="Instagram"
              >
                <InstagramIcon className="w-3.5 h-3.5" />
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noreferrer" 
                className="w-7 h-7 rounded-full bg-[#FCE8EE] flex items-center justify-center text-[#BE3D69] hover:bg-[#BE3D69] hover:text-white transition-all"
                title="YouTube"
              >
                <YoutubeIcon className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Wishlist Icon */}
            <Link 
              href="/wishlist" 
              className="relative p-2 text-[#30252A] hover:text-[#BE3D69] transition-colors"
              title="Wishlist"
            >
              <Heart className="w-5 h-5 text-[#30252A]" />
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#BE3D69] text-white text-[10px] font-bold flex items-center justify-center">
                0
              </span>
            </Link>

            {/* Shopping cart icon with live item count & BDT amount */}
            <button 
              onClick={toggleCart}
              type="button"
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FCE8EE] border border-[#D85C83]/30 hover:border-[#BE3D69] text-[#30252A] transition-all"
              title="View Cart"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 text-[#BE3D69]" />
                <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-[#BE3D69] text-white text-[10px] font-bold flex items-center justify-center">
                  {totalItems}
                </span>
              </div>
              <span className="text-xs md:text-sm font-bold text-[#BE3D69] whitespace-nowrap hidden sm:inline">
                {formatBDT(subtotal)}
              </span>
            </button>

            {/* Admin Panel button for direct access */}
            <Link 
              href="/admin" 
              className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#BE3D69] text-white text-xs font-semibold hover:bg-[#D85C83] transition-all shadow-sm"
              title="Admin Panel"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Admin</span>
            </Link>



          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearch} className="w-full relative flex items-center">
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for products..."
              className="w-full pl-4 pr-10 py-2 rounded-full border border-[#D85C83]/30 bg-white text-xs text-[#30252A] focus:outline-none focus:border-[#BE3D69]"
            />
            <button 
              type="submit"
              className="absolute right-1 w-7 h-7 rounded-full bg-[#BE3D69] text-white flex items-center justify-center"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Mobile navigation drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#FCE8EE] space-y-3">
            <div className="grid grid-cols-2 gap-2 text-xs font-medium">
              <Link 
                href="/category/womens-fashion" 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded bg-white hover:text-[#BE3D69]"
              >
                👗 Women's Fashion
              </Link>
              <Link 
                href="/category/mens-fashion" 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded bg-white hover:text-[#BE3D69]"
              >
                👔 Men's Fashion
              </Link>
              <Link 
                href="/category/kids-fashion" 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded bg-white hover:text-[#BE3D69]"
              >
                🧸 Kids Fashion
              </Link>
              <Link 
                href="/category/hijab-scarf" 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded bg-white hover:text-[#BE3D69]"
              >
                🧕 Hijab & Scarf
              </Link>
              <Link 
                href="/category/bags-accessories" 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded bg-white hover:text-[#BE3D69]"
              >
                👜 Bags & Accessories
              </Link>
              <Link 
                href="/category/footwear" 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded bg-white hover:text-[#BE3D69]"
              >
                👠 Footwear
              </Link>
            </div>
            <div className="pt-2 border-t border-[#FCE8EE] flex flex-col gap-2">
              {user ? (
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-[#30252A] block">{user.full_name}</span>
                    <span className="text-[10px] text-[#BE3D69] capitalize font-medium">{user.role.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isStaff && (
                      <Link 
                        href="/admin" 
                        onClick={() => setMobileMenuOpen(false)}
                        className="px-2.5 py-1 rounded-full bg-[#BE3D69] text-white text-[11px] font-semibold"
                      >
                        Admin Portal
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => { logout(); setMobileMenuOpen(false); }}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <Link 
                    href="/auth" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-1.5 text-xs text-[#BE3D69] font-medium"
                  >
                    <User className="w-4 h-4" />
                    <span>Login or Register</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </header>
  );
}
