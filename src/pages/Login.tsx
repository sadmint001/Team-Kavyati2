import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { useNavigate, Navigate } from 'react-router-dom';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { Phone, User, Loader2, ArrowRight, KeyRound } from 'lucide-react';
import Logo from '../components/ui/Logo';

const KE_PREFIX = '+254';
const toFullPhone = (local: string) =>
  `${KE_PREFIX}${local.replace(/^0/, '').replace(/\D/g, '')}`;

type Tab = 'login' | 'register';

// ─── Compact PIN input ────────────────────────────────────────────────────────
const PinInput: React.FC<{ value: string; onChange: (v: string) => void; label?: string }> = ({
  value, onChange, label,
}) => {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(4, ' ').split('').slice(0, 4);

  const handleKey = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      const next = (value.slice(0, idx) + value.slice(idx + 1)).slice(0, 4);
      onChange(next);
      if (idx > 0) refs.current[idx - 1]?.focus();
    }
  };

  const handleChange = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const char = e.target.value.replace(/\D/g, '').slice(-1);
    if (!char) return;
    const arr = value.padEnd(4, ' ').split('');
    arr[idx] = char;
    const next = arr.join('').slice(0, 4);
    onChange(next);
    if (idx < 3) refs.current[idx + 1]?.focus();
  };

  return (
    <div className="space-y-2">
      {label && (
        <Label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground ml-1">
          <KeyRound className="inline w-3 h-3 mr-1 text-primary-gold/60" />
          {label}
        </Label>
      )}
      <div className="flex gap-2 justify-start">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={el => { refs.current[i] = el; }}
            type="password"
            inputMode="numeric"
            maxLength={1}
            value={d.trim() === '' ? '' : d}
            onChange={e => handleChange(i, e)}
            onKeyDown={e => handleKey(i, e)}
            placeholder="•"
            aria-label={`${label ?? 'PIN'} digit ${i + 1}`}
            className="w-10 h-10 text-center text-base font-black bg-white/[0.04] border border-white/10 text-primary-gold focus:outline-none focus:border-primary-gold transition-all rounded-none placeholder:text-white/20"
            style={{ caretColor: 'transparent' }}
          />
        ))}
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const Login: React.FC = () => {
  const { user, loginWithGoogle, loginWithPhone, signupWithPhone, loading } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>('login');
  const [busy, setBusy] = useState(false);

  // login
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPin, setLoginPin] = useState('');

  // register
  const [name, setName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  if (loading) return null;
  if (user) return <Navigate to="/dashboard" />;

  const switchTab = (t: Tab) => {
    setTab(t);
    setLoginPhone(''); setLoginPin('');
    setName(''); setRegPhone(''); setPin(''); setConfirmPin('');
  };

  // ── Login ──────────────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loginPhone.replace(/\D/g, '').length < 9) { toast.error('Enter a valid phone number.'); return; }
    if (loginPin.length < 4) { toast.error('Enter your 4-digit PIN.'); return; }
    setBusy(true);
    try {
      await loginWithPhone(toFullPhone(loginPhone), loginPin);
      toast.success('Welcome back.');
      navigate('/dashboard');
    } catch (err: any) {
      const msg =
        err.code === 'auth/user-not-found' ? 'No account found for this number.' :
        err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential' ? 'Incorrect PIN.' :
        err.code === 'auth/too-many-requests' ? 'Too many attempts. Try again later.' :
        `Login failed (${err.code ?? err.message})`;
      toast.error(msg);
    } finally { setBusy(false); }
  };

  // ── Register ───────────────────────────────────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Enter your full name.'); return; }
    if (regPhone.replace(/\D/g, '').length < 9) { toast.error('Enter a valid phone number.'); return; }
    if (pin.length < 4) { toast.error('PIN must be 4 digits.'); return; }
    if (pin !== confirmPin) { toast.error('PINs do not match.'); return; }
    setBusy(true);
    try {
      await signupWithPhone(name.trim(), toFullPhone(regPhone), pin);
      toast.success('Account created. Welcome to the circle.');
      navigate('/dashboard');
    } catch (err: any) {
      const msg =
        err.code === 'auth/email-already-in-use' ? 'An account with this number already exists.' :
        err.code === 'auth/too-many-requests' ? 'Too many attempts. Try again later.' :
        `Registration failed (${err.code ?? err.message})`;
      toast.error(msg);
    } finally { setBusy(false); }
  };

  // ── Google ──────────────────────────────────────────────────────────────────
  const handleGoogleLogin = async () => {
    setBusy(true);
    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(`Google sign-in failed: ${err.code ?? err.message}`);
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] px-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,rgba(212,175,55,0.10),transparent_70%)]" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(212,175,55,0.04),transparent_70%)]" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo + heading */}
        <div className="text-center mb-10">
          <Logo size="lg" className="mx-auto mb-8" />
          <h1 className="text-3xl font-heading text-white tracking-[0.2em] uppercase mb-3 text-glow-gold">
            {tab === 'login' ? 'Member Portal' : 'Join the Circle'}
          </h1>
          <p className="text-muted-foreground text-sm tracking-widest opacity-70 italic">
            {tab === 'login' ? '"Accountability starts here."' : '"The journey to discipline begins now."'}
          </p>
        </div>

        <div className="premium-glass p-8 rounded-none border border-primary-gold/10 relative overflow-hidden">
          {/* Tab switcher */}
          <div className="flex mb-8 border-b border-white/5">
            {(['login', 'register'] as Tab[]).map(t => (
              <button
                key={t}
                onClick={() => switchTab(t)}
                className={`flex-1 pb-4 text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                  tab === t
                    ? 'text-primary-gold border-b-2 border-primary-gold'
                    : 'text-muted-foreground opacity-50 hover:opacity-100'
                }`}
              >
                {t === 'login' ? 'Login' : 'Join'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* ─── LOGIN FORM ─────────────────────────────────────────────── */}
            {tab === 'login' && (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleLogin}
                className="space-y-5"
              >
                {/* Phone */}
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground ml-1">Phone Number</Label>
                  <div className="flex">
                    <span className="flex items-center px-3 bg-white/[0.03] border border-r-0 border-white/10 text-primary-gold text-sm font-bold whitespace-nowrap">
                      +254
                    </span>
                    <div className="relative flex-1">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-gold/50" />
                      <Input
                        id="login-phone"
                        type="tel"
                        placeholder="7XXXXXXXX"
                        value={loginPhone}
                        onChange={e => setLoginPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                        className="bg-white/[0.03] border-white/10 pl-10 h-12 focus:border-primary-gold rounded-none text-white transition-all text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* PIN */}
                <PinInput value={loginPin} onChange={setLoginPin} label="4-Digit PIN" />

                <Button
                  type="submit"
                  disabled={busy}
                  className="w-full h-12 bg-primary-gold hover:bg-gold-light text-black font-black uppercase tracking-[0.2em] text-xs shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-all duration-300 rounded-none group mt-2"
                >
                  {busy ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (
                    <span className="flex items-center gap-2">
                      Access Portal <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </Button>

                {/* Google divider */}
                <div className="relative mt-6 border-t border-white/5">
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-4 bg-[#0A0A0A] text-[10px] uppercase tracking-[0.3em] text-muted-foreground whitespace-nowrap">
                    Or continue with
                  </span>
                </div>
                <Button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={busy}
                  variant="outline"
                  className="w-full h-11 border-white/10 hover:border-primary-gold/50 text-white font-bold flex items-center justify-center gap-3 transition-all rounded-none uppercase tracking-widest text-[10px] bg-white/[0.02] mt-2"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </Button>
              </motion.form>
            )}

            {/* ─── REGISTER FORM ──────────────────────────────────────────── */}
            {tab === 'register' && (
              <motion.form
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleRegister}
                className="space-y-5"
              >
                {/* Name */}
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground ml-1">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-gold/50" />
                    <Input
                      id="reg-name"
                      placeholder="e.g. Jane Doe"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="bg-white/[0.03] border-white/10 pl-10 h-12 focus:border-primary-gold rounded-none text-white transition-all text-sm"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground ml-1">Phone Number</Label>
                  <div className="flex">
                    <span className="flex items-center px-3 bg-white/[0.03] border border-r-0 border-white/10 text-primary-gold text-sm font-bold whitespace-nowrap">
                      +254
                    </span>
                    <div className="relative flex-1">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-gold/50" />
                      <Input
                        id="reg-phone"
                        type="tel"
                        placeholder="7XXXXXXXX"
                        value={regPhone}
                        onChange={e => setRegPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                        className="bg-white/[0.03] border-white/10 pl-10 h-12 focus:border-primary-gold rounded-none text-white transition-all text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* PIN */}
                <PinInput value={pin} onChange={setPin} label="Create 4-Digit PIN" />

                {/* Confirm PIN */}
                <PinInput value={confirmPin} onChange={setConfirmPin} label="Confirm PIN" />
                {confirmPin.length === 4 && pin !== confirmPin && (
                  <p className="text-red-400 text-[10px] tracking-widest -mt-2 ml-1">PINs do not match</p>
                )}

                <Button
                  type="submit"
                  disabled={busy}
                  className="w-full h-12 bg-primary-gold hover:bg-gold-light text-black font-black uppercase tracking-[0.2em] text-xs shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-all duration-300 rounded-none group mt-2"
                >
                  {busy ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (
                    <span className="flex items-center gap-2">
                      Register Entry <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
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
