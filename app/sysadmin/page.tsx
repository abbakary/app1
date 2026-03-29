'use client';

import { useState, useEffect } from 'react';
import {
    Building2,
    Users,
    CreditCard,
    TrendingUp,
    Server,
    Activity,
    Plus,
    Globe,
    ArrowUpRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface PlatformStats {
    total_tenants: number;
    total_users: number;
    total_orders: number;
    total_revenue: number;
}

export default function PlatformDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState<PlatformStats | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/platform/stats`);
            if (res.ok) setStats(await res.json());
        } catch {
            toast.error('Failed to load platform statistics');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const kpis = [
        {
            label: 'Active Tenants',
            value: stats?.total_tenants || 0,
            icon: Building2,
            color: 'from-blue-500 to-indigo-600',
            description: 'Connected organizations'
        },
        {
            label: 'Platform Users',
            value: stats?.total_users || 0,
            icon: Users,
            color: 'from-purple-500 to-pink-600',
            description: 'Active staff accounts'
        },
        {
            label: 'Total Orders',
            value: stats?.total_orders || 0,
            icon: Activity,
            color: 'from-orange-500 to-red-600',
            description: 'Across all locations'
        },
        {
            label: 'Global Revenue',
            value: `TSH ${(stats?.total_revenue || 0).toLocaleString()}`,
            icon: TrendingUp,
            color: 'from-emerald-500 to-teal-600',
            description: 'Combined processing'
        },
    ];

    return (
        <div className="p-10 space-y-12 bg-gray-50/50 dark:bg-transparent min-h-full">

            {/* ── Welcome Header ── */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-5xl font-black tracking-tighter text-gray-900 dark:text-white mb-3">
                        Platform <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Intelligence</span>
                    </h1>
                    <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 w-fit">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
                        <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Global Systems Operational</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4 bg-white dark:bg-white/5 backdrop-blur-xl px-6 py-4 rounded-[28px] border border-black/5 dark:border-white/10 shadow-sm">
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl">
                            <Server className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter leading-none mb-1">Infrastructure</span>
                            <span className="text-sm font-black text-gray-900 dark:text-white leading-none">Optimal</span>
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => router.push('/sysadmin/restaurants')}
                        className="group flex items-center gap-3 bg-gray-900 dark:bg-white text-white dark:text-black px-8 py-4 rounded-[28px] font-bold transition-all hover:scale-105 active:scale-95 shadow-xl shadow-black/10"
                    >
                        Provision Tenant
                        <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </button>
                </div>
            </div>

            {/* ── KPI Grid ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {kpis.map((kpi, idx) => (
                    <div
                        key={kpi.label}
                        className="relative group overflow-hidden bg-white dark:bg-[#1C1C1E] p-8 rounded-[40px] border border-black/5 dark:border-white/5 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500"
                    >
                        {/* Background Gradient Glow */}
                        <div className={`absolute -right-10 -top-10 w-40 h-40 bg-gradient-to-br ${kpi.color} opacity-0 group-hover:opacity-10 transition-opacity duration-700 rounded-full blur-3xl`} />
                        
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${kpi.color} flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/20 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                            <kpi.icon className="w-6 h-6 text-white" />
                        </div>
                        
                        <div className="space-y-1 relative z-10">
                            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">{kpi.label}</p>
                            <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                                {loading ? '...' : kpi.value}
                            </h3>
                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-y-2 group-hover:translate-y-0 transition-transform">
                                {kpi.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Secondary Section ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Platform Health */}
                <div className="lg:col-span-2 bg-white dark:bg-[#1C1C1E] p-10 rounded-[48px] border border-black/5 dark:border-white/5 shadow-sm relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-indigo-500/5 to-transparent pointer-events-none" />
                    
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Global Network Health</h2>
                            <p className="text-sm font-medium text-gray-500">Real-time infrastructure monitoring</p>
                        </div>
                        <Activity className="w-6 h-6 text-indigo-500 animate-pulse" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { label: 'Latency', value: '14ms', status: 'Optimal', color: 'text-emerald-500' },
                            { label: 'Uptime', value: '99.99%', status: 'Stable', color: 'text-blue-500' },
                            { label: 'Traffic', value: 'High', status: 'Scaling', color: 'text-indigo-500' },
                        ].map((stat) => (
                            <div key={stat.label} className="p-6 rounded-[32px] bg-gray-50 dark:bg-black/20 border border-black/5 dark:border-white/5 transition-all hover:scale-105">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{stat.label}</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">{stat.value}</span>
                                    <span className={`text-[10px] font-black uppercase ${stat.color}`}>{stat.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-gradient-to-br from-gray-900 to-black dark:from-indigo-600 dark:to-purple-700 p-10 rounded-[48px] text-white shadow-2xl shadow-indigo-500/20 flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                    <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                    
                    <div className="relative z-10">
                        <Globe className="w-10 h-10 mb-6 text-indigo-400" />
                        <h2 className="text-2xl font-black tracking-tight mb-2">Expansion Mode</h2>
                        <p className="text-sm font-medium text-indigo-200/80 leading-relaxed">
                            Ready to scale? Provision a new organization in seconds with our automated infrastructure.
                        </p>
                    </div>

                    <button 
                        onClick={() => router.push('/sysadmin/restaurants')}
                        className="relative z-10 w-full bg-white text-black py-5 rounded-3xl font-black transition-all hover:bg-indigo-50 active:scale-95 flex items-center justify-center gap-3 mt-10"
                    >
                        <Plus className="w-5 h-5" />
                        Provision New Tenant
                    </button>
                </div>

            </div>

        </div>
    );
}
