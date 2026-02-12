import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isLocked: boolean;
  setLocked: (locked: boolean) => void;
  nestData: any | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [nestData, setNestData] = useState<any | null>(null);

  const getStoredPin = async () => {
    try {
      if (Platform.OS !== 'web') {
        return await SecureStore.getItemAsync('app_pin');
      }
      return await AsyncStorage.getItem('app_pin');
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Fetch nest data
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.nestId) {
            const nestDoc = await getDoc(doc(db, 'nests', data.nestId));
            setNestData(nestDoc.exists() ? { id: nestDoc.id, ...nestDoc.data() } : null);
          }
        }
        
        // Check if PIN is set
        const pin = await getStoredPin();
        if (pin) {
          setIsLocked(true);
        } else {
          setIsLocked(false);
        }
      } else {
        setNestData(null);
        setIsLocked(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isLocked, setLocked: setIsLocked, nestData }}>
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
