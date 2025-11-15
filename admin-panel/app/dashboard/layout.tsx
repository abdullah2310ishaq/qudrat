'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-black">
      {/* Sidebar Navigation */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-zinc-900 via-black to-zinc-900 text-white shadow-2xl border-r border-zinc-800">
        <div className="p-6 border-b border-zinc-800">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
            Qidrat Admin
          </h1>
          <p className="text-xs text-zinc-500 mt-1">Learning Platform</p>
        </div>
        <nav className="p-4 space-y-1">
          <NavLink href="/dashboard" isActive={pathname === '/dashboard'}>
            <span className="mr-3">📊</span> Dashboard
          </NavLink>
          <NavLink href="/dashboard/courses" isActive={pathname?.startsWith('/dashboard/courses')}>
            <span className="mr-3">📚</span> Courses
          </NavLink>
          <NavLink href="/dashboard/lessons" isActive={pathname?.startsWith('/dashboard/lessons')}>
            <span className="mr-3">📖</span> Lessons
          </NavLink>
          <NavLink href="/dashboard/ai-courses" isActive={pathname?.startsWith('/dashboard/ai-courses')}>
            <span className="mr-3">🤖</span> AI Mastery Paths
          </NavLink>
          <NavLink href="/dashboard/challenges" isActive={pathname?.startsWith('/dashboard/challenges')}>
            <span className="mr-3">🎯</span> Challenges
          </NavLink>
          <NavLink href="/dashboard/prompts" isActive={pathname?.startsWith('/dashboard/prompts')}>
            <span className="mr-3">💡</span> Prompts
          </NavLink>
          <NavLink href="/dashboard/certificates" isActive={pathname?.startsWith('/dashboard/certificates')}>
            <span className="mr-3">🏆</span> Certificates
          </NavLink>
          <NavLink href="/dashboard/users" isActive={pathname?.startsWith('/dashboard/users')}>
            <span className="mr-3">👥</span> Users
          </NavLink>
          <NavLink href="/dashboard/payment" isActive={pathname?.startsWith('/dashboard/payment')}>
            <span className="mr-3">💳</span> Payment
          </NavLink>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen bg-black">{children}</main>
    </div>
  );
}

function NavLink({ href, children, isActive }: { href: string; children: React.ReactNode; isActive?: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
        isActive
          ? 'bg-white text-black shadow-lg shadow-white/20 font-semibold'
          : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
      }`}
    >
      {children}
    </Link>
  );
}

