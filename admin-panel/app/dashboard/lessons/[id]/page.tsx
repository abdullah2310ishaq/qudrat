'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface Lesson {
  _id: string;
  courseId: string;
  title: string;
  content: string;
  media?: string[];
  photos?: string[];
  order: number;
  isInteractive: boolean;
  questions?: Array<{
    question: string;
    options: string[];
    correctAnswer: number;
  }>;
  canRead?: boolean;
  canListen?: boolean;
}

export default function EditLessonPage() {
  const router = useRouter();
  const params = useParams();
  const lessonId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Lesson>({
    _id: '',
    courseId: '',
    title: '',
    content: '',
    media: [],
    photos: [],
    order: 0,
    isInteractive: false,
    questions: [],
    canRead: true,
    canListen: false,
  });
  const [mediaInput, setMediaInput] = useState('');

  useEffect(() => {
    if (lessonId) {
      fetchLesson();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  const fetchLesson = async () => {
    try {
      const res = await fetch(`/api/lessons/${lessonId}`);
      const data = await res.json();
      if (data.success) {
        const lesson = data.data;
        setFormData({
          ...lesson,
          media: lesson.media || [],
          photos: lesson.photos || [],
          questions: lesson.questions || [],
        });
        setMediaInput(Array.isArray(lesson.media) ? lesson.media.join(', ') : '');
      } else {
        alert('Lesson not found');
        router.push('/dashboard/lessons');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error fetching lesson:', errorMessage);
      alert('Error loading lesson: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [
        ...(formData.questions || []),
        { question: '', options: ['', '', ''], correctAnswer: 0 },
      ],
    });
  };

  const updateQuestion = (index: number, field: string, value: string | number | [number, string]) => {
    const newQuestions = [...(formData.questions || [])];
    if (field === 'option') {
      const [optIndex, optValue] = value as [number, string];
      newQuestions[index].options[optIndex] = optValue;
    } else if (field === 'question') {
      newQuestions[index].question = value as string;
    } else if (field === 'correctAnswer') {
      newQuestions[index].correctAnswer = value as number;
    }
    setFormData({ ...formData, questions: newQuestions });
  };

  const removeQuestion = (index: number) => {
    setFormData({
      ...formData,
      questions: formData.questions?.filter((_, i) => i !== index) || [],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const mediaArray = mediaInput
        .split(',')
        .map((m) => m.trim())
        .filter((m) => m.length > 0);

      const res = await fetch(`/api/lessons/${lessonId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          media: mediaArray,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert('Lesson updated successfully!');
        router.push('/dashboard/lessons');
      } else {
        alert('Error updating lesson: ' + data.error);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error updating lesson:', errorMessage);
      alert('Error updating lesson: ' + errorMessage);
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
        <h1 className="text-4xl font-bold text-white mb-2">Edit Lesson</h1>
        <p className="text-zinc-400">Update lesson content, questions, and media</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800 p-8 max-w-3xl">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Lesson Title * <span className="text-zinc-400 text-xs">(Max 60 characters recommended)</span>
            </label>
            <input
              type="text"
              required
              maxLength={60}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:ring-2 focus:ring-white focus:border-white transition-all"
              placeholder="e.g., Introduction to ChatGPT"
            />
            <p className="text-xs text-zinc-400 mt-1">{formData.title.length}/60 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Content * <span className="text-zinc-400 text-xs">(Main lesson text - supports lazy loading)</span>
            </label>
            <textarea
              required
              rows={8}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:ring-2 focus:ring-white focus:border-white transition-all"
              placeholder="Enter lesson content here. Use paragraphs for better readability..."
            />
            <p className="text-xs text-zinc-400 mt-1">Use paragraphs and sections for better readability</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Media URLs <span className="text-zinc-400 text-xs">(comma-separated - images, videos, PDFs)</span>
            </label>
            <input
              type="text"
              value={mediaInput}
              onChange={(e) => setMediaInput(e.target.value)}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:ring-2 focus:ring-white focus:border-white transition-all"
              placeholder="https://example.com/image.jpg, https://example.com/video.mp4"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Order *
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:ring-2 focus:ring-white focus:border-white transition-all"
              />
            </div>

            <div className="flex items-center pt-8">
              <input
                type="checkbox"
                id="isInteractive"
                checked={formData.isInteractive}
                onChange={(e) => setFormData({ ...formData, isInteractive: e.target.checked })}
                className="h-4 w-4 bg-zinc-800 border-zinc-700 rounded focus:ring-white text-white"
              />
              <label htmlFor="isInteractive" className="ml-2 text-sm text-white">
                Interactive
              </label>
            </div>

            <div className="flex items-center pt-8">
              <input
                type="checkbox"
                id="canRead"
                checked={formData.canRead}
                onChange={(e) => setFormData({ ...formData, canRead: e.target.checked })}
                className="h-4 w-4 bg-zinc-800 border-zinc-700 rounded focus:ring-white text-white"
              />
              <label htmlFor="canRead" className="ml-2 text-sm text-white">
                Can Read
              </label>
            </div>
          </div>

          {formData.isInteractive && (
            <div className="border-t border-zinc-700 pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">Interactive Questions</h3>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="px-4 py-2 bg-white text-black rounded-xl hover:bg-zinc-200 text-sm font-semibold"
                >
                  + Add Question
                </button>
              </div>

              {formData.questions?.map((q, qIndex) => (
                <div key={qIndex} className="bg-zinc-800 rounded-xl p-4 mb-4 border border-zinc-700">
                  <div className="flex justify-between mb-3">
                    <span className="text-sm font-semibold text-white">Question {qIndex + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeQuestion(qIndex)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <input
                    type="text"
                    value={q.question}
                    onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                    placeholder="Question text..."
                    className="w-full px-3 py-2 bg-black border border-zinc-700 rounded-xl text-white placeholder-zinc-500 mb-3 focus:ring-2 focus:ring-white focus:border-white"
                  />
                  <div className="space-y-2 mb-3">
                    {q.options.map((opt, optIndex) => (
                      <input
                        key={optIndex}
                        type="text"
                        value={opt}
                        onChange={(e) => updateQuestion(qIndex, 'option', [optIndex, e.target.value])}
                        placeholder={`Option ${optIndex + 1}`}
                        className="w-full px-3 py-2 bg-black border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:ring-2 focus:ring-white focus:border-white"
                      />
                    ))}
                  </div>
                  <select
                    value={q.correctAnswer}
                    onChange={(e) => updateQuestion(qIndex, 'correctAnswer', parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-black border border-zinc-700 rounded-xl text-white focus:ring-2 focus:ring-white focus:border-white"
                  >
                    <option value={0}>Option 1 is correct</option>
                    <option value={1}>Option 2 is correct</option>
                    <option value={2}>Option 3 is correct</option>
                  </select>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-white text-black rounded-xl hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
            >
              {saving ? 'Saving...' : 'Save Lesson'}
            </button>
            <Link
              href="/dashboard/lessons"
              className="px-8 py-3 bg-zinc-800 text-white rounded-xl hover:bg-zinc-700 transition-all duration-200 font-semibold border border-zinc-700"
            >
              Cancel
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}

