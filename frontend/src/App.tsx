import { useState } from 'react';
import LandingPage from './components/LandingPage';
import SignUpPage from './components/SignUpPage';
import LoginPage from './components/LoginPage';
import AuthenticatedLayout from './components/AuthenticatedLayout';
import OrganizerDashboard from './components/OrganizerDashboard';
import UserDashboard from './components/UserDashboard';
import ToastSystem, { useToast } from './components/ToastSystem';

interface User {
  name: string;
  email: string;
  avatar: string;
  role: 'organizer' | 'user';
  walletBalance: string;
  walletAddress: string;
}

type AuthState = 'landing' | 'login' | 'signup' | 'authenticated';

export default function App() {
  const [authState, setAuthState] = useState<AuthState>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedRole, setSelectedRole] = useState<'organizer' | 'user' | null>(null);
  const { toasts, addToast, removeToast } = useToast();

  const handleSignUp = (userData: {
    name: string;
    email: string;
    password: string;
    role: 'organizer' | 'user';
    avatar: string;
  }) => {
    // Mock user creation with wallet
    const newUser: User = {
      name: userData.name,
      email: userData.email,
      avatar: userData.avatar,
      role: userData.role,
      walletBalance: '5.0',
      walletAddress: `0x${Math.random().toString(16).substr(2, 40)}`
    };
    
    setUser(newUser);
    setAuthState('authenticated');
    setCurrentPage('dashboard');
  };

  const handleLogin = (email: string, password: string, role: 'organizer' | 'user') => {
    // Mock login process with wallet
    const mockUser: User = {
      name: email.split('@')[0], // Extract name from email for demo
      email: email,
      avatar: 'https://images.unsplash.com/photo-1704726135027-9c6f034cfa41?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1c2VyJTIwYXZhdGFyJTIwcHJvZmlsZXxlbnwxfHx8fDE3NTg5NDc2MTZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      role: role,
      walletBalance: role === 'organizer' ? '12.5' : '8.3',
      walletAddress: `0x${Math.random().toString(16).substr(2, 40)}`
    };
    
    setUser(mockUser);
    setAuthState('authenticated');
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setAuthState('landing');
    setCurrentPage('dashboard');
    setSelectedRole(null);
  };

  const handleRoleSelection = (role: 'organizer' | 'user') => {
    setSelectedRole(role);
    setAuthState('login');
  };

  const renderAuthenticatedContent = () => {
    if (!user) return null;

    if (user.role === 'organizer') {
      return <OrganizerDashboard user={user} onToast={addToast} />;
    } else {
      return <UserDashboard user={user} onToast={addToast} />;
    }
  };

  return (
    <>
      {/* Toast notifications */}
      <ToastSystem toasts={toasts} onRemove={removeToast} />

      {/* Main content */}
      {authState === 'landing' && (
        <LandingPage
          onUserLogin={() => handleRoleSelection('user')}
          onOrganizerLogin={() => handleRoleSelection('organizer')}
        />
      )}

      {authState === 'signup' && (
        <SignUpPage
          onSignUp={handleSignUp}
          onSwitchToLogin={() => setAuthState('login')}
          defaultRole={selectedRole}
        />
      )}

      {authState === 'login' && (
        <LoginPage
          onLogin={handleLogin}
          onSwitchToSignUp={() => setAuthState('signup')}
          onBack={() => setAuthState('landing')}
          defaultRole={selectedRole}
        />
      )}

      {authState === 'authenticated' && user && (
        <AuthenticatedLayout
          user={user}
          onLogout={handleLogout}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        >
          {renderAuthenticatedContent()}
        </AuthenticatedLayout>
      )}
    </>
  );
}