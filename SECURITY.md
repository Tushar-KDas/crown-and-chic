# 🛡️ Crown & Chic — Security & Compliance Architecture

Crown & Chic implements defensive engineering standards to protect customer data, inventory integrity, and payment evidence.

---

## 1. Key Security Measures

### A. Database Isolation (Row-Level Security)
- All tables containing private user data (`profiles`, `addresses`, `carts`, `orders`, `payment_submissions`, `admin_audit_logs`) enforce PostgreSQL Row-Level Security.
- Customer policies guarantee that users can never access or query records belonging to another customer (`auth.uid() = user_id`).
- Public catalog access is strictly restricted to active categories and published products.

### B. Privileged Authorization
- Privileged operations (`/admin`, payment verification, stock adjustments) are guarded by server-side verification against `public.user_roles`.
- Super Admin privileges cannot be escalated via user metadata or untrusted client payloads.

### C. Atomic Inventory & Race Condition Prevention
- Stored procedures (`public.deduct_order_inventory`) acquire pessimistic row locks (`SELECT FOR UPDATE`) on `product_variants`.
- Double-spend and overselling attacks during high-traffic flash sales are prevented at the database transaction layer.

### D. Private Storage for Payment Evidence
- Customer payment proofs (screenshots of bKash/Nagad transactions) are stored in a private Supabase bucket (`payment-proofs`).
- Public read access is disabled; only the submitting customer and authorized administrators can inspect proofs via signed URLs.

### E. Fake Order Prevention & Anti-Spam
- Automated risk scoring evaluates:
  - Excessive consecutive order attempts from identical phone numbers within short time windows.
  - High-value Cash On Delivery (COD) orders exceeding configurable thresholds (৳8,000+).
- Flagged orders enter a manual administrator review queue before dispatch.

### F. Secret Management
- Service role keys and secrets are never prefixed with `NEXT_PUBLIC_` and are never bundled into client-side JavaScript.
