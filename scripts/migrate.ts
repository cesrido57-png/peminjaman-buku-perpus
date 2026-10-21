import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from 'pg';
import {
  INITIAL_SETTINGS,
  INITIAL_USERS,
  INITIAL_CATEGORIES,
  INITIAL_BOOKS,
  INITIAL_LOANS,
  INITIAL_AUDIT_LOGS,
} from '../lib/seed-data';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadDatabaseUrl(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const envPath = resolve(__dirname, '..', '.env.local');
  if (existsSync(envPath)) {
    const content = readFileSync(envPath, 'utf8');
    const match = content.match(/^\s*DATABASE_URL\s*=\s*"?([^"\r\n]+)"?\s*$/m);
    if (match) return match[1].trim();
  }
  throw new Error('DATABASE_URL tidak ditemukan di environment maupun .env.local');
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  uid TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  email TEXT NOT NULL,
  member_number TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'staff', 'member')),
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS books (
  id TEXT PRIMARY KEY,
  isbn TEXT,
  title TEXT NOT NULL,
  authors JSONB NOT NULL DEFAULT '[]'::jsonb,
  publisher TEXT,
  publication_year INTEGER,
  category_id TEXT REFERENCES categories(id),
  description TEXT,
  cover_url TEXT,
  total_copies INTEGER NOT NULL DEFAULT 1,
  available_copies INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS loans (
  id TEXT PRIMARY KEY,
  member_id TEXT NOT NULL REFERENCES users(uid),
  member_name TEXT NOT NULL,
  member_email TEXT NOT NULL,
  status TEXT NOT NULL,
  requested_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT,
  rejection_reason TEXT,
  handed_over_at TIMESTAMPTZ,
  due_at TIMESTAMPTZ,
  returned_at TIMESTAMPTZ,
  received_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS loan_items (
  id SERIAL PRIMARY KEY,
  loan_id TEXT NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  book_id TEXT NOT NULL REFERENCES books(id),
  book_title TEXT NOT NULL,
  cover_url TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  position INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  max_active_copies_per_member INTEGER NOT NULL,
  loan_duration_days INTEGER NOT NULL,
  allow_member_cancellation BOOLEAN NOT NULL,
  library_name TEXT NOT NULL,
  library_address TEXT NOT NULL,
  updated_at TIMESTAMPTZ,
  updated_by TEXT
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  actor_uid TEXT NOT NULL,
  actor_name TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_books_category ON books(category_id);
CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);
CREATE INDEX IF NOT EXISTS idx_loans_member ON loans(member_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
CREATE INDEX IF NOT EXISTS idx_loan_items_loan ON loan_items(loan_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
`;

async function countRows(client: Client, table: string): Promise<number> {
  const res = await client.query(`SELECT COUNT(*)::int AS n FROM ${table}`);
  return res.rows[0].n;
}

async function seed(client: Client): Promise<void> {
  if ((await countRows(client, 'categories')) === 0) {
    for (const c of INITIAL_CATEGORIES) {
      await client.query(
        `INSERT INTO categories (id, name, description, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [c.id, c.name, c.description ?? null, c.status, c.createdAt, c.updatedAt]
      );
    }
    console.log(`seeded categories: ${INITIAL_CATEGORIES.length}`);
  }

  if ((await countRows(client, 'users')) === 0) {
    for (const u of INITIAL_USERS) {
      await client.query(
        `INSERT INTO users (uid, display_name, email, member_number, role, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [u.uid, u.displayName, u.email, u.memberNumber ?? null, u.role, u.status, u.createdAt, u.updatedAt]
      );
    }
    console.log(`seeded users: ${INITIAL_USERS.length}`);
  }

  if ((await countRows(client, 'books')) === 0) {
    for (const b of INITIAL_BOOKS) {
      await client.query(
        `INSERT INTO books (id, isbn, title, authors, publisher, publication_year, category_id,
                            description, cover_url, total_copies, available_copies, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
          b.id, b.isbn ?? null, b.title, JSON.stringify(b.authors), b.publisher ?? null,
          b.publicationYear ?? null, b.categoryId, b.description ?? null, b.coverUrl ?? null,
          b.totalCopies, b.availableCopies, b.status, b.createdAt, b.updatedAt,
        ]
      );
    }
    console.log(`seeded books: ${INITIAL_BOOKS.length}`);
  }

  if ((await countRows(client, 'loans')) === 0) {
    for (const l of INITIAL_LOANS) {
      await client.query(
        `INSERT INTO loans (id, member_id, member_name, member_email, status, requested_at,
                            reviewed_at, reviewed_by, rejection_reason, handed_over_at, due_at,
                            returned_at, received_by, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
        [
          l.id, l.memberId, l.memberName, l.memberEmail, l.status, l.requestedAt ?? null,
          l.reviewedAt ?? null, l.reviewedBy ?? null, l.rejectionReason ?? null,
          l.handedOverAt ?? null, l.dueAt ?? null, l.returnedAt ?? null, l.receivedBy ?? null,
          l.createdAt, l.updatedAt,
        ]
      );
      for (let i = 0; i < l.items.length; i++) {
        const item = l.items[i];
        await client.query(
          `INSERT INTO loan_items (loan_id, book_id, book_title, cover_url, quantity, position)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [l.id, item.bookId, item.bookTitle, item.coverUrl ?? null, item.quantity, i]
        );
      }
    }
    console.log(`seeded loans: ${INITIAL_LOANS.length}`);
  }

  if ((await countRows(client, 'settings')) === 0) {
    await client.query(
      `INSERT INTO settings (id, max_active_copies_per_member, loan_duration_days,
                             allow_member_cancellation, library_name, library_address, updated_at, updated_by)
       VALUES (1, $1, $2, $3, $4, $5, $6, $7)`,
      [
        INITIAL_SETTINGS.maxActiveCopiesPerMember,
        INITIAL_SETTINGS.loanDurationDays,
        INITIAL_SETTINGS.allowMemberCancellation,
        INITIAL_SETTINGS.libraryName,
        INITIAL_SETTINGS.libraryAddress,
        INITIAL_SETTINGS.updatedAt,
        INITIAL_SETTINGS.updatedBy,
      ]
    );
    console.log('seeded settings: 1');
  }

  if ((await countRows(client, 'audit_logs')) === 0) {
    for (const log of INITIAL_AUDIT_LOGS) {
      await client.query(
        `INSERT INTO audit_logs (id, actor_uid, actor_name, actor_role, action, entity_type, entity_id, timestamp, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)`,
        [
          log.id, log.actorUid, log.actorName, log.actorRole, log.action,
          log.entityType, log.entityId, log.timestamp,
          log.metadata ? JSON.stringify(log.metadata) : null,
        ]
      );
    }
    console.log(`seeded audit_logs: ${INITIAL_AUDIT_LOGS.length}`);
  }
}

async function main(): Promise<void> {
  const client = new Client({ connectionString: loadDatabaseUrl() });
  await client.connect();
  try {
    console.log('connected to Neon, applying schema...');
    await client.query(SCHEMA);
    console.log('schema OK');
    await seed(client);
    const tables = await client.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`
    );
    console.log('tables:', tables.rows.map((r) => r.table_name).join(', '));
    console.log('migration selesai.');
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('migration gagal:', err.message);
  process.exit(1);
});
