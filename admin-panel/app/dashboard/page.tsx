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
    <div className="min-h-screen p-8 bg-black">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-5xl font-thin text-white mb-3 tracking-tight">
            Dashboard
          </h1>
          <div className="w-16 h-px bg-white/20 mb-4"></div>
          <p className="text-sm font-light text-white/60 tracking-wide">Welcome back! Here's what's happening today.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border border-white/20 border-t-white/60"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
            <StatCard 
              title="Courses" 
              value={stats.courses} 
              link="/dashboard/courses"
              icon="📚"
            />
            <StatCard 
              title="Lessons" 
              value={stats.lessons} 
              link="/dashboard/lessons"
              icon="📖"
            />
            <StatCard 
              title="Challenges" 
              value={stats.challenges} 
              link="/dashboard/challenges"
              icon="🎯"
            />
            <StatCard 
              title="Prompts" 
              value={stats.prompts} 
              link="/dashboard/prompts"
              icon="💡"
            />
            <StatCard 
              title="Users" 
              value={stats.users} 
              link="/dashboard/users"
              icon="👥"
            />
          </div>
        )}

        <div className="bg-black/40 rounded-sm border border-white/10 p-8">
          <h2 className="text-xl font-light text-white mb-8 tracking-wide">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/dashboard/courses/new"
              className="group relative overflow-hidden bg-white/5 border border-white/10 rounded-sm p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300 text-center"
            >
              <div className="text-3xl mb-3 opacity-70 group-hover:opacity-100 transition-opacity">📚</div>
              <div className="font-light text-white text-sm mb-1 tracking-wide">Create New Course</div>
              <div className="text-xs font-light text-white/50 tracking-wider uppercase">Add a new learning course</div>
            </Link>
            <Link
              href="/dashboard/challenges/new"
              className="group relative overflow-hidden bg-white/5 border border-white/10 rounded-sm p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300 text-center"
            >
              <div className="text-3xl mb-3 opacity-70 group-hover:opacity-100 transition-opacity">🎯</div>
              <div className="font-light text-white text-sm mb-1 tracking-wide">Create Challenge</div>
              <div className="text-xs font-light text-white/50 tracking-wider uppercase">Start a new challenge</div>
            </Link>
            <Link
              href="/dashboard/prompts/new"
              className="group relative overflow-hidden bg-white/5 border border-white/10 rounded-sm p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300 text-center"
            >
              <div className="text-3xl mb-3 opacity-70 group-hover:opacity-100 transition-opacity">💡</div>
              <div className="font-light text-white text-sm mb-1 tracking-wide">Add Prompt</div>
              <div className="text-xs font-light text-white/50 tracking-wider uppercase">Add to prompt library</div>
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
      <div className="group relative overflow-hidden bg-black/40 rounded-sm border border-white/10 hover:border-white/20 transition-all duration-300 p-6 cursor-pointer">
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="text-2xl opacity-70 group-hover:opacity-100 transition-opacity">{icon}</div>
          </div>
          <div className="text-xs font-light text-white/60 mb-2 tracking-wider uppercase">{title}</div>
          <div className="text-3xl font-thin text-white">
            {value}
          </div>
        </div>
      </div>
    </Link>
  );
}

