'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ChefHat, ArrowRight, QrCode } from 'lucide-react';
import { motion } from 'framer-motion';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function OrderPage() {
  const router = useRouter();
  const [restaurantId, setRestaurantId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!restaurantId.trim()) {
      toast.error('Please enter a restaurant ID or code');
      return;
    }

    setIsLoading(true);
    try {
      // Verify restaurant exists
      const res = await fetch(`${BASE_URL}/api/restaurants/${restaurantId}`, {
        headers: {
          'X-Restaurant-ID': restaurantId,
        },
      });

      if (!res.ok) {
        toast.error('Restaurant not found. Please check your code.');
        setIsLoading(false);
        return;
      }

      // Redirect to customer auth with restaurant ID
      router.push(`/customer/auth?restaurant=${restaurantId}`);
    } catch (err) {
      toast.error('Unable to verify restaurant. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-black dark:via-gray-950 dark:to-black flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-50%] right-[-20%] w-[500px] h-[500px] bg-gradient-to-br from-blue-200/30 to-cyan-200/30 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-full blur-3xl" />
        <div className="absolute bottom-[-50%] left-[-20%] w-[500px] h-[500px] bg-gradient-to-tr from-blue-200/30 to-purple-200/30 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 px-6 py-8 text-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="inline-block bg-white/20 backdrop-blur-xl p-4 rounded-2xl border border-white/30 mb-4"
            >
              <ChefHat className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold text-white mb-2">amazooh.com</h1>

            <p className="text-white/90 text-sm">Order Your Favorite Meals Online</p>
          </div>

          <CardContent className="pt-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="restaurant-id" className="text-base font-semibold mb-3 block">
                  Enter Restaurant Code
                </Label>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Ask your restaurant staff for a code or scan the QR code
                </p>
                <Input
                  id="restaurant-id"
                  type="text"
                  placeholder="Enter restaurant code"
                  value={restaurantId}
                  onChange={(e) => setRestaurantId(e.target.value)}
                  disabled={isLoading}
                  className="h-12 rounded-2xl text-lg font-semibold tracking-wider placeholder:text-gray-400 uppercase"
                  autoComplete="off"
                  autoFocus
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading || !restaurantId.trim()}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-semibold rounded-2xl flex items-center justify-center gap-2 transition-all"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </form>

            {/* Info Section */}
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">How it works</h3>
              <div className="space-y-3">
                {[
                  { num: '1', title: 'Enter Code', desc: 'Get the restaurant code from your server' },
                  { num: '2', title: 'Browse Menu', desc: 'Select your favorite dishes' },
                  { num: '3', title: 'Place Order', desc: 'Order for dine-in, delivery, or pickup' },
                  { num: '4', title: 'Track Status', desc: 'Real-time updates on your order' },
                ].map((step) => (
                  <div key={step.num} className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white flex items-center justify-center text-sm font-bold">
                      {step.num}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <p className="text-center text-xs text-gray-500 dark:text-gray-500 mt-8">
              Your data is secure and encrypted. © 2026 amazooh.com

            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
