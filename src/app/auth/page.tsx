'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  User, 
  Lock, 
  Mail, 
  Phone, 
  Crown, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  KeyRound,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '';
  const reason = searchParams.get('message');

  const { login, register, user, isStaff } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setIsSuccess(false);

    if (mode === 'login') {
      const res = await login(email, password);
      if (!res.success || !res.user) {
        setIsLoading(false);
        setIsSuccess(false);
        setMessage(res.error || 'Login failed. Please check your credentials.');
        return;
      }

      setIsSuccess(true);
      setMessage(`Welcome back, ${res.user.full_name}! Redirecting...`);

      setTimeout(() => {
        if (redirectTarget) {
          router.push(redirectTarget);
        } else if (res.user?.role === 'super_admin' || res.user?.role === 'admin' || res.user?.role === 'moderator') {
          router.push('/admin');
        } else {
          router.push('/');
        }
      }, 1000);

    } else {
      if (!fullName.trim()) {
        setIsLoading(false);
        setMessage('Full Name is required.');
        return;
      }
      if (!password || password.length < 6) {
        setIsLoading(false);
        setMessage('Password must be at least 6 characters.');
        return;
      }

      const res = await register({
        email,
        password,
        full_name: fullName,
        phone
      });

      if (!res.success || !res.user) {
        setIsLoading(false);
        setIsSuccess(false);
        setMessage(res.error || 'Registration failed.');
        return;
      }

      setIsSuccess(true);
      setMessage(`Account created successfully! Welcome to Crown & Chic, ${res.user.full_name}.`);

      setTimeout(() => {
        router.push(redirectTarget || '/');
      }, 1200);
    }
  };

  return (
    <div className="py-12 md:py-16 bg-[#FFFDF8] min-h-[calc(100vh-140px)] flex flex-col justify-center">
      <div className="max-w-md mx-auto px-4 w-full">
        
        {/* Notice for redirected staff access */}
        {reason === 'staff_required' && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3 shadow-xs">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Staff Authentication Required</p>
              <p className="text-amber-800 mt-0.5">
                The page you attempted to visit is reserved for Crown &amp; Chic administration staff. Please sign in below.
              </p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl border border-[#FCE8EE] p-6 sm:p-8 shadow-luxury space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="relative w-16 h-16 mx-auto rounded-full overflow-hidden border border-[#D85C83]/20 bg-[#FFFDF8] shadow-sm">
              <Image 
                src="/images/brand/crown-and-chic-emblem.png" 
                alt="Crown & Chic" 
                fill 
                className="object-cover"
              />
            </div>
            <h1 className="font-serif text-2xl font-bold text-[#30252A]">
              {mode === 'login' ? 'Sign In to Your Account' : 'Create New Account'}
            </h1>
            <p className="text-xs text-[#796B70]">
              {mode === 'login' 
                ? 'Everyone must have an individual account to access Crown & Chic.' 
                : 'Join Crown & Chic to place orders, track deliveries, and manage your wishlist.'}
            </p>
          </div>

          {/* Mode Switch Tabs */}
          <div className="flex rounded-full bg-[#FCE8EE] p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => { setMode('login'); setMessage(''); setIsSuccess(false); }}
              className={`flex-1 py-2 rounded-full transition-all ${
                mode === 'login' ? 'bg-[#BE3D69] text-white shadow-sm' : 'text-[#796B70] hover:text-[#30252A]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setMessage(''); setIsSuccess(false); }}
              className={`flex-1 py-2 rounded-full transition-all ${
                mode === 'register' ? 'bg-[#BE3D69] text-white shadow-sm' : 'text-[#796B70] hover:text-[#30252A]'
              }`}
            >
              Register (New Account)
            </button>
          </div>

          {/* Alert Message */}
          {message && (
            <div className={`p-3.5 rounded-2xl text-xs flex items-center gap-2.5 ${
              isSuccess 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {isSuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />}
              <span className="leading-tight">{message}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {mode === 'register' && (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#30252A]">Full Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Tanha Islam"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#D85C83]/30 text-xs text-[#30252A] focus:outline-none focus:border-[#BE3D69]"
                    />
                    <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#30252A]">Mobile Phone (Bangladesh)</label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 01712345678"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#D85C83]/30 text-xs text-[#30252A] focus:outline-none focus:border-[#BE3D69]"
                    />
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#30252A]">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@example.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#D85C83]/30 text-xs text-[#30252A] focus:outline-none focus:border-[#BE3D69]"
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-[#30252A]">Password</label>
                {mode === 'login' && (
                  <span className="text-[10px] text-[#796B70]">Individual account password</span>
                )}
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#D85C83]/30 text-xs text-[#30252A] focus:outline-none focus:border-[#BE3D69]"
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-full bg-[#BE3D69] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#D85C83] transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              <span>{isLoading ? 'Verifying...' : (mode === 'login' ? 'Sign In to Account' : 'Register Account')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>



        </div>

      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs text-[#796B70]">Loading authentication...</div>}>
      <AuthContent />
    </Suspense>
  );
}
