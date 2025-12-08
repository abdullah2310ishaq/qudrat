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
          <div className="animate-spin rounded-full h-8 w-8 border border-white/20 border-t-white/60"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-black">
      <div className="mb-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-thin text-white mb-3 tracking-tight">Edit Course</h1>
            <div className="w-16 h-px bg-white/20 mb-4"></div>
            <p className="text-sm font-light text-white/60 tracking-wide">Update course details and manage content</p>
          </div>
          <Link
            href={`/dashboard/courses/${courseId}/view`}
            className="px-6 py-2.5 bg-white/5 text-white rounded-sm border border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-300 font-light text-sm tracking-wider uppercase"
          >
            View Details
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-black/40 rounded-sm border border-white/10 p-8 max-w-2xl">
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-light text-white/60 mb-2 tracking-wider uppercase">
              Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 border border-white/10 rounded-sm bg-white/5 text-white placeholder-white/30 focus:bg-white/10 focus:border-white/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-light text-white/60 mb-2 tracking-wider uppercase">
              Heading *
            </label>
            <input
              type="text"
              required
              value={formData.heading}
              onChange={(e) => setFormData({ ...formData, heading: e.target.value })}
              className="w-full px-4 py-2.5 border border-white/10 rounded-sm bg-white/5 text-white placeholder-white/30 focus:bg-white/10 focus:border-white/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-light text-white/60 mb-2 tracking-wider uppercase">
              Sub Heading
            </label>
            <input
              type="text"
              value={formData.subHeading || ''}
              onChange={(e) => setFormData({ ...formData, subHeading: e.target.value })}
              className="w-full px-4 py-2.5 border border-white/10 rounded-sm bg-white/5 text-white placeholder-white/30 focus:bg-white/10 focus:border-white/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-light text-white/60 mb-2 tracking-wider uppercase">
              Type *
            </label>
            <select
              required
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value as 'simple' | 'challenge' })
              }
              className="w-full px-4 py-2.5 border border-white/10 rounded-sm bg-white/5 text-white focus:bg-white/10 focus:border-white/20 transition-all"
            >
              <option value="simple">Simple Course</option>
              <option value="challenge">Challenge Course</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-light text-white/60 mb-2 tracking-wider uppercase">
              Category
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2.5 border border-white/10 rounded-sm bg-white/5 text-white placeholder-white/30 focus:bg-white/10 focus:border-white/20 transition-all"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4 border-white/10 rounded-sm bg-white/5 focus:ring-white/20"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm font-light text-white">
              Active <span className="text-white/40 text-xs">(Show to users)</span>
            </label>
          </div>

          {/* Advanced Options - Collapsible */}
          <div className="border-t border-white/10 pt-6">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center justify-between w-full text-left text-white font-light hover:text-white/80 transition-colors"
            >
              <span className="text-xs tracking-wider uppercase">Advanced Options</span>
              <span className="text-white/40">{showAdvanced ? '▼' : '▶'}</span>
            </button>

            {showAdvanced && (
              <div className="mt-4 space-y-4 pl-4 border-l border-white/10">
                <div>
                  <label className="block text-xs font-light text-white/60 mb-2 tracking-wider uppercase">
                    Cover Photo <span className="text-white/40 text-xs">(Optional - Base64 encoded)</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 border border-white/10 rounded-sm bg-white/5 text-white placeholder-white/30 focus:bg-white/10 focus:border-white/20 transition-all text-xs"
                    placeholder="Base64 encoded image (optional)"
                  />
                  <p className="text-xs text-white/40 mt-1">Upload image and convert to Base64, or leave empty</p>
                </div>
              </div>
            )}
          </div>

          {/* Lessons Section */}
          <div className="border-t border-white/10 pt-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-sm font-light text-white tracking-wider uppercase">Lessons</h3>
                <div className="flex items-center gap-4 mt-2">
                  <p className="text-xs font-light text-white/60">{lessons.length} lesson{lessons.length !== 1 ? 's' : ''} in this course</p>
                  {lessons.length > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 border border-white/10 rounded-full overflow-hidden bg-white/5">
                        <div 
                          className="h-full bg-white/20 transition-all"
                          style={{ width: `${Math.min((lessons.length / 10) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-light text-white/50">
                        {lessons.length}/10+ lessons
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <Link
                href={`/dashboard/lessons/manage?courseId=${courseId}`}
                className="px-4 py-2.5 bg-white/5 text-white rounded-sm border border-white/20 hover:bg-white/10 hover:border-white/30 transition-all font-light text-xs tracking-wider uppercase"
              >
                + Add Lessons
              </Link>
            </div>

            {lessons.length === 0 ? (
              <div className="text-center py-8 border border-white/10 border-dashed rounded-sm bg-white/5">
                <p className="text-white/60 mb-4 font-light text-sm">No lessons added yet</p>
                <Link
                  href={`/dashboard/lessons/manage?courseId=${courseId}`}
                  className="inline-block px-4 py-2.5 bg-white/5 text-white rounded-sm border border-white/20 hover:bg-white/10 hover:border-white/30 transition-all font-light text-xs tracking-wider uppercase"
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
                      className="flex items-center justify-between p-4 border border-white/10 rounded-sm bg-white/5 hover:border-white/20 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-light text-white/50 w-8">#{lesson.order}</span>
                        <span className="text-white font-light text-sm">{lesson.title}</span>
                      </div>
                      <Link
                        href={`/dashboard/lessons/${lesson._id}`}
                        className="text-white/60 hover:text-white text-xs font-light tracking-wide transition-colors"
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
              className="px-6 py-2.5 bg-white/5 text-white rounded-sm border border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-300 font-light text-sm tracking-wider uppercase disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <Link
              href={`/dashboard/lessons/manage?courseId=${courseId}`}
              className="px-8 py-3 bg-white/5 text-white rounded-sm border border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-300 font-light text-sm tracking-wider uppercase"
            >
              Add Lessons
            </Link>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-8 py-3 bg-white/5 text-white rounded-sm border border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-300 font-light text-sm tracking-wider uppercase"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

