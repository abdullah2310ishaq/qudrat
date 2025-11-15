'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewCertificateTemplatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    icon: '🏆',
    title: '',
    description: '',
    design: {
      backgroundColor: '#1a1a1a',
      textColor: '#ffffff',
      borderColor: '#ffffff',
      borderStyle: 'solid' as 'solid' | 'dashed' | 'dotted',
    },
    isActive: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/certificate-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        alert('Certificate template created successfully!');
        router.push('/dashboard/certificates');
      } else {
        alert('Error creating template: ' + data.error);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error creating template:', errorMessage);
      alert('Error creating template: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const presetTemplates = [
    {
      name: 'Classic Gold',
      icon: '🏆',
      title: 'Certificate of Completion',
      design: {
        backgroundColor: '#1a1a1a',
        textColor: '#FFD700',
        borderColor: '#FFD700',
        borderStyle: 'solid' as const,
      },
    },
    {
      name: 'Modern Blue',
      icon: '🎓',
      title: 'Achievement Certificate',
      design: {
        backgroundColor: '#0a1929',
        textColor: '#64b5f6',
        borderColor: '#64b5f6',
        borderStyle: 'dashed' as const,
      },
    },
    {
      name: 'Elegant Purple',
      icon: '⭐',
      title: 'Mastery Certificate',
      design: {
        backgroundColor: '#1a0a2e',
        textColor: '#b794f6',
        borderColor: '#b794f6',
        borderStyle: 'dotted' as const,
      },
    },
  ];

  const applyPreset = (preset: typeof presetTemplates[0]) => {
    setFormData({
      ...formData,
      name: preset.name,
      icon: preset.icon,
      title: preset.title,
      design: preset.design,
    });
  };

  return (
    <div className="p-8 bg-black">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Create Certificate Template</h1>
        <p className="text-zinc-400">Design a certificate template for courses</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Preset Templates */}
        <div className="lg:col-span-1">
          <div className="bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Templates</h3>
            <div className="space-y-3">
              {presetTemplates.map((preset, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="w-full p-4 rounded-xl border-2 border-zinc-700 hover:border-white transition-all text-left"
                  style={{
                    backgroundColor: preset.design.backgroundColor,
                    borderColor: preset.design.borderColor,
                    borderStyle: preset.design.borderStyle,
                  }}
                >
                  <div className="text-2xl mb-1">{preset.icon}</div>
                  <div className="text-sm font-semibold" style={{ color: preset.design.textColor }}>
                    {preset.name}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800 p-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Template Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:ring-2 focus:ring-white focus:border-white transition-all"
                  placeholder="e.g., Classic Gold Certificate"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Icon / Emoji *
                </label>
                <input
                  type="text"
                  required
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:ring-2 focus:ring-white focus:border-white transition-all text-2xl text-center"
                  placeholder="🏆"
                  maxLength={2}
                />
                <p className="text-xs text-zinc-400 mt-1">Enter an emoji or icon (1-2 characters)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:ring-2 focus:ring-white focus:border-white transition-all"
                  placeholder="e.g., Certificate of Completion"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Description <span className="text-zinc-400 text-xs">(Optional)</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:ring-2 focus:ring-white focus:border-white transition-all"
                  placeholder="Optional description for this template"
                  rows={3}
                />
              </div>

              {/* Design Options */}
              <div className="border-t border-zinc-800 pt-6">
                <h3 className="text-lg font-semibold text-white mb-4">Design Options</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Background Color</label>
                    <input
                      type="color"
                      value={formData.design.backgroundColor}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          design: { ...formData.design, backgroundColor: e.target.value },
                        })
                      }
                      className="w-full h-10 rounded-xl cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Text Color</label>
                    <input
                      type="color"
                      value={formData.design.textColor}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          design: { ...formData.design, textColor: e.target.value },
                        })
                      }
                      className="w-full h-10 rounded-xl cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Border Color</label>
                    <input
                      type="color"
                      value={formData.design.borderColor}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          design: { ...formData.design, borderColor: e.target.value },
                        })
                      }
                      className="w-full h-10 rounded-xl cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Border Style</label>
                    <select
                      value={formData.design.borderStyle}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          design: { ...formData.design, borderStyle: e.target.value as 'solid' | 'dashed' | 'dotted' },
                        })
                      }
                      className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:ring-2 focus:ring-white focus:border-white transition-all"
                    >
                      <option value="solid">Solid</option>
                      <option value="dashed">Dashed</option>
                      <option value="dotted">Dotted</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="border-t border-zinc-800 pt-6">
                <h3 className="text-lg font-semibold text-white mb-4">Preview</h3>
                <div
                  className="p-8 rounded-2xl border-2"
                  style={{
                    backgroundColor: formData.design.backgroundColor,
                    borderColor: formData.design.borderColor,
                    borderStyle: formData.design.borderStyle,
                  }}
                >
                  <div className="text-center">
                    <div className="text-6xl mb-4">{formData.icon}</div>
                    <h2 className="text-2xl font-bold mb-2" style={{ color: formData.design.textColor }}>
                      {formData.title || 'Certificate Title'}
                    </h2>
                    <p className="text-sm" style={{ color: formData.design.textColor, opacity: 0.8 }}>
                      {formData.name || 'Template Name'}
                    </p>
                  </div>
                </div>
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
                  Active <span className="text-zinc-400 text-xs">(Show in dropdowns)</span>
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-white text-black rounded-xl hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
                >
                  {loading ? 'Creating...' : 'Create Template'}
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
      </div>
    </div>
  );
}

