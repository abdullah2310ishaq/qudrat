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
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-5xl font-thin text-white mb-3 tracking-tight">Certificate Templates</h1>
          <div className="w-16 h-px bg-white/20 mb-4"></div>
          <p className="text-sm font-light text-white/60 tracking-wide">Manage certificate templates for courses</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={seedTemplates}
            className="px-6 py-2.5 bg-white/5 text-white rounded-sm border border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-300 font-light text-sm tracking-wider uppercase"
          >
            🌟 Seed Templates
          </button>
          <Link
            href="/dashboard/certificates/new"
            className="px-6 py-2.5 bg-white/5 text-white rounded-sm border border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-300 font-light text-sm tracking-wider uppercase"
          >
            + Create Template
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border border-white/20 border-t-white/60"></div>
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-20 bg-black/40 rounded-sm border border-white/10">
          <div className="text-5xl mb-4 opacity-70">🏆</div>
          <p className="text-sm font-light text-white/60 mb-6 tracking-wide">No certificate templates found</p>
          <Link
            href="/dashboard/certificates/new"
            className="inline-block px-6 py-2.5 bg-white/5 text-white rounded-sm border border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-300 font-light text-sm tracking-wider uppercase"
          >
            Create your first template
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <div
              key={template._id}
              className="group bg-black/40 rounded-sm border transition-all duration-300 p-6 hover:border-opacity-50"
              style={{
                backgroundColor: template.design.backgroundColor,
                borderColor: template.design.borderColor,
                borderStyle: template.design.borderStyle,
                borderWidth: '1px',
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="text-3xl mb-2 opacity-80">{template.icon}</div>
                  <h3 className="text-base font-light mb-1" style={{ color: template.design.textColor }}>
                    {template.name}
                  </h3>
                  <p className="text-xs font-light mb-2" style={{ color: template.design.textColor, opacity: 0.7 }}>
                    {template.title}
                  </p>
                  {template.description && (
                    <p className="text-xs font-light" style={{ color: template.design.textColor, opacity: 0.5 }}>
                      {template.description}
                    </p>
                  )}
                </div>
                <span
                  className={`px-2.5 py-1 text-xs font-light rounded-sm border ${
                    template.isActive
                      ? 'bg-white/10 text-white border-white/20'
                      : 'bg-white/5 text-white/50 border-white/10'
                  }`}
                  style={template.isActive ? { color: template.design.textColor } : {}}
                >
                  {template.isActive ? '✓ Active' : '○ Inactive'}
                </span>
              </div>
              <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: template.design.borderColor, opacity: 0.3 }}>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleActive(template._id, template.isActive)}
                    className="text-xs px-3 py-1 rounded-sm bg-white/5 hover:bg-white/10 transition-all font-light tracking-wide border border-white/10"
                    style={{ color: template.design.textColor }}
                  >
                    {template.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <Link
                    href={`/dashboard/certificates/${template._id}`}
                    className="text-xs px-3 py-1 rounded-sm bg-white/5 hover:bg-white/10 transition-all font-light tracking-wide border border-white/10"
                    style={{ color: template.design.textColor }}
                  >
                    Edit
                  </Link>
                </div>
                <button
                  onClick={() => handleDelete(template._id)}
                  className="text-xs px-3 py-1 rounded-sm bg-white/5 hover:bg-red-400/20 transition-all font-light tracking-wide border border-white/10 hover:border-red-400/30 text-red-400/80"
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

