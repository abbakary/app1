'use client';

import { useState, useEffect } from 'react';
import { useOrders } from '@/hooks/use-restaurant-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ReceiptDialog } from '@/components/reception/receipt-dialog';
import { CustomerOrdersPanel } from '@/components/reception/customer-orders-panel';
import { Button } from '@/components/ui/button';
import { Receipt, Clock, Users } from 'lucide-react';
import type { Order } from '@/lib/types';

export default function OrdersPage() {
  const { data: orders = [], isLoading } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [restaurantId, setRestaurantId] = useState('');

  useEffect(() => {
    const rid = typeof window !== 'undefined' ? sessionStorage.getItem('restaurant_id') || '' : '';
    setRestaurantId(rid);
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Order Management</h1>
        <p className="text-muted-foreground">Manage customer and table orders</p>
      </div>

      {/* Customer Orders Approval Section */}
      {restaurantId && (
        <div className="mb-8 p-6 bg-orange-50/50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-900/50 rounded-2xl">
          <CustomerOrdersPanel restaurantId={restaurantId} />
        </div>
      )}

      {/* Order History */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground">Order History</h2>
        <p className="text-muted-foreground text-sm">All orders from tables and customers</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {orders.map((order) => (
          <Card key={order.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{order.tableName || 'Portal Order'}</CardTitle>
                  <p className="text-xs text-muted-foreground font-mono mt-1">
                    ID: #{order.id.slice(-8).toUpperCase()}
                  </p>
                  {order.couponCode && (
                    <p className="text-xs font-bold text-primary mt-1">
                      Coupon: {order.couponCode}
                    </p>
                  )}
                </div>
                <Badge variant={order.status === 'paid' ? 'default' : 'secondary'}>
                  {order.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {format(new Date(order.createdAt), 'HH:mm')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {order.customerCount}
                  </span>
                </div>

                <div className="border-t pt-3">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>TSH {order.total.toLocaleString()}</span>
                  </div>
                </div>

                {order.status === 'paid' && (
                  <Button 
                    variant="outline" 
                    className="w-full mt-2" 
                    onClick={() => setSelectedOrder(order)}
                  >
                    <Receipt className="h-4 w-4 mr-2" />
                    View Receipt
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {orders.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No orders found.
          </div>
        )}
      </div>

      {selectedOrder && (
        <ReceiptDialog
          order={selectedOrder}
          open={!!selectedOrder}
          onOpenChange={(open) => !open && setSelectedOrder(null)}
        />
      )}
    </div>
  );
}
