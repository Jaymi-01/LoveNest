import React, { createContext, useContext, useState, useEffect } from 'react';
import { getItemAsync } from 'expo-secure-store';
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Fetch nest data (pairing info)
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.nestId) {
            const nestDoc = await getDoc(doc(db, 'nests', data.nestId));
            setNestData(nestDoc.exists() ? nestDoc.data() : null);
          }
        }
        
        // Check if PIN is set - only lock if a PIN exists
        const pin = await getItemAsync('app_pin');
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
