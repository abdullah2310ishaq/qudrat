'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/components/Toast';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface ChallengeDayForm {
  day: number;
  content: string;
  photos: string[];
  audio: string;
  questions: Question[];
}

export default function AddChallengePage() {
  const router = useRouter();
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [challengeForm, setChallengeForm] = useState({
    title: '',
    description: '',
    duration: 7,
    level: 'Beginner' as 'Beginner' | 'Intermediate' | 'Advanced',
    isActive: true,
  });
  const [days, setDays] = useState<ChallengeDayForm[]>([]);

  // Generate days based on duration
  const generateDays = () => {
    const newDays: ChallengeDayForm[] = [];
    for (let i = 1; i <= challengeForm.duration; i++) {
      newDays.push({
        day: i,
        content: '',
        photos: [],
        audio: '',
        questions: [],
      });
    }
    setDays(newDays);
    toast.success(`Generated ${challengeForm.duration} days!`);
  };

  const updateDay = (dayIndex: number, field: keyof ChallengeDayForm, value: string | number | string[] | Question[]) => {
    const newDays = [...days];
    const day = newDays[dayIndex];
    newDays[dayIndex] = { ...day, [field]: value };
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
      newDays[dayIndex].photos.push(base64);
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
      updateDay(dayIndex, 'audio', base64);
      toast.success('Audio uploaded successfully!');
    };
    reader.onerror = () => {
      toast.error('❌ Error reading file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const addQuestionToDay = (dayIndex: number) => {
    const newDays = [...days];
    newDays[dayIndex].questions.push({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
    });
    setDays(newDays);
  };

  const updateQuestionInDay = (
    dayIndex: number,
    questionIndex: number,
    field: keyof Question,
    value: string | number | string[],
  ) => {
    const newDays = [...days];
    const questions = [...newDays[dayIndex].questions];
    const question = questions[questionIndex];
    questions[questionIndex] = { ...question, [field]: value };
    newDays[dayIndex].questions = questions;
    setDays(newDays);
  };

  const removeQuestionFromDay = (dayIndex: number, questionIndex: number) => {
    const newDays = [...days];
    newDays[dayIndex].questions.splice(questionIndex, 1);
    setDays(newDays);
  };

  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (days.length === 0) {
      toast.error('⚠️ Please generate days first by clicking "Generate Days"');
      return;
    }

    setSaving(true);
    const createToastId = toast.loading('Creating challenge and days...');
    try {
      // First, create the challenge
      const challengeRes = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(challengeForm),
      });
      const challengeData = await challengeRes.json();
      
      if (!challengeData.success) {
        toast.removeToast(createToastId);
        toast.error('❌ Error creating challenge: ' + challengeData.error);
        return;
      }

      const challengeId = challengeData.data._id;

      // Create all challenge days
      const dayPromises = days.map(async (day) => {
        const mediaArray: string[] = [];
        if (day.audio) {
          mediaArray.push(day.audio);
        }

        const dayRes = await fetch('/api/challengeDays', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            challengeId,
            day: day.day,
            content: day.content.trim() || `Content for Day ${day.day}`,
            photos: day.photos,
            media: mediaArray,
            questions: day.questions.filter(q => q.question.trim() && q.options.some(opt => opt.trim())),
          }),
        });
        return dayRes.json();
      });

      const dayResults = await Promise.all(dayPromises);
      const failed = dayResults.filter(r => !r.success);
      
      toast.removeToast(createToastId);
      
      if (failed.length > 0) {
        toast.error(`⚠️ Created challenge but ${failed.length} day(s) failed. Please edit to fix.`);
      } else {
        toast.success(`✅ Challenge created successfully with ${days.length} day(s)!`);
      }
      
      router.push(`/dashboard/challenges-unified/view/${challengeId}`);
    } catch (error) {
      console.error('Error creating challenge:', error);
      toast.removeToast(createToastId);
      toast.error('❌ Error creating challenge');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 min-h-screen" style={{ backgroundColor: '#F5F5DC' }}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-4">
          <Link
            href="/dashboard/challenges-unified"
            className="inline-block mb-2 text-black/70 hover:text-black font-medium text-xs"
          >
            ← Back to Challenges
          </Link>
          <h1 className="text-lg font-bold text-black mb-1">🎯 Add New Challenge</h1>
          <p className="text-black/70 text-xs">Create a time-bound challenge with daily content and quizzes</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded border border-black shadow-md p-4">
          <form onSubmit={handleCreateChallenge} className="space-y-3">
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
                placeholder="e.g., 30-Day AI Challenge"
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
                placeholder="Describe what users will learn..."
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
                  onChange={(e) => {
                    const duration = parseInt(e.target.value) || 1;
                    setChallengeForm({ ...challengeForm, duration });
                    // Auto-generate days if duration increases
                    if (duration > 0 && duration <= 100 && duration > days.length) {
                      const newDays: ChallengeDayForm[] = [];
                      const existingDays = days.map(d => d.day);
                      for (let i = 1; i <= duration; i++) {
                        if (!existingDays.includes(i)) {
                          newDays.push({
                            day: i,
                            content: '',
                            photos: [],
                            audio: '',
                            questions: [],
                          });
                        }
                      }
                      if (newDays.length > 0) {
                        setDays([...days, ...newDays].sort((a, b) => a.day - b.day));
                        toast.success(`Auto-generated ${newDays.length} day(s)!`);
                      }
                    } else if (duration < days.length) {
                      // Remove days beyond duration
                      setDays(days.filter(d => d.day <= duration));
                    }
                  }}
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
                  <h3 className="text-black font-semibold text-xs mb-0.5">📅 Daily Content ({days.length} days)</h3>
                  <p className="text-black/60 text-xs">Add content, images, audio, and quiz questions for each day</p>
                </div>
                {days.length === 0 && (
                  <button
                    type="button"
                    onClick={generateDays}
                    className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold text-xs"
                  >
                    Generate Days
                  </button>
                )}
              </div>

              {days.length === 0 ? (
                <div className="text-center py-6 bg-cream-50 rounded border border-dashed border-black/20">
                  <div className="text-3xl mb-2">📅</div>
                  <p className="text-black/70 text-xs mb-1 font-semibold">No days generated yet</p>
                  <p className="text-black/50 text-xs mb-3">Set duration and click Generate Days to create daily content</p>
                  <button
                    type="button"
                    onClick={generateDays}
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

                      {day.photos.length > 0 && (
                        <div className="flex gap-1 mb-2 flex-wrap">
                          {day.photos.map((photo, photoIdx) => (
                            <div key={photoIdx} className="relative">
                              <img src={photo} alt={`Day ${day.day} Image ${photoIdx + 1}`} className="w-16 h-16 object-cover rounded border border-black/20" />
                              <button
                                type="button"
                                onClick={() => {
                                  const newDays = [...days];
                                  newDays[dayIndex].photos.splice(photoIdx, 1);
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

                      {day.audio && (
                        <div className="mb-2">
                          <audio controls src={day.audio} className="w-full h-7" />
                          <button
                            type="button"
                            onClick={() => updateDay(dayIndex, 'audio', '')}
                            className="mt-1 px-2 py-0.5 bg-red-600 text-white rounded text-xs font-semibold hover:bg-red-700"
                          >
                            Remove Audio
                          </button>
                        </div>
                      )}

                      {/* Quiz Questions */}
                      {day.questions.length > 0 && (
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
                disabled={saving || days.length === 0}
                className="flex-1 px-3 py-1.5 bg-black text-white rounded hover:bg-black/90 transition-all font-semibold text-xs disabled:opacity-50"
              >
                {saving ? '⏳ Creating...' : '✅ Create Challenge'}
              </button>
              <Link
                href="/dashboard/challenges-unified"
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
