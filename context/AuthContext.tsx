// context/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  updateProfile 
} from 'firebase/auth';
import { auth } from '../services/firebase';

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
};

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  initialized: false,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
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
        // Vérifier si un utilisateur est connecté dans Firebase
        const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
          if (firebaseUser) {
            const userData: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || '',
            };
            setUser(userData);
            
            // Stocker l'utilisateur dans AsyncStorage pour la persistance
            await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
          } else {
            // Vérifier s'il y a des données stockées localement
            const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
            if (storedUser) {
              setUser(JSON.parse(storedUser));
            }
          }
          setInitialized(true);
        });
        
        return () => unsubscribe();
      } catch (error) {
        console.error('Failed to get stored user:', error);
        setInitialized(true);
      }
    };

    checkUser();
  }, []);

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Connexion avec Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Créer un objet utilisateur
      const userData: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: firebaseUser.displayName || '',
      };
      
      setUser(userData);
      
      // Stocker l'utilisateur dans AsyncStorage
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
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
      // Inscription avec Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Mettre à jour le profil avec le nom
      await updateProfile(firebaseUser, { displayName: name });
      
      // Créer un objet utilisateur
      const userData: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: name,
      };
      
      setUser(userData);
      
      // Stocker l'utilisateur dans AsyncStorage
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
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
      // Déconnexion avec Firebase
      await firebaseSignOut(auth);
      
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

  // Create the value object that will be provided by the context
  const value = {
    user,
    loading,
    initialized,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};