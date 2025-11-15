'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Prompt {
  _id: string;
  title: string;
  subHeading: string;
  category: 'Life' | 'Business' | 'Creativity' | 'Work';
  tool: string;
  prompt: string;
  tags: string[];
  createdAt: string;
}

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ tool: '', category: '' });

  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        let url = '/api/prompts';
        const params = new URLSearchParams();
        if (filter.tool) params.append('tool', filter.tool);
        if (filter.category) params.append('category', filter.category);
        if (params.toString()) url += '?' + params.toString();

        const res = await fetch(url);
        const data = await res.json();
        if (data.success) {
          setPrompts(data.data || []);
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error fetching prompts:', errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchPrompts();
  }, [filter]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this prompt?')) return;

    try {
      const res = await fetch(`/api/prompts/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        fetchPrompts();
      } else {
        alert('Error deleting prompt: ' + data.error);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error deleting prompt:', errorMessage);
      alert('Error deleting prompt: ' + errorMessage);
    }
  };

  return (
    <div className="p-8 bg-black">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Prompt Library
          </h1>
          <p className="text-zinc-400">Manage AI prompts for your users</p>
        </div>
        <Link
          href="/dashboard/prompts/new"
          className="px-6 py-3 bg-white text-black rounded-xl hover:bg-zinc-200 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
        >
          + Add Prompt
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800 p-6 mb-6 flex gap-4">
        <select
          value={filter.tool}
          onChange={(e) => setFilter({ ...filter, tool: e.target.value })}
          className="px-4 py-2 border border-zinc-700 rounded-xl bg-zinc-800 text-white focus:ring-2 focus:ring-white focus:border-white transition-all"
        >
          <option value="">All Tools</option>
          <option value="ChatGPT">ChatGPT</option>
          <option value="MidJourney">MidJourney</option>
          <option value="DALL-E">DALL-E</option>
          <option value="Jasper AI">Jasper AI</option>
        </select>
        <select
          value={filter.category}
          onChange={(e) => setFilter({ ...filter, category: e.target.value })}
          className="px-4 py-2 border border-zinc-700 rounded-xl bg-zinc-800 text-white focus:ring-2 focus:ring-white focus:border-white transition-all"
        >
          <option value="">All Categories</option>
          <option value="Life">Life</option>
          <option value="Business">Business</option>
          <option value="Creativity">Creativity</option>
          <option value="Work">Work</option>
        </select>
        <button
          onClick={() => setFilter({ tool: '', category: '' })}
          className="px-4 py-2 bg-zinc-800 text-white rounded-xl hover:bg-zinc-700 transition-all font-medium border border-zinc-700"
        >
          Clear Filters
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      ) : prompts.length === 0 ? (
        <div className="text-center py-20 bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800">
          <div className="text-6xl mb-4">💡</div>
          <p className="text-zinc-400 mb-4 text-lg">No prompts found</p>
          <Link
            href="/dashboard/prompts/new"
            className="inline-block px-6 py-3 bg-white text-black rounded-xl hover:bg-zinc-200 transition-all shadow-lg hover:shadow-xl font-semibold"
          >
            Add your first prompt
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prompts.map((prompt) => (
            <div key={prompt._id} className="group bg-zinc-900 rounded-2xl shadow-2xl hover:shadow-white/10 transition-all duration-300 p-6 border border-zinc-800 hover:border-white/20 transform hover:scale-105">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-bold text-white group-hover:text-white transition-colors">{prompt.title}</h3>
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-zinc-800 text-white border border-zinc-700">
                  {prompt.tool}
                </span>
              </div>
              <p className="text-sm text-zinc-400 mb-2 font-medium">{prompt.subHeading}</p>
              <p className="text-sm text-zinc-300 mb-4 line-clamp-3">{prompt.prompt}</p>
              <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {prompt.category}
                </span>
                <div className="flex gap-3">
                  <Link
                    href={`/dashboard/prompts/${prompt._id}`}
                    className="text-white hover:text-zinc-300 text-sm font-semibold hover:underline"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(prompt._id)}
                    className="text-red-400 hover:text-red-300 text-sm font-semibold hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

