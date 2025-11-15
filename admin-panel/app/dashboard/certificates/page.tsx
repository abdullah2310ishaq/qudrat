'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface CertificateTemplate {
  _id: string;
  name: string;
  icon: string;
  title: string;
  description?: string;
  design: {
    backgroundColor: string;
    textColor: string;
    borderColor: string;
    borderStyle: string;
  };
  isActive: boolean;
  createdAt: string;
}

export default function CertificatesPage() {
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/certificate-templates');
      const data = await res.json();
      if (data.success) {
        setTemplates(data.data || []);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error fetching templates:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const res = await fetch(`/api/certificate-templates/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        fetchTemplates();
      } else {
        alert('Error deleting template: ' + data.error);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error deleting template:', errorMessage);
      alert('Error deleting template: ' + errorMessage);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/certificate-templates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      const data = await res.json();
      if (data.success) {
        fetchTemplates();
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error updating template:', errorMessage);
    }
  };

  const seedTemplates = async () => {
    if (!confirm('This will create 4 beautiful Qudrat Academy certificate templates. Continue?')) {
      return;
    }

    try {
      const res = await fetch('/api/certificate-templates/seed', {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        alert(`Successfully created ${data.data.length} certificate templates!`);
        fetchTemplates();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error seeding templates:', errorMessage);
      alert('Error creating templates: ' + errorMessage);
    }
  };

  return (
    <div className="p-8 bg-black">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Certificate Templates</h1>
          <p className="text-zinc-400">Manage certificate templates for courses</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={seedTemplates}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
          >
            🌟 Seed Qudrat Academy Templates
          </button>
          <Link
            href="/dashboard/certificates/new"
            className="px-6 py-3 bg-white text-black rounded-xl hover:bg-zinc-200 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
          >
            + Create Template
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-20 bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800">
          <div className="text-6xl mb-4">🏆</div>
          <p className="text-zinc-400 mb-4 text-lg">No certificate templates found</p>
          <Link
            href="/dashboard/certificates/new"
            className="inline-block px-6 py-3 bg-white text-black rounded-xl hover:bg-zinc-200 transition-all shadow-lg hover:shadow-xl font-semibold"
          >
            Create your first template
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div
              key={template._id}
              className="group bg-zinc-900 rounded-2xl shadow-2xl hover:shadow-white/10 transition-all duration-300 p-6 border border-zinc-800 hover:border-white/20"
              style={{
                backgroundColor: template.design.backgroundColor,
                borderColor: template.design.borderColor,
                borderStyle: template.design.borderStyle,
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="text-4xl mb-2">{template.icon}</div>
                  <h3 className="text-lg font-bold mb-1" style={{ color: template.design.textColor }}>
                    {template.name}
                  </h3>
                  <p className="text-sm mb-2" style={{ color: template.design.textColor, opacity: 0.8 }}>
                    {template.title}
                  </p>
                  {template.description && (
                    <p className="text-xs" style={{ color: template.design.textColor, opacity: 0.6 }}>
                      {template.description}
                    </p>
                  )}
                </div>
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    template.isActive
                      ? 'bg-white text-black border border-white'
                      : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                  }`}
                >
                  {template.isActive ? '✓ Active' : '○ Inactive'}
                </span>
              </div>
              <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: template.design.borderColor }}>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleActive(template._id, template.isActive)}
                    className="text-xs px-3 py-1 rounded-lg bg-zinc-800 text-white hover:bg-zinc-700 transition-colors"
                  >
                    {template.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <Link
                    href={`/dashboard/certificates/${template._id}`}
                    className="text-xs px-3 py-1 rounded-lg bg-zinc-800 text-white hover:bg-zinc-700 transition-colors"
                  >
                    Edit
                  </Link>
                </div>
                <button
                  onClick={() => handleDelete(template._id)}
                  className="text-xs px-3 py-1 rounded-lg bg-red-900 text-red-200 hover:bg-red-800 transition-colors"
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

