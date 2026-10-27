'use client';

import React from 'react';
import Link from 'next/link';
import { Truck, RotateCcw, ShieldCheck, MapPin } from 'lucide-react';

interface AnnouncementBarProps {
  text?: string;
  enabled?: boolean;
}

export function AnnouncementBar({ text, enabled = true }: AnnouncementBarProps) {
  if (!enabled) return null;

  return (
    <div className="bg-[#BE3D69] text-white text-xs py-2 px-4 border-b border-[#D85C83]/30">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-6 overflow-x-auto whitespace-nowrap text-[11px] md:text-xs">
          <span className="flex items-center gap-1.5 opacity-95">
            <Truck className="w-3.5 h-3.5 text-[#FCE8EE]" />
            Free Shipping All Over Bangladesh
          </span>
          <span className="opacity-40">|</span>
          <span className="flex items-center gap-1.5 opacity-95">
            <RotateCcw className="w-3.5 h-3.5 text-[#FCE8EE]" />
            Easy Return
          </span>
          <span className="opacity-40">|</span>
          <span className="flex items-center gap-1.5 opacity-95">
            <ShieldCheck className="w-3.5 h-3.5 text-[#FCE8EE]" />
            100% Original Products
          </span>
        </div>

        <div className="flex items-center gap-4 text-[11px] md:text-xs">
          <Link 
            href="/track-order" 
            className="flex items-center gap-1 font-medium hover:text-[#FCE8EE] transition-colors"
          >
            <MapPin className="w-3.5 h-3.5 text-[#FCE8EE]" />
            Track Your Order
          </Link>
        </div>
      </div>
    </div>
  );
}
