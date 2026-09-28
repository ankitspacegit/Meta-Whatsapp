import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import InboundSimulatorDrawer from './InboundSimulatorDrawer';

// Pages
import DashboardPage from '../../pages/DashboardPage';
import InboxPage from '../../pages/InboxPage';
import MessageTemplatesPage from '../../pages/MessageTemplatesPage';
import BroadcastPage from '../../pages/BroadcastPage';
import ContactDirectoryPage from '../../pages/ContactDirectoryPage';
import ImportLogsPage from '../../pages/ImportLogsPage';
import AutomationsPage from '../../pages/AutomationsPage';
import ChannelPage from '../../pages/ChannelPage';
import SettingsPage from '../../pages/SettingsPage';
import PayPage from '../../pages/PayPage';
import SuperAdminPage from '../../pages/SuperAdminPage';

export default function Layout() {
  const { isSuperAdmin, isImpersonating } = useAuth();
  const [currentTab, setCurrentTab] = useState(() => (isSuperAdmin && !isImpersonating ? 'superadmin' : 'dashboard'));
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Sync tab when superadmin status or impersonation changes
  useEffect(() => {
    if (isSuperAdmin && !isImpersonating && !currentTab.startsWith('superadmin')) {
      setCurrentTab('superadmin');
    } else if (isImpersonating && currentTab.startsWith('superadmin')) {
      setCurrentTab('dashboard');
    }
  }, [isSuperAdmin, isImpersonating]);

  const renderActivePage = () => {
    if (currentTab === 'superadmin' || currentTab.startsWith('superadmin_')) {
      const sub =
        currentTab === 'superadmin_settings'
          ? 'settings'
          : currentTab === 'superadmin_metrics'
          ? 'metrics'
          : 'customers';
      return <SuperAdminPage initialTab={sub} />;
    }

    switch (currentTab) {
      case 'dashboard':
        return <DashboardPage onNavigate={(tab) => setCurrentTab(tab)} />;
      case 'inbox':
      case 'inbox_all':
      case 'inbox_chat':
        return <InboxPage />;
      case 'campaigns':
      case 'campaigns_templates':
        return <MessageTemplatesPage />;
      case 'campaigns_broadcast':
        return <BroadcastPage />;
      case 'contacts':
      case 'contacts_directory':
        return <ContactDirectoryPage onNavigateToChat={() => setCurrentTab('inbox_all')} />;
      case 'contacts_import':
        return <ImportLogsPage />;
      case 'automations':
        return <AutomationsPage />;
      case 'channel':
        return <ChannelPage />;
      case 'settings':
        return <SettingsPage />;
      case 'pay':
        return <PayPage />;
      default:
        return isSuperAdmin && !isImpersonating ? <SuperAdminPage /> : <DashboardPage onNavigate={(tab) => setCurrentTab(tab)} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#f5f7f5] overflow-hidden font-sans">
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          setIsMobileMenuOpen(false);
        }}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        <Topbar
          onNavigate={(tab) => setCurrentTab(tab)}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />
        <main className="flex-1 overflow-y-auto bg-[#f5f7f5]">
          {renderActivePage()}
        </main>
      </div>
      <InboundSimulatorDrawer />
    </div>
  );
}
