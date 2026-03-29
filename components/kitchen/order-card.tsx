'use client';

import { useState, useMemo } from 'react';
import type { Order, OrderItem } from '@/lib/types';
import { useUpdateOrder, useUpdateOrderItems, useMenuItems } from '@/hooks/use-restaurant-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { Clock, Users, ChefHat, Check, AlertCircle, Edit2, Plus, X, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrderCardProps {
  order: Order;
}

// Helper function to safely format dates
const safeFormatDistanceToNow = (dateValue: string | Date | null | undefined): string => {
  if (!dateValue) return 'Date unavailable';
  
  try {
    const date = new Date(dateValue);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date value:', dateValue);
      return 'Invalid date';
    }
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Date error';
  }
};

// Helper function to safely calculate time difference
const safeGetTimeDifference = (dateValue: string | Date | null | undefined): number => {
  if (!dateValue) return 0;
  
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return 0;
    return Date.now() - date.getTime();
  } catch (error) {
    console.error('Error calculating time difference:', error);
    return 0;
  }
};

export function OrderCard({ order }: OrderCardProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedItems, setEditedItems] = useState<OrderItem[]>(order.items);
  const updateOrder = useUpdateOrder();
  const updateOrderItems = useUpdateOrderItems();
  const { data: menuItems = [] } = useMenuItems();

  // Memoize formatted date to avoid recalculation
  const timeAgo = useMemo(() => safeFormatDistanceToNow(order.createdAt), [order.createdAt]);
  
  // Memoize urgency check
  const isUrgent = useMemo(() => {
    const timeDiff = safeGetTimeDifference(order.createdAt);
    return (order.status === 'pending' || order.status === 'in-progress') && 
           timeDiff > 5 * 60 * 1000; // 5 minutes
  }, [order.status, order.createdAt]);

  const handleStart = async () => {
    try {
      await updateOrder.mutateAsync({
        id: order.id,
        updates: { status: 'in-progress' },
      });
      toast.success(`Starting order for ${order.tableName}`);
    } catch (error) {
      toast.error('Failed to update order');
      console.error('Error starting order:', error);
    }
  };

  const handlePrepare = async () => {
    try {
      await updateOrder.mutateAsync({
        id: order.id,
        updates: { status: 'preparing' },
      });
      toast.success(`Preparing order for ${order.tableName}`);
    } catch (error) {
      toast.error('Failed to update order');
      console.error('Error preparing order:', error);
    }
  };

  const handleReady = async () => {
    try {
      await updateOrder.mutateAsync({
        id: order.id,
        updates: { status: 'ready' },
      });
      toast.success(`Order for ${order.tableName} is ready!`);
    } catch (error) {
      toast.error('Failed to update order');
      console.error('Error marking order ready:', error);
    }
  };

  const handleServed = async () => {
    try {
      await updateOrder.mutateAsync({
        id: order.id,
        updates: { status: 'served' },
      });
      toast.success(`Order for ${order.tableName} has been served!`);
    } catch (error) {
      toast.error('Failed to update order');
      console.error('Error serving order:', error);
    }
  };

  const handleRemoveItem = (index: number) => {
    setEditedItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(index);
    } else {
      setEditedItems(prev => {
        const updated = [...prev];
        updated[index] = { ...updated[index], quantity };
        return updated;
      });
    }
  };

  const handleAddMenuItem = (menuItemId: string) => {
    const menuItem = menuItems.find(m => m.id === menuItemId);
    if (!menuItem) return;

    setEditedItems(prev => {
      const existingIndex = prev.findIndex(i => i.menuItemId === menuItemId);
      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = { 
          ...updated[existingIndex], 
          quantity: updated[existingIndex].quantity + 1 
        };
        return updated;
      }
      return [...prev, { menuItemId, menuItem, quantity: 1 }];
    });
  };

  const handleSaveEdits = async () => {
    if (editedItems.length === 0) {
      toast.error('Order must have at least one item');
      return;
    }

    try {
      await updateOrderItems.mutateAsync({
        id: order.id,
        items: editedItems,
      });
      toast.success('Order items updated and notified to reception');
      setIsEditMode(false);
    } catch (error) {
      toast.error('Failed to update order items');
      console.error('Error saving order items:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditedItems(order.items);
    setIsEditMode(false);
  };

  const getStatusColor = () => {
    switch (order.status) {
      case 'pending':
        return 'border-status-occupied bg-status-occupied/5';
      case 'in-progress':
        return 'border-yellow-500 bg-yellow-500/5';
      case 'preparing':
        return 'border-status-ready bg-status-ready/5';
      case 'ready':
        return 'border-status-available bg-status-available/5';
      case 'served':
        return 'border-primary bg-primary/5';
      default:
        return 'border-border';
    }
  };

  const getStatusBadge = () => {
    switch (order.status) {
      case 'pending':
        return <Badge variant="destructive" className="gap-1"><AlertCircle className="h-3 w-3" /> New Order</Badge>;
      case 'in-progress':
        return <Badge className="bg-yellow-500 text-white gap-1"><ChefHat className="h-3 w-3" /> Started</Badge>;
      case 'preparing':
        return <Badge className="bg-status-ready text-white gap-1"><ChefHat className="h-3 w-3" /> Preparing</Badge>;
      case 'ready':
        return <Badge className="bg-status-available text-white gap-1"><Check className="h-3 w-3" /> Ready</Badge>;
      case 'served':
        return <Badge className="bg-primary text-primary-foreground gap-1"><Check className="h-3 w-3" /> Served</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className={cn(
      'transition-all border-0 rounded-3xl shadow-lg hover:shadow-xl',
      getStatusColor(),
      isUrgent && 'animate-pulse ring-2 ring-destructive'
    )}>
      <CardHeader className="pb-4 rounded-t-3xl bg-gradient-to-b from-secondary/20 to-transparent">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              {order.tableName}
              {isUrgent && <AlertCircle className="h-6 w-6 text-destructive animate-bounce" />}
            </CardTitle>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground font-medium">
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {timeAgo}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                {order.customerCount} guests
              </span>
            </div>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Order Items */}
        <div className="space-y-2">
          {editedItems.map((item, index) => {
            const fullMenuItem = item.menuItem || menuItems.find(m => m.id === item.menuItemId);

            if (!fullMenuItem) {
              return (
                <div key={`${item.menuItemId}-${index}`} className="flex items-center justify-between py-2 text-sm text-red-500 italic">
                  <span>[Menu item not found]</span>
                </div>
              );
            }

            return (
              <div
                key={`${item.menuItemId}-${index}`}
                className={cn(
                  "flex items-start justify-between py-2 border-b last:border-0",
                  isEditMode && "bg-secondary/50 px-2 rounded"
                )}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {isEditMode ? (
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 w-6 p-0"
                          onClick={() => handleUpdateQuantity(index, item.quantity - 1)}
                        >
                          −
                        </Button>
                        <span className="font-bold w-6 text-center">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 w-6 p-0"
                          onClick={() => handleUpdateQuantity(index, item.quantity + 1)}
                        >
                          +
                        </Button>
                      </div>
                    ) : (
                      <span className="font-bold text-lg">{item.quantity}x</span>
                    )}
                    <span className="font-medium">{fullMenuItem.name}</span>
                  </div>
                  {item.notes && (
                    <p className="text-sm text-muted-foreground mt-1 italic">
                      Note: {item.notes}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs capitalize">
                    {fullMenuItem.category}
                  </Badge>
                  {isEditMode && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      onClick={() => handleRemoveItem(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
          
          {editedItems.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              No items in this order
            </p>
          )}
        </div>

        {/* Add Items in Edit Mode */}
        {isEditMode && (
          <div className="space-y-2 border-t pt-3">
            <p className="text-sm font-semibold text-muted-foreground">Add Items</p>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
              {menuItems
                .filter(m => !editedItems.find(ei => ei.menuItemId === m.id))
                .map(item => (
                  <Button
                    key={item.id}
                    size="sm"
                    variant="outline"
                    className="text-xs justify-start"
                    onClick={() => handleAddMenuItem(item.id)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {item.name}
                  </Button>
                ))}
            </div>
          </div>
        )}

        {/* Order Number */}
        {order.id && (
          <div className="text-center py-3 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl border border-primary/20">
            <p className="text-xs text-muted-foreground font-semibold">Order ID</p>
            <p className="font-mono font-bold text-xl text-primary">#{order.id.slice(-6).toUpperCase()}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          {isEditMode ? (
            <div className="flex gap-3">
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-2xl h-12"
                onClick={handleSaveEdits}
                disabled={updateOrderItems.isPending}
              >
                <Save className="h-5 w-5 mr-2" />
                Save Changes
              </Button>
              <Button
                className="flex-1 rounded-2xl h-12"
                variant="outline"
                onClick={handleCancelEdit}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {order.status === 'pending' && (
                <Button
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-2xl h-12"
                  onClick={handleStart}
                  disabled={updateOrder.isPending}
                >
                  <ChefHat className="h-5 w-5 mr-2" />
                  Start Order
                </Button>
              )}
              {order.status === 'in-progress' && (
                <>
                  <Button
                    className="w-full bg-status-ready hover:bg-status-ready/90 text-white font-semibold rounded-2xl h-12"
                    onClick={handlePrepare}
                    disabled={updateOrder.isPending}
                  >
                    <ChefHat className="h-5 w-5 mr-2" />
                    Start Preparing
                  </Button>
                  <Button
                    className="w-full rounded-2xl h-12"
                    variant="outline"
                    onClick={() => setIsEditMode(true)}
                  >
                    <Edit2 className="h-5 w-5 mr-2" />
                    Edit Items
                  </Button>
                </>
              )}
              {order.status === 'preparing' && (
                <>
                  <Button
                    className="w-full bg-status-available hover:bg-status-available/90 text-white font-semibold rounded-2xl h-12"
                    onClick={handleReady}
                    disabled={updateOrder.isPending}
                  >
                    <Check className="h-5 w-5 mr-2" />
                    Mark Ready
                  </Button>
                  <Button
                    className="w-full rounded-2xl h-12"
                    variant="outline"
                    onClick={() => setIsEditMode(true)}
                  >
                    <Edit2 className="h-5 w-5 mr-2" />
                    Edit Items
                  </Button>
                </>
              )}
              {order.status === 'ready' && (
                <>
                  <Button
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-2xl h-12"
                    onClick={handleServed}
                    disabled={updateOrder.isPending}
                  >
                    <Check className="h-5 w-5 mr-2" />
                    Mark as Served
                  </Button>
                  <Button
                    className="w-full rounded-2xl h-12"
                    variant="outline"
                    onClick={() => setIsEditMode(true)}
                  >
                    <Edit2 className="h-5 w-5 mr-2" />
                    Edit Items
                  </Button>
                </>
              )}
              {order.status === 'served' && (
                <div className="w-full text-center py-3 bg-primary/10 rounded-2xl border border-primary/20">
                  <p className="text-primary font-bold">
                    ✅ Served - Awaiting Payment
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}