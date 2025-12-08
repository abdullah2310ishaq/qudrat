'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/components/Toast';

interface Lesson {
  _id: string;
  title: string;
  content: string;
  order: number;
  isInteractive: boolean;
  photos?: string[];
  media?: string[];
  questions?: Array<{
    question: string;
    options: string[];
    correctAnswer: number;
  }>;
}

interface Course {
  _id: string;
  title: string;
  heading: string;
  subHeading?: string;
  type: 'simple' | 'challenge';
  category: string;
  isActive: boolean;
  photo?: string;
}

// Helper function to normalize base64 image URLs
function normalizeImageSrc(photo: string): string {
  if (!photo || typeof photo !== 'string') return '';
  
  // If it already has data URI, return as is
  if (photo.startsWith('data:image')) {
    return photo;
  }
  
  // If it's a URL, return as is
  if (photo.startsWith('http://') || photo.startsWith('https://')) {
    return photo;
  }
  
  // Try to detect image type from base64 content
  const trimmed = photo.trim();
  if (trimmed.startsWith('/9j/') || trimmed.startsWith('iVBORw0KGgo')) {
    return trimmed.startsWith('/9j/') 
      ? `data:image/jpeg;base64,${trimmed}` 
      : `data:image/png;base64,${trimmed}`;
  }
  
  // If it looks like base64 (contains base64 characters), try jpeg
  if (trimmed.match(/^[A-Za-z0-9+/=\s]+$/)) {
    return `data:image/jpeg;base64,${trimmed}`;
  }
  
  return photo;
}

export default function ViewCoursePage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const courseId = params.id as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingCourse, setDeletingCourse] = useState(false);
  const [deletingLessonId, setDeletingLessonId] = useState<string | null>(null);

  useEffect(() => {
    if (courseId) {
      fetchCourse();
      fetchLessons();
    }
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const res = await fetch(`/api/courses/${courseId}`);
      const data = await res.json();
      if (data.success) {
        setCourse(data.data);
      }
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLessons = async () => {
    try {
      const res = await fetch(`/api/lessons?courseId=${courseId}`);
      const data = await res.json();
      if (data.success) {
        const sortedLessons = (data.data || []).sort((a: Lesson, b: Lesson) => a.order - b.order);
        setLessons(sortedLessons);
      }
    } catch (error) {
      console.error('Error fetching lessons:', error);
    }
  };

  const handleDeleteCourse = async () => {
    if (!course) return;
    if (!confirm(`⚠️ Are you sure you want to delete "${course.title}"?\n\nThis will also delete all ${lessons.length} lesson(s) in this course. This action cannot be undone!`)) {
      return;
    }

    setDeletingCourse(true);
    const deleteToastId = toast.loading('Deleting course...');
    try {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      toast.removeToast(deleteToastId);
      if (data.success) {
        toast.success('✅ Course deleted successfully!');
        router.push('/dashboard/courses-unified');
      } else {
        toast.error('❌ Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.removeToast(deleteToastId);
      toast.error('❌ Error deleting course');
    } finally {
      setDeletingCourse(false);
    }
  };

  const handleDeleteLesson = async (lessonId: string, lessonTitle: string) => {
    if (!confirm(`⚠️ Are you sure you want to delete lesson "${lessonTitle}"?\n\nThis action cannot be undone!`)) {
      return;
    }

    setDeletingLessonId(lessonId);
    const deleteToastId = toast.loading('Deleting lesson...');
    try {
      const res = await fetch(`/api/lessons/${lessonId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      toast.removeToast(deleteToastId);
      if (data.success) {
        toast.success('✅ Lesson deleted successfully!');
        fetchLessons(); // Refresh lessons list
      } else {
        toast.error('❌ Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting lesson:', error);
      toast.removeToast(deleteToastId);
      toast.error('❌ Error deleting lesson');
    } finally {
      setDeletingLessonId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8 min-h-screen" style={{ backgroundColor: '#F5F5DC' }}>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-black/20 border-t-black"></div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-8 min-h-screen" style={{ backgroundColor: '#F5F5DC' }}>
        <div className="text-center py-20">
          <p className="text-black text-2xl font-bold mb-4">Course not found</p>
          <Link
            href="/dashboard/courses-unified"
            className="inline-block px-6 py-3 bg-black text-white rounded-lg hover:bg-black/90 font-bold"
          >
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 min-h-screen" style={{ backgroundColor: '#F5F5DC' }}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-4">
          <Link
            href="/dashboard/courses-unified"
            className="inline-block mb-2 text-black/70 hover:text-black font-medium text-xs"
          >
            ← Back to Courses
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-base font-bold text-black mb-1">{course.title}</h1>
              <p className="text-black/70 text-xs mb-1">{course.heading}</p>
              {course.subHeading && (
                <p className="text-black/60 text-xs">{course.subHeading}</p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <span className="px-1.5 py-0.5 bg-black text-white rounded text-xs font-semibold">
                  {course.type}
                </span>
                <span className="text-black/70 font-medium text-xs">
                  📖 {lessons.length} lessons
                </span>
              </div>
            </div>
            <div className="flex gap-1.5">
              <Link
                href={`/dashboard/courses-unified/edit/${courseId}`}
                className="px-2 py-1 bg-white border border-black text-black rounded hover:bg-black/5 transition-all font-semibold text-xs"
              >
                ✏️ Edit
              </Link>
              <Link
                href={`/dashboard/courses-unified/add-lesson?courseId=${courseId}`}
                className="px-2 py-1 bg-black text-white rounded hover:bg-black/90 transition-all font-semibold text-xs"
              >
                ➕ Add
              </Link>
              <button
                onClick={handleDeleteCourse}
                disabled={deletingCourse}
                className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-all font-semibold text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                title="Delete course"
              >
                {deletingCourse ? '⏳' : '🗑️'}
              </button>
            </div>
          </div>
        </div>

        {/* Course Cover Photo - Always show with placeholder if no photo */}
        <div className="mb-4 rounded overflow-hidden border border-black shadow-sm bg-gradient-to-br from-black/10 to-black/5">
          {course.photo ? (
            <img 
              src={normalizeImageSrc(course.photo)} 
              alt={course.title} 
              className="w-full h-32 object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `
                    <div class="w-full h-32 flex items-center justify-center bg-gray-200">
                      <div class="text-center">
                        <div class="text-3xl opacity-30 mb-1">📚</div>
                        <p class="text-black/50 text-xs font-medium">Image failed to load</p>
                      </div>
                    </div>
                  `;
                }
              }}
              style={{ display: 'block', width: '100%', height: '128px', objectFit: 'cover', backgroundColor: 'transparent' }}
            />
          ) : (
            <div className="w-full h-32 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl opacity-30 mb-1">📚</div>
                <p className="text-black/50 text-xs font-medium">No cover photo</p>
              </div>
            </div>
          )}
        </div>

        {/* Lessons Section */}
        <div className="bg-white rounded border border-black shadow-sm p-3">
          <h2 className="text-sm font-bold text-black mb-3">📖 Lessons ({lessons.length})</h2>
          
          {lessons.length === 0 ? (
            <div className="text-center py-12 bg-cream-50 rounded-lg border-2 border-dashed border-black/20">
              <div className="text-5xl mb-3">📖</div>
              <p className="text-black text-lg font-bold mb-2">No lessons yet</p>
              <p className="text-black/60 text-sm mb-4">Add your first lesson to get started</p>
              <Link
                href={`/dashboard/courses-unified/add-lesson?courseId=${courseId}`}
                className="inline-block px-5 py-2.5 bg-black text-white rounded-lg hover:bg-black/90 transition-all font-semibold text-sm shadow-md"
              >
                ➕ Add First Lesson
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {lessons.map((lesson) => (
                <div
                  key={lesson._id}
                  className="bg-cream-50 rounded-lg border-2 border-black/20 p-4 hover:border-black/40 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg font-bold text-black/50">#{lesson.order}</span>
                        <h3 className="text-lg font-bold text-black">{lesson.title}</h3>
                        {lesson.isInteractive && (
                          <span className="px-2 py-0.5 bg-yellow-300 text-black rounded text-xs font-semibold">
                            🎯 Quiz
                          </span>
                        )}
                      </div>
                      <div className="prose max-w-none">
                        <p className="text-black/80 text-sm whitespace-pre-wrap leading-relaxed">
                          {lesson.content}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-3">
                      <Link
                        href={`/dashboard/courses-unified/edit-lesson/${lesson._id}`}
                        className="px-3 py-1.5 bg-white border border-black text-black rounded hover:bg-black/5 font-semibold text-xs"
                      >
                        ✏️ Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteLesson(lesson._id, lesson.title)}
                        disabled={deletingLessonId === lesson._id}
                        className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 font-semibold text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete lesson"
                      >
                        {deletingLessonId === lesson._id ? '⏳' : '🗑️'}
                      </button>
                    </div>
                  </div>

                  {/* Images */}
                  {lesson.photos && lesson.photos.length > 0 && (
                    <div className="mt-2">
                      <h4 className="text-black font-semibold mb-1.5 text-xs">📷 Images ({lesson.photos.length})</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
                        {lesson.photos.map((photo, idx) => {
                          // Check if photo is valid
                          const isValid = photo && typeof photo === 'string' && photo.trim() !== '';
                          
                          // Normalize the image source
                          const imageSrc = isValid ? normalizeImageSrc(photo) : '';
                          
                          return (
                            <div 
                              key={idx} 
                              className="rounded-lg overflow-hidden border-2 border-black/20 bg-gray-100 relative"
                              style={{ minHeight: '128px', maxHeight: '128px', aspectRatio: '1' }}
                            >
                              {isValid && imageSrc ? (
                                <img
                                  src={imageSrc}
                                  alt={`Lesson Image ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    const parent = target.parentElement;
                                    if (parent) {
                                      parent.className = 'rounded-lg border-2 border-red-300 bg-red-50 flex items-center justify-center';
                                      parent.style.minHeight = '128px';
                                      parent.style.maxHeight = '128px';
                                      parent.innerHTML = '<div class="text-red-600 text-xs p-2 text-center font-semibold">❌ Failed to load</div>';
                                    }
                                  }}
                                  onLoad={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'block';
                                    const parent = target.parentElement;
                                    if (parent) {
                                      parent.style.backgroundColor = 'transparent';
                                    }
                                  }}
                                  loading="lazy"
                                  style={{ 
                                    display: 'block', 
                                    width: '100%', 
                                    height: '100%', 
                                    objectFit: 'cover',
                                    backgroundColor: 'transparent'
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-yellow-50 text-yellow-700 text-xs p-2 text-center">
                                  ⚠️ Invalid Image
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Audio */}
                  {lesson.media && lesson.media.length > 0 && (
                    <div className="mt-2">
                      <h4 className="text-black font-semibold mb-1.5 text-xs">🎵 Audio</h4>
                      <div className="space-y-1.5">
                        {lesson.media.map((mediaItem, idx) => {
                          if (mediaItem.startsWith('data:audio') || mediaItem.startsWith('data:audio/')) {
                            return (
                              <div key={idx} className="bg-white p-2 rounded border border-black/10">
                                <audio controls src={mediaItem} className="w-full" />
                              </div>
                            );
                          }
                          return null;
                        })}
                      </div>
                    </div>
                  )}

                  {/* Quiz Questions */}
                  {lesson.isInteractive && lesson.questions && lesson.questions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-black/10">
                      <h4 className="text-black font-semibold mb-2 text-xs">🎯 Quiz Questions</h4>
                      <div className="space-y-2">
                        {lesson.questions.map((q, qIdx) => (
                          <div key={qIdx} className="bg-white p-2 rounded border border-black/10">
                            <p className="text-black font-semibold text-xs mb-1.5">
                              {qIdx + 1}. {q.question}
                            </p>
                            <div className="space-y-1">
                              {q.options.map((opt, optIdx) => (
                                <div
                                  key={optIdx}
                                  className={`p-1.5 rounded border ${
                                    optIdx === q.correctAnswer
                                      ? 'bg-green-100 border-green-500'
                                      : 'bg-white border-black/20'
                                  }`}
                                >
                                  <span className="font-semibold text-xs text-black">
                                    {optIdx === q.correctAnswer ? '✅' : '○'} Option {optIdx + 1}:
                                  </span>
                                  <span className="ml-2 text-xs text-black">{opt}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
