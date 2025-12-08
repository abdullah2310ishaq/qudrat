'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/components/Toast';

interface Course {
  _id: string;
  title: string;
}

export default function AddLessonPage() {
  const router = useRouter();
  const toast = useToast();
  const searchParams = useSearchParams();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lessonForm, setLessonForm] = useState({
    courseId: searchParams.get('courseId') || '',
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

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/courses');
      const data = await res.json();
      if (data.success) {
        setCourses(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (lessonForm.courseId) {
      fetchLessonCount();
    }
  }, [lessonForm.courseId]);

  const fetchLessonCount = async () => {
    try {
      const res = await fetch(`/api/lessons?courseId=${lessonForm.courseId}`);
      const data = await res.json();
      if (data.success) {
        setLessonForm({ ...lessonForm, order: (data.data?.length || 0) + 1 });
      }
    } catch (error) {
      console.error('Error fetching lessons:', error);
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

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonForm.courseId) {
      toast.error('⚠️ Please select a course first');
      return;
    }

    setSaving(true);
    const createToastId = toast.loading('Creating lesson...');
    try {
      const mediaArray = lessonForm.media.length > 0 ? lessonForm.media : [];
      if (lessonForm.audio) {
        mediaArray.push(lessonForm.audio);
      }

      const res = await fetch('/api/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: lessonForm.courseId,
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
      if (data.success) {
        // Update course with new lesson
        const courseRes = await fetch(`/api/courses/${lessonForm.courseId}`);
        const courseData = await courseRes.json();
        const existingLessons = courseData.success && courseData.data.lessons
          ? courseData.data.lessons.map((l: { _id?: string; toString?: () => string }) => l._id || l.toString?.() || '')
          : [];

        await fetch(`/api/courses/${lessonForm.courseId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lessons: [...existingLessons, data.data._id],
          }),
        });

        toast.removeToast(createToastId);
        toast.success('✅ Lesson created successfully!');
        router.push(`/dashboard/courses-unified/view/${lessonForm.courseId}`);
      } else {
        toast.removeToast(createToastId);
        toast.error('❌ Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error creating lesson:', error);
      toast.removeToast(createToastId);
      toast.error('❌ Error creating lesson');
    } finally {
      setSaving(false);
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
            href="/dashboard/courses-unified"
            className="inline-block mb-2 text-black/70 hover:text-black font-medium text-xs"
          >
            ← Back to Courses
          </Link>
          <h1 className="text-lg font-bold text-black mb-1">📖 Add New Lesson</h1>
          <p className="text-black/70 text-xs">Create a new lesson for your course</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded border border-black shadow-md p-4">
          <form onSubmit={handleCreateLesson} className="space-y-3">
            <div>
              <label className="block text-black font-semibold mb-1 text-xs">
                Select Course <span className="text-red-600">*</span>
              </label>
              <select
                required
                value={lessonForm.courseId}
                onChange={(e) => setLessonForm({ ...lessonForm, courseId: e.target.value })}
                className="w-full px-2 py-1.5 bg-white border border-black/20 rounded text-black focus:border-black focus:outline-none text-xs font-medium"
              >
                <option value="">Choose a course...</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.title}
                  </option>
                ))}
              </select>
              <p className="text-black/60 text-xs mt-0.5">Select which course this lesson belongs to</p>
            </div>

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
                placeholder="e.g., Introduction to Variables"
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
                placeholder="Write your lesson content here..."
              />
              <p className="text-black/60 text-xs mt-0.5">This is the main content of your lesson</p>
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
                <p className="text-black/60 text-xs mt-0.5">Lesson sequence (1, 2, 3...)</p>
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
              <label className="block text-black font-semibold mb-1 text-xs">📷 Add Images (Optional)</label>
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
              <p className="text-black/60 text-xs mt-0.5">You can add multiple images (max 5MB each)</p>
            </div>

            <div className="border-t border-black/10 pt-3">
              <label className="block text-black font-semibold mb-1 text-xs">🎵 Add Audio (Optional)</label>
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
              <p className="text-black/60 text-xs mt-0.5">Upload an audio file (max 10MB)</p>
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
                {saving ? '⏳ Creating...' : '✅ Create Lesson'}
              </button>
              <Link
                href="/dashboard/courses-unified"
                className="px-3 py-1.5 bg-white border border-black/20 text-black rounded hover:bg-black/5 transition-all font-semibold text-xs"
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
