import { useState } from 'react';
import { 
  Trophy, 
  User, 
  Wallet, 
  Star, 
  Calendar,
  MapPin,
  Filter,
  Search,
  Plus,
  Award,
  TrendingUp,
  Clock
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import BadgeCard from './BadgeCard';
import ClaimPage from './ClaimPage';
import WalletCard from './WalletCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

interface UserDashboardProps {
  user: {
    name: string;
    email: string;
    avatar: string;
    role: string;
    walletBalance: string;
    walletAddress: string;
  };
  onToast: (toast: { title: string; description?: string; type: 'success' | 'error' | 'info' }) => void;
}

const mockBadges = [
  {
    id: '1',
    name: 'TechConf 2024',
    event: 'TechConf 2024: AI & Web3',
    date: 'March 15, 2024',
    location: 'San Francisco, CA',
    attendees: 1247,
    rarity: 'rare' as const,
    image: 'https://images.unsplash.com/photo-1560439514-0fc9d2cd5e1b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNoJTIwY29uZmVyZW5jZSUyMG1lZXR1cHxlbnwxfHx8fDE3NTg5NzMxNjV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    description: 'Exclusive badge for attending TechConf 2024.'
  },
  {
    id: '2',
    name: 'Art Gallery Opening',
    event: 'Modern Art Collective Exhibition',
    date: 'February 28, 2024',
    location: 'New York, NY',
    attendees: 342,
    rarity: 'epic' as const,
    image: 'https://images.unsplash.com/photo-1681397216288-123a8f521e8f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnQlMjBnYWxsZXJ5JTIwb3BlbmluZ3xlbnwxfHx8fDE3NTg5MjAzODh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    description: 'Commemorating the opening of the Modern Art Collective.'
  },
  {
    id: '3',
    name: 'Music Festival 2024',
    event: 'Electronic Vibes Festival',
    date: 'January 20, 2024',
    location: 'Miami, FL',
    attendees: 8954,
    rarity: 'legendary' as const,
    image: 'https://images.unsplash.com/photo-1672841821756-fc04525771c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGZlc3RpdmFsJTIwY29uY2VydHxlbnwxfHx8fDE3NTg4ODgyOTl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    description: 'Legendary badge from the biggest electronic music festival.'
  }
];

export default function UserDashboard({ user, onToast }: UserDashboardProps) {
  const [currentView, setCurrentView] = useState<'dashboard' | 'collection' | 'claim' | 'wallet'>('dashboard');
  const [badges] = useState(mockBadges);
  const [selectedBadge, setSelectedBadge] = useState<typeof mockBadges[0] | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRarity, setFilterRarity] = useState('all');

  const stats = {
    totalBadges: badges.length,
    legendary: badges.filter(b => b.rarity === 'legendary').length,
    epic: badges.filter(b => b.rarity === 'epic').length,
    rare: badges.filter(b => b.rarity === 'rare').length,
    walletBalance: user.walletBalance
  };

  const filteredBadges = badges
    .filter(badge => 
      badge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      badge.event.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(badge => 
      filterRarity === 'all' || badge.rarity === filterRarity
    );

  if (currentView === 'claim') {
    return (
      <div>
        <div className="mb-6">
          <Button
            onClick={() => setCurrentView('dashboard')}
            variant="outline"
            className="professional-card border text-neutral-gray hover:text-primary-blue"
          >
            ← Back to Dashboard
          </Button>
        </div>
        <ClaimPage onToast={onToast} />
      </div>
    );
  }

  if (currentView === 'wallet') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">POAP Wallet</h1>
            <p className="text-neutral-gray">Manage your digital collectibles currency</p>
          </div>
          <Button
            onClick={() => setCurrentView('dashboard')}
            variant="outline"
            className="professional-card border text-neutral-gray hover:text-primary-blue"
          >
            ← Back to Dashboard
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <WalletCard 
            balance={user.walletBalance}
            onDeposit={() => console.log('Deposit')}
            onWithdraw={() => console.log('Withdraw')}
          />
          
          {/* Wallet Info */}
          <Card className="professional-card border-0 shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="text-slate-900">Wallet Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-slate-600 text-sm font-medium mb-1">Wallet Address</p>
                <code className="text-xs text-slate-900 bg-slate-100 rounded-lg p-2 block break-all">
                  {user.walletAddress}
                </code>
              </div>
              <div>
                <p className="text-slate-600 text-sm font-medium mb-1">Account Type</p>
                <p className="text-slate-900 capitalize font-medium">{user.role}</p>
              </div>
              <div>
                <p className="text-slate-600 text-sm font-medium mb-1">Total Badges</p>
                <p className="text-slate-900 font-medium">{stats.totalBadges} POAPs</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (currentView === 'collection') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Collection</h1>
            <p className="text-neutral-gray">Your digital trophy showcase</p>
          </div>
          <Button
            onClick={() => setCurrentView('dashboard')}
            variant="outline"
            className="professional-card border text-neutral-gray hover:text-primary-blue"
          >
            ← Back to Dashboard
          </Button>
        </div>

        {/* Collection Controls */}
        <div className="professional-card border-0 shadow-sm bg-white rounded-lg p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search badges..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-slate-200 focus:border-blue-600"
              />
            </div>
            
            <Select value={filterRarity} onValueChange={setFilterRarity}>
              <SelectTrigger className="w-40 border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rarities</SelectItem>
                <SelectItem value="legendary">Legendary</SelectItem>
                <SelectItem value="epic">Epic</SelectItem>
                <SelectItem value="rare">Rare</SelectItem>
                <SelectItem value="common">Common</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Badge Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBadges.map((badge) => (
            <BadgeCard
              key={badge.id}
              badge={badge}
              onClick={() => setSelectedBadge(badge)}
            />
          ))}
        </div>

        {/* Badge Detail Modal */}
        <Dialog open={!!selectedBadge} onOpenChange={() => setSelectedBadge(null)}>
          <DialogContent className="professional-card max-w-md">
            {selectedBadge && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-slate-900">{selectedBadge.name}</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  <img
                    src={selectedBadge.image}
                    alt={selectedBadge.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  
                  <div className="space-y-2 text-sm">
                    <p className="text-slate-600">{selectedBadge.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div>
                        <p className="text-slate-600 font-medium">Event</p>
                        <p className="text-slate-900 font-semibold">{selectedBadge.event}</p>
                      </div>
                      
                      <div>
                        <p className="text-slate-600 font-medium">Date</p>
                        <p className="text-slate-900 font-semibold">{selectedBadge.date}</p>
                      </div>
                      
                      <div>
                        <p className="text-slate-600 font-medium">Location</p>
                        <p className="text-slate-900 font-semibold">{selectedBadge.location}</p>
                      </div>
                      
                      <div>
                        <p className="text-slate-600 font-medium">Rarity</p>
                        <p className="text-slate-900 font-semibold capitalize">{selectedBadge.rarity}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Profile */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Avatar className="w-16 h-16 border-3 border-white shadow-lg">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-gradient-to-r from-blue-600 to-teal-600 text-white text-lg font-semibold">
              {user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-1">Welcome, {user.name}!</h1>
            <p className="text-slate-600 mb-2">Collector • {stats.totalBadges} POAPs earned</p>
            <div className="flex items-center space-x-2">
              <Wallet className="w-4 h-4 text-blue-600" />
              <span className="text-slate-700 font-medium">{stats.walletBalance} POAP</span>
            </div>
          </div>
        </div>
        
        <Button
          onClick={() => setCurrentView('claim')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Claim POAP
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: 'Total POAPs',
            value: stats.totalBadges,
            icon: Trophy,
            color: 'bg-[#1e40af]'
          },
          {
            title: 'Recent Events',
            value: stats.totalBadges,
            icon: Calendar,
            color: 'bg-[#0f766e]'
          },
          {
            title: 'This Month',
            value: 2,
            icon: Award,
            color: 'bg-[#059669]'
          },
          {
            title: 'Wallet Balance',
            value: `${stats.walletBalance}`,
            icon: Wallet,
            color: 'bg-[#1e40af]'
          }
        ].map((stat) => {
          const Icon = stat.icon;
          
          return (
            <Card key={stat.title} className="professional-card border-0 shadow-sm bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Badges */}
      <Card className="professional-card border-0 shadow-sm bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2 text-slate-900">
              <Trophy className="w-5 h-5 text-blue-600" />
              <span>Recent POAPs</span>
            </CardTitle>
            <Button
              onClick={() => setCurrentView('collection')}
              variant="outline"
              className="text-slate-600 hover:text-slate-900 border-slate-200"
            >
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {badges.slice(0, 3).map((badge) => (
              <BadgeCard
                key={badge.id}
                badge={badge}
                size="small"
                onClick={() => setSelectedBadge(badge)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="professional-card border-0 shadow-sm bg-white">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-slate-900">
            <Plus className="w-5 h-5 text-blue-600" />
            <span>Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                title: 'Claim POAP',
                description: 'Scan QR code to claim new badge',
                icon: Plus,
                action: () => setCurrentView('claim')
              },
              {
                title: 'Browse Collection',
                description: 'View all your earned badges',
                icon: Trophy,
                action: () => setCurrentView('collection')
              },
              {
                title: 'Wallet',
                description: 'Manage your POAP wallet',
                icon: Wallet,
                action: () => setCurrentView('wallet')
              }
            ].map((action) => {
              const Icon = action.icon;
              
              return (
                <button
                  key={action.title}
                  onClick={action.action}
                  className="professional-card rounded-lg p-6 text-left hover:shadow-md transition-all duration-200 group border border-slate-200"
                >
                  <Icon className="w-8 h-8 text-blue-600 mb-3 group-hover:text-blue-700 transition-colors" />
                  <h3 className="font-semibold text-slate-900 mb-1">{action.title}</h3>
                  <p className="text-sm text-slate-600">{action.description}</p>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}