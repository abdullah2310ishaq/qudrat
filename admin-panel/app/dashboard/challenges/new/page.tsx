'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewChallengePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 7,
    level: 'Beginner' as 'Beginner' | 'Intermediate' | 'Advanced',
    isActive: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          lessons: [],
          interactiveQuestions: [],
        }),
      });

      const data = await res.json();
      if (data.success) {
        router.push(`/dashboard/challenges/${data.data._id}`);
      } else {
        alert('Error creating challenge: ' + data.error);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error creating challenge:', errorMessage);
      alert('Error creating challenge: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-black">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Create New Challenge</h1>
        <p className="text-zinc-400">Create a time-bound challenge with daily lessons and questions</p>
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
              placeholder="e.g., 30-Day AI Challenge"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Description *
            </label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:ring-2 focus:ring-white focus:border-white transition-all"
              placeholder="Describe the challenge and what users will learn..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Duration (days) * <span className="text-zinc-400 text-xs">(e.g., 7, 30, 90)</span>
            </label>
            <input
              type="number"
              required
              min="1"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 7 })}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:ring-2 focus:ring-white focus:border-white transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Level *
            </label>
            <select
              required
              value={formData.level}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  level: e.target.value as 'Beginner' | 'Intermediate' | 'Advanced',
                })
              }
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:ring-2 focus:ring-white focus:border-white transition-all"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
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
              Active
            </label>
          </div>

          <div className="bg-zinc-800 rounded-xl p-4 border border-zinc-700 mt-4">
            <p className="text-sm text-zinc-400">
              💡 <strong className="text-white">Next Step:</strong> After creating, you can add daily lessons and questions for each day.
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-white text-black rounded-xl hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
            >
              {loading ? 'Creating...' : 'Create Challenge'}
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

