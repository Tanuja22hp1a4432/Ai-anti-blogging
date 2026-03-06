import { AuthProvider } from '@/components/providers/AuthProvider';
import "./globals.css";

export const metadata = {
  title: "NewsAI Blog | Intelligent News Insights",
  description: "AI-powered daily news blog and analysis",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
