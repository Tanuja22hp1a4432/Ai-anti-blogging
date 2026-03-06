'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { blogApi } from '@/lib/api';
import Link from 'next/link';
import { Edit, Trash2, Globe, FileText, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function BlogsManager() {
  const { data: session } = useSession();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.accessToken) {
      loadBlogs();
    }
  }, [session]);

  const loadBlogs = async () => {
    setLoading(true);
    try {
      const data = await blogApi.getAdminBlogs(session.accessToken);
      setBlogs(data);
    } catch (err) {
      console.error('Failed to load blogs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async (id, currentStatus) => {
    try {
      await blogApi.togglePublish(id, !currentStatus, session.accessToken);
      loadBlogs();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this blog?')) {
      try {
        await blogApi.deleteBlog(id, session.accessToken);
        loadBlogs();
      } catch (err) {
        alert('Failed to delete blog');
      }
    }
  };

  if (loading) return <div className="text-gray-500">Loading blogs...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blog Manager</h1>
          <p className="text-gray-500 mt-1">Manage all drafts and published posts</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {blogs.map((blog) => (
              <tr key={blog.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="text-sm font-bold text-gray-900 line-clamp-1">{blog.title}</div>
                  <div className="text-xs text-gray-400 mt-1">{blog.slug}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-800 uppercase">
                    {blog.category}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {blog.is_published ? (
                    <span className="inline-flex items-center text-green-600 space-x-1 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      <span>Published</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-amber-500 space-x-1 text-sm">
                      <Clock className="w-4 h-4" />
                      <span>Draft</span>
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                  {format(new Date(blog.created_at), 'MMM d, yyyy')}
                </td>
                <td className="px-6 py-4 text-right space-x-3">
                  <button 
                    onClick={() => handleTogglePublish(blog.id, blog.is_published)}
                    className={cn(
                      "p-2 rounded-lg transition-colors",
                      blog.is_published ? "text-amber-600 hover:bg-amber-50" : "text-green-600 hover:bg-green-50"
                    )}
                    title={blog.is_published ? "Unpublish" : "Publish"}
                  >
                    {blog.is_published ? <XCircle className="w-5 h-5" /> : <Globe className="w-5 h-5" />}
                  </button>
                  <Link 
                    href={`/admin/blogs/${blog.id}`}
                    className="inline-block p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-5 h-5" />
                  </Link>
                  <button 
                    onClick={() => handleDelete(blog.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {blogs.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            No blogs found. Run a job to generate content.
          </div>
        )}
      </div>
    </div>
  );
}

function Clock(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}
