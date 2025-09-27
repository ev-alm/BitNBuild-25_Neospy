import { useState } from 'react';
import { motion } from 'motion/react';
import { Trophy, Filter, Search, Calendar, MapPin, Star, Grid3X3, List } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import BadgeCard from './BadgeCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

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
  },
  {
    id: '4',
    name: 'Sports Championship',
    event: 'City Basketball Finals',
    date: 'December 15, 2023',
    location: 'Los Angeles, CA',
    attendees: 15000,
    rarity: 'common' as const,
    image: 'https://images.unsplash.com/photo-1686947079063-f1e7a7dfc6a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydHMlMjBldmVudCUyMHN0YWRpdW18ZW58MXx8fHwxNzU4OTczMjUzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    description: 'Witnessed an incredible championship game.'
  },
  {
    id: '5',
    name: 'Digital Awards Ceremony',
    event: 'Web3 Innovation Awards',
    date: 'November 10, 2023',
    location: 'Virtual Event',
    attendees: 2341,
    rarity: 'rare' as const,
    image: 'https://images.unsplash.com/photo-1628584824791-30d512161601?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwYmFkZ2UlMjB0cm9waHklMjBhd2FyZHxlbnwxfHx8fDE3NTg5NzMxNjN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    description: 'Celebrating innovation in the Web3 space.'
  },
  {
    id: '6',
    name: 'Community Meetup',
    event: 'Local Developer Meetup #42',
    date: 'October 5, 2023',
    location: 'Austin, TX',
    attendees: 89,
    rarity: 'epic' as const,
    image: 'https://images.unsplash.com/photo-1560439514-0fc9d2cd5e1b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNoJTIwY29uZmVyZW5jZSUyMG1lZXR1cHxlbnwxfHx8fDE3NTg5NzMxNjV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    description: 'Monthly gathering of passionate developers.'
  }
];

export default function CollectionPage() {
  const [badges, setBadges] = useState(mockBadges);
  const [selectedBadge, setSelectedBadge] = useState<typeof mockBadges[0] | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [filterRarity, setFilterRarity] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter and sort badges
  const filteredBadges = badges
    .filter(badge => 
      badge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      badge.event.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(badge => 
      filterRarity === 'all' || badge.rarity === filterRarity
    )
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'rarity') {
        const rarityOrder = { legendary: 4, epic: 3, rare: 2, common: 1 };
        return rarityOrder[b.rarity] - rarityOrder[a.rarity];
      }
      return a.name.localeCompare(b.name);
    });

  const rarityStats = {
    total: badges.length,
    legendary: badges.filter(b => b.rarity === 'legendary').length,
    epic: badges.filter(b => b.rarity === 'epic').length,
    rare: badges.filter(b => b.rarity === 'rare').length,
    common: badges.filter(b => b.rarity === 'common').length,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div 
        className="text-center space-y-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-center space-x-3">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Trophy className="w-12 h-12 text-yellow-400" />
          </motion.div>
          <h1 className="text-4xl font-bold">My POAP Collection</h1>
        </div>
        
        <p className="text-purple-300 max-w-2xl mx-auto">
          Your digital trophy case of memorable experiences and events you've attended.
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div 
        className="grid grid-cols-2 md:grid-cols-5 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {Object.entries(rarityStats).map(([key, value]) => (
          <div key={key} className="glass-card rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-sm text-purple-300 capitalize">
              {key === 'total' ? 'Total Badges' : key}
            </div>
          </div>
        ))}
      </motion.div>

      {/* Controls */}
      <motion.div 
        className="glass-card rounded-2xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-400" />
            <Input
              placeholder="Search badges..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 glass-card border-purple-400/30 text-white placeholder:text-purple-300/50"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40 glass-card border-purple-400/30 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-card border-purple-400/30 bg-purple-900/90">
                <SelectItem value="date">Sort by Date</SelectItem>
                <SelectItem value="rarity">Sort by Rarity</SelectItem>
                <SelectItem value="name">Sort by Name</SelectItem>
              </SelectContent>
            </Select>

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

            {/* View Mode Toggle */}
            <div className="flex glass-card rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' ? 'glow-button' : 'text-purple-300'}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'glow-button' : 'text-purple-300'}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Badge Grid/List */}
      <motion.div 
        className={`
          ${viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
            : 'space-y-4'
          }
        `}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {filteredBadges.map((badge, index) => (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
          >
            {viewMode === 'grid' ? (
              <BadgeCard
                badge={badge}
                onClick={() => setSelectedBadge(badge)}
              />
            ) : (
              <div 
                className="glass-card rounded-2xl p-4 flex items-center space-x-4 cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => setSelectedBadge(badge)}
              >
                <img
                  src={badge.image}
                  alt={badge.name}
                  className="w-16 h-16 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-white">{badge.name}</h3>
                  <p className="text-sm text-purple-300">{badge.event}</p>
                  <div className="flex items-center space-x-4 text-xs text-purple-400 mt-1">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{badge.date}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3" />
                      <span>{badge.location}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1 text-yellow-400">
                  <Star className="w-4 h-4" />
                  <span className="text-sm capitalize">{badge.rarity}</span>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* Empty State */}
      {filteredBadges.length === 0 && (
        <motion.div 
          className="text-center py-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Trophy className="w-16 h-16 mx-auto text-purple-400 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No badges found</h3>
          <p className="text-purple-300">Try adjusting your search or filters.</p>
        </motion.div>
      )}

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