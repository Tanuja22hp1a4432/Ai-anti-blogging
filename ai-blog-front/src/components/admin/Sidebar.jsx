'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileText, 
  PlayCircle, 
  Database, 
  Settings, 
  LogOut,
  Globe
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Blogs', href: '/admin/blogs', icon: FileText },
  { name: 'Jobs', href: '/admin/jobs', icon: PlayCircle },
  { name: 'Buffer', href: '/admin/buffer', icon: Database },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-gray-900 min-h-screen flex flex-col text-white">
      <div className="p-6">
        <Link href="/" className="flex items-center space-x-2">
          <Globe className="w-8 h-8 text-blue-400" />
          <span className="text-xl font-bold">AdminPanel</span>
        </Link>
      </div>

      <nav className="flex-grow px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors font-medium",
                isActive 
                  ? "bg-blue-600 text-white" 
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg text-gray-400 hover:bg-red-900/30 hover:text-red-400 transition-colors font-medium"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
