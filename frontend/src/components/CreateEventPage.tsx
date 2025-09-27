import { useState } from 'react';
import { motion } from 'motion/react';
import { Upload, QrCode, Eye, Sparkles, Calendar, MapPin, FileText, ImageIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import BadgeCard from './BadgeCard';

interface CreateEventPageProps {
  onToast: (toast: { title: string; description?: string; type: 'success' | 'error' | 'info' }) => void;
}

export default function CreateEventPage({ onToast }: CreateEventPageProps) {
  const [eventData, setEventData] = useState({
    name: '',
    date: '',
    location: '',
    description: '',
    badgeImage: ''
  });

  const [previewBadge, setPreviewBadge] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setEventData(prev => ({ ...prev, badgeImage: imageUrl }));
    }
  };

  const generateQRCode = () => {
    // Mock QR code generation
    const qrData = `poap://claim/${Date.now()}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;
  };

  const mockBadge = {
    id: 'preview',
    name: eventData.name || 'Your Event Badge',
    event: eventData.name || 'Preview Event',
    date: eventData.date || 'TBD',
    location: eventData.location || 'TBD',
    attendees: 0,
    rarity: 'epic' as const,
    image: eventData.badgeImage || 'https://images.unsplash.com/photo-1628584824791-30d512161601?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwYmFkZ2UlMjB0cm9waHklMjBhd2FyZHxlbnwxfHx8fDE3NTg5NzMxNjN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div 
        className="text-center space-y-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold">Create Event Badge</h1>
        <p className="text-purple-300 max-w-2xl mx-auto">
          Design a unique POAP badge for your event. Attendees will be able to claim this digital collectible as proof of their presence.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="glass-card rounded-3xl p-8 space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <Sparkles className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-bold text-white">Event Details</h2>
            </div>

            {/* Event Name */}
            <div className="space-y-2">
              <Label className="flex items-center space-x-2 text-purple-200">
                <FileText className="w-4 h-4" />
                <span>Event Name</span>
              </Label>
              <Input
                placeholder="e.g., DevCon 2024, Art Gallery Opening"
                value={eventData.name}
                onChange={(e) => setEventData(prev => ({ ...prev, name: e.target.value }))}
                className="glass-card border-purple-400/30 text-white placeholder:text-purple-300/50"
              />
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label className="flex items-center space-x-2 text-purple-200">
                <Calendar className="w-4 h-4" />
                <span>Event Date</span>
              </Label>
              <Input
                type="datetime-local"
                value={eventData.date}
                onChange={(e) => setEventData(prev => ({ ...prev, date: e.target.value }))}
                className="glass-card border-purple-400/30 text-white"
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label className="flex items-center space-x-2 text-purple-200">
                <MapPin className="w-4 h-4" />
                <span>Location</span>
              </Label>
              <Input
                placeholder="e.g., San Francisco, CA or Virtual Event"
                value={eventData.location}
                onChange={(e) => setEventData(prev => ({ ...prev, location: e.target.value }))}
                className="glass-card border-purple-400/30 text-white placeholder:text-purple-300/50"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-purple-200">Event Description</Label>
              <Textarea
                placeholder="Describe your event and what makes it special..."
                value={eventData.description}
                onChange={(e) => setEventData(prev => ({ ...prev, description: e.target.value }))}
                className="glass-card border-purple-400/30 text-white placeholder:text-purple-300/50 min-h-[100px]"
              />
            </div>

            {/* Badge Image Upload */}
            <div className="space-y-2">
              <Label className="flex items-center space-x-2 text-purple-200">
                <ImageIcon className="w-4 h-4" />
                <span>Badge Artwork</span>
              </Label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="badge-upload"
                />
                <label
                  htmlFor="badge-upload"
                  className="flex items-center justify-center w-full h-24 glass-card border-2 border-dashed border-purple-400/30 rounded-xl cursor-pointer hover:border-purple-400/50 transition-colors"
                >
                  <div className="text-center">
                    <Upload className="w-6 h-6 mx-auto mb-2 text-purple-400" />
                    <p className="text-sm text-purple-300">
                      {eventData.badgeImage ? 'Change Image' : 'Upload Badge Image'}
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-4 pt-4">
              <Button
                onClick={() => setPreviewBadge(!previewBadge)}
                variant="outline"
                className="flex-1 glass-card border-purple-400/30 text-purple-200 hover:text-white"
              >
                <Eye className="w-4 h-4 mr-2" />
                {previewBadge ? 'Hide Preview' : 'Preview Badge'}
              </Button>
              
              <Button 
                className="flex-1 glow-button"
                onClick={() => {
                  onToast({
                    title: '🎉 Event Created Successfully!',
                    description: `${eventData.name || 'Your event'} is ready for attendees`,
                    type: 'success'
                  });
                }}
              >
                Create Event
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Preview Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Badge Preview */}
          {previewBadge && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex justify-center"
            >
              <BadgeCard 
                badge={mockBadge} 
                size="large" 
                showDetails={true}
              />
            </motion.div>
          )}

          {/* QR Code Section */}
          <div className="glass-card rounded-3xl p-8 text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <QrCode className="w-6 h-6 text-purple-400" />
              <h3 className="text-xl font-bold text-white">Claim QR Code</h3>
            </div>
            
            <div className="relative inline-block">
              <motion.div
                className="glass-card p-4 rounded-2xl inline-block"
                animate={{ 
                  boxShadow: [
                    '0 0 20px rgba(139, 92, 246, 0.3)',
                    '0 0 40px rgba(139, 92, 246, 0.5)',
                    '0 0 20px rgba(139, 92, 246, 0.3)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <img
                  src={generateQRCode()}
                  alt="POAP Claim QR Code"
                  className="w-48 h-48 rounded-xl"
                />
              </motion.div>
              
              {/* Holographic Effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-2xl"
                animate={{ 
                  opacity: [0.3, 0.6, 0.3],
                  scale: [1, 1.05, 1]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </div>
            
            <p className="text-purple-300 mt-4 text-sm">
              Attendees scan this code to claim their POAP badge
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}