import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isLocked: boolean;
  setLocked: (locked: boolean) => void;
  userData: any | null;
  nestData: any | null;
  getStoredPin: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [userData, setUserData] = useState<any | null>(null);
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

  // 1. Auth State
  useEffect(() => {
    return onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        setUserData(null);
        setNestData(null);
        setLoading(false);
      }
    });
  }, []);

  // 2. User Document Listener
  useEffect(() => {
    if (!user) return;

    const unsub = onSnapshot(doc(db, 'users', user.uid), async (userSnap) => {
      if (userSnap.exists()) {
        setUserData(userSnap.data());
      } else {
        // Document might not exist yet if just registered
        setUserData({ email: user.email, nestId: null });
      }
      
      const pin = await getStoredPin();
      setIsLocked(!!pin);
      
      // If no nestId, we can stop the top-level loading
      if (!userSnap.data()?.nestId) {
        setLoading(false);
      }
    });

    return unsub;
  }, [user]);

  // 3. Nest Document Listener
  useEffect(() => {
    const nestId = userData?.nestId;
    if (!nestId) {
      setNestData(null);
      return;
    }

    setLoading(true); // Ensure loading is true while fetching the nest
    const unsub = onSnapshot(doc(db, 'nests', nestId), (nestSnap) => {
      if (nestSnap.exists()) {
        setNestData({ id: nestSnap.id, ...nestSnap.data() });
      } else {
        setNestData(null);
      }
      setLoading(false);
    });

    return unsub;
  }, [userData?.nestId]);

  return (
    <AuthContext.Provider value={{ user, loading, isLocked, setLocked: setIsLocked, userData, nestData, getStoredPin }}>
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
