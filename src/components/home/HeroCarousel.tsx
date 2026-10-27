'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Crown, ArrowRight } from 'lucide-react';
import { Banner } from '@/types';

interface HeroCarouselProps {
  banners: Banner[];
}

export function HeroCarousel({ banners }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners.length]);

  if (!banners || banners.length === 0) return null;

  const current = banners[currentIndex];

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-[#FCE8EE] via-[#FFFDF8] to-[#FCE8EE] border-b border-[#FCE8EE]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center min-h-[420px]">
          
          {/* Left Text Content */}
          <div className="md:col-span-7 space-y-4 md:space-y-6 text-center md:text-left z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-[#D85C83]/20 shadow-xs">
              <Crown className="w-4 h-4 text-[#C49A52]" />
              <span className="text-xs font-semibold text-[#BE3D69] tracking-wider uppercase">
                Crown &amp; Chic Exclusive
              </span>
            </div>

            <div className="space-y-2">
              <span className="block font-serif italic text-2xl md:text-3xl text-[#BE3D69]">
                New Collection
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#30252A] tracking-tight leading-tight">
                FOR YOUR <br className="hidden sm:inline" />
                <span className="text-[#BE3D69]">BEAUTIFUL YOU</span>
              </h1>
            </div>

            <p className="text-sm md:text-base text-[#796B70] tracking-wide font-medium">
              Trendy &bull; Elegant &bull; Affordable
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
              <Link 
                href={current.cta_link || '/products'}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#BE3D69] text-white text-sm font-semibold hover:bg-[#D85C83] transition-all shadow-lg shadow-[#BE3D69]/25 hover:shadow-xl hover:-translate-y-0.5"
              >
                <span>{current.cta_text || 'Shop Now'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              
              <Link 
                href="/category/womens-fashion"
                className="text-xs font-semibold text-[#30252A] hover:text-[#BE3D69] underline underline-offset-4 transition-colors"
              >
                Explore Women's Outfits
              </Link>
            </div>
          </div>

          {/* Right Hero Image */}
          <div className="md:col-span-5 relative flex justify-center">
            <div className="relative w-72 h-80 sm:w-80 sm:h-96 md:w-96 md:h-[420px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white/80">
              <Image 
                src={current.desktop_image || "/images/hero/hero-model.jpg"} 
                alt="Crown & Chic Fashion Model" 
                fill 
                className="object-cover object-top hover:scale-105 transition-transform duration-700"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Decorative floral accents */}
            <div className="absolute -top-4 -left-4 w-20 h-20 bg-[#FCE8EE] rounded-full blur-xl -z-10" />
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-[#D85C83]/20 rounded-full blur-xl -z-10" />
          </div>

        </div>

        {/* Carousel Navigation Arrows */}
        {banners.length > 1 && (
          <>
            <button 
              onClick={prevSlide}
              aria-label="Previous slide"
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 text-[#30252A] hover:text-[#BE3D69] shadow-md flex items-center justify-center transition-all hover:scale-105"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={nextSlide}
              aria-label="Next slide"
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 text-[#30252A] hover:text-[#BE3D69] shadow-md flex items-center justify-center transition-all hover:scale-105"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Slide Indicator Dots */}
        {banners.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            {banners.map((_, idx) => (
              <button 
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-2.5 rounded-full transition-all ${
                  idx === currentIndex ? 'w-8 bg-[#BE3D69]' : 'w-2.5 bg-[#D85C83]/30 hover:bg-[#D85C83]/50'
                }`}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
