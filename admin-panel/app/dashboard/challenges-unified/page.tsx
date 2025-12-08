'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useToast } from '@/components/Toast';

interface Challenge {
  _id: string;
  title: string;
  description: string;
  duration: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  isActive: boolean;
}

export default function UnifiedChallengesPage() {
  const toast = useToast();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [filteredChallenges, setFilteredChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchChallenges();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredChallenges(challenges);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = challenges.filter(challenge => 
        challenge.title.toLowerCase().includes(query) ||
        challenge.description.toLowerCase().includes(query) ||
        challenge.level.toLowerCase().includes(query)
      );
      setFilteredChallenges(filtered);
    }
  }, [searchQuery, challenges]);

  const fetchChallenges = async () => {
    try {
      const res = await fetch('/api/challenges');
      const data = await res.json();
      if (data.success) {
        setChallenges(data.data || []);
        setFilteredChallenges(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteChallenge = async (challengeId: string, challengeTitle: string) => {
    if (!confirm(`⚠️ Are you sure you want to delete "${challengeTitle}"?\n\nThis will also delete all days in this challenge. This action cannot be undone!`)) {
      return;
    }

    setDeletingId(challengeId);
    const deleteToastId = toast.loading('Deleting challenge...');
    try {
      const res = await fetch(`/api/challenges/${challengeId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      toast.removeToast(deleteToastId);
      if (data.success) {
        toast.success('✅ Challenge deleted successfully!');
        fetchChallenges();
      } else {
        toast.error('❌ Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting challenge:', error);
      toast.removeToast(deleteToastId);
      toast.error('❌ Error deleting challenge');
    } finally {
      setDeletingId(null);
    }
  };

  const toggleActive = async (challengeId: string, currentStatus: boolean) => {
    const toggleToastId = toast.loading('Updating challenge...');
    try {
      const res = await fetch(`/api/challenges/${challengeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      const data = await res.json();
      toast.removeToast(toggleToastId);
      if (data.success) {
        toast.success(`✅ Challenge ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
        fetchChallenges();
      } else {
        toast.error('❌ Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating challenge:', error);
      toast.removeToast(toggleToastId);
      toast.error('❌ Error updating challenge');
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
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-black mb-1">🎯 Challenges</h1>
        <p className="text-black/70 text-xs">Manage time-bound learning challenges with daily content and quizzes</p>
      </div>

      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Search by title, description, level..."
            className="w-full px-3 py-1.5 bg-white border border-black/20 rounded text-black focus:border-black focus:outline-none text-xs placeholder:text-black/50"
            style={{ color: '#000' }}
          />
        </div>
        <Link
          href="/dashboard/challenges-unified/add"
          className="px-3 py-1.5 bg-black text-white rounded hover:bg-black/90 transition-all text-xs font-semibold whitespace-nowrap"
        >
          ➕ Add New Challenge
        </Link>
      </div>

      {/* Challenges Grid */}
      {searchQuery && filteredChallenges.length === 0 && challenges.length > 0 ? (
        <div className="text-center py-8 bg-white rounded border border-black/20">
          <div className="text-3xl mb-2">🔍</div>
          <p className="text-black text-sm font-bold mb-1">No challenges found</p>
          <p className="text-black/60 text-xs">Try a different search term</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredChallenges.length === 0 ? (
            <div className="col-span-full text-center py-8 bg-white rounded border border-black/20">
              <div className="text-4xl mb-2">🎯</div>
              <p className="text-black text-base font-bold mb-2">No challenges yet</p>
              <p className="text-black/60 text-xs mb-3">Create your first challenge to get started</p>
              <Link
                href="/dashboard/challenges-unified/add"
                className="inline-block px-4 py-1.5 bg-black text-white rounded hover:bg-black/90 transition-all text-xs font-semibold"
              >
                Create First Challenge
              </Link>
            </div>
          ) : (
            filteredChallenges.map((challenge) => {
              const levelColors = {
                Beginner: 'bg-green-100 text-green-700 border-green-300',
                Intermediate: 'bg-yellow-100 text-yellow-700 border-yellow-300',
                Advanced: 'bg-red-100 text-red-700 border-red-300',
              };

              return (
                <div
                  key={challenge._id}
                  className="bg-white rounded border border-black/20 hover:shadow-md transition-all overflow-hidden group relative"
                >
                  <div className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <Link href={`/dashboard/challenges-unified/view/${challenge._id}`}>
                          <h3 className="text-sm font-bold text-black mb-1 line-clamp-2 hover:text-black/70">{challenge.title}</h3>
                        </Link>
                        <p className="text-black/70 text-xs mb-2 line-clamp-2">{challenge.description}</p>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded text-xs font-semibold border ${levelColors[challenge.level]}`}>
                        {challenge.level}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-black/60 font-medium text-xs">
                        ⏱️ {challenge.duration} day{challenge.duration !== 1 ? 's' : ''}
                      </span>
                      <button
                        onClick={() => toggleActive(challenge._id, challenge.isActive)}
                        className={`px-1.5 py-0.5 rounded text-xs font-semibold transition-all ${
                          challenge.isActive
                            ? 'bg-green-100 text-green-700 border border-green-300'
                            : 'bg-gray-100 text-gray-500 border border-gray-300'
                        }`}
                        title={challenge.isActive ? 'Click to deactivate' : 'Click to activate'}
                      >
                        {challenge.isActive ? '✓ Active' : '○ Inactive'}
                      </button>
                    </div>
                    <div className="flex gap-1.5 pt-2 border-t border-black/10">
                      <Link
                        href={`/dashboard/challenges-unified/view/${challenge._id}`}
                        className="flex-1 px-2 py-1 bg-black text-white rounded text-xs font-semibold text-center hover:bg-black/90 transition-all"
                      >
                        👁️ View
                      </Link>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          window.location.href = `/dashboard/challenges-unified/edit/${challenge._id}`;
                        }}
                        className="flex-1 px-2 py-1 bg-white border border-black text-black rounded hover:bg-black/5 transition-all text-xs font-semibold"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteChallenge(challenge._id, challenge.title);
                        }}
                        disabled={deletingId === challenge._id}
                        className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-all text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete challenge"
                      >
                        {deletingId === challenge._id ? '⏳' : '🗑️'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
