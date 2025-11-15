'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Prompt {
  _id: string;
  title: string;
  subHeading: string;
  category: 'basic_applications' | 'productivity' | 'sales' | 'ecommerce' | 'investing' | 'web_dev' | 'customer_support' | 'cro' | 'daily_life' | 'tech' | 'education';
  tool: string;
  prompt: string;
  tags: string[];
  createdAt: string;
}

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ tool: '', category: '' });

  const fetchPrompts = async () => {
    try {
      setLoading(true);
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

  useEffect(() => {
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
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-5xl font-thin text-white mb-3 tracking-tight">Prompt Library</h1>
          <div className="w-16 h-px bg-white/20 mb-4"></div>
          <p className="text-sm font-light text-white/60 tracking-wide">Manage AI prompts for your users</p>
        </div>
        <Link
          href="/dashboard/prompts/new"
          className="px-6 py-2.5 bg-white/5 text-white rounded-sm border border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-300 font-light text-sm tracking-wider uppercase"
        >
          + Add Prompt
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-black/40 rounded-sm border border-white/10 p-6 mb-6 flex gap-4">
        <select
          value={filter.tool}
          onChange={(e) => setFilter({ ...filter, tool: e.target.value })}
          className="px-4 py-2.5 border border-white/10 rounded-sm bg-white/5 text-white focus:bg-white/10 focus:border-white/20 transition-all font-light text-sm"
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
          className="px-4 py-2.5 border border-white/10 rounded-sm bg-white/5 text-white focus:bg-white/10 focus:border-white/20 transition-all font-light text-sm"
        >
          <option value="">All Categories</option>
          <option value="basic_applications">Basic Applications</option>
          <option value="productivity">Productivity</option>
          <option value="sales">Sales</option>
          <option value="ecommerce">E-commerce</option>
          <option value="investing">Investing</option>
          <option value="web_dev">Web Development</option>
          <option value="customer_support">Customer Support</option>
          <option value="cro">Conversion Rate Optimization</option>
          <option value="daily_life">Daily Life</option>
          <option value="tech">Tech</option>
          <option value="education">Education</option>
        </select>
        <button
          onClick={() => setFilter({ tool: '', category: '' })}
          className="px-4 py-2.5 bg-white/5 text-white rounded-sm hover:bg-white/10 text-xs font-light tracking-wider uppercase border border-white/10 hover:border-white/20 transition-all"
        >
          Clear Filters
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border border-white/20 border-t-white/60"></div>
        </div>
      ) : prompts.length === 0 ? (
        <div className="text-center py-20 bg-black/40 rounded-sm border border-white/10">
          <div className="text-5xl mb-4 opacity-70">💡</div>
          <p className="text-sm font-light text-white/60 mb-6 tracking-wide">No prompts found</p>
          <Link
            href="/dashboard/prompts/new"
            className="inline-block px-6 py-2.5 bg-white/5 text-white rounded-sm border border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-300 font-light text-sm tracking-wider uppercase"
          >
            Add your first prompt
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {prompts.map((prompt) => (
            <div key={prompt._id} className="group bg-black/40 rounded-sm border border-white/10 hover:border-white/20 transition-all duration-300 p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-base font-light text-white flex-1 pr-2">{prompt.title}</h3>
                <span className="px-2.5 py-1 text-xs font-light rounded-sm bg-white/5 text-white/80 border border-white/10">
                  {prompt.tool}
                </span>
              </div>
              <p className="text-xs font-light text-white/60 mb-2">{prompt.subHeading}</p>
              <p className="text-xs font-light text-white/50 mb-4 line-clamp-3">{prompt.prompt}</p>
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <span className="px-2.5 py-1 text-xs font-light rounded-sm bg-white/5 text-white/60 border border-white/10">
                  {prompt.category}
                </span>
                <div className="flex gap-4">
                  <Link
                    href={`/dashboard/prompts/${prompt._id}`}
                    className="text-white/60 hover:text-white text-xs font-light tracking-wide transition-colors"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(prompt._id)}
                    className="text-white/40 hover:text-red-400/80 text-xs font-light tracking-wide transition-colors"
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

