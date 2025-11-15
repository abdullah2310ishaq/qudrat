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

  // Refresh lessons when coming back from add-lessons page
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('refresh') === 'lessons') {
      console.log('🔄 Refreshing lessons after returning from add-lessons page...');
      fetchLessons();
      // Remove the query parameter from URL
      window.history.replaceState({}, '', window.location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      console.log('📚 Fetching AI lessons for course:', courseId);
      const res = await fetch(`/api/aiLessons?aiCourseId=${courseId}`);
      const data = await res.json();
      if (data.success) {
        console.log('✅ Fetched', data.data?.length || 0, 'AI lessons');
        setLessons(data.data || []);
        if (!data.data || data.data.length === 0) {
          console.warn('⚠️ No AI lessons found for this course. Create lessons first!');
        }
      } else {
        console.error('❌ Failed to fetch lessons:', data.error);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Error fetching AI lessons:', errorMessage);
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
      // Ensure all lesson IDs are strings (not objects)
      const cleanedTree = formData.tree.map((level) => ({
        ...level,
        lessons: level.lessons.map((lessonId) => {
          // If it's an object with _id, extract the _id
          if (typeof lessonId === 'object' && lessonId !== null && '_id' in lessonId) {
            return (lessonId as { _id: string })._id;
          }
          // If it's already a string, return it
          return String(lessonId);
        }).filter((id) => id && id.trim() !== ''), // Remove empty strings
        promptIds: (level.promptIds || []).map((promptId) => {
          if (typeof promptId === 'object' && promptId !== null && '_id' in promptId) {
            return (promptId as { _id: string })._id;
          }
          return String(promptId);
        }).filter((id) => id && id.trim() !== ''),
      }));

      // Clean up empty strings for optional fields
      const submitData = {
        ...formData,
        tree: cleanedTree,
        certificateId: formData.certificateId || undefined,
        category: formData.category || undefined,
        subHeading: formData.subHeading || undefined,
        coverImage: formData.coverImage || undefined,
      };
      
      // Log what we're sending
      console.log('💾 Saving AI course with tree structure:', JSON.stringify(submitData.tree, null, 2));
      submitData.tree.forEach((level, idx) => {
        console.log(`📚 Level ${idx + 1} (${level.topic}): ${level.lessons.length} lesson(s) selected:`, level.lessons);
      });
      
      // Validate that we have at least one level
      if (submitData.tree.length === 0) {
        alert('Please add at least one level to the tree structure!');
        setSaving(false);
        return;
      }

      const res = await fetch(`/api/aiCourses/${courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      const data = await res.json();
      if (data.success) {
        console.log('✅ AI course updated successfully');
        console.log('📊 Response data:', JSON.stringify(data.data.tree?.map((l: { level: number; topic: string; lessons: unknown[] }) => ({
          level: l.level,
          topic: l.topic,
          lessonsCount: Array.isArray(l.lessons) ? l.lessons.length : 0
        })), null, 2));
        alert('AI Course updated successfully!');
        router.push('/dashboard/ai-courses');
      } else {
        console.error('❌ Error updating AI course:', data.error);
        alert('Error updating AI course: ' + data.error);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Error updating AI course:', errorMessage);
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
      <div className="mb-12 flex justify-between items-start">
        <div>
          <h1 className="text-5xl font-thin text-white mb-3 tracking-tight">Edit AI Mastery Path</h1>
          <div className="w-16 h-px bg-white/20 mb-4"></div>
          <p className="text-sm font-light text-white/60 tracking-wide">Update mastery path structure and levels</p>
        </div>
        <Link
          href={`/dashboard/ai-courses/${courseId}/add-lessons`}
          className="px-6 py-2.5 bg-white/5 text-white rounded-sm border border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-300 font-light text-sm tracking-wider uppercase"
        >
          + Add Lessons
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="bg-black/40 rounded-sm border border-white/10 p-8 max-w-4xl">
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-light text-white/60 mb-2 tracking-wider uppercase">Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 border border-white/10 rounded-sm bg-white/5 text-white placeholder-white/30 focus:bg-white/10 focus:border-white/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-light text-white/60 mb-2 tracking-wider uppercase">Heading *</label>
            <input
              type="text"
              required
              value={formData.heading}
              onChange={(e) => setFormData({ ...formData, heading: e.target.value })}
              className="w-full px-4 py-2.5 border border-white/10 rounded-sm bg-white/5 text-white placeholder-white/30 focus:bg-white/10 focus:border-white/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-light text-white/60 mb-2 tracking-wider uppercase">
              Sub Heading <span className="text-white/40 text-xs">(Optional)</span>
            </label>
            <input
              type="text"
              value={formData.subHeading || ''}
              onChange={(e) => setFormData({ ...formData, subHeading: e.target.value })}
              className="w-full px-4 py-2.5 border border-white/10 rounded-sm bg-white/5 text-white placeholder-white/30 focus:bg-white/10 focus:border-white/20 transition-all"
              placeholder="Optional sub-heading for better description"
            />
          </div>

          <div>
            <label className="block text-xs font-light text-white/60 mb-2 tracking-wider uppercase">
              AI Tool / Type * <span className="text-white/40 text-xs">(Select the AI tool this mastery path is for)</span>
            </label>
            <select
              required
              value={formData.aiTool}
              onChange={(e) => setFormData({ ...formData, aiTool: e.target.value })}
              className="w-full px-4 py-2.5 border border-white/10 rounded-sm bg-white/5 text-white focus:bg-white/10 focus:border-white/20 transition-all"
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
            <label className="block text-xs font-light text-white/60 mb-2 tracking-wider uppercase">
              Category / Tags <span className="text-white/40 text-xs">(Optional - helps with organization)</span>
            </label>
            <input
              type="text"
              value={formData.category || ''}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2.5 border border-white/10 rounded-sm bg-white/5 text-white placeholder-white/30 focus:bg-white/10 focus:border-white/20 transition-all"
              placeholder="e.g., Text Generation, Image Creation, Business"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4 border-white/10 rounded-sm bg-white/5 focus:ring-white/20"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-white">
              Active <span className="text-white/40 text-xs">(Show to users)</span>
            </label>
          </div>

          {/* Advanced Options - Collapsible */}
          <div className="border-t border-white/10 pt-6">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center justify-between w-full text-left text-white font-light hover:text-white/80 transition-colors"
            >
              <span>Advanced Options</span>
              <span className="text-white/40">{showAdvanced ? '▼' : '▶'}</span>
            </button>

            {showAdvanced && (
              <div className="mt-4 space-y-4 pl-4 border-l border-white/10">
                <div>
                  <label className="block text-xs font-light text-white/60 mb-2 tracking-wider uppercase">
                    Cover Image / Icon <span className="text-white/40 text-xs">(Optional - Base64 encoded)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.coverImage || ''}
                    onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                    className="w-full px-4 py-2.5 border border-white/10 rounded-sm bg-white/5 text-white placeholder-white/30 focus:bg-white/10 focus:border-white/20 transition-all text-xs"
                    placeholder="Base64 encoded image (optional)"
                  />
                  <p className="text-xs text-white/40 mt-1">Upload image and convert to Base64, or leave empty</p>
                </div>

                <div>
                  <label className="block text-xs font-light text-white/60 mb-2 tracking-wider uppercase">
                    Certificate <span className="text-white/40 text-xs">(Optional - for completion)</span>
                  </label>
                  <select
                    value={formData.certificateId || ''}
                    onChange={(e) => setFormData({ ...formData, certificateId: e.target.value })}
                    className="w-full px-4 py-2.5 border border-white/10 rounded-sm bg-white/5 text-white focus:bg-white/10 focus:border-white/20 transition-all"
                  >
                    <option value="">No Certificate</option>
                    {certificates.map((cert) => (
                      <option key={cert._id} value={cert._id}>
                        {cert.title} ({cert.icon})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-white/40 mt-1">Select a certificate to award on completion</p>
                </div>
              </div>
            )}
          </div>

            <div className="border-t border-white/10 pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Tree Structure</h3>
              <button
                type="button"
                onClick={addLevel}
                className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
              >
                + Add Level
              </button>
            </div>

            <div className="space-y-4">
              {formData.tree.map((level, index) => (
                <div key={index} className="border border-white/10 rounded-sm p-4 bg-white/5">
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
                          className="w-full px-3 py-2 border border-white/10 rounded-sm bg-white/5 text-white focus:bg-white/10 focus:border-white/20"
                        />
                      </div>

                      <div className="mb-2">
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-sm font-medium text-white">
                            Select Lessons {lessons.length > 0 && `(${lessons.length} available)`}
                          </label>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                console.log('🔄 Refreshing lessons...');
                                fetchLessons();
                              }}
                              className="text-xs px-3 py-1 bg-white/5 text-white rounded-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all font-light text-xs tracking-wider uppercase"
                              title="Refresh lessons list"
                            >
                              🔄 Refresh
                            </button>
                            <Link
                              href={`/dashboard/ai-courses/${courseId}/add-lessons`}
                              className="text-xs px-3 py-1 bg-white/5 text-white rounded-sm border border-white/20 hover:bg-white/10 hover:border-white/30 transition-all font-light text-xs tracking-wider uppercase"
                            >
                              + Add Lessons
                            </Link>
                          </div>
                        </div>
                        {lessons.length === 0 ? (
                          <div className="border-2 border-dashed border-zinc-700 rounded-xl p-6 text-center bg-zinc-900">
                            <p className="text-zinc-300 text-sm mb-2 font-semibold">⚠️ No AI lessons created yet!</p>
                            <p className="text-zinc-500 text-xs mb-4">
                              You need to create AI lessons first before you can assign them to levels.
                            </p>
                            <Link
                              href={`/dashboard/ai-courses/${courseId}/add-lessons`}
                              className="px-6 py-3 bg-white text-black rounded-xl hover:bg-zinc-200 transition-all font-semibold inline-block shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                              ➕ Create AI Lessons
                            </Link>
                            <p className="text-zinc-600 text-xs mt-3">
                              After creating lessons, come back here to assign them to each level.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-40 overflow-y-auto border rounded p-2">
                            {lessons.map((lesson) => (
                              <div
                                key={lesson._id}
                                className="flex items-center justify-between hover:bg-zinc-700 p-2 rounded"
                              >
                                <label className="flex items-center space-x-2 cursor-pointer flex-1 text-white">
                                  <input
                                    type="checkbox"
                                    checked={level.lessons.includes(lesson._id)}
                                    onChange={() => toggleLessonInLevel(index, lesson._id)}
                                    className="h-4 w-4 text-indigo-600"
                                  />
                                  <span className="text-sm">{lesson.title}</span>
                                </label>
                                <Link
                                  href={`/dashboard/ai-lessons/${lesson._id}/view`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="ml-2 px-2 py-1 bg-zinc-800 text-white rounded-lg hover:bg-zinc-600 text-xs font-semibold transition-all"
                                  title="View Lesson"
                                >
                                  👁️ View
                                </Link>
                              </div>
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
              className="px-6 py-2.5 bg-white/5 text-white rounded-sm border border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-300 font-light text-sm tracking-wider uppercase disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2.5 bg-white/5 text-white rounded-sm border border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-300 font-light text-sm tracking-wider uppercase"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

