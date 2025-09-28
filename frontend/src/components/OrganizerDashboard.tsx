import { useState } from 'react';
import { Plus, Calendar, Users, Award, TrendingUp, Eye, Edit3, MoreHorizontal, MapPin, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import CreateEventPage from './CreateEventPage';

interface OrganizerDashboardProps {
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

interface Event {
  id: string;
  title: string;
  description: string;
  image: string;
  date: string;
  location: string;
  totalClaims: number;
  maxClaims: number;
  status: 'active' | 'upcoming' | 'completed';
  badgeDesign: string;
}

export default function OrganizerDashboard({ user, onToast }: OrganizerDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'create'>('overview');

  // Mock events data
  const events: Event[] = [
    {
      id: '1',
      title: 'Tech Innovation Summit 2024',
      description: 'Annual technology conference bringing together industry leaders and innovators',
      image: 'https://images.unsplash.com/photo-1517857612127-f33b2b246bd6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxldmVudCUyMG1hbmFnZW1lbnQlMjBkYXNoYm9hcmQlMjBpbnRlcmZhY2V8ZW58MXx8fHwxNzU5MDI4MjU1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      date: '2024-04-15',
      location: 'San Francisco, CA',
      totalClaims: 245,
      maxClaims: 500,
      status: 'active',
      badgeDesign: 'https://images.unsplash.com/photo-1613826488249-b67eba609bed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHhkaWdpdGFsJTIwYmFkZ2UlMjBjb2xsZWN0aWJsZSUyMG1lZGFsfGVufDF8fHx8MTc1OTAyODAxOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    },
    {
      id: '2',
      title: 'Web3 Developer Workshop',
      description: 'Hands-on workshop for blockchain development fundamentals',
      image: 'https://images.unsplash.com/photo-1645839078449-124db8a049fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibG9ja2NoYWluJTIwdGVjaG5vbG9neSUyMG5ldHdvcmt8ZW58MXx8fHwxNzU5MDI4MDIyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      date: '2024-05-20',
      location: 'Online',
      totalClaims: 0,
      maxClaims: 100,
      status: 'upcoming',
      badgeDesign: 'https://images.unsplash.com/photo-1613826488249-b67eba609bed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHhkaWdpdGFsJTIwYmFkZ2UlMjBjb2xsZWN0aWJsZSUyMG1lZGFsfGVufDF8fHx8MTc1OTAyODAxOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    },
    {
      id: '3',
      title: 'Design Thinking Bootcamp',
      description: 'Intensive 3-day design thinking and UX workshop',
      image: 'https://images.unsplash.com/photo-1758525588803-fc7dc8096ba1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBidXNpbmVzcyUyMHRlY2hub2xvZ3klMjBiYWNrZ3JvdW5kfGVufDF8fHx8MTc1OTAyODAxN3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      date: '2024-03-10',
      location: 'New York, NY',
      totalClaims: 85,
      maxClaims: 85,
      status: 'completed',
      badgeDesign: 'https://images.unsplash.com/photo-1613826488249-b67eba609bed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHhkaWdpdGFsJTIwYmFkZ2UlMjBjb2xsZWN0aWJsZSUyMG1lZGFsfGVufDF8fHx8MTc1OTAyODAxOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'from-green-500 to-emerald-500';
      case 'upcoming': return 'from-blue-500 to-cyan-500';
      case 'completed': return 'from-slate-500 to-slate-600';
      default: return 'from-slate-400 to-slate-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'upcoming': return <Clock className="w-4 h-4" />;
      case 'completed': return <Award className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (activeTab === 'create') {
    return <CreateEventPage onBack={() => setActiveTab('events')} onToast={onToast} />;
  }

  return (
    <div className="space-y-8 relative">
      {/* Hero Section */}
      <div className="glass-card rounded-3xl p-8 bg-gradient-to-br from-blue-50/50 to-purple-50/50">
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
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full flex items-center justify-center border-2 border-white">
                <Users className="w-4 h-4 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Welcome, {user.name}
              </h1>
              <p className="text-slate-600 mb-3">Manage your events and track badge distributions</p>
              <div className="flex items-center space-x-4 text-sm">
                <span className="flex items-center space-x-1 text-purple-600">
                  <Calendar className="w-4 h-4" />
                  <span>{events.length} Events Created</span>
                </span>
                <span className="flex items-center space-x-1 text-blue-600">
                  <Award className="w-4 h-4" />
                  <span>{events.reduce((sum, event) => sum + event.totalClaims, 0)} Badges Distributed</span>
                </span>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setActiveTab('create')}
            className="gradient-button flex items-center space-x-2 px-6 py-3"
          >
            <Plus className="w-5 h-5" />
            <span>Create Event</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
            activeTab === 'overview'
              ? 'bg-white shadow-sm text-blue-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
            activeTab === 'events'
              ? 'bg-white shadow-sm text-blue-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Events
        </button>
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="glass-card rounded-2xl p-6 slide-in-bottom stagger-1">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-slate-900">{events.length}</span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">Total Events</h3>
              <p className="text-sm text-slate-600">Created by you</p>
            </div>

            <div className="glass-card rounded-2xl p-6 slide-in-bottom stagger-2">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-slate-900">
                  {events.filter(e => e.status === 'active').length}
                </span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">Active Events</h3>
              <p className="text-sm text-slate-600">Currently running</p>
            </div>

            <div className="glass-card rounded-2xl p-6 slide-in-bottom stagger-3">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-slate-900">
                  {events.reduce((sum, event) => sum + event.totalClaims, 0)}
                </span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">Badges Claimed</h3>
              <p className="text-sm text-slate-600">Total distributions</p>
            </div>

            <div className="glass-card rounded-2xl p-6 slide-in-bottom stagger-4">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-slate-900">
                  {Math.round((events.reduce((sum, event) => sum + event.totalClaims, 0) / 
                    events.reduce((sum, event) => sum + event.maxClaims, 0)) * 100)}%
                </span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">Claim Rate</h3>
              <p className="text-sm text-slate-600">Overall performance</p>
            </div>
          </div>

          {/* Recent Events Overview */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Recent Events</h2>
              <button
                onClick={() => setActiveTab('events')}
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                View all events
              </button>
            </div>
            
            <div className="space-y-4">
              {events.slice(0, 3).map((event, index) => (
                <div key={event.id} className="flex items-center space-x-4 p-4 bg-white/50 rounded-xl border border-slate-100 slide-in-bottom" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                    <ImageWithFallback
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 mb-1 truncate">{event.title}</h3>
                    <div className="flex items-center space-x-4 text-sm text-slate-600">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{event.location}</span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm font-medium text-slate-900 mb-1">
                      {event.totalClaims}/{event.maxClaims} claimed
                    </div>
                    <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full bg-gradient-to-r ${getStatusColor(event.status)} text-white text-xs font-medium`}>
                      {getStatusIcon(event.status)}
                      <span className="capitalize">{event.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {activeTab === 'events' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">All Events</h2>
              <p className="text-slate-600">Manage your events and track badge distributions</p>
            </div>
            <button
              onClick={() => setActiveTab('create')}
              className="gradient-button flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Event</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {events.map((event, index) => (
              <div key={event.id} className="glass-card rounded-2xl overflow-hidden badge-glow slide-in-bottom group" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="relative h-48">
                  <ImageWithFallback
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  
                  {/* Status Badge */}
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full bg-gradient-to-r ${getStatusColor(event.status)} text-white text-sm font-medium flex items-center space-x-1`}>
                    {getStatusIcon(event.status)}
                    <span className="capitalize">{event.status}</span>
                  </div>
                  
                  {/* Event Date */}
                  <div className="absolute bottom-4 left-4 flex items-center space-x-1 text-white">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {event.title}
                  </h3>
                  <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                    {event.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-1 text-slate-500 text-sm">
                      <MapPin className="w-4 h-4" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-slate-500 text-sm">
                      <Award className="w-4 h-4" />
                      <span>{event.totalClaims}/{event.maxClaims} claimed</span>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-slate-600">Claim Progress</span>
                      <span className="font-medium text-slate-900">
                        {Math.round((event.totalClaims / event.maxClaims) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(event.totalClaims / event.maxClaims) * 100}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button className="flex-1 flex items-center justify-center space-x-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-sm">
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </button>
                    <button className="flex-1 flex items-center justify-center space-x-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-sm">
                      <Edit3 className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    <button className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}