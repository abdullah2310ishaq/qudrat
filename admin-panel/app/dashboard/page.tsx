'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Stats {
  courses: number;
  challenges: number;
  prompts: number;
  users: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    courses: 0,
    challenges: 0,
    prompts: 0,
    users: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [coursesRes, challengesRes, promptsRes, usersRes] =
        await Promise.all([
          fetch('/api/courses'),
          fetch('/api/challenges'),
          fetch('/api/prompts'),
          fetch('/api/users'),
        ]);

      const courses = await coursesRes.json();
      const challenges = await challengesRes.json();
      const prompts = await promptsRes.json();
      const users = await usersRes.json();

      setStats({
        courses: courses.data?.length || 0,
        challenges: challenges.data?.length || 0,
        prompts: prompts.data?.length || 0,
        users: users.data?.length || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: '#F5F5DC' }}>
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-black/60 uppercase tracking-[0.2em]">Admin overview</p>
          <h1 className="text-2xl font-bold text-black">Dashboard</h1>
          <p className="text-sm text-black/70">A calm snapshot of the platform across courses, challenges, prompts, and users.</p>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-black/20 border-t-black"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard title="Courses" value={stats.courses} link="/dashboard/courses-unified" icon="📚" />
            <StatCard title="Challenges" value={stats.challenges} link="/dashboard/challenges-unified" icon="🎯" />
            <StatCard title="Prompts" value={stats.prompts} link="/dashboard/prompts-unified" icon="💡" />
            <StatCard title="Users" value={stats.users} link="/dashboard/users" icon="👥" />
          </div>
        )}

        <div className="bg-white rounded border border-black/10 p-5 shadow-sm">
          <h2 className="text-base font-bold text-black mb-2">Notes</h2>
          <p className="text-sm text-black/70">
            Keep an eye on course health, challenge engagement, and prompt freshness. Dive into any card above to review or update details.
          </p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, link, icon }: { title: string; value: number; link: string; icon: string }) {
  return (
    <Link href={link}>
      <div className="group relative overflow-hidden bg-white rounded border border-black/15 hover:border-black/30 transition-all duration-200 p-4 cursor-pointer shadow-sm">
        <div className="relative">
          <div className="text-2xl mb-2">{icon}</div>
          <div className="text-xs font-semibold text-black/70 mb-1 uppercase">{title}</div>
          <div className="text-2xl font-bold text-black">
            {value}
          </div>
        </div>
      </div>
    </Link>
  );
}

