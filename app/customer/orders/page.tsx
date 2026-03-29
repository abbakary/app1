'use client';

import { useRestaurant } from '@/hooks/use-restaurant-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ExternalLink, Copy, Check, Share2, QrCode, Sparkles, Crown, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth-context';
import { motion, AnimatePresence } from 'framer-motion';

export function CustomerPortalCard() {
  const { restaurantId } = useAuth();
  const { data: restaurant, isLoading } = useRestaurant(restaurantId || undefined);
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState('');
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  const portalUrl = restaurant?.portalUrl || restaurant?.customerPortalUrl;
  const customerPortalLink = portalUrl && origin ? `${origin}/${portalUrl}` : null;

  const handleCopyLink = () => {
    if (customerPortalLink) {
      navigator.clipboard.writeText(customerPortalLink);
      setCopied(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenPortal = () => {
    if (customerPortalLink) {
      window.open(customerPortalLink, '_blank');
    }
  };

  const handleShare = async () => {
    if (customerPortalLink && navigator.share) {
      try {
        await navigator.share({
          title: 'Restaurant Order Portal',
          text: 'Place your order online!',
          url: customerPortalLink,
        });
      } catch (err) {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="rounded-3xl border-0 shadow-xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 dark:from-blue-500/5 dark:via-purple-500/5 dark:to-pink-500/5 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Customer Portal
            </CardTitle>
            <CardDescription className="text-base">Share with your customers to place orders</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center py-12">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (!customerPortalLink) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="rounded-3xl border-0 shadow-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              Customer Portal
            </CardTitle>
            <CardDescription className="text-base">Share with your customers to place orders</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl p-6 text-center border border-yellow-200 dark:border-yellow-800">
              <Sparkles className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
              <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                Portal URL not configured
              </p>
              <p className="text-xs text-yellow-600 dark:text-yellow-300 mt-1">
                Please contact your administrator to set up your customer portal
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card className="rounded-3xl border-0 shadow-xl overflow-hidden relative group bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 opacity-10 dark:opacity-20 animate-gradient" />
        
        {/* Glow Effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
        
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Customer Portal
              </CardTitle>
              <CardDescription className="text-base mt-1">
                Share with your customers to place orders
              </CardDescription>
            </div>
            <motion.div
              animate={{ rotate: isHovered ? 360 : 0 }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-2xl shadow-lg"
            >
              <Crown className="w-5 h-5 text-white" />
            </motion.div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-5 relative">
          {/* Portal Link Display */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Portal Link
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  readOnly
                  value={customerPortalLink}
                  className="flex-1 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-gray-200 dark:border-gray-700 text-sm rounded-2xl pr-10 font-mono"
                />
                <AnimatePresence>
                  {copied && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      <Check className="h-4 w-4 text-green-500" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyLink}
                className="flex-shrink-0 rounded-xl border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleShare}
                className="flex-shrink-0 rounded-xl border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleOpenPortal}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 h-12"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Portal
            </Button>
            <Button
              variant="outline"
              onClick={handleCopyLink}
              className="rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 h-12"
            >
              <QrCode className="h-4 w-4 mr-2" />
              Generate QR
            </Button>
          </div>

          {/* Instructions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-4 space-y-2 border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-sm text-gray-900 dark:text-white">Quick Share Tips</span>
            </div>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-blue-600 dark:text-blue-400">1</span>
                </div>
                <p>Copy link and share via <strong>SMS, WhatsApp, or Email</strong></p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-blue-600 dark:text-blue-400">2</span>
                </div>
                <p>Generate QR code for <strong>in-restaurant scanning</strong></p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-blue-600 dark:text-blue-400">3</span>
                </div>
                <p>Portal works seamlessly on <strong>all devices</strong> with mobile-first design</p>
              </div>
            </div>
          </motion.div>

          {/* Status Badge */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Portal Active</span>
            </div>
            <div className="text-xs text-gray-400 dark:text-gray-500">
              v2.0 • Optimized for iOS
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}