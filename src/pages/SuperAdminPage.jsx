import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Building2,
  Users,
  Settings,
  CreditCard,
  Radio,
  Plus,
  Search,
  CheckCircle,
  AlertTriangle,
  X,
  Edit2,
  Trash2,
  LogIn,
  Key,
  Globe,
  Sliders,
  RefreshCw,
  Server,
  Activity,
  Copy,
  Lock,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function SuperAdminPage({ initialTab = 'customers' }) {
  const {
    customerAccounts,
    users,
    impersonateAccount,
    createCustomerAccount,
    updateCustomerAccount,
    deleteCustomerAccount,
    platformSettings,
    updatePlatformSettings,
  } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();

  const [activeTab, setActiveTab] = useState(initialTab); // 'customers' | 'settings' | 'metrics'

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);

  // New Customer Form State
  const [newCustomer, setNewCustomer] = useState({
    businessName: '',
    ownerName: '',
    ownerEmail: '',
    ownerMobile: '',
    ownerPassword: 'password123',
    plan: 'growth',
    monthlyMessageLimit: 25000,
    contactLimit: 25000,
  });

  // Settings Form State
  const [settingsForm, setSettingsForm] = useState(platformSettings);
  const [testingMeta, setTestingMeta] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const [webhookLogs, setWebhookLogs] = useState([]);
  const [backendHealth, setBackendHealth] = useState({ status: 'checking', uptime: 0 });

  // Check Backend Server Status
  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((data) => setBackendHealth({ status: 'online', uptime: data.uptimeSeconds }))
      .catch(() => setBackendHealth({ status: 'offline', uptime: 0 }));

    fetch('/api/admin/webhook-logs')
      .then((r) => r.json())
      .then((data) => {
        if (data.logs) setWebhookLogs(data.logs);
      })
      .catch(() => {});
  }, [activeTab]);

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(key);
      showSuccess('Copied', 'Copied to clipboard');
      setTimeout(() => setCopiedKey(null), 2000);
    });
  };

  // Filtered Customers
  const filteredCustomers = customerAccounts.filter((acc) => {
    const matchSearch =
      searchQuery === '' ||
      acc.businessName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.id?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchPlan = planFilter === 'all' || acc.plan === planFilter;
    const matchStatus = statusFilter === 'all' || acc.status === statusFilter;
    return matchSearch && matchPlan && matchStatus;
  });

  // Calculate MRR
  const planPrices = { starter: 29, growth: 79, enterprise: 199 };
  const totalMRR = customerAccounts.reduce((acc, c) => acc + (planPrices[c.plan] || 29), 0);

  // Handle Add Customer
  const handleCreateCustomerSubmit = (e) => {
    e.preventDefault();
    if (!newCustomer.businessName || !newCustomer.ownerName || !newCustomer.ownerEmail) {
      showError('Validation Error', 'Business name, owner name, and email are required.');
      return;
    }
    const res = createCustomerAccount(newCustomer);
    if (res.success) {
      showSuccess('Customer Created', `Organization "${newCustomer.businessName}" created successfully.`);
      setIsAddCustomerOpen(false);
      setNewCustomer({
        businessName: '',
        ownerName: '',
        ownerEmail: '',
        ownerMobile: '',
        ownerPassword: 'password123',
        plan: 'growth',
        monthlyMessageLimit: 25000,
        contactLimit: 25000,
      });
    } else {
      showError('Creation Failed', res.error || 'Could not create customer.');
    }
  };

  // Handle Update Quota/Plan
  const handleUpdateAccountSubmit = (e) => {
    e.preventDefault();
    if (!editingAccount) return;
    updateCustomerAccount(editingAccount.id, {
      plan: editingAccount.plan,
      monthlyMessageLimit: Number(editingAccount.monthlyMessageLimit),
      contactLimit: Number(editingAccount.contactLimit),
      status: editingAccount.status,
    });
    showSuccess('Customer Updated', `Settings saved for ${editingAccount.businessName}`);
    setEditingAccount(null);
  };

  // Toggle Customer Status
  const handleToggleCustomerStatus = (acc) => {
    const nextStatus = acc.status === 'active' ? 'suspended' : 'active';
    updateCustomerAccount(acc.id, { status: nextStatus });
    showInfo('Status Changed', `${acc.businessName} is now ${nextStatus}.`);
  };

  // Impersonate
  const handleImpersonate = (acc) => {
    const res = impersonateAccount(acc.id);
    if (res.success) {
      showSuccess('Impersonating Workspace', `Switched into ${acc.businessName}. You can return anytime.`);
    } else {
      showError('Failed', res.error);
    }
  };

  // Save Settings
  const handleSaveSettings = (e) => {
    e.preventDefault();
    updatePlatformSettings(settingsForm);
    showSuccess('Settings Saved', 'Platform settings and Meta API configuration saved.');
  };

  // Test Meta API Handshake
  const handleTestMetaHandshake = async () => {
    setTestingMeta(true);
    try {
      const res = await fetch('/api/admin/test-meta-handshake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appId: settingsForm.metaAppId,
          appSecret: settingsForm.metaAppSecret,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showSuccess('Handshake Verified', data.message);
      } else {
        showError('Handshake Failed', data.message);
      }
    } catch (err) {
      showError('Network Error', 'Backend server could not be reached.');
    } finally {
      setTestingMeta(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-extrabold text-gray-900">Platform Super Admin</h1>
            <span className="px-2 py-0.5 bg-purple-50 text-purple-700 text-xs font-bold rounded-md border border-purple-200">
              Root Level
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Manage customer business organizations, adjust message quotas, and configure platform settings.
          </p>
        </div>

        {/* Status Indicator & Add Customer */}
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${
              backendHealth.status === 'online'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-red-50 text-red-700 border-red-200'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                backendHealth.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
              }`}
            />
            {backendHealth.status === 'online' ? 'Backend API Active (:5000)' : 'Backend API Offline'}
          </div>

          <button
            onClick={() => setIsAddCustomerOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-wa-teal hover:bg-wa-dark text-white text-xs font-bold rounded-xl transition shadow-wa-green"
          >
            <Plus className="w-4 h-4" />
            New Customer
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-3">
        <button
          onClick={() => setActiveTab('customers')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'customers'
              ? 'bg-wa-teal text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Customer Organizations ({customerAccounts.length})
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'settings'
              ? 'bg-wa-teal text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Settings className="w-4 h-4" />
          Global Platform & Meta API Settings
        </button>

        <button
          onClick={() => setActiveTab('metrics')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'metrics'
              ? 'bg-wa-teal text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Activity className="w-4 h-4" />
          System Health & Webhook Stream
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: CUSTOMERS / TENANTS MANAGEMENT */}
      {/* ======================================================== */}
      {activeTab === 'customers' && (
        <div className="space-y-5">
          {/* Quick Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-card">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Customers</span>
              <p className="text-2xl font-extrabold text-gray-900 mt-1">{customerAccounts.length}</p>
              <span className="text-[11px] text-gray-500 mt-1 block">Active SaaS Business Accounts</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-card">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Monthly Recurring Rev</span>
              <p className="text-2xl font-extrabold text-wa-teal mt-1">${totalMRR.toLocaleString()}/mo</p>
              <span className="text-[11px] text-gray-500 mt-1 block">Calculated from active plans</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-card">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Active Status</span>
              <p className="text-2xl font-extrabold text-emerald-600 mt-1">
                {customerAccounts.filter((c) => c.status === 'active').length}
              </p>
              <span className="text-[11px] text-gray-500 mt-1 block">Operational without restrictions</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-card">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Suspended</span>
              <p className="text-2xl font-extrabold text-red-500 mt-1">
                {customerAccounts.filter((c) => c.status === 'suspended').length}
              </p>
              <span className="text-[11px] text-gray-500 mt-1 block">Access revoked</span>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3.5 rounded-2xl border border-gray-100 shadow-card">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search business name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 rounded-xl text-xs border border-gray-200 focus:outline-none focus:ring-1 focus:ring-wa-teal text-gray-800"
              />
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                className="px-3 py-2 bg-gray-50 rounded-xl text-xs border border-gray-200 text-gray-700 focus:outline-none"
              >
                <option value="all">All Plans</option>
                <option value="starter">Starter</option>
                <option value="growth">Growth</option>
                <option value="enterprise">Enterprise</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-gray-50 rounded-xl text-xs border border-gray-200 text-gray-700 focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          {/* Customer Organizations Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
            {filteredCustomers.length === 0 ? (
              <div className="p-12 text-center">
                <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-gray-700">No customer accounts registered</h3>
                <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                  When customers sign up on the public registration page or when you create enterprise deals, they will appear here.
                </p>
                <button
                  onClick={() => setIsAddCustomerOpen(true)}
                  className="mt-4 px-4 py-2 bg-wa-teal text-white text-xs font-bold rounded-xl hover:bg-wa-dark transition"
                >
                  Create First Customer
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#f0f2f0] text-gray-500 uppercase tracking-wider text-[10px] font-bold border-b border-gray-100">
                    <tr>
                      <th className="px-5 py-3.5">Business & Account ID</th>
                      <th className="px-5 py-3.5">Owner / Contact</th>
                      <th className="px-5 py-3.5">Plan Tier</th>
                      <th className="px-5 py-3.5">Monthly Message Quota</th>
                      <th className="px-5 py-3.5">Contact Limit</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Superadmin Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredCustomers.map((acc) => {
                      const ownerUser = users.find((u) => u.accountId === acc.id && u.role === 'owner');
                      const planBadgeColor =
                        acc.plan === 'enterprise'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : acc.plan === 'growth'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200';

                      return (
                        <tr key={acc.id} className="hover:bg-gray-50/50 transition">
                          <td className="px-5 py-3.5">
                            <div className="font-bold text-gray-900 text-sm">{acc.businessName}</div>
                            <span className="font-mono text-[10px] text-gray-400">{acc.id}</span>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="text-gray-800 font-medium">{ownerUser?.fullName || 'Not registered'}</div>
                            <div className="text-gray-400 text-[11px]">{ownerUser?.email || '—'}</div>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`px-2 py-0.5 rounded-md font-bold uppercase text-[10px] border ${planBadgeColor}`}>
                              {acc.plan}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="text-gray-800 font-semibold">
                              {(acc.messagesUsedThisMonth || 0).toLocaleString()} / {(acc.monthlyMessageLimit || 5000).toLocaleString()}
                            </div>
                            <div className="w-28 bg-gray-100 h-1.5 rounded-full mt-1 overflow-hidden">
                              <div
                                className="bg-wa-teal h-full rounded-full"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    ((acc.messagesUsedThisMonth || 0) / (acc.monthlyMessageLimit || 5000)) * 100
                                  )}%`,
                                }}
                              />
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-gray-700">
                            {(acc.contactLimit || 5000).toLocaleString()}
                          </td>
                          <td className="px-5 py-3.5">
                            <span
                              className={`px-2 py-0.5 rounded-full font-bold text-[10px] flex items-center gap-1 w-fit ${
                                acc.status === 'active'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-red-50 text-red-700'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  acc.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'
                                }`}
                              />
                              {acc.status === 'active' ? 'Active' : 'Suspended'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Impersonate */}
                              <button
                                onClick={() => handleImpersonate(acc)}
                                title="Login as Customer (Impersonate)"
                                className="p-1.5 rounded-lg bg-wa-teal/10 hover:bg-wa-teal text-wa-teal hover:text-white transition"
                              >
                                <LogIn className="w-3.5 h-3.5" />
                              </button>

                              {/* Edit Quotas */}
                              <button
                                onClick={() => setEditingAccount(acc)}
                                title="Adjust Quotas & Plan"
                                className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
                              >
                                <Sliders className="w-3.5 h-3.5" />
                              </button>

                              {/* Toggle Status */}
                              <button
                                onClick={() => handleToggleCustomerStatus(acc)}
                                title={acc.status === 'active' ? 'Suspend Account' : 'Reactivate Account'}
                                className={`p-1.5 rounded-lg transition ${
                                  acc.status === 'active'
                                    ? 'bg-amber-50 hover:bg-amber-100 text-amber-700'
                                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                                }`}
                              >
                                {acc.status === 'active' ? (
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                ) : (
                                  <CheckCircle className="w-3.5 h-3.5" />
                                )}
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => {
                                  if (window.confirm(`Permanently delete "${acc.businessName}"? This cannot be undone.`)) {
                                    deleteCustomerAccount(acc.id);
                                    showInfo('Deleted', `Customer ${acc.businessName} deleted.`);
                                  }
                                }}
                                title="Delete Customer"
                                className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: GLOBAL PLATFORM & META API SETTINGS */}
      {/* ======================================================== */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* Meta WhatsApp Cloud API Global Credentials */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-wa-teal" />
                <h3 className="font-bold text-gray-900 text-sm">Official Meta Cloud API Global App Settings</h3>
              </div>
              <button
                type="button"
                onClick={handleTestMetaHandshake}
                disabled={testingMeta}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-wa-teal/10 hover:bg-wa-teal text-wa-teal hover:text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testingMeta ? 'animate-spin' : ''}`} />
                {testingMeta ? 'Verifying with Meta...' : 'Test Meta Graph API Handshake'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Meta App ID</label>
                <input
                  type="text"
                  value={settingsForm.metaAppId}
                  onChange={(e) => setSettingsForm({ ...settingsForm, metaAppId: e.target.value })}
                  placeholder="e.g. 109283746501928"
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 font-mono text-gray-800 focus:outline-none focus:ring-1 focus:ring-wa-teal"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Meta App Secret</label>
                <div className="relative">
                  <input
                    type="password"
                    value={settingsForm.metaAppSecret}
                    onChange={(e) => setSettingsForm({ ...settingsForm, metaAppSecret: e.target.value })}
                    placeholder="••••••••••••••••••••••••••••••••"
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 font-mono text-gray-800 focus:outline-none focus:ring-1 focus:ring-wa-teal"
                  />
                  <Lock className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">System Webhook Callback URL</label>
                <div className="relative">
                  <input
                    type="text"
                    value={settingsForm.systemWebhookUrl}
                    onChange={(e) => setSettingsForm({ ...settingsForm, systemWebhookUrl: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-3 pr-10 py-2 font-mono text-gray-800 text-xs focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(settingsForm.systemWebhookUrl, 'webhookUrl')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-wa-teal"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Provide this URL in Meta Developer Dashboard &gt; WhatsApp &gt; Configuration &gt; Webhook.</p>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">System Webhook Verification Token</label>
                <div className="relative">
                  <input
                    type="text"
                    value={settingsForm.systemWebhookVerifyToken}
                    onChange={(e) => setSettingsForm({ ...settingsForm, systemWebhookVerifyToken: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-3 pr-10 py-2 font-mono text-gray-800 text-xs focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(settingsForm.systemWebhookVerifyToken, 'verifyToken')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-wa-teal"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Enter this exact token in Meta Developer Portal for verification handshake.</p>
              </div>
            </div>
          </div>

          {/* Payment Gateway Configuration */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-card space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <CreditCard className="w-5 h-5 text-wa-teal" />
              <h3 className="font-bold text-gray-900 text-sm">Payment Gateway (Razorpay / Stripe)</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Gateway Provider</label>
                <select
                  value={settingsForm.paymentGateway?.provider || 'razorpay'}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      paymentGateway: { ...settingsForm.paymentGateway, provider: e.target.value },
                    })
                  }
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none"
                >
                  <option value="razorpay">Razorpay (India & Global)</option>
                  <option value="stripe">Stripe (Global USD/EUR)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Key ID / Publishable Key</label>
                <input
                  type="text"
                  value={settingsForm.paymentGateway?.keyId || ''}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      paymentGateway: { ...settingsForm.paymentGateway, keyId: e.target.value },
                    })
                  }
                  placeholder="rzp_live_••••••••••••"
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 font-mono text-gray-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Key Secret</label>
                <input
                  type="password"
                  value={settingsForm.paymentGateway?.keySecret || ''}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      paymentGateway: { ...settingsForm.paymentGateway, keySecret: e.target.value },
                    })
                  }
                  placeholder="••••••••••••••••••••••••"
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 font-mono text-gray-800 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Maintenance Mode & Save */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-card flex items-center justify-between">
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Platform Maintenance Mode</h4>
              <p className="text-xs text-gray-400 mt-0.5">
                When enabled, tenants will see a scheduled maintenance notice while you perform upgrades.
              </p>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <div
                onClick={() =>
                  setSettingsForm({ ...settingsForm, maintenanceMode: !settingsForm.maintenanceMode })
                }
                className={`relative w-12 h-6 rounded-full transition ${
                  settingsForm.maintenanceMode ? 'bg-amber-500' : 'bg-gray-200'
                }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    settingsForm.maintenanceMode ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </div>
              <span className="text-xs font-bold text-gray-700">
                {settingsForm.maintenanceMode ? 'Active (Maintenance ON)' : 'OFF (Normal Live)'}
              </span>
            </label>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-wa-teal hover:bg-wa-dark text-white font-bold text-xs rounded-xl shadow-wa-green transition"
            >
              Save Platform Configuration
            </button>
          </div>
        </form>
      )}

      {/* ======================================================== */}
      {/* TAB 3: SYSTEM METRICS & WEBHOOK STREAM */}
      {/* ======================================================== */}
      {activeTab === 'metrics' && (
        <div className="space-y-6">
          {/* Real-time Health Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-card flex items-start gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <Server className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Node Backend Server</span>
                <p className="text-xl font-extrabold text-gray-900 mt-1">Port 5000 Active</p>
                <span className="text-xs text-emerald-600 font-semibold mt-1 block">
                  Uptime: {Math.floor(backendHealth.uptime / 60)}m {backendHealth.uptime % 60}s
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-card flex items-start gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Meta Graph API</span>
                <p className="text-xl font-extrabold text-gray-900 mt-1">v20.0 (Cloud)</p>
                <span className="text-xs text-blue-600 font-semibold mt-1 block">Response Latency: ~124ms</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-card flex items-start gap-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Inbound Webhooks Processed</span>
                <p className="text-xl font-extrabold text-gray-900 mt-1">{webhookLogs.length} Packets</p>
                <span className="text-xs text-purple-600 font-semibold mt-1 block">Live Buffer Active</span>
              </div>
            </div>
          </div>

          {/* Live Inbound Webhook Packet Stream */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <h3 className="font-bold text-gray-900 text-sm">Live Meta Webhook Ingestion Terminal</h3>
              </div>
              <span className="text-xs text-gray-400 font-mono">Listening on /webhook/whatsapp</span>
            </div>

            <div className="p-4 bg-gray-900 text-emerald-400 font-mono text-xs max-h-96 overflow-y-auto space-y-2">
              {webhookLogs.length === 0 ? (
                <div className="text-gray-500 italic py-6 text-center">
                  Terminal ready. Awaiting inbound Meta WhatsApp webhook events...
                  <br />
                  <span className="text-[11px] text-gray-600 mt-1 block">
                    (Use Inbound Simulator or curl POST to /webhook/whatsapp to test)
                  </span>
                </div>
              ) : (
                webhookLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-gray-800/80 rounded-xl border border-gray-700/50 space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-gray-400">
                      <span className="text-wa-green font-bold">EVENT ID: {log.id}</span>
                      <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <pre className="text-[11px] text-emerald-300 overflow-x-auto whitespace-pre-wrap">
                      {JSON.stringify(log.payload, null, 2)}
                    </pre>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CREATE NEW ENTERPRISE CUSTOMER */}
      {/* ======================================================== */}
      {isAddCustomerOpen && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-modal w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-sm">Create New Customer Business</h3>
              <button onClick={() => setIsAddCustomerOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomerSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Company / Business Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Health Technologies"
                  value={newCustomer.businessName}
                  onChange={(e) => setNewCustomer({ ...newCustomer, businessName: e.target.value })}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:ring-1 focus:ring-wa-teal"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Primary Owner Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={newCustomer.ownerName}
                    onChange={(e) => setNewCustomer({ ...newCustomer, ownerName: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Owner Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="rahul@apex.com"
                    value={newCustomer.ownerEmail}
                    onChange={(e) => setNewCustomer({ ...newCustomer, ownerEmail: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Owner Mobile</label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={newCustomer.ownerMobile}
                    onChange={(e) => setNewCustomer({ ...newCustomer, ownerMobile: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Initial Password</label>
                  <input
                    type="text"
                    value={newCustomer.ownerPassword}
                    onChange={(e) => setNewCustomer({ ...newCustomer, ownerPassword: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Plan Tier</label>
                  <select
                    value={newCustomer.plan}
                    onChange={(e) => setNewCustomer({ ...newCustomer, plan: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none"
                  >
                    <option value="starter">Starter ($29)</option>
                    <option value="growth">Growth ($79)</option>
                    <option value="enterprise">Enterprise ($199)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Message Quota/mo</label>
                  <input
                    type="number"
                    value={newCustomer.monthlyMessageLimit}
                    onChange={(e) => setNewCustomer({ ...newCustomer, monthlyMessageLimit: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Contact Limit</label>
                  <input
                    type="number"
                    value={newCustomer.contactLimit}
                    onChange={(e) => setNewCustomer({ ...newCustomer, contactLimit: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-wa-teal hover:bg-wa-dark text-white font-bold rounded-xl transition text-xs shadow-wa-green"
                >
                  Create & Activate Customer
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddCustomerOpen(false)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADJUST CUSTOMER QUOTAS & PLAN */}
      {/* ======================================================== */}
      {editingAccount && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-modal w-full max-w-md animate-fade-in">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-sm">
                Adjust Limits: {editingAccount.businessName}
              </h3>
              <button onClick={() => setEditingAccount(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateAccountSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Plan Tier</label>
                <select
                  value={editingAccount.plan}
                  onChange={(e) => setEditingAccount({ ...editingAccount, plan: e.target.value })}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none"
                >
                  <option value="starter">Starter</option>
                  <option value="growth">Growth</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Monthly Message Limit</label>
                <input
                  type="number"
                  value={editingAccount.monthlyMessageLimit}
                  onChange={(e) =>
                    setEditingAccount({ ...editingAccount, monthlyMessageLimit: e.target.value })
                  }
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Contact Limit</label>
                <input
                  type="number"
                  value={editingAccount.contactLimit}
                  onChange={(e) =>
                    setEditingAccount({ ...editingAccount, contactLimit: e.target.value })
                  }
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Account Status</label>
                <select
                  value={editingAccount.status}
                  onChange={(e) => setEditingAccount({ ...editingAccount, status: e.target.value })}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none"
                >
                  <option value="active">Active (Full Access)</option>
                  <option value="suspended">Suspended (Restricted)</option>
                </select>
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-wa-teal hover:bg-wa-dark text-white font-bold rounded-xl transition text-xs shadow-wa-green"
                >
                  Save Quotas
                </button>
                <button
                  type="button"
                  onClick={() => setEditingAccount(null)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
