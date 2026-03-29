'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Home, Bell, LogOut, Volume2, VolumeX, LayoutGrid, ClipboardList, CreditCard, Users, Sparkles } from 'lucide-react';
import { useUnreadNotifications, useMarkAllNotificationsRead } from '@/hooks/use-restaurant-data';
import { playNotificationSound } from '@/lib/notification-sounds';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';

export default function ReceptionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, logout, hasRole } = useAuth();
  const { data: unreadNotifications = [] } = useUnreadNotifications();
  const markAllRead = useMarkAllNotificationsRead();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastPlayedNotifications, setLastPlayedNotifications] = useState<string[]>([]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    } else if (!isLoading && !hasRole(['admin', 'reception'])) {
      router.push('/');
    }
  }, [isLoading, isAuthenticated, hasRole, router]);

  // Play sound for all important notifications
  useEffect(() => {
    if (!soundEnabled) return;

    const newNotifications = unreadNotifications.filter(
      n => !lastPlayedNotifications.includes(n.id)
    );

    newNotifications.forEach(notification => {
      if (notification.type === 'order_ready' || notification.type === 'order_started') {
        playNotificationSound('order_ready');
      }
    });

    if (newNotifications.length > 0) {
      setLastPlayedNotifications(prev => [
        ...prev,
        ...newNotifications.map(n => n.id)
      ]);
    }
  }, [unreadNotifications, soundEnabled, lastPlayedNotifications]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const orderReadyCount = unreadNotifications.filter(n => n.type === 'order_ready').length;

  const navItems = [
    { href: '/reception', label: 'Tables', icon: LayoutGrid, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { href: '/reception/orders', label: 'Orders', icon: ClipboardList, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { href: '/reception/payments', label: 'Payments', icon: CreditCard, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { href: '/reception/customers', label: 'Customers', icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { href: '/reception/insights', label: 'Insights', icon: Sparkles, color: 'text-fuchsia-500', bg: 'bg-fuchsia-500/10' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-card sticky top-0 z-50 h-[65px]">
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.push('/')}>
              <Home className="h-5 w-5" />
              <span className="sr-only">Home</span>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Reception</h1>
              <p className="text-xs text-muted-foreground">Table & Order Management</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`rounded-full transition-colors ${soundEnabled ? 'bg-primary/10' : 'text-muted-foreground'}`}
              title={soundEnabled ? 'Mute notifications' : 'Unmute notifications'}
            >
              {soundEnabled ? (
                <Volume2 className="h-5 w-5" />
              ) : (
                <VolumeX className="h-5 w-5" />
              )}
              <span className="sr-only">{soundEnabled ? 'Mute' : 'Unmute'} notifications</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="relative rounded-full">
                  <Bell className="h-5 w-5" />
                  {orderReadyCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-status-ready text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                      {orderReadyCount}
                    </span>
                  )}
                  <span className="sr-only">Notifications</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 rounded-2xl">
                <div className="flex items-center justify-between px-4 py-3 border-b">
                  <span className="font-bold text-lg">Notifications</span>
                  {unreadNotifications.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAllRead.mutate()}
                      className="text-xs rounded-lg"
                    >
                      Mark all read
                    </Button>
                  )}
                </div>
                {unreadNotifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-muted-foreground">
                    No new notifications
                  </div>
                ) : (
                  <div className="max-h-96 overflow-y-auto">
                    {unreadNotifications.slice(0, 10).map((notification) => (
                      <DropdownMenuItem key={notification.id} className="flex flex-col items-start py-3 px-4 rounded-lg mx-1 my-1 bg-secondary/50">
                        <span className={`text-sm font-semibold ${
                          notification.type === 'order_ready' ? 'text-status-ready' : 'text-foreground'
                        }`}>
                          {notification.message}
                        </span>
                        <span className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </span>
                      </DropdownMenuItem>
                    ))}
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-foreground">{user?.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
            </div>

            <Button variant="ghost" size="icon" className="rounded-full" onClick={logout}>
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden h-[calc(100vh-65px)]">       {/* Sidebar Navigation */}
        <aside className="w-64 border-r bg-card/50 backdrop-blur-xl hidden md:flex flex-col">
          <nav className="p-4 space-y-2 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} className="block group">
                  <span
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
                      isActive
                        ? `bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 font-semibold ${item.color}`
                        : `text-muted-foreground hover:bg-white/60 dark:hover:bg-gray-800/60 hover:shadow-sm hover:${item.color}`
                    }`}
                  >
                    <div className={`p-2 rounded-xl transition-colors duration-300 ${isActive ? item.bg : `bg-gray-100 dark:bg-gray-800 group-hover:${item.bg}`}`}>
                      <Icon className={`h-5 w-5 ${isActive ? item.color : `text-gray-500 dark:text-gray-400 group-hover:${item.color}`}`} />
                    </div>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden relative">
          {children}
        </main>
      </div>
    </div>
  );
}
