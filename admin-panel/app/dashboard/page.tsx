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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-zinc-400">Welcome back! Here's what's happening today.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
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

        <div className="bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800 p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/dashboard/courses/new"
              className="group relative overflow-hidden bg-zinc-800 border-2 border-dashed border-zinc-700 rounded-2xl p-6 hover:border-white hover:shadow-xl hover:shadow-white/10 transition-all duration-300 text-center transform hover:scale-105"
            >
              <div className="text-4xl mb-3 transform group-hover:scale-110 transition-transform">📚</div>
              <div className="font-semibold text-white group-hover:text-white transition-colors">Create New Course</div>
              <div className="text-sm text-zinc-400 mt-1">Add a new learning course</div>
            </Link>
            <Link
              href="/dashboard/challenges/new"
              className="group relative overflow-hidden bg-zinc-800 border-2 border-dashed border-zinc-700 rounded-2xl p-6 hover:border-white hover:shadow-xl hover:shadow-white/10 transition-all duration-300 text-center transform hover:scale-105"
            >
              <div className="text-4xl mb-3 transform group-hover:scale-110 transition-transform">🎯</div>
              <div className="font-semibold text-white group-hover:text-white transition-colors">Create Challenge</div>
              <div className="text-sm text-zinc-400 mt-1">Start a new challenge</div>
            </Link>
            <Link
              href="/dashboard/prompts/new"
              className="group relative overflow-hidden bg-zinc-800 border-2 border-dashed border-zinc-700 rounded-2xl p-6 hover:border-white hover:shadow-xl hover:shadow-white/10 transition-all duration-300 text-center transform hover:scale-105"
            >
              <div className="text-4xl mb-3 transform group-hover:scale-110 transition-transform">💡</div>
              <div className="font-semibold text-white group-hover:text-white transition-colors">Add Prompt</div>
              <div className="text-sm text-zinc-400 mt-1">Add to prompt library</div>
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
      <div className="group relative overflow-hidden bg-zinc-900 rounded-2xl shadow-2xl hover:shadow-white/10 border border-zinc-800 hover:border-white/20 transition-all duration-300 p-6 transform hover:scale-105 cursor-pointer">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 group-hover:opacity-10 transition-opacity rounded-full blur-2xl"></div>
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="text-3xl">{icon}</div>
            <div className="w-12 h-12 rounded-xl bg-white opacity-10 group-hover:opacity-20 transition-opacity"></div>
          </div>
          <div className="text-sm font-medium text-zinc-400 mb-1">{title}</div>
          <div className="text-4xl font-bold text-white">
            {value}
          </div>
        </div>
      </div>
    </Link>
  );
}

