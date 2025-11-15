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
        body: JSON.stringify(formData),
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
      <div className="mb-12">
        <h1 className="text-5xl font-thin text-white mb-3 tracking-tight">Create New Challenge</h1>
        <div className="w-16 h-px bg-white/20 mb-4"></div>
        <p className="text-sm font-light text-white/60 tracking-wide">Create a time-bound challenge with daily lessons and questions</p>
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
              className="w-full px-4 py-2.5 border border-white/10 rounded-sm bg-white/5 text-white placeholder-white/30 focus:bg-white/10 focus:border-white/20 transition-all"
              placeholder="e.g., 30-Day AI Challenge"
            />
          </div>

          <div>
            <label className="block text-xs font-light text-white/60 mb-2 tracking-wider uppercase">
              Description *
            </label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 border border-white/10 rounded-sm bg-white/5 text-white placeholder-white/30 focus:bg-white/10 focus:border-white/20 transition-all"
              placeholder="Describe the challenge and what users will learn..."
            />
          </div>

          <div>
            <label className="block text-xs font-light text-white/60 mb-2 tracking-wider uppercase">
              Duration (days) * <span className="text-white/40 text-xs">(e.g., 7, 30, 90)</span>
            </label>
            <input
              type="number"
              required
              min="1"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 7 })}
              className="w-full px-4 py-2.5 border border-white/10 rounded-sm bg-white/5 text-white focus:bg-white/10 focus:border-white/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-light text-white/60 mb-2 tracking-wider uppercase">
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
              className="w-full px-4 py-2.5 border border-white/10 rounded-sm bg-white/5 text-white focus:bg-white/10 focus:border-white/20 transition-all"
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
              className="h-4 w-4 border-white/10 rounded-sm bg-white/5 focus:ring-white/20"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm font-light text-white">
              Active
            </label>
          </div>

          <div className="border border-white/10 rounded-sm bg-white/5 p-4 mt-4">
            <p className="text-sm font-light text-white/60">
              💡 <span className="text-white font-light">Next Step:</span> After creating, you can add daily lessons and questions for each day.
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-white/5 text-white rounded-sm border border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-300 font-light text-sm tracking-wider uppercase disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Challenge'}
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

