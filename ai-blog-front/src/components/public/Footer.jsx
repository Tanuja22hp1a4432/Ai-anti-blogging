export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} NewsAI Blog. All rights reserved.</p>
        <p className="mt-2 italic">AI-powered news synthesis & blog generation.</p>
      </div>
    </footer>
  );
}
