import { Calendar, MapPin, Users } from 'lucide-react';
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

export default function BadgeCard({ badge, size = 'medium', showDetails = false, onClick }: BadgeCardProps) {
  const isLarge = size === 'large';
  const isMedium = size === 'medium';
  
  return (
    <div
      className={`
        relative group cursor-pointer
        ${isLarge ? 'w-80 h-96' : isMedium ? 'w-64 h-80' : 'w-48 h-60'}
      `}
      onClick={onClick}
    >
      {/* Card Container */}
      <div 
        className="relative w-full h-full badge-card border border-slate-200 hover:shadow-md transition-shadow"
      >
        {/* Event Type Badge */}
        <div className="absolute top-3 right-3 z-20">
          <div className="px-3 py-1 rounded-full text-xs font-medium text-slate-700 bg-white/90 shadow-sm border border-slate-200">
            POAP
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
            <div className="space-y-2 text-xs text-slate-500">
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
            </div>
          )}

          {/* Simple Progress Bar for Collection */}
          {!showDetails && (
            <div className="w-full bg-slate-200 rounded-full h-1">
              <div 
                className="h-1 rounded-full bg-blue-600"
                style={{ width: '100%' }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}