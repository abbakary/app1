'use client';

import { useState, useMemo } from 'react';
import { useCustomers, useDeleteUser, useUpdateUser } from '@/hooks/use-restaurant-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  UserPlus, 
  MoreHorizontal, 
  Mail, 
  Phone, 
  Calendar, 
  Trash2, 
  Pencil, 
  Eye,
  Users,
  Smartphone,
  UserCheck
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

export default function CustomersManagement() {
  const { data: customers = [], isLoading } = useCustomers();
  const deleteUser = useDeleteUser();
  const updateUser = useUpdateUser();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    username: ''
  });

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => 
      c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone?.includes(searchQuery) ||
      c.username?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [customers, searchQuery]);

  const handleEdit = (customer: any) => {
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      username: customer.username || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleView = (customer: any) => {
    setSelectedCustomer(customer);
    setIsViewDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer? This action cannot be undone.')) return;
    
    try {
      await deleteUser.mutateAsync(id);
      toast.success('Customer deleted successfully');
    } catch (err) {
      toast.error('Failed to delete customer');
    }
  };

  const handleUpdate = async () => {
    try {
      await updateUser.mutateAsync({
        id: selectedCustomer.id,
        updates: formData
      });
      toast.success('Customer updated successfully');
      setIsEditDialogOpen(false);
    } catch (err) {
      toast.error('Failed to update customer');
    }
  };

  const stats = [
    { label: 'Total Customers', value: customers.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'New This Month', value: customers.filter(c => {
      const date = new Date(c.createdAt);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length, icon: UserPlus, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Verified Customers', value: customers.filter(c => c.username).length, icon: UserCheck, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Mobile Linked', value: customers.filter(c => c.phone).length, icon: Smartphone, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground flex items-center gap-3">
            Customers
            <Badge variant="outline" className="text-sm font-bold bg-primary/5 text-primary border-primary/20">
              {customers.length} Total
            </Badge>
          </h1>
          <p className="text-muted-foreground mt-1 font-medium">Manage your customer database and track engagement</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search name, phone, or email..." 
              className="pl-10 h-12 rounded-2xl border-muted-foreground/10 bg-card shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button className="h-12 px-6 rounded-2xl shadow-lg shadow-primary/20 font-bold hidden sm:flex">
            <UserPlus className="h-5 w-5 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-none shadow-sm hover:shadow-md transition-all duration-300 rounded-[28px] overflow-hidden group">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110 duration-500`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                    <p className="text-3xl font-black text-foreground tabular-nums">
                      {isLoading ? '...' : stat.value}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Table Card */}
      <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-card/50 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/30 border-b border-muted">
                <th className="px-6 py-5 text-sm font-black text-muted-foreground uppercase tracking-widest">Customer</th>
                <th className="px-6 py-5 text-sm font-black text-muted-foreground uppercase tracking-widest">Contact Info</th>
                <th className="px-6 py-5 text-sm font-black text-muted-foreground uppercase tracking-widest">Username</th>
                <th className="px-6 py-5 text-sm font-black text-muted-foreground uppercase tracking-widest">Joined Date</th>
                <th className="px-6 py-5 text-sm font-black text-muted-foreground uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-muted/50">
              <AnimatePresence mode="popLayout">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-6 py-8">
                        <div className="h-12 bg-muted/50 rounded-2xl w-full" />
                      </td>
                    </tr>
                  ))
                ) : filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-24 text-center">
                      <div className="max-w-xs mx-auto space-y-4">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto opacity-50">
                          <Users className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-xl font-bold text-foreground">No customers found</p>
                          <p className="text-muted-foreground text-sm">Try adjusting your search query</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => (
                    <motion.tr 
                      key={customer.id} 
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-muted/20 transition-colors group"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-lg shadow-inner">
                            {customer.name?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="font-black text-foreground tracking-tight">{customer.name || 'Anonymous Customer'}</p>
                            <p className="text-xs text-muted-foreground font-medium">#{customer.id.slice(0, 8).toUpperCase()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                            {customer.email || 'No email provided'}
                          </div>
                          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                            {customer.phone || 'No phone provided'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        {customer.username ? (
                          <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10 font-bold px-3 py-1 rounded-lg">
                            @{customer.username}
                          </Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground italic">Guest</span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(customer.createdAt), 'MMM dd, yyyy')}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-muted transition-colors">
                              <MoreHorizontal className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56 rounded-2xl border-muted-foreground/10 p-2 shadow-2xl">
                            <DropdownMenuLabel className="text-xs font-black uppercase text-muted-foreground px-3 py-2">Quick Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleView(customer)} className="rounded-xl px-3 py-2.5 flex items-center gap-3 cursor-pointer">
                              <Eye className="h-4 w-4 text-blue-500" />
                              <span className="font-bold">View Profile</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(customer)} className="rounded-xl px-3 py-2.5 flex items-center gap-3 cursor-pointer">
                              <Pencil className="h-4 w-4 text-orange-500" />
                              <span className="font-bold">Edit Details</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="my-1 border-muted" />
                            <DropdownMenuItem onClick={() => handleDelete(customer.id)} className="rounded-xl px-3 py-2.5 flex items-center gap-3 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/5">
                              <Trash2 className="h-4 w-4" />
                              <span className="font-bold">Delete Customer</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[32px] border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tight">Edit Customer</DialogTitle>
            <DialogDescription className="font-medium text-muted-foreground">
              Update the profile information for {selectedCustomer?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-6">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-sm font-bold ml-1">Full Name</Label>
              <Input 
                id="edit-name" 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="h-12 rounded-xl bg-muted/50 border-transparent focus:bg-background transition-all"
              />
            </div>
            <div className="flex gap-4">
              <div className="space-y-2 flex-1">
                <Label htmlFor="edit-username" className="text-sm font-bold ml-1">Username</Label>
                <Input 
                  id="edit-username" 
                  value={formData.username} 
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="h-12 rounded-xl bg-muted/50 border-transparent focus:bg-background transition-all"
                />
              </div>
              <div className="space-y-2 flex-1">
                <Label htmlFor="edit-phone" className="text-sm font-bold ml-1">Phone</Label>
                <Input 
                  id="edit-phone" 
                  value={formData.phone} 
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="h-12 rounded-xl bg-muted/50 border-transparent focus:bg-background transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email" className="text-sm font-bold ml-1">Email Address</Label>
              <Input 
                id="edit-email" 
                type="email"
                value={formData.email} 
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="h-12 rounded-xl bg-muted/50 border-transparent focus:bg-background transition-all"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setIsEditDialogOpen(false)} className="rounded-xl h-12 font-bold flex-1">Cancel</Button>
            <Button onClick={handleUpdate} className="rounded-xl h-12 font-bold px-8 flex-1">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[32px] border-none shadow-2xl p-0 overflow-hidden">
          <div className="h-32 bg-gradient-to-br from-primary to-orange-600 relative">
            <div className="absolute -bottom-10 left-8">
              <div className="w-24 h-24 rounded-[28px] bg-background border-4 border-background shadow-xl flex items-center justify-center text-primary font-black text-3xl">
                {selectedCustomer?.name?.charAt(0).toUpperCase() || '?'}
              </div>
            </div>
          </div>
          <div className="pt-14 pb-10 px-8 space-y-8">
            <div>
              <h3 className="text-3xl font-black text-foreground tracking-tight">{selectedCustomer?.name}</h3>
              <p className="text-muted-foreground font-bold tracking-tight">@{selectedCustomer?.username || 'guest'}</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Customer ID</p>
                <p className="font-bold text-foreground">#{selectedCustomer?.id.slice(0, 12).toUpperCase()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Joined Since</p>
                <p className="font-bold text-foreground">{selectedCustomer && format(new Date(selectedCustomer.createdAt), 'MMMM dd, yyyy')}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Email Address</p>
                <p className="font-bold text-foreground truncate">{selectedCustomer?.email || 'Not provided'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Phone Number</p>
                <p className="font-bold text-foreground">{selectedCustomer?.phone || 'Not provided'}</p>
              </div>
            </div>

            <div className="bg-muted/30 rounded-3xl p-6 border border-muted flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm">
                     <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                     <p className="text-[11px] font-black text-muted-foreground uppercase tracking-widest leading-tight">Order Activity</p>
                     <p className="text-lg font-black text-foreground">Active Customer</p>
                  </div>
               </div>
               <Button variant="ghost" className="rounded-xl font-bold text-primary px-3">View History</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
