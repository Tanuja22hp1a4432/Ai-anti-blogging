import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}
