import React from 'react';

export default function TermsAndConditionsPage() {
  return (
    <div className="py-12 md:py-16 bg-[#FFFDF8]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="border-b border-[#FCE8EE] pb-4">
          <h1 className="font-serif text-3xl font-bold text-[#30252A]">
            Terms & Conditions
          </h1>
          <p className="text-xs text-[#796B70] mt-1">
            Last updated: October 2026 &bull; Crown &amp; Chic Storefront Terms
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-[#FCE8EE] shadow-luxury space-y-6 text-xs text-[#30252A] leading-relaxed">
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-[#BE3D69]">1. Agreement to Terms</h3>
            <p className="text-[#796B70]">
              By placing an order or browsing our website, you agree to comply with and be bound by these Terms and Conditions.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-sm text-[#BE3D69]">2. Pricing & Currency</h3>
            <p className="text-[#796B70]">
              All prices are listed in Bangladeshi Taka (৳ BDT) inclusive of applicable local charges. Delivery fees vary based on geographic division (Dhaka vs. Outside Dhaka).
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-sm text-[#BE3D69]">3. Order Acceptance & Inventory Reservation</h3>
            <p className="text-[#796B70]">
              An order confirmation constitutes an offer to purchase. We reserve the right to review and cancel orders flagged by our fraud detection system or in the rare event of inventory discrepancy.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
