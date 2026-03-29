'use client';

import { useState, useEffect } from 'react';
import {
    CreditCard,
    TrendingUp,
    ArrowUpRight,
    ArrowDownLeft,
    Calendar,
    Filter,
    Search,
    Download,
    CheckCircle,
    AlertCircle,
    Clock,
    XCircle,
    DollarSign,
    Percent,
    RefreshCw,
    Eye,
    MoreVertical
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/auth-context';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Payment {
    id: string;
    order_id: string;
    amount: number;
    platform_fee: number;
    restaurant_amount: number;
    method: string;
    status: 'PENDING' | 'SUCCESS' | 'FAILED';
    airpay_transaction_id?: string;
    created_at: string;
}

interface PaginatedPayments {
    items: Payment[];
    total: number;
    page: number;
    limit: number;
}

export default function PaymentsPage() {
    const { user } = useAuth();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'PENDING' | 'SUCCESS' | 'FAILED'>('all');
    const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });

    const fetchPayments = async (showLoader = true) => {
        if (showLoader) setLoading(true);
        else setRefreshing(true);

        try {
            const params = new URLSearchParams({
                start_date: dateRange.start,
                end_date: dateRange.end
            });

            const res = await fetch(`${BASE_URL}/api/payments?${params}`, {
                headers: {
                    'X-Restaurant-ID': user?.restaurant_id || ''
                }
            });

            if (res.ok) {
                const data = await res.json();
                setPayments(data);
            } else {
                toast.error('Failed to load payments');
            }
        } catch (err) {
            toast.error('Error loading payments');
            console.error(err);
        } finally {
            if (showLoader) setLoading(false);
            else setRefreshing(false);
        }
    };

    useEffect(() => {
        if (user?.restaurant_id) {
            fetchPayments();
        }
    }, [user?.restaurant_id, dateRange]);

    const filteredPayments = payments
        .filter(p => {
            if (statusFilter !== 'all' && p.status !== statusFilter) return false;
            if (searchTerm && !p.order_id.toLowerCase().includes(searchTerm.toLowerCase())) return false;
            return true;
        })
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Calculate stats
    const stats = {
        totalRevenue: filteredPayments
            .filter(p => p.status === 'SUCCESS')
            .reduce((sum, p) => sum + p.amount, 0),
        totalRestaurantAmount: filteredPayments
            .filter(p => p.status === 'SUCCESS')
            .reduce((sum, p) => sum + p.restaurant_amount, 0),
        totalPlatformFee: filteredPayments
            .filter(p => p.status === 'SUCCESS')
            .reduce((sum, p) => sum + p.platform_fee, 0),
        successfulPayments: filteredPayments.filter(p => p.status === 'SUCCESS').length,
        pendingPayments: filteredPayments.filter(p => p.status === 'PENDING').length,
        failedPayments: filteredPayments.filter(p => p.status === 'FAILED').length,
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'SUCCESS':
                return <CheckCircle className="w-5 h-5 text-emerald-500" />;
            case 'PENDING':
                return <Clock className="w-5 h-5 text-amber-500" />;
            case 'FAILED':
                return <XCircle className="w-5 h-5 text-red-500" />;
            default:
                return <AlertCircle className="w-5 h-5 text-gray-400" />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'SUCCESS':
                return (
                    <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Completed</span>
                    </div>
                );
            case 'PENDING':
                return (
                    <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/30 px-3 py-1 rounded-full">
                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400">Pending</span>
                    </div>
                );
            case 'FAILED':
                return (
                    <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/30 px-3 py-1 rounded-full">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <span className="text-xs font-bold text-red-600 dark:text-red-400">Failed</span>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="p-8 space-y-8">
            
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-gray-900 dark:text-white mb-2">
                        Payment <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">Dashboard</span>
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 font-medium">Track revenue and payment splits</p>
                </div>

                <button
                    onClick={() => fetchPayments(true)}
                    disabled={refreshing}
                    className="flex items-center gap-2 bg-white dark:bg-white/5 px-6 py-3 rounded-[16px] border border-black/5 dark:border-white/10 font-bold transition-all hover:bg-gray-50 dark:hover:bg-white/10 active:scale-95 disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-[#1C1C1E] p-8 rounded-[32px] border border-black/5 dark:border-white/5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Revenue</span>
                        <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
                        TSH {stats.totalRevenue.toLocaleString()}
                    </h3>
                    <p className="text-xs text-gray-500">From {stats.successfulPayments} successful payments</p>
                </div>

                <div className="bg-white dark:bg-[#1C1C1E] p-8 rounded-[32px] border border-black/5 dark:border-white/5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Restaurant Amount</span>
                        <ArrowUpRight className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
                        TSH {stats.totalRestaurantAmount.toLocaleString()}
                    </h3>
                    <p className="text-xs text-gray-500">Your earnings</p>
                </div>

                <div className="bg-white dark:bg-[#1C1C1E] p-8 rounded-[32px] border border-black/5 dark:border-white/5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Platform Fee</span>
                        <Percent className="w-5 h-5 text-amber-600" />
                    </div>
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
                        TSH {stats.totalPlatformFee.toLocaleString()}
                    </h3>
                    <p className="text-xs text-gray-500">System commission</p>
                </div>

                <div className="bg-white dark:bg-[#1C1C1E] p-8 rounded-[32px] border border-black/5 dark:border-white/5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</span>
                        <TrendingUp className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="flex gap-4 mb-2">
                        <div>
                            <p className="text-2xl font-black text-emerald-600">{stats.successfulPayments}</p>
                            <p className="text-xs text-gray-500">Completed</p>
                        </div>
                        <div>
                            <p className="text-2xl font-black text-amber-600">{stats.pendingPayments}</p>
                            <p className="text-xs text-gray-500">Pending</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-[#1C1C1E] p-8 rounded-[32px] border border-black/5 dark:border-white/5">
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
                    {/* Search */}
                    <div className="flex-1">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            Search Order ID
                        </label>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by order ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-black/20 border border-black/5 dark:border-white/5 rounded-[16px] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            Status
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="px-4 py-3 bg-gray-50 dark:bg-black/20 border border-black/5 dark:border-white/5 rounded-[16px] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 font-medium"
                        >
                            <option value="all">All Statuses</option>
                            <option value="SUCCESS">Completed</option>
                            <option value="PENDING">Pending</option>
                            <option value="FAILED">Failed</option>
                        </select>
                    </div>

                    {/* Date Range */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            From
                        </label>
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                            className="px-4 py-3 bg-gray-50 dark:bg-black/20 border border-black/5 dark:border-white/5 rounded-[16px] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            To
                        </label>
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                            className="px-4 py-3 bg-gray-50 dark:bg-black/20 border border-black/5 dark:border-white/5 rounded-[16px] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                </div>
            </div>

            {/* Payments Table */}
            <div className="bg-white dark:bg-[#1C1C1E] rounded-[32px] border border-black/5 dark:border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-black/5 dark:border-white/5 bg-gray-50 dark:bg-black/30">
                                <th className="px-8 py-4 text-left text-xs font-black text-gray-600 dark:text-gray-400 uppercase tracking-wider">Order ID</th>
                                <th className="px-8 py-4 text-left text-xs font-black text-gray-600 dark:text-gray-400 uppercase tracking-wider">Total Amount</th>
                                <th className="px-8 py-4 text-left text-xs font-black text-gray-600 dark:text-gray-400 uppercase tracking-wider">Restaurant</th>
                                <th className="px-8 py-4 text-left text-xs font-black text-gray-600 dark:text-gray-400 uppercase tracking-wider">Platform Fee</th>
                                <th className="px-8 py-4 text-left text-xs font-black text-gray-600 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-8 py-4 text-left text-xs font-black text-gray-600 dark:text-gray-400 uppercase tracking-wider">Date</th>
                                <th className="px-8 py-4 text-center text-xs font-black text-gray-600 dark:text-gray-400 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-8 py-12 text-center">
                                        <p className="text-gray-500 dark:text-gray-400">Loading payments...</p>
                                    </td>
                                </tr>
                            ) : filteredPayments.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-8 py-12 text-center">
                                        <p className="text-gray-500 dark:text-gray-400">No payments found</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredPayments.map((payment) => (
                                    <tr
                                        key={payment.id}
                                        className="border-b border-black/5 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-black/20 transition-colors"
                                    >
                                        <td className="px-8 py-4">
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-white text-sm">{payment.order_id.slice(0, 8)}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{payment.id.slice(0, 8)}...</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4">
                                            <span className="text-sm font-bold text-gray-900 dark:text-white">
                                                TSH {payment.amount.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-8 py-4">
                                            <div className="flex items-center gap-2">
                                                <ArrowUpRight className="w-4 h-4 text-green-600" />
                                                <span className="text-sm font-bold text-gray-900 dark:text-white">
                                                    TSH {payment.restaurant_amount.toLocaleString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4">
                                            <div className="flex items-center gap-2">
                                                <Percent className="w-4 h-4 text-amber-600" />
                                                <span className="text-sm font-bold text-gray-900 dark:text-white">
                                                    TSH {payment.platform_fee.toLocaleString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4">
                                            {getStatusBadge(payment.status)}
                                        </td>
                                        <td className="px-8 py-4">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {formatDistanceToNow(new Date(payment.created_at), { addSuffix: true })}
                                            </span>
                                        </td>
                                        <td className="px-8 py-4 text-center">
                                            <button className="inline-flex items-center justify-center w-10 h-10 rounded-[12px] hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                                                <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Info Box */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-8 rounded-[32px] border border-green-200 dark:border-green-800/50">
                <div className="flex gap-4">
                    <AlertCircle className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-bold text-green-900 dark:text-green-300 mb-2">About Payment Splits</h3>
                        <p className="text-sm text-green-800 dark:text-green-400 leading-relaxed">
                            Each payment is automatically split between your restaurant and the platform. The platform fee (typically 10%) covers transaction processing, infrastructure, and support. You receive the remaining amount directly into your Airpay account.
                        </p>
                    </div>
                </div>
            </div>

        </div>
    );
}
