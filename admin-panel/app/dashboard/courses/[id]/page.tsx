'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface Lesson {
  _id: string;
  title: string;
  order: number;
}

interface Course {
  _id: string;
  title: string;
  heading: string;
  subHeading?: string;
  type: 'simple' | 'challenge';
  category: string;
  isActive: boolean;
  lessons?: Lesson[] | string[];
}

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [formData, setFormData] = useState<Course>({
    _id: '',
    title: '',
    heading: '',
    subHeading: '',
    type: 'simple',
    category: 'General',
    isActive: true,
  });

  useEffect(() => {
    if (courseId) {
      fetchCourse();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const res = await fetch(`/api/courses/${courseId}`);
      const data = await res.json();
      if (data.success) {
        setFormData(data.data);
        // Fetch lessons for this course
        fetchLessons();
      } else {
        alert('Course not found');
        router.push('/dashboard/courses');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error fetching course:', errorMessage);
      alert('Error loading course: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchLessons = async () => {
    try {
      const res = await fetch(`/api/lessons?courseId=${courseId}`);
      const data = await res.json();
      if (data.success) {
        setLessons(data.data || []);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error fetching lessons:', errorMessage);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        router.push('/dashboard/courses');
      } else {
        alert('Error updating course: ' + data.error);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error updating course:', errorMessage);
      alert('Error updating course: ' + errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 bg-black">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-black">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Edit Course</h1>
            <p className="text-zinc-400">Update course details and manage content</p>
          </div>
          <Link
            href={`/dashboard/courses/${courseId}/view`}
            className="px-6 py-3 bg-zinc-800 text-white rounded-xl hover:bg-zinc-700 transition-all font-semibold border border-zinc-700"
          >
            👁️ View Details
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800 p-8 max-w-2xl">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:ring-2 focus:ring-white focus:border-white transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Heading *
            </label>
            <input
              type="text"
              required
              value={formData.heading}
              onChange={(e) => setFormData({ ...formData, heading: e.target.value })}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:ring-2 focus:ring-white focus:border-white transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Sub Heading
            </label>
            <input
              type="text"
              value={formData.subHeading || ''}
              onChange={(e) => setFormData({ ...formData, subHeading: e.target.value })}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:ring-2 focus:ring-white focus:border-white transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Type *
            </label>
            <select
              required
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value as 'simple' | 'challenge' })
              }
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:ring-2 focus:ring-white focus:border-white transition-all"
            >
              <option value="simple">Simple Course</option>
              <option value="challenge">Challenge Course</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Category
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:ring-2 focus:ring-white focus:border-white transition-all"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4 text-white bg-zinc-800 border-zinc-700 rounded focus:ring-white"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-white">
              Active <span className="text-zinc-400 text-xs">(Show to users)</span>
            </label>
          </div>

          {/* Advanced Options - Collapsible */}
          <div className="border-t border-zinc-800 pt-6">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center justify-between w-full text-left text-white font-semibold hover:text-zinc-300 transition-colors"
            >
              <span>Advanced Options</span>
              <span className="text-zinc-400">{showAdvanced ? '▼' : '▶'}</span>
            </button>

            {showAdvanced && (
              <div className="mt-4 space-y-4 pl-4 border-l-2 border-zinc-800">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Cover Photo <span className="text-zinc-400 text-xs">(Optional - Base64 encoded)</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:ring-2 focus:ring-white focus:border-white transition-all text-xs"
                    placeholder="Base64 encoded image (optional)"
                  />
                  <p className="text-xs text-zinc-400 mt-1">Upload image and convert to Base64, or leave empty</p>
                </div>
              </div>
            )}
          </div>

          {/* Lessons Section */}
          <div className="border-t border-zinc-800 pt-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Lessons</h3>
                <div className="flex items-center gap-4 mt-2">
                  <p className="text-sm text-zinc-400">{lessons.length} lesson{lessons.length !== 1 ? 's' : ''} in this course</p>
                  {lessons.length > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-white transition-all"
                          style={{ width: `${Math.min((lessons.length / 10) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-zinc-400">
                        {lessons.length}/10+ lessons
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <Link
                href={`/dashboard/courses/${courseId}/add-lessons`}
                className="px-4 py-2 bg-white text-black rounded-xl hover:bg-zinc-200 text-sm font-semibold"
              >
                + Add Lessons
              </Link>
            </div>

            {lessons.length === 0 ? (
              <div className="text-center py-8 bg-zinc-800 rounded-xl border border-zinc-700 border-dashed">
                <p className="text-zinc-400 mb-4">No lessons added yet</p>
                <Link
                  href={`/dashboard/courses/${courseId}/add-lessons`}
                  className="inline-block px-4 py-2 bg-white text-black rounded-xl hover:bg-zinc-200 text-sm font-semibold"
                >
                  Add First Lesson
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {lessons
                  .sort((a, b) => a.order - b.order)
                  .map((lesson) => (
                    <div
                      key={lesson._id}
                      className="flex items-center justify-between p-4 bg-zinc-800 rounded-xl border border-zinc-700 hover:border-white/20 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-semibold text-zinc-400 w-8">#{lesson.order}</span>
                        <span className="text-white font-medium">{lesson.title}</span>
                      </div>
                      <Link
                        href={`/dashboard/lessons/${lesson._id}`}
                        className="text-white hover:text-zinc-300 text-sm font-semibold hover:underline"
                      >
                        Edit
                      </Link>
                    </div>
                  ))}
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-white text-black rounded-xl hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <Link
              href={`/dashboard/lessons/new?courseId=${courseId}`}
              className="px-8 py-3 bg-zinc-800 text-white rounded-xl hover:bg-zinc-700 transition-all duration-200 font-semibold border border-zinc-700"
            >
              Add Lessons
            </Link>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-8 py-3 bg-zinc-800 text-white rounded-xl hover:bg-zinc-700 transition-all duration-200 font-semibold border border-zinc-700"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

