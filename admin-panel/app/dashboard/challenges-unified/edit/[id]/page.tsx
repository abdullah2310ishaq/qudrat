'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/components/Toast';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface ChallengeDay {
  _id?: string;
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
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const challengeId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [challengeForm, setChallengeForm] = useState<Challenge>({
    _id: '',
    title: '',
    description: '',
    duration: 7,
    level: 'Beginner',
    isActive: true,
  });
  const [days, setDays] = useState<ChallengeDay[]>([]);

  useEffect(() => {
    if (challengeId) {
      fetchChallenge();
      fetchDays();
    }
  }, [challengeId]);

  const fetchChallenge = async () => {
    try {
      const res = await fetch(`/api/challenges/${challengeId}`);
      const data = await res.json();
      if (data.success) {
        setChallengeForm(data.data);
      }
    } catch (error) {
      console.error('Error fetching challenge:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDays = async () => {
    try {
      const res = await fetch(`/api/challengeDays?challengeId=${challengeId}`);
      const data = await res.json();
      if (data.success) {
        const sortedDays = (data.data || []).sort((a: ChallengeDay, b: ChallengeDay) => a.day - b.day);
        setDays(sortedDays);
      }
    } catch (error) {
      console.error('Error fetching days:', error);
    }
  };

  const generateMissingDays = () => {
    const existingDays = days.map(d => d.day);
    const newDays: ChallengeDay[] = [];
    
    for (let i = 1; i <= challengeForm.duration; i++) {
      if (!existingDays.includes(i)) {
        newDays.push({
          day: i,
          content: '',
          photos: [],
          media: [],
          questions: [],
        });
      }
    }
    
    if (newDays.length > 0) {
      setDays([...days, ...newDays].sort((a, b) => a.day - b.day));
      toast.success(`Generated ${newDays.length} missing day(s)!`);
    } else {
      toast.error('All days already exist!');
    }
  };

  const addDay = () => {
    const nextDay = days.length > 0 ? Math.max(...days.map(d => d.day)) + 1 : 1;
    setDays([...days, {
      day: nextDay,
      content: '',
      photos: [],
      media: [],
      questions: [],
    }].sort((a, b) => a.day - b.day));
    toast.success(`Added Day ${nextDay}`);
  };

  const updateDay = (dayIndex: number, field: keyof ChallengeDay, value: string | number | string[] | Question[]) => {
    const newDays = [...days];
    (newDays[dayIndex] as any)[field] = value;
    setDays(newDays);
  };

  const handleDayImageUpload = (dayIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('⚠️ Image is too large. Maximum size: 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const newDays = [...days];
      if (!newDays[dayIndex].photos) newDays[dayIndex].photos = [];
      newDays[dayIndex].photos!.push(base64);
      setDays(newDays);
      toast.success('Image uploaded successfully!');
    };
    reader.onerror = () => {
      toast.error('❌ Error reading file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleDayAudioUpload = (dayIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('⚠️ Audio is too large. Maximum size: 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const newDays = [...days];
      if (!newDays[dayIndex].media) newDays[dayIndex].media = [];
      // Remove old audio if exists
      newDays[dayIndex].media = newDays[dayIndex].media!.filter(m => !m.startsWith('data:audio'));
      newDays[dayIndex].media!.push(base64);
      setDays(newDays);
      toast.success('Audio uploaded successfully!');
    };
    reader.onerror = () => {
      toast.error('❌ Error reading file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const addQuestionToDay = (dayIndex: number) => {
    const newDays = [...days];
    if (!newDays[dayIndex].questions) newDays[dayIndex].questions = [];
    newDays[dayIndex].questions!.push({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
    });
    setDays(newDays);
  };

  const updateQuestionInDay = (dayIndex: number, questionIndex: number, field: keyof Question, value: string | number | string[]) => {
    const newDays = [...days];
    const questions = [...(newDays[dayIndex].questions || [])];
    (questions[questionIndex] as any)[field] = value;
    newDays[dayIndex].questions = questions;
    setDays(newDays);
  };

  const removeQuestionFromDay = (dayIndex: number, questionIndex: number) => {
    const newDays = [...days];
    newDays[dayIndex].questions!.splice(questionIndex, 1);
    setDays(newDays);
  };

  const removeDay = (dayIndex: number) => {
    const day = days[dayIndex];
    if (day._id) {
      // Delete from server
      handleDeleteDay(day._id, day.day);
    } else {
      // Just remove from local state
      setDays(days.filter((_, i) => i !== dayIndex));
    }
  };

  const handleDeleteDay = async (dayId: string, dayNumber: number) => {
    if (!confirm(`⚠️ Are you sure you want to delete Day ${dayNumber}?`)) {
      return;
    }

    const deleteToastId = toast.loading('Deleting day...');
    try {
      const res = await fetch(`/api/challengeDays/${dayId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      toast.removeToast(deleteToastId);
      if (data.success) {
        toast.success('✅ Day deleted successfully!');
        fetchDays();
      } else {
        toast.error('❌ Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting day:', error);
      toast.removeToast(deleteToastId);
      toast.error('❌ Error deleting day');
    }
  };

  const handleUpdateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const updateToastId = toast.loading('Updating challenge...');
    
    try {
      // Update challenge basic info
      const challengeRes = await fetch(`/api/challenges/${challengeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(challengeForm),
      });
      const challengeData = await challengeRes.json();
      
      if (!challengeData.success) {
        toast.removeToast(updateToastId);
        toast.error('❌ Error updating challenge: ' + challengeData.error);
        return;
      }

      // Update/create all days
      const dayPromises = days.map(async (day) => {
        const mediaArray: string[] = day.media || [];
        // Ensure audio is in media array
        const hasAudio = mediaArray.some(m => m.startsWith('data:audio'));
        if (!hasAudio && day.media) {
          // Check if there's audio in media
          const audio = day.media.find(m => m.startsWith('data:audio'));
          if (audio) mediaArray.push(audio);
        }

        const payload = {
          day: day.day,
          content: String(day.content || ''),
          photos: day.photos || [],
          media: mediaArray,
          questions: (day.questions || []).filter(q => q.question.trim() && q.options.some(opt => opt.trim())),
        };

        if (day._id) {
          // Update existing day
          const res = await fetch(`/api/challengeDays/${day._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          return res.json();
        } else {
          // Create new day
          const res = await fetch('/api/challengeDays', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              challengeId,
              ...payload,
            }),
          });
          return res.json();
        }
      });

      const dayResults = await Promise.all(dayPromises);
      const failed = dayResults.filter(r => !r.success);
      
      toast.removeToast(updateToastId);
      
      if (failed.length > 0) {
        toast.error(`⚠️ Updated challenge but ${failed.length} day(s) failed. Please try again.`);
      } else {
        toast.success(`✅ Challenge updated successfully with ${days.length} day(s)!`);
        router.push(`/dashboard/challenges-unified/view/${challengeId}`);
      }
    } catch (error) {
      console.error('Error updating challenge:', error);
      toast.removeToast(updateToastId);
      toast.error('❌ Error updating challenge');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteChallenge = async () => {
    if (!confirm(`⚠️ Are you sure you want to delete "${challengeForm.title}"?\n\nThis will also delete all ${days.length} day(s). This action cannot be undone!`)) {
      return;
    }

    setDeleting(true);
    const deleteToastId = toast.loading('Deleting challenge...');
    try {
      const res = await fetch(`/api/challenges/${challengeId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      toast.removeToast(deleteToastId);
      if (data.success) {
        toast.success('✅ Challenge deleted successfully!');
        router.push('/dashboard/challenges-unified');
      } else {
        toast.error('❌ Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting challenge:', error);
      toast.removeToast(deleteToastId);
      toast.error('❌ Error deleting challenge');
    } finally {
      setDeleting(false);
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
        {/* Header */}
        <div className="mb-4">
          <Link
            href={`/dashboard/challenges-unified/view/${challengeId}`}
            className="inline-block mb-2 text-black/70 hover:text-black font-medium text-xs"
          >
            ← Back to Challenge
          </Link>
          <h1 className="text-lg font-bold text-black mb-1">✏️ Edit Challenge</h1>
          <p className="text-black/70 text-xs">Update challenge details and daily content</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded border border-black shadow-md p-4">
          <form onSubmit={handleUpdateChallenge} className="space-y-3">
            {/* Basic Challenge Info */}
            <div>
              <label className="block text-black font-semibold mb-1 text-xs">
                Challenge Title <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={challengeForm.title}
                onChange={(e) => setChallengeForm({ ...challengeForm, title: e.target.value })}
                className="w-full px-2 py-1.5 bg-white border border-black/20 rounded text-black focus:border-black focus:outline-none text-xs font-medium placeholder:text-black/50"
                style={{ color: '#000' }}
              />
            </div>

            <div>
              <label className="block text-black font-semibold mb-1 text-xs">
                Description <span className="text-red-600">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={challengeForm.description}
                onChange={(e) => setChallengeForm({ ...challengeForm, description: e.target.value })}
                className="w-full px-2 py-1.5 bg-white border border-black/20 rounded text-black focus:border-black focus:outline-none text-xs placeholder:text-black/50"
                style={{ color: '#000' }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-black font-semibold mb-1 text-xs">
                  Duration (days) <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={challengeForm.duration}
                  onChange={(e) => setChallengeForm({ ...challengeForm, duration: parseInt(e.target.value) || 1 })}
                  className="w-full px-2 py-1.5 bg-white border border-black/20 rounded text-black focus:border-black focus:outline-none text-xs font-medium"
                  style={{ color: '#000' }}
                />
              </div>

              <div>
                <label className="block text-black font-semibold mb-1 text-xs">
                  Level <span className="text-red-600">*</span>
                </label>
                <select
                  required
                  value={challengeForm.level}
                  onChange={(e) => setChallengeForm({ ...challengeForm, level: e.target.value as 'Beginner' | 'Intermediate' | 'Advanced' })}
                  className="w-full px-2 py-1.5 bg-white border border-black/20 rounded text-black focus:border-black focus:outline-none text-xs font-medium"
                  style={{ color: '#000' }}
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
                checked={challengeForm.isActive}
                onChange={(e) => setChallengeForm({ ...challengeForm, isActive: e.target.checked })}
                className="w-4 h-4 mr-2"
              />
              <label htmlFor="isActive" className="text-black font-semibold text-xs cursor-pointer">
                Challenge is Active (visible to users)
              </label>
            </div>

            {/* Days Section */}
            <div className="border-t border-black/10 pt-3">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h3 className="text-black font-semibold text-xs mb-0.5">📅 Daily Content ({days.length}/{challengeForm.duration} days)</h3>
                  <p className="text-black/60 text-xs">Add content, images, audio, and quiz questions for each day</p>
                </div>
                <div className="flex gap-1.5">
                  {days.length < challengeForm.duration && (
                    <button
                      type="button"
                      onClick={generateMissingDays}
                      className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold text-xs"
                    >
                      Generate Missing
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={addDay}
                    className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 font-semibold text-xs"
                  >
                    ➕ Add Day
                  </button>
                </div>
              </div>

              {days.length === 0 ? (
                <div className="text-center py-6 bg-cream-50 rounded border border-dashed border-black/20">
                  <div className="text-3xl mb-2">📅</div>
                  <p className="text-black/70 text-xs mb-1 font-semibold">No days added yet</p>
                  <p className="text-black/50 text-xs mb-3">Click "Generate Missing" or "Add Day" to start</p>
                  <button
                    type="button"
                    onClick={generateMissingDays}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold text-xs"
                  >
                    ➕ Generate {challengeForm.duration} Days
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                  {days.map((day, dayIndex) => (
                    <div key={dayIndex} className="bg-cream-50 rounded border-2 border-black/30 p-3 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-black text-white rounded text-xs font-bold">Day {day.day}</span>
                        <h4 className="text-black font-semibold text-xs">Daily Content</h4>
                        <button
                          type="button"
                          onClick={() => removeDay(dayIndex)}
                          className="ml-auto px-2 py-0.5 text-red-600 hover:text-red-700 font-semibold text-xs"
                        >
                          Remove
                        </button>
                      </div>

                      <textarea
                        rows={3}
                        value={day.content}
                        onChange={(e) => updateDay(dayIndex, 'content', e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-black/20 rounded text-black focus:border-black focus:outline-none text-xs mb-2 placeholder:text-black/50"
                        placeholder={`Content for Day ${day.day}...`}
                        style={{ color: '#000' }}
                      />

                      <div className="flex gap-1.5 mb-2 flex-wrap">
                        <label className="px-2 py-1 bg-blue-50 border border-blue-200 rounded text-blue-700 text-xs font-semibold cursor-pointer hover:bg-blue-100 transition-colors">
                          📷 Add Image
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleDayImageUpload(dayIndex, e)}
                            className="hidden"
                          />
                        </label>
                        <label className="px-2 py-1 bg-green-50 border border-green-200 rounded text-green-700 text-xs font-semibold cursor-pointer hover:bg-green-100 transition-colors">
                          🎵 Add Audio
                          <input
                            type="file"
                            accept="audio/*"
                            onChange={(e) => handleDayAudioUpload(dayIndex, e)}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => addQuestionToDay(dayIndex)}
                          className="px-2 py-1 bg-purple-50 border border-purple-200 rounded text-purple-700 text-xs font-semibold hover:bg-purple-100 transition-colors"
                        >
                          ➕ Add Quiz
                        </button>
                      </div>

                      {day.photos && day.photos.length > 0 && (
                        <div className="flex gap-1 mb-2 flex-wrap">
                          {day.photos.map((photo, photoIdx) => (
                            <div key={photoIdx} className="relative">
                              <img src={photo} alt={`Day ${day.day} Image ${photoIdx + 1}`} className="w-16 h-16 object-cover rounded border border-black/20" />
                              <button
                                type="button"
                                onClick={() => {
                                  const newDays = [...days];
                                  newDays[dayIndex].photos!.splice(photoIdx, 1);
                                  setDays(newDays);
                                }}
                                className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {day.media && day.media.some(m => m.startsWith('data:audio')) && (
                        <div className="mb-2">
                          <audio controls src={day.media.find(m => m.startsWith('data:audio'))} className="w-full h-7" />
                          <button
                            type="button"
                            onClick={() => {
                              const newDays = [...days];
                              newDays[dayIndex].media = newDays[dayIndex].media!.filter(m => !m.startsWith('data:audio'));
                              setDays(newDays);
                            }}
                            className="mt-1 px-2 py-0.5 bg-red-600 text-white rounded text-xs font-semibold hover:bg-red-700"
                          >
                            Remove Audio
                          </button>
                        </div>
                      )}

                      {/* Quiz Questions */}
                      {day.questions && day.questions.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-black/10">
                          <h5 className="text-black font-semibold text-xs mb-1.5">🎯 Quiz Questions ({day.questions.length})</h5>
                          <div className="space-y-2">
                            {day.questions.map((question, qIdx) => (
                              <div key={qIdx} className="bg-white rounded border border-black/10 p-2">
                                <div className="flex justify-between items-start mb-1.5">
                                  <span className="text-black font-semibold text-xs">Q{qIdx + 1}</span>
                                  <button
                                    type="button"
                                    onClick={() => removeQuestionFromDay(dayIndex, qIdx)}
                                    className="text-red-600 hover:text-red-700 font-semibold text-xs"
                                  >
                                    Remove
                                  </button>
                                </div>
                                <input
                                  type="text"
                                  value={question.question}
                                  onChange={(e) => updateQuestionInDay(dayIndex, qIdx, 'question', e.target.value)}
                                  className="w-full px-2 py-1 bg-white border border-black/20 rounded text-black focus:border-black focus:outline-none text-xs mb-1.5 placeholder:text-black/50"
                                  placeholder="Enter question..."
                                  style={{ color: '#000' }}
                                />
                                <div className="space-y-1 mb-1.5">
                                  {question.options.map((opt, optIdx) => (
                                    <input
                                      key={optIdx}
                                      type="text"
                                      value={opt}
                                      onChange={(e) => {
                                        const newOptions = [...question.options];
                                        newOptions[optIdx] = e.target.value;
                                        updateQuestionInDay(dayIndex, qIdx, 'options', newOptions);
                                      }}
                                      className="w-full px-2 py-1 bg-white border border-black/20 rounded text-black focus:border-black focus:outline-none text-xs placeholder:text-black/50"
                                      placeholder={`Option ${optIdx + 1}`}
                                      style={{ color: '#000' }}
                                    />
                                  ))}
                                </div>
                                <select
                                  value={question.correctAnswer}
                                  onChange={(e) => updateQuestionInDay(dayIndex, qIdx, 'correctAnswer', parseInt(e.target.value))}
                                  className="w-full px-2 py-1 bg-white border border-black/20 rounded text-black focus:border-black focus:outline-none text-xs font-semibold mb-1"
                                  style={{ color: '#000' }}
                                >
                                  {question.options.map((_, idx) => (
                                    <option key={idx} value={idx}>
                                      Option {idx + 1} is correct
                                    </option>
                                  ))}
                                </select>
                                <input
                                  type="text"
                                  value={question.explanation || ''}
                                  onChange={(e) => updateQuestionInDay(dayIndex, qIdx, 'explanation', e.target.value)}
                                  className="w-full px-2 py-1 bg-white border border-black/20 rounded text-black focus:border-black focus:outline-none text-xs placeholder:text-black/50"
                                  placeholder="Explanation (optional)"
                                  style={{ color: '#000' }}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-3 border-t border-black/10">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-3 py-1.5 bg-black text-white rounded hover:bg-black/90 transition-all font-semibold text-xs disabled:opacity-50"
              >
                {saving ? '⏳ Saving...' : '✅ Save Changes'}
              </button>
              <Link
                href={`/dashboard/challenges-unified/view/${challengeId}`}
                className="px-3 py-1.5 bg-white border border-black/20 text-black rounded hover:bg-black/5 transition-all font-semibold text-xs"
              >
                Cancel
              </Link>
              <button
                type="button"
                onClick={handleDeleteChallenge}
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
