import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PaletteProvider } from '@/components/PaletteProvider';
import { AuthProvider } from '@/components/AuthProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'LifeMap - Your Life Journey Visualized',
  description:
    'Privacy-first location journaling app that visualizes your life journey',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body data-app="lifemap" className="theme-dark">
        <AuthProvider>
          <PaletteProvider>
            <Header />
            <main className="lm-shell" role="main">
              {children}
            </main>
            <Footer />
            <div id="portal-root" aria-hidden="true" />
          </PaletteProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
