import { blogApi } from '@/lib/api';
import BlogCard from '@/components/public/BlogCard';
import PublicLayout from './(public)/layout';

export default async function HomePage({ searchParams }) {
  const page = parseInt(searchParams.page) || 1;
  const category = searchParams.category || '';
  
  let data = { blogs: [], pagination: { total: 0 } };
  try {
    data = await blogApi.getBlogs(page, category);
  } catch (err) {
    console.error('Failed to fetch blogs:', err.message);
  }

  const categories = await blogApi.getCategories().catch(() => []);

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Latest Insights from <span className="text-blue-600">NewsAI</span>
          </h1>
          <p className="mt-4 text-xl text-gray-500 max-w-2xl mx-auto">
            AI-driven analysis of today's top stories, synthesized into deep-dive blog posts.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          <a 
            href="/" 
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${!category ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            All
          </a>
          {categories.map(cat => (
            <a 
              key={cat}
              href={`/?category=${cat}`} 
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${category === cat ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {cat}
            </a>
          ))}
        </div>

        {data.blogs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.blogs.map(blog => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed">
            <h3 className="text-lg font-medium text-gray-900">No blog posts found</h3>
            <p className="text-gray-500 mt-1">Check back later for fresh AI-generated content.</p>
          </div>
        )}
        
        {/* Pagination placeholder */}
        {data.pagination.totalPages > 1 && (
          <div className="mt-12 flex justify-center">
            {/* Simple pagination would go here */}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
