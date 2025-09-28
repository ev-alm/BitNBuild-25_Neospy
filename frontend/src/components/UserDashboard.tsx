import { useState } from 'react';
import { Award, Calendar, MapPin, Users, Search, Filter, Grid, List, Sparkles, Trophy, Star } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import BadgeCard from './BadgeCard';
import ClaimPage from './ClaimPage';
import CollectionPage from './CollectionPage';

interface UserDashboardProps {
  user: {
    name: string;
    email: string;
    avatar: string;
    role: 'organizer' | 'user';
    walletBalance: string;
    walletAddress: string;
  };
  onToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

interface Badge {
  id: string;
  title: string;
  description: string;
  image: string;
  eventDate: string;
  location: string;
  organizer: string;
  claimedDate?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export default function UserDashboard({ user, onToast }: UserDashboardProps) {
  const [activeTab, setActiveTab] = useState<'discover' | 'collection' | 'claim'>('discover');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRarity, setFilterRarity] = useState<string>('all');

  // Mock data for available badges
  const availableBadges: Badge[] = [
    {
      id: '1',
      title: 'Tech Summit 2024',
      description: 'Annual technology conference bringing together industry leaders',
      image: 'https://images.unsplash.com/photo-1750326562849-5bd94ed444e1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwY29sbGVjdGlvbiUyMGdhbGxlcnklMjBpbnRlcmZhY2V8ZW58MXx8fHwxNzU5MDI4MTkwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      eventDate: '2024-03-15',
      location: 'San Francisco, CA',
      organizer: 'TechCorp',
      rarity: 'epic'
    },
    {
      id: '2',
      title: 'Web3 Workshop',
      description: 'Hands-on workshop about blockchain development',
      image: 'https://images.unsplash.com/photo-1645839078449-124db8a049fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibG9ja2NoYWluJTIwdGVjaG5vbG9neSUyMG5ldHdvcmt8ZW58MXx8fHwxNzU5MDI4MDIyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      eventDate: '2024-02-20',
      location: 'Online',
      organizer: 'BlockchainED',
      rarity: 'rare'
    },
    {
      id: '3',
      title: 'Design Thinking Bootcamp',
      description: 'Intensive 3-day design thinking workshop',
      image: 'https://images.unsplash.com/photo-1613826488249-b67eba609bed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwYmFkZ2UlMjBjb2xsZWN0aWJsZSUyMG1lZGFsfGVufDF8fHx8MTc1OTAyODAxOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      eventDate: '2024-01-10',
      location: 'New York, NY',
      organizer: 'Design Studio',
      rarity: 'common'
    }
  ];

  // Mock user's collected badges
  const collectedBadges: Badge[] = [
    {
      ...availableBadges[0],
      claimedDate: '2024-03-15'
    }
  ];

  const filteredBadges = availableBadges.filter(badge => {
    const matchesSearch = badge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         badge.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRarity = filterRarity === 'all' || badge.rarity === filterRarity;
    return matchesSearch && matchesRarity;
  });

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'from-yellow-400 to-orange-500';
      case 'epic': return 'from-purple-400 to-pink-500';
      case 'rare': return 'from-blue-400 to-cyan-500';
      default: return 'from-slate-400 to-slate-500';
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return <Trophy className="w-4 h-4" />;
      case 'epic': return <Star className="w-4 h-4" />;
      case 'rare': return <Sparkles className="w-4 h-4" />;
      default: return <Award className="w-4 h-4" />;
    }
  };

  if (activeTab === 'claim') {
    return <ClaimPage onBack={() => setActiveTab('discover')} onToast={onToast} />;
  }

  if (activeTab === 'collection') {
    return <CollectionPage badges={collectedBadges} onBack={() => setActiveTab('discover')} />;
  }

  return (
    <div className="space-y-8 relative">
      {/* Hero Section */}
      <div className="relative">
        <div className="glass-card rounded-3xl p-8 bg-gradient-to-br from-blue-50/50 to-cyan-50/50">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="flex items-center space-x-6 mb-6 lg:mb-0">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-white shadow-xl">
                  <ImageWithFallback
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center border-2 border-white">
                  <Award className="w-4 h-4 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">
                  Welcome back, {user.name}!
                </h1>
                <p className="text-slate-600 mb-3">Ready to discover new badges?</p>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="flex items-center space-x-1 text-blue-600">
                    <Award className="w-4 h-4" />
                    <span>{collectedBadges.length} Badges Collected</span>
                  </span>
                  <span className="flex items-center space-x-1 text-green-600">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>Active Member</span>
                  </span>
                </div>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="flex space-x-3">
              <button
                onClick={() => setActiveTab('claim')}
                className="gradient-button flex items-center space-x-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Claim Badge</span>
              </button>
              <button
                onClick={() => setActiveTab('collection')}
                className="gradient-button-secondary flex items-center space-x-2"
              >
                <Grid className="w-4 h-4" />
                <span>My Collection</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card rounded-2xl p-6 slide-in-bottom stagger-1">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900">{collectedBadges.length}</span>
          </div>
          <h3 className="font-semibold text-slate-900 mb-1">Total Badges</h3>
          <p className="text-sm text-slate-600">Digital collectibles earned</p>
        </div>

        <div className="glass-card rounded-2xl p-6 slide-in-bottom stagger-2">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900">12</span>
          </div>
          <h3 className="font-semibold text-slate-900 mb-1">Events Attended</h3>
          <p className="text-sm text-slate-600">This year</p>
        </div>

        <div className="glass-card rounded-2xl p-6 slide-in-bottom stagger-3">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900">2</span>
          </div>
          <h3 className="font-semibold text-slate-900 mb-1">Rare Badges</h3>
          <p className="text-sm text-slate-600">Exclusive collectibles</p>
        </div>
      </div>

      {/* Filter and Search Section */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Discover Badges</h2>
            <p className="text-slate-600">Find and claim badges from events you've attended</p>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search badges..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 w-full sm:w-64 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Rarity Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={filterRarity}
                onChange={(e) => setFilterRarity(e.target.value)}
                className="pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="all">All Rarities</option>
                <option value="common">Common</option>
                <option value="rare">Rare</option>
                <option value="epic">Epic</option>
                <option value="legendary">Legendary</option>
              </select>
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-600'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-600'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className={`${
        viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
          : 'space-y-4'
      }`}>
        {filteredBadges.map((badge, index) => (
          <div
            key={badge.id}
            className={`glass-card rounded-2xl overflow-hidden badge-glow slide-in-bottom group ${
              viewMode === 'list' ? 'flex items-center p-6 space-x-6' : 'p-0'
            }`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {viewMode === 'grid' ? (
              <>
                <div className="relative h-48 overflow-hidden">
                  <ImageWithFallback
                    src={badge.image}
                    alt={badge.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  
                  {/* Rarity Badge */}
                  <div className={`absolute top-3 right-3 px-2 py-1 rounded-full bg-gradient-to-r ${getRarityColor(badge.rarity)} text-white text-xs font-medium flex items-center space-x-1`}>
                    {getRarityIcon(badge.rarity)}
                    <span className="capitalize">{badge.rarity}</span>
                  </div>
                  
                  {/* Event Date */}
                  <div className="absolute bottom-3 left-3 flex items-center space-x-1 text-white text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(badge.eventDate).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {badge.title}
                  </h3>
                  <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                    {badge.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-1 text-slate-500 text-sm">
                      <MapPin className="w-4 h-4" />
                      <span>{badge.location}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-slate-500 text-sm">
                      <Users className="w-4 h-4" />
                      <span>{badge.organizer}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      setActiveTab('claim');
                      onToast('Badge claim process started!', 'info');
                    }}
                    className="w-full gradient-button py-2 text-sm"
                  >
                    Claim Badge
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                  <ImageWithFallback
                    src={badge.image}
                    alt={badge.title}
                    className="w-full h-full object-cover"
                  />
                  <div className={`absolute top-1 right-1 w-5 h-5 rounded-full bg-gradient-to-r ${getRarityColor(badge.rarity)} flex items-center justify-center`}>
                    <div className="text-white text-xs">
                      {getRarityIcon(badge.rarity)}
                    </div>
                  </div>
                </div>
                
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 mb-1">{badge.title}</h3>
                  <p className="text-slate-600 text-sm mb-2">{badge.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-slate-500">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(badge.eventDate).toLocaleDateString()}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3" />
                      <span>{badge.location}</span>
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    setActiveTab('claim');
                    onToast('Badge claim process started!', 'info');
                  }}
                  className="gradient-button px-6 py-2 text-sm flex-shrink-0"
                >
                  Claim
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      {filteredBadges.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gradient-to-br from-slate-300 to-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No badges found</h3>
          <p className="text-slate-600">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
}