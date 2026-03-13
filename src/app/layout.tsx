import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { GeistPixelSquare } from 'geist/font/pixel';
import { Toaster } from 'react-hot-toast';
import { Web3Provider } from '@/context/Web3Context';
import { Navbar } from '@/components/layout/Navbar';
import './globals.css';

export const metadata: Metadata = {
  title: 'Eidos8004 — AI Design Attribution',
  description: 'Own your creative legacy. Earn royalties when AI agents use your designs. Powered by EIP-8004 on-chain attribution.',
  openGraph: {
    title: 'Eidos8004',
    description: 'Own your creative legacy. Earn royalties when AI agents use your designs.',
    type: 'website',
    siteName: 'Eidos8004',
  },
  twitter: {
    card: 'summary',
    title: 'Eidos8004',
    description: 'Own your creative legacy. Earn royalties when AI agents use your designs.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){navigator.serviceWorker.getRegistrations().then(r=>r.forEach(sw=>sw.unregister()));caches.keys().then(k=>k.forEach(c=>caches.delete(c)));}`,
          }}
        />
      </head>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} ${GeistPixelSquare.variable} antialiased bg-c1 text-c12`}
        suppressHydrationWarning
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-c2 focus:text-c12 focus:px-4 focus:py-2 focus:border focus:border-c3 focus:text-sm focus:font-mono"
        >
          Skip to content
        </a>
        <Web3Provider>
          <Navbar />
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'var(--c2)',
                color: 'var(--c12)',
                border: '1px solid var(--c3)',
                borderRadius: '12px',
                fontSize: '13px',
                fontFamily: 'var(--font-geist-mono)',
              },
              success: {
                iconTheme: {
                  primary: 'var(--success)',
                  secondary: 'var(--c1)',
                },
              },
              error: {
                iconTheme: {
                  primary: 'var(--error)',
                  secondary: 'var(--c1)',
                },
              },
            }}
          />
        </Web3Provider>
      </body>
    </html>
  );
}
