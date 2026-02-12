import React, { useEffect, useRef } from 'react';
import { AppState, AppStateStatus, PanResponder } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { PINLock } from './PINLock';

export const AppLockWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLocked, setLocked, user, getStoredPin } = useAuth();
  const lastInteraction = useRef(Date.now());
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = () => {
    lastInteraction.current = Date.now();
    if (timer.current) clearTimeout(timer.current);
    
    // 1 minute of inactivity
    timer.current = setTimeout(async () => {
      if (user) {
        const pin = await getStoredPin();
        if (pin) setLocked(true);
      }
    }, 60000);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponderCapture: () => {
        resetTimer();
        return false;
      },
      onMoveShouldSetPanResponderCapture: () => {
        resetTimer();
        return false;
      },
    })
  ).current;

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background') {
        // Optional: lock immediately when going to background
        // setLocked(true);
      }
      resetTimer();
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    resetTimer();

    return () => {
      subscription.remove();
      if (timer.current) clearTimeout(timer.current);
    };
  }, [user]);

  if (isLocked && user) {
    return <PINLock onUnlock={() => setLocked(false)} />;
  }

  return (
    <View style={{ flex: 1 }} {...panResponder.panHandlers}>
      {children}
    </View>
  );
};

import { View } from 'react-native';
