'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Copy, Download, Share2, MapPin, Phone, Clock, ChefHat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';

interface OrderCouponProps {
  order: {
    id: string;
    couponCode: string;
    total: number;
    orderType: string;
    createdAt: string;
    restaurantName: string;
  };
}

export function OrderCoupon({ order }: OrderCouponProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(order.couponCode);
    toast.success('Coupon code copied!');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="relative bg-white dark:bg-gray-900 rounded-[40px] overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800">
        {/* Top Section - Brand & Success */}
        <div className="bg-blue-600 p-8 text-center text-white relative">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-[length:20px_20px]" />
          </div>
          
          <div className="relative z-10 flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-2">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-black tracking-tight">Order Confirmed!</h2>
            <p className="text-blue-100 font-medium text-sm">
              Show this identity to the restaurant to receive your order.
            </p>
          </div>
        </div>

        {/* Coupon Body */}
        <div className="p-8 space-y-8 relative">
          {/* Decorative Punches */}
          <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-[#F2F2F7] dark:bg-black rounded-full" />
          <div className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-[#F2F2F7] dark:bg-black rounded-full" />
          
          {/* Identity/Coupon Code Section */}
          <div className="text-center space-y-4 pt-4">
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Your Order Identity</p>
            <div className="flex flex-col items-center gap-6">
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-[32px] border border-gray-100 dark:border-gray-700 shadow-inner">
                <QRCodeSVG 
                  value={order.couponCode} 
                  size={160}
                  level="H"
                  includeMargin={false}
                  className="dark:opacity-90"
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-4xl font-black tracking-tighter text-gray-900 dark:text-white">
                  {order.couponCode}
                </span>
                <button 
                  onClick={handleCopy}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors active:scale-90"
                >
                  <Copy className="w-5 h-5 text-blue-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Order Brief */}
          <div className="grid grid-cols-2 gap-4 border-t border-dashed border-gray-200 dark:border-gray-800 pt-8">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Restaurant</p>
              <p className="font-bold text-gray-900 dark:text-white text-[15px] truncate">{order.restaurantName}</p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Total Amount</p>
              <p className="font-bold text-blue-600 text-[15px]">TSH {order.total.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Order Type</p>
              <div className="flex items-center gap-1.5 font-bold text-gray-900 dark:text-white text-[15px]">
                <ChefHat className="w-3.5 h-3.5 text-blue-600" />
                <span className="capitalize">{order.orderType}</span>
              </div>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Order ID</p>
              <p className="font-bold text-gray-900 dark:text-white text-[15px]">#{order.id.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-8 pb-8 flex gap-3">
          <Button 
            variant="outline" 
            className="flex-1 h-14 rounded-2xl border-gray-200 dark:border-gray-800 font-bold active:scale-95 transition-all"
          >
            <Download className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button 
            className="flex-1 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>
      
      <p className="text-center mt-6 text-xs font-medium text-gray-400 max-w-[280px] mx-auto leading-relaxed">
        Present this coupon at the counter or to the delivery person to verify your identity.
      </p>
    </motion.div>
  );
}
