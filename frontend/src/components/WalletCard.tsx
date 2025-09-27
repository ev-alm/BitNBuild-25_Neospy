import { motion } from 'motion/react';
import { Wallet, TrendingUp, TrendingDown, Plus, Minus, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface WalletCardProps {
  balance: string;
  currency?: string;
  showActions?: boolean;
  onDeposit?: () => void;
  onWithdraw?: () => void;
}

export default function WalletCard({ 
  balance, 
  currency = 'POAP', 
  showActions = true,
  onDeposit,
  onWithdraw 
}: WalletCardProps) {
  
  // Mock recent transactions for demo
  const recentTransactions = [
    { type: 'earn', amount: '+1.5', description: 'Badge claim reward', time: '2 hours ago' },
    { type: 'earn', amount: '+2.0', description: 'Event completion bonus', time: '1 day ago' },
    { type: 'earn', amount: '+0.8', description: 'First claim bonus', time: '3 days ago' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Main Wallet Card */}
      <Card className="glass-card border-purple-400/30 overflow-hidden relative">
        {/* Animated background */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-2xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 4, repeat: Infinity }}
          />
        </div>

        <CardHeader className="relative">
          <CardTitle className="flex items-center space-x-3 text-white">
            <div className="relative">
              <Wallet className="w-6 h-6 text-purple-400" />
              <motion.div
                className="absolute inset-0"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Wallet className="w-6 h-6 text-purple-400 opacity-30" />
              </motion.div>
            </div>
            <span>POAP Wallet</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="relative space-y-6">
          {/* Balance Display */}
          <div className="text-center">
            <motion.div
              className="text-4xl font-bold text-white mb-2"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              {balance} <span className="text-2xl text-purple-300">{currency}</span>
            </motion.div>
            <p className="text-purple-300">Available Balance</p>
          </div>

          {/* Action Buttons */}
          {showActions && (
            <div className="flex space-x-4">
              <Button
                onClick={onDeposit}
                className="flex-1 glass-card border-green-400/30 text-green-300 hover:text-white hover:border-green-400/50"
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Funds
              </Button>
              
              <Button
                onClick={onWithdraw}
                className="flex-1 glass-card border-red-400/30 text-red-300 hover:text-white hover:border-red-400/50"
                variant="outline"
              >
                <Minus className="w-4 h-4 mr-2" />
                Withdraw
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="glass-card border-purple-400/30">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <span>Recent Activity</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {recentTransactions.map((tx, index) => (
            <motion.div
              key={index}
              className="flex items-center justify-between glass-card rounded-xl p-3 hover:bg-white/5 transition-colors"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center space-x-3">
                <div className={`
                  p-2 rounded-lg
                  ${tx.type === 'earn' 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-red-500/20 text-red-400'
                  }
                `}>
                  {tx.type === 'earn' ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                </div>
                
                <div>
                  <p className="text-white font-medium">{tx.description}</p>
                  <p className="text-purple-300 text-sm">{tx.time}</p>
                </div>
              </div>
              
              <div className={`
                font-bold
                ${tx.type === 'earn' 
                  ? 'text-green-400' 
                  : 'text-red-400'
                }
              `}>
                {tx.amount} {currency}
              </div>
            </motion.div>
          ))}
          
          {recentTransactions.length === 0 && (
            <div className="text-center py-6 text-purple-300">
              <Wallet className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No recent activity</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}