import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Master World Tour & Expedition Beyond the Ice Wall',
  description: 'An interactive itinerary map — known-world travel plus a fictional speculative expedition.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
