export type Role = 'admin' | 'staff' | 'member';
export type UserStatus = 'active' | 'inactive';

export interface User {
  uid: string;
  displayName: string;
  email: string;
  memberNumber?: string;
  role: Role;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export type BookStatus = 'active' | 'archived';

export interface Book {
  id: string;
  isbn?: string;
  title: string;
  authors: string[];
  publisher?: string;
  publicationYear?: number;
  categoryId: string;
  description?: string;
  coverUrl?: string;
  totalCopies: number;
  availableCopies: number;
  status: BookStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export type LoanStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'BORROWED' | 'RETURNED' | 'CANCELLED';

export interface LoanItem {
  bookId: string;
  bookTitle: string;
  coverUrl?: string;
  quantity: number;
}

export interface Loan {
  id: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  items: LoanItem[];
  status: LoanStatus;
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  handedOverAt?: string;
  dueAt?: string;
  returnedAt?: string;
  receivedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SystemSettings {
  maxActiveCopiesPerMember: number;
  loanDurationDays: number;
  allowMemberCancellation: boolean;
  libraryName: string;
  libraryAddress: string;
  updatedAt: string;
  updatedBy: string;
}

export interface AuditLog {
  id: string;
  actorUid: string;
  actorName: string;
  actorRole: Role;
  action: string;
  entityType: string;
  entityId: string;
  timestamp: string;
  metadata?: Record<string, any>;
}
