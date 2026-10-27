'use client';

import React from 'react';
import { ShieldCheck, Truck, Headphones, Heart } from 'lucide-react';

export function ValueProps() {
  return (
    <section className="bg-gradient-to-r from-[#FCE8EE] via-[#FFFDF8] to-[#FCE8EE] border-t border-b border-[#FCE8EE] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
          
          {/* Feature 1 */}
          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white/70 border border-[#D85C83]/20 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-[#FCE8EE] flex items-center justify-center text-[#BE3D69] shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#30252A] uppercase tracking-wide">
                Secure Payment
              </h4>
              <p className="text-[11px] text-[#796B70]">
                Your payment is safe with us
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white/70 border border-[#D85C83]/20 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-[#FCE8EE] flex items-center justify-center text-[#BE3D69] shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#30252A] uppercase tracking-wide">
                Fast Delivery
              </h4>
              <p className="text-[11px] text-[#796B70]">
                All over Bangladesh
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white/70 border border-[#D85C83]/20 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-[#FCE8EE] flex items-center justify-center text-[#BE3D69] shrink-0">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#30252A] uppercase tracking-wide">
                24/7 Support
              </h4>
              <p className="text-[11px] text-[#796B70]">
                We are here to help
              </p>
            </div>
          </div>

          {/* Slogan Badge */}
          <div className="text-center md:text-right p-2">
            <div className="inline-flex items-center gap-1.5 font-serif italic text-base md:text-lg text-[#BE3D69] font-medium">
              <span>Fashion Makes You More Confident</span>
              <Heart className="w-4 h-4 fill-current text-[#BE3D69] inline" />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
