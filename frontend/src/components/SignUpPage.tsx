import { useState } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Lock, Upload, ArrowLeft, Crown, Users } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface SignUpPageProps {
  onSignUp: (userData: {
    name: string;
    email: string;
    password: string;
    role: 'organizer' | 'user';
    avatar: string;
  }) => void;
  onSwitchToLogin: () => void;
  defaultRole: 'organizer' | 'user' | null;
}

export default function SignUpPage({ onSignUp, onSwitchToLogin, defaultRole }: SignUpPageProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: defaultRole || 'user' as 'organizer' | 'user',
    avatar: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.email.includes('@')) newErrors.email = 'Valid email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsLoading(true);
      setErrors({});
      
      // Simulate sign up process
      setTimeout(() => {
        onSignUp({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          avatar: formData.avatar || 'https://images.unsplash.com/photo-1704726135027-9c6f034cfa41?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1c2VyJTIwYXZhdGFyJTIwcHJvZmlsZXxlbnwxfHx8fDE3NTg5NDc2MTZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
        });
        setIsLoading(false);
      }, 1500);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you'd upload to a service here
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, avatar: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Back Button */}
        <Button
          type="button"
          onClick={onSwitchToLogin}
          variant="ghost"
          className="mb-6 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Login
        </Button>

        {/* Welcome Text */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Create Account</h1>
          <p className="text-slate-600">
            Join as {formData.role === 'organizer' ? 'an Organizer' : 'a User'}
          </p>
        </div>

        {/* Role Selector - only show if no default role */}
        {!defaultRole && (
          <div className="mb-6">
            <Label className="block text-slate-700 mb-3 text-center font-medium">Join as</Label>
            <div className="flex professional-card rounded-lg p-1">
              {[
                { id: 'user', label: 'User', icon: Users },
                { id: 'organizer', label: 'Organizer', icon: Crown }
              ].map((role) => {
                const Icon = role.icon;
                const isSelected = formData.role === role.id;
                
                return (
                  <motion.button
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
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{role.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}

        {/* Sign Up Form */}
        <form onSubmit={handleSubmit} className="professional-card rounded-xl p-6 space-y-6">
          {/* Avatar Upload */}
          <div className="space-y-2">
            <Label className="block text-slate-700 font-medium">Profile Photo</Label>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                {formData.avatar ? (
                  <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-slate-400" />
                )}
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  id="avatar-upload"
                />
                <label
                  htmlFor="avatar-upload"
                  className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Photo
                </label>
              </div>
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label className="flex items-center space-x-2 text-slate-700 font-medium">
              <User className="w-4 h-4" />
              <span>Full Name</span>
            </Label>
            <Input
              type="text"
              placeholder="Enter your name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className={`w-full ${errors.name ? 'border-red-300 focus:border-red-500' : 'border-slate-300 focus:border-blue-500'}`}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name}</p>
            )}
          </div>

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
              placeholder="Create a password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className={`w-full ${errors.password ? 'border-red-300 focus:border-red-500' : 'border-slate-300 focus:border-blue-500'}`}
            />
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label className="flex items-center space-x-2 text-slate-700 font-medium">
              <Lock className="w-4 h-4" />
              <span>Confirm Password</span>
            </Label>
            <Input
              type="password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              className={`w-full ${errors.confirmPassword ? 'border-red-300 focus:border-red-500' : 'border-slate-300 focus:border-blue-500'}`}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full primary-button py-3 text-base"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>

          {/* Login Link */}
          <div className="text-center pt-4">
            <p className="text-slate-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
              >
                Sign in here
              </button>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
}