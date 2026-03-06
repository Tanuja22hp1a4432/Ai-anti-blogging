import Link from 'next/link';
import { format } from 'date-fns';

export default function BlogCard({ blog }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow group">
      <Link href={`/${blog.slug}`} className="block p-6">
        <div className="flex items-center space-x-2 text-sm text-blue-600 font-semibold mb-3">
          <span className="bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider text-[10px]">
            {blog.category}
          </span>
          <span className="text-gray-400 font-normal">·</span>
          <span className="text-gray-500 font-normal">{blog.reading_time_min} min read</span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
          {blog.title}
        </h3>
        <p className="text-gray-600 line-clamp-3 text-sm leading-relaxed mb-4">
          {blog.summary}
        </p>
        <div className="flex items-center text-xs text-gray-400 mt-auto">
          {format(new Date(blog.published_at || blog.created_at), 'MMMM d, yyyy')}
        </div>
      </Link>
    </div>
  );
}
