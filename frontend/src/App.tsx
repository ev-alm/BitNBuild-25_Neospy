// src/App.tsx
import { useState, useEffect, useRef } from 'react';
import LandingPage from './components/LandingPage';
import SignUpPage from './components/SignUpPage';
import LoginPage from './components/LoginPage';
import AuthenticatedLayout from './components/AuthenticatedLayout';
import OrganizerDashboard from './components/OrganizerDashboard';
import UserDashboard from './components/UserDashboard';
import ToastSystem, { useToast } from './components/ToastSystem';

// Import all your specific page components
import CreateEventPage from './components/CreateEventPage';
import CollectionPage from './components/CollectionPage';
import ClaimBadgePage from './components/ClaimPage';
import WalletPage from './components/WalletCard';

// Import react-router-dom components
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation, Outlet } from 'react-router-dom';

interface User {
  name: string;
  email: string;
  avatar: string;
  role: 'organizer' | 'user';
  walletBalance: string;
  walletAddress: string;
}

// A wrapper component to render the AuthenticatedLayout and its children (specific authenticated pages)
function AuthenticatedAppWrapper({ user, onLogout, onToast }: { 
  user: User; 
  onLogout: () => void; 
  // Adjusted onToast signature to match useToast's addToast directly: (message: string, type?: 'success' | 'error')
  onToast: (message: string, type?: 'success' | 'error' | 'info') => void; 
}) {
  const location = useLocation();
  const currentPagePath = location.pathname.substring(1) || 'dashboard'; 

  return (
    <AuthenticatedLayout
      user={user}
      onLogout={onLogout}
      currentPage={currentPagePath}
      onPageChange={() => { /* This prop is no longer actively used for navigation due to react-router-dom */ }}
    >
      {/* Outlet renders the matched nested route component */}
      <Outlet />
    </AuthenticatedLayout>
  );
}

// AppContent handles the main routing logic and authentication state
function AppContent() {
  const [user, setUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<'organizer' | 'user' | null>(null); 
  const { toasts, addToast, removeToast } = useToast();

  const navigate = useNavigate();
  const location = useLocation();

  const isLoggingOutRef = useRef(false);

  useEffect(() => {
    if (!user && !isLoggingOutRef.current && (location.pathname !== '/' && location.pathname !== '/login' && location.pathname !== '/signup')) {
      // Direct call to addToast with its expected string message and type
      addToast('Your session has expired or you have been logged out unexpectedly.', 'error');
      navigate('/', { replace: true });
    } 
    else if (user && (location.pathname === '/' || location.pathname === '/login' || location.pathname === '/signup')) {
      navigate('/dashboard', { replace: true });
    }

    if (isLoggingOutRef.current && !user && location.pathname === '/') {
      isLoggingOutRef.current = false;
    }
  }, [user, location.pathname, navigate, addToast]); // addToast is now correctly in dependencies

  const handleSignUp = (userData: {
    name: string;
    email: string;
    password: string;
    role: 'organizer' | 'user';
    avatar: string;
  }) => {
    const newUser: User = {
      name: userData.name,
      email: userData.email,
      avatar: userData.avatar,
      role: userData.role,
      walletBalance: '5.0',
      walletAddress: `0x${Math.random().toString(16).substr(2, 40)}`
    };
    
    setUser(newUser);
    navigate('/dashboard', { replace: true });
    // Direct call to addToast with its expected string message and type
    addToast('Signup successful!', 'success');
  };

  const handleLogin = (email: string, password: string, role: 'organizer' | 'user') => {
    const mockUser: User = {
      name: email.split('@')[0],
      email: email,
      avatar: 'https://images.unsplash.com/photo-1704726135027-9c6f034cfa41?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHx1c2VyJTIwYXZhdGFyJycjczJwcHJvZmlsZSVlbnwxfHx8fDE3NTg5NDc2MTZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      role: role,
      walletBalance: role === 'organizer' ? '12.5' : '8.3',
      walletAddress: `0x${Math.random().toString(16).substr(2, 40)}`
    };
    
    setUser(mockUser);
    navigate('/dashboard', { replace: true });
    // Direct call to addToast with its expected string message and type
    addToast('Login successful!', 'success');
  };

  const handleLogout = () => {
    isLoggingOutRef.current = true;
    setUser(null);
    setSelectedRole(null);
    navigate('/', { replace: true });
    // Direct call to addToast with its expected string message and type
    addToast('You have been logged out.', 'success');
  };

  const handleRoleSelection = (role: 'organizer' | 'user') => {
    setSelectedRole(role);
    navigate('/login');
  };

  return (
    <>
      {/* Toast notifications */}
      <ToastSystem toasts={toasts} onRemove={removeToast} />

      {/* Main content with Routes */}
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : (
          <LandingPage
            onUserLogin={() => handleRoleSelection('user')}
            onOrganizerLogin={() => handleRoleSelection('organizer')}
          />
        )} />

        <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : (
          <SignUpPage
            onSignUp={handleSignUp}
            onSwitchToLogin={() => navigate('/login')}
            defaultRole={selectedRole}
          />
        )} />

        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : (
          <LoginPage
            onLogin={handleLogin}
            onSwitchToSignUp={() => navigate('/signup')}
            onBack={() => navigate('/')}
            defaultRole={selectedRole}
          />
        )} />

        {/* Protected Routes: These routes require a logged-in user. */}
        {/* Pass user and addToast directly to AuthenticatedAppWrapper */}
        <Route element={user ? <AuthenticatedAppWrapper user={user} onLogout={handleLogout} onToast={addToast} /> : <Navigate to="/" replace />}>
          
          {/* Dashboard route - use type assertion (as any) to satisfy TypeScript for user and onToast props */}
          <Route path="/dashboard" element={user?.role === 'organizer' ? (
            <OrganizerDashboard user={user as User} onToast={addToast as any} /> 
          ) : (
            <UserDashboard user={user as User} onToast={addToast as any} />
          )} />

          {/* Organizer-specific routes */}
          {user?.role === 'organizer' && (
            <Route path="/create" element={<CreateEventPage user={user as User} onToast={addToast as any} />} />
          )}

          {/* User-specific routes */}
          {user?.role === 'user' && (
            <>
              <Route path="/collection" element={<CollectionPage user={user as User} onToast={addToast as any} />} />
              <Route path="/claim" element={<ClaimBadgePage user={user as User} onToast={addToast as any} />} />
              <Route path="/wallet" element={<WalletPage user={user as User} onToast={addToast as any} />} />
            </>
          )}
          
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>

        <Route path="*" element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}