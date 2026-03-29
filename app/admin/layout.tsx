'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Home, LogOut, LayoutDashboard, UtensilsCrossed, Grid3X3, Users, BarChart3, Volume2, VolumeX, Bell, CreditCard, Settings, Bike } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUnreadNotifications, useMarkAllNotificationsRead } from '@/hooks/use-restaurant-data';
import { playNotificationSound } from '@/lib/notification-sounds';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/menu', label: 'Menu', icon: UtensilsCrossed },
  { href: '/admin/tables', label: 'Tables', icon: Grid3X3 },
  { href: '/admin/payments', label: 'Payments', icon: CreditCard },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/drivers', label: 'Drivers', icon: Bike },
  { href: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, logout, hasRole } = useAuth();
  const { data: unreadNotifications = [] } = useUnreadNotifications();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastPlayedNotifications, setLastPlayedNotifications] = useState<string[]>([]);
  const markAllRead = useMarkAllNotificationsRead();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    } else if (!isLoading && !hasRole('admin')) {
      router.push('/');
    }
  }, [isLoading, isAuthenticated, hasRole, router]);

  // Play sound for important notifications
  useEffect(() => {
    if (!soundEnabled) return;

    const newNotifications = unreadNotifications.filter(
      n => !lastPlayedNotifications.includes(n.id)
    );

    newNotifications.forEach(notification => {
      if (notification.type === 'new_order' || notification.type === 'order_ready') {
        playNotificationSound('order_received');
      } else if (notification.type === 'payment_received') {
        playNotificationSound('payment');
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

  const allNotificationsCount = unreadNotifications.length;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r flex flex-col fixed h-full rounded-tr-3xl rounded-br-3xl">
        <div className="p-5 border-b">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.push('/')}>
              <Home className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-bold text-lg text-foreground">Admin Panel</h1>
              <p className="text-xs text-muted-foreground">Management</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t space-y-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full rounded-2xl justify-start" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
                {allNotificationsCount > 0 && (
                  <span className="ml-auto bg-status-occupied text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {allNotificationsCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 rounded-2xl">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <span className="font-bold">Notifications</span>
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
                <div className="max-h-80 overflow-y-auto">
                  {unreadNotifications.slice(0, 10).map((notification) => (
                    <DropdownMenuItem key={notification.id} className="flex flex-col items-start py-3 px-4 rounded-lg mx-1 my-1 bg-secondary/50">
                      <span className="text-sm font-semibold text-foreground">
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

          <Button
            variant="outline"
            size="sm"
            className={`w-full rounded-2xl justify-start ${soundEnabled ? 'bg-primary/10' : ''}`}
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            {soundEnabled ? (
              <Volume2 className="h-4 w-4 mr-2" />
            ) : (
              <VolumeX className="h-4 w-4 mr-2" />
            )}
            {soundEnabled ? 'Mute Alerts' : 'Unmute Alerts'}
          </Button>

          <div className="flex items-center gap-3 pt-2">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-primary font-bold text-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full rounded-2xl text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={logout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
}
