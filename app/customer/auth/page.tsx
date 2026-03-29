'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChefHat,
  Mail,
  Lock,
  Phone,
  User,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  ArrowLeft,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function CustomerAuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const restaurantId = searchParams.get('restaurant') || localStorage.getItem('customer_restaurant_id') || '';

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Login state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register state
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUsername || !loginPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!restaurantId) {
      toast.error('Restaurant ID is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${BASE_URL}/api/auth/customer/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Restaurant-ID': restaurantId,
        },
        body: JSON.stringify({
          username: loginUsername,
          password: loginPassword,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        const errorMsg = Array.isArray(error.detail)
          ? error.detail.map((e: any) => `${e.loc?.join('.') || 'Error'}: ${e.msg}`).join(', ')
          : (error.detail || 'Login failed');
        toast.error(errorMsg);
        return;
      }

      const data = await res.json();
      localStorage.setItem('customer_auth', JSON.stringify(data));
      localStorage.setItem('customer_restaurant_id', restaurantId);
      toast.success('Welcome back!');
      router.push('/customer');
    } catch (err) {
      toast.error('Failed to login. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerUsername || !registerPhone || !registerPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!restaurantId) {
      toast.error('Restaurant ID is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${BASE_URL}/api/auth/customer/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Restaurant-ID': restaurantId,
        },
        body: JSON.stringify({
          username: registerUsername,
          password: registerPassword,
          phone: registerPhone,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        const errorMsg = Array.isArray(error.detail)
          ? error.detail.map((e: any) => `${e.loc?.join('.') || 'Error'}: ${e.msg}`).join(', ')
          : (error.detail || 'Registration failed');
        toast.error(errorMsg);
        return;
      }

      const data = await res.json();
      localStorage.setItem('customer_auth', JSON.stringify(data));
      localStorage.setItem('customer_restaurant_id', restaurantId);
      toast.success('Account created successfully!');
      router.push('/customer');
    } catch (err) {
      toast.error('Failed to register. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col items-center justify-center overflow-x-hidden font-sans">
      {/* Cinematic Background */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/gourmet-bg.png"
          alt="Gourmet Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
      </div>

      <div className="relative z-10 w-full max-w-[420px] px-8 flex flex-col items-center py-12">
        {/* Gourmet Logo */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full flex justify-center mb-12"
        >
          <div className="relative w-64 h-48">
            <Image
              src="/gourmet-logo.png"
              alt="Restaurant Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </motion.div>

        {/* Auth Forms */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4 }}
            className="w-full space-y-6"
          >
            {activeTab === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-5">
                {/* Email Input */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-white/70 group-focus-within:text-amber-400 transition-colors">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="Username"
                    className="w-full h-14 pl-14 pr-6 rounded-[20px] bg-black/40 backdrop-blur-md border border-amber-900/30 focus:border-amber-500/50 outline-none transition-all text-white placeholder:text-white/40 shadow-2xl"
                  />
                </div>

                {/* Password Input */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-white/70 group-focus-within:text-amber-400 transition-colors">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="Password"
                    className="w-full h-14 pl-14 pr-14 rounded-[20px] bg-black/40 backdrop-blur-md border border-amber-900/30 focus:border-amber-500/50 outline-none transition-all text-white placeholder:text-white/40 shadow-2xl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-5 flex items-center text-white/50 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                <div className="flex justify-center">
                  <button type="button" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-15 bg-gradient-to-r from-[#d97706] via-[#f59e0b] to-[#d97706] text-white font-bold text-xl rounded-2xl shadow-[0_8px_25px_-5px_rgba(217,119,6,0.5)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 border border-amber-400/30"
                >
                  {isSubmitting ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Login"
                  )}
                </button>

                {/* Divider */}
                <div className="flex items-center gap-4 py-2">
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/20" />
                  <span className="text-white/50 text-sm font-medium italic">Or</span>
                  <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/20" />
                </div>

                {/* Bottom Actions */}
                <div className="grid grid-cols-2 gap-4 pt-4 mt-auto">
                  <button
                    type="button"
                    onClick={() => setActiveTab('register')}
                    className="flex flex-col items-center justify-center py-4 px-2 bg-gradient-to-b from-green-600 to-green-800 rounded-2xl border border-green-400/30 shadow-xl group active:scale-95 transition-all"
                  >
                    <span className="text-white font-bold text-lg leading-tight uppercase tracking-tight">Sign Up</span>
                    <span className="text-white/70 text-[10px] font-medium uppercase tracking-widest mt-0.5">Create Account</span>
                  </button>
                  <button
                    type="button"
                    className="flex flex-col items-center justify-center py-4 px-2 bg-black/40 backdrop-blur-md rounded-2xl border border-amber-900/30 shadow-xl group active:scale-95 transition-all hover:bg-black/50"
                  >
                    <span className="text-white font-bold text-lg leading-tight uppercase tracking-tight">Guest Login</span>
                    <span className="text-white/70 text-[10px] font-medium uppercase tracking-widest mt-0.5">Login as Guest</span>
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-4">
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-white/70 group-focus-within:text-amber-400">
                      <User className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      value={registerUsername}
                      onChange={(e) => setRegisterUsername(e.target.value)}
                      disabled={isSubmitting}
                      placeholder="Choose Username"
                      className="w-full h-14 pl-14 pr-6 rounded-[20px] bg-black/40 backdrop-blur-md border border-amber-900/30 focus:border-amber-500/50 outline-none transition-all text-white placeholder:text-white/40 shadow-2xl"
                    />
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-white/70 group-focus-within:text-amber-400">
                      <Phone className="w-5 h-5" />
                    </div>
                    <input
                      type="tel"
                      value={registerPhone}
                      onChange={(e) => setRegisterPhone(e.target.value)}
                      disabled={isSubmitting}
                      placeholder="Phone Number"
                      className="w-full h-14 pl-14 pr-6 rounded-[20px] bg-black/40 backdrop-blur-md border border-amber-900/30 focus:border-amber-500/50 outline-none transition-all text-white placeholder:text-white/40 shadow-2xl"
                    />
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-white/70 group-focus-within:text-amber-400">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      type="password"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      disabled={isSubmitting}
                      placeholder="Choose Password"
                      className="w-full h-14 pl-14 pr-6 rounded-[20px] bg-black/40 backdrop-blur-md border border-amber-900/30 focus:border-amber-500/50 outline-none transition-all text-white placeholder:text-white/40 shadow-2xl"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-15 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold text-xl rounded-2xl shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 border border-green-400/30 mt-4"
                >
                  {isSubmitting ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Create Account"
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="w-full text-white/70 text-sm font-bold flex items-center justify-center gap-2 mt-4 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Sign In
                </button>
              </form>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Global Footer Elements */}
        <div className="mt-12 flex items-center gap-6 text-white/30 text-[10px] font-bold tracking-[0.2em] uppercase">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-green-500 opacity-50" />
            Secure
          </div>
          <div className="w-1 h-1 rounded-full bg-white/20" />
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 opacity-50" />
            Fast
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(1deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }
      `}</style>
    </div>
  );
}