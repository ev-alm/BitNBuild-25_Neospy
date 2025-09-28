import { useState } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Wallet, Edit3, Save, X, LogOut, Settings, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface User {
  name: string;
  email: string;
  avatar: string;
  role: 'organizer' | 'user';
  walletBalance: string;
  walletAddress: string;
}

interface UserSettingsProps {
  user: User;
  onUpdateUser: (updatedUser: Partial<User>) => void;
  onLogout: () => void;
}

export default function UserSettings({ user, onUpdateUser, onLogout }: UserSettingsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: user.name, email: user.email });
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    onUpdateUser({ name: editForm.name, email: editForm.email });
    setIsEditing(false);
    setIsLoading(false);
  };

  const handleCancel = () => {
    setEditForm({ name: user.name, email: user.email });
    setIsEditing(false);
  };

  const formatWalletAddress = (address: string) =>
    `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12 max-w-3xl mx-auto px-6"
    >
      {/* Profile Card */}
      <Card className="glass-card border-slate-400/30 overflow-hidden relative p-8">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute -top-12 -right-12 w-40 h-40 bg-gradient-to-br from-slate-400/10 to-blue-400/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
        </div>

        <CardHeader className="relative mb-8">
          <CardTitle className="flex items-center justify-between text-slate-100">
            <div className="flex items-center space-x-4">
              <Settings className="w-6 h-6 text-slate-400" />
              <span className="font-semibold text-xl">Profile Settings</span>
            </div>
            {!isEditing && (
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                size="sm"
                className="glass-card border-slate-400/30 text-slate-300 hover:text-white hover:border-slate-400/50"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent className="relative space-y-8">
          {/* Avatar Section */}
          <div className="flex items-center space-x-8">
            <Avatar className="w-28 h-28 ring-4 ring-slate-400/30">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="bg-gradient-to-br from-slate-600 to-slate-700 text-white text-3xl">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-3">
              <p className="text-slate-200 font-semibold capitalize text-lg">{user.role} Account</p>
              <div className="flex items-center space-x-3 text-sm text-slate-400">
                <Shield className="w-5 h-5" />
                <span>Verified Account</span>
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="space-y-6">
            {/* Name */}
            <div>
              <Label className="text-slate-400 flex items-center space-x-3">
                <User className="w-5 h-5" />
                <span>Username</span>
              </Label>
              {isEditing ? (
                <Input
                  value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  className="glass-card border-slate-400/30 text-slate-100 placeholder-slate-500/50 focus:border-slate-400/60 mt-2"
                  placeholder="Enter your username"
                />
              ) : (
                <div className="glass-card rounded-xl p-4 border-slate-400/20 text-slate-100 mt-2">
                  {user.name}
                </div>
              )}
            </div>

            {/* Email */}
            <div>
              <Label className="text-slate-400 flex items-center space-x-3">
                <Mail className="w-5 h-5" />
                <span>Email Address</span>
              </Label>
              {isEditing ? (
                <Input
                  type="email"
                  value={editForm.email}
                  onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                  className="glass-card border-slate-400/30 text-slate-100 placeholder-slate-500/50 focus:border-slate-400/60 mt-2"
                  placeholder="Enter your email"
                />
              ) : (
                <div className="glass-card rounded-xl p-4 border-slate-400/20 text-slate-100 mt-2">
                  {user.email}
                </div>
              )}
            </div>

            {/* Wallet */}
            <div>
              <Label className="text-slate-400 flex items-center space-x-3">
                <Wallet className="w-5 h-5" />
                <span>MetaMask Wallet</span>
              </Label>
              <div className="glass-card rounded-xl p-4 border-slate-400/20 flex items-center justify-between mt-2">
                <div className="space-y-1">
                  <p className="text-slate-100 font-mono text-sm">{formatWalletAddress(user.walletAddress)}</p>
                  
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="glass-card border-slate-400/30 text-slate-300 hover:text-white hover:border-slate-400/50"
                  onClick={() => navigator.clipboard.writeText(user.walletAddress)}
                >
                  Copy
                </Button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing ? (
            <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4 pt-6">
              <Button onClick={handleSave} disabled={isLoading} className="flex-1 gradient-button">
                {isLoading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-4 h-4 mr-2">
                    <Save className="w-4 h-4" />
                  </motion.div>
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>

              <Button
                onClick={handleCancel}
                disabled={isLoading}
                variant="outline"
                className="flex-1 glass-card border-red-400/30 text-red-300 hover:text-white hover:border-red-400/50"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              onClick={onLogout}
              variant="outline"
              className="w-full glass-card border-red-400/30 text-red-300 hover:text-white hover:border-red-400/50 hover:bg-red-500/10 mt-6"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card className="glass-card border-slate-400/30 p-6">
        <CardHeader>
          <CardTitle className="text-slate-100 text-lg">Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card rounded-xl p-6 border-slate-400/20 flex items-center space-x-4">
              <div className="p-3 bg-slate-500/20 rounded-lg">
                <User className="w-6 h-6 text-slate-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Account Type</p>
                <p className="text-slate-100 font-medium capitalize">{user.role}</p>
              </div>
            </div>

            <div className="glass-card rounded-xl p-6 border-slate-400/20 flex items-center space-x-4">
              <div className="p-3 bg-slate-500/20 rounded-lg">
                <Shield className="w-6 h-6 text-slate-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Account Status</p>
                <p className="text-slate-100 font-medium">Active & Verified</p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-xl p-6 border-slate-400/20">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-slate-500/20 rounded-lg">
                <Wallet className="w-6 h-6 text-slate-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Full Wallet Address</p>
                <p className="text-slate-100 font-mono text-sm break-all">{user.walletAddress}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
