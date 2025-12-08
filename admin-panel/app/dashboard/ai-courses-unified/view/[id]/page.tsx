'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/components/Toast';

interface AILesson {
  _id: string;
  title: string;
  content: string;
  order: number;
  photos?: string[];
  media?: string[];
  canRead?: boolean;
  canListen?: boolean;
}

interface TreeLevel {
  level: number;
  topic: string;
  lessons: AILesson[] | string[];
  canRead: boolean;
  canListen: boolean;
}

interface AICourse {
  _id: string;
  title: string;
  heading: string;
  subHeading?: string;
  aiTool: string;
  category?: string;
  coverImage?: string;
  isActive: boolean;
  tree: TreeLevel[];
}

// Helper function to normalize base64 image URLs
function normalizeImageSrc(photo: string): string {
  if (!photo || typeof photo !== 'string') return '';
  if (photo.startsWith('data:image')) return photo;
  if (photo.startsWith('http://') || photo.startsWith('https://')) return photo;
  const trimmed = photo.trim();
  if (trimmed.startsWith('/9j/') || trimmed.startsWith('iVBORw0KGgo')) {
    return trimmed.startsWith('/9j/') 
      ? `data:image/jpeg;base64,${trimmed}` 
      : `data:image/png;base64,${trimmed}`;
  }
  if (trimmed.match(/^[A-Za-z0-9+/=\s]+$/)) {
    return `data:image/jpeg;base64,${trimmed}`;
  }
  return photo;
}

export default function ViewAICoursePage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const courseId = params.id as string;
  const [course, setCourse] = useState<AICourse | null>(null);
  const [lessons, setLessons] = useState<AILesson[]>([]);
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
      const res = await fetch(`/api/aiCourses/${courseId}`);
      const data = await res.json();
      if (data.success) {
        setCourse(data.data);
      }
    } catch (error) {
      console.error('Error fetching AI course:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLessons = async () => {
    try {
      const res = await fetch(`/api/aiLessons?aiCourseId=${courseId}`);
      const data = await res.json();
      if (data.success) {
        const sortedLessons = (data.data || []).sort((a: AILesson, b: AILesson) => a.order - b.order);
        setLessons(sortedLessons);
      }
    } catch (error) {
      console.error('Error fetching lessons:', error);
    }
  };

  const handleDeleteCourse = async () => {
    if (!course) return;
    if (!confirm(`⚠️ Are you sure you want to delete "${course.title}"?\n\nThis will also delete all lessons. This action cannot be undone!`)) {
      return;
    }

    setDeletingCourse(true);
    const deleteToastId = toast.loading('Deleting AI course...');
    try {
      const res = await fetch(`/api/aiCourses/${courseId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      toast.removeToast(deleteToastId);
      if (data.success) {
        toast.success('✅ AI course deleted successfully!');
        router.push('/dashboard/ai-courses-unified');
      } else {
        toast.error('❌ Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting AI course:', error);
      toast.removeToast(deleteToastId);
      toast.error('❌ Error deleting AI course');
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
      const res = await fetch(`/api/aiLessons/${lessonId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      toast.removeToast(deleteToastId);
      if (data.success) {
        toast.success('✅ Lesson deleted successfully!');
        fetchLessons();
        fetchCourse(); // Refresh to update tree structure
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

  const getLessonsForLevel = (levelLessons: AILesson[] | string[]): AILesson[] => {
    if (levelLessons.length === 0) return [];
    // Check if first item is an object (populated) or string (ID)
    if (typeof levelLessons[0] === 'object' && levelLessons[0] !== null && '_id' in levelLessons[0]) {
      return levelLessons as AILesson[];
    }
    // If IDs, find matching lessons from all lessons
    const ids = levelLessons as string[];
    return lessons.filter(l => ids.includes(l._id));
  };

  if (loading) {
    return (
      <div className="p-4 min-h-screen" style={{ backgroundColor: '#F5F5DC' }}>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-black/20 border-t-black"></div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-4 min-h-screen" style={{ backgroundColor: '#F5F5DC' }}>
        <div className="text-center py-20">
          <p className="text-black text-xl font-bold mb-4">AI Course not found</p>
          <Link
            href="/dashboard/ai-courses-unified"
            className="inline-block px-6 py-3 bg-black text-white rounded-lg hover:bg-black/90 font-bold"
          >
            Back to AI Courses
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
            href="/dashboard/ai-courses-unified"
            className="inline-block mb-2 text-black/70 hover:text-black font-medium text-xs"
          >
            ← Back to AI Courses
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-base font-bold text-black mb-1">{course.title}</h1>
              <p className="text-black/70 text-xs mb-1">{course.heading}</p>
              {course.subHeading && (
                <p className="text-black/60 text-xs">{course.subHeading}</p>
              )}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="px-1.5 py-0.5 bg-black text-white rounded text-xs font-semibold">
                  {course.aiTool}
                </span>
                <span className="text-black/70 font-medium text-xs">
                  📚 {course.tree?.length || 0} levels
                </span>
              </div>
            </div>
            <div className="flex gap-1.5">
              <Link
                href={`/dashboard/ai-courses-unified/edit/${courseId}`}
                className="px-2 py-1 bg-white border border-black text-black rounded hover:bg-black/5 transition-all font-semibold text-xs"
              >
                ✏️ Edit
              </Link>
              <Link
                href={`/dashboard/ai-courses-unified/add-lesson?aiCourseId=${courseId}`}
                className="px-2 py-1 bg-black text-white rounded hover:bg-black/90 transition-all font-semibold text-xs"
              >
                ➕ Add Lesson
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

        {/* Course Cover Photo */}
        <div className="mb-4 rounded overflow-hidden border border-black shadow-sm bg-gradient-to-br from-black/10 to-black/5">
          {course.coverImage ? (
            <img 
              src={normalizeImageSrc(course.coverImage)} 
              alt={course.title} 
              className="w-full h-32 object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `
                    <div class="w-full h-32 flex items-center justify-center bg-gray-200">
                      <div class="text-center">
                        <div class="text-3xl opacity-30 mb-1">🤖</div>
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
                <div className="text-3xl opacity-30 mb-1">🤖</div>
                <p className="text-black/50 text-xs font-medium">No cover photo</p>
              </div>
            </div>
          )}
        </div>

        {/* Levels Section */}
        <div className="bg-white rounded border border-black shadow-sm p-3">
          <h2 className="text-sm font-bold text-black mb-3">📚 Levels ({course.tree?.length || 0})</h2>
          
          {!course.tree || course.tree.length === 0 ? (
            <div className="text-center py-8 bg-cream-50 rounded border border-dashed border-black/20">
              <div className="text-3xl mb-2">📚</div>
              <p className="text-black text-sm font-bold mb-1">No levels yet</p>
              <p className="text-black/60 text-xs mb-3">Add levels and lessons to get started</p>
              <Link
                href={`/dashboard/ai-courses-unified/edit/${courseId}`}
                className="inline-block px-3 py-1.5 bg-black text-white rounded hover:bg-black/90 transition-all font-semibold text-xs"
              >
                ➕ Add Levels
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {course.tree.map((level, levelIndex) => {
                const levelLessons = getLessonsForLevel(level.lessons);
                return (
                  <div
                    key={levelIndex}
                    className="bg-cream-50 rounded border border-black/20 p-3 hover:border-black/40 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-xs font-bold text-black/50">Level {level.level}</span>
                          <h3 className="text-sm font-bold text-black">{level.topic}</h3>
                          {level.canRead && (
                            <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                              📖 Read
                            </span>
                          )}
                          {level.canListen && (
                            <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs font-semibold">
                              🎵 Listen
                            </span>
                          )}
                        </div>
                        <p className="text-black/60 text-xs mb-2">
                          📖 {levelLessons.length} lesson{levelLessons.length !== 1 ? 's' : ''} in this level
                        </p>
                      </div>
                      <Link
                        href={`/dashboard/ai-courses-unified/add-lesson?aiCourseId=${courseId}&level=${level.level}`}
                        className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 font-semibold text-xs whitespace-nowrap"
                      >
                        ➕ Add Lesson
                      </Link>
                    </div>

                    {/* Lessons in this Level */}
                    {levelLessons.length > 0 ? (
                      <div className="mt-3 pt-3 border-t border-black/10 space-y-2">
                        {levelLessons.map((lesson) => (
                          <div
                            key={lesson._id}
                            className="bg-white rounded border border-black/10 p-2 hover:border-black/30 transition-all"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                                  <span className="px-1.5 py-0.5 bg-black/10 text-black rounded text-xs font-bold">#{lesson.order}</span>
                                  <h4 className="text-xs font-bold text-black">{lesson.title}</h4>
                                  {lesson.canRead && (
                                    <span className="px-1 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-semibold">📖</span>
                                  )}
                                  {lesson.canListen && (
                                    <span className="px-1 py-0.5 bg-green-50 text-green-700 rounded text-xs font-semibold">🎵</span>
                                  )}
                                </div>
                                <p className="text-black/80 text-xs whitespace-pre-wrap line-clamp-2 mb-1.5">
                                  {lesson.content}
                                </p>
                                {lesson.photos && lesson.photos.length > 0 && (
                                  <div className="flex gap-1 mt-1.5 flex-wrap">
                                    {lesson.photos.slice(0, 3).map((photo, idx) => (
                                      <img
                                        key={idx}
                                        src={normalizeImageSrc(photo)}
                                        alt={`Lesson ${idx + 1}`}
                                        className="w-12 h-12 object-cover rounded border border-black/20"
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          target.style.display = 'none';
                                        }}
                                      />
                                    ))}
                                    {lesson.photos.length > 3 && (
                                      <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded border border-black/20 text-xs text-black/60">
                                        +{lesson.photos.length - 3}
                                      </div>
                                    )}
                                  </div>
                                )}
                                {lesson.media && lesson.media.some(m => m.startsWith('data:audio')) && (
                                  <div className="mt-1.5">
                                    <audio controls src={lesson.media.find(m => m.startsWith('data:audio'))} className="w-full h-7" />
                                  </div>
                                )}
                              </div>
                              <div className="flex gap-1 ml-2">
                                <Link
                                  href={`/dashboard/ai-courses-unified/edit-lesson/${lesson._id}`}
                                  className="px-1.5 py-0.5 bg-blue-50 border border-blue-200 text-blue-700 rounded hover:bg-blue-100 font-semibold text-xs transition-colors"
                                  title="Edit lesson"
                                >
                                  ✏️
                                </Link>
                                <button
                                  onClick={() => handleDeleteLesson(lesson._id, lesson.title)}
                                  disabled={deletingLessonId === lesson._id}
                                  className="px-1.5 py-0.5 bg-red-600 text-white rounded hover:bg-red-700 font-semibold text-xs disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  title="Delete lesson"
                                >
                                  {deletingLessonId === lesson._id ? '⏳' : '🗑️'}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-3 pt-3 border-t border-black/10 text-center py-4 bg-white/50 rounded border border-dashed border-black/20">
                        <p className="text-black/60 text-xs mb-1">No lessons in this level yet</p>
                        <Link
                          href={`/dashboard/ai-courses-unified/add-lesson?aiCourseId=${courseId}&level=${level.level}`}
                          className="inline-block px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 font-semibold text-xs mt-1"
                        >
                          ➕ Add First Lesson
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
