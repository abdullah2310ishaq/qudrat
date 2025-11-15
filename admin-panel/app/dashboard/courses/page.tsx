'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Course {
  _id: string;
  title: string;
  heading: string;
  type: 'simple' | 'challenge';
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
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-5xl font-thin text-white mb-3 tracking-tight">
            Courses
          </h1>
          <div className="w-16 h-px bg-white/20 mb-4"></div>
          <p className="text-sm font-light text-white/60 tracking-wide">Manage all your learning courses</p>
        </div>
        <Link
          href="/dashboard/courses/new"
          className="px-6 py-2.5 bg-white/5 text-white rounded-sm border border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-300 font-light text-sm tracking-wider uppercase"
        >
          + Create Course
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border border-white/20 border-t-white/60"></div>
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20 bg-black/40 rounded-sm border border-white/10">
          <div className="text-5xl mb-4 opacity-70">📚</div>
          <p className="text-sm font-light text-white/60 mb-6 tracking-wide">No courses found</p>
          <Link
            href="/dashboard/courses/new"
            className="inline-block px-6 py-2.5 bg-white/5 text-white rounded-sm border border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-300 font-light text-sm tracking-wider uppercase"
          >
            Create your first course
          </Link>
        </div>
      ) : (
        <>
          {/* Search & Filters */}
          <div className="bg-black/40 rounded-sm border border-white/10 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-light text-white/60 mb-2 tracking-wider uppercase">Search Courses</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by title or heading..."
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-sm text-white placeholder-white/30 focus:bg-white/10 focus:border-white/20 transition-all font-light text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-light text-white/60 mb-2 tracking-wider uppercase">Filter by Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-sm text-white focus:bg-white/10 focus:border-white/20 transition-all font-light text-sm"
                >
                  <option value="">All Types</option>
                  <option value="simple">Simple</option>
                  <option value="challenge">Challenge</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-light text-white/60 mb-2 tracking-wider uppercase">Filter by Category</label>
                <input
                  type="text"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  placeholder="Category..."
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-sm text-white placeholder-white/30 focus:bg-white/10 focus:border-white/20 transition-all font-light text-sm"
                />
              </div>
            </div>
            {(searchTerm || filterType || filterCategory) && (
              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterType('');
                    setFilterCategory('');
                  }}
                  className="px-4 py-2 bg-white/5 text-white rounded-sm hover:bg-white/10 text-xs font-light tracking-wider uppercase border border-white/10 hover:border-white/20 transition-all"
                >
                  Clear Filters
                </button>
                <span className="text-xs font-light text-white/50 tracking-wide">
                  Showing {filteredCourses.length} of {courses.length} courses
                </span>
              </div>
            )}
          </div>

          <div className="bg-black/40 rounded-sm border border-white/10 overflow-hidden">
            <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-light text-white/60 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-4 text-left text-xs font-light text-white/60 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-light text-white/60 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-light text-white/60 uppercase tracking-wider">
                  Lessons
                </th>
                <th className="px-6 py-4 text-left text-xs font-light text-white/60 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-light text-white/60 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-black/40 divide-y divide-white/10">
              {filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <p className="text-sm font-light text-white/50">No courses match your filters</p>
                  </td>
                </tr>
              ) : (
                filteredCourses.map((course) => (
                <tr key={course._id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-light text-white">{course.title}</div>
                    <div className="text-xs font-light text-white/50">{course.heading}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 text-xs font-light rounded-sm bg-white/5 text-white/80 border border-white/10">
                      {course.type === 'challenge' ? 'Challenge' : 'Simple'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70 font-light">
                    {course.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70 font-light">
                    <span className="px-2.5 py-1 text-xs font-light rounded-sm bg-white/5 text-white/80 border border-white/10">
                      {Array.isArray(course.lessons) ? course.lessons.length : 0} lesson{course.lessons?.length !== 1 ? 's' : ''}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleActive(course._id, course.isActive)}
                      className={`px-2.5 py-1 text-xs font-light rounded-sm transition-all border ${
                        course.isActive
                          ? 'bg-white/10 text-white border-white/20'
                          : 'bg-white/5 text-white/50 border-white/10'
                      }`}
                    >
                      {course.isActive ? '✓ Active' : '○ Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-light">
                    <div className="flex items-center gap-4">
                      <Link
                        href={`/dashboard/courses/${course._id}/view`}
                        className="text-white/60 hover:text-white transition-colors text-xs tracking-wide"
                        title="View Details"
                      >
                        View
                      </Link>
                      <Link
                        href={`/dashboard/courses/${course._id}`}
                        className="text-white/60 hover:text-white transition-colors text-xs tracking-wide"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/dashboard/courses/${course._id}/add-lessons`}
                        className="text-white/60 hover:text-white transition-colors text-xs tracking-wide"
                      >
                        Lessons
                      </Link>
                      <button
                        onClick={() => handleDelete(course._id)}
                        className="text-white/40 hover:text-red-400/80 transition-colors text-xs tracking-wide"
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

