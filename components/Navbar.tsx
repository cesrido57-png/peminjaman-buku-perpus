'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  BookOpen, 
  ShieldCheck, 
  UserCheck, 
  Users, 
  LayoutDashboard, 
  Search, 
  FileText, 
  Settings, 
  LogOut, 
  ChevronDown,
  Library,
  BookMarked,
  Bell
} from 'lucide-react';
import { User, Role } from '@/types/library';
import { getCurrentUser, setCurrentUser, getUsers, getLoans } from '@/lib/store';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setUsr] = useState<User>(getCurrentUser());
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    setUsr(getCurrentUser());
    setAllUsers(getUsers());
    
    // count pending requests for staff/admin or my loans for member
    const loans = getLoans();
    if (currentUser.role === 'admin' || currentUser.role === 'staff') {
      const pending = loans.filter(l => l.status === 'PENDING').length;
      setPendingCount(pending);
    } else {
      const myActive = loans.filter(l => l.memberId === currentUser.uid && ['BORROWED'].includes(l.status)).length;
      setPendingCount(myActive);
    }
  }, [pathname]);

  const handleSwitchUser = (user: User) => {
    setCurrentUser(user);
    setUsr(user);
    setShowRoleMenu(false);
    
    // redirect based on role
    if (user.role === 'admin') router.push('/dashboard/admin');
    else if (user.role === 'staff') router.push('/dashboard/staff');
    else router.push('/dashboard/member');
  };

  const roleColors = {
    admin: 'bg-red-100 text-red-800 border-red-200',
    staff: 'bg-amber-100 text-amber-800 border-amber-200',
    member: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  };

  const roleLabels = {
    admin: 'Admin Sistem',
    staff: 'Petugas Perpustakaan',
    member: 'Anggota',
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Library className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Pustaka
                </span>
                <span className="block text-[10px] font-medium text-slate-500 tracking-wider uppercase">
                  Library System
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1 ml-8">
              <Link 
                href="/catalog" 
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${pathname?.startsWith('/catalog') ? 'bg-slate-100 text-emerald-700 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
              >
                <Search className="w-4 h-4 text-slate-400" />
                Katalog Buku
              </Link>

              {currentUser.role === 'admin' && (
                <Link 
                  href="/dashboard/admin" 
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${pathname?.startsWith('/dashboard/admin') ? 'bg-slate-100 text-emerald-700 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
                >
                  <LayoutDashboard className="w-4 h-4 text-slate-400" />
                  Dashboard Admin
                </Link>
              )}

              {currentUser.role === 'staff' && (
                <Link 
                  href="/dashboard/staff" 
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${pathname?.startsWith('/dashboard/staff') ? 'bg-slate-100 text-emerald-700 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
                >
                  <ShieldCheck className="w-4 h-4 text-slate-400" />
                  Dashboard Petugas
                </Link>
              )}

              {currentUser.role === 'member' && (
                <Link 
                  href="/dashboard/member" 
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${pathname?.startsWith('/dashboard/member') ? 'bg-slate-100 text-emerald-700 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
                >
                  <BookMarked className="w-4 h-4 text-slate-400" />
                  Peminjaman Saya
                </Link>
              )}

              <Link 
                href="/reports" 
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${pathname?.startsWith('/reports') ? 'bg-slate-100 text-emerald-700 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
              >
                <FileText className="w-4 h-4 text-slate-400" />
                Laporan
              </Link>
            </nav>
          </div>

          {/* User Info & Role Switcher */}
          <div className="flex items-center gap-4">
            {/* Notification Badge */}
            <div className="relative hidden sm:block">
              <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer" title="Notifikasi">
                <Bell className="w-4 h-4" />
                {pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                    {pendingCount}
                  </span>
                )}
              </div>
            </div>

            {/* Role & User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-100 transition-all text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white font-bold flex items-center justify-center text-sm">
                  {currentUser.displayName.charAt(0)}
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs font-semibold text-slate-900 truncate max-w-[120px]">
                    {currentUser.displayName.split(' ')[0]}
                  </div>
                  <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${roleColors[currentUser.role]}`}>
                    {roleLabels[currentUser.role]}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 pb-3 border-b border-slate-100">
                    <p className="text-xs text-slate-500 font-medium">Masuk Sebagai:</p>
                    <p className="text-sm font-bold text-slate-900 truncate">{currentUser.displayName}</p>
                    <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                    <div className="mt-2">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide border ${roleColors[currentUser.role]}`}>
                        Peran: {roleLabels[currentUser.role]}
                      </span>
                    </div>
                  </div>

                  <div className="px-3 pt-3 pb-1">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-2">
                      Ganti Peran / Akun Pengujian:
                    </p>
                    <div className="space-y-1">
                      {allUsers.map((u) => (
                        <button
                          key={u.uid}
                          onClick={() => handleSwitchUser(u)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${u.uid === currentUser.uid ? 'bg-emerald-50 text-emerald-900 font-bold' : 'text-slate-700 hover:bg-slate-50'}`}
                        >
                          <div className="text-left truncate">
                            <p className="truncate">{u.displayName}</p>
                            <span className="text-[10px] text-slate-400 uppercase">{u.role}</span>
                          </div>
                          {u.uid === currentUser.uid && (
                            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-slate-100 mt-2 pt-2 px-3">
                    <div className="text-[10px] text-slate-400 px-2 py-1">
                      Pustaka MVP v1.0 • Sesuai PRD
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
