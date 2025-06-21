import { AdminAuth } from '@/components/admin/AdminAuth';

export const metadata = {
  title: '3GIS Admin Panel',
  description: 'Панель администратора 3GIS',
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * Layout для админки с авторизацией
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuth>
      {children}
    </AdminAuth>
  );
}
