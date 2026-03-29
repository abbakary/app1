'use client';

import { useState, useEffect } from 'react';
import { Users, Search, Shield, Trash2, Mail, Building, Filter, MoreVertical } from 'lucide-react';
import type { User } from '@/lib/types';
import { toast } from 'sonner';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function GlobalUsersManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [fetching, setFetching] = useState(true);
    const [search, setSearch] = useState('');
    const [viewingUser, setViewingUser] = useState<User | null>(null);

    const fetchUsers = async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/platform/users`);
            if (res.ok) setUsers(await res.json());
        } catch {
            toast.error('Failed to fetch global users');
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDeleteUser = async (id: string) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
        try {
            const res = await fetch(`${BASE_URL}/api/platform/users/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('User deleted successfully');
                fetchUsers();
                if (viewingUser?.id === id) setViewingUser(null);
            }
        } catch {
            toast.error('Failed to delete user');
        }
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.role.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-10 space-y-12 bg-gray-50/50 dark:bg-transparent min-h-full">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-5xl font-black tracking-tighter text-gray-900 dark:text-white mb-2">
                        Global Users
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-bold flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Manage every identity across the platform
                    </p>
                </div>

                <div className="relative group w-full md:w-[450px]">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by name, email or role..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-white dark:bg-[#1C1C1E] border-2 border-transparent focus:border-indigo-500 rounded-[32px] py-5 pl-16 pr-8 text-sm font-black shadow-xl shadow-black/5 outline-none transition-all"
                    />
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white dark:bg-[#1C1C1E] rounded-[48px] overflow-hidden border border-gray-100 dark:border-white/5 shadow-2xl shadow-black/5">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-black/40 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 dark:text-gray-500">
                                <th className="px-12 py-8">User Identity</th>
                                <th className="px-12 py-8">Access Level</th>
                                <th className="px-12 py-8">Organization</th>
                                <th className="px-12 py-8 text-right">Control</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                            {fetching ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i}>
                                        <td colSpan={4} className="px-12 py-10">
                                            <div className="h-8 bg-gray-100 dark:bg-white/5 rounded-2xl animate-pulse w-full" />
                                        </td>
                                    </tr>
                                ))
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-12 py-32 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-20 h-20 rounded-[32px] bg-gray-50 dark:bg-white/5 flex items-center justify-center">
                                                <Search className="w-8 h-8 text-gray-200" />
                                            </div>
                                            <p className="text-xl font-black text-gray-400 dark:text-gray-500 italic">No users found matching your search.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((u) => (
                                    <tr key={u.id} className="group hover:bg-indigo-50/30 dark:hover:bg-indigo-900/5 transition-all duration-300">
                                        <td className="px-12 py-8">
                                            <div className="flex items-center gap-6">
                                                <div className="w-16 h-16 rounded-[24px] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black text-white text-2xl shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                                                    {u.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-black text-gray-900 dark:text-white text-lg leading-tight group-hover:text-indigo-600 transition-colors">{u.name}</p>
                                                    <div className="flex items-center gap-2 text-gray-400 mt-1">
                                                        <Mail className="w-3.5 h-3.5" />
                                                        <span className="text-xs font-bold">{u.email || 'no-email@platform.com'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-12 py-8">
                                            <span className={`inline-flex items-center gap-3 px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] ${u.role === 'sysadmin'
                                                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                                                    : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                                                }`}>
                                                {u.role === 'sysadmin' ? <Shield className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" />}
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-12 py-8">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-black/20 text-gray-400">
                                                    <Building className="w-4 h-4" />
                                                </div>
                                                <span className={`text-sm font-black ${u.restaurantId ? 'text-gray-600 dark:text-gray-400' : 'text-indigo-500'}`}>
                                                    {u.restaurantId ? `Tenant Associated` : 'Global Admin'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-12 py-8 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <button 
                                                    onClick={() => setViewingUser(u)}
                                                    className="p-4 bg-gray-50 dark:bg-white/5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-2xl transition-all active:scale-90"
                                                >
                                                    <MoreVertical className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(u.id)}
                                                    className="p-4 bg-red-50 dark:bg-red-900/10 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-2xl transition-all active:scale-90"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── View User Modal ── */}
            {viewingUser && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setViewingUser(null)} />
                    <div className="relative bg-white dark:bg-[#1C1C1E] w-full max-w-lg rounded-[64px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="h-32 bg-gradient-to-r from-indigo-600 to-purple-600" />
                        <div className="px-12 pb-12">
                            <div className="w-32 h-32 rounded-[40px] bg-white dark:bg-[#1C1C1E] p-2 -mt-16 mb-8 shadow-2xl relative z-10">
                                <div className="w-full h-full rounded-[32px] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black text-5xl text-white">
                                    {viewingUser.name.charAt(0).toUpperCase()}
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div>
                                    <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter mb-2">{viewingUser.name}</h2>
                                    <p className="text-gray-500 font-bold flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-indigo-500" />
                                        {viewingUser.email || 'Global Identity'}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    <div className="p-6 rounded-[32px] bg-gray-50 dark:bg-black/20 border border-black/5 flex items-center justify-between">
                                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Platform Role</span>
                                        <span className="text-sm font-black text-indigo-600 uppercase tracking-widest">{viewingUser.role}</span>
                                    </div>
                                    <div className="p-6 rounded-[32px] bg-gray-50 dark:bg-black/20 border border-black/5 flex items-center justify-between">
                                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">User ID</span>
                                        <span className="text-xs font-mono font-bold text-gray-500">{viewingUser.id}</span>
                                    </div>
                                    <div className="p-6 rounded-[32px] bg-gray-50 dark:bg-black/20 border border-black/5 flex items-center justify-between">
                                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Member Since</span>
                                        <span className="text-sm font-black text-gray-900 dark:text-white">
                                            {new Date(viewingUser.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                        </span>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => handleDeleteUser(viewingUser.id)}
                                    className="w-full py-5 rounded-3xl bg-red-50 text-red-600 font-black text-sm transition-all hover:bg-red-100 active:scale-95"
                                >
                                    Terminate Account
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
