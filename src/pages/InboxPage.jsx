import React, { useState, useEffect } from 'react';
import {
  Search, Send, CornerDownRight, MessageSquare,
  CheckCheck, Clock, ChevronRight, UserCircle, Radio, X,
  Paperclip, Smile, MoreVertical, Phone, RefreshCw,
} from 'lucide-react';
import { useWhatsAppData } from '../context/WhatsAppDataContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

function EmptyInbox({ onSetupChannel, onNavigate }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center h-full text-center p-10">
      <div className="w-20 h-20 rounded-full bg-wa-teal/10 flex items-center justify-center mb-5">
        <MessageSquare className="w-10 h-10 text-wa-teal/40" />
      </div>
      <h3 className="text-base font-bold text-gray-700">Your inbox is empty</h3>
      <p className="text-sm text-gray-400 mt-1.5 max-w-xs leading-relaxed">
        Conversations from your customers will appear here once your WhatsApp channel is live.
      </p>
      <button
        onClick={onSetupChannel}
        className="mt-5 flex items-center gap-2 px-4 py-2.5 bg-wa-teal text-white text-xs font-bold rounded-xl hover:bg-wa-dark transition"
      >
        <Radio className="w-4 h-4" />
        Connect WhatsApp Channel
      </button>
    </div>
  );
}

function SelectConversation() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <MessageSquare className="w-8 h-8 text-gray-300" />
      </div>
      <h3 className="text-sm font-semibold text-gray-600">Select a conversation</h3>
      <p className="text-xs text-gray-400 mt-1">Choose a conversation from the left to start messaging.</p>
    </div>
  );
}

export default function InboxPage() {
  const {
    conversations = [],
    messages = [],
    sendMessage,
    markAsRead,
    markConversationAsRead,
    assignConversation,
    assignConversationAgent,
    channels = [],
    activeConversationId,
    setActiveConversationId,
  } = useWhatsAppData();
  const { currentAccount, currentUser } = useAuth();
  const { showSuccess, showError } = useToast();

  const [selectedConvId, setSelectedConvId] = useState(
    () => activeConversationId || conversations[0]?.id || null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [replyText, setReplyText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (activeConversationId) {
      setSelectedConvId(activeConversationId);
    }
  }, [activeConversationId]);

  const activeChannel = channels[0];

  const filteredConversations = conversations.filter((c) => {
    const matchesSearch =
      searchQuery === '' ||
      c.contactName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.contactPhone?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const selectedConversation = conversations.find((c) => c.id === selectedConvId);
  const activeMessages = Array.isArray(messages)
    ? messages.filter((m) => m.conversationId === selectedConvId).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    : (messages[selectedConvId] || []).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  const handleSelectConversation = (convId) => {
    setSelectedConvId(convId);
    if (typeof setActiveConversationId === 'function') setActiveConversationId(convId);
    if (typeof markAsRead === 'function') markAsRead(convId);
    else if (typeof markConversationAsRead === 'function') markConversationAsRead(convId);
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    const text = replyText.trim();
    if (!text || !selectedConvId || !activeChannel) {
      if (!activeChannel) showError('No Channel', 'Connect a WhatsApp channel first to send messages.');
      return;
    }

    setIsSending(true);
    try {
      if (typeof sendMessage === 'function') {
        await sendMessage({ conversationId: selectedConvId, text });
      }
      setReplyText('');
    } catch (err) {
      showError('Send Failed', err.message || 'Could not send message.');
    } finally {
      setIsSending(false);
    }
  };

  const statusCounts = {
    all: conversations.length,
    open: conversations.filter((c) => c.status === 'open').length,
    resolved: conversations.filter((c) => c.status === 'resolved').length,
  };

  return (
    <div className="flex h-full overflow-hidden bg-[#f5f7f5]">
      {/* ── Conversation List Panel ── */}
      <div className="w-72 bg-white border-r border-gray-200 flex flex-col shrink-0">
        {/* Header */}
        <div className="px-4 py-3.5 border-b border-gray-100">
          <h2 className="font-bold text-sm text-gray-900">Inbox</h2>
          {/* Search */}
          <div className="mt-2.5 relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-wa-green/30 focus:border-wa-green"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                <X className="w-3 h-3 text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex border-b border-gray-100">
          {[['all', 'All', statusCounts.all], ['open', 'Open', statusCounts.open], ['resolved', 'Done', statusCounts.resolved]].map(([val, label, count]) => (
            <button
              key={val}
              onClick={() => setFilterStatus(val)}
              className={`flex-1 py-2 text-[11px] font-semibold border-b-2 transition ${
                filterStatus === val
                  ? 'border-wa-teal text-wa-teal'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {label} {count > 0 && <span className="ml-0.5">({count})</span>}
            </button>
          ))}
        </div>

        {/* Conversations */}
        <ul className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {filteredConversations.length === 0 ? (
            <li className="flex flex-col items-center justify-center p-8 text-center">
              <MessageSquare className="w-8 h-8 text-gray-200 mb-2" />
              <p className="text-xs text-gray-400">
                {searchQuery ? 'No matches found.' : 'No conversations yet.'}
              </p>
            </li>
          ) : (
            filteredConversations.map((conv) => {
              const isSelected = conv.id === selectedConvId;
              return (
                <li
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv.id)}
                  className={`px-4 py-3 cursor-pointer transition ${
                    isSelected ? 'bg-wa-teal/8 border-l-2 border-wa-teal' : 'hover:bg-gray-50 border-l-2 border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="relative shrink-0 mt-0.5">
                      <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center font-bold text-sm text-gray-600">
                        {conv.contactName?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      {conv.status === 'open' && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-wa-green rounded-full border-2 border-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-semibold truncate ${conv.unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                          {conv.contactName}
                        </span>
                        <span className="text-[10px] text-gray-400 shrink-0 ml-1">{conv.lastMessageTime}</span>
                      </div>
                      <p className={`text-[11px] truncate mt-0.5 ${conv.unreadCount > 0 ? 'font-semibold text-gray-700' : 'text-gray-400'}`}>
                        {conv.lastMessageText || '...'}
                      </p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="shrink-0 w-5 h-5 bg-wa-green text-white text-[10px] font-bold rounded-full flex items-center justify-center mt-0.5">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </div>

      {/* ── Chat Panel ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {conversations.length === 0 ? (
          <EmptyInbox onSetupChannel={() => {}} />
        ) : !selectedConversation ? (
          <SelectConversation />
        ) : (
          <>
            {/* Chat Header */}
            <div className="bg-[#128C7E] px-5 py-3 flex items-center justify-between shrink-0 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm text-white">
                  {selectedConversation.contactName?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{selectedConversation.contactName}</h3>
                  <p className="text-[11px] text-white/70 font-mono">{selectedConversation.contactPhone}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 text-[10px] font-bold rounded-md ${
                  selectedConversation.status === 'open'
                    ? 'bg-white/20 text-white'
                    : 'bg-white/10 text-white/60'
                }`}>
                  {selectedConversation.status?.toUpperCase()}
                </span>
                <button className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-2 whatsapp-chat-bg">
              {activeMessages.length === 0 ? (
                <div className="text-center py-10 text-xs text-gray-400">
                  No messages yet. Send the first message!
                </div>
              ) : (
                activeMessages.map((msg) => {
                  const isOutgoing = msg.direction === 'outbound';
                  return (
                    <div key={msg.id} className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-sm rounded-2xl px-4 py-2.5 shadow-sm ${
                          isOutgoing ? 'bubble-outgoing' : 'bubble-incoming'
                        }`}
                      >
                        <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                        <div className={`flex items-center gap-1 mt-1.5 ${isOutgoing ? 'justify-end' : 'justify-start'}`}>
                          <span className="text-[10px] text-gray-400">
                            {msg.timestamp
                              ? new Date(msg.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                              : ''}
                          </span>
                          {isOutgoing && (
                            <CheckCheck className={`w-3.5 h-3.5 ${msg.status === 'read' ? 'tick-read' : 'tick-delivered'}`} />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Reply Bar */}
            <div className="bg-[#f0f2f0] border-t border-gray-200 px-4 py-3 shrink-0">
              {!activeChannel && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-xs text-amber-700 font-medium flex items-center gap-2 mb-2">
                  <Radio className="w-3.5 h-3.5" />
                  Connect a WhatsApp channel to send messages.
                </div>
              )}
              <form onSubmit={handleSendReply} className="flex items-end gap-2">
                <button type="button" className="p-2 text-gray-400 hover:text-gray-600 transition">
                  <Smile className="w-5 h-5" />
                </button>
                <button type="button" className="p-2 text-gray-400 hover:text-gray-600 transition">
                  <Paperclip className="w-5 h-5" />
                </button>
                <textarea
                  rows={1}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendReply(e); }
                  }}
                  placeholder="Type a message..."
                  disabled={!activeChannel}
                  className="flex-1 bg-white border border-gray-200 rounded-2xl px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-wa-green resize-none leading-relaxed max-h-24"
                />
                <button
                  type="submit"
                  disabled={isSending || !replyText.trim() || !activeChannel}
                  className="p-2.5 bg-wa-teal hover:bg-wa-dark text-white rounded-full transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send className="w-4.5 h-4.5" />
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
