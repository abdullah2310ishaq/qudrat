'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Prompt {
  _id: string;
  title: string;
  subHeading: string;
  category: 'Life' | 'Business' | 'Creativity' | 'Work';
  tool: string;
  prompt: string;
  tags: string[];
}

export default function EditPromptPage() {
  const router = useRouter();
  const params = useParams();
  const promptId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Prompt>({
    _id: '',
    title: '',
    subHeading: '',
    category: 'Life',
    tool: '',
    prompt: '',
    tags: [],
  });
  const [tagsInput, setTagsInput] = useState('');

  useEffect(() => {
    if (promptId) {
      const fetchPrompt = async () => {
        try {
          const res = await fetch(`/api/prompts/${promptId}`);
          const data = await res.json();
          if (data.success) {
            setFormData(data.data);
            setTagsInput(Array.isArray(data.data.tags) ? data.data.tags.join(', ') : '');
          } else {
            alert('Prompt not found');
            router.push('/dashboard/prompts');
          }
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error('Error fetching prompt:', errorMessage);
          alert('Error loading prompt: ' + errorMessage);
        } finally {
          setLoading(false);
        }
      };
      fetchPrompt();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [promptId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const tagsArray = tagsInput
        .split(',')
        .map((tag: string) => tag.trim())
        .filter((tag: string) => tag.length > 0);

      const res = await fetch(`/api/prompts/${promptId}`, {
        method: 'PUT',
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
        alert('Error updating prompt: ' + data.error);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error updating prompt:', errorMessage);
      alert('Error updating prompt: ' + errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 bg-black">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-black">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Edit Prompt</h1>
        <p className="text-zinc-400">Update prompt details and content</p>
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
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:ring-2 focus:ring-white focus:border-white transition-all"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-white text-black rounded-xl hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
            >
              {saving ? 'Saving...' : 'Save Changes'}
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

