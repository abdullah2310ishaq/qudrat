'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface LessonFormData {
  title: string;
  content: string;
  media: string;
  photos: string; // Comma-separated base64 images
  order: number;
  isInteractive: boolean;
  canRead: boolean;
  canListen: boolean;
  questions: Array<{
    question: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
  }>;
}

interface AICourse {
  _id: string;
  title: string;
}

interface ExistingLesson {
  _id: string;
  title: string;
  content: string;
  order: number;
  isInteractive: boolean;
  canRead: boolean;
  canListen: boolean;
  createdAt: string;
}

export default function AddLessonsPage() {
  const router = useRouter();
  const params = useParams();
  const aiCourseId = params.id as string;

  const [aiCourse, setAiCourse] = useState<AICourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lessons, setLessons] = useState<LessonFormData[]>([]);
  const [existingLessons, setExistingLessons] = useState<ExistingLesson[]>([]);

  useEffect(() => {
    Promise.all([fetchAICourse(), fetchExistingLessons()]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiCourseId]);

  const fetchAICourse = async () => {
    try {
      const res = await fetch(`/api/aiCourses/${aiCourseId}`);
      const data = await res.json();
      if (data.success) {
        setAiCourse(data.data);
      } else {
        alert('AI Course not found');
        router.push('/dashboard/ai-courses');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error fetching AI course:', errorMessage);
      alert('Error loading AI course');
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingLessons = async () => {
    try {
      console.log('📚 Fetching existing AI lessons for course:', aiCourseId);
      const res = await fetch(`/api/aiLessons?aiCourseId=${aiCourseId}`);
      const data = await res.json();
      if (data.success) {
        console.log('✅ Found', data.data?.length || 0, 'existing lessons');
        setExistingLessons(data.data || []);
      } else {
        console.error('❌ Failed to fetch existing lessons:', data.error);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Error fetching existing lessons:', errorMessage);
    }
  };

  const addLesson = () => {
    setLessons([
      ...lessons,
      {
        title: '',
        content: '',
        media: '',
        photos: '',
        order: lessons.length + 1,
        isInteractive: false,
        canRead: true,
        canListen: false,
        questions: [],
      },
    ]);
  };

  const updateLesson = (index: number, field: keyof LessonFormData, value: string | number | boolean | Array<{ question: string; options: string[]; correctAnswer: number }>) => {
    const newLessons = [...lessons];
    const lesson = newLessons[index];
    if (field === 'title') lesson.title = value as string;
    else if (field === 'content') lesson.content = value as string;
    else if (field === 'media') lesson.media = value as string;
    else if (field === 'photos') lesson.photos = value as string;
    else if (field === 'order') lesson.order = value as number;
    else if (field === 'isInteractive') lesson.isInteractive = value as boolean;
    else if (field === 'canRead') lesson.canRead = value as boolean;
    else if (field === 'canListen') lesson.canListen = value as boolean;
    else if (field === 'questions') lesson.questions = value as Array<{ question: string; options: string[]; correctAnswer: number }>;
    setLessons(newLessons);
  };

  const addQuestion = (lessonIndex: number) => {
    const newLessons = [...lessons];
    newLessons[lessonIndex].questions.push({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
    });
    setLessons(newLessons);
  };

  const updateQuestion = (lessonIndex: number, questionIndex: number, field: string, value: string | number | [number, string]) => {
    const newLessons = [...lessons];
    const question = newLessons[lessonIndex].questions[questionIndex];
    
    if (field === 'option') {
      const [optIndex, optValue] = value as [number, string];
      question.options[optIndex] = optValue;
    } else if (field === 'question') {
      question.question = value as string;
    } else if (field === 'correctAnswer') {
      question.correctAnswer = value as number;
    } else if (field === 'explanation') {
      question.explanation = value as string;
    }
    
    setLessons(newLessons);
  };

  const removeQuestion = (lessonIndex: number, questionIndex: number) => {
    const newLessons = [...lessons];
    newLessons[lessonIndex].questions = newLessons[lessonIndex].questions.filter((_, i) => i !== questionIndex);
    setLessons(newLessons);
  };

  const removeLesson = (index: number) => {
    setLessons(lessons.filter((_, i) => i !== index));
    // Reorder remaining lessons
    const reordered = lessons.filter((_, i) => i !== index).map((lesson, i) => ({
      ...lesson,
      order: i + 1,
    }));
    setLessons(reordered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Create all lessons
      const lessonPromises = lessons.map(async (lesson) => {
        const mediaArray = lesson.media
          .split(',')
          .map((m) => m.trim())
          .filter((m) => m.length > 0);

        const photosArray = lesson.photos
          .split(',')
          .map((p) => p.trim())
          .filter((p) => p.length > 0);

        const res = await fetch('/api/aiLessons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            aiCourseId,
            title: lesson.title,
            content: lesson.content,
            media: mediaArray,
            photos: photosArray,
            order: lesson.order,
            isInteractive: lesson.isInteractive,
            questions: lesson.isInteractive ? lesson.questions : [],
            canRead: lesson.canRead,
            canListen: lesson.canListen,
          }),
        });

        const data = await res.json();
        if (!data.success) {
          throw new Error(data.error || 'Failed to create lesson');
        }
        return data.data._id;
      });

      await Promise.all(lessonPromises);

      alert(`Successfully created ${lessons.length} lesson(s) for AI Course!`);
      // Add a query parameter to trigger refresh on the edit page
      router.push(`/dashboard/ai-courses/${aiCourseId}?refresh=lessons`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error creating lessons:', errorMessage);
      alert('Error creating lessons: ' + errorMessage);
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
        <h1 className="text-5xl font-thin text-white mb-3 tracking-tight">Add Lessons to AI Mastery Course</h1>
        <div className="w-16 h-px bg-white/20 mb-4"></div>
        <p className="text-sm font-light text-white/60 tracking-wide">AI Course: {aiCourse?.title}</p>
      </div>

      {/* Existing Lessons Section */}
      {existingLessons.length > 0 && (
        <div className="bg-black/40 rounded-sm border border-white/10 p-8 max-w-4xl mb-6">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-sm font-light text-white tracking-wider uppercase">
              Existing Lessons ({existingLessons.length})
            </h2>
            <Link
              href={`/dashboard/ai-courses/${aiCourseId}`}
              className="px-4 py-2.5.5 bg-white/5 text-white rounded-sm border border-white/20 hover:bg-white/10 hover:border-white/30 transition-all font-light text-xs tracking-wider uppercase"
            >
              ← Back to Course
            </Link>
          </div>
          <div className="space-y-3">
            {existingLessons.map((lesson) => (
              <div
                key={lesson._id}
                className="border border-white/10 rounded-sm p-4 bg-white/5 flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="px-2 py-1 bg-zinc-900 text-zinc-300 rounded-lg text-xs font-semibold">
                      #{lesson.order}
                    </span>
                    <h3 className="text-lg font-bold text-white">{lesson.title}</h3>
                    {lesson.isInteractive && (
                      <span className="px-2 py-1 bg-white text-black rounded-lg text-xs font-semibold">
                        Interactive
                      </span>
                    )}
                  </div>
                  <p className="text-white/40 text-sm line-clamp-2">{lesson.content}</p>
                </div>
                <div className="flex gap-2 ml-4">
                  <Link
                    href={`/dashboard/ai-lessons/${lesson._id}/view`}
                    className="px-4 py-2.5 bg-white text-black rounded-xl hover:bg-zinc-200 transition-all font-semibold text-sm"
                  >
                    👁️ View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-black/40 rounded-sm border border-white/10 p-8 max-w-4xl">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-sm font-light text-white tracking-wider uppercase">
            {existingLessons.length > 0 ? 'Add New Lessons' : 'Lessons'}
          </h2>
          <button
            type="button"
            onClick={addLesson}
            className="px-6 py-2 bg-white text-black rounded-xl hover:bg-zinc-200 transition-all font-semibold"
          >
            + Add Lesson
          </button>
        </div>

        {lessons.length === 0 ? (
          <div className="text-center py-12 bg-zinc-800 rounded-xl border border-zinc-700 border-dashed">
            <p className="text-white/40 mb-4">No lessons added yet</p>
            <button
              type="button"
              onClick={addLesson}
              className="px-6 py-2 bg-white text-black rounded-xl hover:bg-zinc-200 transition-all font-semibold"
            >
              Add First Lesson
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {lessons.map((lesson, lessonIndex) => (
              <div key={lessonIndex} className="bg-zinc-800 rounded-xl p-6 border border-zinc-700">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-white">Lesson {lessonIndex + 1}</h3>
                  <button
                    type="button"
                    onClick={() => removeLesson(lessonIndex)}
                    className="text-red-400 hover:text-red-300 font-semibold"
                  >
                    Remove
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-light text-white/60 mb-2 tracking-wider uppercase">
                      Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={lesson.title}
                      onChange={(e) => updateLesson(lessonIndex, 'title', e.target.value)}
                      className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-white/30 focus:bg-white/10 focus:border-white/20 transition-all"
                      placeholder="e.g., Introduction to ChatGPT"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-light text-white/60 mb-2 tracking-wider uppercase">
                      Content * <span className="text-white/40 text-xs">(Main lesson text)</span>
                    </label>
                    <textarea
                      required
                      rows={6}
                      value={lesson.content}
                      onChange={(e) => updateLesson(lessonIndex, 'content', e.target.value)}
                      className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-white/30 focus:bg-white/10 focus:border-white/20 transition-all"
                      placeholder="Enter lesson content here..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-light text-white/60 mb-2 tracking-wider uppercase">
                      Media URLs <span className="text-white/40 text-xs">(comma-separated)</span>
                    </label>
                    <input
                      type="text"
                      value={lesson.media}
                      onChange={(e) => updateLesson(lessonIndex, 'media', e.target.value)}
                      className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-white/30 focus:bg-white/10 focus:border-white/20 transition-all"
                      placeholder="https://example.com/video.mp4, https://example.com/audio.mp3"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-light text-white/60 mb-2 tracking-wider uppercase">
                      Photos <span className="text-white/40 text-xs">(Optional - Base64 encoded, comma-separated)</span>
                    </label>
                    <textarea
                      rows={3}
                      value={lesson.photos}
                      onChange={(e) => updateLesson(lessonIndex, 'photos', e.target.value)}
                      className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-white/30 focus:bg-white/10 focus:border-white/20 transition-all text-xs"
                      placeholder="Paste base64 encoded images here (comma-separated if multiple)"
                    />
                    <p className="text-xs text-white/40 mt-1">Upload images and convert to Base64, or leave empty</p>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-light text-white/60 mb-2 tracking-wider uppercase">
                        Order *
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={lesson.order}
                        onChange={(e) => updateLesson(lessonIndex, 'order', parseInt(e.target.value) || 1)}
                        className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white focus:bg-white/10 focus:border-white/20 transition-all"
                      />
                    </div>

                    <div className="flex items-center pt-8">
                      <input
                        type="checkbox"
                        id={`interactive-${lessonIndex}`}
                        checked={lesson.isInteractive}
                        onChange={(e) => updateLesson(lessonIndex, 'isInteractive', e.target.checked)}
                        className="h-4 w-4 bg-zinc-900 border-zinc-700 rounded focus:ring-white text-white"
                      />
                      <label htmlFor={`interactive-${lessonIndex}`} className="ml-2 text-sm text-white">
                        Interactive
                      </label>
                    </div>

                    <div className="flex items-center pt-8">
                      <input
                        type="checkbox"
                        id={`canRead-${lessonIndex}`}
                        checked={lesson.canRead}
                        onChange={(e) => updateLesson(lessonIndex, 'canRead', e.target.checked)}
                        className="h-4 w-4 bg-zinc-900 border-zinc-700 rounded focus:ring-white text-white"
                      />
                      <label htmlFor={`canRead-${lessonIndex}`} className="ml-2 text-sm text-white">
                        Can Read
                      </label>
                    </div>
                  </div>

                  {lesson.isInteractive && (
                    <div className="border-t border-zinc-700 pt-4 mt-4">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-semibold text-white">Questions</h4>
                        <button
                          type="button"
                          onClick={() => addQuestion(lessonIndex)}
                          className="px-4 py-2.5 bg-white text-black rounded-xl hover:bg-zinc-200 text-sm font-semibold"
                        >
                          + Add Question
                        </button>
                      </div>

                      {lesson.questions.map((q, qIndex) => (
                        <div key={qIndex} className="bg-zinc-900 rounded-xl p-4 mb-4 border border-zinc-700">
                          <div className="flex justify-between mb-3">
                            <span className="text-sm font-semibold text-white">Question {qIndex + 1}</span>
                            <button
                              type="button"
                              onClick={() => removeQuestion(lessonIndex, qIndex)}
                              className="text-red-400 hover:text-red-300 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                          <input
                            type="text"
                            value={q.question}
                            onChange={(e) => updateQuestion(lessonIndex, qIndex, 'question', e.target.value)}
                            placeholder="Question text..."
                            className="w-full px-3 py-2 bg-black border border-zinc-700 rounded-xl text-white placeholder-white/30 mb-3 focus:bg-white/10 focus:border-white/20"
                          />
                          <div className="space-y-2 mb-3">
                            {q.options.map((opt, optIndex) => (
                              <input
                                key={optIndex}
                                type="text"
                                value={opt}
                                onChange={(e) => updateQuestion(lessonIndex, qIndex, 'option', [optIndex, e.target.value])}
                                placeholder={`Option ${optIndex + 1}`}
                                className="w-full px-3 py-2 bg-black border border-zinc-700 rounded-xl text-white placeholder-white/30 focus:bg-white/10 focus:border-white/20"
                              />
                            ))}
                          </div>
                          <select
                            value={q.correctAnswer}
                            onChange={(e) => updateQuestion(lessonIndex, qIndex, 'correctAnswer', parseInt(e.target.value))}
                            className="w-full px-3 py-2 bg-black border border-zinc-700 rounded-xl text-white focus:bg-white/10 focus:border-white/20 mb-3"
                          >
                            <option value={0}>Option 1 is correct</option>
                            <option value={1}>Option 2 is correct</option>
                            <option value={2}>Option 3 is correct</option>
                            <option value={3}>Option 4 is correct</option>
                          </select>
                          <input
                            type="text"
                            value={q.explanation || ''}
                            onChange={(e) => updateQuestion(lessonIndex, qIndex, 'explanation', e.target.value)}
                            placeholder="Explanation (optional)"
                            className="w-full px-3 py-2 bg-black border border-zinc-700 rounded-xl text-white placeholder-white/30 focus:bg-white/10 focus:border-white/20"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-4 pt-6 mt-6 border-t border-zinc-800">
          <button
            type="submit"
            disabled={saving || lessons.length === 0}
            className="px-6 py-2.5 bg-white/5 text-white rounded-sm border border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-300 font-light text-sm tracking-wider uppercase disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Creating Lessons...' : `Create ${lessons.length} Lesson(s)`}
          </button>
          <Link
            href={`/dashboard/ai-courses/${aiCourseId}`}
            className="px-8 py-3 bg-zinc-800 text-white rounded-xl hover:bg-zinc-700 transition-all duration-200 font-semibold border border-zinc-700"
          >
            Skip for Now
          </Link>
        </div>
      </form>
    </div>
  );
}

