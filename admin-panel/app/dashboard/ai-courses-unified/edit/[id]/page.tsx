'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/components/Toast';

interface AICourse {
  _id: string;
  title: string;
  heading: string;
  subHeading?: string;
  aiTool: string;
  category?: string;
  coverImage?: string;
  isActive: boolean;
}

export default function EditAICoursePage() {
  const { id } = useParams();
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<AICourse>({
    _id: '',
    title: '',
    heading: '',
    subHeading: '',
    aiTool: '',
    category: '',
    coverImage: '',
    isActive: true,
  });

  useEffect(() => {
    if (id) {
      fetchCourse();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchCourse = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/aiCourses/${id}`);
      const data = await res.json();
      if (data.success) {
        setForm({
          _id: data.data._id,
          title: data.data.title || '',
          heading: data.data.heading || '',
          subHeading: data.data.subHeading || '',
          aiTool: data.data.aiTool || '',
          category: data.data.category || '',
          coverImage: data.data.coverImage || '',
          isActive: data.data.isActive ?? true,
        });
      } else {
        toast.error('AI course not found');
        router.push('/dashboard/ai-courses-unified');
      }
    } catch (error) {
      console.error('Error fetching AI course:', error);
      toast.error('Error loading course');
    } finally {
      setLoading(false);
    }
  };

  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('⚠️ Image is too large. Max 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setForm({ ...form, coverImage: base64 });
      toast.success('Image uploaded');
    };
    reader.onerror = () => toast.error('Error reading file');
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.heading || !form.aiTool) {
      toast.error('Please fill required fields');
      return;
    }
    setSaving(true);
    const saveToastId = toast.loading('Saving...');
    try {
      const res = await fetch(`/api/aiCourses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          heading: form.heading,
          subHeading: form.subHeading,
          aiTool: form.aiTool,
          category: form.category,
          coverImage: form.coverImage,
          isActive: form.isActive,
        }),
      });
      const data = await res.json();
      toast.removeToast(saveToastId);
      if (data.success) {
        toast.success('Course updated');
        router.push(`/dashboard/ai-courses-unified/view/${id}`);
      } else {
        toast.error('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error saving course:', error);
      toast.removeToast(saveToastId);
      toast.error('Error saving course');
    } finally {
      setSaving(false);
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
      <div className="max-w-3xl mx-auto">
        <div className="mb-4">
          <Link href={`/dashboard/ai-courses-unified/view/${id}`} className="text-black/70 hover:text-black text-xs font-medium">
            ← Back to AI course
          </Link>
          <h1 className="text-lg font-bold text-black mt-2">✏️ Edit AI Course</h1>
          <p className="text-xs text-black/70">Update course details. Lessons are managed from the course view page.</p>
        </div>

        <div className="bg-white rounded border border-black/15 p-4 shadow-sm">
          <form onSubmit={handleSave} className="space-y-3">
            <div>
              <label className="block text-black font-semibold mb-1 text-xs">Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-2 py-1.5 bg-white border border-black/20 rounded text-black text-xs focus:border-black"
              />
            </div>
            <div>
              <label className="block text-black font-semibold mb-1 text-xs">Heading *</label>
              <input
                type="text"
                value={form.heading}
                onChange={(e) => setForm({ ...form, heading: e.target.value })}
                className="w-full px-2 py-1.5 bg-white border border-black/20 rounded text-black text-xs focus:border-black"
              />
            </div>
            <div>
              <label className="block text-black font-semibold mb-1 text-xs">Sub Heading</label>
              <input
                type="text"
                value={form.subHeading || ''}
                onChange={(e) => setForm({ ...form, subHeading: e.target.value })}
                className="w-full px-2 py-1.5 bg-white border border-black/20 rounded text-black text-xs focus:border-black"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-black font-semibold mb-1 text-xs">AI Tool *</label>
                <input
                  type="text"
                  value={form.aiTool}
                  onChange={(e) => setForm({ ...form, aiTool: e.target.value })}
                  className="w-full px-2 py-1.5 bg-white border border-black/20 rounded text-black text-xs focus:border-black"
                  placeholder="e.g., ChatGPT, MidJourney"
                />
              </div>
              <div>
                <label className="block text-black font-semibold mb-1 text-xs">Category</label>
                <input
                  type="text"
                  value={form.category || ''}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-2 py-1.5 bg-white border border-black/20 rounded text-black text-xs focus:border-black"
                  placeholder="Optional category"
                />
              </div>
            </div>
            <div>
              <label className="block text-black font-semibold mb-1 text-xs">Cover Image</label>
              <div className="flex items-center gap-2">
                <label className="px-3 py-1.5 bg-black text-white rounded text-xs font-semibold cursor-pointer hover:bg-black/90">
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverImageUpload}
                    className="hidden"
                  />
                </label>
                {form.coverImage && (
                  <span className="text-xs text-black/70">Image selected</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="isActive" className="text-black text-xs font-semibold">Active</label>
            </div>
            <div className="flex gap-2 pt-2 border-t border-black/10">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-3 py-1.5 bg-black text-white rounded text-xs font-semibold hover:bg-black/90 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <Link
                href={`/dashboard/ai-courses-unified/view/${id}`}
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

