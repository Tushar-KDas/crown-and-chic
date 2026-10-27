'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Banknote,
  Smartphone
} from 'lucide-react';
import { FacebookIcon, InstagramIcon, YoutubeIcon } from '@/components/ui/SocialIcons';
import { SiteSettings } from '@/types';

interface FooterProps {
  settings?: SiteSettings;
}

export function Footer({ settings }: FooterProps) {
  const brand = settings?.brand_info;

  return (
    <footer className="bg-[#BE3D69] text-white pt-12 pb-6 border-t border-[#D85C83]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Col 1: Brand Info & Tagline */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border border-white/30 bg-[#FFFDF8] shadow-sm shrink-0">
                <Image 
                  src="/images/brand/crown-and-chic-emblem.png" 
                  alt="Crown & Chic Logo" 
                  fill 
                  className="object-cover"
                />
              </div>
              <div>
                <span className="font-serif text-xl font-bold tracking-tight text-white block">
                  Crown &amp; Chic
                </span>
                <span className="text-[10px] tracking-widest uppercase font-medium text-[#FCE8EE]">
                  Fashion &bull; Beauty &bull; Lifestyle
                </span>
              </div>
            </div>

            <p className="text-xs text-[#FCE8EE] leading-relaxed">
              Discover the latest fashion trends, royal quality collections and make your everyday more special with Crown &amp; Chic.
            </p>

            <p className="text-[11px] text-white/70">
              &copy; {new Date().getFullYear()} Crown &amp; Chic. All rights reserved.
            </p>
          </div>

          {/* Col 2: Contact Information */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold tracking-wider uppercase text-white font-serif">
              Contact Us
            </h4>
            <ul className="space-y-2.5 text-xs text-[#FCE8EE]">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#FCE8EE] shrink-0 mt-0.5" />
                <span>{brand?.address || 'House 42, Road 11, Banani, Dhaka-1213, Bangladesh'}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#FCE8EE] shrink-0" />
                <span>{brand?.phone || '+880 1XXX-XXXXXX'}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#FCE8EE] shrink-0" />
                <span>{brand?.email || 'support@crownandchic.com'}</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Payment Methods */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold tracking-wider uppercase text-white font-serif">
              Payment Methods
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-white/10 border border-white/20">
                <Banknote className="w-3.5 h-3.5 text-[#FCE8EE]" />
                <span>Cash On Delivery</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-white/10 border border-white/20">
                <Banknote className="w-3.5 h-3.5 text-[#FCE8EE]" />
                <span>Bank Transfer</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-white/10 border border-white/20">
                <Smartphone className="w-3.5 h-3.5 text-[#FCE8EE]" />
                <span>bKash (01711...)</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-white/10 border border-white/20">
                <Smartphone className="w-3.5 h-3.5 text-[#FCE8EE]" />
                <span>Nagad (01722...)</span>
              </div>
            </div>
            <p className="text-[10px] text-[#FCE8EE]/80 pt-1">
              Manual MFS payments supported with Transaction ID verification.
            </p>
          </div>

          {/* Col 4: Follow Us & Policies */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold tracking-wider uppercase text-white font-serif">
              Follow Us
            </h4>
            <div className="flex items-center gap-2.5">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noreferrer" 
                className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center hover:bg-white hover:text-[#BE3D69] transition-all"
                title="Facebook"
              >
                <FacebookIcon className="w-4 h-4" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noreferrer" 
                className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center hover:bg-white hover:text-[#BE3D69] transition-all"
                title="Instagram"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noreferrer" 
                className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center hover:bg-white hover:text-[#BE3D69] transition-all"
                title="YouTube"
              >
                <YoutubeIcon className="w-4 h-4" />
              </a>
            </div>

            <div className="pt-2 border-t border-white/15 space-y-1.5 text-xs text-[#FCE8EE]">
              <div>
                <Link href="/privacy-policy" className="hover:underline">
                  Privacy Policy
                </Link>
              </div>
              <div>
                <Link href="/terms-and-conditions" className="hover:underline">
                  Terms & Conditions
                </Link>
              </div>
              <div>
                <Link href="/return-policy" className="hover:underline">
                  Return & Refund Policy
                </Link>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-white/20 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#FCE8EE]/90 gap-2">
          <span>Crown &amp; Chic — Fashion, Beauty &amp; Lifestyle Bangladesh</span>
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-white font-semibold hover:underline">
              Admin Portal
            </Link>
            <span>&bull;</span>
            <Link href="/track-order" className="hover:underline">
              Order Tracking
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
