import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, db } from '../config/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: {
    email: string;
    password: string;
    role: 'talent' | 'company' | 'admin';
    firstName: string;
    lastName: string;
    companyName?: string;
    ico?: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  loginAsMockUser: (role: 'talent' | 'company' | 'admin') => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  sendVerification: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Translate Supabase error messages to Czech
const translateError = (error: any): string => {
  const message = error?.message || '';

  // Common Firebase & Supabase errors
  if (message.includes('auth/invalid-credential') || message.includes('auth/user-not-found') || message.includes('auth/wrong-password') || message.includes('Invalid login credentials')) {
    return 'Nesprávný email nebo heslo';
  }
  if (message.includes('auth/email-already-in-use') || message.includes('User already registered')) {
    return 'Uživatel s tímto emailem již existuje';
  }
  if (message.includes('auth/weak-password') || message.includes('Password should be at least')) {
    return 'Heslo musí mít alespoň 6 znaků';
  }
  if (message.includes('auth/invalid-email') || message.includes('Invalid email')) {
    return 'Neplatný formát emailu';
  }
  if (message.includes('auth/network-request-failed') || message.includes('Network request failed')) {
    return 'Chyba připojení k síti. Zkontrolujte internet.';
  }
  if (message.includes('auth/too-many-requests')) {
    return 'Příliš mnoho pokusů. Zkuste to prosím později.';
  }
  if (message.includes('Email not confirmed')) {
    return 'Email nebyl potvrzen';
  }
  if (message.includes('auth/identity-toolkit-api-has-not-been-used-in-project')) {
    return 'Chyba konfigurace serveru (API). Prosím kontaktujte podporu.';
  }
  if (message.includes('auth/operation-not-allowed')) {
    return 'Tato metoda přihlášení není povolena.';
  }


  // Return translated or original message
  return error?.message || 'Došlo k neznámé chybě';
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in, fetch profile from Firestore
        await loadUserProfile(firebaseUser.uid, firebaseUser.email, firebaseUser.emailVerified);
      } else {
        // User is signed out
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadUserProfile = async (uid: string, email: string | null, emailVerified: boolean = false) => {
    try {
      const userDocRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        setUser({ ...userData, id: uid, emailVerified });
      } else {
        console.warn("User profile not found in Firestore, creating fallback profile...");
        // Auto-heal: Create a default profile for orphaned accounts
        const fallbackUser: User = {
          id: uid,
          email: email || '',
          role: 'talent', // Default role
          firstName: 'Uživatel',
          lastName: '(Doplnit)',
          verified: false,
          emailVerified: !!emailVerified,
          verificationStatus: 'not_submitted',
          profileImage: '',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        };

        await setDoc(userDocRef, fallbackUser);
        setUser(fallbackUser);
        // We can't use toast here easily as it's not a component, but we'll log it if error occurs
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      throw new Error(translateError(error));
    }
  };

  const signUp = async (data: {
    email: string;
    password: string;
    role: 'talent' | 'company' | 'admin';
    firstName: string;
    lastName: string;
    companyName?: string;
    ico?: string;
  }) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const uid = userCredential.user.uid;

      // Create user profile in Firestore
      const newUser: User = {
        id: uid,
        email: data.email,
        role: data.role,
        firstName: data.firstName,
        lastName: data.lastName,
        companyName: data.companyName || null,
        ico: data.ico || null,
        verified: false,
        emailVerified: false,
        verificationStatus: 'not_submitted',
        profileImage: '',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', uid), newUser);
      setUser(newUser);
    } catch (error: any) {
      throw new Error(translateError(error));
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error: any) {
      throw error;
    }
  };

  const refreshUser = async () => {
    if (auth.currentUser) {
      await loadUserProfile(auth.currentUser.uid, auth.currentUser.email);
    }
  };

  const loginAsMockUser = async (role: 'talent' | 'company' | 'admin') => {
    // Creating a mock user for testing purposes without Firebase
    const mockUser: User = {
      id: `mock-${role}-id`,
      email: `${role}@test.com`,
      role: role,
      firstName: role === 'talent' ? 'Jan' : role === 'admin' ? 'Admin' : 'Petr',
      lastName: role === 'talent' ? 'Sportovec' : role === 'admin' ? 'User' : 'Manažer',
      companyName: role === 'company' ? 'Test Firma s.r.o.' : undefined,
      ico: role === 'company' ? '12345678' : undefined,
      verified: true,
      emailVerified: true,
      verificationStatus: 'verified',
      profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + role,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    setUser(mockUser);
    setLoading(false);
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw new Error(translateError(error));
    }
  };

  const sendVerification = async () => {
    if (auth.currentUser) {
      try {
        await sendEmailVerification(auth.currentUser);
      } catch (error: any) {
        throw new Error(translateError(error));
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        refreshUser,
        loginAsMockUser,
        resetPassword,
        sendVerification,
      }}
    >
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
