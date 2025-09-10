
import type { Metadata } from 'next';
import { Quicksand } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { MarketDataProvider } from '@/contexts/MarketDataContext';
import { NotificationRenderer } from '@/components/ui/notification-renderer';

const quicksand = Quicksand({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-quicksand',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Matka SK',
  description: 'Matka SK - Online Matka Game',
  other: {
    'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate, max-age=0" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        <meta httpEquiv="Last-Modified" content={new Date().toUTCString()} />
        <meta httpEquiv="ETag" content={`"${Date.now()}"`} />
      </head>
      <body className={`${quicksand.variable} font-quicksand antialiased`}>
        <AuthProvider>
          <NotificationProvider>
            <MarketDataProvider>
              {children}
              <NotificationRenderer />
            </MarketDataProvider>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
