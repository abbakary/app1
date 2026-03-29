'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInstallPrompt } from '@/hooks/use-install-prompt';

export function PWAInstallPrompt() {
  const { isIOS, isAndroid, showPrompt, deferredPrompt, handleInstall, handleDismiss } =
    useInstallPrompt();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (showPrompt) {
      // Small delay to ensure component is mounted
      setTimeout(() => setIsVisible(true), 100);
    }
  }, [showPrompt]);

  if (!showPrompt) return null;

  if (isIOS) {
    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 left-4 right-4 max-w-sm mx-auto z-[45] bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-4"
          >
            <div className="flex gap-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                  Install App
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Tap{' '}
                  <svg
                    className="w-3 h-3 inline mx-0.5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M4 12h16M12 4v16" stroke="currentColor" strokeWidth={2} />
                  </svg>
                  then "Add to Home Screen"
                </p>
              </div>
              <button
                onClick={handleDismiss}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mt-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  if (isAndroid && deferredPrompt) {
    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 left-4 right-4 max-w-sm mx-auto z-[45] bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-4"
          >
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                  Install App
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Get instant access - no app store needed
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    handleInstall();
                    setIsVisible(false);
                  }}
                  className="flex-1 h-9 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Install
                </Button>
                <Button
                  onClick={() => {
                    handleDismiss();
                    setIsVisible(false);
                  }}
                  variant="outline"
                  className="flex-1 h-9 text-sm font-semibold"
                >
                  Later
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return null;
}
