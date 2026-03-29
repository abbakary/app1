'use client';

import { useState, useEffect } from 'react';
import type { Table, Order } from '@/lib/types';
import { TableGrid } from '@/components/reception/table-grid';
import { OrderPanel } from '@/components/reception/order-panel';
import { PaymentDialog } from '@/components/reception/payment-dialog';
import { ReceiptDialog } from '@/components/reception/receipt-dialog';
import { useStats } from '@/hooks/use-restaurant-data';
import { Card, CardContent } from '@/components/ui/card';
import { Users, ClipboardList, DollarSign, Clock, Menu, ExternalLink, Globe } from 'lucide-react';
import { CustomerPortalCard } from '@/components/customer-portal-card';
import { CustomerOrdersPanel } from '@/components/reception/customer-orders-panel';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/auth-context';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function ReceptionPage() {
  const { restaurantId } = useAuth();
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [paymentOrder, setPaymentOrder] = useState<Order | null>(null);
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);
  const [showPortalSheet, setShowPortalSheet] = useState(false);
  const [onlineOrderCount, setOnlineOrderCount] = useState(0);
  const { data: stats } = useStats();

  useEffect(() => {
    if (!restaurantId) return;

    const fetchOnlineCount = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/orders/pending-approval`, {
          headers: { 'X-Restaurant-ID': restaurantId }
        });
        if (res.ok) {
          const data = await res.json();
          setOnlineOrderCount(data.length);
        }
      } catch (err) {
        console.error('Failed to fetch online order count');
      }
    };

    fetchOnlineCount();
    const interval = setInterval(fetchOnlineCount, 10000);
    return () => clearInterval(interval);
  }, [restaurantId]);

  const handleSelectTable = (table: Table) => {
    setSelectedTable(table);
  };

  const handleClosePanel = () => {
    setSelectedTable(null);
  };

  const handlePayment = (order: Order) => {
    setPaymentOrder(order);
  };

  const handlePaymentComplete = (order: Order) => {
    setPaymentOrder(null);
    setReceiptOrder(order);
    setSelectedTable(null);
  };

  const statCards = [
    {
      label: 'Pending Approval',
      value: stats?.pendingApprovalOrders || 0,
      icon: Globe,
      bgGradient: 'from-orange-400 to-orange-600',
      iconBg: 'bg-white/20',
      textColor: 'text-white',
    },
    {
      label: 'Active Orders',
      value: (stats?.pendingOrders || 0) + (stats?.preparingOrders || 0),
      icon: ClipboardList,
      bgGradient: 'from-blue-500 to-indigo-600',
      iconBg: 'bg-white/20',
      textColor: 'text-white',
    },
    {
      label: 'Completed Today',
      value: stats?.completedToday || 0,
      icon: Clock,
      bgGradient: 'from-emerald-400 to-teal-500',
      iconBg: 'bg-white/20',
      textColor: 'text-white',
    },
    {
      label: "Today's Sales",
      value: `TSH ${(stats?.todaySales || 0).toLocaleString()}`,
      icon: DollarSign,
      bgGradient: 'from-purple-500 to-pink-600',
      iconBg: 'bg-white/20',
      textColor: 'text-white',
    },
  ];

  return (
    <div className="flex h-full">
      {/* Main Table Grid */}
      <div className="flex-1 flex flex-col w-full h-full relative">
        {/* Stats Bar */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-xl">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 flex-1">
                {statCards.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={stat.label}
                      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${stat.bgGradient} p-5 shadow-lg shadow-slate-200/50 dark:shadow-none transition-transform hover:scale-[1.02] active:scale-95`}
                    >
                      <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                      <div className="flex flex-col h-full justify-between gap-3 relative z-10">
                        <div className="flex items-start justify-between">
                          <div className={`p-2.5 rounded-2xl ${stat.iconBg} backdrop-blur-md shadow-sm`}>
                            <Icon className={`h-6 w-6 ${stat.textColor}`} />
                          </div>
                        </div>
                        <div>
                          <p className="text-4xl font-extrabold text-white tracking-tight mb-1">{stat.value}</p>
                          <p className="text-sm font-medium text-white/80">{stat.label}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Customer Portal Quick Link */}
              <div className="ml-6">
                <Sheet open={showPortalSheet} onOpenChange={setShowPortalSheet}>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      className="rounded-2xl h-full py-8 px-6 flex flex-col gap-2 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40"
                    >
                      <ExternalLink className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      <span className="text-xs font-bold text-blue-700 dark:text-blue-300">PORTAL</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="w-[400px] sm:w-[540px]">
                    <SheetHeader>
                      <SheetTitle>Customer Portal</SheetTitle>
                      <SheetDescription>
                        Access and share your restaurant's online ordering portal.
                      </SheetDescription>
                    </SheetHeader>
                    <div className="py-6">
                      <CustomerPortalCard />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area with Tabs */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <Tabs defaultValue="tables" className="flex-1 flex flex-col">
            <div className="px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <TabsList className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-1 h-12">
                <TabsTrigger
                  value="tables"
                  className="rounded-xl px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm font-bold text-sm transition-all"
                >
                  <Menu className="w-4 h-4 mr-2" />
                  Table Grid
                </TabsTrigger>
                <TabsTrigger
                  value="online"
                  className="rounded-xl px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm font-bold text-sm transition-all relative"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Online Orders
                  {onlineOrderCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg animate-bounce">
                      {onlineOrderCount}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Live Sync Active
              </div>
            </div>

            <TabsContent value="tables" className="flex-1 overflow-auto m-0 p-0">
              <TableGrid
                selectedTableId={selectedTable?.id || null}
                onSelectTable={handleSelectTable}
              />
            </TabsContent>

            <TabsContent value="online" className="flex-1 overflow-auto m-0 bg-slate-50/50 dark:bg-black/20">
              <div className="max-w-5xl mx-auto p-8">
                <CustomerOrdersPanel
                  restaurantId={restaurantId || ''}
                  onOrderApproved={() => {
                    // Could refresh stats here if needed
                  }}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Order Panel Sidebar */}
      {selectedTable && (
        <>
          {/* Mobile backdrop */}
          <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden" onClick={handleClosePanel} />
          {/* Sidebar */}
          <div className="fixed right-0 top-[65px] bottom-0 w-full md:w-[600px] lg:w-[700px] xl:w-[800px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl z-50 animate-in slide-in-from-right-full duration-300">
            <OrderPanel
              table={selectedTable}
              onClose={handleClosePanel}
              onPayment={handlePayment}
            />
          </div>
        </>
      )}

      {/* Payment Dialog */}
      {paymentOrder && (
        <PaymentDialog
          order={paymentOrder}
          open={!!paymentOrder}
          onOpenChange={(open) => !open && setPaymentOrder(null)}
          onComplete={handlePaymentComplete}
        />
      )}

      {/* Receipt Dialog */}
      {receiptOrder && (
        <ReceiptDialog
          order={receiptOrder}
          open={!!receiptOrder}
          onOpenChange={(open) => !open && setReceiptOrder(null)}
        />
      )}
    </div>
  );
}
