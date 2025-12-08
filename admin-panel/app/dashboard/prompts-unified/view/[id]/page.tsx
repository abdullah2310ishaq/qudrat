'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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

export default function ViewPromptPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const promptId = params.id as string;

  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (promptId) fetchPrompt();
  }, [promptId]);

  const fetchPrompt = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/prompts/${promptId}`);
      const data = await res.json();
      if (data.success) {
        setPrompt(data.data);
      } else {
        toast.error('Prompt not found');
        router.push('/dashboard/prompts-unified');
      }
    } catch (error) {
      console.error('Error fetching prompt:', error);
      toast.error('Error loading prompt');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!prompt) return;
    try {
      await navigator.clipboard.writeText(prompt.prompt);
      toast.success('Prompt copied');
    } catch (error) {
      console.error('Clipboard error:', error);
      toast.error('Failed to copy');
    }
  };

  const handleDelete = async () => {
    if (!prompt) return;
    if (!confirm(`Delete prompt "${prompt.title}"?`)) return;
    setDeleting(true);
    const deleteToastId = toast.loading('Deleting prompt...');
    try {
      const res = await fetch(`/api/prompts/${promptId}`, { method: 'DELETE' });
      const data = await res.json();
      toast.removeToast(deleteToastId);
      if (data.success) {
        toast.success('Deleted');
        router.push('/dashboard/prompts-unified');
      } else {
        toast.error('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting prompt:', error);
      toast.removeToast(deleteToastId);
      toast.error('Error deleting prompt');
    } finally {
      setDeleting(false);
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

  if (!prompt) {
    return (
      <div className="p-4 min-h-screen" style={{ backgroundColor: '#F5F5DC' }}>
        <div className="text-center py-20">
          <p className="text-black text-xl font-bold mb-4">Prompt not found</p>
          <Link href="/dashboard/prompts-unified" className="px-4 py-2 bg-black text-white rounded text-sm font-semibold">Back to prompts</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 min-h-screen" style={{ backgroundColor: '#F5F5DC' }}>
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-start mb-3">
          <div>
            <Link href="/dashboard/prompts-unified" className="text-black/70 hover:text-black text-xs font-medium">← Back to prompts</Link>
            <h1 className="text-lg font-bold text-black mt-1">{prompt.title}</h1>
            <p className="text-xs text-black/70">{prompt.subHeading}</p>
          </div>
          <div className="flex gap-1.5">
            <Link
              href={`/dashboard/prompts-unified/edit/${promptId}`}
              className="px-3 py-1.5 bg-white border border-black text-black rounded text-xs font-semibold hover:bg-black/5"
            >
              Edit
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-3 py-1.5 bg-red-600 text-white rounded text-xs font-semibold hover:bg-red-700 disabled:opacity-50"
            >
              {deleting ? '⏳' : 'Delete'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded border border-black p-4 shadow-sm space-y-3">
          <div className="flex flex-wrap gap-2 text-[11px] font-semibold">
            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 border border-amber-200 rounded">{prompt.category}</span>
            {prompt.application && (
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 border border-blue-200 rounded">{prompt.application}</span>
            )}
            <span className="px-2 py-0.5 bg-black text-white rounded">{prompt.tool}</span>
            <span className="px-2 py-0.5 bg-black/5 border border-black/10 rounded text-black/70">Tags: {prompt.tags?.length || 0}</span>
          </div>

          {prompt.tags && prompt.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {prompt.tags.map((tag, idx) => (
                <span key={idx} className="px-2 py-0.5 bg-black/5 border border-black/10 rounded text-[11px] text-black/70">#{tag}</span>
              ))}
            </div>
          )}

          <div className="border border-black/20 rounded bg-cream-50 p-3">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-bold text-black">Prompt</h3>
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-1 bg-black text-white rounded text-xs font-semibold hover:bg-black/90"
              >
                Copy
              </button>
            </div>
            <p className="text-black/80 text-sm whitespace-pre-wrap">{prompt.prompt}</p>
          </div>

          <p className="text-[11px] text-black/60">Created: {new Date(prompt.createdAt).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
