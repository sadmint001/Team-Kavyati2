import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  User,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { dbService } from '../lib/db';

interface AuthContextType {
  user: User | null;
  role: 'user' | 'admin' | null;
  subscriptionTier: 'bronze' | 'silver' | 'gold' | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signupWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'user' | 'admin' | null>(null);
  const [subscriptionTier, setSubscriptionTier] = useState<'bronze' | 'silver' | 'gold' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        try {
          const userData = await dbService.getDocument('users', user.uid) as any;
          if (userData) {
            setRole(userData.role);
            setSubscriptionTier(userData.subscription_tier);
          } else {
            // First time login - create user document
            const newUser = {
              full_name: user.displayName || 'Anonymous',
              email: user.email || '',
              role: 'user',
              subscription_tier: null,
              created_at: new Date().toISOString(), // In real app, use serverTimestamp
              is_suspended: false
            };
            // Note: In a real production app, we'd use a server-side creation or cloud function
            // to ensure strict validation of created_at and role.
            await dbService.setDocument('users', user.uid, newUser);
            setRole('user');
            setSubscriptionTier(null);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setRole(null);
        setSubscriptionTier(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    // Adding custom parameters can sometimes help with popup issues
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Firebase Auth Error:", error.code, error.message, error);
      throw error;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error: any) {
      console.error("Email login failed:", error);
      throw error;
    }
  };

  const signupWithEmail = async (email: string, pass: string, name: string) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(cred.user, { displayName: name });
    } catch (error: any) {
      console.error("Signup failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, role, subscriptionTier, loading, loginWithGoogle, loginWithEmail, signupWithEmail, logout }}>
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
