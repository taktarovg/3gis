import { AdminAuth } from '@/components/admin/AdminAuth';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

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
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </AdminAuth>
  );
}
