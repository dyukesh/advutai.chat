import './globals.css';
import { SessionProvider } from '@/components/auth/SessionProvider';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AdvutAI - Intelligent AI Workspace',
  description: 'AdvutAI is an AI operating system for chat, memory, agents, files, and planning.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100">
        <SessionProvider session={null}>{children}</SessionProvider>
      </body>
    </html>
  );
}
