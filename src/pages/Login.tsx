import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { useNavigate, Navigate } from 'react-router-dom';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { Mail, Lock, User, Loader2, ArrowRight } from 'lucide-react';

import Logo from '../components/ui/Logo';

const Login: React.FC = () => {
  const { user, loginWithGoogle, loginWithEmail, signupWithEmail, loading } = useAuth();
  const navigate = useNavigate();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  if (loading) return null;
  if (user) return <Navigate to="/dashboard" />;

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (error: any) {
      console.error(error);
      toast.error(`Google login failed: ${error.code || error.message}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (!isLogin && !name)) {
      toast.error("Please fill in all fields.");
      return;
    }

    setAuthLoading(true);
    try {
      if (isLogin) {
        await loginWithEmail(email, password);
        toast.success("Welcome back.");
      } else {
        await signupWithEmail(email, password, name);
        toast.success("Account created. Welcome to the circle.");
      }
      navigate('/dashboard');
    } catch (error: any) {
      const message = error.code === 'auth/user-not-found' ? "Account not found." : 
                     error.code === 'auth/wrong-password' ? "Invalid credentials." :
                     error.code === 'auth/email-already-in-use' ? "Email already exists." : 
                     "Authentication failed.";
      toast.error(message);
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] px-4 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,rgba(212,175,55,0.1),transparent_70%)]" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <Logo size="lg" className="mx-auto mb-8" />
          <h1 className="text-3xl font-heading text-white tracking-[0.2em] uppercase mb-3 text-glow-gold">
            {isLogin ? 'Member Portal' : 'Join the Circle'}
          </h1>
          <p className="text-muted-foreground italic text-sm tracking-widest opacity-70 italic">
            {isLogin ? '"Accountability starts here."' : '"The journey to discipline begins now."'}
          </p>
        </div>

        <div className="premium-glass p-8 rounded-none border border-primary-gold/10 relative overflow-hidden">
          <div className="flex mb-8 border-b border-white/5">
            <button 
              onClick={() => setIsLogin(true)}
              className={`flex-1 pb-4 text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 ${isLogin ? 'text-primary-gold border-b-2 border-primary-gold' : 'text-muted-foreground opacity-50 hover:opacity-100'}`}
            >
              Login
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`flex-1 pb-4 text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 ${!isLogin ? 'text-primary-gold border-b-2 border-primary-gold' : 'text-muted-foreground opacity-50 hover:opacity-100'}`}
            >
              Join
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode='wait'>
              {!isLogin && (
                <motion.div
                  key="name-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 overflow-hidden"
                >
                  <Label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground ml-1">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-gold/50" />
                    <Input 
                      placeholder="e.g. John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-white/[0.03] border-white/10 pl-10 h-12 focus:border-primary-gold rounded-none text-white transition-all text-sm"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground ml-1">Email Identifier</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-gold/50" />
                <Input 
                  type="email"
                  placeholder="name@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/[0.03] border-white/10 pl-10 h-12 focus:border-primary-gold rounded-none text-white transition-all text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground ml-1">Personal Passkey</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-gold/50" />
                <Input 
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/[0.03] border-white/10 pl-10 h-12 focus:border-primary-gold rounded-none text-white transition-all text-sm"
                />
              </div>
            </div>

            <Button 
              type="submit"
              disabled={authLoading}
              className="w-full h-14 bg-primary-gold hover:bg-gold-light text-black font-black uppercase tracking-[0.2em] text-xs shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-all duration-300 rounded-none group mt-4"
            >
              {authLoading ? (
                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
              ) : (
                <span className="flex items-center gap-2">
                  {isLogin ? 'Access Portal' : 'Register Entry'} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
          </form>

          <div className="relative my-8 border-t border-white/5">
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-4 bg-[#0A0A0A] text-[10px] uppercase tracking-[0.3em] text-muted-foreground whitespace-nowrap">
              Or through Google
            </span>
          </div>

          <Button 
            onClick={handleGoogleLogin}
            variant="outline"
            className="w-full h-12 border-white/10 hover:border-primary-gold/50 text-white font-bold flex items-center justify-center gap-3 transition-all rounded-none uppercase tracking-widest text-[10px] bg-white/[0.02]"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" className="mr-2">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </Button>
        </div>

        <button 
          onClick={() => navigate('/')}
          className="mt-8 text-[10px] text-muted-foreground hover:text-primary-gold transition-colors block mx-auto uppercase tracking-[0.3em] font-medium"
        >
          ← Return to Sanctuary
        </button>
      </motion.div>
    </div>
  );
};

export default Login;
