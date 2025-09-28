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

// A wrapper component to render the AuthenticatedLayout
function AuthenticatedAppWrapper({ user, onLogout }: { 
  user: User; 
  onLogout: () => void; 
}) {
  const location = useLocation();
  const currentPagePath = location.pathname.substring(1) || 'dashboard'; 

  return (
    <AuthenticatedLayout
      user={user}
      onLogout={onLogout}
      currentPage={currentPagePath}
      onPageChange={() => { /* Navigation is now handled by react-router-dom */ }}
    >
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
    // This effect correctly handles redirects and session expiry. No changes needed here.
    if (!user && !isLoggingOutRef.current && (location.pathname !== '/' && location.pathname !== '/login' && location.pathname !== '/signup')) {
      addToast('Your session has expired or you have been logged out.', 'error');
      navigate('/', { replace: true });
    } 
    else if (user && (location.pathname === '/' || location.pathname === '/login' || location.pathname === '/signup')) {
      navigate('/dashboard', { replace: true });
    }
    if (isLoggingOutRef.current && !user && location.pathname === '/') {
      isLoggingOutRef.current = false;
    }
  }, [user, location.pathname, navigate, addToast]);

  // --- THIS IS THE MERGED handleSignUp FUNCTION ---
  // It now accepts 'any' to handle both user and organizer data structures.
  const handleSignUp = (userData: any) => {
    
    // Check for a unique property from the organizer form to differentiate the flows
    if (userData.role === 'organizer' && userData.org_name) {
      // This is the new ORGANIZER signup flow using mock data
      console.log("Signing up organizer with (mock):", userData);
      
      const newUser: User = {
        name: userData.org_name, // The main name is the organization's name
        email: userData.email,   // The admin's email
        avatar: userData.org_logo_url || 'https://images.unsplash.com/photo-1581093458791-95b7a1d1b3b0?w=150&h=150&fit=crop', // Default logo
        role: 'organizer',
        walletBalance: '15.0', // A mock balance for a new organizer
        walletAddress: userData.walletAddress, // The wallet they connected in step 3
      };
  
      setUser(newUser);
      navigate('/dashboard', { replace: true }); // Use navigate instead of setState
      addToast('Organizer account created successfully!', 'success');

    } else {
      // This is your original ATTENDEE (user) signup flow from the new file, it remains unchanged
      const newUser: User = {
        name: userData.name,
        email: userData.email,
        avatar: userData.avatar,
        role: userData.role,
        walletBalance: '5.0',
        walletAddress: `0x${Math.random().toString(16).substr(2, 40)}`
      };
      
      setUser(newUser);
      navigate('/dashboard', { replace: true }); // Use navigate instead of setState
      addToast('Attendee account created successfully!', 'success');
    }
  };

  // This is the handleLogin function from your new file, it remains unchanged
  const handleLogin = (email: string, password: string, role: 'organizer' | 'user') => {
    const mockUser: User = {
      name: email.split('@')[0],
      email: email,
      avatar: 'https://images.unsplash.com/photo-1704726135027-9c6f034cfa41',
      role: role,
      walletBalance: role === 'organizer' ? '12.5' : '8.3',
      walletAddress: `0x${Math.random().toString(16).substr(2, 40)}`
    };
    
    setUser(mockUser);
    navigate('/dashboard', { replace: true });
    addToast('Login successful!', 'success');
  };

  // This is the handleLogout function from your new file, it remains unchanged
  const handleLogout = () => {
    isLoggingOutRef.current = true;
    setUser(null);
    setSelectedRole(null);
    navigate('/', { replace: true });
    addToast('You have been logged out.', 'success');
  };

  const handleRoleSelection = (role: 'organizer' | 'user') => {
    setSelectedRole(role);
    navigate('/login');
  };

  return (
    <>
      <ToastSystem toasts={toasts} onRemove={removeToast} />

      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : (
          <LandingPage
            onUserLogin={() => handleRoleSelection('user')}
            onOrganizerLogin={() => handleRoleSelection('organizer')}
          />
        )} />

        <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : (
          // CORRECTED: The `defaultRole` prop is no longer needed by the new SignUpPage
          <SignUpPage
            onSignUp={handleSignUp}
            onSwitchToLogin={() => navigate('/login')}
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

        {/* Protected Routes */}
        <Route element={user ? <AuthenticatedAppWrapper user={user} onLogout={handleLogout} /> : <Navigate to="/" replace />}>
          
          <Route path="/dashboard" element={user?.role === 'organizer' ? (
            <OrganizerDashboard user={user as User} onToast={addToast as any} /> 
          ) : (
            <UserDashboard user={user as User} onToast={addToast as any} />
          )} />

          {user?.role === 'organizer' && (
            <Route path="/create" element={<CreateEventPage user={user as User} onToast={addToast as any} />} />
          )}

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