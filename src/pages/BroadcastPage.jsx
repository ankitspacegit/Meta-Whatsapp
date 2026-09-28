import React, { useState } from 'react';
import {
  Plus, SendHorizontal, X, Users, FileText, Calendar,
  CheckCircle, Clock, AlertCircle, BarChart2, Loader2,
  ChevronRight, Info,
} from 'lucide-react';
import { useWhatsAppData } from '../context/WhatsAppDataContext';
import { useToast } from '../context/ToastContext';

const STATUS_META = {
  draft:     { color: 'bg-gray-100 text-gray-600',  icon: Clock,        label: 'Draft' },
  scheduled: { color: 'bg-blue-100 text-blue-700',  icon: Calendar,     label: 'Scheduled' },
  running:   { color: 'bg-amber-100 text-amber-700',icon: Loader2,      label: 'Running' },
  sent:      { color: 'bg-green-100 text-green-700',icon: CheckCircle,  label: 'Sent' },
  failed:    { color: 'bg-red-100 text-red-600',    icon: AlertCircle,  label: 'Failed' },
};

function EmptyBroadcasts({ onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center p-8">
      <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-4">
        <SendHorizontal className="w-8 h-8 text-green-300" />
      </div>
      <h3 className="font-bold text-gray-700 text-sm">No broadcasts yet</h3>
      <p className="text-xs text-gray-400 mt-1 max-w-xs leading-relaxed">
        Send bulk WhatsApp messages to your contacts using approved templates. Create your first campaign below.
      </p>
      <button
        onClick={onAdd}
        className="mt-4 flex items-center gap-2 px-4 py-2 bg-wa-teal text-white text-xs font-bold rounded-xl hover:bg-wa-dark transition"
      >
        <Plus className="w-3.5 h-3.5" />
        Create First Broadcast
      </button>
    </div>
  );
}

function BroadcastModal({ onClose, onSave }) {
  const { templates, contacts } = useWhatsAppData();
  const approvedTemplates = templates.filter((t) => t.status === 'APPROVED');

  const [form, setForm] = useState({
    name: '',
    templateId: '',
    audienceType: 'all',
    scheduledAt: '',
    variables: {},
  });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const selectedTemplate = templates.find((t) => t.id === form.templateId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.templateId) return;
    onSave(form);
  };

  const recipientCount =
    form.audienceType === 'all'
      ? contacts.length
      : contacts.filter((c) => c.tags?.includes(form.audienceType)).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/25 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-modal w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Create Broadcast Campaign</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-sm">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Campaign Name *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Festive Sale Campaign Oct 2024"
              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-wa-green/30 focus:border-wa-green"
            />
          </div>

          {/* Template Selection */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Message Template *</label>
            {approvedTemplates.length === 0 ? (
              <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
                <Info className="w-4 h-4 shrink-0" />
                No approved templates. Create and get at least one template approved first.
              </div>
            ) : (
              <select
                required
                value={form.templateId}
                onChange={(e) => set('templateId', e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-wa-green/30 focus:border-wa-green"
              >
                <option value="">Select a template...</option>
                {approvedTemplates.map((t) => (
                  <option key={t.id} value={t.id}>{t.name} ({t.category})</option>
                ))}
              </select>
            )}
            {selectedTemplate && (
              <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                <p className="text-xs font-semibold text-gray-700 mb-1">Preview:</p>
                <p className="text-xs text-gray-600 italic">{selectedTemplate.bodyText}</p>
              </div>
            )}
          </div>

          {/* Audience */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Target Audience</label>
            <select
              value={form.audienceType}
              onChange={(e) => set('audienceType', e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-wa-green/30 focus:border-wa-green"
            >
              <option value="all">All Contacts ({contacts.length})</option>
            </select>
            {contacts.length === 0 && (
              <p className="mt-1.5 text-xs text-amber-600">You have no contacts yet. Import contacts before sending a broadcast.</p>
            )}
          </div>

          {/* Scheduled At */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Schedule Send <span className="font-normal text-gray-400">(leave blank to send immediately)</span>
            </label>
            <input
              type="datetime-local"
              value={form.scheduledAt}
              onChange={(e) => set('scheduledAt', e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-wa-green/30 focus:border-wa-green"
            />
          </div>

          {/* Summary */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-3.5 space-y-1.5 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Estimated Recipients</span>
              <span className="font-bold text-gray-900">{recipientCount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Send Mode</span>
              <span className="font-semibold">{form.scheduledAt ? 'Scheduled' : 'Immediate'}</span>
            </div>
            <div className="flex justify-between">
              <span>Meta API Cost</span>
              <span className="text-gray-400">Billed by Meta per conversation</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={contacts.length === 0 || approvedTemplates.length === 0}
              className="flex-1 py-2.5 bg-wa-teal hover:bg-wa-dark text-white font-bold rounded-xl transition text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {form.scheduledAt ? 'Schedule Broadcast' : 'Send Now'}
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

export default function BroadcastPage() {
  const { campaigns, createCampaign, contacts } = useWhatsAppData();
  const { showSuccess, showError } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSave = (formData) => {
    if (contacts.length === 0) {
      showError('No Contacts', 'Import contacts before sending a broadcast.');
      return;
    }
    createCampaign(formData);
    showSuccess('Broadcast Created', `"${formData.name}" queued for delivery.`);
    setIsModalOpen(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">Broadcast Campaigns</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {campaigns.length === 0
              ? 'Send bulk WhatsApp messages using Meta-approved templates.'
              : `${campaigns.length} campaign${campaigns.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          id="create-broadcast-btn"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-wa-teal hover:bg-wa-dark text-white font-bold text-sm rounded-xl shadow-wa-green transition"
        >
          <Plus className="w-4 h-4" />
          New Campaign
        </button>
      </div>

      {campaigns.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card">
          <EmptyBroadcasts onAdd={() => setIsModalOpen(true)} />
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.map((camp) => {
            const meta = STATUS_META[camp.status] || STATUS_META.draft;
            return (
              <div key={camp.id} className="bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-md transition p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                      <SendHorizontal className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">{camp.name}</h3>
                      <p className="text-xs text-gray-400">
                        {camp.scheduledAt ? `Scheduled: ${new Date(camp.scheduledAt).toLocaleString('en-IN')}` : 'Sent immediately'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-gray-400">Recipients</p>
                      <p className="font-bold text-gray-900 text-sm">{(camp.recipientCount || 0).toLocaleString()}</p>
                    </div>
                    <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold ${meta.color}`}>
                      <meta.icon className="w-3 h-3" />
                      {meta.label}
                    </span>
                  </div>
                </div>

                {/* Stats Row */}
                {camp.status === 'sent' && (
                  <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-4 gap-4">
                    {[
                      { label: 'Sent', value: camp.sentCount || 0, color: 'text-gray-800' },
                      { label: 'Delivered', value: camp.deliveredCount || 0, color: 'text-blue-600' },
                      { label: 'Read', value: camp.readCount || 0, color: 'text-wa-teal' },
                      { label: 'Failed', value: camp.failedCount || 0, color: 'text-red-500' },
                    ].map((stat) => (
                      <div key={stat.label} className="text-center">
                        <p className={`text-lg font-extrabold tabular-nums ${stat.color}`}>{stat.value.toLocaleString()}</p>
                        <p className="text-[11px] text-gray-400">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && <BroadcastModal onClose={() => setIsModalOpen(false)} onSave={handleSave} />}
    </div>
  );
}
