import { useState } from 'react';
import { 
  Upload, QrCode, Eye, Plus, Calendar, MapPin, FileText, 
  ImageIcon, Globe, Gift, Clock, Link as LinkIcon // Imported Link as LinkIcon to avoid naming conflicts
} from 'lucide-react'; 
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import BadgeCard from './BadgeCard';
import { Switch } from './ui/switch'; 

interface CreateEventPageProps {
  onToast: (toast: { title: string; description?: string; type: 'success' | 'error' | 'info' }) => void;
}

export default function CreateEventPage({ onToast }: CreateEventPageProps) {
  const [eventData, setEventData] = useState({
    name: '',
    startDate: '', // Renamed for clarity
    endDate: '',
    location: '',
    description: '',
    badgeImage: ''
  });

  const [previewBadge, setPreviewBadge] = useState(false);
  // Replaced isOnlineEvent with eventType for dropdown
  const [eventType, setEventType] = useState<'online' | 'offline'>('offline'); 
  const [issueBadge, setIssueBadge] = useState(true);

  // New state for controlling QR vs Link when issueBadge is true
  const [useQrCodeForClaim, setUseQrCodeForClaim] = useState(true); // Default to QR code for badges

  // Expiration settings
  const bufferOptions = [
    { label: 'Default (30 mins)', value: 30 },
    { label: '1 hour', value: 60 },
    { label: '2 hours', value: 120 },
    { label: '6 hours', value: 360 },
    { label: 'Custom…', value: -1 }
  ];

  const [expiryBuffer, setExpiryBuffer] = useState(30);
  const [customBuffer, setCustomBuffer] = useState<number | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setEventData(prev => ({ ...prev, badgeImage: imageUrl }));
    }
  };

  const generateQRCode = () => {
    // Mock QR code generation for a badge claim
    const qrData = `poap://claim/${Date.now()}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;
  };

  const generateCredLink = () => {
    // Mock Credential Link generation for social sharing (when no badge is issued)
    const credData = `poap-cred://share/${Date.now()}`;
    return `https://poap.xyz/cred-share?id=${encodeURIComponent(credData)}`;
  };

  const generateBadgeClaimLink = () => {
    // Mock direct link for claiming a badge (when a badge is issued but no QR is preferred)
    const claimId = `badge-claim-${Date.now()}`; 
    return `https://poap.xyz/claim?id=${encodeURIComponent(claimId)}`;
  }

  // Compute expiry time
  const getExpiryTime = () => {
    if (!eventData.endDate) return null;
    const end = new Date(eventData.endDate).getTime();
    const buffer = expiryBuffer === -1 && customBuffer ? customBuffer : expiryBuffer;
    if (!buffer) return null;
    return new Date(end + buffer * 60 * 1000);
  };

  const mockBadge = {
    id: 'preview',
    name: eventData.name || 'Your Event Badge',
    event: eventData.name || 'Preview Event',
    date: eventData.startDate || 'TBD', // Use startDate for badge date
    location: eventType === 'online' ? 'Online Event' : (eventData.location || 'TBD'), 
    attendees: 0,
    rarity: 'epic' as const,
    image: eventData.badgeImage || 'https://images.unsplash.com/photo-1628584824791-30d512161601?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxkaWdpdGFsJTIwYmFkZ2UlMjB0cm9waHklMjBhd2FyZHxlbnwxfHx8fDE3NTg5NzMxNjN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Create Event Badge</h1>
        <p className="text-neutral-gray max-w-2xl mx-auto">
          Design a unique POAP badge for your event. Attendees will be able to claim this digital collectible as proof of their presence.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <div>
          <div className="professional-card rounded-3xl p-8 space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <Plus className="w-6 h-6 text-[--accent-teal]" />
              <h2 className="text-xl font-bold text-foreground">Event Details</h2>
            </div>

            {/* Event Name */}
            <div className="space-y-2">
              <Label className="flex items-center space-x-2 text-foreground">
                <FileText className="w-4 h-4" />
                <span>Event Name</span>
              </Label>
              <Input
                placeholder="e.g., DevCon 2024, Art Gallery Opening"
                value={eventData.name}
                onChange={(e) => setEventData(prev => ({ ...prev, name: e.target.value }))}
                className="professional-card border text-foreground placeholder:text-neutral-gray/50"
              />
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <Label className="flex items-center space-x-2 text-foreground">
                <Calendar className="w-4 h-4" />
                <span>Event Start</span>
              </Label>
              <Input
                type="datetime-local"
                value={eventData.startDate}
                onChange={(e) => setEventData(prev => ({ ...prev, startDate: e.target.value }))}
                className="professional-card border text-foreground"
              />
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label className="flex items-center space-x-2 text-foreground">
                <Calendar className="w-4 h-4" />
                <span>Event End</span>
              </Label>
              <Input
                type="datetime-local"
                value={eventData.endDate}
                onChange={(e) => setEventData(prev => ({ ...prev, endDate: e.target.value }))}
                className="professional-card border text-foreground"
              />
            </div>

            {/* Online/Offline Event Dropdown */}
            <div className="space-y-2">
              <Label className="flex items-center space-x-2 text-foreground">
                <Globe className="w-4 h-4" />
                <span>Event Type</span>
              </Label>
              <select
                value={eventType}
                onChange={(e) => {
                  const newType = e.target.value as 'online' | 'offline';
                  setEventType(newType);
                  // Update location based on event type
                  setEventData(prev => ({ ...prev, location: newType === 'online' ? 'Online Event' : '' }));
                }}
                className="professional-card border w-full p-2 rounded-lg bg-transparent text-foreground"
              >
                <option value="offline">Offline Event</option>
                <option value="online">Online Event</option>
              </select>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label className="flex items-center space-x-2 text-foreground">
                <MapPin className="w-4 h-4" />
                <span>{eventType === 'online' ? 'Location (Auto-set for Online)' : 'Location'}</span>
              </Label>
              <Input
                placeholder={eventType === 'online' ? "This event is online." : "e.g., San Francisco, CA"}
                value={eventData.location}
                onChange={(e) => setEventData(prev => ({ ...prev, location: e.target.value }))}
                disabled={eventType === 'online'}
                className="professional-card border text-foreground placeholder:text-neutral-gray/50"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-foreground">Event Description</Label>
              <Textarea
                placeholder="Describe your event and what makes it special..."
                value={eventData.description}
                onChange={(e) => setEventData(prev => ({ ...prev, description: e.target.value }))}
                className="professional-card border text-foreground placeholder:text-neutral-gray/50 min-h-[100px]"
              />
            </div>
            
            {/* Issue Badge Toggle */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-foreground" />
                <Label htmlFor="issue-badge-toggle" className="text-foreground cursor-pointer">
                  Issue POAP Badge
                </Label>
              </div>
              <Switch
                id="issue-badge-toggle"
                checked={issueBadge}
                onCheckedChange={(checked: boolean | ((prevState: boolean) => boolean)) => {
                    setIssueBadge(checked);
                    if (!checked) { // If turning off badge issuance, default to link for clarity
                        setUseQrCodeForClaim(false);
                    }
                }}
                className="data-[state=checked]:bg-[--accent-teal] data-[state=unchecked]:bg-slate-400"
              />
            </div>

            {/* Link Expiration Buffer (only when issuing badge) */}
            {issueBadge && (
              <div className="space-y-2 mt-4">
                <Label className="flex items-center space-x-2 text-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Link Expiration Buffer</span>
                </Label>
                <select
                  value={expiryBuffer}
                  onChange={(e) => setExpiryBuffer(Number(e.target.value))}
                  className="professional-card border w-full p-2 rounded-lg bg-transparent text-foreground"
                >
                  {bufferOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                {expiryBuffer === -1 && (
                  <div className="mt-2">
                    <Input
                      type="number"
                      placeholder="Enter minutes (e.g., 90)"
                      value={customBuffer ?? ''}
                      onChange={(e) => setCustomBuffer(Number(e.target.value))}
                      className="professional-card border text-foreground"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Badge Image Upload (only when issuing badge) */}
            {issueBadge && (
              <div className="space-y-2">
                <Label className="flex items-center space-x-2 text-foreground">
                  <ImageIcon className="w-4 h-4" />
                  <span>Badge Artwork</span>
                </Label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="badge-upload"
                  />
                  <label
                    htmlFor="badge-upload"
                    className="flex items-center justify-center w-full h-24 professional-card border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-[--accent-teal] transition-colors"
                  >
                    <div className="text-center">
                      <Upload className="w-6 h-6 mx-auto mb-2 text-[--accent-teal]" />
                      <p className="text-sm text-neutral-gray">
                        {eventData.badgeImage ? 'Change Image' : 'Upload Badge Image'}
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* QR Code / Link selection (only when issuing badge) */}
            {issueBadge && (
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  {useQrCodeForClaim ? <QrCode className="w-4 h-4 text-foreground" /> : <LinkIcon className="w-4 h-4 text-foreground" />}
                  <Label htmlFor="qr-link-toggle" className="text-foreground cursor-pointer">
                    {useQrCodeForClaim ? 'Generate QR Code for Claim' : 'Generate Link for Claim'}
                  </Label>
                </div>
                <Switch
                  id="qr-link-toggle"
                  checked={useQrCodeForClaim}
                  onCheckedChange={setUseQrCodeForClaim}
                  className="data-[state=checked]:bg-[--accent-teal] data-[state=unchecked]:bg-slate-400"
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-4 pt-4">
              {issueBadge && ( // Only show preview if a badge is being issued
                <Button
                  onClick={() => setPreviewBadge(!previewBadge)}
                  variant="outline"
                  className="flex-1 professional-card border text-neutral-gray hover:text-primary-blue"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {previewBadge ? 'Hide Preview' : 'Preview Badge'}
                </Button>
              )}
              
              <Button 
                className="flex-1 primary-button"
                onClick={() => {
                  onToast({
                    title: '🎉 Event Created Successfully!',
                    description: `${eventData.name || 'Your event'} is ready for attendees. ${issueBadge ? 'Badges will be issued.' : 'Credentials will be shared.'}`,
                    type: 'success'
                  });
                }}
              >
                Create Event
              </Button>
            </div>
          </div>
        </div>

        {/* Preview / Claim Section */}
        <div className="space-y-6">
          {/* Badge Preview */}
          {issueBadge && previewBadge && (
            <div className="flex justify-center">
              <BadgeCard 
                badge={mockBadge} 
                size="large" 
                showDetails={true}
              />
            </div>
          )}

          {/* QR Code or Cred Link */}
          {issueBadge ? ( // If issuing badge, show QR or Claim Link based on useQrCodeForClaim
            useQrCodeForClaim ? (
              <div className="professional-card rounded-3xl p-8 text-center">
                <div className="flex items-center justify-center space-x-3 mb-6">
                  <QrCode className="w-6 h-6 text-[--accent-teal]" />
                  <h3 className="text-xl font-bold text-foreground">Claim QR Code</h3>
                </div>
                
                <div className="relative inline-block">
                  <div className="professional-card p-4 rounded-2xl inline-block">
                    <img
                      src={generateQRCode()}
                      alt="POAP Claim QR Code"
                      className="w-48 h-48 rounded-xl"
                    />
                  </div>
                </div>
                
                {getExpiryTime() && (
                  <p className="text-neutral-gray mt-4 text-sm">
                    🔒 Link will expire on <strong>{getExpiryTime()?.toLocaleString()}</strong>
                  </p>
                )}
                <p className="text-neutral-gray mt-2 text-xs">
                  Attendees scan this code to claim their POAP badge
                </p>
              </div>
            ) : ( // Show Badge Claim Link if not using QR for badge
              <div className="professional-card rounded-3xl p-8 space-y-4 text-center">
                <div className="flex items-center justify-center space-x-3 mb-6">
                  <LinkIcon className="w-6 h-6 text-[--accent-teal]" />
                  <h3 className="text-xl font-bold text-foreground">Badge Claim Link</h3>
                </div>
                <p className="text-neutral-gray text-sm mb-4">
                  Share this link for attendees to claim their POAP badge.
                </p>
                <div className="relative">
                  <Input
                    value={generateBadgeClaimLink()}
                    readOnly
                    className="professional-card border text-foreground placeholder:text-neutral-gray/50 text-center"
                  />
                  <Button 
                    onClick={() => {
                      navigator.clipboard.writeText(generateBadgeClaimLink());
                      onToast({ title: 'Link Copied!', type: 'info' });
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-xs professional-card border text-neutral-gray hover:text-primary-blue"
                  >
                    Copy
                  </Button>
                </div>
                {getExpiryTime() && (
                  <p className="text-neutral-gray mt-4 text-sm">
                    🔒 Link will expire on <strong>{getExpiryTime()?.toLocaleString()}</strong>
                  </p>
                )}
              </div>
            )
          ) : ( // If NOT issuing badge, always show Credential Share Link
            <div className="professional-card rounded-3xl p-8 space-y-4 text-center">
              <div className="flex items-center justify-center space-x-3 mb-6">
                <FileText className="w-6 h-6 text-[--accent-teal]" />
                <h3 className="text-xl font-bold text-foreground">Credential Share Link</h3>
              </div>
              <p className="text-neutral-gray text-sm mb-4">
                Share this link for attendees to prove their presence on social media. No badge will be issued.
              </p>
              <div className="relative">
                <Input
                  value={generateCredLink()}
                  readOnly
                  className="professional-card border text-foreground placeholder:text-neutral-gray/50 text-center"
                />
                <Button 
                  onClick={() => {
                    navigator.clipboard.writeText(generateCredLink());
                    onToast({ title: 'Link Copied!', type: 'info' });
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-xs professional-card border text-neutral-gray hover:text-primary-blue"
                >
                  Copy
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}