import Header from '../components/Header';
import AuthGuard from '@/components/AuthGuard';

export default function RoutesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthGuard>
            <Header />
            {children}
        </AuthGuard>
    );
} 