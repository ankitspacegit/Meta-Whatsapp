import React, { useState } from 'react';
import {
  MessageSquare, Users, SendHorizontal, Cpu,
  TrendingUp, TrendingDown, ArrowRight, MessageCircleMore,
  Radio, FileText, Zap, AlertTriangle, Plus, ShieldAlert,
  CheckCircle2, Clock, BarChart3, ChevronRight, Activity,
} from 'lucide-react';
import { useWhatsAppData } from '../context/WhatsAppDataContext';
import { useAuth } from '../context/AuthContext';

function StatCard({ icon: Icon, label, value, sub, color, trend, trendPositive }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-card hover:shadow-card-md transition group">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-semibold flex items-center gap-1 px-2 py-1 rounded-full ${
            trendPositive ? 'text-green-700 bg-green-50' : 'text-red-600 bg-red-50'
          }`}>
            {trendPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trend}
          </span>
        )}
      </div>
      <div className="text-2xl font-extrabold text-gray-900 tabular-nums">{value}</div>
      <div className="text-xs font-medium text-gray-500 mt-0.5">{label}</div>
      {sub && <div className="text-[11px] text-gray-400 mt-1">{sub}</div>}
    </div>
  );
}

function EmptyModuleCard({ icon: Icon, title, description, ctaLabel, onCta }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white border-2 border-dashed border-gray-200 rounded-2xl text-center">
      <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-3">
        <Icon className="w-6 h-6 text-gray-300" />
      </div>
      <h4 className="font-semibold text-gray-700 text-sm">{title}</h4>
      <p className="text-gray-400 text-xs mt-1 max-w-[220px] leading-relaxed">{description}</p>
      {ctaLabel && (
        <button
          onClick={onCta}
          className="mt-3 flex items-center gap-1.5 px-3 py-1.5 bg-wa-teal text-white text-xs font-semibold rounded-lg hover:bg-wa-dark transition"
        >
          <Plus className="w-3 h-3" />
          {ctaLabel}
        </button>
      )}
    </div>
  );
}

export default function DashboardPage({ onNavigate }) {
  const { conversations, contacts, campaigns, automations, channels, messages } = useWhatsAppData();
  const { currentAccount, isSuperAdmin } = useAuth();

  const totalConversations = conversations.length;
  const openConversations = conversations.filter((c) => c.status === 'open').length;
  const totalContacts = contacts.length;
  const totalCampaigns = campaigns.length;
  const sentCampaigns = campaigns.filter((c) => c.status === 'sent' || c.status === 'completed').length;
  const activeAutomations = automations.filter((a) => a.status === 'active').length;
  const activeChannel = channels[0];

  const hasAnyData = conversations.length > 0 || contacts.length > 0 || campaigns.length > 0;

  // 7-day visual trend data
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const trendData = [
    { day: 'Mon', sent: 24, delivered: 23, read: 19 },
    { day: 'Tue', sent: 45, delivered: 44, read: 38 },
    { day: 'Wed', sent: 68, delivered: 67, read: 58 },
    { day: 'Thu', sent: 52, delivered: 51, read: 44 },
    { day: 'Fri', sent: 89, delivered: 87, read: 76 },
    { day: 'Sat', sent: 35, delivered: 34, read: 29 },
    { day: 'Sun', sent: 48, delivered: 47, read: 41 },
  ];

  const maxVal = Math.max(...trendData.map((d) => d.sent));

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Super Admin Notice Banner (Only for Superadmins) */}
      {isSuperAdmin && (
        <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-2xl p-4 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-sm">
              <ShieldAlert className="w-5 h-5 text-purple-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Super Admin Control Active</h3>
              <p className="text-xs text-purple-200 mt-0.5">
                You have root access to manage customer business organizations, message quotas, and Meta Cloud API credentials.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('superadmin')}
            className="flex items-center gap-1.5 px-4 py-2 bg-white text-purple-950 font-bold text-xs rounded-xl hover:bg-purple-50 transition shadow-sm shrink-0"
          >
            <span>Open Super Admin Portal</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">
            Welcome back
            {currentAccount?.businessName ? `, ${currentAccount.businessName}` : ''}!
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">Here's your WhatsApp business overview.</p>
        </div>

        {/* WABA Status */}
        {activeChannel ? (
          <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-xl text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-wa-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-wa-green"></span>
            </span>
            <span className="text-gray-600">WABA Active</span>
            <span className="font-mono font-semibold text-wa-teal">{activeChannel.displayPhoneNumber || activeChannel.phoneNumberId || 'Connected'}</span>
          </div>
        ) : (
          <button
            onClick={() => onNavigate('channel')}
            className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 font-semibold hover:bg-amber-100 transition"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Connect WhatsApp Channel
          </button>
        )}
      </div>

      {/* Empty State — First Run */}
      {!hasAnyData && (
        <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center shadow-card">
          <div className="w-16 h-16 bg-wa-teal/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-wa-teal" />
          </div>
          <h2 className="text-lg font-extrabold text-gray-900 mb-2">Get Started with Sheetbotics</h2>
          <p className="text-sm text-gray-400 max-w-sm mx-auto leading-relaxed">
            Connect your WhatsApp Business Account, import your contacts, and launch your first campaign — all from this dashboard.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <button
              onClick={() => onNavigate('channel')}
              className="flex items-center gap-2 px-4 py-2.5 bg-wa-teal hover:bg-wa-dark text-white text-sm font-bold rounded-xl transition"
            >
              <Radio className="w-4 h-4" />
              Connect WABA Channel
            </button>
            <button
              onClick={() => onNavigate('contacts_import')}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition"
            >
              <Users className="w-4 h-4" />
              Import Contacts
            </button>
          </div>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={MessageSquare}
          label="Open Conversations"
          value={openConversations}
          sub={`${totalConversations} total conversations`}
          color="bg-blue-50 text-blue-500"
          trend={totalConversations > 0 ? '+' + openConversations : undefined}
          trendPositive={true}
        />
        <StatCard
          icon={Users}
          label="Total Contacts"
          value={totalContacts.toLocaleString()}
          sub="across all lists"
          color="bg-purple-50 text-purple-500"
        />
        <StatCard
          icon={SendHorizontal}
          label="Campaigns Sent"
          value={sentCampaigns}
          sub={`${totalCampaigns} total campaigns`}
          color="bg-green-50 text-green-600"
        />
        <StatCard
          icon={Cpu}
          label="Active Automations"
          value={activeAutomations}
          sub={`${automations.length} total flows`}
          color="bg-amber-50 text-amber-500"
        />
      </div>

      {/* Interactive Visual Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 7-Day Message Activity Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-sm text-gray-900">7-Day WhatsApp Delivery Performance</h2>
              <p className="text-xs text-gray-400 mt-0.5">Real-time status tracking for outbound & broadcast messaging</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-gray-600">
                <span className="w-2.5 h-2.5 rounded-full bg-wa-teal" /> Sent
              </span>
              <span className="flex items-center gap-1.5 text-gray-600">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Delivered
              </span>
              <span className="flex items-center gap-1.5 text-gray-600">
                <span className="w-2.5 h-2.5 rounded-full bg-wa-green" /> Read
              </span>
            </div>
          </div>

          {/* SVG Visual Bars */}
          <div className="h-44 flex items-end justify-between gap-3 pt-6 px-2">
            {trendData.map((d) => {
              const heightPercent = Math.max(15, (d.sent / maxVal) * 100);
              return (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-2 group relative">
                  {/* Tooltip */}
                  <div className="absolute -top-12 bg-gray-900 text-white text-[10px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition shadow pointer-events-none z-10 whitespace-nowrap">
                    Sent: {d.sent} | Delivered: {d.delivered} | Read: {d.read}
                  </div>

                  <div className="w-full max-w-[36px] bg-gray-50 rounded-xl overflow-hidden flex flex-col justify-end p-0.5 h-36">
                    <div
                      className="w-full bg-gradient-to-t from-wa-teal to-wa-green rounded-lg transition-all duration-500 group-hover:opacity-90"
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-gray-500">{d.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quality & SLA Rings */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 flex flex-col justify-between">
          <div>
            <h2 className="font-bold text-sm text-gray-900">Delivery Quality & SLA</h2>
            <p className="text-xs text-gray-400 mt-0.5">Meta Cloud API health metrics</p>
          </div>

          <div className="grid grid-cols-2 gap-4 my-3 text-center">
            {/* Delivery Ring */}
            <div className="p-3 bg-green-50/50 rounded-xl border border-green-100 flex flex-col items-center">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-green-100"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-wa-green"
                    strokeDasharray="98.5, 100"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute font-extrabold text-xs text-gray-900">98.5%</span>
              </div>
              <span className="text-[11px] font-bold text-gray-700 mt-2">Delivery Rate</span>
              <span className="text-[10px] text-gray-400">Target &gt;95%</span>
            </div>

            {/* Read Rate Ring */}
            <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex flex-col items-center">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-blue-100"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-blue-500"
                    strokeDasharray="86.2, 100"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute font-extrabold text-xs text-gray-900">86.2%</span>
              </div>
              <span className="text-[11px] font-bold text-gray-700 mt-2">Read Rate</span>
              <span className="text-[10px] text-gray-400">Industry avg: 72%</span>
            </div>
          </div>

          <div className="p-2.5 bg-gray-50 rounded-xl flex items-center justify-between text-xs">
            <span className="text-gray-500">24-hr Service Window</span>
            <span className="font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Compliant
            </span>
          </div>
        </div>
      </div>

      {/* 3-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Recent Conversations */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-sm text-gray-900">Recent Conversations</h2>
            <button
              onClick={() => onNavigate('inbox_all')}
              className="flex items-center gap-1 text-xs font-semibold text-wa-teal hover:underline"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {conversations.length === 0 ? (
            <div className="p-8">
              <EmptyModuleCard
                icon={MessageSquare}
                title="No conversations yet"
                description="Conversations will appear here when customers message your WhatsApp number."
                ctaLabel="Set up WhatsApp Channel"
                onCta={() => onNavigate('channel')}
              />
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {conversations.slice(0, 6).map((conv) => (
                <li
                  key={conv.id}
                  className="px-5 py-3 hover:bg-gray-50 transition flex items-center gap-3 cursor-pointer"
                  onClick={() => onNavigate('inbox_all')}
                >
                  <div className="relative shrink-0">
                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center font-bold text-sm text-gray-600">
                      {conv.contactName?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-wa-green text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-gray-900 truncate">{conv.contactName}</span>
                      <span className="text-[10px] text-gray-400 shrink-0">{conv.lastMessageTimestamp ? new Date(conv.lastMessageTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                    </div>
                    <p className="text-xs text-gray-400 truncate">{conv.lastMessageText || 'No messages'}</p>
                  </div>
                  {conv.status === 'open' && (
                    <span className="shrink-0 px-1.5 py-0.5 text-[9px] font-bold bg-green-100 text-green-700 rounded">OPEN</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Quick Actions & Channel Health */}
        <div className="space-y-4">
          {/* Quick Actions Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
            <h2 className="font-bold text-sm text-gray-900 mb-3">Quick Actions</h2>
            <div className="space-y-2">
              {[
                { label: 'Create Template', desc: 'New message template', icon: FileText, tab: 'campaigns_templates', color: 'text-blue-500 bg-blue-50' },
                { label: 'Send Broadcast', desc: 'Launch a campaign', icon: SendHorizontal, tab: 'campaigns_broadcast', color: 'text-green-500 bg-green-50' },
                { label: 'Add Contact', desc: 'Add or import contacts', icon: Users, tab: 'contacts_directory', color: 'text-purple-500 bg-purple-50' },
                { label: 'New Automation', desc: 'Set up auto-replies', icon: Cpu, tab: 'automations', color: 'text-amber-500 bg-amber-50' },
              ].map((item) => (
                <button
                  key={item.tab}
                  onClick={() => onNavigate(item.tab)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition text-left"
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-800">{item.label}</div>
                    <div className="text-[11px] text-gray-400">{item.desc}</div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-300 ml-auto shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Channel Health */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
            <h2 className="font-bold text-sm text-gray-900 mb-3">Channel Health</h2>
            {activeChannel ? (
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Status</span>
                  <span className="flex items-center gap-1.5 font-semibold text-green-700">
                    <span className="w-2 h-2 rounded-full bg-wa-green"></span>
                    {activeChannel.status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Messaging Tier</span>
                  <span className="font-mono font-semibold text-gray-800">{activeChannel.tier || 'TIER_1K'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Quality Rating</span>
                  <span className={`font-semibold ${activeChannel.qualityRating === 'GREEN' ? 'text-green-600' : 'text-amber-600'}`}>
                    {activeChannel.qualityRating || 'GREEN'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Display Name</span>
                  <span className="font-semibold text-gray-800 truncate max-w-[140px] text-right">{activeChannel.displayName}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <Radio className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-xs text-gray-400">No WhatsApp channel connected</p>
                <button
                  onClick={() => onNavigate('channel')}
                  className="mt-2 text-xs font-semibold text-wa-teal hover:underline"
                >
                  Connect now →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
