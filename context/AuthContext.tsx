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
  nestData: any | null;
  getStoredPin: () => Promise<string | null>;
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
    let userUnsubscribe: () => void = () => {};
    let nestUnsubscribe: () => void = () => {};

    const authUnsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // Real-time listener for the USER document to detect pairing (nestId)
        userUnsubscribe = onSnapshot(doc(db, 'users', user.uid), async (userSnap) => {
          if (userSnap.exists()) {
            const userData = userSnap.data();
            
            if (userData.nestId) {
              // Real-time listener for the NEST document
              nestUnsubscribe = onSnapshot(doc(db, 'nests', userData.nestId), (nestSnap) => {
                if (nestSnap.exists()) {
                  setNestData({ id: nestSnap.id, ...nestSnap.data() });
                }
              });
            } else {
              setNestData(null);
            }
          }
          
          // Check PIN
          const pin = await getStoredPin();
          setIsLocked(!!pin);
          setLoading(false);
        });
      } else {
        setNestData(null);
        setIsLocked(false);
        setLoading(false);
      }
    });

    return () => {
      authUnsubscribe();
      userUnsubscribe();
      nestUnsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isLocked, setLocked: setIsLocked, nestData, getStoredPin }}>
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
