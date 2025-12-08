'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/components/Toast';

export default function AddPromptPage() {
  const router = useRouter();
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [existingCategories, setExistingCategories] = useState<string[]>([]);
  const [existingTools, setExistingTools] = useState<string[]>([]);
  const [genLoading, setGenLoading] = useState(false);
  const [genDescription, setGenDescription] = useState('');
  const [genTone, setGenTone] = useState('friendly');
  const [genLength, setGenLength] = useState<'short' | 'medium' | 'long'>('medium');

  const [form, setForm] = useState({
    title: '',
    subHeading: '',
    category: '',
    application: '',
    tool: '',
    prompt: '',
  });

  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Preload categories/tools so admin can type or pick existing
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await fetch('/api/prompts');
        const data = await res.json();
        if (!isMounted) return;
        if (data.success && Array.isArray(data.data)) {
          const categories = new Set<string>();
          const tools = new Set<string>();
          data.data.forEach((p: { category?: string; tool?: string }) => {
            if (p?.category) categories.add(p.category);
            if (p?.tool) tools.add(p.tool);
          });
          setExistingCategories(Array.from(categories).sort());
          setExistingTools(Array.from(tools).sort());
        }
      } catch (error) {
        console.error('Error loading prompt options', error);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddTag = () => {
    const t = tagInput.trim();
    if (!t) return;
    if (tags.includes(t)) {
      toast.error('Tag already added');
      return;
    }
    setTags([...tags, t]);
    setTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.subHeading || !form.category || !form.tool || !form.prompt) {
      toast.error('Please fill all required fields');
      return;
    }

    setSaving(true);
    const createToastId = toast.loading('Creating prompt...');
    try {
      const res = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          tags,
        }),
      });
      const data = await res.json();
      toast.removeToast(createToastId);
      if (data.success) {
        toast.success('Prompt created');
        router.push('/dashboard/prompts-unified');
      } else {
        toast.error('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error creating prompt:', error);
      toast.removeToast(createToastId);
      toast.error('Error creating prompt');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerate = async () => {
    const desc = genDescription.trim();
    if (!desc) {
      toast.error('Please describe what you need');
      return;
    }
    setGenLoading(true);
    const genToastId = toast.loading('Generating with AI...');
    try {
      const res = await fetch('/api/prompts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: desc,
          tone: genTone,
          length: genLength,
          categoryHint: form.category || undefined,
          toolHint: form.tool || undefined,
        }),
      });
      const data = await res.json();
      toast.removeToast(genToastId);
      if (data.success && data.data) {
        const suggestion = data.data;
        setForm((prev) => ({
          ...prev,
          title: suggestion.title || prev.title,
          subHeading: suggestion.subHeading || prev.subHeading,
          prompt: suggestion.prompt || prev.prompt,
          category: suggestion.category || prev.category,
          tool: suggestion.tool || prev.tool,
        }));
        if (Array.isArray(suggestion.tags) && suggestion.tags.length) {
          // merge unique tags
          const merged = Array.from(new Set([...(tags || []), ...suggestion.tags]));
          setTags(merged);
        }
        toast.success('Filled with AI suggestion. Review before saving.');
      } else {
        toast.error('AI generation failed. Please try again.');
      }
    } catch (error) {
      console.error('Error generating prompt:', error);
      toast.removeToast(genToastId);
      toast.error('Error generating prompt');
    } finally {
      setGenLoading(false);
    }
  };

  return (
    <div className="p-4 min-h-screen" style={{ backgroundColor: '#F5F5DC' }}>
      <div className="max-w-3xl mx-auto">
        <div className="mb-4">
          <Link href="/dashboard/prompts-unified" className="text-black/70 hover:text-black text-xs font-medium">← Back to prompts</Link>
          <h1 className="text-lg font-bold text-black mt-2">➕ Add Prompt</h1>
          <p className="text-xs text-black/70">Create a prompt with custom category and tags.</p>
        </div>

        <div className="bg-white rounded border border-black p-4 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-black font-semibold mb-1 text-xs">Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-2 py-1.5 bg-white border border-black/20 rounded text-black text-xs focus:border-black"
                placeholder="e.g., LinkedIn post prompt"
              />
            </div>

            <div>
              <label className="block text-black font-semibold mb-1 text-xs">Sub Heading *</label>
              <input
                type="text"
                value={form.subHeading}
                onChange={(e) => setForm({ ...form, subHeading: e.target.value })}
                className="w-full px-2 py-1.5 bg-white border border-black/20 rounded text-black text-xs focus:border-black"
                placeholder="Short descriptor"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-black font-semibold mb-1 text-xs">Category (type to create) *</label>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  list="prompt-category-options"
                  className="w-full px-2 py-1.5 bg-white border border-black/20 rounded text-black text-xs focus:border-black"
                  placeholder="e.g., Productivity"
                />
                <datalist id="prompt-category-options">
                  {existingCategories.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="block text-black font-semibold mb-1 text-xs">Tool (type to create) *</label>
                <input
                  type="text"
                  value={form.tool}
                  onChange={(e) => setForm({ ...form, tool: e.target.value })}
                  list="prompt-tool-options"
                  className="w-full px-2 py-1.5 bg-white border border-black/20 rounded text-black text-xs focus:border-black"
                  placeholder="e.g., ChatGPT, MidJourney"
                />
                <datalist id="prompt-tool-options">
                  {existingTools.map((tool) => (
                    <option key={tool} value={tool} />
                  ))}
                </datalist>
              </div>
            </div>

            <div>
              <label className="block text-black font-semibold mb-1 text-xs">Application (optional)</label>
              <input
                type="text"
                value={form.application}
                onChange={(e) => setForm({ ...form, application: e.target.value })}
                className="w-full px-2 py-1.5 bg-white border border-black/20 rounded text-black text-xs focus:border-black"
                placeholder="Sub-category / use-case"
              />
            </div>

            <div>
              <label className="block text-black font-semibold mb-1 text-xs">Prompt Content *</label>
              <textarea
                rows={6}
                value={form.prompt}
                onChange={(e) => setForm({ ...form, prompt: e.target.value })}
                className="w-full px-2 py-1.5 bg-white border border-black/20 rounded text-black text-xs focus:border-black"
                placeholder="Enter the prompt text..."
              />
            </div>

            <div>
              <label className="block text-black font-semibold mb-1 text-xs">Tags</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="flex-1 px-2 py-1.5 bg-white border border-black/20 rounded text-black text-xs focus:border-black"
                  placeholder="Type a tag and press Enter"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-3 py-1.5 bg-black text-white rounded text-xs font-semibold hover:bg-black/90"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1">
                {tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 bg-black text-white rounded text-[11px] font-semibold inline-flex items-center gap-1">
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-white/80 hover:text-white text-[11px]"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* AI Generator */}
            <div className="border border-black/20 rounded bg-black/5 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-black font-semibold text-xs">Generate with OpenAI</p>
                  <p className="text-black/70 text-[11px]">Describe what you want; we’ll prefill fields for you.</p>
                </div>
              </div>
              <textarea
                rows={3}
                value={genDescription}
                onChange={(e) => setGenDescription(e.target.value)}
                className="w-full px-2 py-1.5 bg-white border border-black/20 rounded text-black text-xs focus:border-black placeholder:text-black/50"
                placeholder="e.g., A prompt to craft an engaging LinkedIn post for junior developers about learning Git."
              />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div className="flex flex-col gap-1">
                  <label className="text-black font-semibold text-[11px]">Tone</label>
                  <select
                    value={genTone}
                    onChange={(e) => setGenTone(e.target.value)}
                    className="px-2 py-1.5 bg-white border border-black/20 rounded text-black text-xs focus:border-black"
                    style={{ color: '#000' }}
                  >
                    <option value="friendly">Friendly</option>
                    <option value="professional">Professional</option>
                    <option value="casual">Casual</option>
                    <option value="persuasive">Persuasive</option>
                    <option value="technical">Technical</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-black font-semibold text-[11px]">Length</label>
                  <select
                    value={genLength}
                    onChange={(e) => setGenLength(e.target.value as 'short' | 'medium' | 'long')}
                    className="px-2 py-1.5 bg-white border border-black/20 rounded text-black text-xs focus:border-black"
                    style={{ color: '#000' }}
                  >
                    <option value="short">Short</option>
                    <option value="medium">Medium</option>
                    <option value="long">Long</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={genLoading}
                    className="w-full px-3 py-1.5 bg-black text-white rounded text-xs font-semibold hover:bg-black/90 disabled:opacity-50"
                  >
                    {genLoading ? 'Generating...' : 'Generate with AI'}
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-black/60">
                Uses server-side OpenAI key (no key is exposed). Review and edit before saving.
              </p>
            </div>

            <div className="flex gap-2 pt-2 border-t border-black/10">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-3 py-1.5 bg-black text-white rounded text-xs font-semibold hover:bg-black/90 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Create Prompt'}
              </button>
              <Link
                href="/dashboard/prompts-unified"
                className="px-3 py-1.5 bg-white border border-black/20 text-black rounded text-xs font-semibold hover:bg-black/5"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
