'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  BarChart3, 
  Download, 
  BookOpen, 
  Users, 
  CheckCircle2, 
  Calendar,
  ShieldAlert
} from 'lucide-react';
import { getBooks, getLoans, getUsers, getCategories, getCurrentUser } from '@/lib/store';
import { Book, Loan, User, Category } from '@/types/library';

export default function ReportsPage() {
  const [currentUser] = useState<User>(getCurrentUser());
  const [books, setBooks] = useState<Book[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [reportType, setReportType] = useState<'inventory' | 'active_loans' | 'history'>('inventory');

  useEffect(() => {
    setBooks(getBooks());
    setLoans(getLoans());
    setUsers(getUsers());
    setCategories(getCategories());
  }, []);

  const activeLoans = loans.filter(l => l.status === 'BORROWED');
  const completedLoans = loans.filter(l => ['RETURNED', 'REJECTED', 'CANCELLED'].includes(l.status));
  const totalCopies = books.reduce((s, b) => s + b.totalCopies, 0);
  const totalAvailable = books.reduce((s, b) => s + b.availableCopies, 0);

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <div className="bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
              Laporan Operasional Perpustakaan
            </div>
            <h1 className="text-3xl font-black tracking-tight">Statistik & Rekapitulasi Data</h1>
            <p className="text-slate-400 text-sm mt-1">Laporan inventaris buku, peminjaman aktif, dan riwayat transaksi lengkap.</p>
          </div>
          <div>
            <button
              onClick={() => alert('Fitur unduh laporan PDF/Excel tersedia di tahap P1 sesuai PRD.')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4 text-emerald-400" /> Ekspor Laporan
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Report Type Selector */}
        <div className="flex gap-2 border-b border-slate-200 pb-4 mb-8">
          {[
            { id: 'inventory', label: 'Laporan Inventaris Buku' },
            { id: 'active_loans', label: `Pinjaman Aktif (${activeLoans.length})` },
            { id: 'history', label: `Riwayat Transaksi (${loans.length})` },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setReportType(t.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${reportType === t.id ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* INVENTORY REPORT */}
        {reportType === 'inventory' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
                <div className="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-1">Total Judul Buku</div>
                <div className="text-3xl font-black text-slate-900">{books.length}</div>
              </div>
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
                <div className="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-1">Total Eksemplar Fisik</div>
                <div className="text-3xl font-black text-emerald-600">{totalCopies}</div>
              </div>
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
                <div className="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-1">Eksemplar Tersedia</div>
                <div className="text-3xl font-black text-teal-600">{totalAvailable}</div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900">Rekapitulasi Stok Per Buku</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="p-4">Judul Buku</th>
                      <th className="p-4">Kategori</th>
                      <th className="p-4">Total Eksemplar</th>
                      <th className="p-4">Tersedia</th>
                      <th className="p-4">Sedang Dipinjam</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {books.map(b => {
                      const cat = categories.find(c => c.id === b.categoryId);
                      const borrowedCount = b.totalCopies - b.availableCopies;
                      return (
                        <tr key={b.id} className="hover:bg-slate-50/50">
                          <td className="p-4 font-bold text-slate-900">{b.title}</td>
                          <td className="p-4 text-slate-600">{cat?.name || '-'}</td>
                          <td className="p-4 font-semibold text-slate-900">{b.totalCopies}</td>
                          <td className="p-4 font-semibold text-emerald-600">{b.availableCopies}</td>
                          <td className="p-4 font-semibold text-amber-600">{borrowedCount}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ACTIVE LOANS REPORT */}
        {reportType === 'active_loans' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden animate-in fade-in">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Laporan Pinjaman Aktif (BORROWED)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="p-4">Buku</th>
                    <th className="p-4">Peminjam</th>
                    <th className="p-4">Tanggal Penyerahan</th>
                    <th className="p-4">Jatuh Tempo</th>
                    <th className="p-4">Status Waktu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeLoans.map(l => {
                    const due = l.dueAt ? new Date(l.dueAt) : new Date();
                    const isOverdue = Date.now() > due.getTime();
                    return (
                      <tr key={l.id} className="hover:bg-slate-50/50">
                        <td className="p-4 font-bold text-slate-900">{l.items.map(i => i.bookTitle).join(', ')}</td>
                        <td className="p-4 text-slate-700">{l.memberName} ({l.memberEmail})</td>
                        <td className="p-4 font-mono text-slate-500">{new Date(l.handedOverAt || '').toLocaleDateString()}</td>
                        <td className="p-4 font-mono font-semibold text-slate-900">{due.toLocaleDateString()}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${isOverdue ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}`}>
                            {isOverdue ? 'Terlambat' : 'Tepat Waktu'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* HISTORY REPORT */}
        {reportType === 'history' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden animate-in fade-in">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Laporan Riwayat Keseluruhan Transaksi</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="p-4">ID Transaksi</th>
                    <th className="p-4">Buku</th>
                    <th className="p-4">Anggota</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Tanggal Pengajuan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loans.map(l => (
                    <tr key={l.id} className="hover:bg-slate-50/50">
                      <td className="p-4 font-mono text-slate-500">{l.id}</td>
                      <td className="p-4 font-bold text-slate-900">{l.items.map(i => i.bookTitle).join(', ')}</td>
                      <td className="p-4 text-slate-700">{l.memberName}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-800">{l.status}</span>
                      </td>
                      <td className="p-4 font-mono text-slate-500">{new Date(l.requestedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
