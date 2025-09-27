import { useState } from 'react';
import { motion } from 'motion/react';
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
  Clock,
  Sparkles
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
            className="glass-card border-purple-400/30 text-purple-200 hover:text-white"
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
            <p className="text-purple-300">Manage your digital collectibles currency</p>
          </div>
          <Button
            onClick={() => setCurrentView('dashboard')}
            variant="outline"
            className="glass-card border-purple-400/30 text-purple-200 hover:text-white"
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
          <Card className="glass-card border-purple-400/30">
            <CardHeader>
              <CardTitle className="text-white">Wallet Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-purple-400 text-sm font-medium mb-1">Wallet Address</p>
                <code className="text-xs text-purple-200 bg-purple-900/20 rounded-lg p-2 block break-all">
                  {user.walletAddress}
                </code>
              </div>
              <div>
                <p className="text-purple-400 text-sm font-medium mb-1">Account Type</p>
                <p className="text-white capitalize">{user.role}</p>
              </div>
              <div>
                <p className="text-purple-400 text-sm font-medium mb-1">Total Badges</p>
                <p className="text-white">{stats.totalBadges} POAPs</p>
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
            <p className="text-purple-300">Your digital trophy showcase</p>
          </div>
          <Button
            onClick={() => setCurrentView('dashboard')}
            variant="outline"
            className="glass-card border-purple-400/30 text-purple-200 hover:text-white"
          >
            ← Back to Dashboard
          </Button>
        </div>

        {/* Collection Controls */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-400" />
              <Input
                placeholder="Search badges..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 glass-card border-purple-400/30 text-white placeholder:text-purple-300/50"
              />
            </div>
            
            <Select value={filterRarity} onValueChange={setFilterRarity}>
              <SelectTrigger className="w-40 glass-card border-purple-400/30 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-card border-purple-400/30 bg-purple-900/90">
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
          {filteredBadges.map((badge, index) => (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <BadgeCard
                badge={badge}
                onClick={() => setSelectedBadge(badge)}
              />
            </motion.div>
          ))}
        </div>

        {/* Badge Detail Modal */}
        <Dialog open={!!selectedBadge} onOpenChange={() => setSelectedBadge(null)}>
          <DialogContent className="glass-card border-purple-400/30 max-w-md">
            {selectedBadge && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-white">{selectedBadge.name}</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  <img
                    src={selectedBadge.image}
                    alt={selectedBadge.name}
                    className="w-full h-48 object-cover rounded-xl"
                  />
                  
                  <div className="space-y-2 text-sm">
                    <p className="text-purple-200">{selectedBadge.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div>
                        <p className="text-purple-400 font-medium">Event</p>
                        <p className="text-white">{selectedBadge.event}</p>
                      </div>
                      
                      <div>
                        <p className="text-purple-400 font-medium">Date</p>
                        <p className="text-white">{selectedBadge.date}</p>
                      </div>
                      
                      <div>
                        <p className="text-purple-400 font-medium">Location</p>
                        <p className="text-white">{selectedBadge.location}</p>
                      </div>
                      
                      <div>
                        <p className="text-purple-400 font-medium">Rarity</p>
                        <p className="text-white capitalize">{selectedBadge.rarity}</p>
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
      <motion.div 
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center space-x-4">
          <Avatar className="w-16 h-16 border-2 border-purple-400/50">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-purple-500/20 text-purple-400">
              {user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">Welcome, {user.name}!</h1>
            <p className="text-purple-300">Collector • {stats.totalBadges} POAPs earned</p>
            <div className="flex items-center space-x-2 mt-1">
              <Wallet className="w-4 h-4 text-purple-400" />
              <span className="text-purple-300">{stats.walletBalance} POAP</span>
            </div>
          </div>
        </div>
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={() => setCurrentView('claim')}
            className="glow-button px-6 py-3 text-lg rounded-xl"
          >
            <Plus className="w-5 h-5 mr-2" />
            Claim POAP
          </Button>
        </motion.div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {[
          {
            title: 'Total POAPs',
            value: stats.totalBadges,
            icon: Trophy,
            color: 'from-yellow-400 to-orange-500'
          },
          {
            title: 'Legendary',
            value: stats.legendary,
            icon: Star,
            color: 'from-purple-400 to-purple-600'
          },
          {
            title: 'Epic',
            value: stats.epic,
            icon: Award,
            color: 'from-pink-400 to-pink-600'
          },
          {
            title: 'Rare',
            value: stats.rare,
            icon: TrendingUp,
            color: 'from-blue-400 to-blue-600'
          }
        ].map((stat, index) => {
          const Icon = stat.icon;
          
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <Card className="glass-card border-purple-400/30 hover:border-purple-400/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-300 text-sm font-medium">{stat.title}</p>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Recent Badges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="glass-card border-purple-400/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2 text-white">
                <Trophy className="w-5 h-5 text-purple-400" />
                <span>Recent POAPs</span>
              </CardTitle>
              <Button
                onClick={() => setCurrentView('collection')}
                variant="outline"
                className="glass-card border-purple-400/30 text-purple-200 hover:text-white"
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {badges.slice(0, 3).map((badge, index) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <BadgeCard
                    badge={badge}
                    size="small"
                    onClick={() => setSelectedBadge(badge)}
                  />
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="glass-card border-purple-400/30">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <Sparkles className="w-5 h-5 text-purple-400" />
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
              ].map((action, index) => {
                const Icon = action.icon;
                
                return (
                  <motion.button
                    key={action.title}
                    onClick={action.action}
                    className="glass-card rounded-xl p-4 text-left hover:bg-white/5 transition-colors group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    <Icon className="w-8 h-8 text-purple-400 mb-3 group-hover:text-purple-300 transition-colors" />
                    <h3 className="font-bold text-white mb-1">{action.title}</h3>
                    <p className="text-sm text-purple-300">{action.description}</p>
                  </motion.button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}