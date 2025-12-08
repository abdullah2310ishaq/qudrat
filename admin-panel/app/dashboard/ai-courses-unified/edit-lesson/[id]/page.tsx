'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/components/Toast';

interface Lesson {
  _id: string;
  aiCourseId: string;
  title: string;
  content: string;
  order: number;
  photos?: string[];
  media?: string[];
  canRead?: boolean;
  canListen?: boolean;
}

// Normalize image src for base64 blobs
function normalizeImageSrc(photo: string): string {
  if (!photo || typeof photo !== 'string') return '';
  if (photo.startsWith('data:image')) return photo;
  if (photo.startsWith('http://') || photo.startsWith('https://')) return photo;
  const trimmed = photo.trim();
  if (trimmed.startsWith('/9j/') || trimmed.startsWith('iVBORw0KGgo')) {
    return trimmed.startsWith('/9j/')
      ? `data:image/jpeg;base64,${trimmed}`
      : `data:image/png;base64,${trimmed}`;
  }
  if (trimmed.match(/^[A-Za-z0-9+/=\s]+$/)) {
    return `data:image/jpeg;base64,${trimmed}`;
  }
  return photo;
}

export default function EditAILessonPage() {
  const { id } = useParams();
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lesson, setLesson] = useState<Lesson>({
    _id: '',
    aiCourseId: '',
    title: '',
    content: '',
    order: 1,
    photos: [],
    media: [],
    canRead: true,
    canListen: false,
  });

  const audioSrc = (lesson.media || []).find((m) => m.startsWith('data:audio'));

  useEffect(() => {
    if (id) {
      fetchLesson();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchLesson = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/aiLessons/${id}`);
      const data = await res.json();
      if (data.success) {
        const l = data.data;
        // Normalize aiCourseId to a string to avoid passing objects to <Link>
        const normalizedCourseId =
          typeof l.aiCourseId === 'string'
            ? l.aiCourseId
            : l.aiCourseId?._id || l.aiCourseId?.toString?.() || '';
        setLesson({
          _id: l._id,
          aiCourseId: normalizedCourseId,
          title: l.title || '',
          content: l.content || '',
          order: l.order || 1,
          photos: l.photos || [],
          media: l.media || [],
          canRead: l.canRead ?? true,
          canListen: l.canListen ?? false,
        });
      } else {
        toast.error('Lesson not found');
        router.push('/dashboard/ai-courses-unified');
      }
    } catch (error) {
      console.error('Error fetching lesson:', error);
      toast.error('Error loading lesson');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('⚠️ Image is too large. Max 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setLesson((prev) => ({ ...prev, photos: [...(prev.photos || []), base64] }));
      toast.success('Image uploaded');
    };
    reader.onerror = () => toast.error('Error reading file');
    reader.readAsDataURL(file);
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error('⚠️ Audio is too large. Max 10MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setLesson((prev) => {
        const otherMedia = (prev.media || []).filter((m) => !m.startsWith('data:audio'));
        return { ...prev, media: [...otherMedia, base64], canListen: true };
      });
      toast.success('Audio uploaded');
    };
    reader.onerror = () => toast.error('Error reading file');
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lesson.title || !lesson.content) {
      toast.error('Please fill required fields');
      return;
    }
    setSaving(true);
    const saveToastId = toast.loading('Saving lesson...');
    try {
      const res = await fetch(`/api/aiLessons/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: lesson.title,
          content: lesson.content,
          order: lesson.order,
          photos: lesson.photos || [],
          media: lesson.media || [],
          canRead: lesson.canRead,
          canListen: lesson.canListen,
        }),
      });
      const data = await res.json();
      toast.removeToast(saveToastId);
      if (data.success) {
        toast.success('Lesson updated');
        if (lesson.aiCourseId) {
          router.push(`/dashboard/ai-courses-unified/view/${lesson.aiCourseId}`);
        } else {
          router.push('/dashboard/ai-courses-unified');
        }
      } else {
        toast.error('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error saving lesson:', error);
      toast.removeToast(saveToastId);
      toast.error('Error saving lesson');
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
          <Link
            href={lesson.aiCourseId ? `/dashboard/ai-courses-unified/view/${lesson.aiCourseId}` : '/dashboard/ai-courses-unified'}
            className="text-black/70 hover:text-black text-xs font-medium"
          >
            ← Back to AI course
          </Link>
          <h1 className="text-lg font-bold text-black mt-2">✏️ Edit AI Lesson</h1>
          <p className="text-xs text-black/70">Update lesson details, media, and access flags.</p>
        </div>

        <div className="bg-white rounded border border-black/15 p-4 shadow-sm">
          <form onSubmit={handleSave} className="space-y-3">
            <div>
              <label className="block text-black font-semibold mb-1 text-xs">Title *</label>
              <input
                type="text"
                value={lesson.title}
                onChange={(e) => setLesson({ ...lesson, title: e.target.value })}
                className="w-full px-2 py-1.5 bg-white border border-black/20 rounded text-black text-xs focus:border-black"
              />
            </div>
            <div>
              <label className="block text-black font-semibold mb-1 text-xs">Content *</label>
              <textarea
                rows={4}
                value={lesson.content}
                onChange={(e) => setLesson({ ...lesson, content: e.target.value })}
                className="w-full px-2 py-1.5 bg-white border border-black/20 rounded text-black text-xs focus:border-black"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-black font-semibold mb-1 text-xs">Order</label>
                <input
                  type="number"
                  value={lesson.order}
                  onChange={(e) => setLesson({ ...lesson, order: parseInt(e.target.value) || 1 })}
                  className="w-full px-2 py-1.5 bg-white border border-black/20 rounded text-black text-xs focus:border-black"
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs font-semibold text-black">
                  <input
                    type="checkbox"
                    checked={lesson.canRead}
                    onChange={(e) => setLesson({ ...lesson, canRead: e.target.checked })}
                    className="w-4 h-4"
                  />
                  Can Read
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-black">
                  <input
                    type="checkbox"
                    checked={lesson.canListen}
                    onChange={(e) => setLesson({ ...lesson, canListen: e.target.checked })}
                    className="w-4 h-4"
                  />
                  Can Listen
                </label>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <label className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded text-blue-700 text-xs font-semibold cursor-pointer hover:bg-blue-100">
                📷 Add Image
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
              <label className="px-3 py-1.5 bg-green-50 border border-green-200 rounded text-green-700 text-xs font-semibold cursor-pointer hover:bg-green-100">
                🎵 Add Audio
                <input type="file" accept="audio/*" onChange={handleAudioUpload} className="hidden" />
              </label>
            </div>

            {lesson.photos && lesson.photos.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {lesson.photos.map((photo, idx) => (
                  <div key={idx} className="relative">
                    <img
                      src={normalizeImageSrc(photo)}
                      alt={`Photo ${idx + 1}`}
                      className="w-16 h-16 object-cover rounded border border-black/15"
                      onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setLesson((prev) => ({
                          ...prev,
                          photos: (prev.photos || []).filter((_, i) => i !== idx),
                        }))
                      }
                      className="absolute -top-1 -right-1 bg-red-600 text-white text-[11px] w-4 h-4 rounded-full flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {audioSrc && (
              <div className="space-y-1">
                <audio controls src={audioSrc} className="w-full h-8" />
                <button
                  type="button"
                  onClick={() =>
                    setLesson((prev) => ({
                      ...prev,
                      media: (prev.media || []).filter((m) => !m.startsWith('data:audio')),
                      canListen: false,
                    }))
                  }
                  className="px-2 py-1 bg-red-600 text-white rounded text-xs font-semibold hover:bg-red-700"
                >
                  Remove Audio
                </button>
              </div>
            )}

            <div className="flex gap-2 pt-2 border-t border-black/10">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-3 py-1.5 bg-black text-white rounded text-xs font-semibold hover:bg-black/90 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Lesson'}
              </button>
              <Link
                href={lesson.aiCourseId ? `/dashboard/ai-courses-unified/view/${lesson.aiCourseId}` : '/dashboard/ai-courses-unified'}
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

