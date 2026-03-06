import ReactMarkdown from 'react-markdown';

export default function BlogContent({ content }) {
  return (
    <div className="prose prose-lg prose-blue max-w-none prose-headings:font-bold prose-a:text-blue-600">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
