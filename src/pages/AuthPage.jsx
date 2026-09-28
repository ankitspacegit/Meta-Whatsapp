import React, { useState } from 'react';
import {
  Zap,
  Lock,
  Mail,
  User,
  Building,
  ArrowRight,
  MessageCircle,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const { login, signup } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();

  // Login State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Sign Up State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      showError('Missing Fields', 'Please enter your email/mobile and password.');
      return;
    }
    const res = login(loginIdentifier, loginPassword);
    if (res.success) {
      showSuccess('Welcome back!', `Signed in as ${res.user.fullName}`);
    } else {
      showError('Login Failed', 'Invalid credentials. Please try again.');
    }
  };

  const handleSignUpSubmit = (e) => {
    e.preventDefault();
    if (!fullName || !email || !mobileNumber || !businessName || !password) {
      showError('Missing Fields', 'All fields are required.');
      return;
    }
    if (password !== confirmPassword) {
      showError('Password Mismatch', 'Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      showError('Weak Password', 'Password must be at least 8 characters.');
      return;
    }
    const res = signup({ fullName, email, mobileNumber, businessName, password });
    if (res.success) {
      showSuccess('Account Created!', `Welcome ${fullName}. Let's set up your WhatsApp channel.`);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7f5] flex">
      {/* Left Panel — Brand / Product Info */}
      <div className="hidden lg:flex lg:w-1/2 bg-wa-teal flex-col justify-between p-12 relative overflow-hidden">
        {/* Background decorative */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/10 rounded-full" />
          <div className="absolute -bottom-32 -left-16 w-80 h-80 bg-white/5 rounded-full" />
          <div className="absolute top-1/2 right-8 w-40 h-40 bg-wa-green/30 rounded-full blur-xl" />
        </div>

        {/* Brand */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-md">
            <Zap className="w-5 h-5 text-wa-teal" />
          </div>
          <div>
            <span className="text-white font-extrabold text-lg tracking-tight">Sheetbotics</span>
            <span className="text-white/60 text-xs block">WhatsApp Management</span>
          </div>
        </div>

        {/* Hero Text */}
        <div className="relative z-10 space-y-6">
          <div>
            <h2 className="text-4xl font-extrabold text-white leading-tight">
              Manage your entire<br />WhatsApp business<br />from one place.
            </h2>
            <p className="text-white/70 text-sm mt-4 leading-relaxed max-w-sm">
              Unified inbox, automated campaigns, contact management, and real-time analytics — all connected to the official Meta Cloud API.
            </p>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap gap-2">
            {['Team Inbox', 'Broadcast Campaigns', 'Automations', 'Import Contacts', 'Live Analytics'].map((f) => (
              <span key={f} className="px-3 py-1.5 bg-white/15 text-white text-xs font-medium rounded-full border border-white/20">
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Meta API Badge */}
        <div className="relative z-10 flex items-center gap-2 bg-white/10 border border-white/20 rounded-2xl p-3 max-w-xs">
          <ShieldCheck className="w-5 h-5 text-wa-green shrink-0" />
          <div>
            <span className="text-white text-xs font-semibold block">Official Meta Cloud API</span>
            <span className="text-white/60 text-[11px]">WhatsApp Business Platform v20.0</span>
          </div>
        </div>
      </div>

      {/* Right Panel — Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-[420px]">
          {/* Mobile Brand (shown only < lg) */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-wa-teal rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-gray-900 text-lg">Sheetbotics</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-extrabold text-gray-900">
              {isSignUp ? 'Create your account' : 'Sign in to your account'}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {isSignUp
                ? 'Fill in the details below to register your business on Sheetbotics.'
                : 'Enter your registered email or mobile number and password.'}
            </p>
          </div>

          {/* Login Form */}
          {!isSignUp ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Email / Mobile Number
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="login-email"
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-wa-green/30 focus:border-wa-green transition shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="login-password"
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-wa-green/30 focus:border-wa-green transition shadow-sm"
                  />
                </div>
                <div className="flex justify-end mt-1.5">
                  <button type="button" className="text-xs text-wa-teal font-medium hover:underline">
                    Forgot password?
                  </button>
                </div>
              </div>

              <button
                id="login-submit"
                type="submit"
                className="w-full py-3 bg-wa-teal hover:bg-wa-dark text-white font-bold rounded-xl shadow-wa-green transition flex items-center justify-center gap-2 mt-2"
              >
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setLoginIdentifier('admin@sheetbotics.com');
                    setLoginPassword('admin123');
                    showInfo('Superadmin Credentials Loaded', 'Click "Sign In" to enter the Platform Super Admin Portal.');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-xs font-bold rounded-xl transition shadow-xs"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Quick-Fill Super Admin (Platform Owner)
                </button>
              </div>
            </form>
          ) : (
            /* Sign Up Form */
            <form onSubmit={handleSignUpSubmit} className="space-y-3.5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="signup-fullname"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-wa-green/30 focus:border-wa-green transition shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Business Name</label>
                <div className="relative">
                  <Building className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="signup-business"
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Your business or company name"
                    className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-wa-green/30 focus:border-wa-green transition shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="signup-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-wa-green/30 focus:border-wa-green transition shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mobile Number</label>
                <input
                  id="signup-mobile"
                  type="text"
                  required
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-wa-green/30 focus:border-wa-green transition shadow-sm font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                  <input
                    id="signup-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-wa-green/30 focus:border-wa-green transition shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm Password</label>
                  <input
                    id="signup-confirm-password"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-wa-green/30 focus:border-wa-green transition shadow-sm"
                  />
                </div>
              </div>

              <button
                id="signup-submit"
                type="submit"
                className="w-full py-3 bg-wa-teal hover:bg-wa-dark text-white font-bold rounded-xl shadow-wa-green transition flex items-center justify-center gap-2 mt-1"
              >
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Toggle */}
          <p className="text-center text-sm text-gray-500 mt-6">
            {isSignUp ? (
              <>
                Already have an account?{' '}
                <button type="button" onClick={() => setIsSignUp(false)} className="text-wa-teal font-semibold hover:underline">
                  Sign in
                </button>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <button type="button" onClick={() => setIsSignUp(true)} className="text-wa-teal font-semibold hover:underline">
                  Sign up
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
