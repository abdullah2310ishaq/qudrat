'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useToast } from '@/components/Toast';

interface Prompt {
  _id: string;
  title: string;
  subHeading: string;
  category: string;
  application?: string;
  tool: string;
  prompt: string;
  tags: string[];
  createdAt: string;
}

export default function PromptsUnifiedPage() {
  const toast = useToast();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [filtered, setFiltered] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [toolFilter, setToolFilter] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPrompts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [search, categoryFilter, toolFilter, prompts]);

  const fetchPrompts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/prompts');
      const data = await res.json();
      if (data.success) {
        setPrompts(data.data || []);
        setFiltered(data.data || []);
      } else {
        toast.error('Failed to load prompts');
      }
    } catch (error) {
      console.error('Error fetching prompts:', error);
      toast.error('Error fetching prompts');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    const q = search.trim().toLowerCase();
    const filteredList = prompts.filter((p) => {
      const matchesSearch = !q
        || p.title.toLowerCase().includes(q)
        || p.subHeading.toLowerCase().includes(q)
        || p.prompt.toLowerCase().includes(q)
        || (p.application || '').toLowerCase().includes(q)
        || (p.tags || []).some((tag) => tag.toLowerCase().includes(q));
      const matchesCategory = !categoryFilter || p.category === categoryFilter;
      const matchesTool = !toolFilter || p.tool === toolFilter;
      return matchesSearch && matchesCategory && matchesTool;
    });
    setFiltered(filteredList);
  };

  const uniqueCategories = useMemo(() => {
    const set = new Set<string>();
    prompts.forEach((p) => p.category && set.add(p.category));
    return Array.from(set).sort();
  }, [prompts]);

  const uniqueTools = useMemo(() => {
    const set = new Set<string>();
    prompts.forEach((p) => p.tool && set.add(p.tool));
    return Array.from(set).sort();
  }, [prompts]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete prompt "${title}"?`)) return;
    setDeletingId(id);
    const deleteToastId = toast.loading('Deleting prompt...');
    try {
      const res = await fetch(`/api/prompts/${id}`, { method: 'DELETE' });
      const data = await res.json();
      toast.removeToast(deleteToastId);
      if (data.success) {
        toast.success('Deleted');
        fetchPrompts();
      } else {
        toast.error('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting prompt:', error);
      toast.removeToast(deleteToastId);
      toast.error('Error deleting prompt');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-4 min-h-screen" style={{ backgroundColor: '#F5F5DC' }}>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-black/20 border-t-black"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 min-h-screen" style={{ backgroundColor: '#F5F5DC' }}>
      {/* Header */}
      <div className="mb-4 flex flex-col gap-1">
        <h1 className="text-xl font-bold text-black">💡 Prompt Library</h1>
        <p className="text-xs text-black/70">Manage prompts with categories and tags, all in one place.</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded border border-black/20 p-3 mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Search title, content, tags..."
          className="flex-1 px-3 py-1.5 bg-white border border-black/20 rounded text-black focus:border-black text-xs placeholder:text-black/50"
          style={{ color: '#000' }}
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-1.5 bg-white border border-black/20 rounded text-black focus:border-black text-xs"
          style={{ color: '#000' }}
        >
          <option value="">All Categories</option>
          {uniqueCategories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select
          value={toolFilter}
          onChange={(e) => setToolFilter(e.target.value)}
          className="px-3 py-1.5 bg-white border border-black/20 rounded text-black focus:border-black text-xs"
          style={{ color: '#000' }}
        >
          <option value="">All Tools</option>
          {uniqueTools.map((tool) => (
            <option key={tool} value={tool}>{tool}</option>
          ))}
        </select>
        <div className="flex gap-2">
          <button
            onClick={() => { setSearch(''); setCategoryFilter(''); setToolFilter(''); setFiltered(prompts); }}
            className="px-3 py-1.5 bg-white border border-black/20 rounded text-black text-xs font-semibold hover:bg-black/5"
          >
            Clear
          </button>
          <Link
            href="/dashboard/prompts-unified/add"
            className="px-3 py-1.5 bg-black text-white rounded text-xs font-semibold hover:bg-black/90"
          >
            ➕ Add Prompt
          </Link>
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-10 bg-white rounded border border-black/20">
          <div className="text-3xl mb-2">💡</div>
          <p className="text-black font-bold text-sm mb-1">No prompts found</p>
          <p className="text-black/60 text-xs mb-3">Try adjusting filters or add a new prompt.</p>
          <Link
            href="/dashboard/prompts-unified/add"
            className="inline-block px-4 py-1.5 bg-black text-white rounded text-xs font-semibold hover:bg-black/90"
          >
            Create Prompt
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map((p) => (
            <div key={p._id} className="bg-white rounded border border-black/20 hover:shadow-md transition-all overflow-hidden">
                <div className="p-3 flex flex-col gap-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-black truncate" title={p.title}>{p.title}</h3>
                    </div>
                  </div>
                  <div className="flex items-center justify-start text-[11px] font-semibold gap-2">
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 border border-amber-200 rounded" title={p.category}>{p.category}</span>
                  </div>
                  <div className="flex gap-1.5 pt-2 border-t border-black/10 text-xs font-semibold">
                  <Link
                    href={`/dashboard/prompts-unified/view/${p._id}`}
                    className="flex-1 px-2 py-1 bg-black text-white rounded text-center hover:bg-black/90"
                  >
                    View
                  </Link>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.location.href = `/dashboard/prompts-unified/edit/${p._id}`;
                    }}
                    className="flex-1 px-2 py-1 bg-white border border-black text-black rounded hover:bg-black/5"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(p._id, p.title); }}
                    disabled={deletingId === p._id}
                    className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    {deletingId === p._id ? '⏳' : '🗑️'}
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
