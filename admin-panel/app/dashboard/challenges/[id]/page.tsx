'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface ChallengeDay {
  _id?: string;
  challengeId: string;
  day: number;
  content: string;
  photos?: string[];
  media?: string[];
  questions?: Question[];
}

interface Challenge {
  _id: string;
  title: string;
  description: string;
  duration: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  isActive: boolean;
}

export default function EditChallengePage() {
  const router = useRouter();
  const params = useParams();
  const challengeId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [challengeDays, setChallengeDays] = useState<ChallengeDay[]>([]);
  const [formData, setFormData] = useState<Challenge>({
    _id: '',
    title: '',
    description: '',
    duration: 7,
    level: 'Beginner',
    isActive: true,
  });

  useEffect(() => {
    if (challengeId) {
      fetchChallenge();
      fetchChallengeDays();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challengeId]);

  const fetchChallenge = async () => {
    try {
      const res = await fetch(`/api/challenges/${challengeId}`);
      const data = await res.json();
      if (data.success) {
        const challengeData = data.data;
        setChallenge(challengeData);
        setFormData(challengeData);
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

  const fetchChallengeDays = async () => {
    try {
      const res = await fetch(`/api/challengeDays?challengeId=${challengeId}`);
      const data = await res.json();
      if (data.success) {
        // Ensure all days have content as string
        const daysWithContent = (data.data || []).map((day: ChallengeDay) => ({
          ...day,
          content: String(day.content || ''),
        }));
        setChallengeDays(daysWithContent);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error fetching challenge days:', errorMessage);
    }
  };

  const generateDaysFromDuration = async () => {
    if (!confirm(`Generate ${formData.duration} days based on duration? This will create days 1 to ${formData.duration}.`)) {
      return;
    }
    
    const existingDays = challengeDays.map(d => d.day);
    const newDays: ChallengeDay[] = [];
    
    for (let day = 1; day <= formData.duration; day++) {
      if (!existingDays.includes(day)) {
        try {
          const res = await fetch('/api/challengeDays', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              challengeId,
              day,
              content: `Content for Day ${day}`,
              photos: [],
              media: [],
              questions: [],
            }),
          });
          const data = await res.json();
          if (data.success) {
            newDays.push(data.data);
          }
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error(`Error creating day ${day}:`, errorMessage);
        }
      }
    }
    
    if (newDays.length > 0) {
      // Ensure all new days have content as string
      const daysWithContent = newDays.map(day => ({
        ...day,
        content: String(day.content || ''),
      }));
      setChallengeDays(prevDays => [...prevDays, ...daysWithContent].sort((a, b) => a.day - b.day));
    }
  };

  const addDay = async () => {
    const nextDay = challengeDays.length > 0 
      ? Math.max(...challengeDays.map(d => d.day)) + 1 
      : 1;
    
    try {
      const res = await fetch('/api/challengeDays', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeId,
          day: nextDay,
          content: `Content for Day ${nextDay}`,
          photos: [],
          media: [],
          questions: [],
        }),
      });
      const data = await res.json();
      if (data.success) {
        // Ensure content is a string when adding new day
        const newDay = {
          ...data.data,
          content: String(data.data.content || ''),
        };
        setChallengeDays(prevDays => [...prevDays, newDay].sort((a, b) => a.day - b.day));
      } else {
        alert('Error creating day: ' + data.error);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error creating day:', errorMessage);
      alert('Error creating day: ' + errorMessage);
    }
  };

  const deleteDay = async (dayId: string) => {
    if (!confirm('Are you sure you want to delete this day?')) {
      return;
    }
    
    try {
      const res = await fetch(`/api/challengeDays/${dayId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setChallengeDays(challengeDays.filter(d => d._id !== dayId));
      } else {
        alert('Error deleting day: ' + data.error);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error deleting day:', errorMessage);
      alert('Error deleting day: ' + errorMessage);
    }
  };

  const addQuestionToDay = (dayId: string) => {
    // Only update local state, don't save to server
    setChallengeDays(prevDays =>
      prevDays.map(d => {
        if (d._id === dayId) {
          return {
            ...d,
            questions: [...(d.questions || []), {
              question: '',
              options: ['', '', '', ''],
              correctAnswer: 0,
              explanation: '',
            }],
          };
        }
        return d;
      })
    );
  };

  const removeQuestion = (dayId: string, questionIndex: number) => {
    // Only update local state, don't save to server
    setChallengeDays(prevDays =>
      prevDays.map(d => {
        if (d._id === dayId && d.questions) {
          return {
            ...d,
            questions: d.questions.filter((_, i) => i !== questionIndex),
          };
        }
        return d;
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // First update the challenge basic info
      const challengeRes = await fetch(`/api/challenges/${challengeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const challengeData = await challengeRes.json();
      if (!challengeData.success) {
        alert('Error updating challenge: ' + challengeData.error);
        setSaving(false);
        return;
      }

      // Then save all challenge days
      const savePromises = challengeDays.map(async (day) => {
        if (!day._id) return;
        
        const updatePayload = {
          day: day.day,
          content: String(day.content || ''), // Allow empty content
          photos: day.photos || [],
          media: day.media || [],
          questions: day.questions || [],
        };

        const res = await fetch(`/api/challengeDays/${day._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatePayload),
        });
        return res.json();
      });

      const results = await Promise.all(savePromises);
      const failed = results.filter(r => !r.success);
      
      if (failed.length > 0) {
        alert(`Error updating ${failed.length} day(s). Please try again.`);
      } else {
        alert('Challenge updated successfully!');
        router.push('/dashboard/challenges');
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
        <p className="text-zinc-400">Manage challenge details and daily content</p>
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

        {/* Daily Content */}
        <div className="bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800 p-8 max-w-4xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Daily Content</h2>
              <p className="text-zinc-400 text-sm mt-1">
                Add content for each day. Duration: {formData.duration} days | Current: {challengeDays.length} day(s) added
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={generateDaysFromDuration}
                className="px-4 py-2 bg-zinc-800 text-white border border-zinc-700 rounded-xl hover:bg-zinc-700 transition-all text-sm font-semibold"
                title="Auto-generate days 1 to duration"
              >
                Generate {formData.duration} Days
              </button>
              <button
                type="button"
                onClick={addDay}
                className="px-6 py-2 bg-white text-black rounded-xl hover:bg-zinc-200 transition-all font-semibold"
              >
                + Add Day
              </button>
            </div>
          </div>

          {challengeDays.length === 0 ? (
            <div className="text-center py-12 bg-zinc-800 rounded-xl border border-zinc-700 border-dashed">
              <p className="text-zinc-400 mb-4">No daily content added yet</p>
              <button
                type="button"
                onClick={addDay}
                className="px-6 py-2 bg-white text-black rounded-xl hover:bg-zinc-200 transition-all font-semibold"
              >
                Add First Day
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {challengeDays.map((day) => (
                <div key={day._id} className="bg-zinc-800 rounded-xl p-6 border border-zinc-700">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-white">Day {day.day}</h3>
                    <button
                      type="button"
                      onClick={() => day._id && deleteDay(day._id)}
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
                        value={day.day}
                        onChange={(e) => {
                          // Only update local state, don't save to server
                          if (day._id) {
                            setChallengeDays(prevDays =>
                              prevDays.map(d =>
                                d._id === day._id
                                  ? { ...d, day: parseInt(e.target.value) || 1 }
                                  : d
                              )
                            );
                          }
                        }}
                        className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white focus:ring-2 focus:ring-white focus:border-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Content <span className="text-zinc-400 text-xs">(Paragraph or any text content - Optional)</span>
                      </label>
                      <textarea
                        rows={6}
                        value={day.content || ''}
                        onChange={(e) => {
                          // Only update local state, don't save to server
                          if (day._id) {
                            setChallengeDays(prevDays =>
                              prevDays.map(d =>
                                d._id === day._id
                                  ? { ...d, content: e.target.value }
                                  : d
                              )
                            );
                          }
                        }}
                        placeholder="Enter the content for this day (paragraphs, instructions, etc.) - Can be left empty"
                        className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:ring-2 focus:ring-white focus:border-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Photos <span className="text-zinc-400 text-xs">(Base64 encoded, one per line)</span>
                      </label>
                      <textarea
                        rows={3}
                        value={(day.photos || []).join('\n')}
                        onChange={(e) => {
                          // Only update local state, don't save to server
                          if (day._id) {
                            setChallengeDays(prevDays =>
                              prevDays.map(d =>
                                d._id === day._id
                                  ? { ...d, photos: e.target.value.split('\n').filter(p => p.trim()) }
                                  : d
                              )
                            );
                          }
                        }}
                        placeholder="Enter Base64 encoded images, one per line (optional)"
                        className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:ring-2 focus:ring-white focus:border-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Media URLs <span className="text-zinc-400 text-xs">(External URLs, one per line)</span>
                      </label>
                      <textarea
                        rows={3}
                        value={(day.media || []).join('\n')}
                        onChange={(e) => {
                          // Only update local state, don't save to server
                          if (day._id) {
                            setChallengeDays(prevDays =>
                              prevDays.map(d =>
                                d._id === day._id
                                  ? { ...d, media: e.target.value.split('\n').filter(m => m.trim()) }
                                  : d
                              )
                            );
                          }
                        }}
                        placeholder="Enter external media URLs, one per line (optional)"
                        className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:ring-2 focus:ring-white focus:border-white text-xs"
                      />
                    </div>

                    <div className="border-t border-zinc-700 pt-4">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-semibold text-white">Questions (Optional)</h4>
                        <button
                          type="button"
                          onClick={() => day._id && addQuestionToDay(day._id)}
                          className="px-4 py-2 bg-white text-black rounded-xl hover:bg-zinc-200 text-sm font-semibold"
                        >
                          + Add Question
                        </button>
                      </div>

                      {(day.questions || []).map((q, qIndex) => (
                        <div key={qIndex} className="bg-zinc-900 rounded-xl p-4 mb-4 border border-zinc-700">
                          <div className="flex justify-between mb-3">
                            <span className="text-sm font-semibold text-white">Question {qIndex + 1}</span>
                            <button
                              type="button"
                              onClick={() => day._id && removeQuestion(day._id, qIndex)}
                              className="text-red-400 hover:text-red-300 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                          <input
                            type="text"
                            value={q.question}
                            onChange={(e) => {
                              // Only update local state
                              if (day._id) {
                                setChallengeDays(prevDays =>
                                  prevDays.map(d => {
                                    if (d._id === day._id && d.questions) {
                                      const updatedQuestions = [...d.questions];
                                      updatedQuestions[qIndex] = {
                                        ...updatedQuestions[qIndex],
                                        question: e.target.value,
                                      };
                                      return { ...d, questions: updatedQuestions };
                                    }
                                    return d;
                                  })
                                );
                              }
                            }}
                            placeholder="Question text..."
                            className="w-full px-3 py-2 bg-black border border-zinc-700 rounded-xl text-white placeholder-zinc-500 mb-3 focus:ring-2 focus:ring-white focus:border-white"
                          />
                          <div className="space-y-2 mb-3">
                            {q.options.map((opt, optIndex) => (
                              <input
                                key={optIndex}
                                type="text"
                                value={opt}
                                onChange={(e) => {
                                  // Only update local state
                                  if (day._id) {
                                    setChallengeDays(prevDays =>
                                      prevDays.map(d => {
                                        if (d._id === day._id && d.questions) {
                                          const updatedQuestions = [...d.questions];
                                          updatedQuestions[qIndex] = {
                                            ...updatedQuestions[qIndex],
                                            options: updatedQuestions[qIndex].options.map((o, i) =>
                                              i === optIndex ? e.target.value : o
                                            ),
                                          };
                                          return { ...d, questions: updatedQuestions };
                                        }
                                        return d;
                                      })
                                    );
                                  }
                                }}
                                placeholder={`Option ${optIndex + 1}`}
                                className="w-full px-3 py-2 bg-black border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:ring-2 focus:ring-white focus:border-white"
                              />
                            ))}
                          </div>
                          <select
                            value={q.correctAnswer}
                            onChange={(e) => {
                              // Only update local state
                              if (day._id) {
                                setChallengeDays(prevDays =>
                                  prevDays.map(d => {
                                    if (d._id === day._id && d.questions) {
                                      const updatedQuestions = [...d.questions];
                                      updatedQuestions[qIndex] = {
                                        ...updatedQuestions[qIndex],
                                        correctAnswer: parseInt(e.target.value),
                                      };
                                      return { ...d, questions: updatedQuestions };
                                    }
                                    return d;
                                  })
                                );
                              }
                            }}
                            className="w-full px-3 py-2 bg-black border border-zinc-700 rounded-xl text-white focus:ring-2 focus:ring-white focus:border-white mb-3"
                          >
                            <option value={0}>Option 1 is correct</option>
                            <option value={1}>Option 2 is correct</option>
                            <option value={2}>Option 3 is correct</option>
                            <option value={3}>Option 4 is correct</option>
                          </select>
                          <input
                            type="text"
                            value={q.explanation || ''}
                            onChange={(e) => {
                              // Only update local state
                              if (day._id) {
                                setChallengeDays(prevDays =>
                                  prevDays.map(d => {
                                    if (d._id === day._id && d.questions) {
                                      const updatedQuestions = [...d.questions];
                                      updatedQuestions[qIndex] = {
                                        ...updatedQuestions[qIndex],
                                        explanation: e.target.value,
                                      };
                                      return { ...d, questions: updatedQuestions };
                                    }
                                    return d;
                                  })
                                );
                              }
                            }}
                            placeholder="Explanation (optional)"
                            className="w-full px-3 py-2 bg-black border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:ring-2 focus:ring-white focus:border-white"
                          />
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
