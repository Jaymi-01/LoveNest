import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Vibration } from 'react-native';
import { getItemAsync } from 'expo-secure-store';
import { Theme } from '../constants/Theme';
import { GlassCard } from './GlassCard';
import { Lock } from 'lucide-react-native';

interface PINLockProps {
  onUnlock: () => void;
}

export const PINLock: React.FC<PINLockProps> = ({ onUnlock }) => {
  const [pin, setPin] = useState('');
  const [storedPin, setStoredPin] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadStoredPin();
  }, []);

  const loadStoredPin = async () => {
    const pin = await getItemAsync('app_pin');
    setStoredPin(pin);
  };

  const handlePress = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      
      if (newPin.length === 4) {
        verifyPin(newPin);
      }
    }
  };

  const verifyPin = (enteredPin: string) => {
    if (enteredPin === storedPin) {
      onUnlock();
    } else {
      Vibration.vibrate(100);
      setError(true);
      setTimeout(() => {
        setPin('');
        setError(false);
      }, 500);
    }
  };

  const renderDot = (index: number) => {
    const active = pin.length > index;
    return (
      <View 
        key={index}
        style={[
          styles.dot,
          active && styles.dotActive,
          error && styles.dotError
        ]} 
      />
    );
  };

  return (
    <View style={styles.container}>
      <Lock color={Theme.colors.primary} size={48} style={styles.icon} />
      <Text style={styles.title}>Enter PIN</Text>
      
      <View style={styles.dotsContainer}>
        {[0, 1, 2, 3].map(renderDot)}
      </View>

      <View style={styles.keypad}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, 'del'].map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.key}
            onPress={() => {
              if (item === 'del') setPin(pin.slice(0, -1));
              else if (item !== '') handlePress(item.toString());
            }}
          >
            <Text style={styles.keyText}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.background,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    color: Theme.colors.text,
    marginBottom: 40,
    fontWeight: '600',
  },
  dotsContainer: {
    flexDirection: 'row',
    marginBottom: 60,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Theme.colors.primary,
    marginHorizontal: 15,
  },
  dotActive: {
    backgroundColor: Theme.colors.primary,
  },
  dotError: {
    borderColor: '#ff4444',
    backgroundColor: '#ff4444',
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 300,
    justifyContent: 'center',
  },
  key: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
  },
  keyText: {
    fontSize: 28,
    color: Theme.colors.text,
  },
});
