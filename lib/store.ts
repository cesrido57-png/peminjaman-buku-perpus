import { User, Book, Category, Loan, SystemSettings, AuditLog } from '@/types/library';

export {
  INITIAL_SETTINGS,
  INITIAL_USERS,
  INITIAL_CATEGORIES,
  INITIAL_BOOKS,
  INITIAL_LOANS,
  INITIAL_AUDIT_LOGS,
} from './seed-data';

const CURRENT_USER_KEY = 'pustaka_current_user_v1';

// ---------- HTTP helpers ----------

async function apiJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || (data && data.success === false)) {
    throw new Error(data?.message || `Permintaan gagal (HTTP ${res.status}).`);
  }
  return data as T;
}

async function apiAction(
  url: string,
  payload: Record<string, unknown>
): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });
    const data = await res.json().catch(() => null);
    return {
      success: Boolean(data?.success),
      message: data?.message || (data?.success ? 'Berhasil.' : 'Permintaan gagal.'),
    };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Terjadi kesalahan jaringan.' };
  }
}

// ---------- Session (current user) ----------

const DEFAULT_USER: User = {
  uid: 'usr-admin-1',
  displayName: 'Dr. Hendra Wijaya (Admin)',
  email: 'admin@pustaka.id',
  memberNumber: 'ADM-001',
  role: 'admin',
  status: 'active',
  createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
  updatedAt: new Date().toISOString(),
};

export function getCurrentUser(): User {
  if (typeof window === 'undefined') return DEFAULT_USER;
  const stored = localStorage.getItem(CURRENT_USER_KEY);
  if (stored) {
    try {
      return JSON.parse(stored) as User;
    } catch {
      // fallthrough
    }
  }
  return DEFAULT_USER;
}

export function setCurrentUser(user: User): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

// ---------- Data getters (Neon via API) ----------

export async function getUsers(): Promise<User[]> {
  return apiJson<User[]>('/api/users');
}

export async function getBooks(): Promise<Book[]> {
  return apiJson<Book[]>('/api/books');
}

export async function getCategories(): Promise<Category[]> {
  return apiJson<Category[]>('/api/categories');
}

export async function getLoans(): Promise<Loan[]> {
  return apiJson<Loan[]>('/api/loans');
}

export async function getSettings(): Promise<SystemSettings> {
  return apiJson<SystemSettings>('/api/settings');
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  return apiJson<AuditLog[]>('/api/audit-logs');
}

// ---------- Audit ----------

export async function addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void> {
  const actor = {
    uid: log.actorUid,
    displayName: log.actorName,
    email: '',
    role: log.actorRole,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as User;
  await apiJson('/api/audit-logs', {
    method: 'POST',
    body: JSON.stringify({ log, actor }),
  });
}

// ---------- Books ----------

export async function saveBook(bookData: Partial<Book>, actor: User): Promise<Book> {
  const data = await apiJson<{ success: boolean; book: Book }>('/api/books', {
    method: 'POST',
    body: JSON.stringify({ book: bookData, actor }),
  });
  return data.book;
}

export async function archiveBook(bookId: string, actor: User): Promise<void> {
  await apiJson('/api/books/archive', {
    method: 'PATCH',
    body: JSON.stringify({ bookId, actor }),
  });
}

// ---------- Categories ----------

export async function saveCategory(catData: Partial<Category>, actor: User): Promise<Category> {
  const data = await apiJson<{ success: boolean; category: Category }>('/api/categories', {
    method: 'POST',
    body: JSON.stringify({ category: catData, actor }),
  });
  return data.category;
}

// ---------- Loans (PRD compliant) ----------

export async function requestLoan(bookId: string, member: User): Promise<{ success: boolean; message: string }> {
  return apiAction('/api/loans', { bookId, member });
}

export async function reviewLoanRequest(
  loanId: string,
  approve: boolean,
  rejectionReason: string = '',
  staff: User
): Promise<{ success: boolean; message: string }> {
  return apiAction(`/api/loans/${encodeURIComponent(loanId)}`, {
    action: 'review',
    approve,
    rejectionReason,
    actor: staff,
  });
}

export async function checkoutLoan(loanId: string, staff: User): Promise<{ success: boolean; message: string }> {
  return apiAction(`/api/loans/${encodeURIComponent(loanId)}`, { action: 'checkout', actor: staff });
}

export async function returnLoan(loanId: string, staff: User): Promise<{ success: boolean; message: string }> {
  return apiAction(`/api/loans/${encodeURIComponent(loanId)}`, { action: 'return', actor: staff });
}

export async function cancelLoan(loanId: string, member: User): Promise<{ success: boolean; message: string }> {
  return apiAction(`/api/loans/${encodeURIComponent(loanId)}`, { action: 'cancel', actor: member });
}

// ---------- Settings & Users ----------

export async function updateSettings(
  newSettings: Partial<SystemSettings>,
  actor: User
): Promise<SystemSettings> {
  const data = await apiJson<{ success: boolean; settings: SystemSettings }>('/api/settings', {
    method: 'PUT',
    body: JSON.stringify({ settings: newSettings, actor }),
  });
  return data.settings;
}

export async function updateUserStatus(
  uid: string,
  status: 'active' | 'inactive',
  actor: User
): Promise<void> {
  await apiJson('/api/users/status', {
    method: 'PATCH',
    body: JSON.stringify({ uid, status, actor }),
  });
}
