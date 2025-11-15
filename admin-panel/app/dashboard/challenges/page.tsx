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
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-5xl font-thin text-white mb-3 tracking-tight">Challenges</h1>
          <div className="w-16 h-px bg-white/20 mb-4"></div>
          <p className="text-sm font-light text-white/60 tracking-wide">Manage time-bound learning challenges</p>
        </div>
        <Link
          href="/dashboard/challenges/new"
          className="px-6 py-2.5 bg-white/5 text-white rounded-sm border border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-300 font-light text-sm tracking-wider uppercase"
        >
          + Create Challenge
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border border-white/20 border-t-white/60"></div>
        </div>
      ) : challenges.length === 0 ? (
        <div className="text-center py-20 bg-black/40 rounded-sm border border-white/10">
          <div className="text-5xl mb-4 opacity-70">🎯</div>
          <p className="text-sm font-light text-white/60 mb-6 tracking-wide">No challenges found</p>
          <Link
            href="/dashboard/challenges/new"
            className="inline-block px-6 py-2.5 bg-white/5 text-white rounded-sm border border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-300 font-light text-sm tracking-wider uppercase"
          >
            Create your first challenge
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {challenges.map((challenge) => (
            <div key={challenge._id} className="group bg-black/40 rounded-sm border border-white/10 hover:border-white/20 transition-all duration-300 p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-base font-light text-white flex-1 pr-2">{challenge.title}</h3>
                <span className="px-2.5 py-1 text-xs font-light rounded-sm bg-white/5 text-white/80 border border-white/10">
                  {challenge.level}
                </span>
              </div>
              <p className="text-xs font-light text-white/60 mb-4 line-clamp-2">{challenge.description}</p>
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
                <span className="text-xs font-light text-white/50">⏱️ {challenge.duration} days</span>
                <button
                  onClick={() => toggleActive(challenge._id, challenge.isActive)}
                  className={`px-2.5 py-1 text-xs font-light rounded-sm transition-all border ${
                    challenge.isActive
                      ? 'bg-white/10 text-white border-white/20'
                      : 'bg-white/5 text-white/50 border-white/10'
                  }`}
                >
                  {challenge.isActive ? '✓ Active' : '○ Inactive'}
                </button>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/dashboard/challenges/${challenge._id}`}
                  className="flex-1 text-center px-3 py-2 bg-white/5 text-white rounded-sm hover:bg-white/10 text-xs font-light tracking-wide border border-white/10 hover:border-white/20 transition-all"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(challenge._id)}
                  className="px-3 py-2 bg-white/5 text-white/40 hover:text-red-400/80 rounded-sm hover:bg-white/10 text-xs font-light tracking-wide border border-white/10 hover:border-red-400/30 transition-all"
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

