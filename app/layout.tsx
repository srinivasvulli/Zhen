import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/react';
import './globals.css';
export const metadata: Metadata = { title: 'Zhen — AI Portfolio & ATS Resume Builder', description: 'Turn your experience into a polished portfolio and ATS-safe résumé.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}<Analytics /></body></html>; }
