import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { WhatsAppDataProvider } from './context/WhatsAppDataContext';
import Layout from './components/layout/Layout';
import AuthPage from './pages/AuthPage';

function AppContent() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <WhatsAppDataProvider>
      <Layout />
    </WhatsAppDataProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}
