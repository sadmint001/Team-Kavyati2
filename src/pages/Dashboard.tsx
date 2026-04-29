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
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedTier, setSelectedTier] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleOpenPayment = (tier: any) => {
    setSelectedTier(tier);
    setIsDialogOpen(true);
  };

  const handleMpesaPay = async () => {
    if (!phoneNumber) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setIsProcessing(true);
    const toastId = toast.loading('Initiating STK Push...');
    const amount = parseInt(selectedTier.price.replace(/,/g, ''));

    try {
      const response = await fetch('/api/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phoneNumber, 
          amount,
          userId: user?.uid,
          tierId: selectedTier.id
        }),
      });

      // Check if the response is actually JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response received:", text.substring(0, 200));
        throw new Error("The server returned a page instead of a response. Check your Netlify functions deployment.");
      }

      const data = await response.json();

      if (response.ok) {
        toast.success('STK Push Sent! 📱', {
          id: toastId,
          description: 'Please check your phone and enter your M-Pesa PIN.'
        });
        setIsDialogOpen(false);
      } else {
        const serverError = data.fullError?.errorMessage || data.error || "Payment failed to initiate";
        toast.error("Payment Failed", {
          id: toastId,
          description: serverError,
        });
      }
    } catch (error: any) {
      console.error("Payment Initiation Error:", error);
      toast.error("Connection Error", {
        id: toastId,
        description: error.message || "Could not connect to the payment server.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const tiers = [
    {
      id: 'bronze',
      name: 'Bronze',
      price: '10,000',
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
    <div className="container mx-auto px-4 py-12 pb-24">
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
                      onClick={() => handleOpenPayment(tier)}
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

      {/* Payment Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-black border-primary-gold/30 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-heading text-primary-gold uppercase">Secure M-Pesa Checkout</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Enter your M-Pesa number to receive the payment prompt for your {selectedTier?.name} commitment.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-6">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
              <span className="text-sm font-heading uppercase">Amount to pay:</span>
              <span className="text-xl font-heading text-primary-gold">KES {selectedTier?.price}</span>
            </div>
            <div className="space-y-3">
              <Label htmlFor="phone" className="text-white uppercase tracking-widest text-xs font-bold">M-Pesa Number</Label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-gold" />
                <Input
                  id="phone"
                  placeholder="e.g. 07XXXXXXXX"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="bg-white/5 border-white/20 pl-10 focus:border-primary-gold text-white placeholder:text-white/20"
                />
              </div>
              <p className="text-[10px] text-muted-foreground italic tracking-tight">Format: 07XXXXXXXX or 254XXXXXXXXX</p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              onClick={handleMpesaPay}
              disabled={isProcessing || !phoneNumber}
              className="w-full bg-primary-gold hover:bg-gold-light text-black font-black uppercase tracking-widest h-12"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Initiating...
                </>
              ) : (
                "Prompt M-Pesa PIN"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
