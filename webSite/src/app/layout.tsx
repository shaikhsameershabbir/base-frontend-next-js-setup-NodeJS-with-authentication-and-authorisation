
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
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
