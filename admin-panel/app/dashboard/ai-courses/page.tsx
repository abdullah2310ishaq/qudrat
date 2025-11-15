'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface TreeLevel {
  level: number;
  topic: string;
  lessons: string[];
}

interface AICourse {
  _id: string;
  title: string;
  heading: string;
  subHeading?: string;
  aiTool: string;
  category?: string;
  isActive: boolean;
  tree: TreeLevel[];
  createdAt: string;
}

export default function AICoursesPage() {
  const [aiCourses, setAiCourses] = useState<AICourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAICourses();
  }, []);

  const fetchAICourses = async () => {
    try {
      const res = await fetch('/api/aiCourses');
      const data = await res.json();
      if (data.success) {
        setAiCourses(data.data || []);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error fetching AI courses:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-black">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">AI Mastery Paths</h1>
          <p className="text-zinc-400">Manage AI course mastery paths with tree structure</p>
        </div>
        <Link
          href="/dashboard/ai-courses/new"
          className="px-6 py-3 bg-white text-black rounded-xl hover:bg-zinc-200 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
        >
          + Create AI Course
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      ) : aiCourses.length === 0 ? (
        <div className="text-center py-20 bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800">
          <div className="text-6xl mb-4">🤖</div>
          <p className="text-zinc-400 mb-4 text-lg">No AI mastery paths found</p>
          <Link
            href="/dashboard/ai-courses/new"
            className="inline-block px-6 py-3 bg-white text-black rounded-xl hover:bg-zinc-200 transition-all shadow-lg hover:shadow-xl font-semibold"
          >
            Create your first AI mastery path
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {aiCourses.map((course) => (
            <div key={course._id} className="group bg-zinc-900 rounded-2xl shadow-2xl hover:shadow-white/10 transition-all duration-300 p-6 border border-zinc-800 hover:border-white/20 transform hover:scale-105">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-1 group-hover:text-white transition-colors">{course.title}</h3>
                  <p className="text-sm text-zinc-400">{course.heading}</p>
                  {course.subHeading && (
                    <p className="text-xs text-zinc-500 mt-1">{course.subHeading}</p>
                  )}
                </div>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  course.isActive 
                    ? 'bg-white text-black border border-white' 
                    : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                }`}>
                  {course.isActive ? '✓ Active' : '○ Inactive'}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-zinc-800 text-white border border-zinc-700">
                  {course.aiTool}
                </span>
                {course.category && (
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                    {course.category}
                  </span>
                )}
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {course.tree?.length || 0} Level{course.tree?.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                <Link
                  href={`/dashboard/ai-courses/${course._id}`}
                  className="text-white hover:text-zinc-300 text-sm font-semibold hover:underline"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
