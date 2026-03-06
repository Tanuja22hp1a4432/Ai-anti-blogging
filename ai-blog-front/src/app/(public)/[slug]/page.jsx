import { blogApi } from '@/lib/api';
import BlogContent from '@/components/public/BlogContent';
import { format } from 'date-fns';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }) {
  try {
    const { slug } = await params;
    const blog = await blogApi.getBlogBySlug(slug);
    if (!blog) return {};
    return {
      title: blog.title,
      description: blog.meta_description,
      keywords: blog.meta_keywords,
      openGraph: {
        title: blog.og_title,
        description: blog.og_description,
        type: 'article',
      },
    };
  } catch {
    return {};
  }
}

export default async function BlogPage({ params }) {
  let blog;
  try {
    const { slug } = await params;
    blog = await blogApi.getBlogBySlug(slug);
  } catch (err) {
    return notFound();
  }

  if (!blog) return notFound();

  return (
    <article className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <header className="mb-12">
        <div className="flex items-center space-x-3 text-sm text-blue-600 font-bold mb-4">
          <span className="uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">{blog.category}</span>
          <span className="text-gray-300">•</span>
          <span className="text-gray-500 font-normal">{blog.reading_time_min} min read</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6">
          {blog.title}
        </h1>
        <div className="flex items-center text-gray-500 mb-8">
          <span className="font-medium">By NewsAI Writer</span>
          <span className="mx-2">•</span>
          <span>{format(new Date(blog.published_at), 'MMMM d, yyyy')}</span>
        </div>
        <div className="p-6 bg-gray-50 rounded-2xl border-l-4 border-blue-500 text-lg text-gray-700 italic leading-relaxed">
          {blog.summary}
        </div>
      </header>

      <div className="mt-8">
        <BlogContent content={blog.content} />
      </div>

      <footer className="mt-20 pt-10 border-t">
        <div className="flex flex-wrap gap-2">
          {JSON.parse(blog.tags || '[]').map(tag => (
            <span key={tag} className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
              #{tag}
            </span>
          ))}
        </div>
      </footer>
    </article>
  );
}
