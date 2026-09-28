import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { initialAccounts, initialUsers } from '../data/mockSeedData';

const AuthContext = createContext(null);

export const DEFAULT_SUPERADMIN = {
  id: 'usr_superadmin',
  accountId: 'acc_platform_admin',
  fullName: 'Platform Superadmin',
  email: 'admin@sheetbotics.com',
  mobileNumber: '+919999999999',
  password: 'admin123',
  role: 'superadmin',
  status: 'active',
  createdAt: '2026-01-01T00:00:00.000Z',
};

export const DEFAULT_PLATFORM_ACCOUNT = {
  id: 'acc_platform_admin',
  businessName: 'Sheetbotics HQ (Platform)',
  plan: 'enterprise',
  status: 'active',
  createdAt: '2026-01-01T00:00:00.000Z',
  monthlyMessageLimit: 10000000,
  messagesUsedThisMonth: 0,
  contactLimit: 1000000,
};

export function AuthProvider({ children }) {
  const [accounts, setAccounts] = useState(() => {
    const saved = localStorage.getItem('sheetbotics_accounts');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!parsed.some((a) => a.id === 'acc_platform_admin')) {
        parsed.unshift(DEFAULT_PLATFORM_ACCOUNT);
      }
      return parsed;
    }
    return [DEFAULT_PLATFORM_ACCOUNT];
  });

  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('sheetbotics_users');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!parsed.some((u) => u.id === 'usr_superadmin')) {
        parsed.unshift(DEFAULT_SUPERADMIN);
      }
      return parsed;
    }
    return [DEFAULT_SUPERADMIN];
  });

  const [currentAccountId, setCurrentAccountId] = useState(() => {
    return localStorage.getItem('sheetbotics_current_account_id') || null;
  });

  const [currentUserId, setCurrentUserId] = useState(() => {
    return localStorage.getItem('sheetbotics_current_user_id') || null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('sheetbotics_auth') === 'true';
  });

  // Superadmin Impersonation State
  const [impersonationState, setImpersonationState] = useState(() => {
    const saved = localStorage.getItem('sheetbotics_impersonation');
    return saved ? JSON.parse(saved) : null;
  });

  // Global Platform Settings
  const [platformSettings, setPlatformSettings] = useState(() => {
    const saved = localStorage.getItem('sheetbotics_platform_settings');
    return saved ? JSON.parse(saved) : {
      metaAppId: '109283746501928',
      metaAppSecret: '••••••••••••••••••••••••••••••••',
      metaGraphVersion: 'v20.0',
      systemWebhookUrl: 'https://api.sheetbotics.app/webhook/whatsapp',
      systemWebhookVerifyToken: 'sheetbotics_live_token_2026',
      paymentGateway: {
        provider: 'razorpay',
        keyId: 'rzp_live_••••••••••••',
        keySecret: '••••••••••••••••••••••••',
        webhookSecret: '••••••••••••••••',
      },
      smtp: {
        senderEmail: 'noreply@sheetbotics.app',
        host: 'smtp.sendgrid.net',
        port: 587,
        secure: true,
      },
      maintenanceMode: false,
    };
  });

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('sheetbotics_accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem('sheetbotics_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentAccountId) localStorage.setItem('sheetbotics_current_account_id', currentAccountId);
  }, [currentAccountId]);

  useEffect(() => {
    if (currentUserId) localStorage.setItem('sheetbotics_current_user_id', currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem('sheetbotics_auth', String(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('sheetbotics_platform_settings', JSON.stringify(platformSettings));
  }, [platformSettings]);

  const currentAccount = accounts.find((a) => a.id === currentAccountId) || null;
  const currentUser = users.find((u) => u.id === currentUserId) || null;
  const isSuperAdmin = currentUser?.role === 'superadmin' || currentUserId === 'usr_superadmin';
  const teamMembers = users.filter((u) => u.accountId === currentAccountId && u.id !== currentUserId);

  // Customer accounts (excluding internal platform account)
  const customerAccounts = accounts.filter((a) => a.id !== 'acc_platform_admin');

  // Login: validate credentials against registered users only
  const login = (emailOrPhone, password) => {
    const identifier = emailOrPhone.trim().toLowerCase();
    const user = users.find(
      (u) =>
        u.email?.toLowerCase() === identifier ||
        u.mobileNumber === emailOrPhone.trim()
    );
    if (!user) {
      return { success: false, error: 'No account found with this email or mobile number.' };
    }
    if (user.password && user.password !== password) {
      return { success: false, error: 'Incorrect password.' };
    }

    // Check account status
    const acc = accounts.find((a) => a.id === user.accountId);
    if (acc && acc.status === 'suspended') {
      return { success: false, error: 'This business account has been suspended by the platform administrator.' };
    }

    setCurrentUserId(user.id);
    setCurrentAccountId(user.accountId);
    setIsAuthenticated(true);
    return { success: true, user };
  };

  // Sign Up: create new customer account + user
  const signup = ({ fullName, email, mobileNumber, businessName, password }) => {
    const existing = users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (existing) {
      return { success: false, error: 'This email is already registered. Please sign in.' };
    }

    const newAccountId = `acc_${Date.now()}`;
    const newUserId = `usr_${Date.now()}`;

    const newAccount = {
      id: newAccountId,
      businessName,
      plan: 'starter',
      status: 'active',
      createdAt: new Date().toISOString(),
      monthlyMessageLimit: 5000,
      messagesUsedThisMonth: 0,
      contactLimit: 5000,
    };

    const newUser = {
      id: newUserId,
      accountId: newAccountId,
      fullName,
      email,
      mobileNumber,
      password,
      role: 'owner',
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    setAccounts((prev) => [...prev, newAccount]);
    setUsers((prev) => [...prev, newUser]);
    setCurrentAccountId(newAccountId);
    setCurrentUserId(newUserId);
    setIsAuthenticated(true);

    return { success: true, user: newUser, account: newAccount };
  };

  // Logout
  const logout = () => {
    setIsAuthenticated(false);
    setCurrentAccountId(null);
    setCurrentUserId(null);
    setImpersonationState(null);
    localStorage.removeItem('sheetbotics_auth');
    localStorage.removeItem('sheetbotics_current_account_id');
    localStorage.removeItem('sheetbotics_current_user_id');
    localStorage.removeItem('sheetbotics_impersonation');
  };

  // Switch account
  const switchAccount = (accountId) => {
    const targetAccount = accounts.find((a) => a.id === accountId);
    if (targetAccount) {
      setCurrentAccountId(accountId);
      const userInAccount = users.find((u) => u.accountId === accountId);
      if (userInAccount) setCurrentUserId(userInAccount.id);
    }
  };

  // Update current user's profile
  const updateProfile = (profileData) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === currentUserId ? { ...u, ...profileData } : u))
    );
  };

  // Invite team member
  const inviteTeamMember = ({ fullName, email, role }) => {
    if (!currentAccountId) return;
    const existing = users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (existing) return;

    const newMember = {
      id: `usr_${Date.now()}`,
      accountId: currentAccountId,
      fullName,
      email,
      role,
      status: 'invited',
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) => [...prev, newMember]);
  };

  // ==========================================
  // SUPERADMIN ACTIONS (Customer & Platform Management)
  // ==========================================

  // Impersonate customer business
  const impersonateAccount = (targetAccountId) => {
    const targetAcc = accounts.find((a) => a.id === targetAccountId);
    if (!targetAcc) return { success: false, error: 'Target account not found' };

    const targetUser = users.find((u) => u.accountId === targetAccountId) || {
      id: `usr_imp_${targetAccountId}`,
      accountId: targetAccountId,
      fullName: `${targetAcc.businessName} Admin`,
      role: 'owner',
    };

    const impData = {
      originalUserId: currentUserId,
      originalAccountId: currentAccountId,
      targetAccountId,
      targetAccountName: targetAcc.businessName,
    };

    setImpersonationState(impData);
    localStorage.setItem('sheetbotics_impersonation', JSON.stringify(impData));

    setCurrentAccountId(targetAccountId);
    setCurrentUserId(targetUser.id);
    return { success: true };
  };

  // Exit Impersonation back to Superadmin Portal
  const exitImpersonation = () => {
    if (!impersonationState) return;
    setCurrentAccountId(impersonationState.originalAccountId || 'acc_platform_admin');
    setCurrentUserId(impersonationState.originalUserId || 'usr_superadmin');
    setImpersonationState(null);
    localStorage.removeItem('sheetbotics_impersonation');
  };

  // Create new customer account manually
  const createCustomerAccount = ({
    businessName,
    ownerName,
    ownerEmail,
    ownerMobile,
    ownerPassword = 'password123',
    plan = 'growth',
    monthlyMessageLimit = 25000,
    contactLimit = 25000,
  }) => {
    const existing = users.find((u) => u.email?.toLowerCase() === ownerEmail.toLowerCase());
    if (existing) {
      return { success: false, error: 'Email already registered.' };
    }

    const newAccountId = `acc_${Date.now()}`;
    const newUserId = `usr_${Date.now()}`;

    const newAcc = {
      id: newAccountId,
      businessName,
      plan,
      status: 'active',
      createdAt: new Date().toISOString(),
      monthlyMessageLimit: Number(monthlyMessageLimit),
      messagesUsedThisMonth: 0,
      contactLimit: Number(contactLimit),
    };

    const newUser = {
      id: newUserId,
      accountId: newAccountId,
      fullName: ownerName,
      email: ownerEmail,
      mobileNumber: ownerMobile,
      password: ownerPassword,
      role: 'owner',
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    setAccounts((prev) => [...prev, newAcc]);
    setUsers((prev) => [...prev, newUser]);
    return { success: true, account: newAcc, user: newUser };
  };

  // Update customer account settings (plan, limits, suspension)
  const updateCustomerAccount = (accountId, updates) => {
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === accountId ? { ...acc, ...updates, updatedAt: new Date().toISOString() } : acc))
    );
  };

  // Delete customer account
  const deleteCustomerAccount = (accountId) => {
    if (accountId === 'acc_platform_admin') return;
    setAccounts((prev) => prev.filter((a) => a.id !== accountId));
    setUsers((prev) => prev.filter((u) => u.accountId !== accountId));
  };

  // Update global platform settings
  const updatePlatformSettings = (newSettings) => {
    setPlatformSettings((prev) => ({
      ...prev,
      ...newSettings,
      updatedAt: new Date().toISOString(),
    }));

    // Also persist to backend API
    fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSettings),
    }).catch(() => {
      // Backend may be offline, localStorage already saved
    });
  };

  // RBAC Permission Checker
  const hasPermission = (moduleName) => {
    const role = currentUser?.role || 'agent';
    if (role === 'superadmin' || role === 'owner' || role === 'admin') return true;
    if (role === 'manager') return moduleName !== 'billing';
    if (role === 'agent') return ['dashboard', 'inbox', 'contacts'].includes(moduleName);
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        currentAccount,
        currentUser,
        accounts,
        customerAccounts,
        users,
        teamMembers,
        isSuperAdmin,
        isImpersonating: !!impersonationState,
        impersonationState,
        platformSettings,
        login,
        signup,
        logout,
        switchAccount,
        updateProfile,
        inviteTeamMember,
        hasPermission,
        // Superadmin functions
        impersonateAccount,
        exitImpersonation,
        createCustomerAccount,
        updateCustomerAccount,
        deleteCustomerAccount,
        updatePlatformSettings,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
