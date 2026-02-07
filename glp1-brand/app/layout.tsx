import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BackToTop from '@/components/BackToTop';
import { BRAND } from '@/data/brand';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: BRAND.meta.title,
  description: BRAND.meta.description,
  keywords: [
    'GLP-1 supplements',
    'Ozempic supplements',
    'Wegovy vitamins',
    'Mounjaro nutrition',
    'Zepbound support',
    'semaglutide supplements',
    'tirzepatide vitamins',
    'weight loss supplements',
    'muscle preservation',
    'hair loss GLP-1',
  ],
  openGraph: {
    title: BRAND.meta.title,
    description: BRAND.hero.subhead,
    type: 'website',
    siteName: BRAND.name,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${BRAND.name} — Supplements for the GLP-1 Generation`,
    description: BRAND.meta.description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased">
        <Header />
        <main className="pt-16 sm:pt-20">{children}</main>
        <Footer />
        <BackToTop />
      </body>
    </html>
  );
}
