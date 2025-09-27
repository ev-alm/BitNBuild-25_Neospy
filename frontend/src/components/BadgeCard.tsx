import { motion } from 'motion/react';
import { Calendar, MapPin, Users, Star } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Badge {
  id: string;
  name: string;
  event: string;
  date: string;
  location: string;
  attendees: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  image: string;
}

interface BadgeCardProps {
  badge: Badge;
  size?: 'small' | 'medium' | 'large';
  showDetails?: boolean;
  onClick?: () => void;
}

const rarityColors = {
  common: 'from-slate-400 to-slate-500',
  rare: 'from-blue-500 to-blue-600',
  epic: 'from-purple-500 to-purple-600',
  legendary: 'from-yellow-500 to-yellow-600'
};

const rarityBorder = {
  common: 'border-slate-300',
  rare: 'border-blue-300',
  epic: 'border-purple-300',
  legendary: 'border-yellow-300'
};

export default function BadgeCard({ badge, size = 'medium', showDetails = false, onClick }: BadgeCardProps) {
  const isLarge = size === 'large';
  const isMedium = size === 'medium';
  
  return (
    <motion.div
      className={`
        relative group cursor-pointer
        ${isLarge ? 'w-80 h-96' : isMedium ? 'w-64 h-80' : 'w-48 h-60'}
      `}
      onClick={onClick}
      whileHover={{ 
        scale: 1.02,
        y: -4
      }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Card Container */}
      <div 
        className={`
          relative w-full h-full badge-card
          ${rarityBorder[badge.rarity]}
          border-2
        `}
      >
        {/* Rarity Badge */}
        <div className="absolute top-3 right-3 z-20">
          <div 
            className={`
              px-3 py-1 rounded-full text-xs font-semibold text-white
              bg-gradient-to-r ${rarityColors[badge.rarity]}
              flex items-center space-x-1
              shadow-sm
            `}
          >
            <Star className="w-3 h-3" />
            <span className="capitalize">{badge.rarity}</span>
          </div>
        </div>

        {/* Badge Image */}
        <div className={`relative ${isLarge ? 'h-48' : isMedium ? 'h-40' : 'h-32'} overflow-hidden`}>
          <ImageWithFallback
            src={badge.image}
            alt={badge.name}
            className="w-full h-full object-cover"
          />
          
          {/* Subtle Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className={`font-bold text-slate-900 ${isLarge ? 'text-lg' : 'text-base'} leading-tight`}>
              {badge.name}
            </h3>
            
            <p className="text-slate-600 text-sm mt-1">
              {badge.event}
            </p>
          </div>

          {showDetails && (
            <motion.div 
              className="space-y-2 text-xs text-slate-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center space-x-2">
                <Calendar className="w-3 h-3" />
                <span>{new Date(badge.date).toLocaleDateString()}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <MapPin className="w-3 h-3" />
                <span>{badge.location}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Users className="w-3 h-3" />
                <span>{badge.attendees.toLocaleString()} attendees</span>
              </div>
            </motion.div>
          )}

          {/* Simple Progress Bar for Collection */}
          {!showDetails && (
            <div className="w-full bg-slate-200 rounded-full h-1">
              <div 
                className={`h-1 rounded-full bg-gradient-to-r ${rarityColors[badge.rarity]}`}
                style={{ width: '100%' }}
              />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}