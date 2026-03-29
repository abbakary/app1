'use client';

import { useParams, usePathname, useRouter } from 'next/navigation';
import { UtensilsCrossed, ClipboardList, MapPin, User } from 'lucide-react';
import { motion } from 'framer-motion';

export function BottomNav() {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const portalUrl = params.portal_url as string;

  const navItems = [
    {
      label: 'Menu',
      icon: UtensilsCrossed,
      path: `/${portalUrl}/customer`,
      badge: 'N', // Mocking the badge seen in the screenshot
    },
    {
      label: 'Orders',
      icon: ClipboardList,
      path: `/${portalUrl}/customer/orders`,
      badge: null,
    },
    {
      label: 'Track',
      icon: MapPin,
      path: `/${portalUrl}/customer/track`,
      badge: null,
    },
    {
      label: 'Profile',
      icon: User,
      path: `/${portalUrl}/customer/profile`,
      badge: null,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bottom-nav-blur safe-area-bottom shadow-[0_-8px_30px_rgb(0,0,0,0.12)]">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.path || (item.label === 'Menu' && pathname === `/${portalUrl}/customer`);
          const Icon = item.icon;

          return (
            <button
              key={item.label}
              onClick={() => router.push(item.path)}
              className="relative flex flex-col items-center justify-center w-full h-full gap-1 transition-all duration-300 active:scale-95"
            >
              <div className={`relative p-1 rounded-xl transition-all duration-300 ${isActive ? 'text-primary' : 'text-gray-400'}`}>
                <Icon className={`w-6 h-6 ${isActive ? 'fill-primary/10' : ''}`} />

                {/* Notification Badge */}
                {item.badge && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-black text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-gray-900"
                  >
                    {item.badge}
                  </motion.div>
                )}

                {isActive && (
                  <motion.div
                    layoutId="nav-glow"
                    className="absolute inset-0 bg-primary/10 blur-md rounded-full"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? 'text-primary' : 'text-gray-400'}`}>
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="active-indicator"
                  className="absolute top-0 w-8 h-1 bg-primary rounded-full shadow-[0_0_15px_rgba(255,107,0,0.6)]"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
