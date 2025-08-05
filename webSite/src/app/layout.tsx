
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { NotificationRenderer } from '@/components/ui/notification-renderer';

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
      <body className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <AuthProvider>
          <NotificationProvider>
            {children}
            <NotificationRenderer />
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
