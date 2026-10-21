import { NextResponse } from 'next/server';

export function apiError(message: string, status = 500) {
  return NextResponse.json({ success: false, message }, { status });
}

export function handleApiError(error: unknown) {
  console.error('API error:', error);
  const message = error instanceof Error ? error.message : 'Terjadi kesalahan pada server.';
  const status = /tidak ditemukan|tidak aktif|tidak mencukupi|habis|tidak dapat|harus berstatus|sudah memiliki|batas maksimal/.test(message)
    ? 400
    : 500;
  return apiError(message, status);
}

export function isActor(value: unknown): boolean {
  return Boolean(value && typeof value === 'object' && 'uid' in value && 'displayName' in value);
}
