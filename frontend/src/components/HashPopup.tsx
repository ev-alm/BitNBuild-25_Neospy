import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Copy, CheckCircle, Hash, Sparkles, X } from 'lucide-react';
import { Button } from './ui/button';

interface HashPopupProps {
  isOpen: boolean;
  onClose: () => void;
  badgeName: string;
  hash: string;
}

export default function HashPopup({ isOpen, onClose, badgeName, hash }: HashPopupProps) {
  const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy hash:', err);
    }
  };

  const Confetti = () => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            backgroundColor: ['#8b5cf6', '#ec4899', '#3b82f6', '#06b6d4'][i % 4],
            left: `${Math.random() * 100}%`,
            top: '-10px',
          }}
          animate={{
            y: [0, 300],
            x: [0, Math.random() * 100 - 50],
            rotate: [0, 360],
            opacity: [1, 0],
          }}
          transition={{
            duration: 2,
            delay: Math.random() * 0.5,
            ease: "easeOut"
          }}
        />
      ))}
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Popup */}
          <motion.div
            className="relative glass-card rounded-3xl p-8 max-w-md w-full mx-4 border-2 border-purple-400/30"
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {showConfetti && <Confetti />}

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-purple-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.2, 1]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-block mb-4"
              >
                <div className="relative">
                  <Hash className="w-16 h-16 text-purple-400" />
                  <div className="absolute inset-0 blur-sm">
                    <Hash className="w-16 h-16 text-purple-400" />
                  </div>
                </div>
              </motion.div>

              <h2 className="text-2xl font-bold mb-2 text-white">Badge Secured!</h2>
              <p className="text-purple-300">
                Your <span className="text-purple-200 font-medium">{badgeName}</span> badge has been claimed and secured on the blockchain
              </p>
            </div>

            {/* Hash Display */}
            <div className="space-y-4">
              <div className="glass-card rounded-2xl p-4 border border-purple-400/20">
                <div className="flex items-center space-x-2 mb-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-medium text-purple-200">Unique Hash</span>
                </div>
                
                <div className="relative">
                  <code className="block text-xs text-purple-100 font-mono bg-purple-900/20 rounded-lg p-3 break-all">
                    {hash}
                  </code>
                  
                  {/* Hash glow effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-lg"
                    animate={{ 
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
              </div>

              {/* Copy Button */}
              <Button
                onClick={copyToClipboard}
                className="w-full glow-button py-3 rounded-xl"
                disabled={copied}
              >
                <div className="flex items-center justify-center space-x-2">
                  {copied ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                      <span>Copy Hash</span>
                    </>
                  )}
                </div>
              </Button>

              {/* Info */}
              <div className="text-center text-sm text-purple-300 space-y-1">
                <p>This unique hash proves your attendance</p>
                <p>Keep it safe - it's your proof of presence!</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}