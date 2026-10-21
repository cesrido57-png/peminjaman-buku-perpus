import type { User, Book, Category, Loan, LoanItem, SystemSettings, AuditLog } from '@/types/library';

export function mapUser(row: Record<string, any>): User {
  return {
    uid: row.uid,
    displayName: row.display_name,
    email: row.email,
    memberNumber: row.member_number ?? undefined,
    role: row.role,
    status: row.status,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

export function mapBook(row: Record<string, any>): Book {
  return {
    id: row.id,
    isbn: row.isbn ?? undefined,
    title: row.title,
    authors: typeof row.authors === 'string' ? JSON.parse(row.authors) : row.authors ?? [],
    publisher: row.publisher ?? undefined,
    publicationYear: row.publication_year ?? undefined,
    categoryId: row.category_id,
    description: row.description ?? undefined,
    coverUrl: row.cover_url ?? undefined,
    totalCopies: row.total_copies,
    availableCopies: row.available_copies,
    status: row.status,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

export function mapCategory(row: Record<string, any>): Category {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    status: row.status,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

export function mapLoan(row: Record<string, any>, items: LoanItem[]): Loan {
  return {
    id: row.id,
    memberId: row.member_id,
    memberName: row.member_name,
    memberEmail: row.member_email,
    items,
    status: row.status,
    requestedAt: row.requested_at ? new Date(row.requested_at).toISOString() : '',
    reviewedAt: row.reviewed_at ? new Date(row.reviewed_at).toISOString() : undefined,
    reviewedBy: row.reviewed_by ?? undefined,
    rejectionReason: row.rejection_reason ?? undefined,
    handedOverAt: row.handed_over_at ? new Date(row.handed_over_at).toISOString() : undefined,
    dueAt: row.due_at ? new Date(row.due_at).toISOString() : undefined,
    returnedAt: row.returned_at ? new Date(row.returned_at).toISOString() : undefined,
    receivedBy: row.received_by ?? undefined,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

export function mapLoanItem(row: Record<string, any>): LoanItem {
  return {
    bookId: row.book_id,
    bookTitle: row.book_title,
    coverUrl: row.cover_url ?? undefined,
    quantity: row.quantity,
  };
}

export function mapSettings(row: Record<string, any>): SystemSettings {
  return {
    maxActiveCopiesPerMember: row.max_active_copies_per_member,
    loanDurationDays: row.loan_duration_days,
    allowMemberCancellation: row.allow_member_cancellation,
    libraryName: row.library_name,
    libraryAddress: row.library_address,
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
    updatedBy: row.updated_by ?? 'System Admin',
  };
}

export function mapAuditLog(row: Record<string, any>): AuditLog {
  return {
    id: row.id,
    actorUid: row.actor_uid,
    actorName: row.actor_name,
    actorRole: row.actor_role,
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id,
    timestamp: new Date(row.timestamp).toISOString(),
    metadata: row.metadata
      ? typeof row.metadata === 'string'
        ? JSON.parse(row.metadata)
        : row.metadata
      : undefined,
  };
}
