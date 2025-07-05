import { AdminSidebar } from '@/components/admin-sidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full">
      <AdminSidebar />
      <main className="flex flex-1 flex-col p-4 md:p-6 lg:p-8 bg-muted/40">
        {children}
      </main>
    </div>
  );
}
