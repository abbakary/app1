'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Utensils, ChefHat, Settings, Globe, LogOut } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, logout } = useAuth();

  // Handle authentication redirects
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const portals = [
    {
      title: 'Reception',
      description: 'Manage tables, create orders, and process payments',
      icon: Utensils,
      href: '/reception',
      roles: ['admin', 'reception'],
      color: 'bg-status-available',
    },
    {
      title: 'Kitchen',
      description: 'View and manage incoming orders',
      icon: ChefHat,
      href: '/kitchen',
      roles: ['admin', 'kitchen'],
      color: 'bg-status-ready',
    },
    {
      title: 'Admin',
      description: 'Manage menu, tables, users, and view reports',
      icon: Settings,
      href: '/admin',
      roles: ['admin'],
      color: 'bg-primary',
    },
    {
      title: 'Platform Admin',
      description: 'Manage all organizations on the platform',
      icon: Globe,
      href: '/sysadmin',
      roles: ['sysadmin'],
      color: 'bg-indigo-600',
    },
  ];

  const accessiblePortals = portals.filter(portal =>
    portal.roles.includes(user?.role || '')
  );

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black py-4">amazooh.com</h1>
            <p className="text-sm text-muted-foreground">Restaurant Management System</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-medium text-foreground">{user?.name}</p>
              <p className="text-sm text-muted-foreground capitalize">{user?.role}</p>
            </div>
            <Button variant="outline" size="icon" onClick={logout}>
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-2">Select Portal</h2>
          <p className="text-muted-foreground">Choose where you want to work today</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
          {accessiblePortals.map((portal) => {
            const Icon = portal.icon;
            return (
              <Card
                key={portal.href}
                className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 border-2 hover:border-primary"
                onClick={() => router.push(portal.href)}
              >
                <CardHeader className="text-center pb-2">
                  <div className={`w-16 h-16 ${portal.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">{portal.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-base">
                    {portal.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {accessiblePortals.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No portals available for your role.</p>
          </div>
        )}
      </div>
    </main>
  );
}
