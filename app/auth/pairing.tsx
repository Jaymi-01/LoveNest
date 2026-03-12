import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Share, Image, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { doc, updateDoc, setDoc, query, collection, where, getDocs, onSnapshot } from 'firebase/firestore';
import { Theme } from '../../constants/Theme';
import { useRouter } from 'expo-router';
import { Share2, Heart, Link2, Copy, ArrowRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { scale, verticalScale, moderateScale, fontScale } from '../../lib/responsive';

export default function PairingScreen() {
  const { user, userData } = useAuth();
  const [partnerCode, setPartnerCode] = useState('');
  const [myCode, setMyCode] = useState('');
  const [requesterData, setRequesterData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      setMyCode(user.uid.substring(0, 6).toUpperCase());
    }
  }, [user]);

  useEffect(() => {
    if (userData?.nestId) {
      router.replace('/');
    }
  }, [userData?.nestId]);

  // Listener for the requester's data when a request is received
  useEffect(() => {
    if (userData?.pairingRequestFrom) {
      const unsub = onSnapshot(doc(db, 'users', userData.pairingRequestFrom), (snap) => {
        setRequesterData(snap.data());
      });
      return unsub;
    } else {
      setRequesterData(null);
    }
  }, [userData?.pairingRequestFrom]);

  const handlePairRequest = async () => {
    if (!partnerCode) return;
    try {
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

      // Send the request
      await setDoc(doc(db, 'users', partnerId), { 
        pairingRequestFrom: user!.uid,
        pairingRequestEmail: user!.email 
      }, { merge: true });
      
      await setDoc(doc(db, 'users', user!.uid), { 
        pendingPairingWith: partnerId 
      }, { merge: true });

      Alert.alert("Request Sent", "Waiting for your partner to accept...");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const handleAccept = async () => {
    const partnerId = userData.pairingRequestFrom;
    const nestId = `nest_${Date.now()}`;
    
    try {
      await setDoc(doc(db, 'nests', nestId), {
        users: [user?.uid, partnerId],
        anniversaryDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      });

      // Update both users
      await setDoc(doc(db, 'users', user!.uid), { 
        nestId, 
        pairingRequestFrom: null, 
        pairingRequestEmail: null 
      }, { merge: true });
      
      await setDoc(doc(db, 'users', partnerId), { 
        nestId, 
        pendingPairingWith: null 
      }, { merge: true });

      router.replace('/');
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const handleDecline = async () => {
    const partnerId = userData.pairingRequestFrom;
    try {
      await updateDoc(doc(db, 'users', user!.uid), { 
        pairingRequestFrom: null, 
        pairingRequestEmail: null 
      });
      
      await updateDoc(doc(db, 'users', partnerId), { 
        pendingPairingWith: null 
      });
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const handleCancelRequest = async () => {
    const partnerId = userData.pendingPairingWith;
    try {
      await updateDoc(doc(db, 'users', user!.uid), { 
        pendingPairingWith: null 
      });
      
      if (partnerId) {
        await updateDoc(doc(db, 'users', partnerId), { 
          pairingRequestFrom: null,
          pairingRequestEmail: null
        });
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const shareCode = async () => {
    try {
      await Share.share({
        message: `Join my Love Nest! My pairing code is: ${myCode}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (user && myCode) {
      setDoc(doc(db, 'users', user.uid), { pairingCode: myCode }, { merge: true });
    }
  }, [myCode]);

  // UI for Incoming Request
  if (userData?.pairingRequestFrom) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={[Theme.colors.background, '#FFEDE0', Theme.colors.background]} style={StyleSheet.absoluteFill} />
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Heart color={Theme.colors.primary} size={40} fill={Theme.colors.primary} />
            </View>
            <Text style={styles.title}>Pairing Request</Text>
            <Text style={styles.subtitle}>
              <Text style={{ fontWeight: '800', color: Theme.colors.text }}>{userData.pairingRequestEmail}</Text> wants to create a sanctuary with you.
            </Text>
          </View>
          
          <TouchableOpacity style={styles.pairButton} onPress={handleAccept}>
            <Text style={styles.pairButtonText}>Accept & Create Nest</Text>
            <ArrowRight color="#fff" size={20} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.pairButton, { backgroundColor: 'transparent', marginTop: 12 }]} onPress={handleDecline}>
            <Text style={[styles.pairButtonText, { color: Theme.colors.textSecondary }]}>Decline</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // UI for Outgoing Request
  if (userData?.pendingPairingWith) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={[Theme.colors.background, '#FFEDE0', Theme.colors.background]} style={StyleSheet.absoluteFill} />
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Heart color={Theme.colors.primary} size={40} />
            </View>
            <Text style={styles.title}>Request Sent</Text>
            <Text style={styles.subtitle}>Waiting for your partner to accept your invitation...</Text>
          </View>
          <View style={styles.loadingContainer}>
             <Text style={styles.label}>Waiting...</Text>
          </View>

          <TouchableOpacity 
            style={[styles.pairButton, { backgroundColor: 'transparent', marginTop: 20 }]} 
            onPress={handleCancelRequest}
          >
            <Text style={[styles.pairButtonText, { color: '#FF6B6B' }]}>Cancel Invitation</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[Theme.colors.background, '#FFEDE0', Theme.colors.background]}
        style={StyleSheet.absoluteFill}
      />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconStack}>
              <View style={styles.iconCircle}>
                <Heart color={Theme.colors.primary} size={32} fill={Theme.colors.primary} />
              </View>
              <View style={[styles.iconCircle, styles.iconCircleOverlap]}>
                <Link2 color={Theme.colors.textSecondary} size={24} />
              </View>
            </View>
            <Text style={styles.title}>Connect Your Nest</Text>
            <Text style={styles.subtitle}>Pair with your partner to start your shared journey.</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Your Unique Code</Text>
            <TouchableOpacity style={styles.codeDisplay} onPress={shareCode} activeOpacity={0.7}>
              <Text style={styles.myCodeText}>{myCode}</Text>
              <View style={styles.shareBadge}>
                <Share2 color="#fff" size={16} />
                <Text style={styles.shareText}>Share</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>THEN</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Enter Partner's Code</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={partnerCode}
                onChangeText={setPartnerCode}
                placeholder="XXXXXX"
                placeholderTextColor="rgba(93, 64, 55, 0.2)"
                autoCapitalize="characters"
                maxLength={6}
              />
            </View>
            <TouchableOpacity 
              style={[styles.pairButton, !partnerCode && styles.pairButtonDisabled]} 
              onPress={handlePairRequest}
              disabled={!partnerCode}
            >
              <Text style={styles.pairButtonText}>Send Invitation</Text>
              <ArrowRight color="#fff" size={20} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  content: {
    flex: 1,
    padding: moderateScale(32),
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: verticalScale(60),
  },
  iconStack: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(24),
  },
  iconCircle: {
    width: scale(80),
    height: scale(80),
    borderRadius: scale(40),
    backgroundColor: 'rgba(240, 128, 128, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(240, 128, 128, 0.3)',
  },
  iconCircleOverlap: {
    marginLeft: scale(-20),
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(240, 128, 128, 0.1)',
  },
  title: {
    fontSize: fontScale(28),
    fontWeight: '800',
    color: Theme.colors.text,
    marginBottom: verticalScale(12),
  },
  subtitle: {
    fontSize: fontScale(16),
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: scale(20),
    lineHeight: fontScale(24),
  },
  section: {
    width: '100%',
    marginBottom: verticalScale(32),
  },
  label: {
    color: Theme.colors.textSecondary,
    fontSize: fontScale(12),
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: verticalScale(16),
    textAlign: 'center',
  },
  codeDisplay: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(24),
    padding: moderateScale(24),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(240, 128, 128, 0.1)',
    position: 'relative',
  },
  myCodeText: {
    fontSize: fontScale(42),
    fontWeight: '900',
    color: Theme.colors.primary,
    letterSpacing: scale(8),
  },
  shareBadge: {
    position: 'absolute',
    bottom: verticalScale(-12),
    backgroundColor: Theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(6),
    paddingHorizontal: scale(12),
    borderRadius: moderateScale(12),
    ...Theme.shadow,
  },
  shareText: {
    color: '#fff',
    fontSize: fontScale(12),
    fontWeight: '700',
    marginLeft: scale(6),
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: verticalScale(40),
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(93, 64, 55, 0.1)',
  },
  dividerText: {
    color: Theme.colors.textSecondary,
    fontSize: fontScale(10),
    fontWeight: '800',
    marginHorizontal: scale(16),
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(24),
    borderWidth: 1,
    borderColor: 'rgba(240, 128, 128, 0.1)',
    marginBottom: verticalScale(16),
  },
  input: {
    flex: 1,
    height: verticalScale(72),
    fontSize: fontScale(24),
    color: Theme.colors.text,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: scale(4),
  },
  pairButton: {
    width: '100%',
    height: verticalScale(64),
    borderRadius: moderateScale(20),
    backgroundColor: Theme.colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    ...Theme.shadow,
  },
  pairButtonText: {
    color: '#fff',
    fontSize: fontScale(16),
    fontWeight: '700',
    marginRight: scale(8),
  },
  pairButtonDisabled: {
    backgroundColor: Theme.colors.textSecondary,
    opacity: 0.3,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  }
});
