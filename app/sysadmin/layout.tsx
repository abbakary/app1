'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
    Building2,
    Users,
    LayoutDashboard,
    Settings,
    LogOut,
    Shield,
    Search,
    ChevronRight,
    Globe
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';

export default function SysAdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, isLoading, isAuthenticated, logout } = useAuth();

    // ── Auth guard ──
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.replace('/login');
        }
        if (!isLoading && isAuthenticated && user?.role !== 'sysadmin') {
            router.replace('/');
        }
    }, [isLoading, isAuthenticated, user, router]);

    if (isLoading || !isAuthenticated || user?.role !== 'sysadmin') {
        return (
            <div className="min-h-screen bg-[#F2F2F7] dark:bg-black flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, href: '/sysadmin' },
        { name: 'Organizations', icon: Building2, href: '/sysadmin/restaurants' },
        { name: 'Global Users', icon: Users, href: '/sysadmin/users' },
    ];

    return (
        <div className="min-h-screen bg-[#F2F2F7] dark:bg-background flex overflow-hidden">

            {/* ── Sidebar ── */}
            <aside className="w-72 bg-white/80 dark:bg-black/80 backdrop-blur-2xl border-r border-black/5 dark:border-white/10 flex flex-col z-50">

                {/* Brand */}
                <div className="p-8 pb-4">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                            <Globe className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-black tracking-tight text-gray-900 dark:text-white leading-none">
                                RestauFlow
                            </h1>
                            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest leading-none">
                                Platform Admin
                            </span>
                        </div>
                    </div>

                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full bg-gray-100 dark:bg-white/5 border-none rounded-2xl py-3 pl-11 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                        />
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center justify-between px-4 py-4 rounded-2xl group transition-all duration-300 ${isActive
                                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/20 active:scale-95'
                                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <item.icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                                    <span className="text-[15px] font-semibold tracking-tight">{item.name}</span>
                                </div>
                                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Card */}
                <div className="p-6">
                    <div className="bg-gradient-to-r from-gray-50 to-white dark:from-white/5 dark:to-white/10 p-5 rounded-3xl border border-black/5 dark:border-white/5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                                {user.name.charAt(0)}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.name}</p>
                                <p className="text-[10px] text-gray-500 uppercase font-black truncate tracking-tighter">Super Admin</p>
                            </div>
                        </div>
                        <button
                            onClick={() => logout()}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors border border-red-200 dark:border-red-900/20"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </div>
                </div>

            </aside>

            {/* ── Main Content Area ── */}
            <main className="flex-1 relative overflow-y-auto overflow-x-hidden bg-[#F2F2F7] dark:bg-background custom-scrollbar">
                {/* Top Header Blur Effect (Sticky inside main if needed, but here we use page header) */}
                {children}
            </main>

        </div>
    );
}
