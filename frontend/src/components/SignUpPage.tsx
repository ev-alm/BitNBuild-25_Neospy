import { useState, useRef } from 'react'; // Import useRef
import { Eye, EyeOff, ArrowLeft, Mail, Lock, User as UserIcon, Users, Award, Upload, Check, Building, Briefcase, MapPin, Globe, Wallet, X } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback'; 
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from './ui/button';

// --- Define window.ethereum for MetaMask detection ---
declare global {
  interface Window {
    ethereum?: any;
  }
}

// --- Type Definitions ---
interface SignUpPageProps {
  onSignUp: (userData: any) => void;
  onSwitchToLogin: () => void;
}

const truncateAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;

const InstallWalletModal = ({ onClose }: { onClose: () => void }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
    <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -50, opacity: 0 }} className="bg-white rounded-xl p-8 space-y-6 w-full max-w-md relative text-center shadow-xl" onClick={(e) => e.stopPropagation()}>
      <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"><X /></button>
      <div className="flex justify-center"><div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center"><Wallet className="w-8 h-8 text-blue-600" /></div></div>
      <h2 className="text-2xl font-bold text-slate-900">You'll Need a Digital Wallet</h2>
      <p className="text-slate-600">To create a profile, you need a wallet. It's a secure digital passport for the next generation of the web.</p>
      <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer" className="block">
        <Button className="w-full gradient-button py-3 text-base">Get MetaMask (Recommended)</Button>
      </a>
      <p className="text-sm text-slate-500">After installing, refresh this page and try again!</p>
    </motion.div>
  </motion.div>
);

const OrganizerStepper = ({ step }: { step: number }) => {
  const steps = ["Organization", "Admin", "Wallet"];
  return (
    <div className="flex items-center justify-between w-full mb-8">
      {steps.map((label, index) => {
        const stepIndex = index + 1;
        const isActive = step === stepIndex;
        const isCompleted = step > stepIndex;
        return (
          <div key={label} className="flex items-center w-full">
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isActive ? 'bg-blue-600 border-blue-600 text-white' : isCompleted ? 'bg-green-500 border-green-500 text-white' : 'bg-slate-100 border-slate-300 text-slate-400'}`}>
                {isCompleted ? <Check /> : <span>{stepIndex}</span>}
              </div>
              <p className={`mt-2 text-xs font-medium transition-colors ${isActive || isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>{label}</p>
            </div>
            {index < steps.length - 1 && (<div className="flex-1 h-1 mx-2 bg-slate-200 rounded-full"><motion.div className="h-full rounded-full bg-green-500" initial={{ width: 0 }} animate={{ width: isCompleted ? '100%' : '0%' }} transition={{ duration: 0.4, ease: 'easeInOut' }}/></div>)}
          </div>
        );
      })}
    </div>
  );
};

export default function SignUpPage({ onSignUp, onSwitchToLogin }: SignUpPageProps) {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    role: 'user' as 'organizer' | 'user',
    avatar: 'https://images.unsplash.com/photo-1704726135027-9c6f034cfa41', // Default avatar
    orgName: '', orgLogo: '', orgWebsite: '', orgIndustry: '', orgCountry: '', orgCity: '', walletAddress: '',
  });
  const [organizerStep, setOrganizerStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [avatarUploaded, setAvatarUploaded] = useState(false); // Re-enabled
  const [orgLogoUploaded, setOrgLogoUploaded] = useState(false); // New state for org logo upload status
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  // Refs for hidden file inputs
  const userAvatarInputRef = useRef<HTMLInputElement>(null);
  const orgLogoInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({...prev, [field]: ''}));
  };

  // Re-enabled image upload functionality
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, target: 'user' | 'organizer') => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string; // Data URL for display
        const field = target === 'user' ? 'avatar' : 'orgLogo';
        setFormData(prev => ({ ...prev, [field]: imageUrl }));
        if (target === 'user') {
            setAvatarUploaded(true);
        } else {
            setOrgLogoUploaded(true);
        }
      };
      reader.readAsDataURL(file); // Read the file as a Data URL
    }
  };
  
  const validateOrganizerStep = (step: number) => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!formData.orgName.trim()) newErrors.orgName = 'Organization name is required';
      if (!formData.orgIndustry) newErrors.orgIndustry = 'Please select an industry';
      if (!formData.orgCountry.trim()) newErrors.orgCountry = 'Country is required';
      if (!formData.orgCity.trim()) newErrors.orgCity = 'City is required';
    } else if (step === 2) {
      if (!formData.name.trim()) newErrors.name = 'Admin name is required';
      if (!formData.email.trim() || !formData.email.includes('@')) newErrors.email = 'A valid email is required';
      if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    } else if (step === 3) {
      if (!formData.walletAddress) newErrors.walletAddress = 'Please connect your wallet to proceed';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleNextStep = () => { if (validateOrganizerStep(organizerStep)) setOrganizerStep(prev => prev + 1); };

  const handleConnectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      setIsWalletModalOpen(true);
      return;
    }
    setIsLoading(true);
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      handleInputChange('walletAddress', accounts[0]);
    } catch (error) {
      alert("Failed to connect wallet.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- THIS IS THE FIX ---
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.role === 'organizer') {
      // Step 1: Validate the final step (Step 3) before submitting
      if (validateOrganizerStep(3)) {
        // Step 2: Gather all the data into the correct structure for App.tsx
        const organizerData = {
          role: 'organizer',
          org_name: formData.orgName,
          org_logo_url: formData.orgLogo,
          website: formData.orgWebsite,
          industry: formData.orgIndustry,
          country: formData.orgCountry,
          city: formData.orgCity,
          name: formData.name, // This is the admin's name
          email: formData.email,
          password: formData.password,
          walletAddress: formData.walletAddress,
          avatar: '', // Not needed for organizer, App.tsx handles the logo
        };
        // Step 3: Call the onSignUp prop to trigger the state change and navigation in App.tsx
        onSignUp(organizerData);
      } else {
        // If validation fails, stop the loading spinner
        setIsLoading(false);
      }
    } else { // This is the Attendee/User flow
      if (!formData.walletAddress) {
        setIsLoading(false);
        return alert("Please connect your wallet to create an account.");
      }
      onSignUp({
        role: 'user',
        name: formData.name || truncateAddress(formData.walletAddress),
        email: formData.email,
        avatar: formData.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${formData.walletAddress}`,
        walletAddress: formData.walletAddress,
        password: '',
      });
    }
    // Safety timeout to reset loading state in case of an unhandled error
    setTimeout(() => { if (isLoading) setIsLoading(false) }, 3000);
  };
  
  const renderUserSignup = () => (
    <motion.div key="attendee-flow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <form onSubmit={handleSubmit} className="space-y-6">
            {!formData.walletAddress ? (
                <div className="text-center space-y-6 p-4">
                    <div className="flex justify-center"><div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center"><UserIcon className="w-10 h-10 text-blue-600" /></div></div>
                    <h2 className="text-2xl font-bold text-slate-800">Create Your Attendee Profile</h2>
                    <p className="text-slate-600">Connect your digital wallet to get started. This will be your secure identity for collecting event proofs.</p>
                    <Button type="button" onClick={handleConnectWallet} disabled={isLoading} className="w-full gradient-button py-3 text-base flex items-center justify-center gap-2"><Wallet className="w-5 h-5" />{isLoading ? 'Connecting...' : 'Connect Wallet'}</Button>
                </div>
            ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-center"><p className="text-sm font-medium text-green-800">Wallet Connected!</p><p className="text-xs text-green-600 font-mono mt-1">{truncateAddress(formData.walletAddress)}</p></div>
                    <h3 className="text-lg font-semibold text-center text-slate-700">Complete Your Profile (Optional)</h3>
                    <InputField icon={UserIcon} id="name" label="Display Name / Nickname" value={formData.name} onChange={handleInputChange} placeholder="e.g., Shravani" isRequired={false} />
                    <InputField icon={Mail} id="email" label="Email for Notifications" type="email" value={formData.email} onChange={handleInputChange} placeholder="your@email.com" isRequired={false} />
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-700 mb-3">Profile picture</label>
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 rounded-full overflow-hidden border-2">
                                <ImageWithFallback src={formData.avatar} alt="Avatar" className="w-full h-full" />
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                ref={userAvatarInputRef}
                                onChange={(e) => handleFileChange(e, 'user')}
                                className="hidden"
                            />
                            <button
                                type="button"
                                onClick={() => userAvatarInputRef.current?.click()}
                                className="flex items-center space-x-2 px-4 py-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                            >
                                {avatarUploaded ? (<><Check className="w-4 h-4 text-green-600" /><span>Uploaded</span></>) : (<><Upload className="w-4 h-4" /><span>Upload</span></>)}
                            </button>
                        </div>
                    </div>
                    <Button type="submit" disabled={isLoading} className="w-full gradient-button py-3">{isLoading ? "Creating Profile..." : "Create Profile"}</Button>
                </motion.div>
            )}
        </form>
    </motion.div>
  );

  const renderOrganizerStep1 = () => (
    <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }}>
      <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-3">Organization logo</label>
          <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2">
                  <ImageWithFallback src={formData.orgLogo} alt="Org Logo" className="w-full h-full" />
              </div>
              <input
                type="file"
                accept="image/*"
                ref={orgLogoInputRef}
                onChange={(e) => handleFileChange(e, 'organizer')}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => orgLogoInputRef.current?.click()}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                  {orgLogoUploaded ? (<><Check className="w-4 h-4 text-green-600" /><span>Uploaded</span></>) : (<><Upload className="w-4 h-4" /><span>Upload</span></>)}
              </button>
          </div>
      </div>
      <div className="space-y-6">
        <InputField icon={Building} id="orgName" label="Organization Name" value={formData.orgName} onChange={handleInputChange} error={errors.orgName} placeholder="Your Company Inc." />
        <InputField icon={Globe} id="orgWebsite" label="Website (Optional)" value={formData.orgWebsite} onChange={handleInputChange} placeholder="https://yourcompany.com" isRequired={false} />
        <div className="relative"><label htmlFor="orgIndustry" className="block text-sm font-medium text-slate-700 mb-2">Industry</label><div className="relative"><Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" /><select id="orgIndustry" value={formData.orgIndustry} onChange={(e) => handleInputChange('orgIndustry', e.target.value)} className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-blue-500 ${errors.orgIndustry ? 'border-red-300' : 'border-slate-200'}`} required><option value="" disabled>Select an industry</option><option value="tech">Tech</option><option value="education">Education</option><option value="nonprofit">Nonprofit</option><option value="corporate">Corporate</option></select></div>{errors.orgIndustry && <p className="mt-1 text-sm text-red-600">{errors.orgIndustry}</p>}</div>
        <div className="grid grid-cols-2 gap-4"><InputField icon={MapPin} id="orgCountry" label="Country" value={formData.orgCountry} onChange={handleInputChange} error={errors.orgCountry} placeholder="e.g., USA" /><InputField icon={MapPin} id="orgCity" label="City" value={formData.orgCity} onChange={handleInputChange} error={errors.orgCity} placeholder="e.g., San Francisco" /></div>
        <Button onClick={handleNextStep} className="w-full gradient-button py-3">Next</Button>
      </div>
    </motion.div>
  );

  const renderOrganizerStep2 = () => (
    <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }}>
      <div className="space-y-6">
        <InputField icon={UserIcon} id="name" label="Full Name" value={formData.name} onChange={handleInputChange} error={errors.name} placeholder="Enter your full name" />
        <InputField icon={Mail} id="email" label="Email Address" type="email" value={formData.email} onChange={handleInputChange} error={errors.email} placeholder="Enter your work email" />
        <PasswordField id="password" label="Password" value={formData.password} onChange={handleInputChange} error={errors.password} show={showPassword} toggleShow={setShowPassword} placeholder="Create a strong password" />
        <PasswordField id="confirmPassword" label="Confirm Password" value={formData.confirmPassword} onChange={handleInputChange} error={errors.confirmPassword || (formData.confirmPassword && formData.password !== formData.confirmPassword ? "Passwords do not match" : "")} show={showConfirmPassword} toggleShow={setShowConfirmPassword} placeholder="Confirm your password" />
        <div className="flex gap-3 pt-2"><button type="button" onClick={() => setOrganizerStep(1)} className="w-full py-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-medium">Back</button><Button onClick={handleNextStep} className="w-full gradient-button py-3">Next</Button></div>
      </div>
    </motion.div>
  );

  const renderOrganizerStep3 = () => (
    <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }}>
      <div className="text-center space-y-6">
        <div className="flex justify-center"><div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center"><Wallet className="w-10 h-10 text-blue-600" /></div></div>
        <h2 className="text-2xl font-bold text-slate-800">Final Step: Connect Wallet</h2>
        <p className="text-slate-600">This wallet will be associated with the events you create.</p>
        {formData.walletAddress ? (<div className="p-4 bg-green-50 border border-green-200 rounded-xl"><p className="text-sm font-medium text-green-800">Wallet Connected!</p><p className="text-xs text-green-600 font-mono mt-1">{truncateAddress(formData.walletAddress)}</p></div>) : (<Button onClick={handleConnectWallet} className="w-full gradient-button py-3 text-base">Connect Wallet</Button>)}
        {errors.walletAddress && <p className="text-sm text-red-600">{errors.walletAddress}</p>}
        <div className="flex gap-3 pt-2"><button type="button" onClick={() => setOrganizerStep(2)} className="w-full py-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-medium">Back</button><Button type="submit" disabled={isLoading || !formData.walletAddress} className="w-full gradient-button py-3">{isLoading ? "Creating Account..." : "Create Account"}</Button></div>
      </div>
    </motion.div>
  );

  return (
     <>
      <AnimatePresence>{isWalletModalOpen && <InstallWalletModal onClose={() => setIsWalletModalOpen(false)} />}</AnimatePresence>
      <div className="min-h-screen relative overflow-hidden">
        <div className="floating-particles"></div>
        <div className="relative z-10 min-h-screen flex">
          <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-8">
            <div className="w-full max-w-md">
              <button onClick={onSwitchToLogin} className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 group mb-8"><ArrowLeft className="w-4 h-4 group-hover:-translate-x-1" /><span>Back</span></button>
              <div className="text-center mb-8"><div className="flex items-center justify-center space-x-3 mb-6"><div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center"><Award className="w-7 h-7 text-white" /></div><span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">POAP</span></div><h1 className="text-3xl font-bold text-slate-900 mb-2">Create your account</h1><p className="text-slate-600">Join the future of event verification</p></div>
              <div className="mb-6"><label className="block text-sm font-medium text-slate-700 mb-3">Choose your role</label><div className="grid grid-cols-2 gap-3 p-1 bg-slate-100 rounded-xl"><button type="button" onClick={() => handleInputChange('role', 'user')} className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all ${formData.role === 'user' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-600'}`}><UserIcon className="w-4 h-4" /><span className="font-medium">Attendee</span></button><button type="button" onClick={() => handleInputChange('role', 'organizer')} className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all ${formData.role === 'organizer' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-600'}`}><Users className="w-4 h-4" /><span className="font-medium">Organizer</span></button></div></div>
              <AnimatePresence mode="wait">{formData.role === 'organizer' ? (<motion.div key="organizer-flow"><form onSubmit={handleSubmit}><OrganizerStepper step={organizerStep} /><AnimatePresence mode="wait">{organizerStep === 1 && renderOrganizerStep1()}{organizerStep === 2 && renderOrganizerStep2()}{organizerStep === 3 && renderOrganizerStep3()}</AnimatePresence></form></motion.div>) : (renderUserSignup())}</AnimatePresence>
              <div className="mt-6 text-center"><span className="text-slate-600">Already have an account? </span><button onClick={onSwitchToLogin} className="text-blue-600 font-medium">Sign in</button></div>
            </div>
          </div>
          <div className="hidden lg:flex flex-1 items-center justify-center p-12 bg-gradient-to-br from-cyan-50 to-teal-50"></div>
        </div>
      </div>
    </>
  );
}

const InputField = ({ icon: Icon, id, label, value, onChange, error, type = 'text', placeholder = '', isRequired = true }: any) => (<div><label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-2">{label}</label><div className="relative"><Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" /><input id={id} type={type} value={value} onChange={(e) => onChange(id, e.target.value)} className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-300' : 'border-slate-200'}`} placeholder={placeholder} required={isRequired} /></div>{error && <p className="mt-1 text-sm text-red-600">{error}</p>}</div>);
const PasswordField = ({ id, label, value, onChange, error, show, toggleShow, placeholder = '' }: any) => (<div><label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-2">{label}</label><div className="relative"><Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" /><input id={id} type={show ? 'text' : 'password'} value={value} onChange={(e) => onChange(id, e.target.value)} className={`w-full pl-10 pr-12 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-300' : 'border-slate-200'}`} placeholder={placeholder} required /><button type="button" onClick={() => toggleShow(!show)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400">{show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button></div>{error && <p className="mt-1 text-sm text-red-600">{error}</p>}</div>);