import React from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  SendHorizontal,
  FileText,
  Users,
  FileSpreadsheet,
  Cpu,
  Radio,
  Settings,
  CreditCard,
  LogOut,
  ChevronRight,
  Zap,
  Building2,
  Activity,
  ShieldAlert,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWhatsAppData } from '../../context/WhatsAppDataContext';

export default function Sidebar({ currentTab, setCurrentTab, isMobileOpen = false, onCloseMobile }) {
  const { currentAccount, currentUser, isSuperAdmin, isImpersonating, logout, hasPermission } = useAuth();
  const { conversations } = useWhatsAppData();

  const totalUnreadCount = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  // Platform Admin Mode vs Customer Business Workspace
  const isPlatformAdminMode = isSuperAdmin && !isImpersonating;

  const superAdminNavItems = [
    { id: 'superadmin', label: 'Customer Organizations', icon: Building2 },
    { id: 'superadmin_settings', label: 'Platform & Meta API', icon: Settings },
    { id: 'superadmin_metrics', label: 'System Webhook Logs', icon: Radio },
  ];

  const tenantNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, module: 'dashboard' },
    {
      id: 'inbox',
      label: 'Inbox',
      icon: MessageSquare,
      badge: totalUnreadCount > 0 ? totalUnreadCount : null,
      module: 'inbox',
      subItems: [
        { id: 'inbox_all', label: 'All Conversations' },
        { id: 'inbox_chat', label: 'Live Chat' },
      ],
    },
    {
      id: 'campaigns',
      label: 'Campaigns',
      icon: SendHorizontal,
      module: 'campaigns',
      subItems: [
        { id: 'campaigns_templates', label: 'Message Templates' },
        { id: 'campaigns_broadcast', label: 'Broadcast' },
      ],
    },
    {
      id: 'contacts',
      label: 'Contacts',
      icon: Users,
      module: 'contacts',
      subItems: [
        { id: 'contacts_directory', label: 'Contact Directory' },
        { id: 'contacts_import', label: 'Import Logs' },
      ],
    },
    { id: 'automations', label: 'Automations', icon: Cpu, module: 'automations' },
    { id: 'channel', label: 'WhatsApp Channel', icon: Radio, module: 'channel' },
    { id: 'settings', label: 'Settings', icon: Settings, module: 'settings' },
    { id: 'pay', label: 'Billing', icon: CreditCard, module: 'billing' },
  ];

  const navItems = isPlatformAdminMode ? superAdminNavItems : tenantNavItems;

  const handleNavClick = (item) => {
    if (item.subItems && item.subItems.length > 0) {
      setCurrentTab(item.subItems[0].id);
    } else {
      setCurrentTab(item.id);
    }
  };

  const sidebarContent = (
    <div className="w-60 bg-[#f0f2f0] border-r border-gray-200 flex flex-col h-full select-none">
      {/* Brand Header */}
      <div className="px-4 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm ${
              isPlatformAdminMode ? 'bg-purple-700 text-white' : 'bg-wa-teal text-white'
            }`}
          >
            {isPlatformAdminMode ? <ShieldAlert className="w-5 h-5" /> : <Zap className="w-4.5 h-4.5" />}
          </div>
          <div>
            <h1 className="font-extrabold text-sm text-gray-900 leading-tight">Sheetbotics</h1>
            <p className="text-[11px] text-gray-500">
              {isPlatformAdminMode ? 'Platform Superadmin' : 'WhatsApp Management'}
            </p>
          </div>
        </div>

        {/* Mobile Close Button */}
        {onCloseMobile && (
          <button onClick={onCloseMobile} className="md:hidden p-1 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Account Pill */}
      <div
        className={`px-4 py-2.5 border-b border-gray-200 ${
          isPlatformAdminMode ? 'bg-purple-50/60' : 'bg-white/60'
        }`}
      >
        <span
          className={`text-[10px] uppercase tracking-wider font-bold block ${
            isPlatformAdminMode ? 'text-purple-700' : 'text-gray-400'
          }`}
        >
          {isPlatformAdminMode ? 'Root Administration' : 'Business Account'}
        </span>
        <span className="text-xs font-semibold text-gray-800 truncate block">
          {isPlatformAdminMode ? 'Sheetbotics Global Platform' : (currentAccount?.businessName || 'Your Business')}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          if (!isPlatformAdminMode && !hasPermission(item.module)) return null;
          const isActive =
            currentTab === item.id ||
            (item.subItems && item.subItems.some((sub) => sub.id === currentTab));

          return (
            <div key={item.id}>
              <button
                type="button"
                id={`nav-${item.id}`}
                onClick={() => handleNavClick(item)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-medium transition-all group ${
                  isActive
                    ? isPlatformAdminMode
                      ? 'bg-purple-700 text-white shadow-sm'
                      : 'bg-wa-teal text-white shadow-sm'
                    : isPlatformAdminMode
                    ? 'text-gray-700 hover:text-purple-700 hover:bg-purple-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <item.icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive
                        ? 'text-white'
                        : isPlatformAdminMode
                        ? 'text-purple-500 group-hover:text-purple-700'
                        : 'text-gray-400 group-hover:text-gray-600'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold bg-wa-green text-white rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>

              {/* Sub-items (shown when active) */}
              {item.subItems && isActive && (
                <div className="pl-9 mt-0.5 mb-1 space-y-0.5">
                  {item.subItems.map((sub) => {
                    const isSubActive = currentTab === sub.id;
                    return (
                      <button
                        key={sub.id}
                        id={`nav-${sub.id}`}
                        type="button"
                        onClick={() => setCurrentTab(sub.id)}
                        className={`w-full text-left text-[12px] px-2.5 py-1.5 rounded-lg transition flex items-center justify-between ${
                          isSubActive
                            ? 'text-wa-teal font-semibold bg-white shadow-sm'
                            : 'text-white/80 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <span>{sub.label}</span>
                        {isSubActive && <ChevronRight className="w-3 h-3" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-gray-200 bg-white/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                isPlatformAdminMode
                  ? 'bg-purple-100 text-purple-700 border-2 border-purple-200'
                  : 'bg-wa-teal/10 text-wa-teal border-2 border-wa-teal/20'
              }`}
            >
              {currentUser?.fullName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <span className="text-xs font-semibold text-gray-800 truncate block">
                {currentUser?.fullName || 'User'}
              </span>
              <span className="text-[10px] text-gray-400 capitalize block">
                {currentUser?.role || 'admin'}
              </span>
            </div>
          </div>
          <button
            id="sidebar-logout"
            onClick={logout}
            title="Sign out"
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Aside */}
      <aside className="hidden md:flex flex-col h-screen shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onCloseMobile} />
          <div className="relative z-10 animate-slide-right h-full">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
