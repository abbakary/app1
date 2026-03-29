// In-memory store with localStorage persistence
// MongoDB-compatible schema for future migration

import type {
  User,
  Table,
  MenuItem,
  Order,
  Payment,
  Notification,
  AuthSession,
} from './types';

// Storage keys
const STORAGE_KEYS = {
  users: 'resto_users',
  tables: 'resto_tables',
  menuItems: 'resto_menu',
  orders: 'resto_orders',
  payments: 'resto_payments',
  notifications: 'resto_notifications',
  session: 'resto_session',
} as const;

// Helper to safely access localStorage
function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

// Initial seed data
const initialTables: Table[] = [
  { id: 't1', name: 'Table 1', capacity: 2, status: 'available', restaurantId: '', position: { row: 0, col: 0 } },
  { id: 't2', name: 'Table 2', capacity: 2, status: 'available', restaurantId: '', position: { row: 0, col: 1 } },
  { id: 't3', name: 'Table 3', capacity: 4, status: 'available', restaurantId: '', position: { row: 0, col: 2 } },
  { id: 't4', name: 'Table 4', capacity: 4, status: 'available', restaurantId: '', position: { row: 0, col: 3 } },
  { id: 't5', name: 'Table 5', capacity: 6, status: 'available', restaurantId: '', position: { row: 1, col: 0 } },
  { id: 't6', name: 'Table 6', capacity: 6, status: 'available', restaurantId: '', position: { row: 1, col: 1 } },
  { id: 't7', name: 'Table 7', capacity: 4, status: 'available', restaurantId: '', position: { row: 1, col: 2 } },
  { id: 't8', name: 'Table 8', capacity: 4, status: 'available', restaurantId: '', position: { row: 1, col: 3 } },
  { id: 't9', name: 'Table 9', capacity: 8, status: 'available', restaurantId: '', position: { row: 2, col: 0 } },
  { id: 't10', name: 'Table 10', capacity: 8, status: 'available', restaurantId: '', position: { row: 2, col: 1 } },
  { id: 't11', name: 'VIP 1', capacity: 6, status: 'available', restaurantId: '', position: { row: 2, col: 2 } },
  { id: 't12', name: 'VIP 2', capacity: 6, status: 'available', restaurantId: '', position: { row: 2, col: 3 } },
];

const initialMenuItems: MenuItem[] = [
  // Appetizers
  { id: 'm1', name: 'Spring Rolls', price: 8.99, category: 'appetizer', description: 'Crispy vegetable spring rolls with sweet chili sauce', available: true },
  { id: 'm2', name: 'Bruschetta', price: 7.99, category: 'appetizer', description: 'Toasted bread with tomato, basil, and garlic', available: true },
  { id: 'm3', name: 'Soup of the Day', price: 6.99, category: 'appetizer', description: 'Ask your server for today\'s selection', available: true },
  // Mains
  { id: 'm4', name: 'Grilled Salmon', price: 24.99, category: 'main', description: 'Atlantic salmon with lemon butter sauce', available: true },
  { id: 'm5', name: 'Ribeye Steak', price: 32.99, category: 'main', description: '12oz ribeye cooked to perfection', available: true },
  { id: 'm6', name: 'Chicken Parmesan', price: 18.99, category: 'main', description: 'Breaded chicken with marinara and mozzarella', available: true },
  { id: 'm7', name: 'Vegetable Pasta', price: 15.99, category: 'main', description: 'Penne with seasonal vegetables in garlic oil', available: true },
  { id: 'm8', name: 'Fish & Chips', price: 16.99, category: 'main', description: 'Beer-battered cod with fries and coleslaw', available: true },
  // Sides
  { id: 'm9', name: 'French Fries', price: 4.99, category: 'side', description: 'Crispy golden fries', available: true },
  { id: 'm10', name: 'Garden Salad', price: 5.99, category: 'side', description: 'Mixed greens with house dressing', available: true },
  { id: 'm11', name: 'Mashed Potatoes', price: 4.99, category: 'side', description: 'Creamy garlic mashed potatoes', available: true },
  // Desserts
  { id: 'm12', name: 'Chocolate Cake', price: 8.99, category: 'dessert', description: 'Rich chocolate layer cake', available: true },
  { id: 'm13', name: 'Ice Cream', price: 5.99, category: 'dessert', description: 'Three scoops of your choice', available: true },
  { id: 'm14', name: 'Cheesecake', price: 7.99, category: 'dessert', description: 'New York style cheesecake', available: true },
  // Beverages
  { id: 'm15', name: 'Soft Drink', price: 2.99, category: 'beverage', description: 'Coke, Sprite, or Fanta', available: true },
  { id: 'm16', name: 'Fresh Juice', price: 4.99, category: 'beverage', description: 'Orange, apple, or mixed fruit', available: true },
  { id: 'm17', name: 'Coffee', price: 3.49, category: 'beverage', description: 'Hot brewed coffee', available: true },
  { id: 'm18', name: 'Tea', price: 2.99, category: 'beverage', description: 'Selection of herbal teas', available: true },
];

const initialUsers: User[] = [
  { id: 'u1', name: 'Admin User', email: 'admin@resto.com', role: 'admin', pin: '1234', createdAt: new Date().toISOString() },
  { id: 'u2', name: 'Reception Staff', email: 'reception@resto.com', role: 'reception', pin: '5678', createdAt: new Date().toISOString() },
  { id: 'u3', name: 'Kitchen Staff', email: 'kitchen@resto.com', role: 'kitchen', pin: '9012', createdAt: new Date().toISOString() },
];

// Store class
class Store {
  private initialized = false;

  initialize(): void {
    if (this.initialized || typeof window === 'undefined') return;

    // Initialize with seed data if empty
    if (!localStorage.getItem(STORAGE_KEYS.tables)) {
      setToStorage(STORAGE_KEYS.tables, initialTables);
    }
    if (!localStorage.getItem(STORAGE_KEYS.menuItems)) {
      setToStorage(STORAGE_KEYS.menuItems, initialMenuItems);
    }
    if (!localStorage.getItem(STORAGE_KEYS.users)) {
      setToStorage(STORAGE_KEYS.users, initialUsers);
    }
    if (!localStorage.getItem(STORAGE_KEYS.orders)) {
      setToStorage(STORAGE_KEYS.orders, []);
    }
    if (!localStorage.getItem(STORAGE_KEYS.payments)) {
      setToStorage(STORAGE_KEYS.payments, []);
    }
    if (!localStorage.getItem(STORAGE_KEYS.notifications)) {
      setToStorage(STORAGE_KEYS.notifications, []);
    }

    this.initialized = true;
  }

  // Users
  getUsers(): User[] {
    return getFromStorage<User[]>(STORAGE_KEYS.users, initialUsers);
  }

  getUserById(id: string): User | undefined {
    return this.getUsers().find(u => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  getUserByPin(pin: string): User | undefined {
    return this.getUsers().find(u => u.pin === pin);
  }

  createUser(user: Omit<User, 'id' | 'createdAt'>): User {
    const users = this.getUsers();
    const newUser: User = {
      ...user,
      id: `u${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    setToStorage(STORAGE_KEYS.users, users);
    return newUser;
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return undefined;
    users[index] = { ...users[index], ...updates };
    setToStorage(STORAGE_KEYS.users, users);
    return users[index];
  }

  deleteUser(id: string): boolean {
    const users = this.getUsers();
    const filtered = users.filter(u => u.id !== id);
    if (filtered.length === users.length) return false;
    setToStorage(STORAGE_KEYS.users, filtered);
    return true;
  }

  // Tables
  getTables(): Table[] {
    return getFromStorage<Table[]>(STORAGE_KEYS.tables, initialTables);
  }

  getTableById(id: string): Table | undefined {
    return this.getTables().find(t => t.id === id);
  }

  createTable(table: Omit<Table, 'id'>): Table {
    const tables = this.getTables();
    const newTable: Table = {
      ...table,
      id: `t${Date.now()}`,
    };
    tables.push(newTable);
    setToStorage(STORAGE_KEYS.tables, tables);
    return newTable;
  }

  updateTable(id: string, updates: Partial<Table>): Table | undefined {
    const tables = this.getTables();
    const index = tables.findIndex(t => t.id === id);
    if (index === -1) return undefined;
    tables[index] = { ...tables[index], ...updates };
    setToStorage(STORAGE_KEYS.tables, tables);
    return tables[index];
  }

  deleteTable(id: string): boolean {
    const tables = this.getTables();
    const filtered = tables.filter(t => t.id !== id);
    if (filtered.length === tables.length) return false;
    setToStorage(STORAGE_KEYS.tables, filtered);
    return true;
  }

  // Menu Items
  getMenuItems(): MenuItem[] {
    return getFromStorage<MenuItem[]>(STORAGE_KEYS.menuItems, initialMenuItems);
  }

  getMenuItemById(id: string): MenuItem | undefined {
    return this.getMenuItems().find(m => m.id === id);
  }

  createMenuItem(item: Omit<MenuItem, 'id'>): MenuItem {
    const items = this.getMenuItems();
    const newItem: MenuItem = {
      ...item,
      id: `m${Date.now()}`,
    };
    items.push(newItem);
    setToStorage(STORAGE_KEYS.menuItems, items);
    return newItem;
  }

  updateMenuItem(id: string, updates: Partial<MenuItem>): MenuItem | undefined {
    const items = this.getMenuItems();
    const index = items.findIndex(m => m.id === id);
    if (index === -1) return undefined;
    items[index] = { ...items[index], ...updates };
    setToStorage(STORAGE_KEYS.menuItems, items);
    return items[index];
  }

  deleteMenuItem(id: string): boolean {
    const items = this.getMenuItems();
    const filtered = items.filter(m => m.id !== id);
    if (filtered.length === items.length) return false;
    setToStorage(STORAGE_KEYS.menuItems, filtered);
    return true;
  }

  // Orders
  getOrders(): Order[] {
    return getFromStorage<Order[]>(STORAGE_KEYS.orders, []);
  }

  getOrderById(id: string): Order | undefined {
    return this.getOrders().find(o => o.id === id);
  }

  getActiveOrders(): Order[] {
    return this.getOrders().filter(o => ['pending', 'in-progress', 'preparing', 'ready', 'served'].includes(o.status));
  }

  getOrdersByStatus(status: Order['status']): Order[] {
    return this.getOrders().filter(o => o.status === status);
  }

  createOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Order {
    const orders = this.getOrders();
    const now = new Date().toISOString();
    const newOrder: Order = {
      ...order,
      id: `o${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    orders.push(newOrder);
    setToStorage(STORAGE_KEYS.orders, orders);

    // Update table status
    this.updateTable(order.tableId, {
      status: 'occupied',
      currentOrderId: newOrder.id
    });

    // Create notification for kitchen
    this.createNotification({
      type: 'new_order',
      message: `New order for ${order.tableName}`,
      orderId: newOrder.id,
      tableId: order.tableId,
      read: false,
    });

    return newOrder;
  }

  updateOrder(id: string, updates: Partial<Order>): Order | undefined {
    const orders = this.getOrders();
    const index = orders.findIndex(o => o.id === id);
    if (index === -1) return undefined;

    orders[index] = {
      ...orders[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    setToStorage(STORAGE_KEYS.orders, orders);

    // Handle status changes
    if (updates.status === 'in-progress') {
      // Notify reception that kitchen started the order
      this.createNotification({
        type: 'order_started',
        message: `Kitchen started order for ${orders[index].tableName}`,
        orderId: id,
        tableId: orders[index].tableId,
        read: false,
      });
    } else if (updates.status === 'preparing') {
      // Notify reception that kitchen started preparing
      this.createNotification({
        type: 'new_order',
        message: `Kitchen started preparing order for ${orders[index].tableName}`,
        orderId: id,
        tableId: orders[index].tableId,
        read: false,
      });
    } else if (updates.status === 'ready') {
      orders[index].preparedAt = new Date().toISOString();
      this.updateTable(orders[index].tableId, { status: 'ready' });
      this.createNotification({
        type: 'order_ready',
        message: `Order for ${orders[index].tableName} is ready for pickup!`,
        orderId: id,
        tableId: orders[index].tableId,
        read: false,
      });
    } else if (updates.status === 'served') {
      // Notify reception that order has been served
      this.createNotification({
        type: 'order_ready',
        message: `Order for ${orders[index].tableName} has been served. Ready for payment.`,
        orderId: id,
        tableId: orders[index].tableId,
        read: false,
      });
    } else if (updates.status === 'paid') {
      orders[index].paidAt = new Date().toISOString();
      this.updateTable(orders[index].tableId, {
        status: 'available',
        currentOrderId: undefined
      });
    }

    setToStorage(STORAGE_KEYS.orders, orders);
    return orders[index];
  }

  updateOrderItems(id: string, items: Order['items']): Order | undefined {
    const orders = this.getOrders();
    const index = orders.findIndex(o => o.id === id);
    if (index === -1) return undefined;

    const order = orders[index];

    // Calculate new totals
    const subtotal = items.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);
    const tax = Number((subtotal * 0.1).toFixed(2)); // 10% tax
    const total = Number((subtotal + tax).toFixed(2));

    // Update order with new items and totals
    orders[index] = {
      ...order,
      items,
      subtotal,
      tax,
      total,
      itemsModifiedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Reset status back to pending/in-progress when items are modified
      status: order.status === 'pending' || order.status === 'in-progress' ? order.status : 'in-progress',
    };

    setToStorage(STORAGE_KEYS.orders, orders);

    // Notify reception that kitchen modified the order items
    this.createNotification({
      type: 'order_modified',
      message: `Kitchen updated items for order ${order.tableName}`,
      orderId: id,
      tableId: order.tableId,
      read: false,
    });

    return orders[index];
  }

  // Payments
  getPayments(): Payment[] {
    return getFromStorage<Payment[]>(STORAGE_KEYS.payments, []);
  }

  getPaymentById(id: string): Payment | undefined {
    return this.getPayments().find(p => p.id === id);
  }

  getPaymentByOrderId(orderId: string): Payment | undefined {
    return this.getPayments().find(p => p.orderId === orderId);
  }

  createPayment(payment: Omit<Payment, 'id' | 'createdAt'>): Payment {
    const payments = this.getPayments();
    const newPayment: Payment = {
      ...payment,
      id: `p${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    payments.push(newPayment);
    setToStorage(STORAGE_KEYS.payments, payments);

    // Update order status if payment completed
    if (payment.status === 'completed') {
      this.updateOrder(payment.orderId, { status: 'paid' });
      this.createNotification({
        type: 'payment_received',
        message: `Payment received for order`,
        orderId: payment.orderId,
        read: false,
      });
    }

    return newPayment;
  }

  updatePayment(id: string, updates: Partial<Payment>): Payment | undefined {
    const payments = this.getPayments();
    const index = payments.findIndex(p => p.id === id);
    if (index === -1) return undefined;
    payments[index] = { ...payments[index], ...updates };
    setToStorage(STORAGE_KEYS.payments, payments);

    if (updates.status === 'completed') {
      this.updateOrder(payments[index].orderId, { status: 'paid' });
    }

    return payments[index];
  }

  // Notifications
  getNotifications(): Notification[] {
    return getFromStorage<Notification[]>(STORAGE_KEYS.notifications, []);
  }

  getUnreadNotifications(): Notification[] {
    return this.getNotifications().filter(n => !n.read);
  }

  createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Notification {
    const notifications = this.getNotifications();
    const newNotification: Notification = {
      ...notification,
      id: `n${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    notifications.unshift(newNotification);
    // Keep only last 50 notifications
    const trimmed = notifications.slice(0, 50);
    setToStorage(STORAGE_KEYS.notifications, trimmed);
    return newNotification;
  }

  markNotificationRead(id: string): void {
    const notifications = this.getNotifications();
    const index = notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      notifications[index].read = true;
      setToStorage(STORAGE_KEYS.notifications, notifications);
    }
  }

  markAllNotificationsRead(): void {
    const notifications = this.getNotifications().map(n => ({ ...n, read: true }));
    setToStorage(STORAGE_KEYS.notifications, notifications);
  }

  clearNotifications(): void {
    setToStorage(STORAGE_KEYS.notifications, []);
  }

  // Auth Session
  getSession(): AuthSession | null {
    return getFromStorage<AuthSession | null>(STORAGE_KEYS.session, null);
  }

  setSession(session: AuthSession | null): void {
    setToStorage(STORAGE_KEYS.session, session);
  }

  clearSession(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.session);
    }
  }

  // Reports
  getTodayOrders(): Order[] {
    const today = new Date().toDateString();
    return this.getOrders().filter(o =>
      new Date(o.createdAt).toDateString() === today
    );
  }

  getTodaySales(): number {
    return this.getTodayOrders()
      .filter(o => o.status === 'paid')
      .reduce((sum, o) => sum + o.total, 0);
  }

  getOrderStats() {
    const orders = this.getOrders();
    const todayOrders = this.getTodayOrders();

    return {
      totalOrders: orders.length,
      todayOrders: todayOrders.length,
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      preparingOrders: orders.filter(o => o.status === 'preparing').length,
      completedToday: todayOrders.filter(o => o.status === 'paid').length,
      todaySales: this.getTodaySales(),
    };
  }

  // Reset data (for testing)
  resetAllData(): void {
    setToStorage(STORAGE_KEYS.tables, initialTables);
    setToStorage(STORAGE_KEYS.menuItems, initialMenuItems);
    setToStorage(STORAGE_KEYS.users, initialUsers);
    setToStorage(STORAGE_KEYS.orders, []);
    setToStorage(STORAGE_KEYS.payments, []);
    setToStorage(STORAGE_KEYS.notifications, []);
    this.clearSession();
  }
}

// Singleton instance
export const store = new Store();
