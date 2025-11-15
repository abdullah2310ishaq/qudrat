'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewPromptPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subHeading: '',
    category: 'Life' as 'Life' | 'Business' | 'Creativity' | 'Work',
    tool: 'ChatGPT',
    prompt: '',
    tags: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const tagsArray = formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const res = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: tagsArray,
        }),
      });

      const data = await res.json();
      if (data.success) {
        router.push('/dashboard/prompts');
      } else {
        alert('Error creating prompt: ' + data.error);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error creating prompt:', errorMessage);
      alert('Error creating prompt: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-black">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Add New Prompt</h1>
        <p className="text-zinc-400">Create a new AI prompt for your users</p>
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
              placeholder="e.g., LinkedIn Post Prompt"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Sub Heading *
            </label>
            <input
              type="text"
              required
              value={formData.subHeading}
              onChange={(e) => setFormData({ ...formData, subHeading: e.target.value })}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:ring-2 focus:ring-white focus:border-white transition-all"
              placeholder="e.g., Professional AI Prompt"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Category *
            </label>
            <select
              required
              value={formData.category}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  category: e.target.value as 'Life' | 'Business' | 'Creativity' | 'Work',
                })
              }
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:ring-2 focus:ring-white focus:border-white transition-all"
            >
              <option value="Life">Life</option>
              <option value="Business">Business</option>
              <option value="Creativity">Creativity</option>
              <option value="Work">Work</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Tool *
            </label>
            <input
              type="text"
              required
              value={formData.tool}
              onChange={(e) => setFormData({ ...formData, tool: e.target.value })}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:ring-2 focus:ring-white focus:border-white transition-all"
              placeholder="e.g., ChatGPT, MidJourney, DALL-E"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Prompt Content *
            </label>
            <textarea
              required
              rows={6}
              value={formData.prompt}
              onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:ring-2 focus:ring-white focus:border-white transition-all"
              placeholder="Enter the prompt text here..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:ring-2 focus:ring-white focus:border-white transition-all"
              placeholder="e.g., social-media, professional, ai"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-white text-black rounded-xl hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
            >
              {loading ? 'Creating...' : 'Create Prompt'}
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

