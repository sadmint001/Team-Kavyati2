import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  Trophy, 
  Target, 
  MessageCircle, 
  ArrowRight,
  Infinity,
  Zap,
  Crown,
  Check,
  Smartphone,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

const Dashboard: React.FC = () => {
  const { user, subscriptionTier, role } = useAuth();
  const [isWaiting, setIsWaiting] = useState(false);

  const handleMpesaPay = (tier: any) => {
    const amount = tier.price.replace(/,/g, '');
    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const checkoutRequestId = `KAV_${Date.now()}_${randomSuffix}`;
    const customerName = user?.displayName || 'KAVYATI_MEMBER';

    // Construct the Lipwa Link with pre-filled details and UI hiding attempts
    const lipwaLink = `https://lipwa.link/8237?amount=${amount}&customer_name=${encodeURIComponent(customerName)}&external_reference=${checkoutRequestId}&provider=m-pesa&hide_merchant=1&hide_branding=1&hide_details=1&hide_header=1`;

    // Centered Popup Logic
    const width = 500;
    const height = 700;
    const left = (window.screen.width / 2) - (width / 2);
    const top = (window.screen.height / 2) - (height / 2);

    setIsWaiting(true);
    toast.success('Secure Checkout Opening...', {
      description: 'Complete your payment in the pop-up window.'
    });

    const paymentWindow = window.open(
      lipwaLink, 
      'PayHeroCheckout', 
      `width=${width},height=${height},top=${top},left=${left},status=no,menubar=no,toolbar=no,location=no`
    );

    // Check if window is closed to remove the waiting state
    const timer = setInterval(() => {
      if (paymentWindow?.closed) {
        clearInterval(timer);
        setIsWaiting(false);
        toast.info('Payment window closed.', {
          description: 'If you completed the payment, your status will update shortly.'
        });
      }
    }, 1000);
  };

  const tiers = [
    {
      id: 'bronze',
      name: 'Bronze',
      price: '10',
      icon: <Target className="w-8 h-8 text-orange-400" />,
      features: ['Community access', 'Weekly challenges', 'Accountability check-ins'],
      color: 'bg-orange-950/20 text-orange-400 border-orange-400/30'
    },
    {
      id: 'silver',
      name: 'Silver',
      price: '15,000',
      icon: <Zap className="w-8 h-8 text-slate-300" />,
      features: ['All Bronze features', 'Exclusive resources', 'Monthly 1-on-1 session', 'Priority support'],
      color: 'bg-slate-900/50 text-slate-200 border-slate-200/30 font-bold'
    },
    {
      id: 'gold',
      name: 'Gold',
      price: '30,000',
      icon: <Crown className="w-8 h-8 text-primary-gold" />,
      features: ['All Silver features', 'VIP group access', 'Personal growth roadmap', 'Direct mentor line'],
      color: 'bg-primary-gold/10 text-primary-gold border-primary-gold/50 font-black',
      hot: true
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12 pb-24 relative">
      {/* Waiting Overlay */}
      {isWaiting && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center text-center p-6">
          <div className="p-8 border border-primary-gold/30 bg-black/40 rounded-2xl max-w-md">
            <Loader2 className="w-16 h-16 text-primary-gold animate-spin mx-auto mb-6" />
            <h2 className="text-3xl font-heading text-white mb-4 uppercase tracking-widest text-glow-gold">Payment In Progress</h2>
            <p className="text-muted-foreground mb-8">Please complete the payment in the secure pop-up window. Do not close this page.</p>
            <Button 
              variant="outline" 
              className="border-white/10 text-white hover:bg-white/5"
              onClick={() => setIsWaiting(false)}
            >
              Cancel & Return
            </Button>
          </div>
        </div>
      )}

      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 p-10 premium-glass border-l-4 border-l-primary-gold relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Crown size={120} />
          </div>
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-heading text-white mb-2 tracking-widest text-glow-gold">Welcome back, {user?.displayName?.split(' ')[0]}.</h1>
            <p className="text-muted-foreground italic text-lg opacity-80 letter-spacing-wider">"Keep going. Discipline is the only way out."</p>
          </div>
          <div className="flex items-center gap-3 relative z-10">
             <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-bold">Status:</span>
             <Badge className={subscriptionTier ? "bg-primary-gold text-black uppercase px-6 py-2 tracking-widest font-black rounded-none" : "bg-white/10 text-white px-6 py-2 tracking-widest font-bold rounded-none"}>
               {subscriptionTier || 'NO ACTIVE PLAN'}
             </Badge>
          </div>
        </div>
      </motion.div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
         {[
           { icon: <MessageCircle />, title: "Community Feed", desc: "Engage with the circle" },
           { icon: <Trophy />, title: "Live Challenges", desc: "Push your current limits" },
           { icon: <Target />, title: "Personal Goals", desc: "Track your execution" },
         ].map((link, i) => (
            <Card key={i} className="premium-glass p-1 border-transparent hover:border-primary-gold/30 transition-all duration-500 cursor-pointer group rounded-none">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-4 bg-black/40 border border-white/5 rounded-none text-primary-gold group-hover:bg-primary-gold group-hover:text-black transition-all duration-500">
                  {link.icon}
                </div>
                <div>
                   <h3 className="font-heading text-sm uppercase tracking-[0.2em] text-white">{link.title}</h3>
                   <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">{link.desc}</p>
                </div>
                <ArrowRight className="ml-auto w-4 h-4 text-muted-foreground group-hover:text-primary-gold group-hover:translate-x-1 transition-all" />
              </CardContent>
            </Card>
         ))}
      </div>

      {/* Membership Tiers */}
      <div className="mb-8">
         <h2 className="text-4xl font-heading text-center mb-4 uppercase tracking-tighter">Choose Your Commitment</h2>
         <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto italic">"Transformation is not free. It costs your old self."</p>
         
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-4">
            {tiers.map((tier) => (
              <motion.div 
                key={tier.id}
                whileHover={{ y: -10 }}
                className={`relative flex flex-col`}
              >
                {tier.hot && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="bg-crimson text-white border-none py-1 px-4 text-xs font-black shadow-lg">MOST ELITE</Badge>
                  </div>
                )}
                <Card className={`flex-grow h-full premium-glass border-2 flex flex-col transition-all duration-700 overflow-hidden rounded-none ${subscriptionTier === tier.id ? 'border-primary-gold shadow-[0_0_40px_rgba(212,175,55,0.15)]' : 'border-white/5 hover:border-primary-gold/30'}`}>
                  <CardHeader className="text-center border-b border-white/5 p-10 relative overflow-hidden bg-white/[0.01]">
                    {subscriptionTier === tier.id && (
                      <div className="absolute top-4 right-4 p-1">
                        <Check className="w-5 h-5 text-primary-gold" />
                      </div>
                    )}
                    <div className="flex justify-center mb-6 opacity-80 group-hover:opacity-100 transition-opacity">{tier.icon}</div>
                    <CardTitle className={`text-2xl font-heading uppercase tracking-[0.3em] font-black`}>{tier.name}</CardTitle>
                    <div className="mt-6 flex items-baseline justify-center gap-1">
                      <span className="text-3xl font-heading text-primary-gold text-glow-gold">KES {tier.price}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-10 flex-grow">
                    <ul className="space-y-5">
                      {tier.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-4 text-sm text-slate-400 group/item">
                          <Check className="w-4 h-4 text-primary-gold shrink-0 mt-0.5 group-hover/item:scale-125 transition-transform" />
                          <span className="tracking-wide uppercase text-[11px] font-medium">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="p-10 pt-0">
                    <Button 
                      onClick={() => handleMpesaPay(tier)}
                      disabled={subscriptionTier === tier.id}
                      className={`w-full h-14 uppercase font-black tracking-[0.2em] text-xs transition-all duration-500 rounded-none ${subscriptionTier === tier.id ? 'bg-primary-gold/10 text-primary-gold/50 cursor-default border border-primary-gold/20' : 'bg-primary-gold hover:bg-gold-light text-black shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)]'}`}
                    >
                      {subscriptionTier === tier.id ? 'MISSION ACTIVE' : `Commit to ${tier.name}`}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
