// contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebaseConfig';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { router } from 'expo-router';

interface User {
  id: string;
  phoneNumber: string;
  name: string;
  dataBalance: number;
  callCredit: number;
  nextInvoiceDate: string;
  nextInvoiceAmount: number;
  payment: boolean; // Added payment field to User interface
}

interface AuthContextValue {
  user: User | null;
  login: (phoneNumber: string, password: string) => Promise<boolean>;
  signup: (phoneNumber: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const formatEmail = (phone: string) => `${phone}@mytt.com`;

  const fetchUserData = async (uid: string): Promise<User | null> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          id: uid,
          phoneNumber: data.phone,
          name: data.fullName,
          dataBalance: 2.5,
          callCredit: 12.75,
          nextInvoiceDate: '2025-02-15',
          nextInvoiceAmount: 45.0,
          payment: data.payment || false, // Fetch payment status, default to false if not exists
        };
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
    return null;
  };

  const login = async (phoneNumber: string, password: string): Promise<boolean> => {
    try {
      const email = formatEmail(phoneNumber);
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const userData = await fetchUserData(cred.user.uid);
      setUser(userData);
      return true;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    }
  };

  const signup = async (phoneNumber: string, password: string, name: string): Promise<boolean> => {
    try {
      const email = formatEmail(phoneNumber);
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', cred.user.uid), {
        fullName: name,
        phone: phoneNumber,
        payment: false, // Add the payment field with a default value of false
      });
      const newUser: User = {
        id: cred.user.uid,
        phoneNumber,
        name,
        dataBalance: 2.5,
        callCredit: 12.75,
        nextInvoiceDate: '2025-02-15',
        nextInvoiceAmount: 45.0,
        payment: false, // Initialize payment for the new user object
      };
      setUser(newUser);
      return true;
    } catch (err) {
      console.error('Signup error:', err);
      return false;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      console.log('User signed out successfully.');
      router.replace('/'); // <--- This makes sure you go back to login screen
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const userData = await fetchUserData(firebaseUser.uid);
        setUser(userData);
      } else {
        setUser(null);
        router.replace('/'); // <--- This auto-redirects when user logs out
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
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
