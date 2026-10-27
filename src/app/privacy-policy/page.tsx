import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="py-12 md:py-16 bg-[#FFFDF8]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="border-b border-[#FCE8EE] pb-4">
          <h1 className="font-serif text-3xl font-bold text-[#30252A]">
            Privacy Policy
          </h1>
          <p className="text-xs text-[#796B70] mt-1">
            Last updated: October 2026 &bull; Crown &amp; Chic Customer Privacy Commitment
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-[#FCE8EE] shadow-luxury space-y-6 text-xs text-[#30252A] leading-relaxed">
          <p>
            At <strong>Crown &amp; Chic</strong>, safeguarding your personal data and delivery privacy is central to our royal standard of service. This Privacy Policy details how we handle the information you provide when shopping with us.
          </p>

          <div className="space-y-2">
            <h3 className="font-bold text-sm text-[#BE3D69]">1. Information We Collect</h3>
            <p className="text-[#796B70]">
              To process your orders and ensure delivery, we collect your name, mobile phone number, delivery address (Division, District, Thana), and transaction references (for manual bKash/Nagad/Rocket payments).
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-sm text-[#BE3D69]">2. Security & RLS Isolation</h3>
            <p className="text-[#796B70]">
              All database records are protected by PostgreSQL Row-Level Security (RLS). Payment proofs and sensitive transaction logs are restricted to authenticated administrators and can never be queried publicly.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-sm text-[#BE3D69]">3. No Unauthorized Third-Party Selling</h3>
            <p className="text-[#796B70]">
              We do not sell, rent, or trade customer contact information to advertisers. Information is only shared with our approved logistics partners (courier services) solely for delivery execution.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
