import { Shield, Users, Award, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';

interface LandingPageProps {
  onUserLogin: () => void;
  onOrganizerLogin: () => void;
}

export default function LandingPage({ onUserLogin, onOrganizerLogin }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          {/* Logo/Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Shield className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
            Proof of Presence
          </h1>

          {/* Tagline */}
          <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Immutable badges for real experiences. Create, distribute, and collect digital proof of attendance with trust and authenticity.
          </p>

          {/* Role Selection */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Button
              onClick={onUserLogin}
              className="primary-button px-8 py-4 text-lg min-w-[200px] group"
            >
              <Users className="w-5 h-5 mr-3" />
              Login as User
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>

            <Button
              onClick={onOrganizerLogin}
              className="accent-button px-8 py-4 text-lg min-w-[200px] group"
            >
              <Award className="w-5 h-5 mr-3" />
              Login as Organizer
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-20">
            <div className="professional-card p-8 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Secure & Immutable</h3>
              <p className="text-slate-600">
                Every badge is cryptographically secured and permanently recorded, ensuring authenticity and preventing fraud.
              </p>
            </div>

            <div className="professional-card p-8 text-center">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Easy to Use</h3>
              <p className="text-slate-600">
                Simple QR code scanning for attendees and intuitive event management tools for organizers.
              </p>
            </div>

            <div className="professional-card p-8 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Award className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Digital Collectibles</h3>
              <p className="text-slate-600">
                Build your collection of meaningful experiences with beautiful, verified digital badges.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}