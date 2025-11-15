'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Challenge {
  _id: string;
  title: string;
  description: string;
  duration: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  isActive: boolean;
  createdAt: string;
}

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      const res = await fetch('/api/challenges');
      const data = await res.json();
      if (data.success) {
        setChallenges(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this challenge?')) return;

    try {
      const res = await fetch(`/api/challenges/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        fetchChallenges();
      } else {
        alert('Error deleting challenge: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting challenge:', error);
      alert('Error deleting challenge');
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/challenges/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      const data = await res.json();
      if (data.success) {
        fetchChallenges();
      }
    } catch (error) {
      console.error('Error updating challenge:', error);
    }
  };

  return (
    <div className="p-8 bg-black">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Challenges
          </h1>
          <p className="text-zinc-400">Manage time-bound learning challenges</p>
        </div>
        <Link
          href="/dashboard/challenges/new"
          className="px-6 py-3 bg-white text-black rounded-xl hover:bg-zinc-200 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
        >
          + Create Challenge
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      ) : challenges.length === 0 ? (
        <div className="text-center py-20 bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800">
          <div className="text-6xl mb-4">🎯</div>
          <p className="text-zinc-400 mb-4 text-lg">No challenges found</p>
          <Link
            href="/dashboard/challenges/new"
            className="inline-block px-6 py-3 bg-white text-black rounded-xl hover:bg-zinc-200 transition-all shadow-lg hover:shadow-xl font-semibold"
          >
            Create your first challenge
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challenges.map((challenge) => (
            <div key={challenge._id} className="group bg-zinc-900 rounded-2xl shadow-2xl hover:shadow-white/10 transition-all duration-300 p-6 border border-zinc-800 hover:border-white/20 transform hover:scale-105">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-bold text-white group-hover:text-white transition-colors">{challenge.title}</h3>
                <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                  challenge.level === 'Beginner' ? 'bg-zinc-800 text-white border-zinc-700' :
                  challenge.level === 'Intermediate' ? 'bg-zinc-800 text-white border-zinc-700' :
                  'bg-zinc-800 text-white border-zinc-700'
                }`}>
                  {challenge.level}
                </span>
              </div>
              <p className="text-sm text-zinc-400 mb-4 line-clamp-2">{challenge.description}</p>
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-zinc-800">
                <span className="text-sm text-zinc-300 font-medium">⏱️ {challenge.duration} days</span>
                <button
                  onClick={() => toggleActive(challenge._id, challenge.isActive)}
                  className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                    challenge.isActive
                      ? 'bg-white text-black border border-white'
                      : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                  }`}
                >
                  {challenge.isActive ? '✓ Active' : '○ Inactive'}
                </button>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/dashboard/challenges/${challenge._id}`}
                  className="flex-1 text-center px-4 py-2 bg-white text-black rounded-xl hover:bg-zinc-200 transition-all shadow-md hover:shadow-lg text-sm font-semibold"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(challenge._id)}
                  className="px-4 py-2 bg-zinc-800 text-red-400 border border-red-400/30 rounded-xl hover:bg-red-400/10 transition-all shadow-md hover:shadow-lg text-sm font-semibold"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

