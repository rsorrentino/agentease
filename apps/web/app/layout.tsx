import './globals.css';
import { ReactNode } from 'react';
import { SidebarNav } from '../components/sidebar-nav';

export const metadata = {
  title: 'AgentEase',
  description: 'Build, test, and deploy Salesforce AI agents — no code required.'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="flex h-screen overflow-hidden bg-slate-50 font-sans">
        <SidebarNav />
        <div className="ml-[240px] flex flex-1 flex-col overflow-y-auto">
          <main className="flex-1 px-8 py-8 animate-fade-in">{children}</main>
        </div>
      </body>
    </html>
  );
}
