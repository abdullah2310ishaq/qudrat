'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useToast } from '@/components/Toast';

interface Course {
  _id: string;
  title: string;
  heading: string;
  type: 'simple' | 'challenge';
  category: string;
  isActive: boolean;
  lessons?: string[];
  photo?: string;
}

export default function UnifiedCoursesPage() {
  const toast = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/courses');
      const data = await res.json();
      if (data.success) {
        setCourses(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId: string, courseTitle: string) => {
    if (!confirm(`⚠️ Are you sure you want to delete "${courseTitle}"?\n\nThis will also delete all lessons in this course. This action cannot be undone!`)) {
      return;
    }

    setDeletingId(courseId);
    const deleteToastId = toast.loading('Deleting course...');
    try {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      toast.removeToast(deleteToastId);
      if (data.success) {
        toast.success('✅ Course deleted successfully!');
        fetchCourses(); // Refresh the list
      } else {
        toast.error('❌ Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.removeToast(deleteToastId);
      toast.error('❌ Error deleting course');
    } finally {
      setDeletingId(null);
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

  return (
    <div className="p-4 min-h-screen" style={{ backgroundColor: '#F5F5DC' }}>
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-black mb-1">📚 Courses & Lessons</h1>
        <p className="text-black/70 text-xs">Manage all your courses and lessons</p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mb-4">
        <Link
          href="/dashboard/courses-unified/add-course"
          className="px-3 py-1.5 bg-black text-white rounded text-xs font-semibold hover:bg-black/90 transition-all"
        >
          ➕ Add Course
        </Link>
        <Link
          href="/dashboard/courses-unified/add-lesson"
          className="px-3 py-1.5 bg-white border border-black text-black rounded hover:bg-black/5 transition-all text-xs font-semibold"
        >
          📖 Add Lesson
        </Link>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {courses.length === 0 ? (
          <div className="col-span-full text-center py-8 bg-white rounded border border-black/20">
            <div className="text-4xl mb-2">📚</div>
            <p className="text-black text-base font-bold mb-2">No courses yet</p>
            <p className="text-black/60 text-xs mb-3">Create your first course to get started</p>
            <Link
              href="/dashboard/courses-unified/add-course"
              className="inline-block px-4 py-1.5 bg-black text-white rounded hover:bg-black/90 transition-all text-xs font-semibold"
            >
              Create First Course
            </Link>
          </div>
        ) : (
          courses.map((course) => (
            <div
              key={course._id}
              className="bg-white rounded border border-black/20 hover:shadow-md transition-all overflow-hidden group relative"
            >
              {/* Course Photo - Always show, with placeholder if no photo */}
              <Link
                href={`/dashboard/courses-unified/view/${course._id}`}
                className="block"
              >
                <div className="w-full h-28 overflow-hidden bg-gradient-to-br from-black/10 to-black/5 relative">
                  {course.photo ? (
                    <img 
                      src={course.photo} 
                      alt={course.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-3xl opacity-30">📚</div>
                    </div>
                  )}
                  {/* Type Badge Overlay */}
                  <div className="absolute top-1 right-1">
                    <span className="px-1.5 py-0.5 bg-black/80 text-white rounded text-xs font-semibold backdrop-blur-sm">
                      {course.type === 'challenge' ? '🎯' : '📚'}
                    </span>
                  </div>
                </div>
              </Link>
              
              <div className="p-3">
                <Link href={`/dashboard/courses-unified/view/${course._id}`}>
                  <h3 className="text-sm font-bold text-black mb-1 line-clamp-2 hover:text-black/70">{course.title}</h3>
                  <p className="text-black/70 text-xs mb-2 line-clamp-2">{course.heading}</p>
                </Link>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-black/60 font-medium text-xs">
                    📖 {Array.isArray(course.lessons) ? course.lessons.length : 0} lessons
                  </span>
                </div>
                <div className="flex gap-1.5 pt-2 border-t border-black/10">
                  <Link
                    href={`/dashboard/courses-unified/view/${course._id}`}
                    className="flex-1 px-2 py-1 bg-black text-white rounded text-xs font-semibold text-center hover:bg-black/90 transition-all"
                  >
                    👁️ View
                  </Link>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.location.href = `/dashboard/courses-unified/edit/${course._id}`;
                    }}
                    className="flex-1 px-2 py-1 bg-white border border-black text-black rounded hover:bg-black/5 transition-all text-xs font-semibold"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDeleteCourse(course._id, course.title);
                    }}
                    disabled={deletingId === course._id}
                    className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-all text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete course"
                  >
                    {deletingId === course._id ? '⏳' : '🗑️'}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
