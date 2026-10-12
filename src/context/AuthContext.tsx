import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  signInUser,
  signUpUser,
  signOutUser,
  changeUserPassword,
  subscribeToAuth,
} from '../services/auth';
import {
  getUserProfile,
  updateUserDefaults,
  subscribeToUserProfile,
  UserProfile,
} from '../services/user';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
  changePassword: (currentPass: string, newPass: string) => Promise<void>;
  updateDefaults: (morning: number, evening: number, rate?: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = subscribeToAuth((currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    const unsubscribeProfile = subscribeToUserProfile(user.uid, (p) => {
      if (p) {
        setProfile(p);
      } else {
        // Fallback default profile if not yet created in Firestore
        setProfile({
          email: user.email || '',
          defaultMorning: 1.0,
          defaultEvening: 0.5,
          defaultRate: 56,
        });
      }
      setLoading(false);
    });

    return () => unsubscribeProfile();
  }, [user]);

  const signIn = async (email: string, pass: string) => {
    await signInUser(email, pass);
  };

  const signUp = async (email: string, pass: string) => {
    await signUpUser(email, pass);
  };

  const handleSignOut = async () => {
    await signOutUser();
  };

  const handleChangePassword = async (currentPass: string, newPass: string) => {
    await changeUserPassword(currentPass, newPass);
  };

  const handleUpdateDefaults = async (morning: number, evening: number, rate?: number) => {
    if (!user) return;
    await updateUserDefaults(user.uid, morning, evening, rate);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signIn,
        signUp,
        signOut: handleSignOut,
        changePassword: handleChangePassword,
        updateDefaults: handleUpdateDefaults,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
