import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Plus, 
  Calendar, 
  Users, 
  Trophy, 
  BarChart3, 
  QrCode, 
  Eye,
  Sparkles,
  TrendingUp,
  Award,
  Clock
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import CreateEventPage from './CreateEventPage';

interface OrganizerDashboardProps {
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

interface Event {
  id: string;
  name: string;
  date: string;
  location: string;
  totalClaims: number;
  maxClaims: number;
  status: 'upcoming' | 'active' | 'ended';
  qrCode: string;
}

const mockEvents: Event[] = [
  {
    id: '1',
    name: 'TechConf 2024',
    date: '2024-03-15',
    location: 'San Francisco, CA',
    totalClaims: 847,
    maxClaims: 1000,
    status: 'active',
    qrCode: 'poap://claim/techconf2024'
  },
  {
    id: '2',
    name: 'Design Workshop',
    date: '2024-02-28',
    location: 'Virtual Event',
    totalClaims: 234,
    maxClaims: 300,
    status: 'ended',
    qrCode: 'poap://claim/designworkshop'
  },
  {
    id: '3',
    name: 'Community Meetup',
    date: '2024-04-10',
    location: 'New York, NY',
    totalClaims: 0,
    maxClaims: 150,
    status: 'upcoming',
    qrCode: 'poap://claim/communitymeetup'
  }
];

export default function OrganizerDashboard({ user, onToast }: OrganizerDashboardProps) {
  const [currentView, setCurrentView] = useState<'dashboard' | 'create-event'>('dashboard');
  const [events] = useState<Event[]>(mockEvents);

  const stats = {
    totalEvents: events.length,
    totalClaims: events.reduce((sum, event) => sum + event.totalClaims, 0),
    activeEvents: events.filter(e => e.status === 'active').length,
    avgClaimRate: Math.round(
      events.reduce((sum, event) => sum + (event.totalClaims / event.maxClaims) * 100, 0) / events.length
    )
  };

  if (currentView === 'create-event') {
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
        <CreateEventPage onToast={onToast} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div 
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-3xl font-bold mb-2">Organizer Dashboard</h1>
          <p className="text-purple-300">Welcome back, {user.name}!</p>
        </div>
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={() => setCurrentView('create-event')}
            className="glow-button px-6 py-3 text-lg rounded-xl"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Event
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
            title: 'Total Events',
            value: stats.totalEvents,
            icon: Calendar,
            color: 'from-blue-400 to-blue-600',
            suffix: ''
          },
          {
            title: 'Total Claims',
            value: stats.totalClaims,
            icon: Trophy,
            color: 'from-purple-400 to-purple-600',
            suffix: ''
          },
          {
            title: 'Active Events',
            value: stats.activeEvents,
            icon: Users,
            color: 'from-green-400 to-green-600',
            suffix: ''
          },
          {
            title: 'Avg Claim Rate',
            value: stats.avgClaimRate,
            icon: TrendingUp,
            color: 'from-pink-400 to-pink-600',
            suffix: '%'
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
                      <p className="text-2xl font-bold text-white">
                        {stat.value}{stat.suffix}
                      </p>
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

      {/* Recent Events */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="glass-card border-purple-400/30">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              <span>Your Events</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                className="glass-card rounded-xl p-4 hover:bg-white/5 transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-bold text-white">{event.name}</h3>
                      <span className={`
                        px-2 py-1 rounded-full text-xs font-medium
                        ${event.status === 'active' 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                          : event.status === 'upcoming'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                        }
                      `}>
                        {event.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 mt-2 text-sm text-purple-300">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-3 h-3" />
                        <span>{event.totalClaims}/{event.maxClaims} claimed</span>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="w-full bg-purple-900/30 rounded-full h-2">
                        <motion.div
                          className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${(event.totalClaims / event.maxClaims) * 100}%` }}
                          transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      className="glass-card border-purple-400/30 text-purple-200 hover:text-white"
                    >
                      <QrCode className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      className="glass-card border-purple-400/30 text-purple-200 hover:text-white"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
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
                  title: 'Create Event',
                  description: 'Set up a new POAP event',
                  icon: Plus,
                  action: () => setCurrentView('create-event')
                },
                {
                  title: 'View Analytics',
                  description: 'Check event performance',
                  icon: BarChart3,
                  action: () => {}
                },
                {
                  title: 'Manage POAPs',
                  description: 'Edit existing events',
                  icon: Award,
                  action: () => {}
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