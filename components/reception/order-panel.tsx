'use client';

import { useState, useEffect, useRef, useMemo, type ComponentType } from 'react';
import type { Table, MenuItem, OrderItem, Order } from '@/lib/types';
import { useMenuItems, useCreateOrder, useUpdateOrderItems, useOrder } from '@/hooks/use-restaurant-data';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Plus, Minus, Trash2, ShoppingCart, Users, X, Coffee, Pizza, Salad, IceCream, Wine, ChevronRight, Sparkles, MoreHorizontal } from 'lucide-react';
import {
  BUCKET_LABELS,
  BUCKET_ORDER,
  normalizeMenuCategory,
  type MenuCategoryBucket,
} from '@/lib/menu-categories';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface OrderPanelProps {
  table: Table;
  onClose: () => void;
  onPayment: (order: Order) => void;
}

// Category icons and colors for visual enhancement
const categoryIcons: Record<MenuCategoryBucket, ComponentType<{ className?: string }>> = {
  appetizer: Pizza,
  main: Coffee,
  side: Salad,
  dessert: IceCream,
  beverage: Wine,
  other: MoreHorizontal,
};

const categoryColors: Record<MenuCategoryBucket, string> = {
  appetizer: 'from-orange-500 to-red-500',
  main: 'from-emerald-500 to-teal-500',
  side: 'from-yellow-500 to-amber-500',
  dessert: 'from-pink-500 to-rose-500',
  beverage: 'from-blue-500 to-cyan-500',
  other: 'from-slate-500 to-slate-600',
};

export function OrderPanel({ table, onClose, onPayment }: OrderPanelProps) {
  const { data: menuItems = [], isLoading: isMenuLoading } = useMenuItems();
  const { data: existingOrder, isLoading: isOrderLoading } = useOrder(table.currentOrderId || '');
  const createOrder = useCreateOrder();
  const updateOrderItems = useUpdateOrderItems();

  const [customerCount, setCustomerCount] = useState(2);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [itemsModifiedNotification, setItemsModifiedNotification] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<MenuCategoryBucket>('main');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (existingOrder && !initialized) {
      setCustomerCount(existingOrder.customerCount);
      setOrderItems(existingOrder.items);
      setInitialized(true);
    }
  }, [existingOrder, initialized]);

  useEffect(() => {
    if (existingOrder && existingOrder.itemsModifiedAt) {
      const modificationTime = new Date(existingOrder.itemsModifiedAt).getTime();
      const now = new Date().getTime();

      if (now - modificationTime < 5000) {
        setItemsModifiedNotification(true);
        setOrderItems(existingOrder.items);

        const timer = setTimeout(() => setItemsModifiedNotification(false), 4000);
        return () => clearTimeout(timer);
      }
    }
  }, [existingOrder?.itemsModifiedAt]);

  const visibleBuckets = useMemo(
    () =>
      BUCKET_ORDER.filter(bucket =>
        menuItems.some(
          item => normalizeMenuCategory(item.category) === bucket && item.available
        )
      ),
    [menuItems]
  );

  const scrollToCategory = (category: MenuCategoryBucket) => {
    setSelectedCategory(category);
    const element = categoryRefs.current[category];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    if (visibleBuckets.length === 0) return;
    if (!visibleBuckets.includes(selectedCategory)) {
      setSelectedCategory(visibleBuckets[0]);
    }
  }, [visibleBuckets, selectedCategory]);

  const addItem = (menuItem: MenuItem) => {
    setOrderItems(prev => {
      const existing = prev.find(item => item.menuItemId === menuItem.id);
      if (existing) {
        return prev.map(item =>
          item.menuItemId === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { menuItemId: menuItem.id, menuItem, quantity: 1 }];
    });

    toast.success(`${menuItem.name} added`, {
      duration: 1500,
      icon: '✅',
      style: { background: '#10b981', color: 'white' }
    });
  };

  const updateQuantity = (menuItemId: string, delta: number) => {
    setOrderItems(prev =>
      prev
        .map(item =>
          item.menuItemId === menuItemId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter(item => item.quantity > 0)
    );
  };

  const removeItem = (menuItemId: string) => {
    setOrderItems(prev => prev.filter(item => item.menuItemId !== menuItemId));
    toast.info('Item removed', {
      duration: 1500,
      icon: '🗑️'
    });
  };

  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity,
    0
  );
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const handleSubmit = async () => {
    if (orderItems.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    setIsSubmitting(true);
    try {
      if (existingOrder) {
        await updateOrderItems.mutateAsync({
          id: existingOrder.id,
          items: orderItems,
        });
        toast.success('Order updated! 🎉');
      } else {
        await createOrder.mutateAsync({
          tableId: table.id,
          tableName: table.name,
          items: orderItems,
          customerCount,
        });
        toast.success('Order sent to kitchen! 🍳');
      }
      setTimeout(() => onClose(), 500);
    } catch (error) {
      toast.error('Failed to submit order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayment = () => {
    if (existingOrder) {
      onPayment(existingOrder);
    }
  };

  const isNewOrder = !existingOrder;
  const canPay = existingOrder && ['in-progress', 'preparing', 'ready', 'served'].includes(existingOrder.status);
  const itemCount = orderItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex flex-col overflow-hidden">
      {/* Header with Gradient */}
      <div className="relative flex-shrink-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-6 py-5 text-white">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        <div className="relative flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-bold tracking-tight">{table.name}</h2>
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                {table.capacity} seats
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              <p className="text-sm text-white/90">
                {isNewOrder ? 'Ready to Order' : 'Updating Order'}
              </p>
              {existingOrder && (
                <Badge className="bg-white/20 text-white border-white/30 text-xs">
                  {existingOrder.status === 'in-progress' ? '🔄 In Progress' :
                    existingOrder.status === 'ready' ? '✅ Ready' :
                      existingOrder.status === 'served' ? '🍽️ Served' :
                        existingOrder.status === 'preparing' ? '👨‍🍳 Preparing' : '📝 Pending'}
                </Badge>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full bg-white/10 hover:bg-white/20 text-white h-10 w-10 flex-shrink-0"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Notification */}
      <AnimatePresence>
        {itemsModifiedNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-shrink-0 mx-4 mt-4 px-4 py-3 bg-blue-50 dark:bg-blue-950/50 border-l-4 border-blue-500 rounded-xl"
          >
            <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
              🔔 Kitchen has updated the items. Please review the changes.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content - Two Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Menu Items */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Category Tabs - Enhanced */}
          <div className="flex-shrink-0 px-4 pt-4 pb-2 bg-gradient-to-b from-slate-50/50 to-transparent dark:from-slate-900/50">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {visibleBuckets.map(cat => {
                const Icon = categoryIcons[cat];
                const isSelected = selectedCategory === cat;
                return (
                  <motion.button
                    key={cat}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => scrollToCategory(cat)}
                    className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full transition-all ${isSelected
                      ? `bg-gradient-to-r ${categoryColors[cat]} text-white shadow-lg`
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:shadow-md'
                      }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium whitespace-nowrap">
                      {BUCKET_LABELS[cat]}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Menu Items List - Enhanced */}
          <div className="flex-1 overflow-y-auto px-4 py-2">
            {isMenuLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-slate-500">Loading delicious items...</p>
                </div>
              </div>
            ) : menuItems.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Pizza className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">No items available yet</p>
                  <p className="text-sm text-slate-400">Ask your admin to add some delicious items to the menu!</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                  {visibleBuckets.map(cat => {
                    const itemsInCategory = menuItems.filter(
                      item =>
                        normalizeMenuCategory(item.category) === cat && item.available
                    );
                    if (itemsInCategory.length === 0) return null;

                    const Icon = categoryIcons[cat];
                    const gradientColor = categoryColors[cat];

                    return (
                      <motion.div
                        key={cat}
                        ref={el => { categoryRefs.current[cat] = el; }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="scroll-mt-4"
                      >
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r ${gradientColor} text-white mb-3`}>
                          <Icon className="h-4 w-4" />
                          <h3 className="font-semibold text-sm">{BUCKET_LABELS[cat]}</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {itemsInCategory.map((item, index) => (
                            <motion.button
                              key={item.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => addItem(item)}
                              className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:shadow-lg transition-all text-left group"
                            >
                              <div className="flex justify-between items-start gap-3">
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-slate-900 dark:text-white">
                                    {item.name}
                                  </p>
                                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                                    {item.description}
                                  </p>
                                  <div className="flex items-center gap-2 mt-2">
                                    <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                      TSH {item.price.toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                                  <Plus className="h-5 w-5 text-white" />
                                </div>
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Order Summary - Enhanced */}
          <div className="w-full md:w-96 flex flex-col bg-gradient-to-b from-white to-slate-50 dark:from-slate-800 dark:to-slate-800/90 border-l border-slate-200 dark:border-slate-700">
            {/* Customer Count - Enhanced */}
            {isNewOrder && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-shrink-0 p-5 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30"
              >
                <Label className="text-sm font-semibold mb-3 block flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Users className="h-4 w-4" />
                  Number of Guests
                </Label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-full p-1 shadow-sm">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                      onClick={() => setCustomerCount(Math.max(1, customerCount - 1))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="text-2xl font-bold w-12 text-center text-slate-800 dark:text-white">
                      {customerCount}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                      onClick={() => setCustomerCount(customerCount + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <Sparkles className="h-5 w-5 text-blue-500 animate-pulse" />
                </div>
              </motion.div>
            )}

            {/* Order Items - Enhanced */}
            <div className="flex-1 overflow-y-auto p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  <ShoppingCart className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-semibold text-slate-800 dark:text-white">
                  Current Order • {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </h3>
              </div>

              {orderItems.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-3">🛒</div>
                  <p className="text-sm text-slate-500 font-medium">Your cart is empty</p>
                  <p className="text-xs text-slate-400 mt-1">Tap on menu items to add</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orderItems.map(item => (
                    <motion.div
                      key={item.menuItemId}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-700"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-slate-800 dark:text-white truncate">
                          {item.menuItem.name}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          TSH {item.menuItem.price.toLocaleString()} each
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-white dark:bg-slate-800 rounded-lg p-1 shadow-sm">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
                            onClick={() => updateQuantity(item.menuItemId, -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-6 text-center font-semibold text-sm text-slate-700 dark:text-white">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
                            onClick={() => updateQuantity(item.menuItemId, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <span className="font-semibold text-sm w-16 text-right text-slate-700 dark:text-white">
                          TSH {(item.menuItem.price * item.quantity).toLocaleString()}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg"
                          onClick={() => removeItem(item.menuItemId)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Totals and Actions - Enhanced */}
            <div className="flex-shrink-0 border-t border-slate-200 dark:border-slate-700 p-5 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
                  <span className="font-medium text-slate-700 dark:text-white">TSH {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Tax (10%)</span>
                  <span className="font-medium text-slate-700 dark:text-white">TSH {tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-800 dark:text-white">Total</span>
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    TSH {total.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {canPay && (
                  <Button
                    variant="outline"
                    className="w-full rounded-xl border-2 border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/50 h-12"
                    onClick={handlePayment}
                  >
                    💳 Process Payment
                  </Button>
                )}
                <Button
                  className={`w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg h-12 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  onClick={handleSubmit}
                  disabled={orderItems.length === 0 || isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2 justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Saving...</span>
                    </div>
                  ) : (
                    <span className="flex items-center gap-2 justify-center">
                      {isNewOrder ? '🍳 Place Order' : '🔄 Update Order'}
                      <ChevronRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}