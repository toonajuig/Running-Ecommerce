import { Inter } from 'next/font/google';
import { Suspense } from 'react';
import './globals.css';
import Providers from './providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: 'RunStore',
  description: 'Premium running gear',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen font-sans">
        <Providers>
          <Suspense>{children}</Suspense>
        </Providers>
      </body>
    </html>
  );
}
