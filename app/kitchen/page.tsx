'use client';

import { useActiveOrders } from '@/hooks/use-restaurant-data';
import { OrderCard } from '@/components/kitchen/order-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ChefHat, Clock, Check, AlertCircle, Utensils } from 'lucide-react';

export default function KitchenPage() {
  const { data: activeOrders = [], isLoading } = useActiveOrders();

  const pendingOrders = activeOrders.filter(o => o.status === 'pending');
  const preparingOrders = activeOrders.filter(o => o.status === 'preparing' || o.status === 'in-progress');
  const readyOrders = activeOrders.filter(o => o.status === 'ready');
  const servedOrders = activeOrders.filter(o => o.status === 'served');

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-72 rounded-3xl bg-muted animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (activeOrders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="w-32 h-32 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mb-8">
          <ChefHat className="h-16 w-16 text-primary" />
        </div>
        <h2 className="text-3xl font-bold text-foreground mb-3">No Active Orders</h2>
        <p className="text-muted-foreground max-w-md text-lg">
          Orders will appear here automatically when reception creates them.
          The display updates in real-time.
        </p>
      </div>
    );
  }

  return (
    <div className="px-6 py-6">
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-7 grid w-full grid-cols-5 rounded-2xl bg-secondary/50 p-1">
          <TabsTrigger value="all" className="gap-1.5 rounded-xl text-xs py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            All
            <Badge variant="secondary" className="text-xs">{activeOrders.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="pending" className="gap-1.5 rounded-xl text-xs py-2 data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground">
            <AlertCircle className="h-3.5 w-3.5" />
            New
            {pendingOrders.length > 0 && (
              <Badge variant="destructive" className="text-xs">{pendingOrders.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="preparing" className="gap-1.5 rounded-xl text-xs py-2 data-[state=active]:bg-status-ready data-[state=active]:text-white">
            <Clock className="h-3.5 w-3.5" />
            Making
            {preparingOrders.length > 0 && (
              <Badge className="bg-status-ready text-white text-xs">{preparingOrders.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="ready" className="gap-1.5 rounded-xl text-xs py-2 data-[state=active]:bg-status-available data-[state=active]:text-white">
            <Check className="h-3.5 w-3.5" />
            Done
            {readyOrders.length > 0 && (
              <Badge className="bg-status-available text-white text-xs">{readyOrders.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="served" className="gap-1.5 rounded-xl text-xs py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Utensils className="h-3.5 w-3.5" />
            Done
            {servedOrders.length > 0 && (
              <Badge className="bg-primary text-primary-foreground text-xs">{servedOrders.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Show pending first, then preparing, then ready, then served */}
            {[...pendingOrders, ...preparingOrders, ...readyOrders, ...servedOrders].map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pending">
          {pendingOrders.length === 0 ? (
            <EmptyState
              icon={AlertCircle}
              title="No New Orders"
              description="New orders will appear here immediately"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {pendingOrders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="preparing">
          {preparingOrders.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="Nothing Being Prepared"
              description="Start preparing orders from the New tab"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {preparingOrders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="ready">
          {readyOrders.length === 0 ? (
            <EmptyState
              icon={Check}
              title="No Orders Ready"
              description="Completed orders waiting for pickup will appear here"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {readyOrders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="served">
          {servedOrders.length === 0 ? (
            <EmptyState
              icon={Utensils}
              title="No Served Orders"
              description="Orders that have been served and awaiting payment"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {servedOrders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
