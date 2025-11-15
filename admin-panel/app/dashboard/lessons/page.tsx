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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Lessons</h1>
          <p className="text-zinc-400">Manage all lessons across courses</p>
        </div>
        <Link
          href="/dashboard/lessons/new"
          className="px-6 py-3 bg-white text-black rounded-xl hover:bg-zinc-200 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
        >
          + Create Lesson
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      ) : lessons.length === 0 ? (
        <div className="text-center py-20 bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800">
          <div className="text-6xl mb-4">📚</div>
          <p className="text-zinc-400 mb-4 text-lg">No lessons found</p>
          <Link
            href="/dashboard/lessons/new"
            className="inline-block px-6 py-3 bg-white text-black rounded-xl hover:bg-zinc-200 transition-all shadow-lg hover:shadow-xl font-semibold"
          >
            Create your first lesson
          </Link>
        </div>
      ) : (
        <div className="bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800 overflow-hidden">
          <table className="min-w-full divide-y divide-zinc-800">
            <thead className="bg-zinc-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Course ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-zinc-900 divide-y divide-zinc-800">
              {lessons.map((lesson) => (
                <tr key={lesson._id} className="hover:bg-zinc-800 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">{lesson.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                    {lesson.order}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400">
                    {lesson.courseId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/dashboard/lessons/${lesson._id}/view`}
                        className="text-zinc-400 hover:text-white font-semibold hover:underline"
                        title="View Details"
                      >
                        👁️ View
                      </Link>
                      <Link
                        href={`/dashboard/lessons/${lesson._id}`}
                        className="text-white hover:text-zinc-300 font-semibold hover:underline"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(lesson._id)}
                        className="text-red-400 hover:text-red-300 font-semibold hover:underline"
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
