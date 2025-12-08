'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface Lesson {
  _id: string;
  title: string;
  content: string;
  order: number;
  isInteractive: boolean;
  media?: string[];
  photos?: string[];
  questions?: Array<{
    question: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
  }>;
  canRead?: boolean;
  canListen?: boolean;
  createdAt: string;
}

interface Course {
  _id: string;
  title: string;
  heading: string;
  subHeading?: string;
  type: 'simple' | 'challenge';
  category: string;
  photo?: string;
  isActive: boolean;
  lessons?: Lesson[] | string[];
  createdAt: string;
  updatedAt: string;
}

export default function ViewCoursePage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);

  useEffect(() => {
    if (courseId) {
      Promise.all([fetchCourse(), fetchLessons()]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const res = await fetch(`/api/courses/${courseId}`);
      const data = await res.json();
      if (data.success) {
        setCourse(data.data);
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

  if (loading) {
    return (
      <div className="p-8 bg-black">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-8 bg-black">
        <div className="text-center py-20">
          <p className="text-zinc-400 text-lg">Course not found</p>
          <Link
            href="/dashboard/courses"
            className="inline-block mt-4 px-6 py-3 bg-white text-black rounded-xl hover:bg-zinc-200 transition-all font-semibold"
          >
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  const sortedLessons = [...lessons].sort((a, b) => a.order - b.order);

  return (
    <div className="p-8 bg-black">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">{course.title}</h1>
            <p className="text-zinc-400 text-lg">{course.heading}</p>
            {course.subHeading && (
              <p className="text-zinc-500 text-sm mt-1">{course.subHeading}</p>
            )}
          </div>
          <div className="flex gap-3">
            <Link
              href={`/dashboard/courses/${courseId}`}
              className="px-6 py-3 bg-white text-black rounded-xl hover:bg-zinc-200 transition-all font-semibold"
            >
              Edit Course
            </Link>
            <button
              onClick={() => router.back()}
              className="px-6 py-3 bg-zinc-800 text-white rounded-xl hover:bg-zinc-700 transition-all font-semibold border border-zinc-700"
            >
              Back
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Course Info Card */}
          <div className="bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800 p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Course Information</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-zinc-400">Course Type</label>
                  <p className="text-white font-semibold">
                    {course.type === 'challenge' ? 'Challenge' : 'Simple Course'}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-zinc-400">Category</label>
                  <p className="text-white font-semibold">{course.category || 'General'}</p>
                </div>
                <div>
                  <label className="text-sm text-zinc-400">Status</label>
                  <p className="text-white font-semibold">
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      course.isActive 
                        ? 'bg-white text-black' 
                        : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      {course.isActive ? '✓ Active' : '○ Inactive'}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="text-sm text-zinc-400">Total Lessons</label>
                  <p className="text-white font-semibold">{sortedLessons.length} lesson{sortedLessons.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <div>
                <label className="text-sm text-zinc-400">Created</label>
                <p className="text-white font-semibold">
                  {new Date(course.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              {course.updatedAt && (
                <div>
                  <label className="text-sm text-zinc-400">Last Updated</label>
                  <p className="text-white font-semibold">
                    {new Date(course.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Cover Photo */}
          {course.photo && (
            <div className="bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800 p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Cover Photo</h2>
              <div className="rounded-xl overflow-hidden border border-zinc-700">
                <img
                  src={course.photo}
                  alt={course.title}
                  className="w-full h-auto max-h-96 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}

          {/* Lessons Section */}
          <div className="bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Lessons ({sortedLessons.length})</h2>
              <Link
                href={`/dashboard/lessons/manage?courseId=${courseId}`}
                className="px-4 py-2 bg-white text-black rounded-xl hover:bg-zinc-200 text-sm font-semibold"
              >
                + Add Lessons
              </Link>
            </div>

            {sortedLessons.length === 0 ? (
              <div className="text-center py-12 bg-zinc-800 rounded-xl border border-zinc-700 border-dashed">
                <p className="text-zinc-400 mb-4">No lessons added yet</p>
                <Link
                  href={`/dashboard/lessons/manage?courseId=${courseId}`}
                  className="inline-block px-4 py-2 bg-white text-black rounded-xl hover:bg-zinc-200 text-sm font-semibold"
                >
                  Add First Lesson
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedLessons.map((lesson) => (
                  <div
                    key={lesson._id}
                    className="bg-zinc-800 rounded-xl border border-zinc-700 p-6 hover:border-white/20 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="px-3 py-1 bg-zinc-900 text-zinc-300 rounded-lg text-sm font-semibold">
                            #{lesson.order}
                          </span>
                          <h3 className="text-lg font-bold text-white">{lesson.title}</h3>
                          {lesson.isInteractive && (
                            <span className="px-2 py-1 bg-white text-black rounded-lg text-xs font-semibold">
                              Interactive
                            </span>
                          )}
                        </div>
                        <div className="text-zinc-300 text-sm line-clamp-3">{lesson.content}</div>
                      </div>
                      <Link
                        href={`/dashboard/lessons/${lesson._id}/view`}
                        className="ml-4 px-4 py-2 bg-zinc-700 text-white rounded-xl hover:bg-zinc-600 text-sm font-semibold"
                      >
                        View
                      </Link>
                    </div>

                    {/* Lesson Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-zinc-700">
                      {lesson.canRead !== undefined && (
                        <div className="text-xs">
                          <span className="text-zinc-400">Read:</span>{' '}
                          <span className="text-white font-semibold">
                            {lesson.canRead ? '✓ Yes' : '✗ No'}
                          </span>
                        </div>
                      )}
                      {lesson.canListen !== undefined && (
                        <div className="text-xs">
                          <span className="text-zinc-400">Listen:</span>{' '}
                          <span className="text-white font-semibold">
                            {lesson.canListen ? '✓ Yes' : '✗ No'}
                          </span>
                        </div>
                      )}
                      {lesson.questions && lesson.questions.length > 0 && (
                        <div className="text-xs">
                          <span className="text-zinc-400">Questions:</span>{' '}
                          <span className="text-white font-semibold">{lesson.questions.length}</span>
                        </div>
                      )}
                      {lesson.media && lesson.media.length > 0 && (
                        <div className="text-xs">
                          <span className="text-zinc-400">Media:</span>{' '}
                          <span className="text-white font-semibold">{lesson.media.length}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800 p-6">
            <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                href={`/dashboard/courses/${courseId}`}
                className="block w-full px-4 py-3 bg-white text-black rounded-xl hover:bg-zinc-200 transition-all font-semibold text-center"
              >
                ✏️ Edit Course
              </Link>
              <Link
                href={`/dashboard/lessons/manage?courseId=${courseId}`}
                className="block w-full px-4 py-3 bg-zinc-800 text-white rounded-xl hover:bg-zinc-700 transition-all font-semibold text-center border border-zinc-700"
              >
                ➕ Add Lessons
              </Link>
              <Link
                href={`/dashboard/lessons/manage?courseId=${courseId}`}
                className="block w-full px-4 py-3 bg-zinc-800 text-white rounded-xl hover:bg-zinc-700 transition-all font-semibold text-center border border-zinc-700"
              >
                📖 Create Lesson
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800 p-6">
            <h3 className="text-lg font-bold text-white mb-4">Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Total Lessons</span>
                <span className="text-white font-bold">{sortedLessons.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Interactive Lessons</span>
                <span className="text-white font-bold">
                  {sortedLessons.filter((l) => l.isInteractive).length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Lessons with Media</span>
                <span className="text-white font-bold">
                  {sortedLessons.filter((l) => l.media && l.media.length > 0).length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Lessons with Questions</span>
                <span className="text-white font-bold">
                  {sortedLessons.filter((l) => l.questions && l.questions.length > 0).length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

