'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Prompt {
  _id: string;
  title: string;
  subHeading: string;
  category: 'basic_applications' | 'productivity' | 'sales' | 'ecommerce' | 'investing' | 'web_dev' | 'customer_support' | 'cro' | 'daily_life' | 'tech' | 'education';
  application?: string;
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
    category: 'basic_applications',
    application: '',
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
          <div className="animate-spin rounded-full h-8 w-8 border border-white/20 border-t-white/60"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-black">
      <div className="mb-12">
        <h1 className="text-5xl font-thin text-white mb-3 tracking-tight">Edit Prompt</h1>
        <div className="w-16 h-px bg-white/20 mb-4"></div>
        <p className="text-sm font-light text-white/60 tracking-wide">Update prompt details and content</p>
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
              value={formData.application || ''}
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
            />
          </div>

          <div>
            <label className="block text-xs font-light text-white/60 mb-2 tracking-wider uppercase">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full px-4 py-2.5 border border-white/10 rounded-sm bg-white/5 text-white placeholder-white/30 focus:bg-white/10 focus:border-white/20 transition-all"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-white/5 text-white rounded-sm border border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-300 font-light text-sm tracking-wider uppercase disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Changes'}
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

