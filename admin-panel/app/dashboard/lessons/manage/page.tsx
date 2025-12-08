'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface LessonFormData {
  title: string;
  content: string;
  media: string;
  photos: string;
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

interface Course {
  _id: string;
  title: string;
  type: string;
}

interface ExistingLesson {
  _id: string;
  title: string;
  order: number;
  isInteractive: boolean;
}

export default function ManageLessonsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get('courseId') || '';
  const aiCourseId = searchParams.get('aiCourseId') || '';

  const [mode, setMode] = useState<'standalone' | 'course' | 'aiCourse'>('standalone');
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lessons, setLessons] = useState<LessonFormData[]>([]);
  const [existingLessons, setExistingLessons] = useState<ExistingLesson[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState(courseId);
  const [selectedAiCourseId, setSelectedAiCourseId] = useState(aiCourseId);
  const [showBatchMode, setShowBatchMode] = useState(false);

  useEffect(() => {
    // Determine mode based on URL params
    if (aiCourseId) {
      setMode('aiCourse');
      fetchAICourse();
      fetchExistingAILessons();
    } else if (courseId) {
      setMode('course');
      fetchCourse();
      fetchExistingLessons();
    } else {
      setMode('standalone');
      fetchCourses();
    }
  }, [courseId, aiCourseId]);

  const fetchCourse = async () => {
    try {
      const res = await fetch(`/api/courses/${courseId}`);
      const data = await res.json();
      if (data.success) {
        setCourse(data.data);
        setSelectedCourseId(courseId);
      }
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAICourse = async () => {
    try {
      const res = await fetch(`/api/aiCourses/${aiCourseId}`);
      const data = await res.json();
      if (data.success) {
        setCourse({ _id: aiCourseId, title: data.data.title, type: 'mastery' });
        setSelectedAiCourseId(aiCourseId);
      }
    } catch (error) {
      console.error('Error fetching AI course:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const fetchExistingLessons = async () => {
    if (!courseId) return;
    try {
      const res = await fetch(`/api/lessons?courseId=${courseId}`);
      const data = await res.json();
      if (data.success) {
        setExistingLessons(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching existing lessons:', error);
    }
  };

  const fetchExistingAILessons = async () => {
    if (!aiCourseId) return;
    try {
      const res = await fetch(`/api/aiLessons?aiCourseId=${aiCourseId}`);
      const data = await res.json();
      if (data.success) {
        setExistingLessons(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching existing AI lessons:', error);
    }
  };

  const addLesson = () => {
    const nextOrder = existingLessons.length + lessons.length + 1;
    setLessons([
      ...lessons,
      {
        title: '',
        content: '',
        media: '',
        photos: '',
        order: nextOrder,
        isInteractive: false,
        canRead: true,
        canListen: false,
        questions: [],
      },
    ]);
    setShowBatchMode(true);
  };

  const updateLesson = (
    index: number,
    field: keyof LessonFormData,
    value: string | number | boolean | Array<{ question: string; options: string[]; correctAnswer: number }>
  ) => {
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

  const removeLesson = (index: number) => {
    const newLessons = lessons.filter((_, i) => i !== index);
    // Reorder remaining lessons
    const reordered = newLessons.map((lesson, i) => ({
      ...lesson,
      order: existingLessons.length + i + 1,
    }));
    setLessons(reordered);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (mode === 'standalone' && !selectedCourseId && !selectedAiCourseId) {
      alert('Please select a course');
      return;
    }

    if (lessons.length === 0) {
      alert('Please add at least one lesson');
      return;
    }

    // Validate all lessons have required fields
    for (const lesson of lessons) {
      if (!lesson.title.trim() || !lesson.content.trim()) {
        alert('All lessons must have a title and content');
        return;
      }
    }

    setSaving(true);

    try {
      const targetCourseId = mode === 'aiCourse' ? selectedAiCourseId : selectedCourseId;
      const apiEndpoint = mode === 'aiCourse' ? '/api/aiLessons' : '/api/lessons';
      const courseField = mode === 'aiCourse' ? 'aiCourseId' : 'courseId';

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

        const res = await fetch(apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            [courseField]: targetCourseId,
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

      const lessonIds = await Promise.all(lessonPromises);

      // Auto-update course if in course mode
      if (mode === 'course' && targetCourseId) {
        const courseRes = await fetch(`/api/courses/${targetCourseId}`);
        const courseData = await courseRes.json();
        const existingLessonIds = courseData.success && courseData.data.lessons
          ? courseData.data.lessons.map((l: { _id?: string; toString?: () => string }) => l._id || l.toString?.() || '')
          : [];

        const allLessonIds = [...new Set([...existingLessonIds, ...lessonIds])];

        await fetch(`/api/courses/${targetCourseId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lessons: allLessonIds,
          }),
        });
      }

      alert(`Successfully created ${lessons.length} lesson(s)!`);
      
      // Redirect based on mode
      if (mode === 'course' && targetCourseId) {
        router.push(`/dashboard/courses/${targetCourseId}`);
      } else if (mode === 'aiCourse' && targetCourseId) {
        router.push(`/dashboard/ai-courses/${targetCourseId}`);
      } else {
        router.push('/dashboard/lessons');
      }
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-thin text-white mb-3 tracking-tight">
              {mode === 'standalone' ? 'Create Lesson' : mode === 'aiCourse' ? 'Add Lessons to AI Course' : 'Add Lessons to Course'}
            </h1>
            <div className="w-16 h-px bg-white/20 mb-4"></div>
            <p className="text-sm font-light text-white/60 tracking-wide">
              {mode === 'standalone'
                ? 'Create a new lesson and assign it to a course'
                : `Course: ${course?.title || 'Loading...'}`}
            </p>
          </div>
          {mode !== 'standalone' && (
            <Link
              href={mode === 'aiCourse' ? `/dashboard/ai-courses/${courseId || aiCourseId}` : `/dashboard/courses/${courseId}`}
              className="px-6 py-2.5 bg-white/5 text-white rounded-sm border border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-300 font-light text-sm tracking-wider uppercase"
            >
              ← Back to Course
            </Link>
          )}
        </div>
      </div>

      {/* Course Selection (Standalone Mode) */}
      {mode === 'standalone' && (
        <div className="bg-black/40 rounded-sm border border-white/10 p-6 mb-6 max-w-2xl">
          <label className="block text-xs font-light text-white/60 mb-2 tracking-wider uppercase">
            Select Course *
          </label>
          <select
            required
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="w-full px-4 py-2.5 border border-white/10 rounded-sm bg-white/5 text-white focus:bg-white/10 focus:border-white/20 transition-all"
          >
            <option value="">Choose a course...</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.title} ({c.type})
              </option>
            ))}
          </select>
          <p className="text-xs text-white/40 mt-2">
            Select the course this lesson will belong to
          </p>
        </div>
      )}

      {/* Existing Lessons Display */}
      {existingLessons.length > 0 && (
        <div className="bg-black/40 rounded-sm border border-white/10 p-6 mb-6 max-w-4xl">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-sm font-light text-white tracking-wider uppercase">
              Existing Lessons ({existingLessons.length})
            </h2>
          </div>
          <div className="space-y-2">
            {existingLessons
              .sort((a, b) => a.order - b.order)
              .map((lesson) => (
                <div
                  key={lesson._id}
                  className="border border-white/10 rounded-sm p-4 bg-white/5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-light text-white/50 w-8">#{lesson.order}</span>
                    <span className="text-white font-light text-sm">{lesson.title}</span>
                    {lesson.isInteractive && (
                      <span className="px-2 py-1 bg-white/10 text-white rounded text-xs">Interactive</span>
                    )}
                  </div>
                  <Link
                    href={`/dashboard/lessons/${lesson._id}`}
                    className="text-white/60 hover:text-white text-xs font-light tracking-wide transition-colors"
                  >
                    Edit
                  </Link>
                </div>
              ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-black/40 rounded-sm border border-white/10 p-8 max-w-4xl">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-sm font-light text-white tracking-wider uppercase">
            {lessons.length === 0 ? 'New Lesson' : `${lessons.length} Lesson(s) to Create`}
          </h2>
          <div className="flex gap-2">
            {lessons.length === 0 && (
              <button
                type="button"
                onClick={() => {
                  addLesson();
                  setShowBatchMode(false);
                }}
                className="px-4 py-2.5 bg-white/5 text-white rounded-sm border border-white/20 hover:bg-white/10 hover:border-white/30 transition-all font-light text-xs tracking-wider uppercase"
              >
                + Single Lesson
              </button>
            )}
            <button
              type="button"
              onClick={addLesson}
              className="px-4 py-2.5 bg-white/5 text-white rounded-sm border border-white/20 hover:bg-white/10 hover:border-white/30 transition-all font-light text-xs tracking-wider uppercase"
            >
              + Add Lesson
            </button>
          </div>
        </div>

        {lessons.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-sm border border-white/10 border-dashed">
            <div className="text-4xl mb-4 opacity-50">📚</div>
            <p className="text-white/60 mb-4 font-light text-sm">No lessons added yet</p>
            <button
              type="button"
              onClick={addLesson}
              className="px-6 py-2.5 bg-white/5 text-white rounded-sm border border-white/20 hover:bg-white/10 hover:border-white/30 transition-all font-light text-sm tracking-wider uppercase"
            >
              Add First Lesson
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {lessons.map((lesson, lessonIndex) => (
              <div key={lessonIndex} className="bg-white/5 rounded-sm p-6 border border-white/10">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-light text-white">Lesson {lessonIndex + 1}</h3>
                  <button
                    type="button"
                    onClick={() => removeLesson(lessonIndex)}
                    className="text-red-400 hover:text-red-300 text-xs font-light tracking-wide uppercase"
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
                      className="w-full px-4 py-2.5 border border-white/10 rounded-sm bg-black/40 text-white placeholder-white/30 focus:bg-white/10 focus:border-white/20 transition-all"
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
                      className="w-full px-4 py-2.5 border border-white/10 rounded-sm bg-black/40 text-white placeholder-white/30 focus:bg-white/10 focus:border-white/20 transition-all"
                      placeholder="Enter lesson content here..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-light text-white/60 mb-2 tracking-wider uppercase">
                        Media URLs <span className="text-white/40 text-xs">(comma-separated)</span>
                      </label>
                      <input
                        type="text"
                        value={lesson.media}
                        onChange={(e) => updateLesson(lessonIndex, 'media', e.target.value)}
                        className="w-full px-4 py-2.5 border border-white/10 rounded-sm bg-black/40 text-white placeholder-white/30 focus:bg-white/10 focus:border-white/20 transition-all text-sm"
                        placeholder="https://example.com/video.mp4"
                      />
                    </div>

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
                        className="w-full px-4 py-2.5 border border-white/10 rounded-sm bg-black/40 text-white focus:bg-white/10 focus:border-white/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-6 flex-wrap border border-white/10 rounded-sm bg-black/40 p-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={lesson.isInteractive}
                        onChange={(e) => updateLesson(lessonIndex, 'isInteractive', e.target.checked)}
                        className="h-4 w-4 border-white/10 rounded-sm bg-white/5 focus:ring-white/20"
                      />
                      <span className="ml-2 text-sm font-light text-white">Interactive (with questions)</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={lesson.canRead}
                        onChange={(e) => updateLesson(lessonIndex, 'canRead', e.target.checked)}
                        className="h-4 w-4 border-white/10 rounded-sm bg-white/5 focus:ring-white/20"
                      />
                      <span className="ml-2 text-sm font-light text-white">Can Read</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={lesson.canListen}
                        onChange={(e) => updateLesson(lessonIndex, 'canListen', e.target.checked)}
                        className="h-4 w-4 border-white/10 rounded-sm bg-white/5 focus:ring-white/20"
                      />
                      <span className="ml-2 text-sm font-light text-white">Can Listen</span>
                    </label>
                  </div>

                  {lesson.isInteractive && (
                    <div className="border-t border-white/10 pt-4 mt-4">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-sm font-light text-white tracking-wider uppercase">Questions</h4>
                        <button
                          type="button"
                          onClick={() => addQuestion(lessonIndex)}
                          className="px-4 py-2 bg-white/5 text-white rounded-sm hover:bg-white/10 text-xs font-light tracking-wider uppercase border border-white/20"
                        >
                          + Add Question
                        </button>
                      </div>

                      {lesson.questions.map((q, qIndex) => (
                        <div key={qIndex} className="bg-black/40 rounded-sm p-4 mb-4 border border-white/10">
                          <div className="flex justify-between mb-3">
                            <span className="text-xs font-light text-white/60">Question {qIndex + 1}</span>
                            <button
                              type="button"
                              onClick={() => removeQuestion(lessonIndex, qIndex)}
                              className="text-red-400 hover:text-red-300 text-xs"
                            >
                              Remove
                            </button>
                          </div>
                          <input
                            type="text"
                            value={q.question}
                            onChange={(e) => updateQuestion(lessonIndex, qIndex, 'question', e.target.value)}
                            placeholder="Question text..."
                            className="w-full px-3 py-2 bg-black border border-white/10 rounded-sm text-white placeholder-white/30 mb-3 focus:bg-white/10 focus:border-white/20 text-sm"
                          />
                          <div className="space-y-2 mb-3">
                            {q.options.map((opt, optIndex) => (
                              <input
                                key={optIndex}
                                type="text"
                                value={opt}
                                onChange={(e) => updateQuestion(lessonIndex, qIndex, 'option', [optIndex, e.target.value])}
                                placeholder={`Option ${optIndex + 1}`}
                                className="w-full px-3 py-2 bg-black border border-white/10 rounded-sm text-white placeholder-white/30 focus:bg-white/10 focus:border-white/20 text-sm"
                              />
                            ))}
                          </div>
                          <select
                            value={q.correctAnswer}
                            onChange={(e) => updateQuestion(lessonIndex, qIndex, 'correctAnswer', parseInt(e.target.value))}
                            className="w-full px-3 py-2 bg-black border border-white/10 rounded-sm text-white focus:bg-white/10 focus:border-white/20 mb-3 text-sm"
                          >
                            {q.options.map((_, idx) => (
                              <option key={idx} value={idx}>
                                Option {idx + 1} is correct
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
                            value={q.explanation || ''}
                            onChange={(e) => updateQuestion(lessonIndex, qIndex, 'explanation', e.target.value)}
                            placeholder="Explanation (optional)"
                            className="w-full px-3 py-2 bg-black border border-white/10 rounded-sm text-white placeholder-white/30 focus:bg-white/10 focus:border-white/20 text-sm"
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

        <div className="flex gap-4 pt-6 mt-6 border-t border-white/10">
          <button
            type="submit"
            disabled={saving || lessons.length === 0 || (mode === 'standalone' && !selectedCourseId)}
            className="px-6 py-2.5 bg-white/5 text-white rounded-sm border border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-300 font-light text-sm tracking-wider uppercase disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Creating...' : lessons.length === 1 ? 'Create Lesson' : `Create ${lessons.length} Lessons`}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-8 py-3 bg-white/5 text-white rounded-sm border border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-300 font-light text-sm tracking-wider uppercase"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
