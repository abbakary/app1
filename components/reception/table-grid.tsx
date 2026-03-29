'use client';

import { useTables, useActiveOrders } from '@/hooks/use-restaurant-data';
import type { Table } from '@/lib/types';
import { Users, ChefHat, Bell, Utensils } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TableGridProps {
  selectedTableId: string | null;
  onSelectTable: (table: Table) => void;
}

export function TableGrid({ selectedTableId, onSelectTable }: TableGridProps) {
  const { data: tables = [], isLoading } = useTables();
  const { data: activeOrders = [] } = useActiveOrders();

  // Get order status for each table
  const getTableOrderStatus = (table: Table) => {
    if (!table.currentOrderId) return null;
    const order = activeOrders.find(o => o.id === table.currentOrderId);
    return order?.status || null;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-3xl bg-muted animate-pulse"
          />
        ))}
      </div>
    );
  }

  const getStatusColor = (status: Table['status']) => {
    switch (status) {
      case 'available':
        return 'bg-gradient-to-br from-status-available to-status-available/80 hover:shadow-lg hover:scale-105';
      case 'occupied':
        return 'bg-gradient-to-br from-status-occupied to-status-occupied/80 hover:shadow-lg hover:scale-105';
      case 'ready':
        return 'bg-gradient-to-br from-status-ready to-status-ready/80 hover:shadow-lg hover:scale-105 animate-pulse shadow-xl';
      default:
        return 'bg-muted hover:scale-105';
    }
  };

  const getStatusLabel = (status: Table['status']) => {
    switch (status) {
      case 'available':
        return '✅ Available';
      case 'occupied':
        return '🍽️ Occupied';
      case 'ready':
        return '📤 Ready';
      default:
        return status;
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-5 mb-8 pb-4 border-b">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-status-available" />
          <span className="text-sm font-medium text-muted-foreground">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-status-occupied" />
          <span className="text-sm font-medium text-muted-foreground">Occupied</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-status-ready" />
          <span className="text-sm font-medium text-muted-foreground">Ready</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
        {tables.map((table) => (
          <button
            key={table.id}
            onClick={() => onSelectTable(table)}
            className={cn(
              'aspect-square rounded-3xl p-4 flex flex-col items-center justify-center text-white transition-all active:scale-95',
              getStatusColor(table.status),
              selectedTableId === table.id && 'ring-4 ring-foreground ring-offset-4 ring-offset-background shadow-2xl scale-110'
            )}
          >
            <span className="text-2xl font-bold mb-2">{table.name}</span>
            <div className="flex items-center gap-1.5 text-sm opacity-90 font-medium">
              <Users className="h-5 w-5" />
              <span>{table.capacity} guests</span>
            </div>
            <span className="text-xs mt-3 opacity-85 font-semibold">
              {getStatusLabel(table.status)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
