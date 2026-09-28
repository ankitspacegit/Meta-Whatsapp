import React, { useState } from 'react';
import {
  Plus, Search, Users, X, Edit2, Trash2,
  MessageSquare, Tag, Phone, Mail, User, Filter,
} from 'lucide-react';
import { useWhatsAppData } from '../context/WhatsAppDataContext';
import { useToast } from '../context/ToastContext';

function EmptyContacts({ onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center p-8">
      <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center mb-4">
        <Users className="w-8 h-8 text-purple-300" />
      </div>
      <h3 className="font-bold text-gray-700 text-sm">No contacts yet</h3>
      <p className="text-xs text-gray-400 mt-1 max-w-xs leading-relaxed">
        Add contacts manually or use the Import Logs section to bulk-import from a CSV file.
      </p>
      <button
        onClick={onAdd}
        className="mt-4 flex items-center gap-2 px-4 py-2 bg-wa-teal text-white text-xs font-bold rounded-xl hover:bg-wa-dark transition"
      >
        <Plus className="w-3.5 h-3.5" />
        Add First Contact
      </button>
    </div>
  );
}

function ContactModal({ contact, onClose, onSave }) {
  const [form, setForm] = useState(contact || {
    name: '',
    mobileNumber: '',
    email: '',
    notes: '',
    tags: [],
    optInStatus: true,
  });
  const [tagInput, setTagInput] = useState('');

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !form.tags.includes(tag)) {
      set('tags', [...form.tags, tag]);
      setTagInput('');
    }
  };

  const removeTag = (tag) => set('tags', form.tags.filter((t) => t !== tag));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.mobileNumber) return;
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/25 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-modal w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">{contact ? 'Edit Contact' : 'Add New Contact'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Full Name *</label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="Customer name"
                className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-wa-green/30 focus:border-wa-green"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">WhatsApp Mobile Number *</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={form.mobileNumber}
                onChange={(e) => set('mobileNumber', e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-800 font-mono focus:outline-none focus:ring-2 focus:ring-wa-green/30 focus:border-wa-green"
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Include country code (E.164 format).</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email (optional)</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={form.email || ''}
                onChange={(e) => set('email', e.target.value)}
                placeholder="customer@email.com"
                className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-wa-green/30 focus:border-wa-green"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Tags</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {form.tags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                placeholder="Add a tag (e.g. vip, lead)"
                className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-wa-green/30 focus:border-wa-green"
              />
              <button type="button" onClick={addTag} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-xl transition">
                Add
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Notes</label>
            <textarea
              rows={2}
              value={form.notes || ''}
              onChange={(e) => set('notes', e.target.value)}
              placeholder="Internal notes about this contact..."
              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-wa-green/30 focus:border-wa-green resize-none"
            />
          </div>

          <div className="flex items-center gap-3 py-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <div
                onClick={() => set('optInStatus', !form.optInStatus)}
                className={`relative w-10 h-5 rounded-full transition ${form.optInStatus ? 'bg-wa-green' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.optInStatus ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
              <span className="text-xs font-medium text-gray-700">
                WhatsApp Marketing Opt-in
              </span>
            </label>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              className="flex-1 py-2.5 bg-wa-teal hover:bg-wa-dark text-white font-bold rounded-xl transition text-sm"
            >
              {contact ? 'Save Changes' : 'Add Contact'}
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

export default function ContactDirectoryPage({ onNavigateToChat }) {
  const { contacts, createContact, updateContact, deleteContact, conversations, setActiveConversationId } = useWhatsAppData();
  const { showSuccess } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);

  const allTags = [...new Set(contacts.flatMap((c) => c.tags || []))].sort();

  const filtered = contacts.filter((c) => {
    const matchSearch = searchQuery === '' ||
      c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.mobileNumber?.includes(searchQuery);
    const matchTag = !tagFilter || c.tags?.includes(tagFilter);
    return matchSearch && matchTag;
  });

  const handleSave = (formData) => {
    if (editingContact) {
      updateContact(editingContact.id, formData);
      showSuccess('Contact Updated', `${formData.name} saved.`);
    } else {
      createContact(formData);
      showSuccess('Contact Added', `${formData.name} added to directory.`);
    }
    setIsModalOpen(false);
    setEditingContact(null);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Delete contact "${name}"?`)) {
      deleteContact(id);
      showSuccess('Deleted', `${name} removed.`);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">Contact Directory</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {contacts.length === 0
              ? 'Add your first customer contact.'
              : `${contacts.length.toLocaleString()} contact${contacts.length !== 1 ? 's' : ''} · ${contacts.filter((c) => c.optInStatus).length} opted in`}
          </p>
        </div>
        <button
          id="add-contact-btn"
          onClick={() => { setEditingContact(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-wa-teal hover:bg-wa-dark text-white font-bold text-sm rounded-xl shadow-wa-green transition"
        >
          <Plus className="w-4 h-4" />
          Add Contact
        </button>
      </div>

      {contacts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card">
          <EmptyContacts onAdd={() => { setEditingContact(null); setIsModalOpen(true); }} />
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or phone..."
                className="bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-wa-green/30 focus:border-wa-green w-64"
              />
            </div>
            {allTags.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setTagFilter('')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    !tagFilter ? 'bg-wa-teal text-white' : 'bg-white border border-gray-200 text-gray-600'
                  }`}
                >
                  All
                </button>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setTagFilter(tag === tagFilter ? '' : tag)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                      tagFilter === tag ? 'bg-wa-teal text-white' : 'bg-white border border-gray-200 text-gray-600'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Contact</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Phone</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider hidden md:table-cell">Tags</th>
                  <th className="text-center px-5 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Opt-In</th>
                  <th className="text-right px-5 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-sm text-gray-400">
                      No contacts match your search.
                    </td>
                  </tr>
                ) : (
                  filtered.map((contact) => (
                    <tr key={contact.id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-xs text-gray-600 shrink-0">
                            {contact.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div>
                            <span className="font-semibold text-gray-900">{contact.name}</span>
                            {contact.email && <span className="text-[11px] text-gray-400 block">{contact.email}</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 font-mono text-xs text-gray-600">{contact.mobileNumber}</td>
                      <td className="px-5 py-3 hidden md:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {contact.tags?.map((tag) => (
                            <span key={tag} className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-[10px] rounded-md">#{tag}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className={`text-[11px] font-bold ${contact.optInStatus ? 'text-green-600' : 'text-gray-400'}`}>
                          {contact.optInStatus ? '✓ Yes' : '✗ No'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              const conv = conversations?.find((c) => c.contactId === contact.id);
                              if (conv && setActiveConversationId) {
                                setActiveConversationId(conv.id);
                              }
                              onNavigateToChat?.();
                            }}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-wa-teal hover:bg-wa-teal/10 transition"
                            title="Message"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => { setEditingContact(contact); setIsModalOpen(true); }}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(contact.id, contact.name)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {isModalOpen && (
        <ContactModal
          contact={editingContact}
          onClose={() => { setIsModalOpen(false); setEditingContact(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
