'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/components/Toast';

interface LessonForm {
  title: string;
  content: string;
  order: number;
  photos: string[];
  audio: string;
  canRead: boolean;
  canListen: boolean;
}

interface TreeLevel {
  level: number;
  topic: string;
  lessons: LessonForm[]; // Changed from string[] to LessonForm[]
  canRead: boolean;
  canListen: boolean;
}

export default function AddAICoursePage() {
  const router = useRouter();
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [aiToolInput, setAiToolInput] = useState('');
  const [aiToolTags, setAiToolTags] = useState<string[]>([]);
  const [courseForm, setCourseForm] = useState({
    title: '',
    heading: '',
    subHeading: '',
    category: '',
    coverImage: '',
    isActive: true,
    tree: [] as TreeLevel[],
  });

  const handleAiToolKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && aiToolInput.trim() !== '') {
      e.preventDefault();
      const newTag = aiToolInput.trim();
      if (!aiToolTags.includes(newTag)) {
        setAiToolTags([...aiToolTags, newTag]);
        setAiToolInput('');
      }
    }
  };

  const removeAiToolTag = (tag: string) => {
    setAiToolTags(aiToolTags.filter(t => t !== tag));
  };

  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('⚠️ Image is too large. Maximum size: 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setCourseForm({ ...courseForm, coverImage: base64 });
      toast.success('Image uploaded successfully!');
    };
    reader.onerror = () => {
      toast.error('❌ Error reading file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const addLevel = () => {
    const newLevel: TreeLevel = {
      level: courseForm.tree.length + 1,
      topic: '',
      lessons: [],
      canRead: true,
      canListen: false,
    };
    setCourseForm({
      ...courseForm,
      tree: [...courseForm.tree, newLevel],
    });
  };

  const updateLevel = (index: number, field: keyof TreeLevel, value: string | boolean) => {
    const newTree = [...courseForm.tree];
    (newTree[index] as any)[field] = value;
    setCourseForm({ ...courseForm, tree: newTree });
  };

  const removeLevel = (index: number) => {
    const newTree = courseForm.tree.filter((_, i) => i !== index);
    newTree.forEach((level, i) => {
      level.level = i + 1;
    });
    setCourseForm({ ...courseForm, tree: newTree });
  };

  const addLessonToLevel = (levelIndex: number) => {
    const newTree = [...courseForm.tree];
    const level = newTree[levelIndex];
    const newLesson: LessonForm = {
      title: '',
      content: '',
      order: level.lessons.length + 1,
      photos: [],
      audio: '',
      canRead: level.canRead,
      canListen: level.canListen,
    };
    level.lessons.push(newLesson);
    setCourseForm({ ...courseForm, tree: newTree });
  };

  const updateLessonInLevel = (levelIndex: number, lessonIndex: number, field: keyof LessonForm, value: string | number | boolean | string[]) => {
    const newTree = [...courseForm.tree];
    const level = newTree[levelIndex];
    (level.lessons[lessonIndex] as any)[field] = value;
    setCourseForm({ ...courseForm, tree: newTree });
  };

  const removeLessonFromLevel = (levelIndex: number, lessonIndex: number) => {
    const newTree = [...courseForm.tree];
    const level = newTree[levelIndex];
    level.lessons.splice(lessonIndex, 1);
    // Reorder lessons
    level.lessons.forEach((lesson, idx) => {
      lesson.order = idx + 1;
    });
    setCourseForm({ ...courseForm, tree: newTree });
  };

  const handleLessonImageUpload = (levelIndex: number, lessonIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('⚠️ Image is too large. Maximum size: 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const newTree = [...courseForm.tree];
      newTree[levelIndex].lessons[lessonIndex].photos.push(base64);
      setCourseForm({ ...courseForm, tree: newTree });
      toast.success('Image uploaded successfully!');
    };
    reader.onerror = () => {
      toast.error('❌ Error reading file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleLessonAudioUpload = (levelIndex: number, lessonIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('⚠️ Audio is too large. Maximum size: 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      updateLessonInLevel(levelIndex, lessonIndex, 'audio', base64);
      toast.success('Audio uploaded successfully!');
    };
    reader.onerror = () => {
      toast.error('❌ Error reading file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (aiToolTags.length === 0) {
      toast.error('⚠️ Please add at least one AI Tool type');
      return;
    }

    if (courseForm.tree.length === 0) {
      toast.error('⚠️ Please add at least one level');
      return;
    }

    // Validate all levels have topics
    for (const level of courseForm.tree) {
      if (!level.topic.trim()) {
        toast.error(`⚠️ Level ${level.level} must have a topic`);
        return;
      }
    }

    setSaving(true);
    const createToastId = toast.loading('Creating AI course and lessons...');
    try {
      // Use first AI tool tag as primary aiTool, join others as category
      const aiTool = aiToolTags[0];
      const category = aiToolTags.slice(1).join(', ') || courseForm.category || undefined;

      // First, create the AI course with empty lesson arrays
      const courseRes = await fetch('/api/aiCourses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: courseForm.title,
          heading: courseForm.heading,
          subHeading: courseForm.subHeading || undefined,
          aiTool,
          category,
          coverImage: courseForm.coverImage || undefined,
          isActive: courseForm.isActive,
          tree: courseForm.tree.map(level => ({
            level: level.level,
            topic: level.topic,
            lessons: [], // Will be populated after creating lessons
            canRead: level.canRead,
            canListen: level.canListen,
          })),
        }),
      });
      const courseData = await courseRes.json();
      
      if (!courseData.success) {
        toast.removeToast(createToastId);
        toast.error('❌ Error creating AI course: ' + courseData.error);
        return;
      }

      const courseId = courseData.data._id;
      const lessonIds: string[] = [];

      // Create all lessons and collect their IDs
      for (const level of courseForm.tree) {
        for (const lesson of level.lessons) {
          if (!lesson.title.trim() || !lesson.content.trim()) {
            continue; // Skip empty lessons
          }

          const mediaArray: string[] = [];
          if (lesson.audio) {
            mediaArray.push(lesson.audio);
          }

          const lessonRes = await fetch('/api/aiLessons', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              aiCourseId: courseId,
              title: lesson.title.trim(),
              content: lesson.content.trim(),
              photos: lesson.photos,
              media: mediaArray,
              order: lesson.order,
              isInteractive: false,
              canRead: lesson.canRead,
              canListen: lesson.canListen,
            }),
          });

          const lessonData = await lessonRes.json();
          if (lessonData.success) {
            lessonIds.push(lessonData.data._id);
          }
        }
      }

      // Now update the course with lesson IDs organized by level
      let lessonIndex = 0;
      const updatedTree = courseForm.tree.map(level => {
        const levelLessonIds: string[] = [];
        for (const lesson of level.lessons) {
          if (lesson.title.trim() && lesson.content.trim() && lessonIndex < lessonIds.length) {
            levelLessonIds.push(lessonIds[lessonIndex]);
            lessonIndex++;
          }
        }
        return {
          level: level.level,
          topic: level.topic,
          lessons: levelLessonIds,
          canRead: level.canRead,
          canListen: level.canListen,
        };
      });

      // Update course with lesson IDs
      const updateRes = await fetch(`/api/aiCourses/${courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tree: updatedTree,
        }),
      });

      const updateData = await updateRes.json();
      toast.removeToast(createToastId);
      
      if (updateData.success) {
        toast.success(`✅ AI course created successfully with ${lessonIds.length} lesson(s)!`);
        router.push(`/dashboard/ai-courses-unified/view/${courseId}`);
      } else {
        toast.error('❌ Error updating course with lessons: ' + updateData.error);
      }
    } catch (error) {
      console.error('Error creating AI course:', error);
      toast.removeToast(createToastId);
      toast.error('❌ Error creating AI course');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 min-h-screen" style={{ backgroundColor: '#F5F5DC' }}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-4">
          <Link
            href="/dashboard/ai-courses-unified"
            className="inline-block mb-2 text-black/70 hover:text-black font-medium text-xs"
          >
            ← Back to AI Courses
          </Link>
          <h1 className="text-lg font-bold text-black mb-1">🤖 Add New AI Course</h1>
          <p className="text-black/70 text-xs">Create a new AI mastery path</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded border border-black shadow-md p-4">
          <form onSubmit={handleCreateCourse} className="space-y-3">
            <div>
              <label className="block text-black font-semibold mb-1 text-xs">
                Course Title <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={courseForm.title}
                onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                className="w-full px-2 py-1.5 bg-white border border-black/20 rounded text-black focus:border-black focus:outline-none text-xs font-medium placeholder:text-black/50"
                placeholder="e.g., ChatGPT Mastery"
                style={{ color: '#000' }}
              />
            </div>

            <div>
              <label className="block text-black font-semibold mb-1 text-xs">
                Heading <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={courseForm.heading}
                onChange={(e) => setCourseForm({ ...courseForm, heading: e.target.value })}
                className="w-full px-2 py-1.5 bg-white border border-black/20 rounded text-black focus:border-black focus:outline-none text-xs font-medium placeholder:text-black/50"
                placeholder="e.g., Master ChatGPT"
                style={{ color: '#000' }}
              />
            </div>

            <div>
              <label className="block text-black font-semibold mb-1 text-xs">
                Sub Heading (Optional)
              </label>
              <input
                type="text"
                value={courseForm.subHeading}
                onChange={(e) => setCourseForm({ ...courseForm, subHeading: e.target.value })}
                className="w-full px-2 py-1.5 bg-white border border-black/20 rounded text-black focus:border-black focus:outline-none text-xs placeholder:text-black/50"
                placeholder="Additional details"
                style={{ color: '#000' }}
              />
            </div>

            <div>
              <label className="block text-black font-semibold mb-1 text-xs">
                AI Tool / Type <span className="text-red-600">*</span>
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2 p-2 border border-black/20 rounded bg-white min-h-[40px]">
                {aiToolTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-black text-white rounded text-xs font-semibold"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeAiToolTag(tag)}
                      className="hover:text-red-200"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={aiToolInput}
                  onChange={(e) => setAiToolInput(e.target.value)}
                  onKeyDown={handleAiToolKeyDown}
                  className="flex-1 min-w-[120px] px-2 py-0.5 border-0 outline-none text-xs bg-transparent text-black placeholder:text-black/50"
                  placeholder="Type and press Enter to add..."
                  style={{ color: '#000' }}
                />
              </div>
              <p className="text-black/60 text-xs mt-0.5">Type AI tool name and press Enter to add (e.g., ChatGPT, MidJourney)</p>
            </div>

            <div>
              <label className="block text-black font-semibold mb-1 text-xs">
                Category (Optional)
              </label>
              <input
                type="text"
                value={courseForm.category}
                onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                className="w-full px-2 py-1.5 bg-white border border-black/20 rounded text-black focus:border-black focus:outline-none text-xs placeholder:text-black/50"
                placeholder="e.g., Text Generation, Image Creation"
                style={{ color: '#000' }}
              />
            </div>

            <div>
              <label className="block text-black font-semibold mb-1 text-xs">
                Cover Photo (Optional)
              </label>
              <label className="block px-2 py-1.5 bg-blue-50 border border-blue-200 rounded text-blue-700 text-xs font-semibold cursor-pointer hover:bg-blue-100 text-center transition-colors">
                📷 Choose Cover Image (Optional)
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverImageUpload}
                  className="hidden"
                />
              </label>
              {courseForm.coverImage && (
                <div className="mt-2">
                  <img src={courseForm.coverImage} alt="Preview" className="max-w-xs rounded border border-black/20 shadow-sm" />
                  <button
                    type="button"
                    onClick={() => setCourseForm({ ...courseForm, coverImage: '' })}
                    className="mt-1.5 px-2 py-1 bg-red-600 text-white rounded text-xs font-semibold hover:bg-red-700"
                  >
                    Remove Photo
                  </button>
                </div>
              )}
              <p className="text-black/60 text-xs mt-0.5">Upload a cover image (max 5MB)</p>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={courseForm.isActive}
                onChange={(e) => setCourseForm({ ...courseForm, isActive: e.target.checked })}
                className="w-4 h-4 mr-2"
              />
              <label htmlFor="isActive" className="text-black font-semibold text-xs cursor-pointer">
                Course is Active (visible to users)
              </label>
            </div>

            {/* Tree Structure - Levels */}
            <div className="border-t border-black/10 pt-3">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h3 className="text-black font-semibold text-xs mb-0.5">📚 Levels & Topics</h3>
                  <p className="text-black/60 text-xs">Add levels and lessons to build your AI mastery path</p>
                </div>
                <button
                  type="button"
                  onClick={addLevel}
                  className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold text-xs"
                >
                  ➕ Add Level
                </button>
              </div>

              {courseForm.tree.length === 0 ? (
                <div className="text-center py-8 bg-cream-50 rounded border border-dashed border-black/20">
                  <div className="text-3xl mb-2">📚</div>
                  <p className="text-black/70 text-xs mb-1 font-semibold">No levels added yet</p>
                  <p className="text-black/50 text-xs mb-3">Click "+ Add Level" to start building the structure</p>
                  <button
                    type="button"
                    onClick={addLevel}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold text-xs"
                  >
                    ➕ Add Your First Level
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {courseForm.tree.map((level, index) => (
                    <div key={index} className="bg-cream-50 rounded border-2 border-black/30 p-3 shadow-sm">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-0.5 bg-black text-white rounded text-xs font-bold">Level {level.level}</span>
                            <label className="block text-black font-semibold text-xs">
                              Topic <span className="text-red-600">*</span>
                            </label>
                          </div>
                          <input
                            type="text"
                            required
                            value={level.topic}
                            onChange={(e) => updateLevel(index, 'topic', e.target.value)}
                            className="w-full px-2 py-1.5 bg-white border border-black/20 rounded text-black focus:border-black focus:outline-none text-xs placeholder:text-black/50"
                            placeholder="e.g., Introduction, Advanced Topics"
                            style={{ color: '#000' }}
                          />
                          <div className="flex gap-3 mt-2">
                            <label className="flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={level.canRead}
                                onChange={(e) => updateLevel(index, 'canRead', e.target.checked)}
                                className="w-3 h-3 mr-1.5"
                              />
                              <span className="text-black font-medium text-xs">📖 Can Read</span>
                            </label>
                            <label className="flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={level.canListen}
                                onChange={(e) => updateLevel(index, 'canListen', e.target.checked)}
                                className="w-3 h-3 mr-1.5"
                              />
                              <span className="text-black font-medium text-xs">🎵 Can Listen</span>
                            </label>
                          </div>

                          {/* Lessons in this Level */}
                          <div className="mt-3 pt-3 border-t border-black/10">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="text-black font-semibold text-xs">📖 Lessons ({level.lessons.length})</h4>
                              <button
                                type="button"
                                onClick={() => addLessonToLevel(index)}
                                className="px-2 py-0.5 bg-green-600 text-white rounded hover:bg-green-700 font-semibold text-xs"
                              >
                                ➕ Add Lesson
                              </button>
                            </div>

                            {level.lessons.length === 0 ? (
                              <div className="text-center py-4 bg-white/50 rounded border border-dashed border-black/20">
                                <p className="text-black/60 text-xs mb-1">No lessons yet</p>
                                <p className="text-black/50 text-xs">Click "+ Add Lesson" to add your first lesson</p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {level.lessons.map((lesson, lessonIdx) => (
                                  <div key={lessonIdx} className="bg-white rounded border border-black/10 p-2">
                                    <div className="flex justify-between items-start mb-2">
                                      <div className="flex-1">
                                        <input
                                          type="text"
                                          required
                                          value={lesson.title}
                                          onChange={(e) => updateLessonInLevel(index, lessonIdx, 'title', e.target.value)}
                                          className="w-full px-2 py-1 bg-white border border-black/20 rounded text-black focus:border-black focus:outline-none text-xs font-semibold mb-1 placeholder:text-black/50"
                                          placeholder="Lesson Title *"
                                          style={{ color: '#000' }}
                                        />
                                        <textarea
                                          required
                                          rows={3}
                                          value={lesson.content}
                                          onChange={(e) => updateLessonInLevel(index, lessonIdx, 'content', e.target.value)}
                                          className="w-full px-2 py-1 bg-white border border-black/20 rounded text-black focus:border-black focus:outline-none text-xs mb-1 placeholder:text-black/50"
                                          placeholder="Lesson Content *"
                                          style={{ color: '#000' }}
                                        />
                                        <div className="flex gap-2 mb-1">
                                          <label className="flex items-center cursor-pointer">
                                            <input
                                              type="checkbox"
                                              checked={lesson.canRead}
                                              onChange={(e) => updateLessonInLevel(index, lessonIdx, 'canRead', e.target.checked)}
                                              className="w-3 h-3 mr-1"
                                            />
                                            <span className="text-black font-medium text-xs">📖 Read</span>
                                          </label>
                                          <label className="flex items-center cursor-pointer">
                                            <input
                                              type="checkbox"
                                              checked={lesson.canListen}
                                              onChange={(e) => updateLessonInLevel(index, lessonIdx, 'canListen', e.target.checked)}
                                              className="w-3 h-3 mr-1"
                                            />
                                            <span className="text-black font-medium text-xs">🎵 Listen</span>
                                          </label>
                                        </div>
                                        <div className="flex gap-1.5 mb-1 flex-wrap">
                                          <label className="px-2 py-1 bg-blue-50 border border-blue-200 rounded text-blue-700 text-xs font-semibold cursor-pointer hover:bg-blue-100">
                                            📷 Add Image
                                            <input
                                              type="file"
                                              accept="image/*"
                                              onChange={(e) => handleLessonImageUpload(index, lessonIdx, e)}
                                              className="hidden"
                                            />
                                          </label>
                                          <label className="px-2 py-1 bg-green-50 border border-green-200 rounded text-green-700 text-xs font-semibold cursor-pointer hover:bg-green-100">
                                            🎵 Add Audio
                                            <input
                                              type="file"
                                              accept="audio/*"
                                              onChange={(e) => handleLessonAudioUpload(index, lessonIdx, e)}
                                              className="hidden"
                                            />
                                          </label>
                                        </div>
                                        {lesson.photos.length > 0 && (
                                          <div className="flex gap-1 mt-1 flex-wrap">
                                            {lesson.photos.map((photo, photoIdx) => (
                                              <div key={photoIdx} className="relative">
                                                <img src={photo} alt={`Preview ${photoIdx + 1}`} className="w-16 h-16 object-cover rounded border border-black/20" />
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    const newTree = [...courseForm.tree];
                                                    newTree[index].lessons[lessonIdx].photos.splice(photoIdx, 1);
                                                    setCourseForm({ ...courseForm, tree: newTree });
                                                  }}
                                                  className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center"
                                                >
                                                  ×
                                                </button>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                        {lesson.audio && (
                                          <div className="mt-1">
                                            <audio controls src={lesson.audio} className="w-full h-8" />
                                            <button
                                              type="button"
                                              onClick={() => updateLessonInLevel(index, lessonIdx, 'audio', '')}
                                              className="mt-1 px-2 py-0.5 bg-red-600 text-white rounded text-xs font-semibold hover:bg-red-700"
                                            >
                                              Remove Audio
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => removeLessonFromLevel(index, lessonIdx)}
                                        className="ml-2 px-2 py-1 text-red-600 hover:text-red-700 font-semibold text-xs"
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeLevel(index)}
                          className="ml-2 px-2 py-1 text-red-600 hover:text-red-700 font-semibold text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-3 border-t border-black/10">
              <button
                type="submit"
                disabled={saving || aiToolTags.length === 0 || courseForm.tree.length === 0}
                className="flex-1 px-3 py-1.5 bg-black text-white rounded hover:bg-black/90 transition-all font-semibold text-xs disabled:opacity-50"
              >
                {saving ? '⏳ Creating...' : '✅ Create AI Course'}
              </button>
              <Link
                href="/dashboard/ai-courses-unified"
                className="px-3 py-1.5 bg-white border border-black/20 text-black rounded hover:bg-black/5 transition-all font-semibold text-xs"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
