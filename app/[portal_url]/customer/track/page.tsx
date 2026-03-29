'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Clock, 
  ChevronRight, 
  Package, 
  Bike, 
  CheckCircle,
  AlertCircle,
  Navigation,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Order {
  id: string;
  customer_id: string;
  order_type: string;
  approval_status: string;
  status: string;
  total: number;
  created_at: string;
  delivery_address?: string;
}

export default function CustomerTrackDashboard() {
  const router = useRouter();
  const params = useParams();
  const portalUrl = params.portal_url as string;

  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const restaurantId = typeof window !== 'undefined' ? localStorage.getItem('customer_restaurant_id') : '';
  const auth = typeof window !== 'undefined' ? localStorage.getItem('customer_auth') : null;
  const customerId = auth ? JSON.parse(auth).user_id : null;

  useEffect(() => {
    fetchActiveOrders();
    const interval = setInterval(fetchActiveOrders, 15000); // Polling every 15s
    return () => clearInterval(interval);
  }, []);

  const fetchActiveOrders = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/orders`, {
        headers: {
          'X-Restaurant-ID': restaurantId || '',
        },
      });

      if (res.ok) {
        const data = await res.json();
        // Filter for this customer's orders that are NOT completed/cancelled
        const filtered = data.filter((order: Order) => 
          order.customer_id === customerId && 
          !['paid', 'cancelled', 'rejected'].includes(order.status) &&
          order.approval_status !== 'rejected'
        );
        setActiveOrders(filtered.sort((a: Order, b: Order) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ));
      }
    } catch (err) {
      console.error('Failed to load active orders');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-gray-400 font-medium italic">Finding your active orders...</p>
      </div>
    );
  }

  if (activeOrders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
        <div className="w-24 h-24 bg-orange-50 dark:bg-orange-900/10 rounded-[40px] flex items-center justify-center mb-8 border border-orange-100 dark:border-orange-800/30">
          <Navigation className="w-10 h-10 text-primary/40" />
        </div>
        <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight mb-2">
          No Active Orders
        </h3>
        <p className="text-gray-500 font-medium max-w-[280px] leading-relaxed mb-10">
          You don't have any orders currently being prepared or delivered.
        </p>
        <Button
          onClick={() => router.push(`/${portalUrl}/customer`)}
          className="h-16 px-10 bg-primary hover:bg-primary/90 text-white font-black rounded-[24px] shadow-xl shadow-primary/20 active:scale-95 transition-all"
        >
          Order Something Tasty
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-32 px-5">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Active Tracking</h1>
        <p className="text-gray-500 font-medium text-sm">Real-time updates on your deliciousness</p>
      </div>

      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {activeOrders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              layout
            >
              <Card 
                className="premium-card overflow-hidden group hover:shadow-2xl transition-all duration-500 cursor-pointer border-none"
                onClick={() => router.push(`/${portalUrl}/customer/track/${order.id}`)}
              >
                <CardContent className="p-0">
                  <div className="p-6">
                     <div className="flex items-center justify-between mb-6">
                        <div className="flex flex-col">
                           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">
                              Status
                           </span>
                           <h4 className="text-xl font-black text-primary capitalize tracking-tight">
                              {order.status === 'pending' ? 'Preparing Order' : 
                               order.status === 'preparing' ? 'In the Kitchen' : 
                               order.status === 'ready' ? 'Ready for Pickup' : 
                               order.status}
                           </h4>
                        </div>
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                           {order.status === 'ready' ? <Package className="w-7 h-7" /> : <Bike className="w-7 h-7 animate-bounce" />}
                        </div>
                     </div>

                     {/* Progress Visual */}
                     <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-8">
                        <motion.div 
                           className="h-full bg-primary"
                           initial={{ width: '10%' }}
                           animate={{ 
                              width: order.status === 'pending' ? '30%' : 
                                     order.status === 'preparing' ? '60%' : 
                                     order.status === 'ready' ? '90%' : '100%' 
                           }}
                           transition={{ duration: 1, ease: 'easeOut' }}
                        />
                     </div>

                     <div className="grid grid-cols-2 gap-6 pt-2">
                        <div className="flex flex-col">
                           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Order Type</span>
                           <div className="flex items-center gap-1.5 capitalize font-bold text-sm text-gray-700 dark:text-gray-300">
                              <MapPin className="w-3.5 h-3.5 text-primary" />
                              {order.order_type}
                           </div>
                        </div>
                        <div className="flex flex-col items-end">
                           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Amount</span>
                           <span className="text-sm font-black text-gray-900 dark:text-white">TSH {order.total.toLocaleString()}</span>
                        </div>
                     </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 flex items-center justify-between group-hover:bg-primary/5 transition-colors">
                     <span className="text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                        Tap for detailed tracking
                     </span>
                     <ChevronRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Quick Help Card */}
      <div className="bg-gradient-to-br from-gray-900 to-black rounded-[36px] p-8 text-white relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
         <h4 className="text-xl font-black mb-2 tracking-tight">Need Help?</h4>
         <p className="text-white/60 text-sm font-medium leading-relaxed mb-6">
            If you have any issues with your order, our 24/7 support is here to help you.
         </p>
         <Button className="w-full h-14 bg-white text-black hover:bg-white/90 font-black rounded-2xl shadow-lg transition-all active:scale-95">
            Contact Support
         </Button>
      </div>
    </div>
  );
}
