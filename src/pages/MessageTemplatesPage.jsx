import React, { useState } from 'react';
import {
  Plus, FileText, Search, X, Check, CheckCircle,
  Clock, AlertCircle, Edit2, Trash2, Eye, CopyPlus,
} from 'lucide-react';
import { useWhatsAppData } from '../context/WhatsAppDataContext';
import { useToast } from '../context/ToastContext';

const STATUS_META = {
  APPROVED: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Approved' },
  PENDING: { color: 'bg-amber-100 text-amber-700', icon: Clock, label: 'Pending' },
  REJECTED: { color: 'bg-red-100 text-red-600', icon: AlertCircle, label: 'Rejected' },
  DRAFT: { color: 'bg-gray-100 text-gray-600', icon: Edit2, label: 'Draft' },
};

const CATEGORY_OPTIONS = ['MARKETING', 'UTILITY', 'AUTHENTICATION'];
const LANGUAGE_OPTIONS = ['en', 'en_IN', 'hi', 'bn', 'mr', 'ta', 'te', 'kn', 'gu', 'pa'];

function EmptyTemplates({ onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center p-8">
      <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
        <FileText className="w-8 h-8 text-blue-300" />
      </div>
      <h3 className="font-bold text-gray-700 text-sm">No templates yet</h3>
      <p className="text-xs text-gray-400 mt-1 max-w-xs leading-relaxed">
        Create WhatsApp-approved message templates to use in broadcasts and automations.
      </p>
      <button
        onClick={onAdd}
        className="mt-4 flex items-center gap-2 px-4 py-2 bg-wa-teal text-white text-xs font-bold rounded-xl hover:bg-wa-dark transition"
      >
        <Plus className="w-3.5 h-3.5" />
        Create First Template
      </button>
    </div>
  );
}

function TemplateModal({ template, onClose, onSave }) {
  const [form, setForm] = useState(template || {
    name: '',
    category: 'MARKETING',
    language: 'en',
    headerText: '',
    bodyText: '',
    footerText: '',
    buttons: [],
    status: 'DRAFT',
  });

  const [newButtonLabel, setNewButtonLabel] = useState('');

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const addButton = () => {
    if (!newButtonLabel.trim() || form.buttons.length >= 3) return;
    set('buttons', [...form.buttons, { type: 'QUICK_REPLY', label: newButtonLabel.trim() }]);
    setNewButtonLabel('');
  };

  const removeButton = (idx) => set('buttons', form.buttons.filter((_, i) => i !== idx));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.bodyText) return;
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/25 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-modal w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">{template ? 'Edit Template' : 'Create Message Template'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name + Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Template Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => set('name', e.target.value.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''))}
                placeholder="e.g. order_confirmation"
                className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 font-mono focus:outline-none focus:ring-2 focus:ring-wa-green/30 focus:border-wa-green"
              />
              <p className="text-[11px] text-gray-400 mt-1">Lowercase letters, numbers, underscores only.</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Category *</label>
              <select
                value={form.category}
                onChange={(e) => set('category', e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-wa-green/30 focus:border-wa-green"
              >
                {CATEGORY_OPTIONS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Language */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Language</label>
            <select
              value={form.language}
              onChange={(e) => set('language', e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-wa-green/30 focus:border-wa-green"
            >
              {LANGUAGE_OPTIONS.map((l) => <option key={l}>{l}</option>)}
            </select>
          </div>

          {/* Header */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Header Text (optional)</label>
            <input
              type="text"
              value={form.headerText || ''}
              onChange={(e) => set('headerText', e.target.value)}
              placeholder="Header line..."
              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-wa-green/30 focus:border-wa-green"
            />
          </div>

          {/* Body */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Body Text * <span className="text-gray-400 font-normal">(use {'{{1}}'} for variables)</span>
            </label>
            <textarea
              rows={5}
              required
              value={form.bodyText || ''}
              onChange={(e) => set('bodyText', e.target.value)}
              placeholder="Hello {{1}}, your order {{2}} has been confirmed!"
              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-wa-green/30 focus:border-wa-green resize-none"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              {1024 - (form.bodyText?.length || 0)} characters remaining.
            </p>
          </div>

          {/* Footer */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Footer (optional)</label>
            <input
              type="text"
              value={form.footerText || ''}
              onChange={(e) => set('footerText', e.target.value)}
              placeholder="e.g. Reply STOP to unsubscribe"
              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-wa-green/30 focus:border-wa-green"
            />
          </div>

          {/* Buttons */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Quick Reply Buttons <span className="text-gray-400 font-normal">(max 3)</span>
            </label>
            <div className="space-y-2 mb-2">
              {(form.buttons || []).map((btn, idx) => (
                <div key={idx} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm">
                  <span className="font-medium text-gray-700">{btn.label}</span>
                  <button type="button" onClick={() => removeButton(idx)} className="text-gray-300 hover:text-red-400 transition">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            {form.buttons?.length < 3 && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newButtonLabel}
                  onChange={(e) => setNewButtonLabel(e.target.value)}
                  placeholder="Button label"
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addButton(); } }}
                  className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-wa-green/30 focus:border-wa-green"
                />
                <button
                  type="button"
                  onClick={addButton}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-xl font-medium transition"
                >
                  Add
                </button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 py-2.5 bg-wa-teal hover:bg-wa-dark text-white font-bold rounded-xl transition text-sm"
            >
              {template ? 'Save Changes' : 'Create Template'}
            </button>
            <button type="button" onClick={onClose} className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition text-sm">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function MessageTemplatesPage() {
  const { templates, createTemplate, updateTemplate, deleteTemplate } = useWhatsAppData();
  const { showSuccess, showError } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  const filtered = templates.filter((t) => {
    const matchSearch = searchQuery === '' || t.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = categoryFilter === 'ALL' || t.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const handleSave = (formData) => {
    if (editingTemplate) {
      updateTemplate(editingTemplate.id, formData);
      showSuccess('Template Updated', `"${formData.name}" has been saved.`);
    } else {
      createTemplate(formData);
      showSuccess('Template Created', `"${formData.name}" submitted for Meta approval.`);
    }
    setIsModalOpen(false);
    setEditingTemplate(null);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Delete template "${name}"? This cannot be undone.`)) {
      deleteTemplate(id);
      showSuccess('Deleted', `Template "${name}" removed.`);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">Message Templates</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {templates.length === 0
              ? 'Create your first Meta-approved message template.'
              : `${templates.length} template${templates.length !== 1 ? 's' : ''} · ${templates.filter((t) => t.status === 'APPROVED').length} approved`}
          </p>
        </div>
        <button
          id="create-template-btn"
          onClick={() => { setEditingTemplate(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-wa-teal hover:bg-wa-dark text-white font-bold text-sm rounded-xl shadow-wa-green transition"
        >
          <Plus className="w-4 h-4" />
          New Template
        </button>
      </div>

      {templates.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card">
          <EmptyTemplates onAdd={() => { setEditingTemplate(null); setIsModalOpen(true); }} />
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates..."
                className="bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-wa-green/30 focus:border-wa-green w-60"
              />
            </div>
            <div className="flex gap-2">
              {['ALL', ...CATEGORY_OPTIONS].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    categoryFilter === cat
                      ? 'bg-wa-teal text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((t) => {
              const meta = STATUS_META[t.status] || STATUS_META.DRAFT;
              return (
                <div key={t.id} className="bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-md transition">
                  <div className="p-4 pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-sm text-gray-900 font-mono">{t.name}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold rounded">{t.category}</span>
                          <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-[10px] rounded">{t.language}</span>
                        </div>
                      </div>
                      <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold ${meta.color}`}>
                        <meta.icon className="w-3 h-3" />
                        {meta.label}
                      </span>
                    </div>
                    {t.headerText && (
                      <p className="text-xs font-semibold text-gray-600 mb-1">{t.headerText}</p>
                    )}
                    <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">{t.bodyText}</p>
                    {t.footerText && (
                      <p className="text-xs text-gray-400 mt-1.5">{t.footerText}</p>
                    )}
                    {t.buttons?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-gray-100">
                        {t.buttons.map((btn, i) => (
                          <span key={i} className="px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-semibold rounded-lg">
                            {btn.label}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="px-4 py-2.5 border-t border-gray-100 flex items-center justify-end gap-2">
                    <button
                      onClick={() => { setEditingTemplate(t); setIsModalOpen(true); }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-wa-teal hover:bg-wa-teal/10 transition"
                      title="Edit template"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(t.id, t.name)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                      title="Delete template"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {isModalOpen && (
        <TemplateModal
          template={editingTemplate}
          onClose={() => { setIsModalOpen(false); setEditingTemplate(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
