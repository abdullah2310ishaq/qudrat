'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Lesson {
  _id: string;
  title: string;
  courseId: string;
  order: number;
  createdAt: string;
}

export default function LessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const res = await fetch('/api/lessons');
        const data = await res.json();
        if (data.success) {
          setLessons(data.data || []);
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error fetching lessons:', errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return;

    try {
      const res = await fetch(`/api/lessons/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setLessons(lessons.filter((l) => l._id !== id));
      } else {
        alert('Error deleting lesson: ' + data.error);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error deleting lesson:', errorMessage);
      alert('Error deleting lesson: ' + errorMessage);
    }
  };

  return (
    <div className="p-8 bg-black">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-5xl font-thin text-white mb-3 tracking-tight">Lessons</h1>
          <div className="w-16 h-px bg-white/20 mb-4"></div>
          <p className="text-sm font-light text-white/60 tracking-wide">Manage all lessons across courses</p>
        </div>
        <Link
          href="/dashboard/lessons/manage"
          className="px-6 py-2.5 bg-white/5 text-white rounded-sm border border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-300 font-light text-sm tracking-wider uppercase"
        >
          + Create Lesson
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border border-white/20 border-t-white/60"></div>
        </div>
      ) : lessons.length === 0 ? (
        <div className="text-center py-20 bg-black/40 rounded-sm border border-white/10">
          <div className="text-5xl mb-4 opacity-70">📖</div>
          <p className="text-sm font-light text-white/60 mb-6 tracking-wide">No lessons found</p>
          <Link
            href="/dashboard/lessons/manage"
            className="inline-block px-6 py-2.5 bg-white/5 text-white rounded-sm border border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-300 font-light text-sm tracking-wider uppercase"
          >
            Create your first lesson
          </Link>
        </div>
      ) : (
        <div className="bg-black/40 rounded-sm border border-white/10 overflow-hidden">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-light text-white/60 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-4 text-left text-xs font-light text-white/60 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-4 text-left text-xs font-light text-white/60 uppercase tracking-wider">
                  Course ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-light text-white/60 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-black/40 divide-y divide-white/10">
              {lessons.map((lesson) => (
                <tr key={lesson._id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-light text-white">{lesson.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70 font-light">
                    {lesson.order}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/50 font-light">
                    {lesson.courseId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-light">
                    <div className="flex items-center gap-4">
                      <Link
                        href={`/dashboard/lessons/${lesson._id}/view`}
                        className="text-white/60 hover:text-white transition-colors text-xs tracking-wide"
                        title="View Details"
                      >
                        View
                      </Link>
                      <Link
                        href={`/dashboard/lessons/${lesson._id}`}
                        className="text-white/60 hover:text-white transition-colors text-xs tracking-wide"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(lesson._id)}
                        className="text-white/40 hover:text-red-400/80 transition-colors text-xs tracking-wide"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
