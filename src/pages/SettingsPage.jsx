import React, { useState } from 'react';
import {
  Settings, Users, Shield, Bell, Globe, Save, ChevronRight,
  User, Mail, Lock, Smartphone, Plus, Trash2, X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'account', label: 'Business', icon: Globe },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

function SectionCard({ title, description, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 space-y-4">
      <div className="border-b border-gray-100 pb-3">
        <h2 className="font-bold text-gray-900 text-sm">{title}</h2>
        {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div className="grid grid-cols-3 gap-4 items-start">
      <div className="col-span-1">
        <label className="block text-xs font-semibold text-gray-700">{label}</label>
        {hint && <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">{hint}</p>}
      </div>
      <div className="col-span-2">{children}</div>
    </div>
  );
}

const inputCls = "w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-wa-green/30 focus:border-wa-green";

export default function SettingsPage() {
  const { currentAccount, currentUser, updateProfile, inviteTeamMember, teamMembers } = useAuth();
  const { showSuccess, showError } = useToast();
  const [activeTab, setActiveTab] = useState('profile');

  // Profile
  const [profileForm, setProfileForm] = useState({
    fullName: currentUser?.fullName || '',
    email: currentUser?.email || '',
    mobileNumber: currentUser?.mobileNumber || '',
  });

  // Business
  const [businessForm, setBusinessForm] = useState({
    businessName: currentAccount?.businessName || '',
    website: currentAccount?.website || '',
    industry: currentAccount?.industry || '',
    timezone: currentAccount?.timezone || 'Asia/Kolkata',
  });

  // Team invite
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('agent');
  const [inviteName, setInviteName] = useState('');

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateProfile?.({ ...currentUser, ...profileForm });
    showSuccess('Profile Saved', 'Your profile has been updated.');
  };

  const handleSaveBusiness = (e) => {
    e.preventDefault();
    showSuccess('Business Updated', 'Business settings saved.');
  };

  const handleInvite = (e) => {
    e.preventDefault();
    if (!inviteEmail || !inviteName) return;
    inviteTeamMember?.({ email: inviteEmail, fullName: inviteName, role: inviteRole });
    showSuccess('Invitation Sent', `Invited ${inviteName} as ${inviteRole}.`);
    setInviteEmail('');
    setInviteName('');
  };

  const safeTeamMembers = Array.isArray(teamMembers) ? teamMembers : [];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-xl font-extrabold text-gray-900 mb-5">Settings</h1>

      <div className="flex flex-col md:flex-row gap-5">
        {/* Sidebar Tabs */}
        <div className="md:w-48 shrink-0">
          <nav className="space-y-0.5">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                id={`settings-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  activeTab === tab.id
                    ? 'bg-wa-teal text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-4">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile}>
              <SectionCard title="Profile Information" description="Update your personal account details.">
                <Field label="Full Name">
                  <input type="text" value={profileForm.fullName}
                    onChange={(e) => setProfileForm((p) => ({ ...p, fullName: e.target.value }))}
                    className={inputCls} />
                </Field>
                <Field label="Email Address">
                  <input type="email" value={profileForm.email}
                    onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))}
                    className={inputCls} />
                </Field>
                <Field label="Mobile Number">
                  <input type="text" value={profileForm.mobileNumber}
                    onChange={(e) => setProfileForm((p) => ({ ...p, mobileNumber: e.target.value }))}
                    placeholder="+91 98765 43210"
                    className={inputCls + ' font-mono'} />
                </Field>
                <div className="flex justify-end pt-2">
                  <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-wa-teal hover:bg-wa-dark text-white text-sm font-bold rounded-xl transition">
                    <Save className="w-3.5 h-3.5" />
                    Save Profile
                  </button>
                </div>
              </SectionCard>
            </form>
          )}

          {/* Business Tab */}
          {activeTab === 'account' && (
            <form onSubmit={handleSaveBusiness}>
              <SectionCard title="Business Information" description="Settings for your business account.">
                <Field label="Business Name">
                  <input type="text" value={businessForm.businessName}
                    onChange={(e) => setBusinessForm((p) => ({ ...p, businessName: e.target.value }))}
                    className={inputCls} />
                </Field>
                <Field label="Website">
                  <input type="url" value={businessForm.website}
                    onChange={(e) => setBusinessForm((p) => ({ ...p, website: e.target.value }))}
                    placeholder="https://yourbusiness.com"
                    className={inputCls} />
                </Field>
                <Field label="Industry">
                  <select value={businessForm.industry}
                    onChange={(e) => setBusinessForm((p) => ({ ...p, industry: e.target.value }))}
                    className={inputCls}>
                    <option value="">Select...</option>
                    {['E-commerce', 'Healthcare', 'Education', 'Finance', 'Travel', 'Real Estate', 'Food & Beverage', 'Technology', 'Other'].map((i) => (
                      <option key={i}>{i}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Timezone">
                  <select value={businessForm.timezone}
                    onChange={(e) => setBusinessForm((p) => ({ ...p, timezone: e.target.value }))}
                    className={inputCls}>
                    {['Asia/Kolkata', 'Asia/Dubai', 'America/New_York', 'Europe/London', 'Asia/Singapore'].map((tz) => (
                      <option key={tz}>{tz}</option>
                    ))}
                  </select>
                </Field>
                <div className="flex justify-end pt-2">
                  <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-wa-teal hover:bg-wa-dark text-white text-sm font-bold rounded-xl transition">
                    <Save className="w-3.5 h-3.5" />
                    Save Business Settings
                  </button>
                </div>
              </SectionCard>
            </form>
          )}

          {/* Team Tab */}
          {activeTab === 'team' && (
            <div className="space-y-4">
              <SectionCard title="Team Members" description="Agents who have access to this account.">
                {safeTeamMembers.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">No team members added yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {safeTeamMembers.map((member) => (
                      <li key={member.id || member.email} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-wa-teal/10 flex items-center justify-center text-xs font-bold text-wa-teal">
                            {member.fullName?.charAt(0)?.toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-800">{member.fullName}</p>
                            <p className="text-[11px] text-gray-400">{member.email} · <span className="capitalize">{member.role}</span></p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </SectionCard>

              <SectionCard title="Invite Team Member" description="Send an invitation to a new team member.">
                <form onSubmit={handleInvite} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Full Name</label>
                      <input type="text" required value={inviteName} onChange={(e) => setInviteName(e.target.value)}
                        placeholder="Team member name"
                        className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Role</label>
                      <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} className={inputCls}>
                        <option value="admin">Admin</option>
                        <option value="agent">Agent</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email Address</label>
                    <input type="email" required value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="teammate@company.com"
                      className={inputCls} />
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-wa-teal hover:bg-wa-dark text-white text-sm font-bold rounded-xl transition">
                      <Plus className="w-3.5 h-3.5" />
                      Send Invitation
                    </button>
                  </div>
                </form>
              </SectionCard>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <SectionCard title="Security" description="Manage your password and account security.">
              <Field label="Current Password">
                <input type="password" placeholder="Enter current password" className={inputCls} />
              </Field>
              <Field label="New Password">
                <input type="password" placeholder="Min 8 characters" className={inputCls} />
              </Field>
              <Field label="Confirm Password">
                <input type="password" placeholder="Repeat new password" className={inputCls} />
              </Field>
              <div className="flex justify-end pt-2">
                <button type="button" className="flex items-center gap-2 px-4 py-2 bg-wa-teal hover:bg-wa-dark text-white text-sm font-bold rounded-xl transition">
                  <Lock className="w-3.5 h-3.5" />
                  Change Password
                </button>
              </div>
            </SectionCard>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <SectionCard title="Notification Preferences" description="Choose which events you want to be notified about.">
              <div className="space-y-3">
                {[
                  { label: 'New incoming message', desc: 'When a customer sends a new message', key: 'newMessage' },
                  { label: 'Conversation assigned to me', desc: 'When a conversation is assigned to your account', key: 'assigned' },
                  { label: 'Broadcast completed', desc: 'When a broadcast campaign finishes sending', key: 'broadcastDone' },
                  { label: 'Template approved / rejected', desc: 'Meta template approval status changes', key: 'template' },
                  { label: 'Channel quality alert', desc: 'When WABA quality rating changes', key: 'quality' },
                ].map((notif) => (
                  <div key={notif.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-xs font-semibold text-gray-800">{notif.label}</p>
                      <p className="text-[11px] text-gray-400">{notif.desc}</p>
                    </div>
                    <button className="relative w-10 h-5 rounded-full bg-wa-green transition">
                      <div className="absolute top-0.5 right-0.5 w-4 h-4 bg-white rounded-full shadow" />
                    </button>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
}
