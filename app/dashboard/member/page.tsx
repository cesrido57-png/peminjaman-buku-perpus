'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BookMarked, 
  Clock, 
  CheckCircle2, 
  BookOpen, 
  AlertCircle, 
  ArrowRight, 
  Calendar, 
  X,
  Library,
  ShieldCheck
} from 'lucide-react';
import { getLoans, getCurrentUser, cancelLoan, getSettings } from '@/lib/store';
import { Loan, User, SystemSettings } from '@/types/library';

export default function MemberDashboard() {
  const [currentUser] = useState<User>(getCurrentUser());
  const [loans, setLoans] = useState<Loan[]>([]);
  const [settings, setSettings] = useState<SystemSettings>({ maxActiveCopiesPerMember: 3, loanDurationDays: 7, allowMemberCancellation: true, libraryName: '', libraryAddress: '', updatedAt: '', updatedBy: '' });
  const [toast, setToast] = useState<string | null>(null);

  const refreshData = async () => {
    const [loadedLoans, loadedSettings] = await Promise.all([getLoans(), getSettings()]);
    setLoans(loadedLoans);
    setSettings(loadedSettings);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [loadedLoans, loadedSettings] = await Promise.all([getLoans(), getSettings()]);
        if (cancelled) return;
        setLoans(loadedLoans);
        setSettings(loadedSettings);
      } catch (error) {
        console.error('Gagal memuat data dari database:', error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleCancel = async (loanId: string) => {
    try {
      const res = await cancelLoan(loanId, currentUser);
      setToast(res.message);
      const loadedLoans = await getLoans();
      setLoans(loadedLoans);
      setTimeout(() => setToast(null), 3000);
    } catch (error) {
      console.error('Gagal membatalkan pinjaman:', error);
    }
  };

  const myLoans = loans.filter(l => l.memberId === currentUser.uid);
  const pendingRequests = myLoans.filter(l => l.status === 'PENDING');
  const approvedRequests = myLoans.filter(l => l.status === 'APPROVED');
  const activeBorrowed = myLoans.filter(l => l.status === 'BORROWED');
  const historyLoans = myLoans.filter(l => ['RETURNED', 'REJECTED', 'CANCELLED'].includes(l.status));

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
              Dashboard Anggota Pustaka
            </div>
            <h1 className="text-3xl font-black tracking-tight">Halo, {currentUser.displayName}</h1>
            <p className="text-slate-300 text-sm mt-1">Nomor Anggota: <strong className="text-white font-mono">{currentUser.memberNumber || 'MEM-101'}</strong> • Pantau status peminjaman buku Anda.</p>
          </div>
          <div>
            <Link
              href="/catalog"
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-2"
            >
              <Library className="w-4 h-4" /> Cari Buku di Katalog
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {toast && (
          <div className="mb-6 bg-emerald-50 text-emerald-900 border border-emerald-200 p-4 rounded-2xl flex items-center gap-3 text-sm font-medium shadow-sm animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{toast}</span>
          </div>
        )}

        {/* Status Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-1">Pinjaman Aktif Saat Ini</div>
            <div className="text-3xl font-black text-slate-900">{activeBorrowed.length} <span className="text-sm font-normal text-slate-500">/ {settings.maxActiveCopiesPerMember} maks</span></div>
            <div className="text-xs text-emerald-600 font-medium mt-2">Batas waktu sesuai ketentuan perpustakaan</div>
          </div>
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-1">Permintaan Pending</div>
            <div className="text-3xl font-black text-amber-600">{pendingRequests.length}</div>
            <div className="text-xs text-slate-500 mt-2">Menunggu tinjauan petugas</div>
          </div>
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-1">Siap Diambil</div>
            <div className="text-3xl font-black text-teal-600">{approvedRequests.length}</div>
            <div className="text-xs text-slate-500 mt-2">Silakan kunjungi perpustakaan</div>
          </div>
        </div>

        {/* Active Borrowed Books */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden mb-8">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Buku yang Sedang Anda Pinjam</h3>
            <span className="text-xs text-slate-500 font-medium">{activeBorrowed.length} Buku Aktif</span>
          </div>

          <div className="divide-y divide-slate-100">
            {activeBorrowed.map(loan => {
              const due = loan.dueAt ? new Date(loan.dueAt) : new Date();
              const isOverdue = Date.now() > due.getTime();
              return (
                <div key={loan.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-50/50">
                  <div className="flex items-start gap-4">
                    <img 
                      src={loan.items[0]?.coverUrl || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=800'} 
                      alt="" 
                      className="w-16 h-20 object-cover rounded-xl bg-slate-100 shrink-0 shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${isOverdue ? 'bg-red-100 text-red-800' : 'bg-teal-100 text-teal-800'}`}>
                          {isOverdue ? 'Terlambat Dikembalikan' : 'Sedang Dipinjam'}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">Diserahkan: {new Date(loan.handedOverAt || '').toLocaleDateString()}</span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900">{loan.items.map(i => i.bookTitle).join(', ')}</h4>
                      <div className="flex items-center gap-2 text-xs text-slate-600 mt-2 font-medium">
                        <Calendar className="w-4 h-4 text-emerald-600" />
                        <span>Jatuh Tempo Pengembalian: <strong className={isOverdue ? 'text-red-600' : 'text-slate-900'}>{due.toLocaleDateString()}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">Harap kembalikan tepat waktu</span>
                    <span className="text-xs font-bold text-slate-900">di meja layanan perpustakaan</span>
                  </div>
                </div>
              );
            })}

            {activeBorrowed.length === 0 && (
              <div className="p-12 text-center text-slate-500 text-sm">
                Anda tidak memiliki pinjaman buku yang aktif saat ini.
              </div>
            )}
          </div>
        </div>

        {/* Pending & Approved Requests */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Pending Requests */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Permintaan Menunggu (Pending)</h3>
            <div className="space-y-3">
              {pendingRequests.map(loan => (
                <div key={loan.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">{loan.items.map(i => i.bookTitle).join(', ')}</span>
                    <span className="text-slate-500">Diajukan: {new Date(loan.requestedAt).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded font-bold uppercase bg-amber-100 text-amber-800">PENDING</span>
                    {settings.allowMemberCancellation && (
                      <button
                        onClick={() => handleCancel(loan.id)}
                        className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-semibold"
                      >
                        Batalkan
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {pendingRequests.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-6">Tidak ada permintaan pending.</p>
              )}
            </div>
          </div>

          {/* Approved Requests (Ready for Pickup) */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Siap Diambil di Perpustakaan (Approved)</h3>
            <div className="space-y-3">
              {approvedRequests.map(loan => (
                <div key={loan.id} className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">{loan.items.map(i => i.bookTitle).join(', ')}</span>
                    <span className="text-emerald-700 font-medium">Disetujui oleh petugas. Silakan ambil fisik buku.</span>
                  </div>
                  <span className="px-2 py-0.5 rounded font-bold uppercase bg-emerald-100 text-emerald-800">APPROVED</span>
                </div>
              ))}
              {approvedRequests.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-6">Tidak ada buku yang siap diambil.</p>
              )}
            </div>
          </div>
        </div>

        {/* History */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">Riwayat Peminjaman Anda</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="p-4">Buku</th>
                  <th className="p-4">Tanggal Pengajuan</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {historyLoans.map(loan => (
                  <tr key={loan.id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-bold text-slate-900">{loan.items.map(i => i.bookTitle).join(', ')}</td>
                    <td className="p-4 font-mono text-slate-500">{new Date(loan.requestedAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${loan.status === 'RETURNED' ? 'bg-emerald-100 text-emerald-800' : loan.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-slate-200 text-slate-700'}`}>
                        {loan.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500">
                      {loan.rejectionReason ? <span className="text-red-600">Ditolak: {loan.rejectionReason}</span> : loan.status === 'RETURNED' ? 'Telah dikembalikan' : 'Dibatalkan'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
