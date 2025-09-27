import { 
  LogOut, 
  Sparkles, 
  Plus, 
  Trophy, 
  User, 
  Crown,
  Users,
  Calendar,
  Hexagon,
  Wallet
} from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
  user: {
    name: string;
    email: string;
    avatar: string;
    role: 'organizer' | 'user';
    walletBalance: string;
    walletAddress: string;
  };
  onLogout: () => void;
  currentPage: string;
  onPageChange: (page: string) => void;
}

export default function AuthenticatedLayout({ 
  children, 
  user, 
  onLogout, 
  currentPage, 
  onPageChange 
}: AuthenticatedLayoutProps) {
  
  const organizerNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Calendar },
    { id: 'create', label: 'Create Event', icon: Plus },
  ];

  const userNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: User },
    { id: 'collection', label: 'My Collection', icon: Trophy },
    { id: 'claim', label: 'Claim POAP', icon: Hexagon },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
  ];

  const navItems = user.role === 'organizer' ? organizerNavItems : userNavItems;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-teal-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">POAP</h1>
                <p className="text-xs text-slate-500">Proof of Presence</p>
              </div>
            </div>

            {/* Navigation Items */}
            <div className="flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => onPageChange(item.id)}
                    className={`
                      flex items-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 font-medium
                      ${isActive 
                        ? 'bg-black-900 text-blue shadow-md' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-600'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden md:inline text-sm">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* User Profile & Logout */}
            <div className="flex items-center space-x-4">
              {/* Role Badge */}
              <div className="flex items-center space-x-2 bg-slate-100 px-3 py-1.5 rounded-lg">
                {user.role === 'organizer' ? (
                  <Crown className="w-4 h-4 text-blue-600" />
                ) : (
                  <Users className="w-4 h-4 text-teal-600" />
                )}
                <span className="text-sm text-slate-700 capitalize font-medium">{user.role}</span>
              </div>

              {/* User Avatar */}
              <div className="flex items-center space-x-3">
                <Avatar className="w-9 h-9 border-2 border-slate-200">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-600 to-teal-600 text-white text-sm font-semibold">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden lg:block">
                  <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
              </div>

              {/* Logout Button */}
              <button 
                onClick={onLogout}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}