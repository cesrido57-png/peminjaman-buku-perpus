'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  BookOpen, 
  ArrowRight, 
  AlertCircle, 
  Check, 
  X, 
  RotateCcw,
  PackageCheck
} from 'lucide-react';
import { 
  getLoans, 
  getCurrentUser, 
  reviewLoanRequest, 
  checkoutLoan, 
  returnLoan 
} from '@/lib/store';
import { Loan, User } from '@/types/library';

export default function StaffDashboard() {
  const [currentUser] = useState<User>(getCurrentUser());
  const [loans, setLoans] = useState<Loan[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'borrowed' | 'history'>('pending');
  const [toast, setToast] = useState<string | null>(null);

  // Rejection modal
  const [rejectLoanId, setRejectLoanId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    refreshLoans();
  }, []);

  const refreshLoans = () => {
    setLoans(getLoans());
  };

  if (currentUser.role !== 'staff' && currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md text-center border border-slate-200 shadow-xl">
          <ShieldCheck className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900">Akses Terbatas</h2>
          <p className="text-sm text-slate-500 mt-2">Halaman ini khusus untuk Petugas Perpustakaan dan Admin.</p>
        </div>
      </div>
    );
  }

  const handleApprove = (loanId: string) => {
    const res = reviewLoanRequest(loanId, true, '', currentUser);
    setToast(res.message);
    refreshLoans();
    setTimeout(() => setToast(null), 3000);
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectLoanId) return;
    const res = reviewLoanRequest(rejectLoanId, false, rejectionReason || 'Stok tidak memenuhi syarat atau ketentuan perpustakaan.', currentUser);
    setToast(res.message);
    setRejectLoanId(null);
    setRejectionReason('');
    refreshLoans();
    setTimeout(() => setToast(null), 3000);
  };

  const handleCheckout = (loanId: string) => {
    const res = checkoutLoan(loanId, currentUser);
    setToast(res.message);
    refreshLoans();
    setTimeout(() => setToast(null), 3000);
  };

  const handleReturn = (loanId: string) => {
    const res = returnLoan(loanId, currentUser);
    setToast(res.message);
    refreshLoans();
    setTimeout(() => setToast(null), 3000);
  };

  const pendingList = loans.filter(l => l.status === 'PENDING');
  const approvedList = loans.filter(l => l.status === 'APPROVED');
  const borrowedList = loans.filter(l => l.status === 'BORROWED');
  const historyList = loans.filter(l => ['RETURNED', 'REJECTED', 'CANCELLED'].includes(l.status));

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-slate-700">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
              Dashboard Operasional Petugas
            </div>
            <h1 className="text-3xl font-black tracking-tight">Manajemen Alur Peminjaman & Buku</h1>
            <p className="text-slate-400 text-sm mt-1">Tinjau permintaan peminjaman online, konfirmasi penyerahan fisik, dan proses pengembalian.</p>
          </div>
          <div className="bg-slate-800/80 border border-slate-700 px-5 py-3 rounded-2xl flex items-center gap-4 text-xs font-semibold">
            <div>
              <span className="block text-slate-400">Pending Review</span>
              <span className="text-amber-400 text-lg font-bold">{pendingList.length} Permintaan</span>
            </div>
            <div className="h-8 w-px bg-slate-700"></div>
            <div>
              <span className="block text-slate-400">Siap Checkout</span>
              <span className="text-emerald-400 text-lg font-bold">{approvedList.length} Buku</span>
            </div>
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

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto gap-2 border-b border-slate-200 pb-4 mb-8">
          {[
            { id: 'pending', label: `Permintaan Masuk (${pendingList.length})`, icon: Clock },
            { id: 'approved', label: `Menunggu Penyerahan / Checkout (${approvedList.length})`, icon: PackageCheck },
            { id: 'borrowed', label: `Sedang Dipinjam (${borrowedList.length})`, icon: BookOpen },
            { id: 'history', label: `Riwayat Selesai (${historyList.length})`, icon: RotateCcw },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${isActive ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* PENDING TAB */}
        {activeTab === 'pending' && (
          <div className="space-y-4 animate-in fade-in">
            {pendingList.map(loan => (
              <div key={loan.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-800">PENDING</span>
                      <span className="text-xs text-slate-400 font-mono">ID: {loan.id}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">
                      {loan.items.map(i => i.bookTitle).join(', ')}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1">
                      Diajukan oleh: <strong className="text-slate-900">{loan.memberName}</strong> ({loan.memberEmail})
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Waktu Pengajuan: {new Date(loan.requestedAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => setRejectLoanId(loan.id)}
                    className="px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <X className="w-4 h-4" /> Tolak
                  </button>
                  <button
                    onClick={() => handleApprove(loan.id)}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/30 flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" /> Setujui Permintaan
                  </button>
                </div>
              </div>
            ))}

            {pendingList.length === 0 && (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-900">Tidak ada permintaan pending</h3>
                <p className="text-sm text-slate-500 mt-1">Semua permintaan peminjaman telah ditinjau.</p>
              </div>
            )}
          </div>
        )}

        {/* APPROVED / CHECKOUT TAB */}
        {activeTab === 'approved' && (
          <div className="space-y-4 animate-in fade-in">
            {approvedList.map(loan => (
              <div key={loan.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <PackageCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">APPROVED</span>
                      <span className="text-xs text-slate-400 font-mono">Disetujui oleh {loan.reviewedBy}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">
                      {loan.items.map(i => i.bookTitle).join(', ')}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1">
                      Peminjam: <strong className="text-slate-900">{loan.memberName}</strong>
                    </p>
                    <p className="text-[11px] text-emerald-700 mt-1 font-medium">
                      Siap untuk diambil di perpustakaan (konfirmasi penyerahan fisik).
                    </p>
                  </div>
                </div>

                <div className="shrink-0">
                  <button
                    onClick={() => handleCheckout(loan.id)}
                    className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/30 flex items-center gap-2"
                  >
                    <PackageCheck className="w-4 h-4" /> Konfirmasi Penyerahan (Checkout)
                  </button>
                </div>
              </div>
            ))}

            {approvedList.length === 0 && (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-900">Tidak ada buku siap checkout</h3>
                <p className="text-sm text-slate-500 mt-1">Setujui permintaan pending terlebih dahulu sebelum melakukan penyerahan fisik.</p>
              </div>
            )}
          </div>
        )}

        {/* BORROWED TAB */}
        {activeTab === 'borrowed' && (
          <div className="space-y-4 animate-in fade-in">
            {borrowedList.map(loan => {
              const due = loan.dueAt ? new Date(loan.dueAt) : new Date();
              const isOverdue = Date.now() > due.getTime();
              return (
                <div key={loan.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${isOverdue ? 'bg-red-50 text-red-600' : 'bg-teal-50 text-teal-600'}`}>
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${isOverdue ? 'bg-red-100 text-red-800' : 'bg-teal-100 text-teal-800'}`}>
                          {isOverdue ? 'TERLAMBAT (OVERDUE)' : 'BORROWED (AKTIF)'}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">Jatuh Tempo: {due.toLocaleDateString()}</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900">
                        {loan.items.map(i => i.bookTitle).join(', ')}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1">
                        Peminjam: <strong className="text-slate-900">{loan.memberName}</strong>
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Diserahkan pada: {new Date(loan.handedOverAt || '').toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <button
                      onClick={() => handleReturn(loan.id)}
                      className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" /> Proses Pengembalian (Return)
                    </button>
                  </div>
                </div>
              );
            })}

            {borrowedList.length === 0 && (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-900">Tidak ada pinjaman aktif</h3>
                <p className="text-sm text-slate-500 mt-1">Belum ada buku yang sedang dalam masa peminjaman.</p>
              </div>
            )}
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden animate-in fade-in">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Riwayat Transaksi Selesai</h3>
              <p className="text-xs text-slate-500">Daftar transaksi yang telah dikembalikan, ditolak, atau dibatalkan.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="p-4">Buku</th>
                    <th className="p-4">Anggota</th>
                    <th className="p-4">Status Akhir</th>
                    <th className="p-4">Waktu Selesai</th>
                    <th className="p-4">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {historyList.map(loan => (
                    <tr key={loan.id} className="hover:bg-slate-50/50">
                      <td className="p-4 font-bold text-slate-900">
                        {loan.items.map(i => i.bookTitle).join(', ')}
                      </td>
                      <td className="p-4 text-slate-700">{loan.memberName}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${loan.status === 'RETURNED' ? 'bg-emerald-100 text-emerald-800' : loan.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-slate-200 text-slate-700'}`}>
                          {loan.status}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-slate-500">
                        {loan.returnedAt ? new Date(loan.returnedAt).toLocaleString() : new Date(loan.updatedAt).toLocaleString()}
                      </td>
                      <td className="p-4 text-slate-500">
                        {loan.rejectionReason ? <span className="text-red-600">Ditolak: {loan.rejectionReason}</span> : loan.receivedBy ? `Diterima oleh ${loan.receivedBy}` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* REJECTION MODAL */}
        {rejectLoanId && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Alasan Penolakan Permintaan</h3>
                <button onClick={() => setRejectLoanId(null)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleRejectSubmit} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Berikan Alasan Penolakan *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Contoh: Stok buku habis atau anggota memiliki pinjaman bermasalah."
                    value={rejectionReason}
                    onChange={e => setRejectionReason(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-medium"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                  <button type="button" onClick={() => setRejectLoanId(null)} className="px-5 py-2.5 rounded-xl border border-slate-300 font-semibold text-slate-700">
                    Batal
                  </button>
                  <button type="submit" className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold shadow-md shadow-red-600/30">
                    Konfirmasi Penolakan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
