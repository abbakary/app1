'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Utensils, Delete, Shield, ChevronRight, Sparkles, Fingerprint, Lock, Mail, KeyRound, AlertCircle, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, user, login, loginWithPin, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'pin' | 'email'>('pin');
  const [showSeedHint, setShowSeedHint] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && !isLoading && user) {
      if (user.role === 'sysadmin') {
        router.push('/sysadmin');
      } else {
        router.push('/');
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await login(email, password);
      if (success) {
        toast.success('Welcome back!');
      } else {
        toast.error('Invalid email or password');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePinDigit = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);

      // Auto-submit when 4 digits entered
      if (newPin.length === 4) {
        handlePinLogin(newPin);
      }
    }
  };

  const handlePinDelete = () => {
    setPin(pin.slice(0, -1));
  };

  const handlePinLogin = async (pinCode: string) => {
    setIsSubmitting(true);
    try {
      const success = await loginWithPin(pinCode);
      if (success) {
        toast.success('Welcome back!');
      } else {
        toast.error('Invalid PIN');
        setPin('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSeedDatabase = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/seed`, { method: 'POST' });
      const data = await res.json();
      toast.success(data.message || 'Database seeded successfully!');
      setShowSeedHint(false);
    } catch (err) {
      toast.error('Failed to seed database. Is backend running?');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-black dark:to-gray-900">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Utensils className="w-6 h-6 text-blue-500 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const pinButtons = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

  // iPhone-inspired premium gradients
  const getButtonGradient = (value: string) => {
    const gradients: Record<string, string> = {
      '1': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      '2': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      '3': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      '4': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      '5': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      '6': 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
      '7': 'linear-gradient(135deg, #aeeda8ff 0%, #fed6e3 100%)',
      '8': 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      '9': 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      '0': 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
      'del': 'linear-gradient(135deg, #ff6b6b 0%, #c92a2a 100%)',
    };
    return gradients[value] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  };

  return (
    <main className="h-screen w-full overflow-hidden flex flex-col md:flex-row bg-[#F2F2F7] dark:bg-black relative">

      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 opacity-50" />

      {/* ── Left Side: Brand Hero with Premium Image ── */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="hidden md:flex flex-[1.4] relative overflow-hidden group"
      >
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <Image
            src="/amazooh-bg.png"
            alt="Amazooh Background"
            fill
            className="object-cover transition-transform duration-[10s] group-hover:scale-110"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-black/20 to-transparent" />
          <div className="absolute inset-0 bg-indigo-900/10 mix-blend-overlay" />
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 w-full h-full flex flex-col justify-between p-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-3"
          >
            <div className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20 shadow-2xl">
              <Utensils className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-white font-black text-2xl tracking-tight leading-none">amazooh.com</h3>
              <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Multi-Tenant Platform</p>
            </div>
          </motion.div>

          <div className="max-w-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, type: "spring" }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/10 mb-6"
            >
              <Sparkles className="w-4 h-4 text-orange-400" />
              <span className="text-white/90 text-[11px] font-bold uppercase tracking-widest">Premium Food Experience</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-7xl font-black text-white leading-[0.9] tracking-tighter mb-6 drop-shadow-2xl"
            >
              Beyond <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-yellow-300 to-orange-400 animate-gradient-x">Gastronomy</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="text-white/80 text-lg font-medium leading-relaxed max-w-md"
            >
              The most advanced restaurant ecosystem for high-growth food enterprises and global kitchen chains.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex items-center gap-8"
          >
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center backdrop-blur-sm overflow-hidden text-[10px] text-white font-bold">
                  <Image src={`/placeholder-user.jpg`} alt="User" width={40} height={40} className="opacity-80" />
                </div>
              ))}
            </div>
            <p className="text-white/40 text-xs font-medium">Joined by 1,200+ restaurants globally</p>
          </motion.div>
        </div>
      </motion.div>


      {/* ── Right Side: Login Form (Premium iPhone Glass Look) ── */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full md:w-[500px] bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-xl flex flex-col items-center justify-center px-6 md:px-8 relative z-20 overflow-y-auto no-scrollbar shadow-2xl"
      >
        <div className="w-full max-w-[380px] py-8 md:py-12">

          {/* Mobile Header */}
          <div className="md:hidden flex flex-col items-center mb-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mb-3"
            >
              <Utensils className="w-8 h-8 text-white" />
            </motion.div>
            <h2 className="text-2xl font-bold tracking-tight">amazooh.com</h2>

          </div>

          {/* Header with Premium Typography */}
          <div className="mb-8">
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent"
            >
              Welcome Back
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-gray-500 dark:text-gray-400 text-sm mt-1"
            >
              Sign in to access your workspace
            </motion.p>
          </div>

          <Card className="bg-white/80 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-gray-800/50 shadow-2xl rounded-[32px] overflow-hidden">
            <CardHeader className="text-center bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10 border-b border-gray-100/50 dark:border-gray-800/50 p-5">
              <CardDescription className="text-gray-500 dark:text-gray-400 font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2">
                <Lock className="w-3 h-3" />
                Secure Authentication Required
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'pin' | 'email')} className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-12 bg-gray-100/50 dark:bg-gray-800/30 rounded-xl p-1 mb-6">
                  <TabsTrigger
                    value="pin"
                    className="rounded-lg text-xs font-semibold transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-rose-600 data-[state=active]:text-white shadow-sm"
                  >
                    <KeyRound className="w-3 h-3 mr-1" />
                    PIN Code
                  </TabsTrigger>
                  <TabsTrigger
                    value="email"
                    className="rounded-lg text-xs font-semibold transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-rose-600 data-[state=active]:text-white shadow-sm"
                  >
                    <Mail className="w-3 h-3 mr-1" />
                    Email Login
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="pin" className="mt-0 focus-visible:outline-none">
                  <div className="flex justify-center gap-2.5 mb-8">
                    <AnimatePresence>
                      {[0, 1, 2, 3].map((i) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: i * 0.05 }}
                          className={`w-14 h-16 rounded-2xl border-2 flex items-center justify-center text-2xl font-bold transition-all ${pin.length > i
                            ? 'bg-gradient-to-br from-orange-500 to-rose-600 border-orange-400 text-white shadow-lg shadow-orange-500/30'
                            : 'border-gray-200 bg-white/50 text-gray-300 dark:bg-black/20 dark:border-gray-700'
                            }`}
                        >
                          {pin.length > i ? (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-3 h-3 bg-white rounded-full"
                            />
                          ) : (
                            <div className="w-2 h-2 bg-gray-300 rounded-full" />
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {pinButtons.map((btn, i) => {
                      if (btn === '') return <div key={i} />;
                      if (btn === 'del') {
                        return (
                          <motion.div key={i} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              className="w-full h-14 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-2xl transition-all shadow-lg"
                              onClick={handlePinDelete}
                              disabled={isSubmitting || pin.length === 0}
                            >
                              <Delete className="h-5 w-5" />
                            </Button>
                          </motion.div>
                        );
                      }
                      return (
                        <motion.div key={i} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            className="w-full h-14 text-2xl font-bold rounded-2xl transition-all shadow-lg text-white border border-white/20 hover:brightness-110"
                            style={{
                              background: getButtonGradient(btn),
                            }}
                            onClick={() => handlePinDigit(btn)}
                            disabled={isSubmitting || pin.length >= 4}
                          >
                            {btn}
                          </Button>
                        </motion.div>
                      );
                    })}
                  </div>
                </TabsContent>

                <TabsContent value="email" className="mt-0 focus-visible:outline-none">
                  <form onSubmit={handleEmailLogin} className="space-y-5">
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-gray-600 dark:text-gray-400 ml-1 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        Email Address
                      </Label>
                      <Input
                        type="email"
                        placeholder="admin@amazooh.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isSubmitting}
                        className="h-12 rounded-xl bg-white/50 dark:bg-black/30 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-orange-500/50 transition-all font-medium"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-gray-600 dark:text-gray-400 ml-1 flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Password
                      </Label>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isSubmitting}
                        className="h-12 rounded-xl bg-white/50 dark:bg-black/30 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-orange-500/50 transition-all font-medium"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 mt-2 bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-orange-500/30 active:scale-98 flex items-center justify-center gap-2"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          Sign In
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </Button>

                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>




          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-[10px] text-gray-400 font-medium tracking-wider">
              © 2026 amazooh.com Enterprise

            </p>
          </div>
        </div>
      </motion.div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 8s ease-in-out infinite;
          animation-delay: 1s;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </main>
  );
}