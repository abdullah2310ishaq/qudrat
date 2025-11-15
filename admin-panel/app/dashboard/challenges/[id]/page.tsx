'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Lesson {
  _id: string;
  title: string;
}

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface DailyQuestion {
  day: number;
  lessonId: string;
  questions: Question[];
}

interface Challenge {
  _id: string;
  title: string;
  description: string;
  duration: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  lessons: string[];
  interactiveQuestions: DailyQuestion[];
  isActive: boolean;
}

export default function EditChallengePage() {
  const router = useRouter();
  const params = useParams();
  const challengeId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [formData, setFormData] = useState<Challenge>({
    _id: '',
    title: '',
    description: '',
    duration: 7,
    level: 'Beginner',
    lessons: [],
    interactiveQuestions: [],
    isActive: true,
  });

  useEffect(() => {
    if (challengeId) {
      fetchChallenge();
      fetchLessons();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challengeId]);

  const fetchChallenge = async () => {
    try {
      const res = await fetch(`/api/challenges/${challengeId}`);
      const data = await res.json();
      if (data.success) {
        const challenge = data.data;
        setFormData({
          ...challenge,
          lessons: challenge.lessons?.map((l: { _id?: string; toString?: () => string }) => l._id || l.toString?.() || '') || [],
          interactiveQuestions: challenge.interactiveQuestions || [],
        });
      } else {
        alert('Challenge not found');
        router.push('/dashboard/challenges');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error fetching challenge:', errorMessage);
      alert('Error loading challenge: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchLessons = async () => {
    try {
      const res = await fetch('/api/lessons');
      const data = await res.json();
      if (data.success) {
        setLessons(data.data || []);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error fetching lessons:', errorMessage);
    }
  };

  const addDailyQuestion = () => {
    const newDay = formData.interactiveQuestions.length + 1;
    setFormData({
      ...formData,
      interactiveQuestions: [
        ...formData.interactiveQuestions,
        {
          day: newDay,
          lessonId: '',
          questions: [],
        },
      ],
    });
  };

  const updateDailyQuestion = (index: number, field: keyof DailyQuestion, value: number | string | Question[]) => {
    const newDailyQuestions = [...formData.interactiveQuestions];
    const dailyQ = newDailyQuestions[index];
    if (field === 'day') dailyQ.day = value as number;
    else if (field === 'lessonId') dailyQ.lessonId = value as string;
    else if (field === 'questions') dailyQ.questions = value as Question[];
    setFormData({ ...formData, interactiveQuestions: newDailyQuestions });
  };

  const addQuestionToDay = (dayIndex: number) => {
    const newDailyQuestions = [...formData.interactiveQuestions];
    newDailyQuestions[dayIndex].questions.push({
      question: '',
      options: ['', '', ''],
      correctAnswer: 0,
    });
    setFormData({ ...formData, interactiveQuestions: newDailyQuestions });
  };

  const updateQuestion = (dayIndex: number, questionIndex: number, field: string, value: string | number | [number, string]) => {
    const newDailyQuestions = [...formData.interactiveQuestions];
    const question = newDailyQuestions[dayIndex].questions[questionIndex];
    
    if (field === 'option') {
      const [optIndex, optValue] = value as [number, string];
      question.options[optIndex] = optValue;
    } else if (field === 'question') {
      question.question = value as string;
    } else if (field === 'correctAnswer') {
      question.correctAnswer = value as number;
    }
    
    setFormData({ ...formData, interactiveQuestions: newDailyQuestions });
  };

  const removeQuestion = (dayIndex: number, questionIndex: number) => {
    const newDailyQuestions = [...formData.interactiveQuestions];
    newDailyQuestions[dayIndex].questions = newDailyQuestions[dayIndex].questions.filter((_, i) => i !== questionIndex);
    setFormData({ ...formData, interactiveQuestions: newDailyQuestions });
  };

  const removeDailyQuestion = (index: number) => {
    setFormData({
      ...formData,
      interactiveQuestions: formData.interactiveQuestions.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/challenges/${challengeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        alert('Challenge updated successfully!');
        router.push('/dashboard/challenges');
      } else {
        alert('Error updating challenge: ' + data.error);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error updating challenge:', errorMessage);
      alert('Error updating challenge: ' + errorMessage);
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
        <h1 className="text-4xl font-bold text-white mb-2">Edit Challenge</h1>
        <p className="text-zinc-400">Manage challenge details and daily lessons with questions</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800 p-8 max-w-2xl">
          <h2 className="text-2xl font-bold text-white mb-6">Basic Information</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:ring-2 focus:ring-white focus:border-white transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Description *
              </label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:ring-2 focus:ring-white focus:border-white transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Duration (days) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 7 })}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:ring-2 focus:ring-white focus:border-white transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Level *
                </label>
                <select
                  required
                  value={formData.level}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      level: e.target.value as 'Beginner' | 'Intermediate' | 'Advanced',
                    })
                  }
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:ring-2 focus:ring-white focus:border-white transition-all"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 text-white bg-zinc-800 border-zinc-700 rounded focus:ring-white"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-white">
                Active
              </label>
            </div>
          </div>
        </div>

        {/* Daily Questions */}
        <div className="bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800 p-8 max-w-4xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Daily Lessons & Questions</h2>
              <p className="text-zinc-400 text-sm mt-1">Add lesson and questions for each day</p>
            </div>
            <button
              type="button"
              onClick={addDailyQuestion}
              className="px-6 py-2 bg-white text-black rounded-xl hover:bg-zinc-200 transition-all font-semibold"
            >
              + Add Day
            </button>
          </div>

          {formData.interactiveQuestions.length === 0 ? (
            <div className="text-center py-12 bg-zinc-800 rounded-xl border border-zinc-700 border-dashed">
              <p className="text-zinc-400 mb-4">No daily questions added yet</p>
              <button
                type="button"
                onClick={addDailyQuestion}
                className="px-6 py-2 bg-white text-black rounded-xl hover:bg-zinc-200 transition-all font-semibold"
              >
                Add First Day
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {formData.interactiveQuestions.map((dailyQ, dayIndex) => (
                <div key={dayIndex} className="bg-zinc-800 rounded-xl p-6 border border-zinc-700">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-white">Day {dailyQ.day}</h3>
                    <button
                      type="button"
                      onClick={() => removeDailyQuestion(dayIndex)}
                      className="text-red-400 hover:text-red-300 font-semibold"
                    >
                      Remove Day
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Day Number
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={dailyQ.day}
                        onChange={(e) => updateDailyQuestion(dayIndex, 'day', parseInt(e.target.value) || 1)}
                        className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white focus:ring-2 focus:ring-white focus:border-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Lesson for This Day *
                      </label>
                      <select
                        required
                        value={dailyQ.lessonId}
                        onChange={(e) => updateDailyQuestion(dayIndex, 'lessonId', e.target.value)}
                        className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white focus:ring-2 focus:ring-white focus:border-white"
                      >
                        <option value="">Select a lesson</option>
                        {lessons.map((lesson) => (
                          <option key={lesson._id} value={lesson._id}>
                            {lesson.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="border-t border-zinc-700 pt-4">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-semibold text-white">Questions</h4>
                        <button
                          type="button"
                          onClick={() => addQuestionToDay(dayIndex)}
                          className="px-4 py-2 bg-white text-black rounded-xl hover:bg-zinc-200 text-sm font-semibold"
                        >
                          + Add Question
                        </button>
                      </div>

                      {dailyQ.questions.map((q, qIndex) => (
                        <div key={qIndex} className="bg-zinc-900 rounded-xl p-4 mb-4 border border-zinc-700">
                          <div className="flex justify-between mb-3">
                            <span className="text-sm font-semibold text-white">Question {qIndex + 1}</span>
                            <button
                              type="button"
                              onClick={() => removeQuestion(dayIndex, qIndex)}
                              className="text-red-400 hover:text-red-300 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                          <input
                            type="text"
                            value={q.question}
                            onChange={(e) => updateQuestion(dayIndex, qIndex, 'question', e.target.value)}
                            placeholder="Question text..."
                            className="w-full px-3 py-2 bg-black border border-zinc-700 rounded-xl text-white placeholder-zinc-500 mb-3 focus:ring-2 focus:ring-white focus:border-white"
                          />
                          <div className="space-y-2 mb-3">
                            {q.options.map((opt, optIndex) => (
                              <input
                                key={optIndex}
                                type="text"
                                value={opt}
                                onChange={(e) => updateQuestion(dayIndex, qIndex, 'option', [optIndex, e.target.value])}
                                placeholder={`Option ${optIndex + 1}`}
                                className="w-full px-3 py-2 bg-black border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:ring-2 focus:ring-white focus:border-white"
                              />
                            ))}
                          </div>
                          <select
                            value={q.correctAnswer}
                            onChange={(e) => updateQuestion(dayIndex, qIndex, 'correctAnswer', parseInt(e.target.value))}
                            className="w-full px-3 py-2 bg-black border border-zinc-700 rounded-xl text-white focus:ring-2 focus:ring-white focus:border-white"
                          >
                            <option value={0}>Option 1 is correct</option>
                            <option value={1}>Option 2 is correct</option>
                            <option value={2}>Option 3 is correct</option>
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-white text-black rounded-xl hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
          >
            {saving ? 'Saving...' : 'Save Challenge'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-8 py-3 bg-zinc-800 text-white rounded-xl hover:bg-zinc-700 transition-all duration-200 font-semibold border border-zinc-700"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
