import { PoolClient } from 'pg';
import { pool, query, withTransaction } from '@/lib/db';
import {
  mapUser,
  mapBook,
  mapCategory,
  mapLoan,
  mapLoanItem,
  mapSettings,
  mapAuditLog,
} from '@/lib/server/mappers';
import type { User, Book, Category, Loan, LoanItem, SystemSettings, AuditLog, BookStatus } from '@/types/library';

type Queryable = { query: (text: string, params?: any[]) => Promise<any> };

async function insertAuditLog(
  db: Queryable,
  log: Omit<AuditLog, 'id' | 'timestamp'>
): Promise<void> {
  await db.query(
    `INSERT INTO audit_logs (id, actor_uid, actor_name, actor_role, action, entity_type, entity_id, metadata)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)`,
    [
      `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      log.actorUid,
      log.actorName,
      log.actorRole,
      log.action,
      log.entityType,
      log.entityId,
      log.metadata ? JSON.stringify(log.metadata) : null,
    ]
  );
}

// ---------- Readers ----------

export async function listUsers(): Promise<User[]> {
  const rows = await query('SELECT * FROM users ORDER BY created_at DESC');
  return rows.map(mapUser);
}

export async function listBooks(): Promise<Book[]> {
  const rows = await query('SELECT * FROM books ORDER BY created_at DESC');
  return rows.map(mapBook);
}

export async function listCategories(): Promise<Category[]> {
  const rows = await query('SELECT * FROM categories ORDER BY created_at DESC');
  return rows.map(mapCategory);
}

export async function listLoans(): Promise<Loan[]> {
  const rows = await query(
    `SELECT l.*, li.id AS item_id, li.book_id, li.book_title, li.cover_url AS item_cover_url, li.quantity, li.position
     FROM loans l
     LEFT JOIN loan_items li ON li.loan_id = l.id
     ORDER BY l.created_at DESC, li.position ASC`
  );
  const loans = new Map<string, Loan>();
  for (const row of rows) {
    let loan = loans.get(row.id);
    if (!loan) {
      loan = mapLoan(row, []);
      loans.set(row.id, loan);
    }
    if (row.item_id) {
      loan.items.push(mapLoanItem({ ...row, cover_url: row.item_cover_url }));
    }
  }
  return Array.from(loans.values());
}

export async function getSettings(): Promise<SystemSettings> {
  const rows = await query('SELECT * FROM settings WHERE id = 1');
  if (rows.length === 0) throw new Error('Pengaturan sistem belum dikonfigurasi.');
  return mapSettings(rows[0]);
}

export async function listAuditLogs(): Promise<AuditLog[]> {
  const rows = await query('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 200');
  return rows.map(mapAuditLog);
}

// ---------- Books ----------

export async function saveBook(bookData: Partial<Book>, actor: User): Promise<Book> {
  return withTransaction(async (client) => {
    const isEditing = Boolean(bookData.id);
    let savedRows: any;

    if (isEditing) {
      const existing = await client.query('SELECT id FROM books WHERE id = $1', [bookData.id]);
      if (existing.rows.length === 0) {
        throw new Error('Buku tidak ditemukan.');
      }
      savedRows = await client.query(
        `UPDATE books SET
           isbn = COALESCE($2, isbn),
           title = COALESCE($3, title),
           authors = COALESCE($4::jsonb, authors),
           publisher = COALESCE($5, publisher),
           publication_year = COALESCE($6, publication_year),
           category_id = COALESCE($7, category_id),
           description = COALESCE($8, description),
           cover_url = COALESCE($9, cover_url),
           total_copies = COALESCE($10, total_copies),
           available_copies = COALESCE($11, available_copies),
           updated_at = now()
         WHERE id = $1
         RETURNING *`,
        [
          bookData.id,
          bookData.isbn ?? null,
          bookData.title ?? null,
          bookData.authors ? JSON.stringify(bookData.authors) : null,
          bookData.publisher ?? null,
          bookData.publicationYear ?? null,
          bookData.categoryId ?? null,
          bookData.description ?? null,
          bookData.coverUrl ?? null,
          bookData.totalCopies ?? null,
          bookData.availableCopies ?? null,
        ]
      );
    } else {
      const id = bookData.id || `book-${Date.now()}`;
      const totalCopies = bookData.totalCopies || 1;
      savedRows = await client.query(
        `INSERT INTO books (id, isbn, title, authors, publisher, publication_year, category_id,
                            description, cover_url, total_copies, available_copies, status)
         VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING *`,
        [
          id,
          bookData.isbn || null,
          bookData.title || 'Buku Tanpa Judul',
          JSON.stringify(bookData.authors || ['Penulis Tidak Diketahui']),
          bookData.publisher || null,
          bookData.publicationYear || new Date().getFullYear(),
          bookData.categoryId || null,
          bookData.description || null,
          bookData.coverUrl ||
            'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=800',
          totalCopies,
          totalCopies,
          'active',
        ]
      );
    }

    const book = mapBook(savedRows.rows[0]);
    await insertAuditLog(client, {
      actorUid: actor.uid,
      actorName: actor.displayName,
      actorRole: actor.role,
      action: isEditing ? 'UPDATE_BOOK' : 'CREATE_BOOK',
      entityType: 'book',
      entityId: book.id,
      metadata: { title: book.title },
    });
    return book;
  });
}

export async function toggleArchiveBook(bookId: string, actor: User): Promise<void> {
  await withTransaction(async (client) => {
    const rows = await client.query(
      `UPDATE books
       SET status = CASE WHEN status = 'active' THEN 'archived' ELSE 'active' END,
           updated_at = now()
       WHERE id = $1
       RETURNING *`,
      [bookId]
    );
    if (rows.rows.length === 0) throw new Error('Buku tidak ditemukan.');
    await insertAuditLog(client, {
      actorUid: actor.uid,
      actorName: actor.displayName,
      actorRole: actor.role,
      action: 'TOGGLE_ARCHIVE_BOOK',
      entityType: 'book',
      entityId: bookId,
    });
  });
}

// ---------- Categories ----------

export async function saveCategory(catData: Partial<Category>, actor: User): Promise<Category> {
  return withTransaction(async (client) => {
    let rows: any;
    if (catData.id) {
      rows = await client.query(
        `UPDATE categories SET
           name = COALESCE($2, name),
           description = COALESCE($3, description),
           updated_at = now()
         WHERE id = $1
         RETURNING *`,
        [catData.id, catData.name ?? null, catData.description ?? null]
      );
    } else {
      rows = await client.query(
        `INSERT INTO categories (id, name, description, status)
         VALUES ($1, $2, $3, 'active')
         RETURNING *`,
        [`cat-${Date.now()}`, catData.name || 'Kategori Baru', catData.description || null]
      );
    }
    if (rows.rows.length === 0) throw new Error('Kategori tidak ditemukan.');
    await insertAuditLog(client, {
      actorUid: actor.uid,
      actorName: actor.displayName,
      actorRole: actor.role,
      action: catData.id ? 'UPDATE_CATEGORY' : 'CREATE_CATEGORY',
      entityType: 'category',
      entityId: rows.rows[0].id,
      metadata: { name: rows.rows[0].name },
    });
    return mapCategory(rows.rows[0]);
  });
}

// ---------- Loans ----------

export type ActionResult = { success: boolean; message: string };

export async function requestLoan(bookId: string, member: User): Promise<ActionResult> {
  return withTransaction(async (client) => {
    const bookRes = await client.query('SELECT * FROM books WHERE id = $1 FOR UPDATE', [bookId]);
    const bookRow = bookRes.rows[0];
    if (!bookRow || bookRow.status !== 'active') {
      return { success: false, message: 'Buku tidak ditemukan atau tidak aktif.' };
    }
    if (bookRow.available_copies <= 0) {
      return { success: false, message: 'Maaf, semua eksemplar buku ini sedang dipinjam.' };
    }

    const settingsRes = await client.query('SELECT * FROM settings WHERE id = 1');
    const settings = mapSettings(settingsRes.rows[0]);

    const activeCountRes = await client.query(
      `SELECT COALESCE(SUM(li.quantity), 0)::int AS total
       FROM loans l
       JOIN loan_items li ON li.loan_id = l.id
       WHERE l.member_id = $1 AND l.status IN ('PENDING', 'APPROVED', 'BORROWED')`,
      [member.uid]
    );
    if (activeCountRes.rows[0].total >= settings.maxActiveCopiesPerMember) {
      return {
        success: false,
        message: `Batas maksimal pinjaman aktif adalah ${settings.maxActiveCopiesPerMember} eksemplar.`,
      };
    }

    const dupRes = await client.query(
      `SELECT 1 FROM loans l
       JOIN loan_items li ON li.loan_id = l.id
       WHERE l.member_id = $1 AND li.book_id = $2 AND l.status IN ('PENDING', 'APPROVED', 'BORROWED')
       LIMIT 1`,
      [member.uid, bookId]
    );
    if (dupRes.rows.length > 0) {
      return { success: false, message: 'Anda sudah memiliki permintaan atau pinjaman aktif untuk buku ini.' };
    }

    const loanId = `loan-${Date.now()}`;
    await client.query(
      `INSERT INTO loans (id, member_id, member_name, member_email, status, requested_at)
       VALUES ($1, $2, $3, $4, 'PENDING', now())`,
      [loanId, member.uid, member.displayName, member.email]
    );
    await client.query(
      `INSERT INTO loan_items (loan_id, book_id, book_title, cover_url, quantity, position)
       VALUES ($1, $2, $3, $4, 1, 0)`,
      [loanId, bookRow.id, bookRow.title, bookRow.cover_url]
    );
    await insertAuditLog(client, {
      actorUid: member.uid,
      actorName: member.displayName,
      actorRole: member.role,
      action: 'REQUEST_LOAN',
      entityType: 'loan',
      entityId: loanId,
      metadata: { bookTitle: bookRow.title },
    });

    return { success: true, message: 'Permintaan peminjaman berhasil dikirim. Menunggu persetujuan petugas.' };
  });
}

export async function reviewLoanRequest(
  loanId: string,
  approve: boolean,
  rejectionReason: string,
  staff: User
): Promise<ActionResult> {
  return withTransaction(async (client) => {
    const loanRes = await client.query('SELECT * FROM loans WHERE id = $1 FOR UPDATE', [loanId]);
    const loanRow = loanRes.rows[0];
    if (!loanRow || loanRow.status !== 'PENDING') {
      return { success: false, message: 'Permintaan tidak ditemukan atau sudah diproses.' };
    }

    if (approve) {
      const itemsRes = await client.query(
        'SELECT * FROM loan_items WHERE loan_id = $1 ORDER BY position',
        [loanId]
      );
      for (const item of itemsRes.rows) {
        const bookRes = await client.query('SELECT * FROM books WHERE id = $1 FOR UPDATE', [item.book_id]);
        const book = bookRes.rows[0];
        if (!book || book.available_copies < item.quantity) {
          return { success: false, message: `Stok buku "${item.book_title}" tidak mencukupi saat ini.` };
        }
      }
    }

    await client.query(
      `UPDATE loans SET
         status = $2,
         reviewed_at = now(),
         reviewed_by = $3,
         rejection_reason = $4,
         updated_at = now()
       WHERE id = $1`,
      [loanId, approve ? 'APPROVED' : 'REJECTED', staff.displayName, approve ? null : rejectionReason || null]
    );
    await insertAuditLog(client, {
      actorUid: staff.uid,
      actorName: staff.displayName,
      actorRole: staff.role,
      action: approve ? 'APPROVE_LOAN' : 'REJECT_LOAN',
      entityType: 'loan',
      entityId: loanId,
      metadata: { memberName: loanRow.member_name, approve, rejectionReason },
    });

    return {
      success: true,
      message: approve ? 'Permintaan peminjaman disetujui.' : 'Permintaan peminjaman ditolak.',
    };
  });
}

export async function checkoutLoan(loanId: string, staff: User): Promise<ActionResult> {
  return withTransaction(async (client) => {
    const loanRes = await client.query('SELECT * FROM loans WHERE id = $1 FOR UPDATE', [loanId]);
    const loanRow = loanRes.rows[0];
    if (!loanRow || loanRow.status !== 'APPROVED') {
      return { success: false, message: 'Pinjaman harus berstatus APPROVED untuk diserahkan.' };
    }

    const itemsRes = await client.query('SELECT * FROM loan_items WHERE loan_id = $1', [loanId]);
    for (const item of itemsRes.rows) {
      const bookRes = await client.query('SELECT * FROM books WHERE id = $1 FOR UPDATE', [item.book_id]);
      const book = bookRes.rows[0];
      if (!book || book.available_copies < item.quantity) {
        return { success: false, message: `Stok buku "${item.book_title}" habis.` };
      }
      await client.query(
        `UPDATE books SET available_copies = available_copies - $2, updated_at = now() WHERE id = $1`,
        [item.book_id, item.quantity]
      );
    }

    const settingsRes = await client.query('SELECT * FROM settings WHERE id = 1');
    const settings = mapSettings(settingsRes.rows[0]);
    const dueRes = await client.query(
      `UPDATE loans SET
         status = 'BORROWED',
         handed_over_at = now(),
         due_at = now() + (($2::text || ' days')::interval),
         updated_at = now()
       WHERE id = $1
       RETURNING due_at`,
      [loanId, String(settings.loanDurationDays)]
    );
    const dueAt = new Date(dueRes.rows[0].due_at).toISOString();

    await insertAuditLog(client, {
      actorUid: staff.uid,
      actorName: staff.displayName,
      actorRole: staff.role,
      action: 'CHECKOUT_LOAN',
      entityType: 'loan',
      entityId: loanId,
      metadata: { memberName: loanRow.member_name, dueAt },
    });

    return { success: true, message: 'Buku berhasil diserahkan (Checkout) kepada anggota. Masa pinjaman dimulai.' };
  });
}

export async function returnLoan(loanId: string, staff: User): Promise<ActionResult> {
  return withTransaction(async (client) => {
    const loanRes = await client.query('SELECT * FROM loans WHERE id = $1 FOR UPDATE', [loanId]);
    const loanRow = loanRes.rows[0];
    if (!loanRow || loanRow.status !== 'BORROWED') {
      return { success: false, message: 'Transaksi harus berstatus BORROWED untuk dikembalikan.' };
    }

    const itemsRes = await client.query('SELECT * FROM loan_items WHERE loan_id = $1', [loanId]);
    for (const item of itemsRes.rows) {
      await client.query(
        `UPDATE books
         SET available_copies = LEAST(total_copies, available_copies + $2),
             updated_at = now()
         WHERE id = $1`,
        [item.book_id, item.quantity]
      );
    }

    await client.query(
      `UPDATE loans SET status = 'RETURNED', returned_at = now(), received_by = $2, updated_at = now()
       WHERE id = $1`,
      [loanId, staff.displayName]
    );
    await insertAuditLog(client, {
      actorUid: staff.uid,
      actorName: staff.displayName,
      actorRole: staff.role,
      action: 'RETURN_LOAN',
      entityType: 'loan',
      entityId: loanId,
      metadata: { memberName: loanRow.member_name },
    });

    return { success: true, message: 'Buku berhasil dikembalikan dan stok telah dipulihkan.' };
  });
}

export async function cancelLoan(loanId: string, member: User): Promise<ActionResult> {
  return withTransaction(async (client) => {
    const loanRes = await client.query('SELECT * FROM loans WHERE id = $1 FOR UPDATE', [loanId]);
    const loanRow = loanRes.rows[0];
    if (!loanRow || loanRow.member_id !== member.uid || loanRow.status !== 'PENDING') {
      return { success: false, message: 'Permintaan tidak dapat dibatalkan.' };
    }

    await client.query(
      `UPDATE loans SET status = 'CANCELLED', updated_at = now() WHERE id = $1`,
      [loanId]
    );
    await insertAuditLog(client, {
      actorUid: member.uid,
      actorName: member.displayName,
      actorRole: member.role,
      action: 'CANCEL_LOAN',
      entityType: 'loan',
      entityId: loanId,
    });

    return { success: true, message: 'Permintaan peminjaman berhasil dibatalkan.' };
  });
}

// ---------- Settings & Users ----------

export async function updateSettings(newSettings: Partial<SystemSettings>, actor: User): Promise<SystemSettings> {
  return withTransaction(async (client) => {
    const currentRes = await client.query('SELECT * FROM settings WHERE id = 1 FOR UPDATE');
    const current = mapSettings(currentRes.rows[0]);
    const updated: SystemSettings = {
      ...current,
      ...newSettings,
      updatedAt: new Date().toISOString(),
      updatedBy: actor.displayName,
    };
    await client.query(
      `UPDATE settings SET
         max_active_copies_per_member = $2,
         loan_duration_days = $3,
         allow_member_cancellation = $4,
         library_name = $5,
         library_address = $6,
         updated_at = now(),
         updated_by = $7
       WHERE id = 1`,
      [
        updated.maxActiveCopiesPerMember,
        updated.loanDurationDays,
        updated.allowMemberCancellation,
        updated.libraryName,
        updated.libraryAddress,
        updated.updatedBy,
      ]
    );
    await insertAuditLog(client, {
      actorUid: actor.uid,
      actorName: actor.displayName,
      actorRole: actor.role,
      action: 'UPDATE_SETTINGS',
      entityType: 'settings',
      entityId: 'global',
      metadata: newSettings,
    });
    return updated;
  });
}

export async function updateUserStatus(
  uid: string,
  status: 'active' | 'inactive',
  actor: User
): Promise<void> {
  await withTransaction(async (client) => {
    const res = await client.query(
      `UPDATE users SET status = $2, updated_at = now() WHERE uid = $1 RETURNING *`,
      [uid, status]
    );
    if (res.rows.length === 0) throw new Error('Pengguna tidak ditemukan.');
    await insertAuditLog(client, {
      actorUid: actor.uid,
      actorName: actor.displayName,
      actorRole: actor.role,
      action: 'UPDATE_USER_STATUS',
      entityType: 'user',
      entityId: uid,
      metadata: { status },
    });
  });
}

export async function createAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void> {
  await insertAuditLog(pool, log);
}

export type { PoolClient, LoanItem, BookStatus };
