import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PaletteProvider } from '@/components/PaletteProvider';
import { AuthProvider } from '@/components/AuthProvider';
import { ServiceWorkerInitializer } from '@/components/ServiceWorkerInitializer';
import './globals.css';

export const metadata: Metadata = {
  title: 'LifeMap - Your Life Journey Visualized',
  description:
    'Privacy-first location journaling app that visualizes your life journey',
  manifest: '/manifest.json',
  themeColor: '#7fe3ff',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'LifeMap',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body data-app="lifemap" className="theme-dark">
        <ServiceWorkerInitializer />
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
