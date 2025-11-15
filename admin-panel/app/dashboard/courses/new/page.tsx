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
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          Create New Course
        </h1>
        <p className="text-zinc-400">Add a new course to your learning platform</p>
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
              placeholder="e.g., ChatGPT Basics"
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
              placeholder="e.g., Introduction to AI"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Sub Heading <span className="text-zinc-400 text-xs">(Optional)</span>
            </label>
            <input
              type="text"
              value={formData.subHeading}
              onChange={(e) => setFormData({ ...formData, subHeading: e.target.value })}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:ring-2 focus:ring-white focus:border-white transition-all"
              placeholder="Optional sub-heading for better description"
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
                setFormData({
                  ...formData,
                  type: e.target.value as 'simple' | 'challenge',
                })
              }
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:ring-2 focus:ring-white focus:border-white transition-all"
            >
              <option value="simple">Simple Course</option>
              <option value="challenge">Challenge Course</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Category <span className="text-zinc-400 text-xs">(Optional - helps with organization)</span>
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:ring-2 focus:ring-white focus:border-white transition-all"
              placeholder="e.g., AI, Business, Text, Creative"
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
                    value={formData.photo}
                    onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:ring-2 focus:ring-white focus:border-white transition-all text-xs"
                    placeholder="Base64 encoded image (optional)"
                  />
                  <p className="text-xs text-zinc-400 mt-1">Upload image and convert to Base64, or leave empty</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-white text-black rounded-xl hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
            >
              {loading ? 'Creating...' : 'Create Course'}
            </button>
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

