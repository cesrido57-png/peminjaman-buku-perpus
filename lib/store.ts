import { User, Book, Category, Loan, SystemSettings, AuditLog, Role } from '@/types/library';

const STORAGE_KEYS = {
  USERS: 'pustaka_users_v1',
  BOOKS: 'pustaka_books_v1',
  CATEGORIES: 'pustaka_categories_v1',
  LOANS: 'pustaka_loans_v1',
  SETTINGS: 'pustaka_settings_v1',
  AUDIT_LOGS: 'pustaka_audit_logs_v1',
  CURRENT_USER: 'pustaka_current_user_v1',
};

export const INITIAL_SETTINGS: SystemSettings = {
  maxActiveCopiesPerMember: 3,
  loanDurationDays: 7,
  allowMemberCancellation: true,
  libraryName: 'Pustaka Central Library',
  libraryAddress: 'Jl. Pustaka Merdeka No. 45, Jakarta',
  updatedAt: new Date().toISOString(),
  updatedBy: 'System Admin',
};

export const INITIAL_USERS: User[] = [
  {
    uid: 'usr-admin-1',
    displayName: 'Dr. Hendra Wijaya (Admin)',
    email: 'admin@pustaka.id',
    memberNumber: 'ADM-001',
    role: 'admin',
    status: 'active',
    createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    uid: 'usr-staff-1',
    displayName: 'Siti Rahma, S.Pust (Petugas)',
    email: 'staff@pustaka.id',
    memberNumber: 'STF-001',
    role: 'staff',
    status: 'active',
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    uid: 'usr-member-1',
    displayName: 'Budi Santoso',
    email: 'budi@pustaka.id',
    memberNumber: 'MEM-101',
    role: 'member',
    status: 'active',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    uid: 'usr-member-2',
    displayName: 'Dewi Lestari',
    email: 'dewi@pustaka.id',
    memberNumber: 'MEM-102',
    role: 'member',
    status: 'active',
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    name: 'Teknologi & Komputer',
    description: 'Buku pemrograman, kecerdasan buatan, jaringan, dan sistem informasi.',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-2',
    name: 'Fiksi & Sastra',
    description: 'Novel, puisi, cerpen, dan karya sastra klasik maupun kontemporer.',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-3',
    name: 'Sains & Matematika',
    description: 'Fisika, biologi, kimia, matematika murni dan terapan.',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-4',
    name: 'Bisnis & Ekonomi',
    description: 'Manajemen, keuangan, kewirausahaan, dan pemasaran.',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-5',
    name: 'Sejarah & Budaya',
    description: 'Sejarah nasional, dunia, antropologi, dan kebudayaan.',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_BOOKS: Book[] = [
  {
    id: 'book-1',
    isbn: '978-602-03-1234-1',
    title: 'Pemrograman Web Modern dengan React & TypeScript',
    authors: ['Andi Pratama', 'Rian Hidayat'],
    publisher: 'Elex Media Komputindo',
    publicationYear: 2024,
    categoryId: 'cat-1',
    description: 'Panduan lengkap membangun aplikasi web interaktif berkinerja tinggi menggunakan React 19, TypeScript, dan Tailwind CSS.',
    coverUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800',
    totalCopies: 5,
    availableCopies: 4,
    status: 'active',
    createdAt: new Date(Date.now() - 40 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'book-2',
    isbn: '978-979-22-5678-2',
    title: 'Bumi Manusia',
    authors: ['Pramoedya Ananta Toer'],
    publisher: 'Lentera Dipantara',
    publicationYear: 2005,
    categoryId: 'cat-2',
    description: 'Karya monumental sastra Indonesia yang berlatar belakang masa kolonial Belanda, mengisahkan Minke dan Annelies.',
    coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800',
    totalCopies: 3,
    availableCopies: 3,
    status: 'active',
    createdAt: new Date(Date.now() - 35 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'book-3',
    isbn: '978-602-06-4321-3',
    title: 'Kecerdasan Buatan: Konsep dan Implementasi',
    authors: ['Dr. Rahmat Hidayat'],
    publisher: 'Informatika',
    publicationYear: 2023,
    categoryId: 'cat-1',
    description: 'Pengantar machine learning, deep learning, NLP, dan generative AI dengan contoh kode Python.',
    coverUrl: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&q=80&w=800',
    totalCopies: 4,
    availableCopies: 2,
    status: 'active',
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'book-4',
    isbn: '978-602-41-9988-4',
    title: 'Fisika Universitas Edisi ke-13',
    authors: ['Hugh D. Young', 'Roger A. Freedman'],
    publisher: 'Erlangga',
    publicationYear: 2020,
    categoryId: 'cat-3',
    description: 'Referensi utama fisika dasar untuk mahasiswa teknik dan sains.',
    coverUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=800',
    totalCopies: 6,
    availableCopies: 6,
    status: 'active',
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'book-5',
    isbn: '978-602-04-1122-5',
    title: 'Prinsip-Prinsip Ekonomi Makro',
    authors: ['N. Gregory Mankiw'],
    publisher: 'Salemba Empat',
    publicationYear: 2021,
    categoryId: 'cat-4',
    description: 'Membahas teori ekonomi makro modern, inflasi, kebijakan fiskal, moneter, dan perdagangan internasional.',
    coverUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800',
    totalCopies: 4,
    availableCopies: 4,
    status: 'active',
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'book-6',
    isbn: '978-979-22-9900-6',
    title: 'Sejarah Indonesia Modern: 1200-2008',
    authors: ['M.C. Ricklefs'],
    publisher: 'Serambi Ilmu Semesta',
    publicationYear: 2008,
    categoryId: 'cat-5',
    description: 'Kajian komprehensif mengenai dinamika sejarah kepulauan Nusantara dari masa kerajaan Hindu-Buddha hingga era reformasi.',
    coverUrl: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&q=80&w=800',
    totalCopies: 2,
    availableCopies: 2,
    status: 'active',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_LOANS: Loan[] = [
  {
    id: 'loan-1',
    memberId: 'usr-member-1',
    memberName: 'Budi Santoso',
    memberEmail: 'budi@pustaka.id',
    items: [
      {
        bookId: 'book-1',
        bookTitle: 'Pemrograman Web Modern dengan React & TypeScript',
        coverUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800',
        quantity: 1,
      },
    ],
    status: 'BORROWED',
    requestedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    reviewedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    reviewedBy: 'Siti Rahma, S.Pust',
    handedOverAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    dueAt: new Date(Date.now() + 4 * 86400000).toISOString(), // 7 days from handover
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'loan-2',
    memberId: 'usr-member-1',
    memberName: 'Budi Santoso',
    memberEmail: 'budi@pustaka.id',
    items: [
      {
        bookId: 'book-3',
        bookTitle: 'Kecerdasan Buatan: Konsep dan Implementasi',
        coverUrl: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&q=80&w=800',
        quantity: 1,
      },
    ],
    status: 'PENDING',
    requestedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    actorUid: 'usr-admin-1',
    actorName: 'Dr. Hendra Wijaya (Admin)',
    actorRole: 'admin',
    action: 'CREATE_BOOK',
    entityType: 'book',
    entityId: 'book-1',
    timestamp: new Date(Date.now() - 40 * 86400000).toISOString(),
    metadata: { title: 'Pemrograman Web Modern dengan React & TypeScript' },
  },
  {
    id: 'log-2',
    actorUid: 'usr-staff-1',
    actorName: 'Siti Rahma, S.Pust (Petugas)',
    actorRole: 'staff',
    action: 'CHECKOUT_LOAN',
    entityType: 'loan',
    entityId: 'loan-1',
    timestamp: new Date(Date.now() - 3 * 86400000).toISOString(),
    metadata: { memberName: 'Budi Santoso', bookTitle: 'Pemrograman Web Modern dengan React & TypeScript' },
  },
];

// Helper functions for LocalStorage
export function getStoredData<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error(`Error reading localStorage key ${key}:`, e);
    return fallback;
  }
}

export function setStoredData<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing localStorage key ${key}:`, e);
  }
}

// Current logged in user getter/setter
export function getCurrentUser(): User {
  const fallback = INITIAL_USERS[0]; // Admin by default
  const user = getStoredData<User>(STORAGE_KEYS.CURRENT_USER, fallback);
  return user;
}

export function setCurrentUser(user: User): void {
  setStoredData(STORAGE_KEYS.CURRENT_USER, user);
}

// Data Getters
export function getUsers(): User[] {
  return getStoredData<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
}

export function getBooks(): Book[] {
  return getStoredData<Book[]>(STORAGE_KEYS.BOOKS, INITIAL_BOOKS);
}

export function getCategories(): Category[] {
  return getStoredData<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
}

export function getLoans(): Loan[] {
  return getStoredData<Loan[]>(STORAGE_KEYS.LOANS, INITIAL_LOANS);
}

export function getSettings(): SystemSettings {
  return getStoredData<SystemSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
}

export function getAuditLogs(): AuditLog[] {
  return getStoredData<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
}

// Actions & Mutators
export function addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>) {
  const logs = getAuditLogs();
  const newLog: AuditLog = {
    ...log,
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: new Date().toISOString(),
  };
  setStoredData(STORAGE_KEYS.AUDIT_LOGS, [newLog, ...logs]);
}

// Book Actions
export function saveBook(bookData: Partial<Book>, actor: User): Book {
  const books = getBooks();
  const isEditing = Boolean(bookData.id && books.some(b => b.id === bookData.id));
  
  if (isEditing) {
    const updated = books.map(b => {
      if (b.id === bookData.id) {
        return {
          ...b,
          ...bookData,
          updatedAt: new Date().toISOString(),
        } as Book;
      }
      return b;
    });
    setStoredData(STORAGE_KEYS.BOOKS, updated);
    addAuditLog({
      actorUid: actor.uid,
      actorName: actor.displayName,
      actorRole: actor.role,
      action: 'UPDATE_BOOK',
      entityType: 'book',
      entityId: bookData.id!,
      metadata: { title: bookData.title },
    });
    return updated.find(b => b.id === bookData.id)!;
  } else {
    const newBook: Book = {
      id: `book-${Date.now()}`,
      isbn: bookData.isbn || '',
      title: bookData.title || 'Buku Tanpa Judul',
      authors: bookData.authors || ['Penulis Tidak Diketahui'],
      publisher: bookData.publisher || '',
      publicationYear: bookData.publicationYear || new Date().getFullYear(),
      categoryId: bookData.categoryId || 'cat-1',
      description: bookData.description || '',
      coverUrl: bookData.coverUrl || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=800',
      totalCopies: bookData.totalCopies || 1,
      availableCopies: bookData.totalCopies || 1,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setStoredData(STORAGE_KEYS.BOOKS, [newBook, ...books]);
    addAuditLog({
      actorUid: actor.uid,
      actorName: actor.displayName,
      actorRole: actor.role,
      action: 'CREATE_BOOK',
      entityType: 'book',
      entityId: newBook.id,
      metadata: { title: newBook.title },
    });
    return newBook;
  }
}

export function archiveBook(bookId: string, actor: User) {
  const books = getBooks();
  const updated = books.map(b => b.id === bookId ? { ...b, status: b.status === 'active' ? 'archived' as const : 'active' as const, updatedAt: new Date().toISOString() } : b);
  setStoredData(STORAGE_KEYS.BOOKS, updated);
  addAuditLog({
    actorUid: actor.uid,
    actorName: actor.displayName,
    actorRole: actor.role,
    action: 'TOGGLE_ARCHIVE_BOOK',
    entityType: 'book',
    entityId: bookId,
  });
}

// Category Actions
export function saveCategory(catData: Partial<Category>, actor: User) {
  const categories = getCategories();
  if (catData.id) {
    const updated = categories.map(c => c.id === catData.id ? { ...c, ...catData, updatedAt: new Date().toISOString() } as Category : c);
    setStoredData(STORAGE_KEYS.CATEGORIES, updated);
  } else {
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: catData.name || 'Kategori Baru',
      description: catData.description || '',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setStoredData(STORAGE_KEYS.CATEGORIES, [newCat, ...categories]);
  }
}

// Loan Actions (PRD Compliant)
export function requestLoan(bookId: string, member: User): { success: boolean; message: string } {
  const books = getBooks();
  const book = books.find(b => b.id === bookId);
  if (!book || book.status !== 'active') {
    return { success: false, message: 'Buku tidak ditemukan atau tidak aktif.' };
  }
  if (book.availableCopies <= 0) {
    return { success: false, message: 'Maaf, semua eksemplar buku ini sedang dipinjam.' };
  }

  const loans = getLoans();
  const settings = getSettings();

  // Check active copies for this member (PENDING + APPROVED + BORROWED)
  const activeLoans = loans.filter(l => l.memberId === member.uid && ['PENDING', 'APPROVED', 'BORROWED'].includes(l.status));
  const totalActiveItems = activeLoans.reduce((sum, l) => sum + l.items.reduce((s, i) => s + i.quantity, 0), 0);

  if (totalActiveItems >= settings.maxActiveCopiesPerMember) {
    return { success: false, message: `Batas maksimal pinjaman aktif adalah ${settings.maxActiveCopiesPerMember} eksemplar.` };
  }

  // Check if member already has active/pending request for this exact book
  const existingForBook = activeLoans.some(l => l.items.some(i => i.bookId === bookId));
  if (existingForBook) {
    return { success: false, message: 'Anda sudah memiliki permintaan atau pinjaman aktif untuk buku ini.' };
  }

  const newLoan: Loan = {
    id: `loan-${Date.now()}`,
    memberId: member.uid,
    memberName: member.displayName,
    memberEmail: member.email,
    items: [
      {
        bookId: book.id,
        bookTitle: book.title,
        coverUrl: book.coverUrl,
        quantity: 1,
      },
    ],
    status: 'PENDING',
    requestedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  setStoredData(STORAGE_KEYS.LOANS, [newLoan, ...loans]);
  addAuditLog({
    actorUid: member.uid,
    actorName: member.displayName,
    actorRole: member.role,
    action: 'REQUEST_LOAN',
    entityType: 'loan',
    entityId: newLoan.id,
    metadata: { bookTitle: book.title },
  });

  return { success: true, message: 'Permintaan peminjaman berhasil dikirim. Menunggu persetujuan petugas.' };
}

export function reviewLoanRequest(loanId: string, approve: boolean, rejectionReason: string = '', staff: User): { success: boolean; message: string } {
  const loans = getLoans();
  const loan = loans.find(l => l.id === loanId);
  if (!loan || loan.status !== 'PENDING') {
    return { success: false, message: 'Permintaan tidak ditemukan atau sudah diproses.' };
  }

  const books = getBooks();
  if (approve) {
    // Check stock again
    for (const item of loan.items) {
      const book = books.find(b => b.id === item.bookId);
      if (!book || book.availableCopies < item.quantity) {
        return { success: false, message: `Stok buku "${item.bookTitle}" tidak mencukupi saat ini.` };
      }
    }
  }

  const updatedLoans = loans.map(l => {
    if (l.id === loanId) {
      return {
        ...l,
        status: approve ? ('APPROVED' as const) : ('REJECTED' as const),
        reviewedAt: new Date().toISOString(),
        reviewedBy: staff.displayName,
        rejectionReason: approve ? undefined : rejectionReason,
        updatedAt: new Date().toISOString(),
      };
    }
    return l;
  });

  setStoredData(STORAGE_KEYS.LOANS, updatedLoans);
  addAuditLog({
    actorUid: staff.uid,
    actorName: staff.displayName,
    actorRole: staff.role,
    action: approve ? 'APPROVE_LOAN' : 'REJECT_LOAN',
    entityType: 'loan',
    entityId: loanId,
    metadata: { memberName: loan.memberName, approve, rejectionReason },
  });

  return { success: true, message: approve ? 'Permintaan peminjaman disetujui.' : 'Permintaan peminjaman ditolak.' };
}

export function checkoutLoan(loanId: string, staff: User): { success: boolean; message: string } {
  const loans = getLoans();
  const loan = loans.find(l => l.id === loanId);
  if (!loan || loan.status !== 'APPROVED') {
    return { success: false, message: 'Pinjaman harus berstatus APPROVED untuk diserahkan.' };
  }

  const books = getBooks();
  const settings = getSettings();

  // Decrement available copies atomically in memory
  const updatedBooks = books.map(b => {
    const item = loan.items.find(i => i.bookId === b.id);
    if (item) {
      if (b.availableCopies < item.quantity) {
        throw new Error(`Stok buku ${b.title} habis.`);
      }
      return {
        ...b,
        availableCopies: b.availableCopies - item.quantity,
        updatedAt: new Date().toISOString(),
      };
    }
    return b;
  });

  const now = new Date();
  const due = new Date(now.getTime() + settings.loanDurationDays * 86400000);

  const updatedLoans = loans.map(l => {
    if (l.id === loanId) {
      return {
        ...l,
        status: 'BORROWED' as const,
        handedOverAt: now.toISOString(),
        dueAt: due.toISOString(),
        updatedAt: now.toISOString(),
      };
    }
    return l;
  });

  setStoredData(STORAGE_KEYS.BOOKS, updatedBooks);
  setStoredData(STORAGE_KEYS.LOANS, updatedLoans);

  addAuditLog({
    actorUid: staff.uid,
    actorName: staff.displayName,
    actorRole: staff.role,
    action: 'CHECKOUT_LOAN',
    entityType: 'loan',
    entityId: loanId,
    metadata: { memberName: loan.memberName, dueAt: due.toISOString() },
  });

  return { success: true, message: 'Buku berhasil diserahkan (Checkout) kepada anggota. Masa pinjaman dimulai.' };
}

export function returnLoan(loanId: string, staff: User): { success: boolean; message: string } {
  const loans = getLoans();
  const loan = loans.find(l => l.id === loanId);
  if (!loan || loan.status !== 'BORROWED') {
    return { success: false, message: 'Transaksi harus berstatus BORROWED untuk dikembalikan.' };
  }

  const books = getBooks();
  const updatedBooks = books.map(b => {
    const item = loan.items.find(i => i.bookId === b.id);
    if (item) {
      return {
        ...b,
        availableCopies: Math.min(b.totalCopies, b.availableCopies + item.quantity),
        updatedAt: new Date().toISOString(),
      };
    }
    return b;
  });

  const now = new Date().toISOString();
  const updatedLoans = loans.map(l => {
    if (l.id === loanId) {
      return {
        ...l,
        status: 'RETURNED' as const,
        returnedAt: now,
        receivedBy: staff.displayName,
        updatedAt: now,
      };
    }
    return l;
  });

  setStoredData(STORAGE_KEYS.BOOKS, updatedBooks);
  setStoredData(STORAGE_KEYS.LOANS, updatedLoans);

  addAuditLog({
    actorUid: staff.uid,
    actorName: staff.displayName,
    actorRole: staff.role,
    action: 'RETURN_LOAN',
    entityType: 'loan',
    entityId: loanId,
    metadata: { memberName: loan.memberName },
  });

  return { success: true, message: 'Buku berhasil dikembalikan dan stok telah dipulihkan.' };
}

export function cancelLoan(loanId: string, member: User): { success: boolean; message: string } {
  const loans = getLoans();
  const loan = loans.find(l => l.id === loanId);
  if (!loan || loan.memberId !== member.uid || loan.status !== 'PENDING') {
    return { success: false, message: 'Permintaan tidak dapat dibatalkan.' };
  }

  const updatedLoans = loans.map(l => l.id === loanId ? { ...l, status: 'CANCELLED' as const, updatedAt: new Date().toISOString() } : l);
  setStoredData(STORAGE_KEYS.LOANS, updatedLoans);
  addAuditLog({
    actorUid: member.uid,
    actorName: member.displayName,
    actorRole: member.role,
    action: 'CANCEL_LOAN',
    entityType: 'loan',
    entityId: loanId,
  });

  return { success: true, message: 'Permintaan peminjaman berhasil dibatalkan.' };
}

export function updateSettings(newSettings: Partial<SystemSettings>, actor: User) {
  const current = getSettings();
  const updated: SystemSettings = {
    ...current,
    ...newSettings,
    updatedAt: new Date().toISOString(),
    updatedBy: actor.displayName,
  };
  setStoredData(STORAGE_KEYS.SETTINGS, updated);
  addAuditLog({
    actorUid: actor.uid,
    actorName: actor.displayName,
    actorRole: actor.role,
    action: 'UPDATE_SETTINGS',
    entityType: 'settings',
    entityId: 'global',
    metadata: newSettings,
  });
}

export function updateUserStatus(uid: string, status: 'active' | 'inactive', actor: User) {
  const users = getUsers();
  const updated = users.map(u => u.uid === uid ? { ...u, status, updatedAt: new Date().toISOString() } : u);
  setStoredData(STORAGE_KEYS.USERS, updated);
  addAuditLog({
    actorUid: actor.uid,
    actorName: actor.displayName,
    actorRole: actor.role,
    action: 'UPDATE_USER_STATUS',
    entityType: 'user',
    entityId: uid,
    metadata: { status },
  });
}
