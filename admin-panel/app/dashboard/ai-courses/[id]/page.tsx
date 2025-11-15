'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface Lesson {
  _id: string;
  title: string;
}

interface Prompt {
  _id: string;
  title: string;
  tool: string;
}

interface Certificate {
  _id: string;
  title: string;
  icon: string;
}

interface TreeLevel {
  level: number;
  topic: string;
  lessons: string[];
  canRead: boolean;
  canListen: boolean;
  promptIds: string[];
}

interface AICourse {
  _id: string;
  title: string;
  heading: string;
  subHeading?: string;
  aiTool: string;
  category?: string;
  coverImage?: string;
  certificateId?: string;
  isActive: boolean;
  tree: TreeLevel[];
}

export default function EditAICoursePage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [formData, setFormData] = useState<AICourse>({
    _id: '',
    title: '',
    heading: '',
    subHeading: '',
    aiTool: 'ChatGPT',
    category: '',
    coverImage: '',
    certificateId: '',
    isActive: true,
    tree: [],
  });

  useEffect(() => {
    if (courseId) {
      Promise.all([fetchAICourse(), fetchLessons(), fetchPrompts(), fetchCertificates()]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const fetchAICourse = async () => {
    try {
      const res = await fetch(`/api/aiCourses/${courseId}`);
      const data = await res.json();
      if (data.success) {
        // Convert lesson objects to IDs if needed
        const tree = data.data.tree.map((level: { lessons: unknown[]; promptIds?: unknown[] }) => ({
          ...level,
          lessons: level.lessons.map((l) => (typeof l === 'object' && l !== null && '_id' in l ? (l as { _id: string })._id : l as string)),
          promptIds: level.promptIds 
            ? level.promptIds.map((p) => (typeof p === 'object' && p !== null && '_id' in p ? (p as { _id: string })._id : p as string))
            : [],
        }));
        setFormData({ 
          ...data.data, 
          tree,
          aiTool: data.data.aiTool || 'ChatGPT',
          category: data.data.category || '',
          coverImage: data.data.coverImage || '',
          certificateId: data.data.certificateId?._id || data.data.certificateId || '',
          isActive: data.data.isActive !== undefined ? data.data.isActive : true,
        });
      } else {
        alert('AI Course not found');
        router.push('/dashboard/ai-courses');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error fetching AI course:', errorMessage);
      alert('Error loading AI course: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchLessons = async () => {
    try {
      const res = await fetch(`/api/aiLessons?aiCourseId=${courseId}`);
      const data = await res.json();
      if (data.success) {
        setLessons(data.data || []);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error fetching AI lessons:', errorMessage);
    }
  };

  const fetchPrompts = async () => {
    try {
      const res = await fetch('/api/prompts');
      const data = await res.json();
      if (data.success) {
        setPrompts(data.data || []);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error fetching prompts:', errorMessage);
    }
  };

  const fetchCertificates = async () => {
    try {
      const res = await fetch('/api/certificates');
      const data = await res.json();
      if (data.success) {
        setCertificates(data.data || []);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error fetching certificates:', errorMessage);
    }
  };

  const addLevel = () => {
    const newLevel: TreeLevel = {
      level: formData.tree.length + 1,
      topic: '',
      lessons: [],
      canRead: true,
      canListen: false,
      promptIds: [],
    };
    setFormData({
      ...formData,
      tree: [...formData.tree, newLevel],
    });
  };

  const updateLevel = (index: number, field: string, value: string | boolean | string[]) => {
    const newTree = [...formData.tree];
    const level = newTree[index];
    if (field === 'topic') level.topic = value as string;
    else if (field === 'lessons') level.lessons = value as string[];
    else if (field === 'canRead') level.canRead = value as boolean;
    else if (field === 'canListen') level.canListen = value as boolean;
    else if (field === 'promptIds') level.promptIds = value as string[];
    setFormData({ ...formData, tree: newTree });
  };

  const togglePromptInLevel = (levelIndex: number, promptId: string) => {
    const newTree = [...formData.tree];
    const level = newTree[levelIndex];
    if (level.promptIds.includes(promptId)) {
      level.promptIds = level.promptIds.filter((id) => id !== promptId);
    } else {
      level.promptIds.push(promptId);
    }
    setFormData({ ...formData, tree: newTree });
  };

  const removeLevel = (index: number) => {
    const newTree = formData.tree.filter((_, i) => i !== index);
    newTree.forEach((level, i) => {
      level.level = i + 1;
    });
    setFormData({ ...formData, tree: newTree });
  };

  const toggleLessonInLevel = (levelIndex: number, lessonId: string) => {
    const newTree = [...formData.tree];
    const level = newTree[levelIndex];
    if (level.lessons.includes(lessonId)) {
      level.lessons = level.lessons.filter((id) => id !== lessonId);
    } else {
      level.lessons.push(lessonId);
    }
    setFormData({ ...formData, tree: newTree });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Clean up empty strings for optional fields
      const submitData = {
        ...formData,
        certificateId: formData.certificateId || undefined,
        category: formData.category || undefined,
        subHeading: formData.subHeading || undefined,
        coverImage: formData.coverImage || undefined,
      };
      
      const res = await fetch(`/api/aiCourses/${courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      const data = await res.json();
      if (data.success) {
        router.push('/dashboard/ai-courses');
      } else {
        alert('Error updating AI course: ' + data.error);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error updating AI course:', errorMessage);
      alert('Error updating AI course: ' + errorMessage);
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
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Edit AI Mastery Path</h1>
          <p className="text-zinc-400">Update mastery path structure and levels</p>
        </div>
        <Link
          href={`/dashboard/ai-courses/${courseId}/add-lessons`}
          className="px-6 py-3 bg-white text-black rounded-xl hover:bg-zinc-200 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
        >
          + Add Lessons
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800 p-8 max-w-4xl">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:ring-2 focus:ring-white focus:border-white transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Heading *</label>
            <input
              type="text"
              required
              value={formData.heading}
              onChange={(e) => setFormData({ ...formData, heading: e.target.value })}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:ring-2 focus:ring-white focus:border-white transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Sub Heading <span className="text-zinc-400 text-xs">(Optional)</span>
            </label>
            <input
              type="text"
              value={formData.subHeading || ''}
              onChange={(e) => setFormData({ ...formData, subHeading: e.target.value })}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:ring-2 focus:ring-white focus:border-white transition-all"
              placeholder="Optional sub-heading for better description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              AI Tool / Type * <span className="text-zinc-400 text-xs">(Select the AI tool this mastery path is for)</span>
            </label>
            <select
              required
              value={formData.aiTool}
              onChange={(e) => setFormData({ ...formData, aiTool: e.target.value })}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:ring-2 focus:ring-white focus:border-white transition-all"
            >
              <option value="ChatGPT">ChatGPT</option>
              <option value="MidJourney">MidJourney</option>
              <option value="DALL-E">DALL-E</option>
              <option value="Jasper AI">Jasper AI</option>
              <option value="Claude">Claude</option>
              <option value="Stable Diffusion">Stable Diffusion</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Category / Tags <span className="text-zinc-400 text-xs">(Optional - helps with organization)</span>
            </label>
            <input
              type="text"
              value={formData.category || ''}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:ring-2 focus:ring-white focus:border-white transition-all"
              placeholder="e.g., Text Generation, Image Creation, Business"
            />
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
              Active <span className="text-zinc-400 text-xs">(Show to users)</span>
            </label>
          </div>

          {/* Advanced Options - Collapsible */}
          <div className="border-t border-zinc-800 pt-6">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center justify-between w-full text-left text-white font-semibold hover:text-zinc-300 transition-colors"
            >
              <span>Advanced Options</span>
              <span className="text-zinc-400">{showAdvanced ? '▼' : '▶'}</span>
            </button>

            {showAdvanced && (
              <div className="mt-4 space-y-4 pl-4 border-l-2 border-zinc-800">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Cover Image / Icon <span className="text-zinc-400 text-xs">(Optional - Base64 encoded)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.coverImage || ''}
                    onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:ring-2 focus:ring-white focus:border-white transition-all text-xs"
                    placeholder="Base64 encoded image (optional)"
                  />
                  <p className="text-xs text-zinc-400 mt-1">Upload image and convert to Base64, or leave empty</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Certificate <span className="text-zinc-400 text-xs">(Optional - for completion)</span>
                  </label>
                  <select
                    value={formData.certificateId || ''}
                    onChange={(e) => setFormData({ ...formData, certificateId: e.target.value })}
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:ring-2 focus:ring-white focus:border-white transition-all"
                  >
                    <option value="">No Certificate</option>
                    {certificates.map((cert) => (
                      <option key={cert._id} value={cert._id}>
                        {cert.title} ({cert.icon})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-zinc-400 mt-1">Select a certificate to award on completion</p>
                </div>
              </div>
            )}
          </div>

            <div className="border-t border-zinc-800 pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Tree Structure</h3>
              <button
                type="button"
                onClick={addLevel}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
              >
                + Add Level
              </button>
            </div>

            <div className="space-y-4">
              {formData.tree.map((level, index) => (
                <div key={index} className="border border-zinc-700 rounded-xl p-4 bg-zinc-800">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="mb-2">
                        <label className="block text-sm font-medium text-white mb-1">
                          Level {level.level} - Topic *
                        </label>
                        <input
                          type="text"
                          required
                          value={level.topic}
                          onChange={(e) => updateLevel(index, 'topic', e.target.value)}
                          className="w-full px-3 py-2 bg-black border border-zinc-700 rounded-xl text-white focus:ring-2 focus:ring-white focus:border-white"
                        />
                      </div>

                      <div className="mb-2">
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-sm font-medium text-white">
                            Select Lessons
                          </label>
                          <Link
                            href={`/dashboard/ai-courses/${courseId}/add-lessons`}
                            className="text-xs px-3 py-1 bg-white text-black rounded-lg hover:bg-zinc-200 transition-all font-semibold"
                          >
                            + Add Lessons
                          </Link>
                        </div>
                        {lessons.length === 0 ? (
                          <div className="border rounded p-4 text-center bg-zinc-900">
                            <p className="text-zinc-400 text-sm mb-2">No lessons created yet</p>
                            <Link
                              href={`/dashboard/ai-courses/${courseId}/add-lessons`}
                              className="text-xs px-4 py-2 bg-white text-black rounded-lg hover:bg-zinc-200 transition-all font-semibold inline-block"
                            >
                              Create Lessons
                            </Link>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded p-2">
                            {lessons.map((lesson) => (
                              <label
                                key={lesson._id}
                                className="flex items-center space-x-2 cursor-pointer hover:bg-zinc-700 p-1 rounded text-white"
                              >
                                <input
                                  type="checkbox"
                                  checked={level.lessons.includes(lesson._id)}
                                  onChange={() => toggleLessonInLevel(index, lesson._id)}
                                  className="h-4 w-4 text-indigo-600"
                                />
                                <span className="text-sm">{lesson.title}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={level.canRead}
                            onChange={(e) => updateLevel(index, 'canRead', e.target.checked)}
                            className="h-4 w-4 text-indigo-600"
                          />
                          <span className="ml-2 text-sm text-white">Can Read</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={level.canListen}
                            onChange={(e) => updateLevel(index, 'canListen', e.target.checked)}
                            className="h-4 w-4 text-indigo-600"
                          />
                          <span className="ml-2 text-sm text-white">Can Listen</span>
                        </label>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLevel(index)}
                      className="ml-4 text-red-400 hover:text-red-300 font-semibold"
                    >
                      Remove Level
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-8 py-3 bg-zinc-800 text-white rounded-xl hover:bg-zinc-700 transition-all duration-200 font-semibold border border-zinc-700"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

