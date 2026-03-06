import Link from 'next/link';

export default function Header() {
  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-gray-900 tracking-tight">
          NewsAI<span className="text-blue-600">Blog</span>
        </Link>
        <nav className="flex space-x-8">
          <Link href="/" className="text-gray-600 hover:text-gray-900 font-medium">Home</Link>
          <Link href="/admin" className="text-gray-600 hover:text-gray-900 font-medium">Admin</Link>
        </nav>
      </div>
    </header>
  );
}
