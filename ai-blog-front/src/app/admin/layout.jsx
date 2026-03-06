import Sidebar from '@/components/admin/Sidebar';

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-grow flex flex-col">
        <main className="p-8 lg:p-12 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
