import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Zynq — Vitaliteit begint bij leiderschap',
  description: 'Zynq staat voor vitaliteit op de werkvloer — concreet, menselijk en betrouwbaar.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
