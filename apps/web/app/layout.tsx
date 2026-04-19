import './globals.css';
import Link from 'next/link';
import { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b bg-white">
          <nav className="mx-auto flex max-w-6xl gap-6 p-4 text-sm font-medium">
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/agents">Agents</Link>
            <Link href="/agents/new">New Agent</Link>
            <Link href="/playground">Playground</Link>
          </nav>
        </header>
        <main className="mx-auto max-w-6xl p-6">{children}</main>
      </body>
    </html>
  );
}
