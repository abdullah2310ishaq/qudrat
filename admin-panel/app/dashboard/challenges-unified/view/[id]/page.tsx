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
  _id: string;
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

// Helper function to normalize base64 image URLs
function normalizeImageSrc(photo: string): string {
  if (!photo || typeof photo !== 'string') return '';
  if (photo.startsWith('data:image')) return photo;
  if (photo.startsWith('http://') || photo.startsWith('https://')) return photo;
  const trimmed = photo.trim();
  if (trimmed.startsWith('/9j/') || trimmed.startsWith('iVBORw0KGgo')) {
    return trimmed.startsWith('/9j/') 
      ? `data:image/jpeg;base64,${trimmed}` 
      : `data:image/png;base64,${trimmed}`;
  }
  if (trimmed.match(/^[A-Za-z0-9+/=\s]+$/)) {
    return `data:image/jpeg;base64,${trimmed}`;
  }
  return photo;
}

export default function ViewChallengePage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const challengeId = params.id as string;
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [days, setDays] = useState<ChallengeDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingChallenge, setDeletingChallenge] = useState(false);
  const [deletingDayId, setDeletingDayId] = useState<string | null>(null);

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
        setChallenge(data.data);
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

  const handleDeleteChallenge = async () => {
    if (!challenge) return;
    if (!confirm(`⚠️ Are you sure you want to delete "${challenge.title}"?\n\nThis will also delete all ${days.length} day(s). This action cannot be undone!`)) {
      return;
    }

    setDeletingChallenge(true);
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
      setDeletingChallenge(false);
    }
  };

  const handleDeleteDay = async (dayId: string, dayNumber: number) => {
    if (!confirm(`⚠️ Are you sure you want to delete Day ${dayNumber}?\n\nThis action cannot be undone!`)) {
      return;
    }

    setDeletingDayId(dayId);
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
    } finally {
      setDeletingDayId(null);
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

  if (!challenge) {
    return (
      <div className="p-4 min-h-screen" style={{ backgroundColor: '#F5F5DC' }}>
        <div className="text-center py-20">
          <p className="text-black text-xl font-bold mb-4">Challenge not found</p>
          <Link
            href="/dashboard/challenges-unified"
            className="inline-block px-6 py-3 bg-black text-white rounded-lg hover:bg-black/90 font-bold"
          >
            Back to Challenges
          </Link>
        </div>
      </div>
    );
  }

  const levelColors = {
    Beginner: 'bg-green-100 text-green-700 border-green-300',
    Intermediate: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    Advanced: 'bg-red-100 text-red-700 border-red-300',
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
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-base font-bold text-black mb-1">{challenge.title}</h1>
              <p className="text-black/70 text-xs mb-1">{challenge.description}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className={`px-1.5 py-0.5 rounded text-xs font-semibold border ${levelColors[challenge.level]}`}>
                  {challenge.level}
                </span>
                <span className="text-black/70 font-medium text-xs">
                  ⏱️ {challenge.duration} days
                </span>
                <span className="text-black/70 font-medium text-xs">
                  📅 {days.length} day{days.length !== 1 ? 's' : ''} added
                </span>
                <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${
                  challenge.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {challenge.isActive ? '✓ Active' : '○ Inactive'}
                </span>
              </div>
            </div>
            <div className="flex gap-1.5">
              <Link
                href={`/dashboard/challenges-unified/edit/${challengeId}`}
                className="px-2 py-1 bg-white border border-black text-black rounded hover:bg-black/5 transition-all font-semibold text-xs"
              >
                ✏️ Edit
              </Link>
              <button
                onClick={handleDeleteChallenge}
                disabled={deletingChallenge}
                className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-all font-semibold text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                title="Delete challenge"
              >
                {deletingChallenge ? '⏳' : '🗑️'}
              </button>
            </div>
          </div>
        </div>

        {/* Days Section */}
        <div className="bg-white rounded border border-black shadow-sm p-3">
          <h2 className="text-sm font-bold text-black mb-3">📅 Daily Content ({days.length}/{challenge.duration} days)</h2>
          
          {days.length === 0 ? (
            <div className="text-center py-8 bg-cream-50 rounded border border-dashed border-black/20">
              <div className="text-3xl mb-2">📅</div>
              <p className="text-black text-sm font-bold mb-1">No days added yet</p>
              <p className="text-black/60 text-xs mb-3">Add daily content to get started</p>
              <Link
                href={`/dashboard/challenges-unified/edit/${challengeId}`}
                className="inline-block px-3 py-1.5 bg-black text-white rounded hover:bg-black/90 transition-all font-semibold text-xs"
              >
                ➕ Add Days
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {days.map((day) => (
                <div
                  key={day._id}
                  className="bg-cream-50 rounded border border-black/20 p-3 hover:border-black/40 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="px-2 py-0.5 bg-black text-white rounded text-xs font-bold">Day {day.day}</span>
                        {day.questions && day.questions.length > 0 && (
                          <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-semibold">
                            🎯 {day.questions.length} quiz{day.questions.length !== 1 ? 'zes' : ''}
                          </span>
                        )}
                      </div>
                      <p className="text-black/80 text-xs whitespace-pre-wrap mb-2">
                        {day.content || 'No content added yet'}
                      </p>
                      
                      {/* Images */}
                      {day.photos && day.photos.length > 0 && (
                        <div className="flex gap-1 mb-2 flex-wrap">
                          {day.photos.map((photo, idx) => (
                            <img
                              key={idx}
                              src={normalizeImageSrc(photo)}
                              alt={`Day ${day.day} Image ${idx + 1}`}
                              className="w-16 h-16 object-cover rounded border border-black/20"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          ))}
                        </div>
                      )}

                      {/* Audio */}
                      {day.media && day.media.some(m => m.startsWith('data:audio')) && (
                        <div className="mb-2">
                          <audio controls src={day.media.find(m => m.startsWith('data:audio'))} className="w-full h-7" />
                        </div>
                      )}

                      {/* Quiz Questions */}
                      {day.questions && day.questions.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-black/10">
                          <h4 className="text-black font-semibold text-xs mb-2">🎯 Quiz Questions</h4>
                          <div className="space-y-2">
                            {day.questions.map((q, qIdx) => (
                              <div key={qIdx} className="bg-white rounded border border-black/10 p-2">
                                <p className="text-black font-semibold text-xs mb-1.5">
                                  {qIdx + 1}. {q.question}
                                </p>
                                <div className="space-y-1">
                                  {q.options.map((opt, optIdx) => (
                                    <div
                                      key={optIdx}
                                      className={`p-1 rounded border ${
                                        optIdx === q.correctAnswer
                                          ? 'bg-green-100 border-green-500'
                                          : 'bg-white border-black/20'
                                      }`}
                                    >
                                      <span className="font-semibold text-xs text-black">
                                        {optIdx === q.correctAnswer ? '✅' : '○'} Option {optIdx + 1}:
                                      </span>
                                      <span className="ml-2 text-xs text-black">{opt}</span>
                                    </div>
                                  ))}
                                </div>
                                {q.explanation && (
                                  <p className="text-black/70 text-xs mt-1 italic">💡 {q.explanation}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteDay(day._id, day.day)}
                      disabled={deletingDayId === day._id}
                      className="ml-2 px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 font-semibold text-xs disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Delete day"
                    >
                      {deletingDayId === day._id ? '⏳' : '🗑️'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
