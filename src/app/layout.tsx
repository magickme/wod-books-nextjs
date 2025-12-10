import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'World of Darkness Book Tracker',
  description: 'Track your World of Darkness book collection',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="border-b">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold">
              World of Darkness Book Tracker
            </h1>
          </div>
        </header>
        <main className="min-h-screen">{children}</main>
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
