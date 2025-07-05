import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, AuthUser } from '../services/auth';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string; needsConfirmation?: boolean }>;
  signUp: (email: string, password: string, fullName: string, organizationName: string) => Promise<{ success: boolean; error?: string; needsConfirmation?: boolean }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: any) => Promise<{ success: boolean; error?: string }>;
  createDemoUser: () => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current user on mount
    const checkUser = async () => {
      // Check for test mode user first
      const testUser = localStorage.getItem('test_mode_user');
      if (testUser) {
        try {
          const parsedUser = JSON.parse(testUser);
          setUser(parsedUser);
          setLoading(false);
          return;
        } catch (error) {
          localStorage.removeItem('test_mode_user');
        }
      }
      
      const result = await authService.getCurrentUser();
      if (result.success && result.data) {
        setUser(result.data);
      }
      setLoading(false);
    };

    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange((user) => {
      // Don't override test mode user
      const testUser = localStorage.getItem('test_mode_user');
      if (testUser) {
        return;
      }
      
      setUser(user);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const result = await authService.signIn(email, password);
    if (result.success && result.data) {
      setUser(result.data);
    }
    return result;
  };

  const signUp = async (email: string, password: string, fullName: string, organizationName: string) => {
    const result = await authService.signUp(email, password, fullName, organizationName);
    if (result.success && result.data) {
      setUser(result.data);
    }
    return result;
  };

  const signOut = async () => {
    // Clear test mode user
    localStorage.removeItem('test_mode_user');
    await authService.signOut();
    setUser(null);
  };

  const updateProfile = async (updates: any) => {
    const result = await authService.updateProfile(updates);
    if (result.success && result.data && user) {
      setUser({ ...user, profile: { ...user.profile, ...result.data } });
    }
    return result;
  };

  const createDemoUser = async () => {
    const result = await authService.createDemoUser();
    if (result.success && result.data) {
      setUser(result.data);
    }
    return result;
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    createDemoUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};