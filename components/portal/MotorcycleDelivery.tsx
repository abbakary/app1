'use client';

import { motion } from 'framer-motion';
import { Bike } from 'lucide-react';
import Image from 'next/image';

interface MotorcycleDeliveryProps {
  isActive?: boolean;
  position?: 'left' | 'center' | 'right';
  size?: 'sm' | 'md' | 'lg';
}

export function MotorcycleDelivery({
  isActive = true,
  position = 'center',
  size = 'md',
}: MotorcycleDeliveryProps) {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };

  const positionClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  };

  return (
    <div className={`flex ${positionClasses[position]} items-center`}>
      {isActive ? (
        // Animated motorcycle with vehicle illustration
        <motion.div
          className={`${sizeClasses[size]} bg-gradient-to-br from-primary to-orange-600 rounded-[20px] shadow-xl flex items-center justify-center border-2 border-white dark:border-gray-900 relative overflow-hidden`}
          animate={{
            y: [0, -8, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {/* Motorcycle Icon */}
          <div className="relative flex items-center justify-center">
            <motion.div
              animate={{ rotate: [0, 5, 0, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Bike className="w-6 h-6 text-white" />
            </motion.div>

            {/* Speed Lines */}
            <motion.div
              className="absolute -left-2 w-2 h-2 bg-white rounded-full opacity-60"
              animate={{ x: [-8, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
            <motion.div
              className="absolute -left-4 w-1.5 h-1.5 bg-white rounded-full opacity-40"
              animate={{ x: [-12, 0] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
            />
          </div>

          {/* Glow Effect */}
          <motion.div
            className="absolute inset-0 bg-white rounded-[20px] opacity-0"
            animate={{
              boxShadow: [
                '0 0 10px rgba(255, 107, 0, 0.3)',
                '0 0 20px rgba(255, 107, 0, 0.5)',
                '0 0 10px rgba(255, 107, 0, 0.3)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      ) : (
        // Inactive motorcycle
        <div className={`${sizeClasses[size]} bg-gray-200 dark:bg-gray-800 rounded-[20px] shadow-md flex items-center justify-center border-2 border-gray-300 dark:border-gray-700`}>
          <Bike className="w-6 h-6 text-gray-400" />
        </div>
      )}
    </div>
  );
}

// Alternative component with more realistic motorcycle illustration
export function MotorcycleDeliveryIllustration({
  isActive = true,
  size = 'md',
}: {
  isActive?: boolean;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeMap = {
    sm: 48,
    md: 80,
    lg: 120,
  };

  const s = sizeMap[size];

  return (
    <motion.svg
      width={s}
      height={s}
      viewBox="0 0 100 100"
      className={isActive ? '' : 'opacity-40'}
      animate={
        isActive
          ? {
              y: [0, -6, 0],
            }
          : {}
      }
      transition={
        isActive
          ? {
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }
          : {}
      }
    >
      {/* Wheels */}
      <circle cx="25" cy="75" r="12" fill="#FF6B00" />
      <circle cx="75" cy="75" r="12" fill="#FF6B00" />

      {/* Wheel centers */}
      <circle cx="25" cy="75" r="4" fill="#000" />
      <circle cx="75" cy="75" r="4" fill="#000" />

      {/* Frame */}
      <line x1="25" y1="75" x2="40" y2="45" stroke="#FF6B00" strokeWidth="3" />
      <line x1="75" y1="75" x2="60" y2="45" stroke="#FF6B00" strokeWidth="3" />
      <line x1="40" y1="45" x2="60" y2="45" stroke="#FF6B00" strokeWidth="3" />

      {/* Seat */}
      <rect x="42" y="35" width="16" height="8" rx="2" fill="#FF6B00" />

      {/* Handlebars */}
      <line x1="50" y1="40" x2="45" y2="30" stroke="#FF6B00" strokeWidth="2" />
      <line x1="50" y1="40" x2="55" y2="30" stroke="#FF6B00" strokeWidth="2" />
      <circle cx="45" cy="28" r="3" fill="#000" />
      <circle cx="55" cy="28" r="3" fill="#000" />

      {/* Speed indicator */}
      {isActive && (
        <>
          <motion.line
            x1="15"
            y1="50"
            x2="10"
            y2="50"
            stroke="#FF6B00"
            strokeWidth="2"
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.6, repeat: Infinity }}
          />
          <motion.line
            x1="15"
            y1="60"
            x2="5"
            y2="60"
            stroke="#FF6B00"
            strokeWidth="2"
            animate={{ opacity: [0, 1] }}
            transition={{ duration: 0.6, repeat: Infinity }}
          />
        </>
      )}
    </motion.svg>
  );
}
