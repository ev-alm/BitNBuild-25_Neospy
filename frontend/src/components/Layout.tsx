import { motion } from 'motion/react';
import { Trophy, Plus, Wallet, Sparkles, Hexagon } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

export default function Layout({ children, currentPage, onPageChange }: LayoutProps) {
  const navItems = [
    { id: 'create', label: 'Create Event', icon: Plus },
    { id: 'claim', label: 'Claim POAP', icon: Hexagon },
    { id: 'collection', label: 'My Collection', icon: Trophy },
  ];

  return (
    <div className="min-h-screen relative">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute opacity-20"
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              left: `${10 + i * 15}%`,
              top: `${20 + i * 10}%`,
            }}
          >
            <Hexagon className="w-8 h-8 text-purple-400" />
          </motion.div>
        ))}
      </div>

      {/* Navigation */}
      <nav className="relative z-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="glass-card rounded-2xl p-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <motion.div 
                className="flex items-center space-x-3"
                whileHover={{ scale: 1.05 }}
              >
                <div className="relative">
                  <Sparkles className="w-8 h-8 text-purple-400" />
                  <div className="absolute inset-0 blur-sm">
                    <Sparkles className="w-8 h-8 text-purple-400" />
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-bold">POAP</h1>
                  <p className="text-xs text-purple-300">Proof of Presence</p>
                </div>
              </motion.div>

              {/* Navigation Items */}
              <div className="flex items-center space-x-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  
                  return (
                    <motion.button
                      key={item.id}
                      onClick={() => onPageChange(item.id)}
                      className={`
                        flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300
                        ${isActive 
                          ? 'glow-button text-white' 
                          : 'glass-card hover:glass-card text-purple-200 hover:text-white'
                        }
                      `}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="hidden md:inline">{item.label}</span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Wallet Connection */}
              <motion.button 
                className="glow-button px-4 py-2 rounded-xl flex items-center space-x-2 text-white"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Wallet className="w-5 h-5" />
                <span className="hidden md:inline">Connect Wallet</span>
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}