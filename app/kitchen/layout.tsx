'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Home, LogOut, Volume2, VolumeX } from 'lucide-react';
import { useUnreadNotifications } from '@/hooks/use-restaurant-data';
import { playNotificationSound } from '@/lib/notification-sounds';

export default function KitchenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout, hasRole } = useAuth();
  const { data: unreadNotifications = [] } = useUnreadNotifications();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastPlayedNotifications, setLastPlayedNotifications] = useState<string[]>([]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    } else if (!isLoading && !hasRole(['admin', 'kitchen'])) {
      router.push('/');
    }
  }, [isLoading, isAuthenticated, hasRole, router]);

  // Play sound for new orders and order updates
  useEffect(() => {
    if (!soundEnabled) return;

    const newNotifications = unreadNotifications.filter(
      n => !lastPlayedNotifications.includes(n.id)
    );

    newNotifications.forEach(notification => {
      if (notification.type === 'new_order') {
        playNotificationSound('order_received');
      } else if (notification.type === 'order_modified') {
        playNotificationSound('order_updated');
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

  const newOrderCount = unreadNotifications.filter(n => n.type === 'new_order').length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.push('/')}>
              <Home className="h-5 w-5" />
              <span className="sr-only">Home</span>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                Kitchen Display
                {newOrderCount > 0 && (
                  <span className="px-3 py-1 bg-status-occupied text-white text-sm font-bold rounded-full animate-pulse">
                    {newOrderCount} new
                  </span>
                )}
              </h1>
              <p className="text-xs text-muted-foreground">Order Management</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className={`rounded-full transition-colors ${soundEnabled ? 'bg-primary/10' : 'text-muted-foreground'}`}
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Mute notifications' : 'Unmute notifications'}
            >
              {soundEnabled ? (
                <Volume2 className="h-5 w-5" />
              ) : (
                <VolumeX className="h-5 w-5" />
              )}
              <span className="sr-only">{soundEnabled ? 'Mute' : 'Unmute'} sounds</span>
            </Button>

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

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
