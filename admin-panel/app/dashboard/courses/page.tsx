'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Course {
  _id: string;
  title: string;
  heading: string;
  type: 'simple' | 'mastery-path' | 'challenge' | 'prompt-suggested';
  category: string;
  isActive: boolean;
  lessons?: Array<{ _id: string }> | string[];
  createdAt: string;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = searchTerm === '' || 
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.heading.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === '' || course.type === filterType;
    const matchesCategory = filterCategory === '' || 
      course.category.toLowerCase().includes(filterCategory.toLowerCase());
    return matchesSearch && matchesType && matchesCategory;
  });

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
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;

    try {
      const res = await fetch(`/api/courses/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        fetchCourses();
      } else {
        alert('Error deleting course: ' + data.error);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error deleting course:', errorMessage);
      alert('Error deleting course: ' + errorMessage);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/courses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      const data = await res.json();
      if (data.success) {
        fetchCourses();
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error updating course:', errorMessage);
    }
  };

  return (
    <div className="p-8 bg-black">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Courses
          </h1>
          <p className="text-zinc-400">Manage all your learning courses</p>
        </div>
        <Link
          href="/dashboard/courses/new"
          className="px-6 py-3 bg-white text-black rounded-xl hover:bg-zinc-200 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
        >
          + Create Course
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20 bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800">
          <div className="text-6xl mb-4">📚</div>
          <p className="text-zinc-400 mb-4 text-lg">No courses found</p>
          <Link
            href="/dashboard/courses/new"
            className="inline-block px-6 py-3 bg-white text-black rounded-xl hover:bg-zinc-200 transition-all shadow-lg hover:shadow-xl font-semibold"
          >
            Create your first course
          </Link>
        </div>
      ) : (
        <>
          {/* Search & Filters */}
          <div className="bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-white mb-2">Search Courses</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by title or heading..."
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:ring-2 focus:ring-white focus:border-white transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Filter by Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:ring-2 focus:ring-white focus:border-white transition-all"
                >
                  <option value="">All Types</option>
                  <option value="simple">Simple</option>
                  <option value="mastery-path">Mastery Path</option>
                  <option value="challenge">Challenge</option>
                  <option value="prompt-suggested">Prompt-Suggested</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Filter by Category</label>
                <input
                  type="text"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  placeholder="Category..."
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:ring-2 focus:ring-white focus:border-white transition-all"
                />
              </div>
            </div>
            {(searchTerm || filterType || filterCategory) && (
              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterType('');
                    setFilterCategory('');
                  }}
                  className="px-4 py-2 bg-zinc-800 text-white rounded-xl hover:bg-zinc-700 text-sm font-semibold border border-zinc-700"
                >
                  Clear Filters
                </button>
                <span className="text-sm text-zinc-400">
                  Showing {filteredCourses.length} of {courses.length} courses
                </span>
              </div>
            )}
          </div>

          <div className="bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800 overflow-hidden">
            <table className="min-w-full divide-y divide-zinc-800">
            <thead className="bg-zinc-800">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Lessons
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-zinc-900 divide-y divide-zinc-800">
              {filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <p className="text-zinc-400">No courses match your filters</p>
                  </td>
                </tr>
              ) : (
                filteredCourses.map((course) => (
                <tr key={course._id} className="hover:bg-zinc-800 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-white">{course.title}</div>
                    <div className="text-sm text-zinc-400">{course.heading}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-zinc-800 text-white border border-zinc-700">
                      {course.type === 'mastery-path' ? 'Mastery Path' : course.type === 'challenge' ? 'Challenge' : course.type === 'prompt-suggested' ? 'Prompt-Suggested' : 'Simple'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300 font-medium">
                    {course.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-zinc-800 text-white border border-zinc-700">
                      {Array.isArray(course.lessons) ? course.lessons.length : 0} lesson{course.lessons?.length !== 1 ? 's' : ''}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleActive(course._id, course.isActive)}
                      className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                        course.isActive
                          ? 'bg-white text-black border border-white'
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                      }`}
                    >
                      {course.isActive ? '✓ Active' : '○ Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/dashboard/courses/${course._id}/view`}
                        className="text-zinc-400 hover:text-white font-semibold hover:underline"
                        title="View Details"
                      >
                        👁️ View
                      </Link>
                      <Link
                        href={`/dashboard/courses/${course._id}`}
                        className="text-white hover:text-zinc-300 font-semibold hover:underline"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/dashboard/courses/${course._id}/add-lessons`}
                        className="text-zinc-400 hover:text-white font-semibold hover:underline"
                      >
                        Lessons
                      </Link>
                      <button
                        onClick={() => handleDelete(course._id)}
                        className="text-red-400 hover:text-red-300 font-semibold hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        </>
      )}
    </div>
  );
}

