'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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

export default function NewAICoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    heading: '',
    subHeading: '',
    aiTool: 'ChatGPT',
    category: '',
    coverImage: '',
    certificateId: '',
    isActive: true,
    tree: [] as TreeLevel[],
  });

  useEffect(() => {
    Promise.all([fetchLessons(), fetchPrompts(), fetchCertificates()]);
  }, []);

  const fetchLessons = async () => {
    try {
      const res = await fetch('/api/lessons');
      const data = await res.json();
      if (data.success) {
        setLessons(data.data || []);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error fetching lessons:', errorMessage);
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
    // Reorder levels
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
    setLoading(true);

    try {
      // Clean up empty strings for optional fields
      const submitData = {
        ...formData,
        certificateId: formData.certificateId || undefined,
        category: formData.category || undefined,
        subHeading: formData.subHeading || undefined,
        coverImage: formData.coverImage || undefined,
      };
      
      const res = await fetch('/api/aiCourses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      const data = await res.json();
      if (data.success) {
        // Redirect to add lessons page so user can immediately create lessons
        router.push(`/dashboard/lessons/manage?aiCourseId=${data.data._id}`);
      } else {
        alert('Error creating AI course: ' + data.error);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error creating AI course:', errorMessage);
      alert('Error creating AI course: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-black">
      <div className="mb-12">
        <h1 className="text-5xl font-thin text-white mb-3 tracking-tight">Create AI Mastery Path</h1>
        <div className="w-16 h-px bg-white/20 mb-4"></div>
        <p className="text-sm font-light text-white/60 tracking-wide">Build a structured learning path with levels and lessons</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-black/40 rounded-sm border border-white/10 p-8 max-w-4xl">
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-light text-white/60 mb-2 tracking-wider uppercase">
              Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 border border-white/10 rounded-sm bg-white/5 text-white placeholder-white/30 focus:bg-white/10 focus:border-white/20 transition-all"
              placeholder="e.g., ChatGPT Mastery"
            />
          </div>

          <div>
            <label className="block text-xs font-light text-white/60 mb-2 tracking-wider uppercase">
              Heading *
            </label>
            <input
              type="text"
              required
              value={formData.heading}
              onChange={(e) => setFormData({ ...formData, heading: e.target.value })}
              className="w-full px-4 py-2.5 border border-white/10 rounded-sm bg-white/5 text-white placeholder-white/30 focus:bg-white/10 focus:border-white/20 transition-all"
              placeholder="e.g., Master ChatGPT"
            />
          </div>

          <div>
            <label className="block text-xs font-light text-white/60 mb-2 tracking-wider uppercase">
              Sub Heading <span className="text-white/40 text-xs">(Optional)</span>
            </label>
            <input
              type="text"
              value={formData.subHeading}
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
              value={formData.category}
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
              className="h-4 w-4 text-white bg-zinc-800 border-zinc-700 rounded focus:ring-white"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-white">
              Active <span className="text-white/40 text-xs">(Show to users)</span>
            </label>
          </div>

          {/* Advanced Options - Collapsible */}
          <div className="border-t border-zinc-800 pt-6">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center justify-between w-full text-left text-white font-light hover:text-white/80 transition-colors"
            >
              <span>Advanced Options</span>
              <span className="text-white/40">{showAdvanced ? '▼' : '▶'}</span>
            </button>

            {showAdvanced && (
              <div className="mt-4 space-y-4 pl-4 border-l-2 border-zinc-800">
                <div>
                  <label className="block text-xs font-light text-white/60 mb-2 tracking-wider uppercase">
                    Cover Image / Icon <span className="text-white/40 text-xs">(Optional - Base64 encoded)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.coverImage}
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
                    value={formData.certificateId}
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

          <div className="border-t border-zinc-800 pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Tree Structure (Levels & Lessons)</h3>
              <button
                type="button"
                onClick={addLevel}
                className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
              >
                + Add Level
              </button>
            </div>

            {formData.tree.length === 0 ? (
              <div className="text-center py-8 text-white/40 border-2 border-dashed border-white/10 rounded-sm bg-white/5">
                No levels added yet. Click &quot;Add Level&quot; to start building the tree structure.
              </div>
            ) : (
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
                            placeholder="e.g., Introduction, Prompting, Pro Topics"
                          />
                        </div>

                        <div className="mb-2">
                          <label className="block text-xs font-light text-white/60 mb-2 tracking-wider uppercase">
                            Select Lessons for this Level
                          </label>
                          <div className="border rounded p-4 bg-zinc-900 border-zinc-700">
                            <p className="text-sm text-white/40 mb-2">
                              💡 Lessons will be added after creating the AI course. You can add lessons from the course edit page.
                            </p>
                            <p className="text-xs text-zinc-500">
                              After creating this course, go to "Add Lessons" to create lessons specifically for this AI Mastery Path.
                            </p>
                          </div>
                          {level.lessons.length > 0 && (
                            <p className="text-xs text-white/40 mt-2">
                              {level.lessons.length} lesson ID(s) will be assigned (add lessons after course creation)
                            </p>
                          )}
                        </div>

                        <div className="mb-2">
                          <label className="block text-xs font-light text-white/60 mb-2 tracking-wider uppercase">
                            Link Prompts <span className="text-white/40 text-xs">(Optional - from Prompt Library)</span>
                          </label>
                          <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border border-white/10 rounded-sm p-2 bg-white/5">
                            {prompts
                              .filter((p) => p.tool === formData.aiTool || formData.aiTool === 'Other')
                              .map((prompt) => (
                                <label
                                  key={prompt._id}
                                  className="flex items-center space-x-2 cursor-pointer hover:bg-zinc-800 p-1 rounded text-white"
                                >
                                  <input
                                    type="checkbox"
                                    checked={level.promptIds.includes(prompt._id)}
                                    onChange={() => togglePromptInLevel(index, prompt._id)}
                                    className="h-4 w-4 text-white bg-zinc-800 border-zinc-700 rounded focus:ring-white"
                                  />
                                  <span className="text-xs">{prompt.title}</span>
                                </label>
                              ))}
                          </div>
                          {level.promptIds.length > 0 && (
                            <p className="text-xs text-white/40 mt-1">
                              {level.promptIds.length} prompt(s) linked to this level
                            </p>
                          )}
                        </div>

                        <div className="flex gap-4">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={level.canRead}
                              onChange={(e) => updateLevel(index, 'canRead', e.target.checked)}
                              className="h-4 w-4 text-white bg-zinc-800 border-zinc-700 rounded focus:ring-white"
                            />
                            <span className="ml-2 text-sm text-white">Can Read</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={level.canListen}
                              onChange={(e) => updateLevel(index, 'canListen', e.target.checked)}
                              className="h-4 w-4 text-white bg-zinc-800 border-zinc-700 rounded focus:ring-white"
                            />
                            <span className="ml-2 text-sm text-white">Can Listen</span>
                          </label>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeLevel(index)}
                        className="ml-4 text-red-400 hover:text-red-300 font-light"
                      >
                        Remove Level
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading || formData.tree.length === 0}
              className="px-6 py-2.5 bg-white/5 text-white rounded-sm border border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-300 font-light text-sm tracking-wider uppercase disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create AI Mastery Path'}
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

