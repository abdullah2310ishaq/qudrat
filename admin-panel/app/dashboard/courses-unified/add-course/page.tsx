'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/components/Toast';

export default function AddCoursePage() {
  const router = useRouter();
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [courseForm, setCourseForm] = useState({
    title: '',
    heading: '',
    subHeading: '',
    type: 'simple' as 'simple' | 'challenge',
    category: 'General',
    photo: '',
    isActive: true,
  });

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

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const createToastId = toast.loading('Creating course...');
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseForm),
      });
      const data = await res.json();
      toast.removeToast(createToastId);
      if (data.success) {
        toast.success('✅ Course created successfully!');
        router.push('/dashboard/courses-unified');
      } else {
        toast.error('❌ Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error creating course:', error);
      toast.removeToast(createToastId);
      toast.error('❌ Error creating course');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 min-h-screen" style={{ backgroundColor: '#F5F5DC' }}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-4">
          <Link
            href="/dashboard/courses-unified"
            className="inline-block mb-2 text-black/70 hover:text-black font-medium text-xs"
          >
            ← Back to Courses
          </Link>
          <h1 className="text-lg font-bold text-black mb-1">➕ Add New Course</h1>
          <p className="text-black/70 text-xs">Create a new course for your students</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded border border-black shadow-md p-4">
          <form onSubmit={handleCreateCourse} className="space-y-3">
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
                placeholder="e.g., Introduction to Programming"
              />
              <p className="text-black/60 text-xs mt-0.5">Give your course a clear, descriptive title</p>
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
                placeholder="e.g., Learn the basics of programming"
              />
              <p className="text-black/60 text-xs mt-0.5">A short description of what students will learn</p>
            </div>

            <div>
              <label className="block text-black font-semibold mb-1 text-xs">
                Sub Heading (Optional)
              </label>
              <input
                type="text"
                value={courseForm.subHeading}
                onChange={(e) => setCourseForm({ ...courseForm, subHeading: e.target.value })}
                className="w-full px-2 py-1.5 bg-white border border-black/20 rounded text-black focus:border-black focus:outline-none text-xs"
                placeholder="Additional details about the course"
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
              <p className="text-black/60 text-xs mt-0.5">Choose the type of course you're creating</p>
            </div>

            <div>
              <label className="block text-black font-semibold mb-1 text-xs">
                Cover Photo (Optional)
              </label>
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

            <div className="flex gap-2 pt-3 border-t border-black/10">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-3 py-1.5 bg-black text-white rounded hover:bg-black/90 transition-all font-semibold text-xs disabled:opacity-50"
              >
                {saving ? '⏳ Creating...' : '✅ Create Course'}
              </button>
              <Link
                href="/dashboard/courses-unified"
                className="px-3 py-1.5 bg-white border border-black/20 text-black rounded hover:bg-black/5 transition-all font-semibold text-xs"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
