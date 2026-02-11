import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Share } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { doc, updateDoc, setDoc, query, collection, where, getDocs, onSnapshot } from 'firebase/firestore';
import { Theme } from '../../constants/Theme';
import { GlassCard } from '../../components/GlassCard';
import { useRouter } from 'expo-router';
import { Copy, Share2, Heart, Link as LinkIcon } from 'lucide-react-native';

export default function PairingScreen() {
  const { user } = useAuth();
  const [partnerCode, setPartnerCode] = useState('');
  const [myCode, setMyCode] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (user) {
      // Use UID as a base for the pairing code or generate a shorter one
      setMyCode(user.uid.substring(0, 6).toUpperCase());
      
      // Listen for changes to user doc to see if paired
      const unsub = onSnapshot(doc(db, 'users', user.uid), (doc) => {
        if (doc.data()?.nestId) {
          router.replace('/');
        }
      });
      return unsub;
    }
  }, [user]);

  const handlePair = async () => {
    if (!partnerCode) return;
    
    try {
      // Find user with this code
      // Note: In a real app, you'd probably store a mapping of codes to UIDs
      const q = query(collection(db, "users"), where("pairingCode", "==", partnerCode.toUpperCase()));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        Alert.alert("Error", "Partner code not found");
        return;
      }

      const partnerDoc = querySnapshot.docs[0];
      const partnerId = partnerDoc.id;

      if (partnerId === user?.uid) {
        Alert.alert("Error", "You cannot pair with yourself");
        return;
      }

      // Create a new Nest
      const nestId = `nest_${Date.now()}`;
      await setDoc(doc(db, 'nests', nestId), {
        users: [user?.uid, partnerId],
        anniversaryDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      });

      // Update both users
      await updateDoc(doc(db, 'users', user!.uid), { nestId });
      await updateDoc(doc(db, 'users', partnerId), { nestId });

      Alert.alert("Success", "You are now paired!");
      router.replace('/');
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const shareCode = async () => {
    try {
      await Share.share({
        message: `Join me on LoveNest! My pairing code is: ${myCode}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  // Ensure pairing code is stored in user doc for lookup
  useEffect(() => {
    if (user && myCode) {
      updateDoc(doc(db, 'users', user.uid), { pairingCode: myCode });
    }
  }, [myCode]);

  return (
    <View style={styles.container}>
      <GlassCard style={styles.card}>
        <Heart color={Theme.colors.primary} size={48} style={{ alignSelf: 'center', marginBottom: 20 }} />
        <Text style={styles.title}>Pair with Partner</Text>
        
        <View style={styles.codeSection}>
          <Text style={styles.label}>Your Code</Text>
          <View style={styles.myCodeContainer}>
            <Text style={styles.codeText}>{myCode}</Text>
            <TouchableOpacity onPress={shareCode}>
              <Share2 color={Theme.colors.primary} size={24} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.inputSection}>
          <Text style={styles.label}>Enter Partner's Code</Text>
          <TextInput
            style={styles.input}
            value={partnerCode}
            onChangeText={setPartnerCode}
            placeholder="XXXXXX"
            placeholderTextColor="rgba(255,255,255,0.3)"
            autoCapitalize="characters"
            maxLength={6}
          />
          <TouchableOpacity style={styles.button} onPress={handlePair}>
            <LinkIcon color="#fff" size={20} style={{ marginRight: 10 }} />
            <Text style={styles.buttonText}>Link Hearts</Text>
          </TouchableOpacity>
        </View>
      </GlassCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    padding: 30,
  },
  title: {
    fontSize: 24,
    color: Theme.colors.text,
    fontWeight: '800',
    marginBottom: 30,
    textAlign: 'center',
  },
  codeSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  label: {
    color: Theme.colors.textSecondary,
    fontSize: 14,
    marginBottom: 10,
    fontWeight: '600',
  },
  myCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 20,
    borderRadius: 20,
    width: '100%',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  codeText: {
    fontSize: 32,
    color: Theme.colors.primary,
    fontWeight: '900',
    letterSpacing: 5,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: 30,
  },
  inputSection: {
    alignItems: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    height: 60,
    borderRadius: 15,
    textAlign: 'center',
    fontSize: 24,
    color: '#fff',
    fontWeight: '700',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  button: {
    backgroundColor: Theme.colors.primary,
    height: 55,
    width: '100%',
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    ...Theme.shadow,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
