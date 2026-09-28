import React, { useState } from 'react';
import {
  Plus, Cpu, X, Play, Pause, Trash2, Edit2,
  Zap, MessageSquare, Clock, ChevronRight,
  Bot, AlertCircle,
} from 'lucide-react';
import { useWhatsAppData } from '../context/WhatsAppDataContext';
import { useToast } from '../context/ToastContext';

const TRIGGER_TYPES = [
  { value: 'keyword', label: 'Keyword Match', desc: 'Trigger on specific words in incoming messages' },
  { value: 'new_conversation', label: 'New Conversation', desc: 'Trigger when a new chat starts' },
  { value: 'opt_in', label: 'Contact Opt-In', desc: 'Trigger when a contact opts in' },
  { value: 'scheduled', label: 'Scheduled', desc: 'Run on a schedule (cron)' },
];

const ACTION_TYPES = [
  { value: 'send_template', label: 'Send Template Message' },
  { value: 'send_text', label: 'Send Text Reply' },
  { value: 'assign_agent', label: 'Assign to Agent' },
  { value: 'add_tag', label: 'Add Tag to Contact' },
  { value: 'webhook', label: 'Call Webhook URL' },
];

function AutomationModal({ automation, onClose, onSave }) {
  const { templates } = useWhatsAppData();
  const [form, setForm] = useState(automation || {
    name: '',
    triggerType: 'keyword',
    triggerValue: '',
    action: { type: 'send_text', text: '', templateId: '', tag: '', webhookUrl: '' },
    status: 'active',
  });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const setAction = (k, v) => setForm((p) => ({ ...p, action: { ...p.action, [k]: v } }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.triggerType) return;
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/25 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-modal w-full max-w-xl max-h-[90vh] overflow-y-auto animate-fade-in">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">{automation ? 'Edit Automation' : 'Create Automation Flow'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-sm">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Automation Name *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Keyword: PRICE Auto-reply"
              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-wa-green/30 focus:border-wa-green"
            />
          </div>

          {/* Trigger */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Trigger Event *</label>
            <div className="space-y-2">
              {TRIGGER_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => set('triggerType', t.value)}
                  className={`w-full text-left p-3 rounded-xl border transition flex items-start gap-3 ${
                    form.triggerType === t.value
                      ? 'border-wa-teal bg-wa-teal/5'
                      : 'border-gray-200 bg-gray-50 hover:bg-white'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center ${
                    form.triggerType === t.value ? 'border-wa-teal bg-wa-teal' : 'border-gray-300'
                  }`}>
                    {form.triggerType === t.value && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <span className={`font-semibold text-xs ${form.triggerType === t.value ? 'text-wa-teal' : 'text-gray-700'}`}>{t.label}</span>
                    <p className="text-[11px] text-gray-400 mt-0.5">{t.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Trigger Value */}
          {form.triggerType === 'keyword' && (
            <div className="animate-fade-in">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Keyword(s)</label>
              <input
                type="text"
                value={form.triggerValue || ''}
                onChange={(e) => set('triggerValue', e.target.value)}
                placeholder="e.g. PRICE, OFFER, HELP (comma-separated)"
                className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-wa-green/30 focus:border-wa-green font-mono"
              />
            </div>
          )}

          {form.triggerType === 'scheduled' && (
            <div className="animate-fade-in">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Cron Expression</label>
              <input
                type="text"
                value={form.triggerValue || ''}
                onChange={(e) => set('triggerValue', e.target.value)}
                placeholder="e.g. 0 9 * * 1 (every Monday at 9am)"
                className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-wa-green/30 focus:border-wa-green font-mono"
              />
            </div>
          )}

          {/* Action */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Action *</label>
            <select
              value={form.action?.type || 'send_text'}
              onChange={(e) => setAction('type', e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-wa-green/30 focus:border-wa-green"
            >
              {ACTION_TYPES.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
            </select>
          </div>

          {/* Action config */}
          {form.action?.type === 'send_text' && (
            <div className="animate-fade-in">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Reply Text *</label>
              <textarea
                rows={3}
                value={form.action?.text || ''}
                onChange={(e) => setAction('text', e.target.value)}
                placeholder="Hi! Our pricing starts at ₹999/mo. Visit our website or reply DETAILS."
                className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-wa-green/30 focus:border-wa-green resize-none"
              />
            </div>
          )}

          {form.action?.type === 'send_template' && (
            <div className="animate-fade-in">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Select Template</label>
              <select
                value={form.action?.templateId || ''}
                onChange={(e) => setAction('templateId', e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-wa-green/30 focus:border-wa-green"
              >
                <option value="">Select template...</option>
                {templates.filter((t) => t.status === 'APPROVED').map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          )}

          {form.action?.type === 'add_tag' && (
            <div className="animate-fade-in">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Tag to add</label>
              <input
                type="text"
                value={form.action?.tag || ''}
                onChange={(e) => setAction('tag', e.target.value)}
                placeholder="e.g. interested, lead"
                className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-wa-green/30 focus:border-wa-green"
              />
            </div>
          )}

          {form.action?.type === 'webhook' && (
            <div className="animate-fade-in">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Webhook URL (POST)</label>
              <input
                type="url"
                value={form.action?.webhookUrl || ''}
                onChange={(e) => setAction('webhookUrl', e.target.value)}
                placeholder="https://your-server.com/webhooks/whatsapp"
                className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 font-mono focus:outline-none focus:ring-2 focus:ring-wa-green/30 focus:border-wa-green"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 py-2.5 bg-wa-teal hover:bg-wa-dark text-white font-bold rounded-xl transition text-sm"
            >
              {automation ? 'Save Changes' : 'Create Automation'}
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

export default function AutomationsPage() {
  const { automations, createAutomation, updateAutomation, deleteAutomation, toggleAutomation } = useWhatsAppData();
  const { showSuccess } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState(null);

  const handleSave = (formData) => {
    if (editingAutomation) {
      updateAutomation(editingAutomation.id, formData);
      showSuccess('Automation Updated', `"${formData.name}" saved.`);
    } else {
      createAutomation(formData);
      showSuccess('Automation Created', `"${formData.name}" is now active.`);
    }
    setIsModalOpen(false);
    setEditingAutomation(null);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Delete automation "${name}"?`)) {
      deleteAutomation(id);
      showSuccess('Deleted', `"${name}" removed.`);
    }
  };

  const handleToggle = (id) => {
    toggleAutomation(id);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">Automations</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {automations.length === 0
              ? 'Automate replies, tags, and workflows triggered by customer messages.'
              : `${automations.length} automation${automations.length !== 1 ? 's' : ''} · ${automations.filter((a) => a.status === 'active').length} active`}
          </p>
        </div>
        <button
          id="create-automation-btn"
          onClick={() => { setEditingAutomation(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-wa-teal hover:bg-wa-dark text-white font-bold text-sm rounded-xl shadow-wa-green transition"
        >
          <Plus className="w-4 h-4" />
          New Automation
        </button>
      </div>

      {automations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
            <Bot className="w-8 h-8 text-amber-300" />
          </div>
          <h3 className="font-bold text-gray-700 text-sm mb-1">No automations yet</h3>
          <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
            Automate your WhatsApp workflows — keyword triggers, auto-replies, tags, webhooks, and more.
          </p>
          <button
            onClick={() => { setEditingAutomation(null); setIsModalOpen(true); }}
            className="mt-4 flex items-center gap-2 px-4 py-2 bg-wa-teal text-white text-xs font-bold rounded-xl hover:bg-wa-dark transition mx-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            Create First Automation
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {automations.map((auto) => (
            <div
              key={auto.id}
              className={`bg-white rounded-2xl border shadow-card transition p-4 ${
                auto.status === 'active' ? 'border-green-200' : 'border-gray-100'
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    auto.status === 'active' ? 'bg-green-50' : 'bg-gray-50'
                  }`}>
                    <Cpu className={`w-5 h-5 ${auto.status === 'active' ? 'text-green-500' : 'text-gray-400'}`} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-900 text-sm truncate">{auto.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-gray-500 capitalize">
                        Trigger: <strong>{auto.triggerType}</strong>
                        {auto.triggerValue && ` → "${auto.triggerValue}"`}
                      </span>
                      <ChevronRight className="w-3 h-3 text-gray-300" />
                      <span className="text-[11px] text-gray-500 capitalize">
                        Action: <strong>{auto.action?.type?.replace(/_/g, ' ')}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full ${
                    auto.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {auto.status}
                  </span>
                  <button
                    onClick={() => handleToggle(auto.id)}
                    className={`p-1.5 rounded-lg transition ${
                      auto.status === 'active'
                        ? 'text-amber-500 hover:bg-amber-50'
                        : 'text-green-500 hover:bg-green-50'
                    }`}
                    title={auto.status === 'active' ? 'Pause' : 'Activate'}
                  >
                    {auto.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => { setEditingAutomation(auto); setIsModalOpen(true); }}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(auto.id, auto.name)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <AutomationModal
          automation={editingAutomation}
          onClose={() => { setIsModalOpen(false); setEditingAutomation(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
