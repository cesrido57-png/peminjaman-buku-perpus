'use client';

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  Settings as SettingsIcon, 
  FileText, 
  ShieldAlert, 
  Plus, 
  Edit, 
  Archive, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  X,
  Save,
  UserCheck
} from 'lucide-react';
import { 
  getBooks, 
  getCategories, 
  getUsers, 
  getLoans, 
  getSettings, 
  getAuditLogs, 
  getCurrentUser, 
  INITIAL_SETTINGS, 
  saveBook, 
  archiveBook, 
  saveCategory, 
  updateSettings, 
  updateUserStatus 
} from '@/lib/store';
import { Book, Category, User, SystemSettings, AuditLog, Loan } from '@/types/library';

export default function AdminDashboard() {
  const [currentUser] = useState<User>(getCurrentUser());
  const [activeTab, setActiveTab] = useState<'overview' | 'books' | 'categories' | 'members' | 'settings' | 'logs'>('overview');
  
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [settings, setSettings] = useState<SystemSettings>(INITIAL_SETTINGS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Modal states for Book CRUD
  const [showBookModal, setShowBookModal] = useState(false);
  const [editingBook, setEditingBook] = useState<Partial<Book> | null>(null);

  // Modal states for Category CRUD
  const [showCatModal, setShowCatModal] = useState(false);
  const [editingCat, setEditingCat] = useState<Partial<Category> | null>(null);

  // Toast
  const [toast, setToast] = useState<string | null>(null);

  const refreshAll = async (isCancelled?: () => boolean) => {
    try {
      const [loadedBooks, loadedCategories, loadedUsers, loadedLoans, loadedSettings, loadedAuditLogs] = await Promise.all([
        getBooks(),
        getCategories(),
        getUsers(),
        getLoans(),
        getSettings(),
        getAuditLogs(),
      ]);
      if (isCancelled?.()) return;
      setBooks(loadedBooks);
      setCategories(loadedCategories);
      setUsers(loadedUsers);
      setLoans(loadedLoans);
      setSettings(loadedSettings);
      setAuditLogs(loadedAuditLogs);
    } catch (error) {
      console.error('Gagal memuat data dari database:', error);
    }
  };

  useEffect(() => {
    let cancelled = false;
    refreshAll(() => cancelled);
    return () => {
      cancelled = true;
    };
  }, []);

  if (currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md text-center border border-slate-200 shadow-xl">
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900">Akses Ditolak</h2>
          <p className="text-sm text-slate-500 mt-2">Anda harus masuk sebagai Admin Sistem untuk membuka halaman ini.</p>
        </div>
      </div>
    );
  }

  const handleSaveBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBook || !editingBook.title) return;
    try {
      await saveBook(editingBook, currentUser);
      setShowBookModal(false);
      setEditingBook(null);
      setToast('Buku berhasil disimpan.');
      refreshAll();
      setTimeout(() => setToast(null), 3000);
    } catch (error) {
      setToast(error instanceof Error ? error.message : 'Gagal menyimpan buku.');
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleSaveCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCat || !editingCat.name) return;
    try {
      await saveCategory(editingCat, currentUser);
      setShowCatModal(false);
      setEditingCat(null);
      setToast('Kategori berhasil disimpan.');
      refreshAll();
      setTimeout(() => setToast(null), 3000);
    } catch (error) {
      setToast(error instanceof Error ? error.message : 'Gagal menyimpan kategori.');
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleUpdateSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await updateSettings(settings, currentUser);
      setSettings(updated);
      setToast('Pengaturan kebijakan perpustakaan berhasil diperbarui.');
      refreshAll();
      setTimeout(() => setToast(null), 3000);
    } catch (error) {
      setToast(error instanceof Error ? error.message : 'Gagal memperbarui pengaturan.');
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleToggleArchiveBook = async (bookId: string) => {
    try {
      await archiveBook(bookId, currentUser);
      refreshAll();
    } catch (error) {
      setToast(error instanceof Error ? error.message : 'Gagal mengubah status buku.');
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleToggleUserStatus = async (uid: string, status: 'active' | 'inactive') => {
    try {
      await updateUserStatus(uid, status, currentUser);
      refreshAll();
    } catch (error) {
      setToast(error instanceof Error ? error.message : 'Gagal mengubah status pengguna.');
      setTimeout(() => setToast(null), 3000);
    }
  };

  // Stats calculation
  const totalBooks = books.filter(b => b.status === 'active').length;
  const totalCopies = books.reduce((s, b) => s + b.totalCopies, 0);
  const activeLoansCount = loans.filter(l => l.status === 'BORROWED').length;
  const pendingCount = loans.filter(l => l.status === 'PENDING').length;
  const activeMembersCount = users.filter(u => u.status === 'active').length;

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
              Panel Kendali Administrator
            </div>
            <h1 className="text-3xl font-black tracking-tight">Manajemen Sistem Pustaka</h1>
            <p className="text-slate-400 text-sm mt-1">Kelola inventaris buku, kategori, akun pengguna, dan kebijakan operasional perpustakaan.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setEditingBook({ title: '', authors: [''], totalCopies: 3, categoryId: categories[0]?.id || '' }); setShowBookModal(true); }}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/30 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Tambah Buku Baru
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {toast && (
          <div className="mb-6 bg-emerald-50 text-emerald-900 border border-emerald-200 p-4 rounded-2xl flex items-center gap-3 text-sm font-medium shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{toast}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto gap-2 border-b border-slate-200 pb-4 mb-8">
          {[
            { id: 'overview', label: 'Ringkasan', icon: LayoutDashboard },
            { id: 'books', label: `Kelola Buku (${books.length})`, icon: BookOpen },
            { id: 'categories', label: `Kategori (${categories.length})`, icon: FileText },
            { id: 'members', label: `Pengguna & Petugas (${users.length})`, icon: Users },
            { id: 'settings', label: 'Kebijakan', icon: SettingsIcon },
            { id: 'logs', label: 'Audit Log', icon: ShieldAlert },
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

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
                <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Judul Buku</div>
                <div className="text-3xl font-black text-slate-900">{totalBooks}</div>
                <div className="text-xs text-emerald-600 font-medium mt-2">{totalCopies} total eksemplar</div>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
                <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Pinjaman Aktif</div>
                <div className="text-3xl font-black text-emerald-600">{activeLoansCount}</div>
                <div className="text-xs text-slate-500 mt-2">Sedang dipinjam</div>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
                <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Permintaan Pending</div>
                <div className="text-3xl font-black text-amber-600">{pendingCount}</div>
                <div className="text-xs text-slate-500 mt-2">Menunggu persetujuan</div>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
                <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Anggota Aktif</div>
                <div className="text-3xl font-black text-teal-600">{activeMembersCount}</div>
                <div className="text-xs text-slate-500 mt-2">Terdaftar di sistem</div>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
                <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Masa Pinjam</div>
                <div className="text-3xl font-black text-slate-900">{settings.loanDurationDays} <span className="text-sm font-normal text-slate-500">Hari</span></div>
                <div className="text-xs text-slate-500 mt-2">Maks {settings.maxActiveCopiesPerMember} buku/anggota</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Audit Logs */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-lg font-bold text-slate-900">Audit Log Terbaru</h3>
                <div className="space-y-3">
                  {auditLogs.slice(0, 5).map(log => (
                    <div key={log.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900 block">{log.action}</span>
                        <span className="text-slate-500">Oleh {log.actorName} ({log.actorRole})</span>
                      </div>
                      <span className="text-slate-400 font-mono text-[10px]">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Policy Summary */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-lg font-bold text-slate-900">Kebijakan Perpustakaan Aktif</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between p-3 rounded-xl bg-slate-50">
                    <span className="text-slate-600">Nama Perpustakaan</span>
                    <span className="font-bold text-slate-900">{settings.libraryName}</span>
                  </div>
                  <div className="flex justify-between p-3 rounded-xl bg-slate-50">
                    <span className="text-slate-600">Batas Maksimal Pinjaman</span>
                    <span className="font-bold text-slate-900">{settings.maxActiveCopiesPerMember} eksemplar</span>
                  </div>
                  <div className="flex justify-between p-3 rounded-xl bg-slate-50">
                    <span className="text-slate-600">Durasi Peminjaman</span>
                    <span className="font-bold text-slate-900">{settings.loanDurationDays} hari kalender</span>
                  </div>
                  <div className="flex justify-between p-3 rounded-xl bg-slate-50">
                    <span className="text-slate-600">Pembatalan oleh Anggota</span>
                    <span className="font-bold text-emerald-600">{settings.allowMemberCancellation ? 'Diizinkan (saat PENDING)' : 'Tidak Diizinkan'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BOOKS TAB */}
        {activeTab === 'books' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden animate-in fade-in">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Inventaris Katalog Buku</h3>
                <p className="text-xs text-slate-500">Tambah, ubah, atau arsipkan buku perpustakaan.</p>
              </div>
              <button
                onClick={() => { setEditingBook({ title: '', authors: [''], totalCopies: 3, categoryId: categories[0]?.id || '' }); setShowBookModal(true); }}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Tambah Buku
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="p-4">Buku</th>
                    <th className="p-4">Kategori</th>
                    <th className="p-4">ISBN / Penerbit</th>
                    <th className="p-4">Stok</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {books.map(book => {
                    const cat = categories.find(c => c.id === book.categoryId);
                    return (
                      <tr key={book.id} className="hover:bg-slate-50/50">
                        <td className="p-4 flex items-center gap-3">
                          <img src={book.coverUrl || ''} alt="" className="w-10 h-12 object-cover rounded-lg bg-slate-200 shrink-0" referrerPolicy="no-referrer" />
                          <div>
                            <span className="font-bold text-slate-900 block line-clamp-1">{book.title}</span>
                            <span className="text-slate-500">Oleh {book.authors.join(', ')}</span>
                          </div>
                        </td>
                        <td className="p-4 font-medium text-slate-700">{cat?.name || '-'}</td>
                        <td className="p-4 text-slate-600">
                          <div>{book.isbn || '-'}</div>
                          <span className="text-[10px] text-slate-400">{book.publisher} ({book.publicationYear})</span>
                        </td>
                        <td className="p-4 font-semibold text-slate-900">
                          {book.availableCopies} / {book.totalCopies} <span className="text-[10px] text-slate-400 font-normal">Tersedia</span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${book.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}>
                            {book.status}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => { setEditingBook(book); setShowBookModal(true); }}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggleArchiveBook(book.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold"
                          >
                            {book.status === 'active' ? 'Arsip' : 'Aktifkan'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CATEGORIES TAB */}
        {activeTab === 'categories' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden animate-in fade-in">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Kategori Buku</h3>
                <p className="text-xs text-slate-500">Kelola pengelompokan katalog perpustakaan.</p>
              </div>
              <button
                onClick={() => { setEditingCat({ name: '', description: '' }); setShowCatModal(true); }}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Tambah Kategori
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {categories.map(cat => {
                const bookCount = books.filter(b => b.categoryId === cat.id).length;
                return (
                  <div key={cat.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-slate-900">{cat.name}</h4>
                        <button
                          onClick={() => { setEditingCat(cat); setShowCatModal(true); }}
                          className="text-xs text-emerald-600 font-semibold hover:underline"
                        >
                          Edit
                        </button>
                      </div>
                      <p className="text-xs text-slate-600 mb-4">{cat.description || 'Tidak ada deskripsi.'}</p>
                    </div>
                    <div className="text-xs text-slate-400 font-medium pt-2 border-t border-slate-200/60">
                      {bookCount} Buku dalam kategori ini
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MEMBERS TAB */}
        {activeTab === 'members' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden animate-in fade-in">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Manajemen Pengguna & Peran</h3>
              <p className="text-xs text-slate-500">Daftar seluruh akun Admin, Petugas, dan Anggota terdaftar.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="p-4">Pengguna</th>
                    <th className="p-4">Nomor Anggota</th>
                    <th className="p-4">Peran (Role)</th>
                    <th className="p-4">Status Akun</th>
                    <th className="p-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map(u => (
                    <tr key={u.uid} className="hover:bg-slate-50/50">
                      <td className="p-4">
                        <span className="font-bold text-slate-900 block">{u.displayName}</span>
                        <span className="text-slate-500">{u.email}</span>
                      </td>
                      <td className="p-4 font-mono font-medium text-slate-700">{u.memberNumber || '-'}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${u.role === 'admin' ? 'bg-red-100 text-red-800' : u.role === 'staff' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${u.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => {
                            const newStatus = u.status === 'active' ? 'inactive' : 'active';
                            handleToggleUserStatus(u.uid, newStatus);
                          }}
                          className={`px-3 py-1.5 rounded-lg font-semibold ${u.status === 'active' ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
                        >
                          {u.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs max-w-2xl animate-in fade-in">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Pengaturan Kebijakan Peminjaman</h3>
            <p className="text-xs text-slate-500 mb-6">Sesuaikan aturan operasional peminjaman buku perpustakaan.</p>

            <form onSubmit={handleUpdateSettingsSubmit} className="space-y-6 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Perpustakaan</label>
                <input
                  type="text"
                  value={settings.libraryName}
                  onChange={e => setSettings({ ...settings, libraryName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Maksimal Pinjaman Aktif per Anggota</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={settings.maxActiveCopiesPerMember}
                    onChange={e => setSettings({ ...settings, maxActiveCopiesPerMember: parseInt(e.target.value) || 3 })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-medium"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Bawaan PRD: 3 eksemplar.</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Durasi Peminjaman (Hari Kalender)</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={settings.loanDurationDays}
                    onChange={e => setSettings({ ...settings, loanDurationDays: parseInt(e.target.value) || 7 })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-medium"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Bawaan PRD: 7 hari.</span>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={settings.allowMemberCancellation}
                    onChange={e => setSettings({ ...settings, allowMemberCancellation: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-bold text-slate-900">Izinkan Anggota membatalkan permintaan saat status masih PENDING</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-md shadow-emerald-600/30 flex items-center gap-2 text-xs"
                >
                  <Save className="w-4 h-4" /> Simpan Perubahan Kebijakan
                </button>
              </div>
            </form>
          </div>
        )}

        {/* LOGS TAB */}
        {activeTab === 'logs' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden animate-in fade-in">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Audit Log Sistem</h3>
              <p className="text-xs text-slate-500">Catatan kronologis seluruh tindakan sensitif dan operasional.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="p-4">Waktu</th>
                    <th className="p-4">Pelaku (Aktor)</th>
                    <th className="p-4">Aksi</th>
                    <th className="p-4">Entitas</th>
                    <th className="p-4">Metadata</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/50">
                      <td className="p-4 font-mono text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="p-4">
                        <span className="font-bold text-slate-900 block">{log.actorName}</span>
                        <span className="text-[10px] uppercase text-slate-400">{log.actorRole}</span>
                      </td>
                      <td className="p-4 font-semibold text-emerald-700">{log.action}</td>
                      <td className="p-4 font-mono text-slate-600">{log.entityType} ({log.entityId})</td>
                      <td className="p-4 font-mono text-[10px] text-slate-500 max-w-xs truncate">
                        {JSON.stringify(log.metadata || {})}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* BOOK EDIT / CREATE MODAL */}
        {showBookModal && editingBook && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">{editingBook.id ? 'Edit Buku' : 'Tambah Buku Baru'}</h3>
                <button onClick={() => setShowBookModal(false)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveBookSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Judul Buku *</label>
                  <input
                    type="text"
                    required
                    value={editingBook.title || ''}
                    onChange={e => setEditingBook({ ...editingBook, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Penulis (pisahkan dengan koma)</label>
                  <input
                    type="text"
                    value={editingBook.authors?.join(', ') || ''}
                    onChange={e => setEditingBook({ ...editingBook, authors: e.target.value.split(',').map(s => s.trim()) })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Kategori</label>
                    <select
                      value={editingBook.categoryId || ''}
                      onChange={e => setEditingBook({ ...editingBook, categoryId: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-medium"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Total Eksemplar</label>
                    <input
                      type="number"
                      min={1}
                      value={editingBook.totalCopies || 1}
                      onChange={e => setEditingBook({ ...editingBook, totalCopies: parseInt(e.target.value) || 1 })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Penerbit</label>
                    <input
                      type="text"
                      value={editingBook.publisher || ''}
                      onChange={e => setEditingBook({ ...editingBook, publisher: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tahun Terbit</label>
                    <input
                      type="number"
                      value={editingBook.publicationYear || new Date().getFullYear()}
                      onChange={e => setEditingBook({ ...editingBook, publicationYear: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">ISBN</label>
                  <input
                    type="text"
                    value={editingBook.isbn || ''}
                    onChange={e => setEditingBook({ ...editingBook, isbn: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">URL Gambar Sampul (Cover URL)</label>
                  <input
                    type="url"
                    value={editingBook.coverUrl || ''}
                    onChange={e => setEditingBook({ ...editingBook, coverUrl: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sinopsis / Deskripsi</label>
                  <textarea
                    rows={3}
                    value={editingBook.description || ''}
                    onChange={e => setEditingBook({ ...editingBook, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-medium"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                  <button type="button" onClick={() => setShowBookModal(false)} className="px-5 py-2.5 rounded-xl border border-slate-300 font-semibold text-slate-700">
                    Batal
                  </button>
                  <button type="submit" className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-600/30">
                    Simpan Buku
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* CATEGORY MODAL */}
        {showCatModal && editingCat && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">{editingCat.id ? 'Edit Kategori' : 'Tambah Kategori Baru'}</h3>
                <button onClick={() => setShowCatModal(false)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveCategorySubmit} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Kategori *</label>
                  <input
                    type="text"
                    required
                    value={editingCat.name || ''}
                    onChange={e => setEditingCat({ ...editingCat, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Deskripsi</label>
                  <textarea
                    rows={3}
                    value={editingCat.description || ''}
                    onChange={e => setEditingCat({ ...editingCat, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-medium"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                  <button type="button" onClick={() => setShowCatModal(false)} className="px-5 py-2.5 rounded-xl border border-slate-300 font-semibold text-slate-700">
                    Batal
                  </button>
                  <button type="submit" className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-600/30">
                    Simpan Kategori
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
