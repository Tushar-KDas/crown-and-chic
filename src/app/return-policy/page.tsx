import React from 'react';
import Link from 'next/link';
import { RotateCcw, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function ReturnPolicyPage() {
  return (
    <div className="py-12 md:py-16 bg-[#FFFDF8]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="border-b border-[#FCE8EE] pb-4">
          <h1 className="font-serif text-3xl font-bold text-[#30252A]">
            Return & Refund Policy
          </h1>
          <p className="text-xs text-[#796B70] mt-1">
            Last updated: October 2026 &bull; Crown &amp; Chic Customer Guarantee
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-[#FCE8EE] shadow-luxury space-y-6 text-xs text-[#30252A] leading-relaxed">
          
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#FCE8EE]/50 border border-[#D85C83]/20">
            <RotateCcw className="w-6 h-6 text-[#BE3D69] shrink-0" />
            <div>
              <h3 className="font-bold text-sm text-[#30252A]">7-Day Hassle-Free Returns</h3>
              <p className="text-[#796B70]">We stand behind every hand-embroidered stitch and tailored silhouette.</p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-sm text-[#BE3D69]">1. Return Eligibility</h3>
            <p>
              You may initiate a return or exchange within 7 calendar days from the date of delivery if:
            </p>
            <ul className="list-disc list-inside space-y-1 text-[#796B70] pl-2">
              <li>The delivered item is defective, torn, or damaged upon transit.</li>
              <li>You received an incorrect size, color, or model different from your order confirmation.</li>
              <li>The product remains in unworn, unwashed condition with all original tags attached.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-sm text-[#BE3D69]">2. How to Request a Return</h3>
            <p className="text-[#796B70]">
              Contact our Customer Care via WhatsApp (+880 1XXX-XXXXXX) or email support@crownandchic.com with your Order Number (e.g. CNC-20261026-XXXX) and a clear photo of the item and courier packaging slip.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-sm text-[#BE3D69]">3. Refund Processing</h3>
            <p className="text-[#796B70]">
              Once the returned item is inspected at our Banani, Dhaka inspection center, refunds are disbursed within 3-5 business days directly to your original payment method (bKash, Nagad, Rocket, or Bank Transfer).
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
