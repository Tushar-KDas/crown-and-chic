import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format amounts in Bangladeshi Taka (BDT)
 * e.g. formatBDT(1250) -> "৳ 1,250"
 */
export function formatBDT(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return '৳ 0';
  }
  const num = Math.round(Number(amount));
  return `৳ ${num.toLocaleString('en-IN')}`;
}

/**
 * Validate Bangladesh mobile phone numbers
 * Accepts: 013-019XXXXXXXX, +8801XXXXXXXX, 8801XXXXXXXX
 */
export function isValidBDPhoneNumber(phone: string): boolean {
  const cleaned = phone.replace(/[\s-]/g, '');
  const bdRegex = /^(?:\+?8801|01)[3-9]\d{8}$/;
  return bdRegex.test(cleaned);
}

/**
 * Standardize BD phone number to 01XXXXXXXX format
 */
export function normalizeBDPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/[\s-]/g, '');
  if (cleaned.startsWith('+8801')) {
    return cleaned.slice(3);
  }
  if (cleaned.startsWith('8801')) {
    return cleaned.slice(2);
  }
  return cleaned;
}

/**
 * Generate human readable Order Number
 * e.g. CNC-20261026-8492
 */
export function generateOrderNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `CNC-${dateStr}-${randomSuffix}`;
}
