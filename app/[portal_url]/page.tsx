'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { ChefHat, ArrowRight, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface RestaurantConfig {
  restaurant_id: string;
  name: string;
  logo_url?: string;
  customer_portal_url: string;
  address?: string;
  phone?: string;
  email?: string;
}

export default function PortalLandingPage() {
  const params = useParams();
  const router = useRouter();
  const portalUrl = params.portal_url as string;

  const [restaurant, setRestaurant] = useState<RestaurantConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  
  // Splash and redirect state
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const splashWords = ["WELCOME", "DELICIOUS", "GOURMET", "FAST", "ENJOY"];
  const SPLASH_DURATION = 7000; // 7 seconds

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const fetchRestaurantConfig = async () => {
      try {
        const res = await fetch(
          `${BASE_URL}/api/restaurants/portal/${portalUrl}`
        );

        if (!res.ok) {
          throw new Error('Restaurant not found');
        }

        const data = await res.json();
        setRestaurant(data);

        // Store portal URL for use in child routes
        sessionStorage.setItem('customer_portal_url', portalUrl);

        // Word cycling effect
        const wordInterval = setInterval(() => {
          setCurrentWordIndex((prev) => (prev + 1) % splashWords.length);
        }, 1400); // Cycle roughly every 1.4s (5 words in 7s)

        // Redirect after delay
        const redirectTimeout = setTimeout(() => {
          router.push(`/${portalUrl}/auth`);
        }, SPLASH_DURATION);

        return () => {
          clearInterval(wordInterval);
          clearTimeout(redirectTimeout);
        };
      } catch (err) {
        setError('Restaurant not found. Please check the URL.');
        toast.error('Restaurant not found');
        setIsLoading(false);
      } finally {
        // We keep loading true for the splash duration unless there's an error
      }
    };

    fetchRestaurantConfig();
  }, [portalUrl, router]);

  if (error || !restaurant) {
    if (isLoading && !error) return (
        <div className="min-h-screen flex items-center justify-center bg-black">
          <div className="text-center">
            <Loader className="w-10 h-10 animate-spin text-primary mx-auto mb-4 opacity-20" />
          </div>
        </div>
    );

    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="border-0 shadow-2xl rounded-3xl max-w-md w-full bg-gray-900 border-gray-800">
          <CardContent className="p-8 text-center">
            <ChefHat className="w-12 h-12 text-red-500 mx-auto mb-4 opacity-50" />
            <h2 className="text-xl font-bold text-white mb-2">
              Restaurant Not Found
            </h2>
            <p className="text-gray-400 text-sm mb-6">
              {error || 'This restaurant portal does not exist.'}
            </p>
            <Button
              onClick={() => router.push('/')}
              className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-95"
            >
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden font-sans">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <motion.div 
            animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-primary/20 rounded-full blur-[120px]" 
        />
        <motion.div 
            animate={{ 
                scale: [1.2, 1, 1.2],
                opacity: [0.3, 0.4, 0.3]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-orange-600/10 rounded-full blur-[100px]" 
        />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-12 w-full px-8">
        {/* Logo Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative"
        >
          {restaurant.logo_url ? (
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
                filter: ["drop-shadow(0 0 20px rgba(255,107,0,0.2))", "drop-shadow(0 0 40px rgba(255,107,0,0.4))", "drop-shadow(0 0 20px rgba(255,107,0,0.2))"]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="bg-white/5 backdrop-blur-2xl p-8 rounded-[40px] border border-white/10"
            >
              <Image
                src={restaurant.logo_url.startsWith('/static/') ? `${BASE_URL}${restaurant.logo_url}` : restaurant.logo_url}
                alt={restaurant.name}
                width={120}
                height={120}
                className="w-24 h-24 object-contain"
                priority
              />
            </motion.div>
          ) : (
            <div className="w-24 h-24 bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center rounded-[32px] shadow-2xl">
              <ChefHat className="w-12 h-12 text-white" />
            </div>
          )}
        </motion.div>

        {/* Text Section */}
        <div className="text-center space-y-4 h-32 flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <h1 className="text-4xl font-black text-white tracking-widest uppercase mb-2 drop-shadow-2xl">
              {restaurant.name}
            </h1>
          </motion.div>

          {/* Animated Words */}
          <div className="relative h-12 w-full flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.span
                key={splashWords[currentWordIndex]}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: "anticipate" }}
                className="absolute text-2xl font-black text-primary tracking-[0.3em] uppercase drop-shadow-lg"
              >
                {splashWords[currentWordIndex]}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

        {/* Loading/Redirect Indicator */}
        <div className="w-full max-w-[200px] space-y-4">
            <div className="h-[2px] w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 7, ease: "linear" }}
                    className="h-full bg-primary"
                />
            </div>
            <p className="text-center text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
                Authenticating...
            </p>
        </div>
      </div>

      {/* Skip Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        onClick={() => router.push(`/${portalUrl}/auth`)}
        className="absolute bottom-12 right-8 text-white/40 hover:text-white transition-colors flex items-center gap-2 group"
      >
        <span className="text-[11px] font-black uppercase tracking-widest">Skip</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </motion.button>

      {/* Footer Branding */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-3">
        <div className="h-[1px] w-8 bg-white/10" />
        <span className="text-[10px] font-black text-white/10 uppercase tracking-[0.4em]">Premium Portal</span>
        <div className="h-[1px] w-8 bg-white/10" />
      </div>
    </div>
  );
}
