'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewPromptPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subHeading: '',
    category: 'basic_applications' as 'basic_applications' | 'productivity' | 'sales' | 'ecommerce' | 'investing' | 'web_dev' | 'customer_support' | 'cro' | 'daily_life' | 'tech' | 'education',
    application: '',
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
      <div className="mb-12">
        <h1 className="text-5xl font-thin text-white mb-3 tracking-tight">Add New Prompt</h1>
        <div className="w-16 h-px bg-white/20 mb-4"></div>
        <p className="text-sm font-light text-white/60 tracking-wide">Create a new AI prompt for your users</p>
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
              placeholder="e.g., LinkedIn Post Prompt"
            />
          </div>

          <div>
            <label className="block text-xs font-light text-white/60 mb-2 tracking-wider uppercase">
              Sub Heading *
            </label>
            <input
              type="text"
              required
              value={formData.subHeading}
              onChange={(e) => setFormData({ ...formData, subHeading: e.target.value })}
              className="w-full px-4 py-2.5 border border-white/10 rounded-sm bg-white/5 text-white placeholder-white/30 focus:bg-white/10 focus:border-white/20 transition-all"
              placeholder="e.g., Professional AI Prompt"
            />
          </div>

          <div>
            <label className="block text-xs font-light text-white/60 mb-2 tracking-wider uppercase">
              Category *
            </label>
            <select
              required
              value={formData.category}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  category: e.target.value as 'basic_applications' | 'productivity' | 'sales' | 'ecommerce' | 'investing' | 'web_dev' | 'customer_support' | 'cro' | 'daily_life' | 'tech' | 'education',
                })
              }
              className="w-full px-4 py-2.5 border border-white/10 rounded-sm bg-white/5 text-white focus:bg-white/10 focus:border-white/20 transition-all"
            >
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
          </div>

          <div>
            <label className="block text-xs font-light text-white/60 mb-2 tracking-wider uppercase">
              Application <span className="text-white/40 text-xs">(Optional - Sub-category/Application name)</span>
            </label>
            <input
              type="text"
              value={formData.application}
              onChange={(e) => setFormData({ ...formData, application: e.target.value })}
              className="w-full px-4 py-2.5 border border-white/10 rounded-sm bg-white/5 text-white placeholder-white/30 focus:bg-white/10 focus:border-white/20 transition-all"
              placeholder="e.g., Leveraging Customer Data Analytics"
            />
            <p className="text-xs text-white/40 mt-1">Leave empty if prompt is directly under category</p>
          </div>

          <div>
            <label className="block text-xs font-light text-white/60 mb-2 tracking-wider uppercase">
              Tool *
            </label>
            <input
              type="text"
              required
              value={formData.tool}
              onChange={(e) => setFormData({ ...formData, tool: e.target.value })}
              className="w-full px-4 py-2.5 border border-white/10 rounded-sm bg-white/5 text-white placeholder-white/30 focus:bg-white/10 focus:border-white/20 transition-all"
              placeholder="e.g., ChatGPT, MidJourney, DALL-E"
            />
          </div>

          <div>
            <label className="block text-xs font-light text-white/60 mb-2 tracking-wider uppercase">
              Prompt Content *
            </label>
            <textarea
              required
              rows={6}
              value={formData.prompt}
              onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
              className="w-full px-4 py-2.5 border border-white/10 rounded-sm bg-white/5 text-white placeholder-white/30 focus:bg-white/10 focus:border-white/20 transition-all"
              placeholder="Enter the prompt text here..."
            />
          </div>

          <div>
            <label className="block text-xs font-light text-white/60 mb-2 tracking-wider uppercase">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-4 py-2.5 border border-white/10 rounded-sm bg-white/5 text-white placeholder-white/30 focus:bg-white/10 focus:border-white/20 transition-all"
              placeholder="e.g., social-media, professional, ai"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-white/5 text-white rounded-sm border border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-300 font-light text-sm tracking-wider uppercase disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Prompt'}
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

