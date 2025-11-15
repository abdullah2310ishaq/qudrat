'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    heading: '',
    subHeading: '',
    type: 'simple' as 'simple' | 'challenge',
    category: 'General',
    photo: '',
    isActive: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        alert('Course created successfully! Redirecting to add lessons...');
        // Redirect to add lessons page for this course
        router.push(`/dashboard/courses/${data.data._id}/add-lessons`);
      } else {
        alert('Error creating course: ' + data.error);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error creating course:', errorMessage);
      alert('Error creating course: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-black">
      <div className="mb-12">
        <h1 className="text-5xl font-thin text-white mb-3 tracking-tight">
          Create New Course
        </h1>
        <div className="w-16 h-px bg-white/20 mb-4"></div>
        <p className="text-sm font-light text-white/60 tracking-wide">Add a new course to your learning platform</p>
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
              className="w-full px-4 py-2.5 border border-white/10 rounded-sm bg-white/5 text-white placeholder-white/30 focus:bg-white/10 focus:border-white/20 transition-all font-light text-sm"
              placeholder="e.g., ChatGPT Basics"
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
              className="w-full px-4 py-2.5 border border-white/10 rounded-sm bg-white/5 text-white placeholder-white/30 focus:bg-white/10 focus:border-white/20 transition-all font-light text-sm"
              placeholder="e.g., Introduction to AI"
            />
          </div>

          <div>
            <label className="block text-xs font-light text-white/60 mb-2 tracking-wider uppercase">
              Sub Heading <span className="text-white/40 text-xs normal-case">(Optional)</span>
            </label>
            <input
              type="text"
              value={formData.subHeading}
              onChange={(e) => setFormData({ ...formData, subHeading: e.target.value })}
              className="w-full px-4 py-2.5 border border-white/10 rounded-sm bg-white/5 text-white placeholder-white/30 focus:bg-white/10 focus:border-white/20 transition-all font-light text-sm"
              placeholder="Optional sub-heading for better description"
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
                setFormData({
                  ...formData,
                  type: e.target.value as 'simple' | 'challenge',
                })
              }
              className="w-full px-4 py-2.5 border border-white/10 rounded-sm bg-white/5 text-white focus:bg-white/10 focus:border-white/20 transition-all font-light text-sm"
            >
              <option value="simple">Simple Course</option>
              <option value="challenge">Challenge Course</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-light text-white/60 mb-2 tracking-wider uppercase">
              Category <span className="text-white/40 text-xs normal-case">(Optional)</span>
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2.5 border border-white/10 rounded-sm bg-white/5 text-white placeholder-white/30 focus:bg-white/10 focus:border-white/20 transition-all font-light text-sm"
              placeholder="e.g., AI, Business, Text, Creative"
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
                    Cover Photo <span className="text-white/40 text-xs normal-case">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.photo}
                    onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                    className="w-full px-4 py-2.5 border border-white/10 rounded-sm bg-white/5 text-white placeholder-white/30 focus:bg-white/10 focus:border-white/20 transition-all font-light text-xs"
                    placeholder="Base64 encoded image (optional)"
                  />
                  <p className="text-xs text-white/40 mt-1 font-light">Upload image and convert to Base64, or leave empty</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-6 border-t border-white/10">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-white/5 text-white rounded-sm border border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-300 font-light text-sm tracking-wider uppercase disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Course'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2.5 bg-white/5 text-white rounded-sm border border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-300 font-light text-sm tracking-wider uppercase"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

