import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions, 
  Image,
  SafeAreaView
} from 'react-native';
import { useAuth } from './../../context/AuthContext';
import { Theme } from './../../constants/Theme';
import { GlassCard } from './../../components/GlassCard';
import { 
  MessageSquare, 
  Calendar, 
  Camera, 
  Book, 
  Smile, 
  Clock, 
  Lock,
  Zap,
  Mail,
  Heart,
  ChevronRight,
  Settings
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { differenceInDays } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';
import { scale, verticalScale, moderateScale, fontScale } from '../../lib/responsive';

const { width } = Dimensions.get('window');

export default function Dashboard() {
  const { user, nestData, loading } = useAuth();
  const router = useRouter();

  if (loading) return null;

  if (!user) {
    return (
      <View style={styles.authContainer}>
        <LinearGradient
          colors={[Theme.colors.background, '#FFEDE0']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.onboardingHeader}>
           <Image 
            source={require('../../assets/images/logo-transparent.png')} 
            style={styles.heroLogo}
            resizeMode="contain"
          />
        </View>
        
        <View style={styles.bottomArea}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => router.push('/auth/login')}
          >
            <Text style={styles.buttonText}>Get Started</Text>
            <ChevronRight color="#fff" size={20} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!nestData) {
    return (
      <View style={styles.pairingContainer}>
        <LinearGradient
          colors={[Theme.colors.background, '#FFEBD9', Theme.colors.background]}
          style={StyleSheet.absoluteFill}
        />
        
        <View style={styles.pairingContent}>
          <View style={styles.iconPulseContainer}>
            <View style={styles.pulseCircle} />
            <View style={[styles.pulseCircle, { animationDelay: '1s' }]} />
            <View style={styles.iconCirclePairing}>
              <Heart color={Theme.colors.primary} size={40} fill={Theme.colors.primary} />
            </View>
          </View>

          <Text style={styles.pairingTitle}>Creating Your Nest</Text>
          <Text style={styles.pairingSubtitle}>
            We're waiting for your partner to join. Once they enter your code, your private sanctuary will be ready.
          </Text>

          <TouchableOpacity 
            style={styles.pairingActionBtn}
            onPress={() => router.push('/auth/pairing')}
          >
            <Text style={styles.pairingActionText}>View Pairing Settings</Text>
            <ChevronRight color="rgba(255,255,255,0.5)" size={20} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={[Theme.colors.background, '#FFF0E6', Theme.colors.background]}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Top Header Row */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Love Nest</Text>
          <Text style={styles.subGreeting}>Your shared sanctuary</Text>
        </View>
        <TouchableOpacity 
          style={styles.settingsBtn}
          onPress={() => router.push('/settings')}
        >
          <Settings color={Theme.colors.text} size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Anniversary Hero */}
        <TouchableOpacity activeOpacity={0.9} style={{ marginTop: 20 }}>
          <LinearGradient
            colors={['rgba(155, 182, 170, 0.2)', 'rgba(155, 182, 170, 0.05)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.heroInfo}>
              <Text style={styles.heroLabel}>Days Together</Text>
              <Text style={styles.heroValue}>
                {differenceInDays(new Date(), new Date(nestData.anniversaryDate || Date.now()))}
              </Text>
            </View>
            <View style={styles.heroIconCircle}>
              <Heart color={Theme.colors.primary} fill={Theme.colors.primary} size={32} />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Mood & Status Section */}
        <Text style={styles.sectionHeader}>Our Mood</Text>
        <View style={styles.statusRow}>
           <GlassCard style={styles.moodMiniCard} intensity={40}>
              <View style={styles.moodPerson}>
                <Text style={styles.personLabel}>You</Text>
                <Smile color={Theme.colors.primary} size={32} />
                <Text style={styles.moodStatus}>Sunny</Text>
              </View>
              <View style={styles.moodDivider} />
              <View style={styles.moodPerson}>
                <Text style={styles.personLabel}>Partner</Text>
                <Smile color={Theme.colors.accent} size={32} />
                <Text style={styles.moodStatus}>Cloudy</Text>
              </View>
           </GlassCard>
        </View>

        {/* Dynamic Alerts (Placeholder for Cooldown or Upcoming Reminders) */}
        <GlassCard style={styles.alertCard} intensity={20}>
          <Clock color={Theme.colors.accent} size={20} />
          <Text style={styles.alertText}>No active cooldowns. Enjoy your day!</Text>
        </GlassCard>

      </ScrollView>
    </SafeAreaView>
  );
}

// ... remove FeatureIcon and old grid styles ...

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Theme.colors.background },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: moderateScale(24),
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(10),
  },
  greeting: { fontSize: fontScale(28), fontWeight: '800', color: Theme.colors.text },
  subGreeting: { fontSize: fontScale(14), color: Theme.colors.textSecondary, marginTop: verticalScale(2) },
  settingsBtn: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(24),
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Theme.shadow,
    shadowOpacity: 0.1,
  },
  content: { padding: moderateScale(20), paddingTop: 0, paddingBottom: verticalScale(40) },
  heroCard: {
    height: verticalScale(160),
    borderRadius: moderateScale(32),
    padding: moderateScale(24),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(20),
    borderWidth: 1,
    borderColor: 'rgba(240, 128, 128, 0.3)',
  },
  heroInfo: { flex: 1 },
  heroLabel: { color: Theme.colors.textSecondary, fontSize: fontScale(16), fontWeight: '600' },
  heroValue: { color: Theme.colors.text, fontSize: fontScale(56), fontWeight: '900', marginTop: verticalScale(4) },
  heroIconCircle: {
    width: scale(64),
    height: scale(64),
    borderRadius: scale(32),
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(30),
  },
  moodMiniCard: {
    width: '100%',
    padding: moderateScale(24),
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderRadius: moderateScale(32),
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  moodPerson: {
    alignItems: 'center',
  },
  personLabel: {
    color: Theme.colors.textSecondary,
    fontSize: fontScale(12),
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: verticalScale(8),
  },
  moodStatus: {
    color: Theme.colors.text,
    fontSize: fontScale(14),
    fontWeight: '600',
    marginTop: verticalScale(8),
  },
  moodDivider: {
    width: 1,
    height: verticalScale(40),
    backgroundColor: 'rgba(93, 64, 55, 0.1)',
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: moderateScale(20),
    borderRadius: moderateScale(24),
    marginTop: verticalScale(20),
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  alertText: {
    color: Theme.colors.textSecondary,
    fontSize: fontScale(14),
    marginLeft: scale(12),
    fontWeight: '500',
  },
  sectionHeader: {
    fontSize: fontScale(18),
    fontWeight: '800',
    color: Theme.colors.text,
    marginBottom: verticalScale(16),
    marginLeft: scale(4),
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: moderateScale(40),
  },
  onboardingHeader: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  heroLogo: { width: scale(180), height: scale(180), marginBottom: verticalScale(24) },
  appName: { fontSize: fontScale(42), fontWeight: '900', color: Theme.colors.text, letterSpacing: -1 },
  bottomArea: { width: '100%', paddingBottom: verticalScale(100) },
  primaryButton: {
    backgroundColor: Theme.colors.primary,
    height: verticalScale(64),
    borderRadius: moderateScale(20),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    ...Theme.shadow,
  },
  buttonText: { color: '#fff', fontSize: fontScale(18), fontWeight: '800', marginRight: scale(10) },
  pairingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  pairingContent: { padding: moderateScale(40), alignItems: 'center', width: '100%' },
  iconPulseContainer: {
    width: scale(120),
    height: scale(120),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(40),
  },
  iconCirclePairing: {
    width: scale(80),
    height: scale(80),
    borderRadius: scale(40),
    backgroundColor: 'rgba(240, 128, 128, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(240, 128, 128, 0.2)',
    zIndex: 2,
  },
  pulseCircle: {
    position: 'absolute',
    width: scale(100),
    height: scale(100),
    borderRadius: scale(50),
    backgroundColor: 'rgba(240, 128, 128, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(240, 128, 128, 0.2)',
  },
  pairingTitle: { 
    fontSize: fontScale(28), 
    fontWeight: '800', 
    color: Theme.colors.text, 
    marginBottom: verticalScale(16),
    textAlign: 'center' 
  },
  pairingSubtitle: {
    fontSize: fontScale(16),
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: fontScale(24),
    marginBottom: verticalScale(48),
    paddingHorizontal: scale(20),
  },
  pairingActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(93, 64, 55, 0.05)',
    paddingVertical: verticalScale(16),
    paddingHorizontal: scale(24),
    borderRadius: moderateScale(20),
    borderWidth: 1,
    borderColor: 'rgba(93, 64, 55, 0.1)',
  },
  pairingActionText: {
    color: Theme.colors.text,
    fontSize: fontScale(16),
    fontWeight: '600',
    marginRight: scale(8),
  }
});
