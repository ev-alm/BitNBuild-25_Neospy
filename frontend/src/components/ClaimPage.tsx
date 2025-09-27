import { useState } from 'react';
import { motion } from 'motion/react';
import { Award, CheckCircle, Clock } from 'lucide-react';
import { Button } from './ui/button';
import BadgeCard from './BadgeCard';
import ConfettiEffect from './ConfettiEffect';

interface ClaimPageProps {
  onToast: (toast: { title: string; description?: string; type: 'success' | 'error' | 'info' }) => void;
}

export default function ClaimPage({ onToast }: ClaimPageProps) {
  const [claimState, setClaimState] = useState<'idle' | 'claiming' | 'claimed'>('idle');
  const [showConfetti, setShowConfetti] = useState(false);

  // Mock event badge data
  const eventBadge = {
    id: 'devcon-2024',
    name: 'DevCon 2024 Attendee',
    event: 'DevCon 2024',
    date: '2024-03-15',
    location: 'San Francisco, CA',
    attendees: 2500,
    rarity: 'epic' as const,
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXZlbG9wZXIlMjBjb25mZXJlbmNlJTIwYmFkZ2V8ZW58MXx8fHwxNzU4OTczMTYzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  };

  const handleClaimBadge = async () => {
    setClaimState('claiming');
    
    // Simulate claiming process
    await new Promise(resolve => setTimeout(resolve, 2000));
    setClaimState('claimed');
    setShowConfetti(true);
    
    // Generate unique hash for the badge (stored silently on backend)
    const hash = `0x${Math.random().toString(16).substr(2, 64)}`;
    
    // Show success toast
    onToast({
      title: '🎉 Badge Claimed Successfully!',
      description: `You've earned the ${eventBadge.name} badge`,
      type: 'success'
    });
    
    // Hide confetti after animation
    setTimeout(() => setShowConfetti(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Award className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Claim Your Badge
          </h1>
          <p className="text-slate-600 text-lg">
            You're about to claim a proof of attendance badge
          </p>
        </motion.div>

        {/* Badge Preview */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="w-80">
            <BadgeCard 
              badge={eventBadge} 
              size="large" 
              showDetails={true}
            />
          </div>
        </motion.div>

        {/* Event Info */}
        <motion.div
          className="professional-card rounded-xl p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h3 className="text-xl font-bold text-slate-900 mb-4">Event Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-600">
            <div>
              <p className="font-medium text-slate-900">Event Name</p>
              <p>{eventBadge.event}</p>
            </div>
            <div>
              <p className="font-medium text-slate-900">Date</p>
              <p>{new Date(eventBadge.date).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="font-medium text-slate-900">Location</p>
              <p>{eventBadge.location}</p>
            </div>
            <div>
              <p className="font-medium text-slate-900">Total Attendees</p>
              <p>{eventBadge.attendees.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>

        {/* Claim Button */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {claimState === 'idle' && (
            <Button
              onClick={handleClaimBadge}
              className="primary-button px-12 py-4 text-lg font-semibold"
            >
              <Award className="w-5 h-5 mr-3" />
              Claim Badge
            </Button>
          )}

          {claimState === 'claiming' && (
            <Button
              disabled
              className="px-12 py-4 text-lg font-semibold bg-slate-400 text-white cursor-not-allowed"
            >
              <Clock className="w-5 h-5 mr-3 animate-spin" />
              Claiming Badge...
            </Button>
          )}

          {claimState === 'claimed' && (
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="professional-card rounded-xl p-6 bg-green-50 border-green-200">
                <div className="flex items-center justify-center space-x-3 text-green-800">
                  <CheckCircle className="w-8 h-8" />
                  <div>
                    <h3 className="text-xl font-bold">Badge Claimed Successfully!</h3>
                    <p className="text-green-700">
                      {eventBadge.name} has been added to your collection
                    </p>
                  </div>
                </div>
              </div>
              
              <Button
                className="accent-button px-8 py-3"
                onClick={() => window.location.reload()}
              >
                View My Collection
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Confetti Effect */}
      <ConfettiEffect isActive={showConfetti} duration={3000} particleCount={60} />
    </div>
  );
}