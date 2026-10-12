import type {Metadata} from 'next';
import './globals.css'; // Global styles
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Pustaka - Library Management System',
  description: 'Aplikasi web modern untuk manajemen perpustakaan: katalog buku, peminjaman, persetujuan petugas, pengembalian, dan laporan operasional.',
  openGraph: {
    title: 'Pustaka - Library Management System',
    description: 'Aplikasi web modern untuk manajemen perpustakaan: katalog buku, peminjaman, persetujuan petugas, pengembalian, dan laporan operasional.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pustaka - Library Management System',
    description: 'Aplikasi web modern untuk manajemen perpustakaan: katalog buku, peminjaman, persetujuan petugas, pengembalian, dan laporan operasional.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className="bg-slate-50 text-slate-900 font-sans antialiased">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
