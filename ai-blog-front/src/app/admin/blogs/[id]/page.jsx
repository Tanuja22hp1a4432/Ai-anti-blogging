'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { blogApi } from '@/lib/api';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import Link from 'next/link';

export default function BlogEditor({ params }) {
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;
  const { data: session } = useSession();
  const router = useRouter();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (session?.accessToken && id) {
      blogApi.getAdminBlogById(id, session.accessToken)
        .then(setBlog)
        .finally(() => setLoading(false));
    }
  }, [session, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBlog(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updateData = {
        ...blog,
        tags: typeof blog.tags === 'string' ? JSON.parse(blog.tags) : blog.tags
      };
      await blogApi.updateBlog(id, updateData, session.accessToken);
      alert('Blog saved successfully!');
    } catch (err) {
      alert('Failed to save blog');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-gray-500">Loading editor...</div>;
  if (!blog) return <div>Blog not found</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/admin/blogs" className="p-2 bg-white rounded-full border shadow-sm hover:shadow-md transition-shadow">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 line-clamp-1">Edit: {blog.title}</h1>
        </div>
        <div className="flex space-x-3">
          <Link 
            href={`/${blog.slug}`} 
            target="_blank"
            className="flex items-center space-x-2 px-4 py-2 bg-white border rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
          >
            <Eye className="w-4 h-4" />
            <span>Preview</span>
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 shadow-lg shadow-blue-500/20"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      <form className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Blog Title</label>
              <input
                type="text"
                name="title"
                value={blog.title}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-xl font-bold transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Content (Markdown)</label>
              <textarea
                name="content"
                value={blog.content}
                onChange={handleChange}
                rows={25}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono text-sm leading-relaxed transition-all"
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
            <h2 className="text-lg font-bold text-gray-900 border-b pb-4">Metadata</h2>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
              <select
                name="category"
                value={blog.category}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {['Politics', 'World', 'Technology', 'Business', 'Sports', 'Health', 'Entertainment', 'Science'].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Summary</label>
              <textarea
                name="summary"
                value={blog.summary}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
            <h2 className="text-lg font-bold text-gray-900 border-b pb-4">SEO Settings</h2>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Meta Description</label>
              <textarea
                name="meta_description"
                value={blog.meta_description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-xs"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Meta Keywords</label>
              <input
                type="text"
                name="meta_keywords"
                value={blog.meta_keywords}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-xs"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
