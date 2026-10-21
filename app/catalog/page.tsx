'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Search, 
  Filter, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle, 
  Library, 
  Calendar, 
  User, 
  X,
  BookMarked
} from 'lucide-react';
import { getBooks, getCategories, getCurrentUser, requestLoan, getLoans } from '@/lib/store';
import { Book, Category, Loan } from '@/types/library';

function CatalogContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const initialBookId = searchParams.get('book');

  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available'>('all');
  
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [currentUser] = useState(getCurrentUser());
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [loadedBooks, loadedCategories, loadedLoans] = await Promise.all([
          getBooks(),
          getCategories(),
          getLoans(),
        ]);
        if (cancelled) return;
        setBooks(loadedBooks);
        setCategories(loadedCategories);
        setLoans(loadedLoans);

        if (initialBookId) {
          const found = loadedBooks.find(b => b.id === initialBookId);
          if (found) setSelectedBook(found);
        }
      } catch (error) {
        console.error('Gagal memuat data katalog:', error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [initialBookId]);

  const filteredBooks = books.filter(b => {
    if (b.status !== 'active') return false;
    
    const matchesSearch = 
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.authors.some(a => a.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (b.isbn && b.isbn.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || b.categoryId === selectedCategory;
    const matchesAvailability = availabilityFilter === 'all' || (availabilityFilter === 'available' && b.availableCopies > 0);

    return matchesSearch && matchesCategory && matchesAvailability;
  });

  const handleRequestLoan = async (book: Book) => {
    if (currentUser.role !== 'member') {
      setToastMessage({ type: 'error', text: 'Hanya akun Anggota yang dapat mengajukan peminjaman buku.' });
      return;
    }

    const res = await requestLoan(book.id, currentUser);
    if (res.success) {
      setToastMessage({ type: 'success', text: res.message });
      try {
        const [refreshedBooks, refreshedLoans] = await Promise.all([getBooks(), getLoans()]);
        setBooks(refreshedBooks);
        setLoans(refreshedLoans);
      } catch (error) {
        console.error('Gagal memperbarui data setelah peminjaman:', error);
      }
      setTimeout(() => {
        setSelectedBook(null);
        setToastMessage(null);
      }, 2000);
    } else {
      setToastMessage({ type: 'error', text: res.message });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header & Search */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Katalog Pustaka</h1>
            <p className="text-slate-500 mt-1">Cari koleksi buku perpustakaan, periksa ketersediaan eksemplar, dan ajukan peminjaman online.</p>
          </div>

          <div className="mt-6 flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari judul, penulis, atau ISBN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-sm font-medium transition-all"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">Semua Kategori</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <select
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value as any)}
                className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">Semua Status</option>
                <option value="available">Tersedia Saja</option>
              </select>
            </div>
          </div>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-medium shadow-sm animate-in fade-in ${toastMessage.type === 'success' ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-red-50 text-red-900 border border-red-200'}`}>
            {toastMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />}
            <span>{toastMessage.text}</span>
          </div>
        )}

        {/* Book Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredBooks.map((book) => {
            const cat = categories.find(c => c.id === book.categoryId);
            return (
              <div 
                key={book.id}
                onClick={() => setSelectedBook(book)}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden hover:shadow-lg transition-all flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  <div className="relative h-52 w-full bg-slate-100 overflow-hidden">
                    <img 
                      src={book.coverUrl || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=800'} 
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 right-3">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm ${book.availableCopies > 0 ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
                        {book.availableCopies > 0 ? `${book.availableCopies} dari ${book.totalCopies} Tersedia` : 'Habis'}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <p className="text-xs font-semibold text-emerald-600 mb-1">
                      {cat?.name || 'Umum'}
                    </p>
                    <h3 className="font-bold text-slate-900 line-clamp-2 mb-1 group-hover:text-emerald-600 transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-xs text-slate-500 mb-3">
                      Oleh {book.authors.join(', ')} ({book.publicationYear})
                    </p>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {book.description || 'Tidak ada deskripsi.'}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <button
                    className="w-full py-2.5 rounded-xl bg-slate-900 group-hover:bg-emerald-600 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    Lihat Detail & Pinjam
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredBooks.length === 0 && (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
            <Library className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900">Tidak ada buku ditemukan</h3>
            <p className="text-sm text-slate-500 mt-1">Coba sesuaikan kata kunci pencarian atau filter kategori Anda.</p>
          </div>
        )}

        {/* Book Detail Modal */}
        {selectedBook && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <h3 className="text-xl font-bold text-slate-900">Detail Buku & Peminjaman</h3>
                <button 
                  onClick={() => setSelectedBook(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="w-full sm:w-44 h-60 rounded-2xl bg-slate-100 overflow-hidden shrink-0 shadow-sm">
                    <img 
                      src={selectedBook.coverUrl || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=800'} 
                      alt={selectedBook.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="space-y-3 flex-1">
                    <div>
                      <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
                        {categories.find(c => c.id === selectedBook.categoryId)?.name || 'Umum'}
                      </span>
                      <h2 className="text-2xl font-black text-slate-900">{selectedBook.title}</h2>
                      <p className="text-sm text-slate-600 mt-1 font-medium">Oleh {selectedBook.authors.join(', ')}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 text-xs">
                      <div>
                        <span className="text-slate-400 block font-medium">Penerbit</span>
                        <span className="font-semibold text-slate-900">{selectedBook.publisher || '-'} ({selectedBook.publicationYear || '-'})</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">ISBN</span>
                        <span className="font-semibold text-slate-900">{selectedBook.isbn || '-'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Total Eksemplar</span>
                        <span className="font-semibold text-slate-900">{selectedBook.totalCopies} Buku</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Tersedia</span>
                        <span className={`font-bold ${selectedBook.availableCopies > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {selectedBook.availableCopies} Buku
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400 text-xs font-medium block mb-1">Sinopsis</span>
                      <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                        {selectedBook.description || 'Tidak ada deskripsi tersedia untuk buku ini.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-50/60 rounded-2xl p-4 border border-emerald-100 text-xs text-emerald-900 space-y-1">
                  <p className="font-bold">Ketentuan Peminjaman Perpustakaan:</p>
                  <ul className="list-disc list-inside space-y-0.5 text-emerald-800">
                    <li>Masa pinjaman adalah 7 hari kalender sejak buku diserahkan di perpustakaan.</li>
                    <li>Maksimal 3 eksemplar aktif per anggota secara bersamaan.</li>
                    <li>Pengambilan dan pengembalian dilakukan secara fisik di meja layanan perpustakaan.</li>
                  </ul>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Masuk sebagai: <strong className="text-slate-800">{currentUser.displayName} ({currentUser.role})</strong>
                </span>

                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedBook(null)}
                    className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors"
                  >
                    Tutup
                  </button>

                  <button
                    onClick={() => handleRequestLoan(selectedBook)}
                    disabled={selectedBook.availableCopies <= 0}
                    className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${selectedBook.availableCopies > 0 ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30' : 'bg-slate-300 text-slate-500 cursor-not-allowed'}`}
                  >
                    <BookMarked className="w-4 h-4" />
                    Ajukan Pinjaman Buku
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Memuat katalog...</div>}>
      <CatalogContent />
    </Suspense>
  );
}
