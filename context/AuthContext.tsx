import React, { createContext, useState, useContext, useEffect } from 'react';
import { Alert, Platform } from 'react-native';

// Define types for our context
type User = {
  id: string;
  email: string;
  name: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
};

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  initialized: false,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  signInWithGoogle: async () => {},
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component that wraps the app and makes auth object available
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [initialized, setInitialized] = useState<boolean>(false);

  // Mock authentication for demo purposes
  // In a real app, this would connect to Firebase Auth
  useEffect(() => {
    // Simulate checking if user is already logged in
    const checkUser = async () => {
      try {
        // Mock checking stored credentials
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Failed to get stored user:', error);
      } finally {
        setInitialized(true);
      }
    };

    checkUser();
  }, []);

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Mock authentication
      // In a real app, this would call Firebase Auth signInWithEmailAndPassword
      
      // For demo, we'll just create a mock user
      const mockUser = {
        id: 'user123',
        email,
        name: 'Demo User',
      };
      
      setUser(mockUser);
      
      // Store user in localStorage for web
      if (Platform.OS === 'web') {
        localStorage.setItem('user', JSON.stringify(mockUser));
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign up with email, password, and name
  const signUp = async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
      // Mock registration
      // In a real app, this would call Firebase Auth createUserWithEmailAndPassword
      
      // For demo, we'll just create a mock user
      const mockUser = {
        id: 'user' + Math.floor(Math.random() * 1000),
        email,
        name,
      };
      
      setUser(mockUser);
      
      // Store user in localStorage for web
      if (Platform.OS === 'web') {
        localStorage.setItem('user', JSON.stringify(mockUser));
      }
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    setLoading(true);
    try {
      // Mock sign out
      // In a real app, this would call Firebase Auth signOut
      
      setUser(null);
      
      // Remove user from localStorage for web
      if (Platform.OS === 'web') {
        localStorage.removeItem('user');
      }
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      // Mock Google sign in
      // In a real app, this would use Firebase Auth signInWithPopup or expo-auth-session
      
      if (Platform.OS === 'web') {
        Alert.alert('Google Sign In', 'This would open Google sign in on a real app');
      }
      
      // For demo, we'll just create a mock user
      const mockUser = {
        id: 'google123',
        email: 'google@example.com',
        name: 'Google User',
      };
      
      setUser(mockUser);
      
      // Store user in localStorage for web
      if (Platform.OS === 'web') {
        localStorage.setItem('user', JSON.stringify(mockUser));
      }
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Create the value object that will be provided by the context
  const value = {
    user,
    loading,
    initialized,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};