'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Course {
  _id: string;
  title: string;
  type: string;
}

export default function NewLessonPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  
  // Get courseId from URL query params if available
  const getCourseIdFromUrl = () => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('courseId') || '';
    }
    return '';
  };

  const [formData, setFormData] = useState({
    courseId: getCourseIdFromUrl(),
    title: '',
    content: '',
    media: '',
    order: 0,
    isInteractive: false,
    canRead: true,
    canListen: false,
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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error fetching courses:', errorMessage);
    }
  };

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        { question: '', options: ['', '', ''], correctAnswer: 0 },
      ],
    });
  };

  const updateQuestion = (index: number, field: string, value: string | number | [number, string]) => {
    const newQuestions = [...formData.questions];
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
      questions: formData.questions.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const mediaArray = formData.media
        .split(',')
        .map((m) => m.trim())
        .filter((m) => m.length > 0);

      const res = await fetch('/api/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          media: mediaArray,
          questions: formData.isInteractive ? formData.questions : [],
        }),
      });

      const data = await res.json();
      if (data.success) {
        router.push('/dashboard/lessons');
      } else {
        alert('Error creating lesson: ' + data.error);
      }
    } catch (error) {
      console.error('Error creating lesson:', error);
      alert('Error creating lesson');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-black">
      <div className="mb-12">
        <h1 className="text-5xl font-thin text-white mb-3 tracking-tight">Create New Lesson</h1>
        <div className="w-16 h-px bg-white/20 mb-4"></div>
        <p className="text-sm font-light text-white/60 tracking-wide">Add content, questions, and media to your lesson</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-black/40 rounded-sm border border-white/10 p-8 max-w-3xl">
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-light text-white/60 mb-2 tracking-wider uppercase">
              Course *
            </label>
            <select
              required
              value={formData.courseId}
              onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
              className="w-full px-4 py-2.5 border border-white/10 rounded-sm bg-white/5 text-white focus:bg-white/10 focus:border-white/20 transition-all"
            >
              <option value="">Select a course</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.title} ({course.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-light text-white/60 mb-2 tracking-wider uppercase">
              Lesson Title * <span className="text-white/40 text-xs">(Max 60 characters recommended)</span>
            </label>
            <input
              type="text"
              required
              maxLength={60}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 border border-white/10 rounded-sm bg-white/5 text-white placeholder-white/30 focus:bg-white/10 focus:border-white/20 transition-all"
              placeholder="e.g., Intro to Prompting"
            />
            <p className="text-xs text-white/40 mt-1">{formData.title.length}/60 characters</p>
          </div>

          <div>
            <label className="block text-xs font-light text-white/60 mb-2 tracking-wider uppercase">
              Content * <span className="text-white/40 text-xs">(Main lesson text - can be long)</span>
            </label>
            <textarea
              required
              rows={12}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-4 py-2.5 border border-white/10 rounded-sm bg-white/5 text-white placeholder-white/30 focus:bg-white/10 focus:border-white/20 transition-all"
              placeholder="Enter lesson content here...&#10;&#10;You can add:&#10;- Long paragraphs&#10;- Multiple sections&#10;- Detailed explanations&#10;&#10;Content will be lazy loaded in Flutter app for better performance."
            />
          </div>

          <div>
            <label className="block text-xs font-light text-white/60 mb-2 tracking-wider uppercase">
              Media URLs <span className="text-white/40 text-xs">(comma-separated)</span>
            </label>
            <input
              type="text"
              value={formData.media}
              onChange={(e) => setFormData({ ...formData, media: e.target.value })}
              className="w-full px-4 py-2.5 border border-white/10 rounded-sm bg-white/5 text-white placeholder-white/30 focus:bg-white/10 focus:border-white/20 transition-all"
              placeholder="https://example.com/image1.jpg, https://example.com/video1.mp4"
            />
            <p className="text-xs text-white/50 mt-1">Separate multiple URLs with commas</p>
          </div>

          <div>
            <label className="block text-xs font-light text-white/60 mb-2 tracking-wider uppercase">
              Order * <span className="text-white/40 text-xs">(Sequence in course: 1, 2, 3...)</span>
            </label>
            <input
              type="number"
              required
              min="0"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2.5 border border-white/10 rounded-sm bg-white/5 text-white focus:bg-white/10 focus:border-white/20 transition-all"
            />
          </div>

          <div className="border border-white/10 rounded-sm bg-white/5 p-4">
            <div className="flex items-center gap-6 flex-wrap">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isInteractive}
                  onChange={(e) => setFormData({ ...formData, isInteractive: e.target.checked })}
                  className="h-4 w-4 border-white/10 rounded-sm bg-white/5 focus:ring-white/20"
                />
                <span className="ml-2 text-sm font-light text-white">Interactive (with questions)</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.canRead}
                  onChange={(e) => setFormData({ ...formData, canRead: e.target.checked })}
                  className="h-4 w-4 border-white/10 rounded-sm bg-white/5 focus:ring-white/20"
                />
                <span className="ml-2 text-sm font-light text-white">Can Read</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.canListen}
                  onChange={(e) => setFormData({ ...formData, canListen: e.target.checked })}
                  className="h-4 w-4 border-white/10 rounded-sm bg-white/5 focus:ring-white/20"
                />
                <span className="ml-2 text-sm font-light text-white">Can Listen</span>
              </label>
            </div>
          </div>

          {formData.isInteractive && (
            <div className="border-t border-white/10 pt-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-sm font-light text-white tracking-wider uppercase">Interactive Questions</h3>
                  <p className="text-xs text-white/40">Add quiz questions for this lesson</p>
                </div>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="px-4 py-2.5 bg-white/5 text-white rounded-sm border border-white/20 hover:bg-white/10 hover:border-white/30 text-xs font-light tracking-wider uppercase transition-all"
                >
                  + Add Question
                </button>
              </div>

              {formData.questions.length === 0 ? (
                <div className="text-center py-8 bg-zinc-800 rounded-xl border border-zinc-700 border-dashed">
                  <p className="text-white/40 text-sm">No questions added yet. Click &quot;Add Question&quot; to start.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.questions.map((q, index) => (
                    <div key={index} className="border border-white/10 rounded-sm bg-white/5 p-4">
                      <div className="flex justify-between mb-3">
                        <span className="text-xs font-light tracking-wider uppercase text-white">Question {index + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeQuestion(index)}
                          className="text-red-400 hover:text-red-300 text-xs font-light tracking-wider uppercase"
                        >
                          Remove
                        </button>
                      </div>
                      <input
                        type="text"
                        value={q.question}
                        onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                        placeholder="Enter question text..."
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-white/30 mb-3 focus:bg-white/10 focus:border-white/20 transition-all"
                      />
                      <div className="space-y-2 mb-3">
                        {q.options.map((opt, optIndex) => (
                          <input
                            key={optIndex}
                            type="text"
                            value={opt}
                            onChange={(e) => updateQuestion(index, 'option', [optIndex, e.target.value])}
                            placeholder={`Option ${optIndex + 1}`}
                            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-white/30 focus:bg-white/10 focus:border-white/20 transition-all"
                          />
                        ))}
                      </div>
                      <select
                        value={q.correctAnswer}
                        onChange={(e) => updateQuestion(index, 'correctAnswer', parseInt(e.target.value))}
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white focus:bg-white/10 focus:border-white/20 transition-all"
                      >
                        <option value={0}>Option 1 is correct</option>
                        <option value={1}>Option 2 is correct</option>
                        <option value={2}>Option 3 is correct</option>
                      </select>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-white/5 text-white rounded-sm border border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-300 font-light text-sm tracking-wider uppercase disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Lesson'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-8 py-3 bg-white/5 text-white rounded-sm border border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-300 font-light text-sm tracking-wider uppercase"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

