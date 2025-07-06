import React, { createContext, useContext, useState, useEffect } from 'react';

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
  signup: (
    phoneNumber: string,
    password: string,
    name: string
  ) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Mock user data
const mockUser: User = {
  id: '1',
  phoneNumber: '98765432',
  name: 'Ahmed Ben Ali',
  dataBalance: 2.5, // GB
  callCredit: 12.75, // TND
  nextInvoiceDate: '2025-02-15',
  nextInvoiceAmount: 45.0,
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (
    phoneNumber: string,
    password: string
  ): Promise<boolean> => {
    setIsLoading(true);

    // Mock login delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Simple mock validation
    if (phoneNumber.length >= 8 && password.length >= 4) {
      setUser({ ...mockUser, phoneNumber });
      setIsLoading(false);
      return true;
    }

    setIsLoading(false);
    return false;
  };

  const signup = async (
    phoneNumber: string,
    password: string,
    name: string
  ): Promise<boolean> => {
    setIsLoading(true);

    // Mock signup delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Simple mock validation
    if (phoneNumber.length >= 8 && password.length >= 4 && name.length >= 2) {
      setUser({ ...mockUser, phoneNumber, name });
      setIsLoading(false);
      return true;
    }

    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
  };

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
