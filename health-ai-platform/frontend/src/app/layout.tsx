import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Health AI Co-Creation Platform',
  description: 'Demo-ready collaboration platform for healthcare professionals and engineers.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
