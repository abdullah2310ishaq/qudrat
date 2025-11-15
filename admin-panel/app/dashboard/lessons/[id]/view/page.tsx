'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface Lesson {
  _id: string;
  courseId: string;
  title: string;
  content: string;
  order: number;
  isInteractive: boolean;
  media?: string[];
  photos?: string[];
  questions?: Question[];
  canRead?: boolean;
  canListen?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Course {
  _id: string;
  title: string;
  heading: string;
}

export default function ViewLessonPage() {
  const router = useRouter();
  const params = useParams();
  const lessonId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [course, setCourse] = useState<Course | null>(null);

  useEffect(() => {
    if (lessonId) {
      fetchLesson();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  const fetchLesson = async () => {
    try {
      const res = await fetch(`/api/lessons/${lessonId}`);
      const data = await res.json();
      if (data.success) {
        setLesson(data.data);
        // Fetch course details
        if (data.data.courseId) {
          fetchCourse(data.data.courseId);
        }
      } else {
        alert('Lesson not found');
        router.push('/dashboard/lessons');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error fetching lesson:', errorMessage);
      alert('Error loading lesson: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourse = async (courseId: string) => {
    try {
      const res = await fetch(`/api/courses/${courseId}`);
      const data = await res.json();
      if (data.success) {
        setCourse(data.data);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error fetching course:', errorMessage);
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

  if (!lesson) {
    return (
      <div className="p-8 bg-black">
        <div className="text-center py-20">
          <p className="text-zinc-400 text-lg">Lesson not found</p>
          <Link
            href="/dashboard/lessons"
            className="inline-block mt-4 px-6 py-3 bg-white text-black rounded-xl hover:bg-zinc-200 transition-all font-semibold"
          >
            Back to Lessons
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-black">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded-lg text-sm font-semibold">
                Lesson #{lesson.order}
              </span>
              {lesson.isInteractive && (
                <span className="px-3 py-1 bg-white text-black rounded-lg text-sm font-semibold">
                  Interactive
                </span>
              )}
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">{lesson.title}</h1>
            {course && (
              <Link
                href={`/dashboard/courses/${course._id}/view`}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                📚 {course.title}
              </Link>
            )}
          </div>
          <div className="flex gap-3">
            <Link
              href={`/dashboard/lessons/${lessonId}`}
              className="px-6 py-3 bg-white text-black rounded-xl hover:bg-zinc-200 transition-all font-semibold"
            >
              Edit Lesson
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
          {/* Lesson Content */}
          <div className="bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800 p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Content</h2>
            <div className="prose prose-invert max-w-none">
              <div className="text-zinc-300 whitespace-pre-wrap leading-relaxed">
                {lesson.content}
              </div>
            </div>
          </div>

          {/* Media */}
          {(lesson.media && lesson.media.length > 0) || (lesson.photos && lesson.photos.length > 0) ? (
            <div className="bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800 p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Media & Photos</h2>
              <div className="space-y-4">
                {lesson.media && lesson.media.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Media URLs</h3>
                    <div className="space-y-2">
                      {lesson.media.map((url, index) => (
                        <a
                          key={index}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-3 bg-zinc-800 rounded-xl border border-zinc-700 hover:border-white/20 transition-colors text-zinc-300 hover:text-white break-all"
                        >
                          {url}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                {lesson.photos && lesson.photos.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Photos</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {lesson.photos.map((photo, index) => (
                        <div key={index} className="rounded-xl overflow-hidden border border-zinc-700">
                          <img
                            src={photo}
                            alt={`Photo ${index + 1}`}
                            className="w-full h-auto object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {/* Interactive Questions */}
          {lesson.questions && lesson.questions.length > 0 && (
            <div className="bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800 p-6">
              <h2 className="text-2xl font-bold text-white mb-4">
                Interactive Questions ({lesson.questions.length})
              </h2>
              <div className="space-y-6">
                {lesson.questions.map((q, index) => (
                  <div
                    key={index}
                    className="bg-zinc-800 rounded-xl border border-zinc-700 p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">
                        Question {index + 1}
                      </h3>
                      <span className="px-3 py-1 bg-zinc-900 text-zinc-300 rounded-lg text-xs font-semibold">
                        Correct: Option {q.correctAnswer + 1}
                      </span>
                    </div>
                    <p className="text-white font-medium mb-4">{q.question}</p>
                    <div className="space-y-2 mb-4">
                      {q.options.map((option, optIndex) => (
                        <div
                          key={optIndex}
                          className={`p-3 rounded-xl border ${
                            optIndex === q.correctAnswer
                              ? 'bg-white/10 border-white text-white'
                              : 'bg-zinc-900 border-zinc-700 text-zinc-300'
                          }`}
                        >
                          <span className="font-semibold mr-2">
                            {optIndex === q.correctAnswer ? '✓' : '○'} Option {optIndex + 1}:
                          </span>
                          {option}
                        </div>
                      ))}
                    </div>
                    {q.explanation && (
                      <div className="mt-4 p-3 bg-zinc-900 rounded-xl border border-zinc-700">
                        <p className="text-sm text-zinc-400">
                          <span className="font-semibold text-white">Explanation:</span> {q.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Lesson Info */}
          <div className="bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800 p-6">
            <h3 className="text-lg font-bold text-white mb-4">Lesson Information</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-zinc-400">Order</label>
                <p className="text-white font-semibold">#{lesson.order}</p>
              </div>
              <div>
                <label className="text-sm text-zinc-400">Type</label>
                <p className="text-white font-semibold">
                  {lesson.isInteractive ? 'Interactive' : 'Standard'}
                </p>
              </div>
              {lesson.canRead !== undefined && (
                <div>
                  <label className="text-sm text-zinc-400">Can Read</label>
                  <p className="text-white font-semibold">
                    {lesson.canRead ? '✓ Yes' : '✗ No'}
                  </p>
                </div>
              )}
              {lesson.canListen !== undefined && (
                <div>
                  <label className="text-sm text-zinc-400">Can Listen</label>
                  <p className="text-white font-semibold">
                    {lesson.canListen ? '✓ Yes' : '✗ No'}
                  </p>
                </div>
              )}
              <div>
                <label className="text-sm text-zinc-400">Created</label>
                <p className="text-white font-semibold">
                  {new Date(lesson.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800 p-6">
            <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                href={`/dashboard/lessons/${lessonId}`}
                className="block w-full px-4 py-3 bg-white text-black rounded-xl hover:bg-zinc-200 transition-all font-semibold text-center"
              >
                ✏️ Edit Lesson
              </Link>
              {course && (
                <Link
                  href={`/dashboard/courses/${course._id}/view`}
                  className="block w-full px-4 py-3 bg-zinc-800 text-white rounded-xl hover:bg-zinc-700 transition-all font-semibold text-center border border-zinc-700"
                >
                  📚 View Course
                </Link>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800 p-6">
            <h3 className="text-lg font-bold text-white mb-4">Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Content Length</span>
                <span className="text-white font-bold">{lesson.content.length} chars</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Questions</span>
                <span className="text-white font-bold">
                  {lesson.questions?.length || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Media Items</span>
                <span className="text-white font-bold">
                  {(lesson.media?.length || 0) + (lesson.photos?.length || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

