import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  User,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { dbService } from '../lib/db';
import { hashPin } from '../lib/pinUtils';

// Derives a stable internal Firebase email from a phone number.
// The user never sees this — it's purely an auth identifier.
const phoneToEmail = (phone: string) =>
  `${phone.replace(/\D/g, '')}@kavyati.phone`;

interface AuthContextType {
  user: User | null;
  role: 'user' | 'admin' | null;
  subscriptionTier: 'bronze' | 'silver' | 'gold' | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithPhone: (phone: string, pin: string) => Promise<void>;
  signupWithPhone: (name: string, phone: string, pin: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'user' | 'admin' | null>(null);
  const [subscriptionTier, setSubscriptionTier] = useState<'bronze' | 'silver' | 'gold' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const userData = await dbService.getDocument('users', firebaseUser.uid) as any;
          if (userData) {
            setRole(userData.role);
            setSubscriptionTier(userData.subscription_tier);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setRole(null);
        setSubscriptionTier(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // ─── Google Sign-In ───────────────────────────────────────────────────────
  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const cred = await signInWithPopup(auth, provider);
    const existing = await dbService.getDocument('users', cred.user.uid) as any;
    if (!existing) {
      await dbService.setDocument('users', cred.user.uid, {
        full_name: cred.user.displayName || 'Member',
        email: cred.user.email || '',
        phone_number: cred.user.phoneNumber || '',
        role: 'user',
        subscription_tier: null,
        created_at: new Date().toISOString(),
        is_suspended: false,
      });
      setRole('user');
      setSubscriptionTier(null);
    }
  };

  // ─── Phone + PIN Login ────────────────────────────────────────────────────
  const loginWithPhone = async (phone: string, pin: string) => {
    const email = phoneToEmail(phone);
    // PIN hash is used as the Firebase password — deterministic & always ≥64 chars
    const password = await hashPin(pin);
    await signInWithEmailAndPassword(auth, email, password);
    // role/tier will be set by onAuthStateChanged listener
  };

  // ─── Phone + PIN Registration ─────────────────────────────────────────────
  const signupWithPhone = async (name: string, phone: string, pin: string) => {
    const email = phoneToEmail(phone);
    const password = await hashPin(pin);
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    await dbService.setDocument('users', cred.user.uid, {
      full_name: name,
      phone_number: phone,
      pin_hash: password, // store hash for future PIN management
      role: 'user',
      subscription_tier: null,
      created_at: new Date().toISOString(),
      is_suspended: false,
    });
    setRole('user');
    setSubscriptionTier(null);
  };

  // ─── Logout ───────────────────────────────────────────────────────────────
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user, role, subscriptionTier, loading,
      loginWithGoogle, loginWithPhone, signupWithPhone, logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
