import { useState } from 'react';
import { 
  Plus, 
  Calendar, 
  Users, 
  Trophy, 
  QrCode, 
  Eye,
  TrendingUp
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
            className="text-slate-600 hover:text-slate-900 border-slate-200"
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Organizer Dashboard</h1>
          <p className="text-slate-600">Welcome back, {user.name}! Manage your events and track engagement.</p>
        </div>
        
        <Button
          onClick={() => setCurrentView('create-event')}
          className="bg-blue-600 hover:bg-blue-700 text-black px-6 py-3 rounded-lg shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Event
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          {
            title: 'Total Events',
            value: stats.totalEvents,
            icon: Calendar,
            color: 'bg-[#1e40af]',
            suffix: ''
          },
          {
            title: 'Total Claims',
            value: stats.totalClaims,
            icon: Trophy,
            color: 'bg-[#0f766e]',
            suffix: ''
          },
          {
            title: 'Active Events',
            value: stats.activeEvents,
            icon: Users,
            color: 'bg-[#059669]',
            suffix: ''
          },
          {
            title: 'Avg Claim Rate',
            value: stats.avgClaimRate,
            icon: TrendingUp,
            color: 'bg-[#1e40af]',
            suffix: '%'
          }
        ].map((stat) => {
          const Icon = stat.icon;
          
          return (
            <Card key={stat.title} className="professional-card border-0 shadow-sm bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {stat.value}{stat.suffix}
                    </p>
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

      {/* Recent Events */}
      <div>
        <Card className="professional-card border-0 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-slate-900">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span>Your Events</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {events.map((event) => (
              <div
                key={event.id}
                className="professional-card rounded-lg p-4 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-semibold text-slate-900">{event.name}</h3>
                      <span className={`
                        px-2 py-1 rounded-full text-xs font-medium
                        ${event.status === 'active' 
                          ? 'bg-green-100 text-green-700 border border-green-200' 
                          : event.status === 'upcoming'
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : 'bg-gray-100 text-gray-700 border border-gray-200'
                        }
                      `}>
                        {event.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 mt-2 text-sm text-slate-600">
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
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-600 to-teal-600 h-2 rounded-full transition-all duration-1000"
                          style={{ width: `${(event.totalClaims / event.maxClaims) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-slate-600 hover:text-slate-900 border-slate-200"
                    >
                      <QrCode className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-slate-600 hover:text-slate-900 border-slate-200"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="professional-card border-0 shadow-sm bg-white">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-slate-900">
            <Plus className="w-5 h-5 text-blue-600" />
            <span>Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <button
              onClick={() => setCurrentView('create-event')}
              className="professional-card rounded-lg p-6 text-left hover:shadow-md transition-all duration-200 group border border-slate-200"
            >
              <Plus className="w-8 h-8 text-blue-600 mb-3 group-hover:text-blue-700 transition-colors" />
              <h3 className="font-semibold text-slate-900 mb-1">Create Event</h3>
              <p className="text-sm text-slate-600">Set up a new POAP event</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}