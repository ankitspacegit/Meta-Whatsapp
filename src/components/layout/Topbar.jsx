import React, { useState } from 'react';
import {
  Building2,
  Shield,
  Bell,
  ChevronDown,
  Radio,
  HelpCircle,
  Search,
  Menu,
  ShieldAlert,
  ArrowLeft,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWhatsAppData } from '../../context/WhatsAppDataContext';

export default function Topbar({ onNavigate, onToggleMobileMenu }) {
  const {
    currentAccount,
    currentUser,
    accounts,
    switchAccount,
    isSuperAdmin,
    isImpersonating,
    impersonationState,
    exitImpersonation,
  } = useAuth();
  const { channels, conversations } = useWhatsAppData();
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const activeChannel = channels[0];
  const totalUnread = conversations.reduce((a, c) => a + (c.unreadCount || 0), 0);

  return (
    <header className="h-14 bg-white border-b border-gray-200 px-4 sm:px-5 flex items-center justify-between shrink-0 z-20 gap-3">
      {/* Left: Mobile Toggle + Account Switcher + Impersonation Alert */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Mobile Hamburger Menu */}
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Impersonation Banner */}
        {isImpersonating ? (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-800 animate-pulse">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-semibold truncate max-w-[140px] sm:max-w-xs">
              Impersonating: {currentAccount?.businessName}
            </span>
            <button
              onClick={exitImpersonation}
              className="flex items-center gap-1 px-2 py-0.5 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold rounded-lg shadow-sm transition shrink-0"
            >
              <ArrowLeft className="w-3 h-3" />
              Exit to Superadmin
            </button>
          </div>
        ) : isSuperAdmin ? (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-800 font-bold">
            <ShieldAlert className="w-4 h-4 text-purple-600" />
            <span>Platform Root Administration</span>
          </div>
        ) : (
          /* Normal Account Switcher */
          <div className="relative">
            <button
              id="topbar-account-switcher"
              onClick={() => setShowAccountDropdown(!showAccountDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs font-semibold text-gray-700 transition"
            >
              <Building2 className="w-3.5 h-3.5 text-gray-400" />
              <span className="truncate max-w-[120px] sm:max-w-[180px]">
                {currentAccount?.businessName || 'Your Business'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>

            {showAccountDropdown && (
              <div className="absolute left-0 top-10 w-64 bg-white border border-gray-200 rounded-xl shadow-modal p-2 z-50 animate-fade-in">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Switch Account
                </div>
                {accounts.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-gray-400">No other accounts</div>
                ) : (
                  accounts.map((acc) => (
                    <button
                      key={acc.id}
                      onClick={() => {
                        switchAccount(acc.id);
                        setShowAccountDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs transition flex items-center justify-between ${
                        acc.id === currentAccount?.id
                          ? 'bg-wa-teal/10 text-wa-teal font-semibold'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="truncate pr-2">{acc.businessName}</span>
                      {acc.id === currentAccount?.id && (
                        <span className="w-2 h-2 rounded-full bg-wa-green shrink-0" />
                      )}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Active WABA Channel Indicator (Only for customer tenants or during customer impersonation) */}
        {activeChannel && (isImpersonating || !isSuperAdmin) && (
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 bg-green-50 border border-green-200 rounded-lg text-[11px]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-wa-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-wa-green"></span>
            </span>
            <span className="text-gray-600">WABA:</span>
            <span className="font-mono font-semibold text-wa-teal">{activeChannel.displayPhoneNumber || activeChannel.phoneNumberId || 'Connected'}</span>
          </div>
        )}
      </div>

      {/* Right: Superadmin Button, Role, Notifications, Help */}
      <div className="flex items-center gap-2">
        {/* Superadmin Portal Shortcut Button */}
        {isSuperAdmin && (
          <button
            onClick={() => onNavigate?.('superadmin')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-xs font-bold rounded-xl transition shadow-sm"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Super Admin Portal</span>
          </button>
        )}

        {/* Role badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-500 font-medium">
          <Shield className="w-3.5 h-3.5 text-gray-400" />
          <span className="capitalize">{currentUser?.role || 'user'}</span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            id="topbar-notifications"
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition relative"
          >
            <Bell className="w-4 h-4" />
            {totalUnread > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-11 w-72 bg-white border border-gray-200 rounded-xl shadow-modal p-3 z-50 animate-fade-in text-xs">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100 font-semibold text-gray-800">
                <span>Notifications</span>
                <span className="text-[10px] text-wa-teal">{totalUnread} unread</span>
              </div>
              {totalUnread === 0 ? (
                <p className="text-gray-400 text-center py-4">All caught up!</p>
              ) : (
                conversations
                  .filter((c) => c.unreadCount > 0)
                  .slice(0, 5)
                  .map((c) => (
                    <div key={c.id} className="py-2 border-b border-gray-50 last:border-0">
                      <p className="font-semibold text-gray-800">{c.contactName}</p>
                      <p className="text-gray-500 text-[11px] truncate">{c.lastMessageText}</p>
                    </div>
                  ))
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
