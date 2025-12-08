'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/components/Toast';

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

export default function EditCoursePage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const courseId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [courseForm, setCourseForm] = useState({
    title: '',
    heading: '',
    subHeading: '',
    type: 'simple' as 'simple' | 'challenge',
    category: 'General',
    photo: '',
    isActive: true,
  });

  useEffect(() => {
    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const res = await fetch(`/api/courses/${courseId}`);
      const data = await res.json();
      if (data.success) {
        const course = data.data;
        setCourseForm({
          title: course.title || '',
          heading: course.heading || '',
          subHeading: course.subHeading || '',
          type: course.type || 'simple',
          category: course.category || 'General',
          photo: course.photo || '',
          isActive: course.isActive !== undefined ? course.isActive : true,
        });
      }
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('⚠️ Image is too large. Maximum size: 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setCourseForm({ ...courseForm, photo: base64 });
      toast.success('Image uploaded successfully!');
    };
    reader.onerror = () => {
      toast.error('❌ Error reading file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const updateToastId = toast.loading('Updating course...');
    try {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseForm),
      });
      const data = await res.json();
      toast.removeToast(updateToastId);
      if (data.success) {
        toast.success('✅ Course updated successfully!');
        router.push(`/dashboard/courses-unified/view/${courseId}`);
      } else {
        toast.error('❌ Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating course:', error);
      toast.removeToast(updateToastId);
      toast.error('❌ Error updating course');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!confirm(`⚠️ Are you sure you want to delete "${courseForm.title}"?\n\nThis will also delete all lessons in this course. This action cannot be undone!`)) {
      return;
    }

    setDeleting(true);
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
      setDeleting(false);
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
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-4">
          <Link
            href={`/dashboard/courses-unified/view/${courseId}`}
            className="inline-block mb-2 text-black/70 hover:text-black font-medium text-xs"
          >
            ← Back to Course
          </Link>
          <h1 className="text-lg font-bold text-black mb-1">✏️ Edit Course</h1>
          <p className="text-black/70 text-xs">Update your course information</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded border border-black shadow-md p-4">
          <form onSubmit={handleUpdateCourse} className="space-y-3">
            <div>
              <label className="block text-black font-semibold mb-1 text-xs">
                Course Title <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={courseForm.title}
                onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                className="w-full px-2 py-1.5 bg-white border border-black/20 rounded text-black focus:border-black focus:outline-none text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-black font-semibold mb-1 text-xs">
                Heading <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={courseForm.heading}
                onChange={(e) => setCourseForm({ ...courseForm, heading: e.target.value })}
                className="w-full px-2 py-1.5 bg-white border border-black/20 rounded text-black focus:border-black focus:outline-none text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-black font-semibold mb-1 text-xs">Sub Heading (Optional)</label>
              <input
                type="text"
                value={courseForm.subHeading}
                onChange={(e) => setCourseForm({ ...courseForm, subHeading: e.target.value })}
                className="w-full px-2 py-1.5 bg-white border border-black/20 rounded text-black focus:border-black focus:outline-none text-xs"
              />
            </div>

            <div>
              <label className="block text-black font-semibold mb-1 text-xs">
                Course Type <span className="text-red-600">*</span>
              </label>
              <select
                value={courseForm.type}
                onChange={(e) => setCourseForm({ ...courseForm, type: e.target.value as 'simple' | 'challenge' })}
                className="w-full px-2 py-1.5 bg-white border border-black/20 rounded text-black focus:border-black focus:outline-none text-xs font-medium"
              >
                <option value="simple">📚 Simple Course</option>
                <option value="challenge">🎯 Challenge Course</option>
              </select>
            </div>

            <div>
              <label className="block text-black font-semibold mb-1 text-xs">Cover Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleCourseImageUpload}
                className="w-full px-2 py-1.5 bg-white border border-black/20 rounded text-black text-xs font-medium"
              />
              {courseForm.photo && (
                <div className="mt-2">
                  <img src={courseForm.photo} alt="Preview" className="max-w-xs rounded border border-black/20 shadow-sm" />
                  <button
                    type="button"
                    onClick={() => setCourseForm({ ...courseForm, photo: '' })}
                    className="mt-1.5 px-2 py-1 bg-red-600 text-white rounded text-xs font-semibold hover:bg-red-700"
                  >
                    Remove Photo
                  </button>
                </div>
              )}
              <p className="text-black/60 text-xs mt-0.5">Upload a cover image for your course (max 5MB)</p>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={courseForm.isActive}
                onChange={(e) => setCourseForm({ ...courseForm, isActive: e.target.checked })}
                className="w-4 h-4 mr-2"
              />
              <label htmlFor="isActive" className="text-black font-semibold text-xs cursor-pointer">
                Course is Active (visible to students)
              </label>
            </div>

            <div className="flex gap-2 pt-3 border-t border-black/10">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-3 py-1.5 bg-black text-white rounded hover:bg-black/90 transition-all font-semibold text-xs disabled:opacity-50"
              >
                {saving ? '⏳ Saving...' : '✅ Save Changes'}
              </button>
              <Link
                href={`/dashboard/courses-unified/view/${courseId}`}
                className="px-3 py-1.5 bg-white border border-black/20 text-black rounded hover:bg-black/5 transition-all font-semibold text-xs"
              >
                Cancel
              </Link>
              <button
                type="button"
                onClick={handleDeleteCourse}
                disabled={deleting}
                className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-all font-semibold text-xs disabled:opacity-50"
              >
                {deleting ? '⏳' : '🗑️'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
