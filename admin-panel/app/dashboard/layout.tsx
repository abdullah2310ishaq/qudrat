'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ToastProvider } from '@/components/Toast';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#F5F5DC] text-black">
        {/* Sidebar Navigation */}
        <aside className="fixed left-0 top-0 h-full w-64 bg-[#F5F5DC] text-black border-r border-black/10">
          <div className="p-6 border-b border-black/10">
            <h1 className="text-xl font-semibold text-black tracking-tight">
              Qudrat Academy
            </h1>
            <p className="text-xs font-medium text-black/60 mt-2 tracking-wider uppercase">Admin Portal</p>
          </div>
          <nav className="p-4 space-y-1">
            <NavLink href="/dashboard" isActive={pathname === '/dashboard'}>
              <span className="mr-3 text-sm opacity-70"></span> Dashboard
            </NavLink>
            <NavLink href="/dashboard/courses-unified" isActive={pathname?.startsWith('/dashboard/courses-unified')}>
              <span className="mr-3 text-sm opacity-70"></span> Courses & Lessons
            </NavLink>
            <NavLink href="/dashboard/ai-courses-unified" isActive={pathname?.startsWith('/dashboard/ai-courses-unified')}>
              <span className="mr-3 text-sm opacity-70"></span> AI Mastery Paths
            </NavLink>
            <NavLink href="/dashboard/challenges-unified" isActive={pathname?.startsWith('/dashboard/challenges-unified')}>
              <span className="mr-3 text-sm opacity-70"></span> Challenges
            </NavLink>
            <NavLink href="/dashboard/prompts-unified" isActive={pathname?.startsWith('/dashboard/prompts-unified')}>
              <span className="mr-3 text-sm opacity-70"></span> Prompts
            </NavLink>
            {/* <NavLink href="/dashboard/certificates" isActive={pathname?.startsWith('/dashboard/certificates')}>
              <span className="mr-3 text-sm opacity-70"></span> Certificates
            </NavLink> */}
            <NavLink href="/dashboard/users" isActive={pathname?.startsWith('/dashboard/users')}>
              <span className="mr-3 text-sm opacity-70"></span> Users
            </NavLink>
            {/* <NavLink href="/dashboard/payment" isActive={pathname?.startsWith('/dashboard/payment')}>
              <span className="mr-3 text-sm opacity-70"></span> Payment
            </NavLink> */}
          </nav>  
        </aside>

        {/* Main Content */}
        <main className="ml-64 min-h-screen bg-[#F5F5DC] text-black">{children}</main>
      </div>
    </ToastProvider>
  );
}

function NavLink({ href, children, isActive }: { href: string; children: React.ReactNode; isActive?: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center px-4 py-2.5 rounded-sm transition-all duration-300 font-medium text-sm tracking-wide ${
        isActive
          ? 'bg-black/5 text-black border-l-2 border-black/30'
          : 'text-black/70 hover:bg-black/5 hover:text-black border-l-2 border-transparent'
      }`}
    >
      {children}
    </Link>
  );
}

