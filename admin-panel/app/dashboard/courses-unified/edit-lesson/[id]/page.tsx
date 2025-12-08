'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/components/Toast';

interface Lesson {
  _id: string;
  title: string;
  content: string;
  order: number;
  isInteractive: boolean;
  photos?: string[];
  media?: string[];
  questions?: Array<{
    question: string;
    options: string[];
    correctAnswer: number;
  }>;
  courseId?: string;
}

export default function EditLessonPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const lessonId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [lessonForm, setLessonForm] = useState({
    title: '',
    content: '',
    order: 1,
    isInteractive: false,
    photos: [] as string[],
    audio: '',
    media: [] as string[],
    questions: [] as Array<{
      question: string;
      options: string[];
      correctAnswer: number;
    }>,
  });
  const [courseId, setCourseId] = useState('');

  useEffect(() => {
    if (lessonId) {
      fetchLesson();
    }
  }, [lessonId]);

  const fetchLesson = async () => {
    try {
      const res = await fetch(`/api/lessons/${lessonId}`);
      const data = await res.json();
      if (data.success) {
        const lesson = data.data;
        setCourseId(lesson.courseId || '');
        setLessonForm({
          title: lesson.title || '',
          content: lesson.content || '',
          order: lesson.order || 1,
          isInteractive: lesson.isInteractive || false,
          photos: lesson.photos || [],
          audio: '',
          media: lesson.media || [],
          questions: lesson.questions || [],
        });
        // Extract audio from media if exists
        if (lesson.media && lesson.media.length > 0) {
          const audioItem = lesson.media.find((m: string) => m.startsWith('data:audio'));
          if (audioItem) {
            setLessonForm(prev => ({ ...prev, audio: audioItem }));
          }
        }
      }
    } catch (error) {
      console.error('Error fetching lesson:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isAudio = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = isAudio ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`⚠️ File is too large. Maximum size: ${isAudio ? '10MB' : '5MB'}`);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (isAudio) {
        setLessonForm({ ...lessonForm, audio: base64 });
        toast.success('Audio uploaded successfully!');
      } else {
        setLessonForm({ ...lessonForm, photos: [...lessonForm.photos, base64] });
        toast.success('Image uploaded successfully!');
      }
    };
    reader.onerror = () => {
      toast.error('❌ Error reading file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = (index: number) => {
    setLessonForm({
      ...lessonForm,
      photos: lessonForm.photos.filter((_, i) => i !== index),
    });
  };

  const addQuestion = () => {
    setLessonForm({
      ...lessonForm,
      questions: [
        ...lessonForm.questions,
        { question: '', options: ['', '', '', ''], correctAnswer: 0 },
      ],
    });
  };

  const updateQuestion = (index: number, field: string, value: string | number | [number, string]) => {
    const newQuestions = [...lessonForm.questions];
    if (field === 'option') {
      const [optIndex, optValue] = value as [number, string];
      newQuestions[index].options[optIndex] = optValue;
    } else if (field === 'question') {
      newQuestions[index].question = value as string;
    } else if (field === 'correctAnswer') {
      newQuestions[index].correctAnswer = value as number;
    }
    setLessonForm({ ...lessonForm, questions: newQuestions });
  };

  const removeQuestion = (index: number) => {
    setLessonForm({
      ...lessonForm,
      questions: lessonForm.questions.filter((_, i) => i !== index),
    });
  };

  const handleUpdateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const updateToastId = toast.loading('Updating lesson...');
    try {
      const mediaArray = lessonForm.media.filter((m) => !m.startsWith('data:audio'));
      if (lessonForm.audio) {
        mediaArray.push(lessonForm.audio);
      }

      const res = await fetch(`/api/lessons/${lessonId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: lessonForm.title,
          content: lessonForm.content,
          order: lessonForm.order,
          isInteractive: lessonForm.isInteractive,
          photos: lessonForm.photos,
          media: mediaArray,
          questions: lessonForm.isInteractive ? lessonForm.questions : [],
        }),
      });

      const data = await res.json();
      toast.removeToast(updateToastId);
      if (data.success) {
        toast.success('✅ Lesson updated successfully!');
        router.push(`/dashboard/courses-unified/view/${courseId}`);
      } else {
        toast.error('❌ Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating lesson:', error);
      toast.removeToast(updateToastId);
      toast.error('❌ Error updating lesson');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLesson = async () => {
    if (!confirm(`⚠️ Are you sure you want to delete lesson "${lessonForm.title}"?\n\nThis action cannot be undone!`)) {
      return;
    }

    setDeleting(true);
    const deleteToastId = toast.loading('Deleting lesson...');
    try {
      const res = await fetch(`/api/lessons/${lessonId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      toast.removeToast(deleteToastId);
      if (data.success) {
        toast.success('✅ Lesson deleted successfully!');
        router.push(`/dashboard/courses-unified/view/${courseId}`);
      } else {
        toast.error('❌ Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting lesson:', error);
      toast.removeToast(deleteToastId);
      toast.error('❌ Error deleting lesson');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 min-h-screen" style={{ backgroundColor: '#F5F5DC' }}>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-black/20 border-t-black"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 min-h-screen" style={{ backgroundColor: '#F5F5DC' }}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-4">
          <Link
            href={`/dashboard/courses-unified/view/${courseId}`}
            className="inline-block mb-2 text-black/70 hover:text-black font-medium text-xs"
          >
            ← Back to Course
          </Link>
          <h1 className="text-lg font-bold text-black mb-1">✏️ Edit Lesson</h1>
          <p className="text-black/70 text-xs">Update your lesson information</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded border border-black shadow-md p-4">
          <form onSubmit={handleUpdateLesson} className="space-y-3">
            <div>
              <label className="block text-black font-semibold mb-1 text-xs">
                Lesson Title <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={lessonForm.title}
                onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                className="w-full px-2 py-1.5 bg-white border border-black/20 rounded text-black focus:border-black focus:outline-none text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-black font-semibold mb-1 text-xs">
                Lesson Content <span className="text-red-600">*</span>
              </label>
              <textarea
                required
                rows={8}
                value={lessonForm.content}
                onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                className="w-full px-2 py-1.5 bg-white border border-black/20 rounded text-black focus:border-black focus:outline-none text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-black font-semibold mb-1 text-xs">
                  Order Number <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={lessonForm.order}
                  onChange={(e) => setLessonForm({ ...lessonForm, order: parseInt(e.target.value) || 1 })}
                  className="w-full px-2 py-1.5 bg-white border border-black/20 rounded text-black focus:border-black focus:outline-none text-xs font-medium"
                />
              </div>
              <div className="flex items-center pt-6">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={lessonForm.isInteractive}
                    onChange={(e) => setLessonForm({ ...lessonForm, isInteractive: e.target.checked })}
                    className="w-4 h-4 mr-2"
                  />
                  <span className="text-black font-semibold text-xs">🎯 Add Quiz</span>
                </label>
              </div>
            </div>

            <div className="border-t border-black/10 pt-3">
              <label className="block text-black font-semibold mb-1 text-xs">📷 Images</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, false)}
                className="w-full px-2 py-1.5 bg-white border border-black/20 rounded text-black text-xs font-medium mb-2"
              />
              {lessonForm.photos.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {lessonForm.photos.map((photo, idx) => (
                    <div key={idx} className="relative">
                      <img src={photo} alt={`Preview ${idx + 1}`} className="w-full h-20 object-cover rounded border border-black/20" />
                      <button
                        type="button"
                        onClick={() => removePhoto(idx)}
                        className="absolute top-1 right-1 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded font-bold hover:bg-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-black/10 pt-3">
              <label className="block text-black font-semibold mb-1 text-xs">🎵 Audio</label>
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => handleImageUpload(e, true)}
                className="w-full px-2 py-1.5 bg-white border border-black/20 rounded text-black text-xs font-medium"
              />
              {lessonForm.audio && (
                <div className="mt-2 bg-black/5 p-2 rounded border border-black/10">
                  <audio controls src={lessonForm.audio} className="w-full" />
                  <button
                    type="button"
                    onClick={() => setLessonForm({ ...lessonForm, audio: '' })}
                    className="mt-2 px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 font-semibold text-xs"
                  >
                    Remove Audio
                  </button>
                </div>
              )}
            </div>

            {lessonForm.isInteractive && (
              <div className="border-t border-black/10 pt-3">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-black font-semibold text-xs">🎯 Quiz Questions</h3>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="px-2 py-1 bg-black text-white rounded hover:bg-black/90 font-semibold text-xs"
                  >
                    + Add Question
                  </button>
                </div>
                {lessonForm.questions.length === 0 ? (
                  <div className="text-center py-6 bg-cream-50 rounded border border-dashed border-black/20">
                    <p className="text-black/60 text-xs mb-1">No questions added yet</p>
                    <p className="text-black/50 text-xs">Click "+ Add Question" to create quiz questions</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {lessonForm.questions.map((q, qIdx) => (
                      <div key={qIdx} className="bg-cream-50 p-2 rounded border border-black/10">
                        <div className="flex justify-between mb-2">
                          <span className="text-black font-semibold text-xs">Question {qIdx + 1}</span>
                          <button
                            type="button"
                            onClick={() => removeQuestion(qIdx)}
                            className="text-red-600 font-semibold text-xs hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                        <input
                          type="text"
                          value={q.question}
                          onChange={(e) => updateQuestion(qIdx, 'question', e.target.value)}
                          placeholder="Enter your question..."
                          className="w-full px-2 py-1.5 bg-white border border-black/20 rounded text-black mb-2 focus:border-black focus:outline-none text-xs font-medium"
                        />
                        <div className="space-y-1.5 mb-2">
                          {q.options.map((opt, optIdx) => (
                            <input
                              key={optIdx}
                              type="text"
                              value={opt}
                              onChange={(e) => updateQuestion(qIdx, 'option', [optIdx, e.target.value])}
                              placeholder={`Option ${optIdx + 1}`}
                              className="w-full px-2 py-1.5 bg-white border border-black/20 rounded text-black focus:border-black focus:outline-none text-xs"
                            />
                          ))}
                        </div>
                        <select
                          value={q.correctAnswer}
                          onChange={(e) => updateQuestion(qIdx, 'correctAnswer', parseInt(e.target.value))}
                          className="w-full px-2 py-1.5 bg-white border border-black/20 rounded text-black focus:border-black focus:outline-none text-xs font-semibold"
                        >
                          {q.options.map((_, idx) => (
                            <option key={idx} value={idx}>
                              Option {idx + 1} is correct
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2 pt-3 border-t border-black/10">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-3 py-1.5 bg-black text-white rounded hover:bg-black/90 transition-all font-semibold text-xs disabled:opacity-50"
              >
                {saving ? '⏳ Saving...' : '✅ Save Changes'}
              </button>
              <Link
                href={`/dashboard/courses-unified/view/${courseId}`}
                className="px-3 py-1.5 bg-white border border-black/20 text-black rounded hover:bg-black/5 transition-all font-semibold text-xs"
              >
                Cancel
              </Link>
              <button
                type="button"
                onClick={handleDeleteLesson}
                disabled={deleting}
                className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-all font-semibold text-xs disabled:opacity-50"
              >
                {deleting ? '⏳' : '🗑️'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
