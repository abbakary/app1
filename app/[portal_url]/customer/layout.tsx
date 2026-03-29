'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Menu, LogOut, Clock, ChefHat } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';
import { PWAInstallPrompt } from '@/components/pwa-install-prompt';
import { useServiceWorker } from '@/hooks/use-service-worker';
import { BottomNav } from '@/components/portal/BottomNav';

interface RestaurantConfig {
  restaurant_id: string;
  name: string;
  logo_url?: string;
  customer_portal_url: string;
  address?: string;
  phone?: string;
  email?: string;
}

export default function PortalCustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const params = useParams();
  const portalUrl = params.portal_url as string;

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [restaurant, setRestaurant] = useState<RestaurantConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Register service worker for PWA functionality
  useServiceWorker();

  useEffect(() => {
    if (!isMounted || !portalUrl) return;

    const auth = localStorage.getItem('customer_auth');
    const storedPortalUrl = localStorage.getItem('customer_portal_url');

    // Verify auth matches current portal
    if (!auth || storedPortalUrl !== portalUrl) {
      router.replace(`/${portalUrl}/auth`);
      return;
    }

    try {
      const data = JSON.parse(auth);
      setCustomerName(data.name || 'Customer');
      setIsAuthenticated(true);
    } catch {
      router.replace(`/${portalUrl}/auth`);
    }
  }, [portalUrl, router, isMounted]);

  useEffect(() => {
    const fetchRestaurantConfig = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/restaurants/portal/${portalUrl}`
        );

        if (res.ok) {
          const data = await res.json();
          setRestaurant(data);
        }
      } catch (err) {
        console.error('Failed to fetch restaurant config:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchRestaurantConfig();
    }
  }, [portalUrl, isAuthenticated]);

  const handleLogout = () => {
    localStorage.removeItem('customer_auth');
    localStorage.removeItem('customer_portal_url');
    localStorage.removeItem('customer_restaurant_id');
    toast.success('Logged out successfully');
    router.push(`/${portalUrl}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 font-medium italic">Syncing your experience...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col bg-[#F2F2F7] dark:bg-black font-sans selection:bg-blue-100 dark:selection:bg-blue-900/30">
      <PWAInstallPrompt />

      {/* iPhone-style Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-900/50">
        <div className="h-[72px] px-5 flex items-center justify-between max-w-2xl mx-auto w-full">
          <Link href={`/${portalUrl}/customer`} className="flex items-center gap-3 active:opacity-70 transition-opacity">
            <div className="relative group">
              {restaurant?.logo_url ? (
                <div className="w-11 h-11 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                  <Image
                    src={restaurant.logo_url.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${restaurant.logo_url}` : restaurant.logo_url}
                    alt={restaurant.name}
                    width={44}
                    height={44}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-11 h-11 bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center rounded-xl shadow-md">
                  <ChefHat className="w-6 h-6 text-white" />
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <h1 className="font-bold text-gray-900 dark:text-white text-[15px] leading-tight line-clamp-1 tracking-tight">
                {restaurant?.name || 'Restaurant'}
              </h1>
              <p className="text-[11px] font-black text-primary dark:text-primary uppercase tracking-widest">
                Order Online
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
              <span className="text-primary font-black text-sm">{customerName.charAt(0)}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto overflow-x-hidden pt-4 pb-24">
        <div className="max-w-2xl mx-auto w-full">
          {children}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
