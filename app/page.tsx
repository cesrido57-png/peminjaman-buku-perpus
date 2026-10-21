'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  ShieldCheck, 
  Users, 
  Search, 
  ArrowRight, 
  CheckCircle2, 
  Library, 
  Clock, 
  Sparkles,
  Award,
  BookMarked
} from 'lucide-react';
import { getBooks, getCategories, getLoans, getUsers, getCurrentUser } from '@/lib/store';
import type { Book, Category, Loan, User } from '@/types/library';

export default function HomePage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser] = useState<User>(getCurrentUser());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [loadedBooks, loadedCategories, loadedLoans, loadedUsers] = await Promise.all([
          getBooks(),
          getCategories(),
          getLoans(),
          getUsers(),
        ]);
        if (cancelled) return;
        setBooks(loadedBooks);
        setCategories(loadedCategories);
        setLoans(loadedLoans);
        setUsers(loadedUsers);
      } catch (error) {
        console.error('Gagal memuat data dari database:', error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const activeBooksCount = books.filter(b => b.status === 'active').length;
  const totalCopiesCount = books.reduce((sum, b) => sum + b.totalCopies, 0);
  const activeLoansCount = loans.filter(l => l.status === 'BORROWED').length;
  const pendingLoansCount = loans.filter(l => l.status === 'PENDING').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#34d399_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              Sistem Manajemen Perpustakaan Digital Terpadu
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
              Kelola Pustaka dan Peminjaman dengan <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Lebih Cerdas</span>
            </h1>

            <p className="text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Platform modern perpustakaan sekolah, kampus, dan komunitas. Temukan katalog buku, ajukan peminjaman secara online, dan pantau siklus pengembalian dengan akurat.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link
                href="/catalog"
                className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-2 group"
              >
                <Search className="w-4 h-4" />
                Jelajahi Katalog Buku
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              {currentUser.role === 'admin' && (
                <Link
                  href="/dashboard/admin"
                  className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold transition-all flex items-center gap-2"
                >
                  <Award className="w-4 h-4 text-emerald-400" />
                  Dashboard Admin
                </Link>
              )}

              {currentUser.role === 'staff' && (
                <Link
                  href="/dashboard/staff"
                  className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold transition-all flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Dashboard Petugas
                </Link>
              )}

              {currentUser.role === 'member' && (
                <Link
                  href="/dashboard/member"
                  className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold transition-all flex items-center gap-2"
                >
                  <BookMarked className="w-4 h-4 text-emerald-400" />
                  Peminjaman Saya
                </Link>
              )}
            </div>
          </div>

          {/* Key Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-5xl mx-auto">
            <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/80 rounded-2xl p-6 text-center">
              <div className="text-3xl font-black text-white mb-1">{activeBooksCount}</div>
              <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Judul Buku Aktif</div>
            </div>
            <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/80 rounded-2xl p-6 text-center">
              <div className="text-3xl font-black text-emerald-400 mb-1">{totalCopiesCount}</div>
              <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Eksemplar</div>
            </div>
            <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/80 rounded-2xl p-6 text-center">
              <div className="text-3xl font-black text-teal-400 mb-1">{activeLoansCount}</div>
              <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Pinjaman Aktif</div>
            </div>
            <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/80 rounded-2xl p-6 text-center">
              <div className="text-3xl font-black text-amber-400 mb-1">{pendingLoansCount}</div>
              <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Permintaan Pending</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Kategori Pustaka</h2>
            <p className="text-sm text-slate-500">Pilih kategori untuk mempermudah pencarian referensi bacaan.</p>
          </div>
          <Link href="/catalog" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
            Lihat Semua Katalog <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {categories.map((cat) => {
            const count = books.filter(b => b.categoryId === cat.id && b.status === 'active').length;
            return (
              <Link
                key={cat.id}
                href={`/catalog?category=${cat.id}`}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-500/50 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    {cat.name.charAt(0)}
                  </div>
                  <h3 className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors mb-1">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {cat.description || 'Koleksi buku pilihan.'}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
                  <span>{count} Judul Tersedia</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Books */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">Buku Unggulan Terbaru</h2>
              <p className="text-sm text-slate-500">Koleksi referensi buku terbaru yang siap dipinjam.</p>
            </div>
            <Link href="/catalog" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              Buka Katalog Lengkap <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {books.filter(b => b.status === 'active').slice(0, 4).map((book) => (
              <div 
                key={book.id}
                className="bg-slate-50 rounded-2xl border border-slate-200/80 overflow-hidden hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-48 w-full bg-slate-200 overflow-hidden">
                    <img 
                      src={book.coverUrl || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=800'} 
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm ${book.availableCopies > 0 ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
                        {book.availableCopies > 0 ? `${book.availableCopies} Tersedia` : 'Habis'}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <p className="text-xs font-semibold text-emerald-600 mb-1">
                      {categories.find(c => c.id === book.categoryId)?.name || 'Umum'}
                    </p>
                    <h3 className="font-bold text-slate-900 line-clamp-1 mb-1 group-hover:text-emerald-600 transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-xs text-slate-500 mb-3">
                      Oleh {book.authors.join(', ')} ({book.publicationYear})
                    </p>
                    <p className="text-xs text-slate-600 line-clamp-2">
                      {book.description || 'Tidak ada deskripsi.'}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <Link
                    href={`/catalog?book=${book.id}`}
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    Lihat Detail & Pinjam
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
