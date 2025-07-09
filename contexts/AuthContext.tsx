import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { auth, db } from './firebaseConfig';
import { getFirestore, doc as webDoc, setDoc, getDoc, Firestore, DocumentReference, DocumentData } from 'firebase/firestore';
import { User as FirebaseUser, Auth, ConfirmationResult } from 'firebase/auth';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { doc as rnDoc, FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

interface User {
  id: string;
  phoneNumber: string;
  name: string;
  dataBalance: number;
  callCredit: number;
  nextInvoiceDate: string;
  nextInvoiceAmount: number;
}

interface AuthContextValue {
  user: User | null;
  login: (phoneNumber: string, password: string) => Promise<boolean>;
  signup: (phoneNumber: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  initiatePhoneNumberLogin: (phoneNumber: string) => Promise<boolean>;
  verifyLoginCode: (code: string) => Promise<boolean>;
  initiatePhoneNumberSignup: (phoneNumber: string, name: string) => Promise<boolean>;
  verifySignupCode: (code: string) => Promise<boolean>;
  mockLogin: (phoneNumber: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<FirebaseAuthTypes.ConfirmationResult | ConfirmationResult | null>(null);
  const [pendingUserCreation, setPendingUserCreation] = useState<{ phoneNumber: string; name: string } | null>(null);

  const login = async (phoneNumber: string, password: string): Promise<boolean> => {
    console.warn("The 'login' function is not used with phone authentication. Use 'initiatePhoneNumberLogin' and 'verifyLoginCode'.");
    return false;
  };

  const signup = async (phoneNumber: string, password: string, name: string): Promise<boolean> => {
    console.warn("The 'signup' function is not used with phone authentication. Use 'initiatePhoneNumberSignup' and 'verifySignupCode'.");
    return false;
  };

  const mockLogin = async (phoneNumber: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Normalize phone number (remove non-digits except leading +)
      const formattedPhoneNumber = phoneNumber.startsWith('+') ? phoneNumber : `+216${phoneNumber.replace(/\D/g, '')}`;
      // Use phone number as a pseudo-ID for testing (hashed or sanitized to avoid invalid characters)
      const userId = formattedPhoneNumber.replace(/[^0-9a-zA-Z]/g, '');
      
      const userDocRef = Platform.OS === 'web'
        ? webDoc(db as Firestore, 'users', userId)
        : rnDoc(db as FirebaseFirestoreTypes.Module, 'users', userId) as unknown as DocumentReference<DocumentData, DocumentData>;
      
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        setUser({ id: userId, ...(data || {}) } as User);
        console.log('Mock login successful: User retrieved from Firestore', { id: userId, ...data });
      } else {
        // Create a new user document for testing
        const newUser: User = {
          id: userId,
          phoneNumber: formattedPhoneNumber,
          name: 'Test User',
          dataBalance: 0,
          callCredit: 0,
          nextInvoiceDate: '',
          nextInvoiceAmount: 0,
        };
        await setDoc(userDocRef, newUser);
        setUser(newUser);
        console.log('Mock login successful: New user created in Firestore', newUser);
      }
      
      setIsLoading(false);
      return true;
    } catch (error: any) {
      console.error("Mock login error:", error.message, error.code);
      setIsLoading(false);
      return false;
    }
  };

  const initiatePhoneNumberLogin = async (phoneNumber: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      let result: FirebaseAuthTypes.ConfirmationResult | ConfirmationResult;
      if (Platform.OS === 'web') {
        const { RecaptchaVerifier, signInWithPhoneNumber } = await import('firebase/auth');
        const recaptchaContainer = document.getElementById('recaptcha-container');
        if (!recaptchaContainer) {
          throw new Error('reCAPTCHA container not found. Ensure <div id="recaptcha-container"></div> is rendered.');
        }
        const recaptchaVerifier = new RecaptchaVerifier(auth as Auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {
            console.log('reCAPTCHA verified');
          },
          'expired-callback': () => {
            console.warn('reCAPTCHA expired');
          },
        });
        result = await signInWithPhoneNumber(auth as Auth, phoneNumber, recaptchaVerifier);
      } else {
        result = await (auth as FirebaseAuthTypes.Module).signInWithPhoneNumber(phoneNumber);
      }
      setConfirmationResult(result);
      setIsLoading(false);
      return true;
    } catch (error: any) {
      console.error("Error initiating phone number login:", error.message, error.code);
      if (error.code === 'auth/billing-not-enabled') {
        console.error('Please enable billing in Google Cloud Console for project mytt-008 to use phone authentication.');
      }
      setIsLoading(false);
      return false;
    }
  };

  const verifyLoginCode = async (code: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      if (confirmationResult) {
        const userCredential = await confirmationResult.confirm(code);
        if (!userCredential) {
          console.warn("User credential is null after confirming code.");
          setIsLoading(false);
          return false;
        }
        const firebaseUser = userCredential.user;

        const userDocRef = Platform.OS === 'web'
          ? webDoc(db as Firestore, 'users', firebaseUser.uid)
          : rnDoc(db as FirebaseFirestoreTypes.Module, 'users', firebaseUser.uid) as unknown as DocumentReference<DocumentData, DocumentData>;
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const data = userDocSnap.data();
          setUser({ id: firebaseUser.uid, ...(data || {}) } as User);
          setIsLoading(false);
          return true;
        } else {
          console.warn("User authenticated via phone but no Firestore profile found.");
          setIsLoading(false);
          return false;
        }
      }
      setIsLoading(false);
      return false;
    } catch (error: any) {
      console.error("Error verifying login code:", error.message, error.code);
      setIsLoading(false);
      return false;
    }
  };

  const initiatePhoneNumberSignup = async (phoneNumber: string, name: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      let result: FirebaseAuthTypes.ConfirmationResult | ConfirmationResult;
      if (Platform.OS === 'web') {
        const { RecaptchaVerifier, signInWithPhoneNumber } = await import('firebase/auth');
        const recaptchaContainer = document.getElementById('recaptcha-container');
        if (!recaptchaContainer) {
          throw new Error('reCAPTCHA container not found. Ensure <div id="recaptcha-container"></div> is rendered.');
        }
        const recaptchaVerifier = new RecaptchaVerifier(auth as Auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {
            console.log('reCAPTCHA verified');
          },
          'expired-callback': () => {
            console.warn('reCAPTCHA expired');
          },
        });
        result = await signInWithPhoneNumber(auth as Auth, phoneNumber, recaptchaVerifier);
      } else {
        result = await (auth as FirebaseAuthTypes.Module).signInWithPhoneNumber(phoneNumber);
      }
      setConfirmationResult(result);
      setPendingUserCreation({ phoneNumber, name });
      setIsLoading(false);
      return true;
    } catch (error: any) {
      console.error("Error initiating phone number signup:", error.message, error.code);
      if (error.code === 'auth/billing-not-enabled') {
        console.error('Please enable billing in Google Cloud Console for project mytt-008 to use phone authentication.');
      }
      setIsLoading(false);
      setPendingUserCreation(null);
      return false;
    }
  };

  const verifySignupCode = async (code: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      if (confirmationResult && pendingUserCreation) {
        const userCredential = await confirmationResult.confirm(code);
        if (!userCredential) {
          console.warn("User credential is null after confirming code.");
          setIsLoading(false);
          return false;
        }
        const firebaseUser = userCredential.user;

        const newUser: User = {
          id: firebaseUser.uid,
          phoneNumber: pendingUserCreation.phoneNumber,
          name: pendingUserCreation.name,
          dataBalance: 0,
          callCredit: 0,
          nextInvoiceDate: '',
          nextInvoiceAmount: 0,
        };
        const userDocRef = Platform.OS === 'web'
          ? webDoc(db as Firestore, 'users', firebaseUser.uid)
          : rnDoc(db as FirebaseFirestoreTypes.Module, 'users', firebaseUser.uid) as unknown as DocumentReference<DocumentData, DocumentData>;
        await setDoc(userDocRef, newUser);

        setUser(newUser);
        setConfirmationResult(null);
        setPendingUserCreation(null);
        setIsLoading(false);
        return true;
      }
      setIsLoading(false);
      return false;
    } catch (error: any) {
      console.error("Error verifying signup code:", error.message, error.code);
      setIsLoading(false);
      setConfirmationResult(null);
      setPendingUserCreation(null);
      return false;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      if (Platform.OS === 'web') {
        const { signOut } = await import('firebase/auth');
        await signOut(auth as Auth);
      } else {
        await (auth as FirebaseAuthTypes.Module).signOut();
      }
      setUser(null);
      setIsLoading(false);
    } catch (error: any) {
      console.error("Logout failed:", error.message, error.code);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = Platform.OS === 'web'
      ? (async () => {
          const { onAuthStateChanged } = await import('firebase/auth');
          return onAuthStateChanged(auth as Auth, async (firebaseUser: FirebaseUser | null) => {
            if (firebaseUser) {
              const userDocRef = webDoc(db as Firestore, 'users', firebaseUser.uid);
              const userDocSnap = await getDoc(userDocRef);

              if (userDocSnap.exists()) {
                const data = userDocSnap.data();
                setUser({ id: firebaseUser.uid, ...(data || {}) } as User);
              } else {
                console.warn("Authenticated Firebase user has no Firestore profile.");
                setUser({
                  id: firebaseUser.uid,
                  phoneNumber: firebaseUser.phoneNumber || '',
                  name: 'Unknown User',
                  dataBalance: 0,
                  callCredit: 0,
                  nextInvoiceDate: '',
                  nextInvoiceAmount: 0,
                });
              }
            } else {
              setUser(null);
            }
            setIsLoading(false);
          });
        })()
      : (auth as FirebaseAuthTypes.Module).onAuthStateChanged(async (firebaseUser: FirebaseAuthTypes.User | null) => {
          if (firebaseUser) {
            const userDocRef = rnDoc(db as FirebaseFirestoreTypes.Module, 'users', firebaseUser.uid) as unknown as DocumentReference<DocumentData, DocumentData>;
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
              const data = userDocSnap.data();
              setUser({ id: firebaseUser.uid, ...(data || {}) } as User);
            } else {
              console.warn("Authenticated Firebase user has no Firestore profile.");
              setUser({
                id: firebaseUser.uid,
                phoneNumber: firebaseUser.phoneNumber || '',
                name: 'Unknown User',
                dataBalance: 0,
                callCredit: 0,
                nextInvoiceDate: '',
                nextInvoiceAmount: 0,
              });
            }
          } else {
            setUser(null);
          }
          setIsLoading(false);
        });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        isLoading,
        initiatePhoneNumberLogin,
        verifyLoginCode,
        initiatePhoneNumberSignup,
        verifySignupCode,
        mockLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}