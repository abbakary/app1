'use client';

import { useState } from 'react';
import type { Table } from '@/lib/types';
import {
  useTables,
  useCreateTable,
  useUpdateTable,
  useDeleteTable,
} from '@/hooks/use-restaurant-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function TablesManagement() {
  const { data: tables = [], isLoading } = useTables();
  const createTable = useCreateTable();
  const updateTable = useUpdateTable();
  const deleteTable = useDeleteTable();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    capacity: '4',
    row: '0',
    col: '0',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      capacity: '4',
      row: '0',
      col: '0',
    });
    setEditingTable(null);
  };

  const handleOpenDialog = (table?: Table) => {
    if (table) {
      setEditingTable(table);
      setFormData({
        name: table.name,
        capacity: table.capacity.toString(),
        row: table.position.row.toString(),
        col: table.position.col.toString(),
      });
    } else {
      resetForm();
      // Auto-generate name and position
      const nextNumber = tables.length + 1;
      const nextRow = Math.floor(tables.length / 4);
      const nextCol = tables.length % 4;
      setFormData({
        name: `Table ${nextNumber}`,
        capacity: '4',
        row: nextRow.toString(),
        col: nextCol.toString(),
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.capacity) {
      toast.error('Please fill in required fields');
      return;
    }

    const capacity = parseInt(formData.capacity);
    if (isNaN(capacity) || capacity <= 0) {
      toast.error('Please enter a valid capacity');
      return;
    }

    try {
      if (editingTable) {
        await updateTable.mutateAsync({
          id: editingTable.id,
          updates: {
            name: formData.name,
            capacity,
            position: {
              row: parseInt(formData.row) || 0,
              col: parseInt(formData.col) || 0,
            },
          },
        });
        toast.success('Table updated');
      } else {
        await createTable.mutateAsync({
          name: formData.name,
          capacity,
          status: 'available' as const,
          restaurantId: '',  // set server-side via X-Restaurant-ID header
          position: {
            row: parseInt(formData.row) || 0,
            col: parseInt(formData.col) || 0,
          },
        });
        toast.success('Table created');
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to save table');
    }
  };

  const handleDelete = async (id: string) => {
    const table = tables.find(t => t.id === id);
    if (table?.status !== 'available') {
      toast.error('Cannot delete a table with an active order');
      return;
    }

    if (!confirm('Are you sure you want to delete this table?')) return;

    try {
      await deleteTable.mutateAsync(id);
      toast.success('Table deleted');
    } catch (error) {
      toast.error('Failed to delete table');
    }
  };

  const getStatusBadge = (status: Table['status']) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-status-available text-white">Available</Badge>;
      case 'occupied':
        return <Badge className="bg-status-occupied text-white">Occupied</Badge>;
      case 'ready':
        return <Badge className="bg-status-ready text-white">Ready</Badge>;
      default:
        return null;
    }
  };

  // Group tables by status
  const availableTables = tables.filter(t => t.status === 'available');
  const occupiedTables = tables.filter(t => t.status === 'occupied');
  const readyTables = tables.filter(t => t.status === 'ready');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tables Management</h1>
          <p className="text-muted-foreground">Manage your restaurant tables</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Table
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{tables.length}</div>
            <p className="text-sm text-muted-foreground">Total Tables</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-status-available">{availableTables.length}</div>
            <p className="text-sm text-muted-foreground">Available</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-status-occupied">{occupiedTables.length}</div>
            <p className="text-sm text-muted-foreground">Occupied</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-status-ready">{readyTables.length}</div>
            <p className="text-sm text-muted-foreground">Ready</p>
          </CardContent>
        </Card>
      </div>

      {/* Tables Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
          {tables.map((table) => (
            <Card key={table.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{table.name}</CardTitle>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleOpenDialog(table)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDelete(table.id)}
                      disabled={table.status !== 'available'}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>Capacity: {table.capacity}</span>
                </div>
                {getStatusBadge(table.status)}
                <p className="text-xs text-muted-foreground">
                  Position: Row {table.position.row + 1}, Col {table.position.col + 1}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTable ? 'Edit Table' : 'Add Table'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Table Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Table 1, VIP 1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Seating Capacity *</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="row">Grid Row</Label>
                <Input
                  id="row"
                  type="number"
                  min="0"
                  value={formData.row}
                  onChange={(e) => setFormData({ ...formData, row: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="col">Grid Column</Label>
                <Input
                  id="col"
                  type="number"
                  min="0"
                  value={formData.col}
                  onChange={(e) => setFormData({ ...formData, col: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createTable.isPending || updateTable.isPending}
            >
              {editingTable ? 'Save Changes' : 'Add Table'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
