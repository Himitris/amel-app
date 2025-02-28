// context/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

// Clé pour stocker les données utilisateur dans AsyncStorage
const USER_STORAGE_KEY = 'user_data';

// Provider component that wraps the app and makes auth object available
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [initialized, setInitialized] = useState<boolean>(false);

  // Vérifier si l'utilisateur est déjà connecté
  useEffect(() => {
    const checkUser = async () => {
      try {
        // Récupérer l'utilisateur stocké dans AsyncStorage
        const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
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
      // Simuler une validation de connexion
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simuler une validation simple
      if (password.length < 6) {
        throw new Error('Invalid credentials');
      }
      
      // Créer un utilisateur mock
      const mockUser = {
        id: 'user-' + Date.now(),
        email,
        name: email.split('@')[0],
      };
      
      setUser(mockUser);
      
      // Stocker l'utilisateur dans AsyncStorage
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mockUser));
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
      // Simuler un délai d'inscription
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simuler une validation simple
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }
      
      // Créer un utilisateur mock
      const mockUser = {
        id: 'user-' + Date.now(),
        email,
        name,
      };
      
      setUser(mockUser);
      
      // Stocker l'utilisateur dans AsyncStorage
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mockUser));
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
      // Simuler un délai de déconnexion
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUser(null);
      
      // Supprimer l'utilisateur d'AsyncStorage
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
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
      // Simuler un délai de connexion
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (Platform.OS !== 'web') {
        Alert.alert('Information', 'Cette fonctionnalité serait normalement implémentée avec Expo Auth Session');
      }
      
      // Créer un utilisateur mock
      const mockUser = {
        id: 'google-' + Date.now(),
        email: 'user' + Math.floor(Math.random() * 1000) + '@gmail.com',
        name: 'Utilisateur Google',
      };
      
      setUser(mockUser);
      
      // Stocker l'utilisateur dans AsyncStorage
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mockUser));
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