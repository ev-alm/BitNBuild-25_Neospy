import { Shield, Zap, Users, Award, ArrowRight, Sparkles } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface LandingPageProps {
  onUserLogin: () => void;
  onOrganizerLogin: () => void;
}

export default function LandingPage({ onUserLogin, onOrganizerLogin }: LandingPageProps) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Floating Particles Background */}
      <div className="floating-particles"></div>
      
      {/* Main Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="relative px-6 py-20 lg:px-8">
          <div className="mx-auto max-w-7xl">
            {/* Navigation */}
            <nav className="flex items-center justify-between mb-16">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  POAP
                </span>
              </div>
              <div className="glass-card rounded-xl px-1 py-1">
                <div className="flex space-x-1">
                  <button 
                    onClick={onUserLogin}
                    className="px-4 py-2 text-slate-600 hover:text-blue-600 transition-colors duration-200 rounded-lg hover:bg-white/50"
                  >
                    Sign In
                  </button>
                  <button 
                    onClick={onOrganizerLogin}
                    className="gradient-button text-sm"
                  >
                    For Organizers
                  </button>
                </div>
              </div>
            </nav>

            {/* Hero Content */}
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="slide-in-bottom">
                <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-full border border-blue-200/50 mb-8">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">Proof of Presence Protocol</span>
                </div>
                
                <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
                  Digital Badges for{' '}
                  <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
                    Real Events
                  </span>
                </h1>
                
                <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                  Create, distribute, and collect verifiable digital badges that prove attendance 
                  at events. Build trust and engagement with blockchain-verified credentials.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={onUserLogin}
                    className="gradient-button flex items-center justify-center space-x-2 text-lg stagger-1"
                  >
                    <span>Start Collecting</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={onOrganizerLogin}
                    className="gradient-button-secondary flex items-center justify-center space-x-2 text-lg stagger-2"
                  >
                    <span>Create Events</span>
                    <Users className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Stats */}
                <div className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-slate-200/50">
                  <div className="text-center slide-in-bottom stagger-1">
                    <div className="text-2xl font-bold text-slate-900">10K+</div>
                    <div className="text-sm text-slate-600">Events Created</div>
                  </div>
                  <div className="text-center slide-in-bottom stagger-2">
                    <div className="text-2xl font-bold text-slate-900">150K+</div>
                    <div className="text-sm text-slate-600">Badges Claimed</div>
                  </div>
                  <div className="text-center slide-in-bottom stagger-3">
                    <div className="text-2xl font-bold text-slate-900">5K+</div>
                    <div className="text-sm text-slate-600">Organizations</div>
                  </div>
                </div>
              </div>
              
              {/* Hero Image */}
              <div className="relative slide-in-right">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-cyan-500/20 rounded-3xl transform rotate-3"></div>
                  <div className="relative glass-card rounded-3xl p-8 transform -rotate-1 hover:rotate-0 transition-transform duration-500">
                    <ImageWithFallback
                      src="https://images.unsplash.com/photo-1613826488249-b67eba609bed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwYmFkZ2UlMjBjb2xsZWN0aWJsZSUyMG1lZGFsfGVufDF8fHx8MTc1OTAyODAxOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                      alt="Digital Badge Collection"
                      className="w-full h-80 object-cover rounded-2xl"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
                  </div>
                  
                  {/* Floating Badge Elements */}
                  <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center transform rotate-12 animate-bounce">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-br from-teal-500 to-green-500 rounded-xl flex items-center justify-center transform -rotate-12 animate-pulse">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-6 py-24 lg:px-8 bg-gradient-to-b from-transparent to-blue-50/50">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
                Why Choose Our Platform?
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Experience the future of event verification with blockchain-powered digital badges
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="glass-card rounded-2xl p-8 text-center group slide-in-bottom stagger-1">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">Blockchain Verified</h3>
                <p className="text-slate-600">
                  Every badge is secured on the blockchain, ensuring authenticity and preventing fraud
                </p>
              </div>
              
              <div className="glass-card rounded-2xl p-8 text-center group slide-in-bottom stagger-2">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">Instant Distribution</h3>
                <p className="text-slate-600">
                  Create and distribute badges instantly with our streamlined event management system
                </p>
              </div>
              
              <div className="glass-card rounded-2xl p-8 text-center group slide-in-bottom stagger-3">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">Community Building</h3>
                <p className="text-slate-600">
                  Foster engagement and build communities around your events with collectible badges
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 py-24 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="glass-card rounded-3xl p-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-slate-600 mb-8">
                Join thousands of organizations already using POAP to enhance their events
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={onUserLogin}
                  className="gradient-button text-lg px-8 py-4"
                >
                  Claim Your First Badge
                </button>
                <button 
                  onClick={onOrganizerLogin}
                  className="gradient-button-secondary text-lg px-8 py-4"
                >
                  Create an Event
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}