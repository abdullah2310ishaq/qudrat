'use client';

import { useEffect, useState } from 'react';
//do osmehting dgood
interface User {
  _id: string;
  name: string;
  email?: string;
  streak: number;
  completedLessons: string[];
  certificates: string[];
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.success) {
        setUsers(data.data || []);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error fetching users:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-black">
      <div className="mb-12">
        <h1 className="text-5xl font-thin text-white mb-3 tracking-tight">Users</h1>
        <div className="w-16 h-px bg-white/20 mb-4"></div>
        <p className="text-sm font-light text-white/60 tracking-wide">View and manage all platform users</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border border-white/20 border-t-white/60"></div>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-20 bg-black/40 rounded-sm border border-white/10">
          <div className="text-5xl mb-4 opacity-70">👥</div>
          <p className="text-sm font-light text-white/60 mb-6 tracking-wide">No users found</p>
        </div>
      ) : (
        <div className="bg-black/40 rounded-sm border border-white/10 overflow-hidden">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-light text-white/60 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-light text-white/60 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-light text-white/60 uppercase tracking-wider">
                  Streak
                </th>
                <th className="px-6 py-4 text-left text-xs font-light text-white/60 uppercase tracking-wider">
                  Completed Lessons
                </th>
                <th className="px-6 py-4 text-left text-xs font-light text-white/60 uppercase tracking-wider">
                  Certificates
                </th>
              </tr>
            </thead>
            <tbody className="bg-black/40 divide-y divide-white/10">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-light text-white">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70 font-light">
                    {user.email || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70 font-light">
                    {user.streak} days
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70 font-light">
                    {user.completedLessons?.length || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70 font-light">
                    {user.certificates?.length || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
