import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== "(default)" 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId) 
  : getFirestore(app);
export const auth = getAuth(app);

/**
 * Initializes an invisible reCAPTCHA verifier attached to the given container element ID.
 * Always clears any existing verifier first to prevent duplicate widget errors.
 */
export function createRecaptchaVerifier(containerId: string): RecaptchaVerifier {
  // Clear any previous verifier instance
  const existing = (window as any).__recaptchaVerifier;
  if (existing) {
    try { existing.clear(); } catch (_) {}
    (window as any).__recaptchaVerifier = null;
  }
  const verifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {},
    'expired-callback': () => {},
  });
  (window as any).__recaptchaVerifier = verifier;
  return verifier;
}
