'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, LogOut, Home, Clock, Heart, User, Bell, Sparkles, ChefHat, ShoppingBag, Star, Coffee } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem('customer_auth');
    if (!auth) {
      router.push('/customer/auth');
      return;
    }

    try {
      const data = JSON.parse(auth);
      setCustomerName(data.name || 'Customer');
      setIsAuthenticated(true);
    } catch {
      router.push('/customer/auth');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('customer_auth');
    localStorage.removeItem('customer_restaurant_id');
    toast.success('Logged out successfully');
    router.push('/customer/auth');
  };

  const navItems = [
    { href: '/customer', label: 'Order Online', icon: Home, color: 'from-blue-500 to-cyan-500', gradient: 'from-blue-600 to-cyan-500' },
    { href: '/customer/orders', label: 'My Orders', icon: Clock, color: 'from-purple-500 to-pink-500', gradient: 'from-purple-600 to-pink-500' },
    { href: '/customer/favorites', label: 'Favorites', icon: Heart, color: 'from-red-500 to-rose-500', gradient: 'from-red-600 to-rose-500' },
    { href: '/customer/profile', label: 'Profile', icon: User, color: 'from-green-500 to-emerald-500', gradient: 'from-green-600 to-emerald-500' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-950 dark:to-purple-950">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-blue-500 animate-pulse" />
            </div>
          </div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Loading your experience...</p>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 dark:from-gray-900 dark:via-blue-950/50 dark:to-purple-950/50">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-20 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 -right-20 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-400/10 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* iPhone-style Dynamic Island Header */}
      <div className="sticky top-0 z-50 px-4 pt-4 pb-2">
        <div className="max-w-2xl mx-auto w-full">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-gray-800/50"
          >
            <div className="h-14 px-4 flex items-center justify-between">
              <Link href="/customer" className="flex items-center gap-3 group">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-xl shadow-lg"
                >
                  <ChefHat className="w-5 h-5 text-white" />
                </motion.div>
                <div>
                  <h1 className="font-bold text-gray-900 dark:text-white bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    amazooh.com

                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Order Online</p>
                </div>
              </Link>

              <div className="flex items-center gap-2">
                {/* Notification Bell */}
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative rounded-full hover:bg-gray-100/80 dark:hover:bg-gray-800/80 backdrop-blur-sm"
                  >
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  </Button>
                </motion.div>

                {/* Menu Button */}
                <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                  <SheetTrigger asChild>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full hover:bg-gray-100/80 dark:hover:bg-gray-800/80 backdrop-blur-sm"
                      >
                        <Menu className="w-5 h-5" />
                      </Button>
                    </motion.div>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-80 p-0 rounded-l-3xl bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-900 dark:to-blue-950/50 backdrop-blur-xl border-l border-white/20">
                    <div className="h-full flex flex-col">
                      {/* Profile Header */}
                      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6 rounded-b-3xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-black/20" />
                        <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/20 rounded-full blur-3xl" />
                        <div className="relative z-10">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", damping: 15 }}
                            className="w-20 h-20 bg-gradient-to-br from-white/30 to-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm mb-3"
                          >
                            <User className="w-10 h-10 text-white" />
                          </motion.div>
                          <div>
                            <p className="text-white/80 text-sm">Welcome back,</p>
                            <p className="text-white font-bold text-2xl">{customerName}</p>
                          </div>
                        </div>
                      </div>

                      {/* Navigation */}
                      <div className="flex-1 px-4 py-6 space-y-2">
                        {navItems.map((item, index) => {
                          const isActive = pathname === item.href;
                          return (
                            <motion.div
                              key={item.href}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <Link href={item.href} onClick={() => setIsMenuOpen(false)}>
                                <motion.div
                                  whileHover={{ scale: 1.02, x: 4 }}
                                  whileTap={{ scale: 0.98 }}
                                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${isActive
                                      ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg`
                                      : 'hover:bg-white/50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300 backdrop-blur-sm'
                                    }`}
                                >
                                  <item.icon className="w-5 h-5" />
                                  <span className="font-medium">{item.label}</span>
                                  {isActive && (
                                    <motion.div
                                      layoutId="active-indicator"
                                      className="ml-auto w-1.5 h-1.5 bg-white rounded-full"
                                    />
                                  )}
                                </motion.div>
                              </Link>
                            </motion.div>
                          );
                        })}
                      </div>

                      {/* Logout Button */}
                      <div className="p-4 border-t border-gray-200/50 dark:border-gray-800/50">
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 rounded-2xl text-red-600 hover:text-red-700 hover:bg-red-50/80 dark:hover:bg-red-900/30 h-12"
                            onClick={handleLogout}
                          >
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">Sign Out</span>
                          </Button>
                        </motion.div>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative z-10">
        <div className="max-w-2xl mx-auto w-full px-4 py-6">
          {children}
        </div>
      </main>

      {/* iPhone-style Home Indicator */}
      <div className="pb-2 flex justify-center relative z-10">
        <div className="w-32 h-1 bg-gray-400/50 dark:bg-gray-600/50 rounded-full" />
      </div>
    </div>
  );
}