import { useState } from 'react';
import { Mail, Lock, ArrowLeft, Crown, Users } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface LoginPageProps {
  onLogin: (email: string, password: string, role: 'organizer' | 'user') => void;
  onSwitchToSignUp: () => void;
  onBack: () => void;
  defaultRole: 'organizer' | 'user' | null;
}

export default function LoginPage({ onLogin, onSwitchToSignUp, onBack, defaultRole }: LoginPageProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: defaultRole || 'user' as 'organizer' | 'user'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.email.includes('@')) newErrors.email = 'Valid email is required';
    if (!formData.password) newErrors.password = 'Password is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsLoading(true);
      setErrors({});
      
      // Simulate login process
      setTimeout(() => {
        onLogin(formData.email, formData.password, formData.role);
        setIsLoading(false);
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Button
          type="button"
          onClick={onBack}
          variant="ghost"
          className="mb-6 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        {/* Welcome Text */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h1>
          <p className="text-slate-600">
            Sign in as {formData.role === 'organizer' ? 'Organizer' : 'User'}
          </p>
        </div>

        {/* Role Selector - only show if no default role */}
        {!defaultRole && (
          <div className="mb-6">
            <Label className="block text-slate-700 mb-3 text-center font-medium">Sign in as</Label>
            <div className="flex professional-card rounded-lg p-1">
              {[
                { id: 'user', label: 'User', icon: Users },
                { id: 'organizer', label: 'Organizer', icon: Crown }
              ].map((role) => {
                const Icon = role.icon;
                const isSelected = formData.role === role.id;
                
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, role: role.id as 'organizer' | 'user' }))}
                    className={`
                      flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md transition-all duration-200 font-medium
                      ${isSelected 
                        ? 'primary-button text-white' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{role.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="professional-card rounded-xl p-6 space-y-6">
          {/* Email */}
          <div className="space-y-2">
            <Label className="flex items-center space-x-2 text-slate-700 font-medium">
              <Mail className="w-4 h-4" />
              <span>Email Address</span>
            </Label>
            <Input
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className={`w-full ${errors.email ? 'border-red-300 focus:border-red-500' : 'border-slate-300 focus:border-blue-500'}`}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label className="flex items-center space-x-2 text-slate-700 font-medium">
              <Lock className="w-4 h-4" />
              <span>Password</span>
            </Label>
            <Input
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className={`w-full ${errors.password ? 'border-red-300 focus:border-red-500' : 'border-slate-300 focus:border-blue-500'}`}
            />
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full primary-button py-3 text-base"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>

          {/* Sign Up Link */}
          <div className="text-center pt-4">
            <p className="text-slate-600">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToSignUp}
                className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
              >
                Sign up here
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}