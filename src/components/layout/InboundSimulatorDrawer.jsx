import React, { useState } from 'react';
import {
  Sparkles, Send, X, Bot, Zap, ArrowRight, MessageSquare,
} from 'lucide-react';
import { useWhatsAppData } from '../../context/WhatsAppDataContext';
import { useAuth } from '../../context/AuthContext';

export default function InboundSimulatorDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const { contacts, simulateInboundMessage, automations } = useWhatsAppData();
  const { currentAccount, isSuperAdmin, isImpersonating } = useAuth();

  if (isSuperAdmin && !isImpersonating) {
    return null;
  }

  const [selectedContactId, setSelectedContactId] = useState('custom');
  const [customName, setCustomName] = useState('');
  const [customPhone, setCustomPhone] = useState('');
  const [messageText, setMessageText] = useState('');

  const presetMessages = [
    { label: 'Keyword Trigger: PRICE', text: 'Hi! I would like to know your pricing.' },
    { label: 'Keyword Trigger: URGENT', text: 'URGENT: I need help with my order immediately!' },
    { label: 'General Inquiry', text: 'Hello, can you tell me more about your services?' },
    { label: 'Support Request', text: 'I am having trouble with my account.' },
  ];

  const handleSend = (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    if (selectedContactId === 'custom') {
      if (!customPhone.trim()) return;
      simulateInboundMessage({ contactName: customName || 'New Customer', phone: customPhone, messageText: messageText.trim() });
    } else {
      const contact = contacts.find((c) => c.id === selectedContactId);
      simulateInboundMessage({ contactId: contact?.id, contactName: contact?.name, phone: contact?.mobileNumber, messageText: messageText.trim() });
    }
    setMessageText('');
  };

  return (
    <>
      {/* Floating Button */}
      <button
        id="inbound-simulator-btn"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-40 flex items-center gap-2 px-4 py-2.5 bg-wa-teal hover:bg-wa-dark text-white font-semibold text-xs rounded-full shadow-lg transition-all transform hover:scale-105 active:scale-95"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-wa-green opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-wa-green"></span>
        </span>
        <Zap className="w-3.5 h-3.5" />
        <span>Webhook Simulator</span>
      </button>

      {/* Slide-Over Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/25 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="fixed inset-y-0 left-0 max-w-md w-full bg-white border-r border-gray-200 shadow-modal flex flex-col z-50 animate-slide-up">
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-wa-teal/10 border border-wa-teal/20 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-wa-teal" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Inbound Webhook Simulator</h3>
                  <p className="text-[11px] text-gray-400">Simulate customer WhatsApp messages & test automations</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSend} className="p-5 flex-1 overflow-y-auto space-y-5 text-sm">
              {/* Tenant Info */}
              <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-xs text-gray-600 flex items-center justify-between">
                <span>Account: <strong className="text-wa-teal">{currentAccount?.businessName || 'Your Business'}</strong></span>
                <span className="px-2 py-0.5 bg-white border border-green-200 text-green-700 font-mono rounded text-[10px]">
                  Meta v20.0
                </span>
              </div>

              {/* Sender Selection */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  1. Sender / Customer
                </label>
                <select
                  value={selectedContactId}
                  onChange={(e) => setSelectedContactId(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-wa-green/30 focus:border-wa-green"
                >
                  <option value="custom">➕ Custom / New Customer</option>
                  {contacts.length > 0 && (
                    <optgroup label="Existing Contacts">
                      {contacts.map((c) => (
                        <option key={c.id} value={c.id}>{c.name} ({c.mobileNumber})</option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>

              {/* Custom fields */}
              {selectedContactId === 'custom' && (
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-200 animate-fade-in">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Customer Name</label>
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Mobile (E.164)</label>
                    <input
                      type="text"
                      value={customPhone}
                      onChange={(e) => setCustomPhone(e.target.value)}
                      placeholder="+919876543210"
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-mono text-gray-800"
                      required={selectedContactId === 'custom'}
                    />
                  </div>
                </div>
              )}

              {/* Presets */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  2. Quick Preset Triggers
                </label>
                <div className="space-y-2">
                  {presetMessages.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setMessageText(p.text)}
                      className="w-full text-left p-3 rounded-xl bg-gray-50 hover:bg-green-50 border border-gray-200 hover:border-wa-green/30 text-xs transition flex items-center justify-between group"
                    >
                      <div>
                        <span className="font-semibold text-wa-teal block">{p.label}</span>
                        <span className="text-gray-400 line-clamp-1 text-[11px] mt-0.5">{p.text}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-wa-teal shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Input */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  3. Message Content
                </label>
                <textarea
                  rows={4}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type the simulated incoming WhatsApp message..."
                  className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-wa-green/30 focus:border-wa-green resize-none"
                />
              </div>

              {/* Active Automations Info */}
              {automations.filter((a) => a.status === 'active').length > 0 && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-gray-600">
                  <span className="font-semibold text-gray-800 flex items-center gap-1.5 mb-1">
                    <Bot className="w-3.5 h-3.5 text-amber-500" />
                    {automations.filter((a) => a.status === 'active').length} Active Automation Rules
                  </span>
                  <p className="text-[11px] text-gray-500">
                    Keyword triggers like "PRICE" or "URGENT" will fire automated responses instantly.
                  </p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-3 px-4 bg-wa-teal hover:bg-wa-dark text-white font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Simulate Inbound Message</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
