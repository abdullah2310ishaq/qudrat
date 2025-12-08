'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Stats {
  courses: number;
  lessons: number;
  challenges: number;
  prompts: number;
  users: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    courses: 0,
    lessons: 0,
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
      const [coursesRes, lessonsRes, challengesRes, promptsRes, usersRes] =
        await Promise.all([
          fetch('/api/courses'),
          fetch('/api/lessons'),
          fetch('/api/challenges'),
          fetch('/api/prompts'),
          fetch('/api/users'),
        ]);

      const courses = await coursesRes.json();
      const lessons = await lessonsRes.json();
      const challenges = await challengesRes.json();
      const prompts = await promptsRes.json();
      const users = await usersRes.json();

      setStats({
        courses: courses.data?.length || 0,
        lessons: lessons.data?.length || 0,
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
    <div className="min-h-screen p-6" style={{ backgroundColor: '#F5F5DC' }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-black mb-1">Dashboard</h1>
          <p className="text-sm text-black/70">Quick overview and shortcuts to the unified flows.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-black/20 border-t-black"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
            <StatCard title="Courses" value={stats.courses} link="/dashboard/courses-unified" icon="📚" />
            <StatCard title="Lessons" value={stats.lessons} link="/dashboard/courses-unified" icon="📖" />
            <StatCard title="Challenges" value={stats.challenges} link="/dashboard/challenges-unified" icon="🎯" />
            <StatCard title="Prompts" value={stats.prompts} link="/dashboard/prompts-unified" icon="💡" />
            <StatCard title="Users" value={stats.users} link="/dashboard/users" icon="👥" />
          </div>
        )}

        <div className="bg-white rounded border border-black/15 p-5 shadow-sm">
          <h2 className="text-base font-bold text-black mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Link
              href="/dashboard/courses-unified/add-course"
              className="group relative overflow-hidden bg-[#F5F5DC] border border-black/15 rounded p-4 hover:bg-black/5 transition-all duration-200 text-center"
            >
              <div className="text-3xl mb-2">📚</div>
              <div className="font-semibold text-black text-sm mb-1">Create New Course</div>
              <div className="text-xs text-black/60">Add a course in the unified flow</div>
            </Link>
            <Link
              href="/dashboard/challenges-unified/add"
              className="group relative overflow-hidden bg-[#F5F5DC] border border-black/15 rounded p-4 hover:bg-black/5 transition-all duration-200 text-center"
            >
              <div className="text-3xl mb-2">🎯</div>
              <div className="font-semibold text-black text-sm mb-1">Create Challenge</div>
              <div className="text-xs text-black/60">Start a new challenge</div>
            </Link>
            <Link
              href="/dashboard/prompts-unified/add"
              className="group relative overflow-hidden bg-[#F5F5DC] border border-black/15 rounded p-4 hover:bg-black/5 transition-all duration-200 text-center"
            >
              <div className="text-3xl mb-2">💡</div>
              <div className="font-semibold text-black text-sm mb-1">Add Prompt</div>
              <div className="text-xs text-black/60">Add to prompt library</div>
            </Link>
          </div>
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

