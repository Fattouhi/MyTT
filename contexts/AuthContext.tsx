import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAuth, signInWithPhoneNumber, ConfirmationResult, onAuthStateChanged, signOut, RecaptchaVerifier } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { firebaseApp, auth, db } from './firebaseConfig';

interface User {
  id: string;
  phoneNumber: string;
  name: string;
  dataBalance: number;
  callCredit: number;
  nextInvoiceDate: string; // Consider using Firestore Timestamps
  nextInvoiceAmount: number;
}

interface AuthContextValue {
  user: User | null;
  login: (phoneNumber: string, password: string) => Promise<boolean>;
  signup: (
    phoneNumber: string,
    password: string, // Password might be handled differently with phone auth
    name: string
  ) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  // We might need to expose state or functions for the multi-step phone auth process
  // depending on how the UI interacts with this context. Let's start simple.
  initiatePhoneNumberLogin: (phoneNumber: string) => Promise<boolean>;
  verifyLoginCode: (code: string) => Promise<boolean>;
  initiatePhoneNumberSignup: (phoneNumber: string, name: string) => Promise<boolean>;
  verifySignupCode: (code: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [pendingUserCreation, setPendingUserCreation] = useState<{ phoneNumber: string; name: string } | null>(null); // To store data for signup before code verification

  // This will likely not be used directly with phone auth, but kept for interface consistency
  const login = async (
    phoneNumber: string,
    password: string
  ): Promise<boolean> => {
    console.warn("The 'login' function is not used with phone authentication. Use 'initiatePhoneNumberLogin' and 'verifyLoginCode'.");
    return false;
  };

   // This will likely not be used directly with phone auth, but kept for interface consistency
   const signup = async (
     phoneNumber: string,
     password: string,
     name: string
   ): Promise<boolean> => {
     console.warn("The 'signup' function is not used with phone authentication. Use 'initiatePhoneNumberSignup' and 'verifySignupCode'.");
     return false;
   };


  const initiatePhoneNumberLogin = async (phoneNumber: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response: any) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
          // ...
        }
      });

      const result = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      setConfirmationResult(result);
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error("Error initiating phone number login:", error);
      setIsLoading(false);
      return false;
    }
  };

   const verifyLoginCode = async (code: string): Promise<boolean> => {
     setIsLoading(true);
     try {
       if (confirmationResult) {
         const userCredential = await confirmationResult.confirm(code);
         const firebaseUser = userCredential.user;

         // After successful verification, fetch user data from Firestore
         const userDocRef = doc(db, 'users', firebaseUser.uid);
         const userDocSnap = await getDoc(userDocRef);

         if (userDocSnap.exists()) {
            setUser({ id: firebaseUser.uid, ...userDocSnap.data() } as User);
            setIsLoading(false);
            return true;
         } else {
            // User is authenticated but no Firestore document. This might indicate
            // a user who started signup but didn't complete it, or an error.
            // Handle this based on your app's logic (e.g., force them to complete profile)
            console.warn("User authenticated via phone but no Firestore profile found.");
            setIsLoading(false);
            return false; // Or handle redirection to profile completion
         }
       }
       setIsLoading(false);
        return false; // No confirmation result
     } catch (error) {
       console.error("Error verifying login code:", error);
       setIsLoading(false);
       return false;
     }
   };

   const initiatePhoneNumberSignup = async (phoneNumber: string, name: string): Promise<boolean> => {
     setIsLoading(true);
     try {
       const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
         'size': 'invisible',
         'callback': (response: any) => {
           // reCAPTCHA solved, allow signInWithPhoneNumber.
           // ...
         }
       });

       const result = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
       setConfirmationResult(result);
       setPendingUserCreation({ phoneNumber, name }); // Store data for later user creation
       setIsLoading(false);
       return true;
     } catch (error) {
       console.error("Error initiating phone number signup:", error);
       setIsLoading(false);
       setPendingUserCreation(null); // Clear pending creation on error
       return false;
     }
   };

   const verifySignupCode = async (code: string): Promise<boolean> => {
     setIsLoading(true);
     try {
       if (confirmationResult && pendingUserCreation) {
         const userCredential = await confirmationResult.confirm(code);
         const firebaseUser = userCredential.user;

         // After successful verification, create the user document in Firestore
         const newUser: User = {
           id: firebaseUser.uid,
           phoneNumber: pendingUserCreation.phoneNumber,
           name: pendingUserCreation.name,
           dataBalance: 0, // Set initial values
           callCredit: 0,
           nextInvoiceDate: '', // Set initial values or handle later
           nextInvoiceAmount: 0,
         };
         const userDocRef = doc(db, 'users', firebaseUser.uid);
         await setDoc(userDocRef, newUser);

         setUser(newUser);
         setConfirmationResult(null); // Clear state
         setPendingUserCreation(null); // Clear state
         setIsLoading(false);
         return true;
       }
       setIsLoading(false);
       return false; // No confirmation result or pending user data
     } catch (error) {
       console.error("Error verifying signup code:", error);
       setIsLoading(false);
       setConfirmationResult(null);
       setPendingUserCreation(null);
       return false;
     }
   };


  const logout = async () => {
    setIsLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      setIsLoading(false);
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          setUser({ id: firebaseUser.uid, ...userDocSnap.data() } as User);
        } else {
           // User is authenticated via Firebase but no Firestore profile found.
           // This could happen if a user signs in via phone on another device
           // where the Firestore profile wasn't created yet, or if there's an issue.
           // Handle this gracefully - maybe redirect to a profile creation/completion screen.
           console.warn("Authenticated Firebase user has no Firestore profile.");
           setUser({ // Set a basic user object with available info
             id: firebaseUser.uid,
             phoneNumber: firebaseUser.phoneNumber || '',
             name: 'Unknown User', // Default name
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

    return () => unsubscribe();
  }, []);


  return (
    <AuthContext.Provider value={{
      user,
      login, // Placeholder
      signup, // Placeholder
      logout,
      isLoading,
      initiatePhoneNumberLogin,
      verifyLoginCode,
      initiatePhoneNumberSignup,
      verifySignupCode,
    }}>
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
