import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { User, Mail, Lock, Upload, ArrowLeft, Crown, Users, Building, Globe, Briefcase, MapPin, Wallet } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

// Define the window.ethereum type for MetaMask
declare global {
  interface Window {
    ethereum?: any;
  }
}

interface SignUpPageProps {
  onSignUp: (userData: {
    name: string;
    email: string;
    password: string; // Will be empty for user role
    role: 'organizer' | 'user';
    avatar: string;
  }) => void;
  onSwitchToLogin: () => void;
  defaultRole: 'organizer' | 'user' | null;
}

const slideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction < 0 ? '100%' : '-100%', opacity: 0 })
};

// A small utility to shorten wallet addresses
const truncateAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;

export default function SignUpPage({ onSignUp, onSwitchToLogin, defaultRole }: SignUpPageProps) {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '', avatar: '',
    orgName: '', orgLogo: '', orgWebsite: '', orgIndustry: '', orgCountry: '', orgCity: '',
    role: defaultRole || 'user' as 'organizer' | 'user',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [organizerStep, setOrganizerStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const validateStep = (step: number) => {
    // ... (Organizer validation logic remains unchanged)
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!formData.orgName.trim()) newErrors.orgName = 'Organization name is required';
      if (!formData.orgIndustry) newErrors.orgIndustry = 'Please select an industry';
      if (!formData.orgCountry.trim()) newErrors.orgCountry = 'Country is required';
      if (!formData.orgCity.trim()) newErrors.orgCity = 'City is required';
    } else if (step === 2) {
      if (!formData.name.trim()) newErrors.name = 'Full name is required';
      if (!formData.email.trim() || !formData.email.includes('@')) newErrors.email = 'A valid email is required';
      if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleNextStep = () => { if (validateStep(1)) { setDirection(1); setOrganizerStep(2); } };
  
  const handleConnectWallet = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask to sign up as a user.');
      return;
    }
    setIsLoading(true);
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setWalletAddress(accounts[0]);
    } catch (error) {
      console.error("Wallet connection failed:", error);
      alert("Failed to connect wallet. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.role === 'user') {
        if (!walletAddress) {
            alert("Please connect your wallet to complete signup.");
            return;
        }
        setIsLoading(true);
        setTimeout(() => {
            onSignUp({
                name: formData.name || truncateAddress(walletAddress), // Use nickname or truncated address as name
                email: formData.email, // Can be empty
                password: '', // No password for wallet users
                role: 'user',
                avatar: formData.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${walletAddress}` // Auto-generate avatar from address
            });
        }, 1500);

    } else if (formData.role === 'organizer') {
        const isOrganizerValid = validateStep(1) && validateStep(2);
        if (isOrganizerValid) {
            setIsLoading(true);
            setTimeout(() => {
              onSignUp({
                name: formData.name, email: formData.email, password: formData.password, role: 'organizer',
                avatar: formData.orgLogo || `https://api.dicebear.com/7.x/identicon/svg?seed=${formData.orgName}`
              });
            }, 1500);
        }
    }
  };
  
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'user' | 'org') => {
    // ... (Avatar upload logic remains unchanged)
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setFormData(p => ({ ...p, [target === 'user' ? 'avatar' : 'orgLogo']: ev.target?.result as string }));
      reader.readAsDataURL(file);
    }
  };
  
  const renderUserForm = () => (
    <form onSubmit={handleSubmit} className="professional-card rounded-xl p-6 sm:p-8 space-y-6">
      {!walletAddress ? (
        // STATE 1: WALLET NOT CONNECTED
        <div className="text-center space-y-6 py-8">
            <h2 className="text-xl font-semibold text-slate-800">Join as a User</h2>
            <p className="text-slate-600">Connect your digital wallet to create your profile and start collecting attendance proofs.</p>
            <Button type="button" onClick={handleConnectWallet} disabled={isLoading} className="w-full primary-button py-3 text-base flex items-center justify-center gap-2">
                <Wallet className="w-5 h-5" />
                {isLoading ? 'Connecting...' : 'Connect with MetaMask'}
            </Button>
        </div>
      ) : (
        // STATE 2: WALLET CONNECTED - SHOW OPTIONAL PROFILE FIELDS
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="space-y-6">
            <div className="text-center">
                <h2 className="text-xl font-semibold text-slate-800">Complete Your Profile</h2>
                <p className="text-slate-500 text-sm mt-1">Connected as: <span className="font-mono">{truncateAddress(walletAddress)}</span></p>
            </div>
            
            <div className="space-y-2">
                <Label className="block text-slate-700 font-medium">Profile Photo (Optional)</Label>
                <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                        {formData.avatar ? <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" /> : <img src={`https://api.dicebear.com/7.x/identicon/svg?seed=${walletAddress}`} alt="auto-avatar" />}
                    </div>
                    <label htmlFor="avatar-upload" className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 cursor-pointer transition-colors"><Upload className="w-4 h-4 mr-2" /> Upload</label>
                    <input type="file" accept="image/*" onChange={(e) => handleAvatarUpload(e, 'user')} className="hidden" id="avatar-upload" />
                </div>
            </div>

            <div className="space-y-2">
                <Label className="flex items-center space-x-2 text-slate-700 font-medium"><User className="w-4 h-4" /><span>Display Name (Optional)</span></Label>
                <Input type="text" placeholder="e.g., Shravani" value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} />
            </div>
            
            <div className="space-y-2">
                <Label className="flex items-center space-x-2 text-slate-700 font-medium"><Mail className="w-4 h-4" /><span>Email for Notifications (Optional)</span></Label>
                <Input type="email" placeholder="your@email.com" value={formData.email} onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))} />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full primary-button py-3 text-base">{isLoading ? 'Creating Account...' : 'Create Account'}</Button>
        </motion.div>
      )}

      <div className="text-center pt-4 border-t border-slate-200 mt-2">
        <p className="text-slate-600">Already have an account? <button type="button" onClick={onSwitchToLogin} className="text-blue-600 hover:text-blue-800 font-medium hover:underline">Sign in</button></p>
      </div>
    </form>
  );

  const renderOrganizerForm = () => (
    // ... (Organizer form logic remains completely unchanged)
    <div className="professional-card rounded-xl p-6 sm:p-8 space-y-6">
      <div className="w-full bg-slate-200 rounded-full h-2.5 mb-6"><motion.div className="bg-blue-600 h-2.5 rounded-full" initial={{ width: '0%' }} animate={{ width: organizerStep === 1 ? '50%' : '100%' }} transition={{ duration: 0.5, ease: "easeInOut" }}/></div>
      <div className="relative overflow-hidden">
        <AnimatePresence initial={false} custom={direction}>
          {organizerStep === 1 && (<motion.div key={1} custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="space-y-6">
              <h2 className="text-xl font-semibold text-slate-800 text-center">Step 1: Organization Details</h2>
              <div className="space-y-2">
                <Label className="block text-slate-700 font-medium">Organization Logo</Label>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">{formData.orgLogo ? <img src={formData.orgLogo} alt="Logo" className="w-full h-full object-cover" /> : <Building className="w-8 h-8 text-slate-400" />}</div>
                  <label htmlFor="org-logo-upload" className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 cursor-pointer"><Upload className="w-4 h-4 mr-2" /> Upload Logo</label>
                  <input type="file" accept="image/*" onChange={(e) => handleAvatarUpload(e, 'org')} className="hidden" id="org-logo-upload" />
                </div>
              </div>
              <div className="space-y-2"><Label className="flex items-center space-x-2 text-slate-700 font-medium"><Building className="w-4 h-4" /><span>Organization Name</span></Label><Input placeholder="Your Company Inc." value={formData.orgName} onChange={(e) => setFormData(p => ({...p, orgName: e.target.value}))} className={errors.orgName ? 'border-red-400' : ''}/>{errors.orgName && <p className="text-sm text-red-600">{errors.orgName}</p>}</div>
              <div className="space-y-2"><Label className="flex items-center space-x-2 text-slate-700 font-medium"><Globe className="w-4 h-4" /><span>Website (Optional)</span></Label><Input placeholder="https://yourcompany.com" value={formData.orgWebsite} onChange={(e) => setFormData(p => ({...p, orgWebsite: e.target.value}))}/></div>
              <div className="space-y-2">
                  <Label className="flex items-center space-x-2 text-slate-700 font-medium"><Briefcase className="w-4 h-4" /><span>Industry</span></Label>
                  <Select onValueChange={(value: any) => setFormData(p => ({ ...p, orgIndustry: value }))} value={formData.orgIndustry}><SelectTrigger className={errors.orgIndustry ? 'border-red-400' : ''}><SelectValue placeholder="Select an industry" /></SelectTrigger><SelectContent><SelectItem value="tech">Tech</SelectItem><SelectItem value="education">Education</SelectItem><SelectItem value="nonprofit">Nonprofit</SelectItem><SelectItem value="corporate">Corporate</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select>
                  {errors.orgIndustry && <p className="text-sm text-red-600">{errors.orgIndustry}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label className="flex items-center space-x-2 text-slate-700 font-medium"><MapPin className="w-4 h-4" /><span>Country</span></Label><Input placeholder="e.g., USA" value={formData.orgCountry} onChange={(e) => setFormData(p => ({...p, orgCountry: e.target.value}))} className={errors.orgCountry ? 'border-red-400' : ''}/>{errors.orgCountry && <p className="text-sm text-red-600">{errors.orgCountry}</p>}</div>
                  <div className="space-y-2"><Label className="flex items-center space-x-2 text-slate-700 font-medium"><MapPin className="w-4 h-4" /><span>City</span></Label><Input placeholder="e.g., San Francisco" value={formData.orgCity} onChange={(e) => setFormData(p => ({...p, orgCity: e.target.value}))} className={errors.orgCity ? 'border-red-400' : ''}/>{errors.orgCity && <p className="text-sm text-red-600">{errors.orgCity}</p>}</div>
              </div>
              <Button type="button" onClick={handleNextStep} className="w-full primary-button py-3 text-base">Next: Admin Details</Button>
            </motion.div>)}
          {organizerStep === 2 && (<motion.div key={2} custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="space-y-6">
              <h2 className="text-xl font-semibold text-slate-800 text-center">Step 2: Admin Account Details</h2>
              {['name', 'email', 'password', 'confirmPassword'].map(field => {
                  const Icon = {name: User, email: Mail, password: Lock, confirmPassword: Lock}[field]!;
                  const label = {name: "Full Name", email: "Work Email", password: "Password", confirmPassword: "Confirm Password"}[field]!;
                  const type = field.includes('password') ? 'password' : 'text';
                  return (<div key={field} className="space-y-2"><Label className="flex items-center space-x-2 text-slate-700 font-medium"><Icon className="w-4 h-4" /><span>{label}</span></Label><Input type={type} placeholder={`Enter your ${label.toLowerCase()}`} value={formData[field as keyof typeof formData]} onChange={(e) => setFormData(prev => ({ ...prev, [field]: e.target.value }))} className={errors[field] ? 'border-red-400' : ''}/>{errors[field] && <p className="text-sm text-red-600">{errors[field]}</p>}</div>)
              })}
              <div className="pt-2"><Button type="submit" disabled={isLoading} className="w-full primary-button py-3 text-base">{isLoading ? 'Creating Account...' : 'Create Account'}</Button></div>
            </motion.div>)}
        </AnimatePresence>
      </div>
      <div className="text-center pt-6 border-t border-slate-200 mt-6"><p className="text-slate-600">Already have an account? <button type="button" onClick={onSwitchToLogin} className="text-blue-600 hover:text-blue-800 font-medium hover:underline">Sign in here</button></p></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4 sm:p-6">
      <motion.div className="w-full max-w-md" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Button type="button" onClick={onSwitchToLogin} variant="ghost" className="mb-6 text-slate-600 hover:text-slate-900"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Login</Button>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Create Your Account</h1>
          <p className="text-slate-600">Get started by choosing your role below.</p>
        </div>
        {!defaultRole && (
          <div className="mb-6">
            <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200">
              {[{ id: 'user', label: 'User', icon: Users }, { id: 'organizer', label: 'Organizer', icon: Crown }].map((role) => {
                const isSelected = formData.role === role.id;
                return (
                  <button key={role.id} type="button" onClick={() => setFormData(prev => ({ ...prev, role: role.id as 'organizer' | 'user' }))} className="relative flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md transition-colors duration-300 font-medium text-sm sm:text-base z-10">
                    {isSelected && <motion.div layoutId="role-selector-bg" className="absolute inset-0 bg-white shadow-sm rounded-md z-0" />}
                    <role.icon className={`w-5 h-5 z-10 transition-colors ${isSelected ? 'text-blue-600' : 'text-slate-500'}`} />
                    <span className={`z-10 transition-colors ${isSelected ? 'text-slate-900' : 'text-slate-600'}`}>{role.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        {formData.role === 'organizer' ? (<form onSubmit={handleSubmit}>{renderOrganizerForm()}</form>) : renderUserForm()}
      </motion.div>
    </div>
  );
}