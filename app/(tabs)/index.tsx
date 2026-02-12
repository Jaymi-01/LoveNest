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

const { width } = Dimensions.get('window');

export default function Dashboard() {
  const { user, nestData, loading } = useAuth();
  const router = useRouter();

  if (loading) return null;

  if (!user) {
    return (
      <View style={styles.authContainer}>
        <LinearGradient
          colors={[Theme.colors.background, '#1a0505']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.onboardingHeader}>
           <Image 
            source={require('../assets/images/logo-transparent.png')} 
            style={styles.heroLogo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>Love Nest</Text>
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
          colors={[Theme.colors.background, '#2d0a0a']}
          style={StyleSheet.absoluteFill}
        />
        <GlassCard style={styles.pairingCard} intensity={60}>
          <Zap color={Theme.colors.primary} size={48} style={{ marginBottom: 20 }} />
          <Text style={styles.cardTitle}>Finding your partner...</Text>
          <Text style={styles.cardSubtitle}>
            Your Nest is almost ready. Once your partner enters your code, we'll whisk you away to your private space.
          </Text>
          <TouchableOpacity 
            style={styles.pairingButton}
            onPress={() => router.push('/auth/pairing')}
          >
            <Text style={styles.buttonText}>Open Pairing Settings</Text>
          </TouchableOpacity>
        </GlassCard>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={[Theme.colors.background, '#1a0505', Theme.colors.background]}
        style={StyleSheet.absoluteFill}
      />
      
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Love Nest</Text>
            <Text style={styles.subGreeting}>A sanctuary for two</Text>
          </View>
          <TouchableOpacity style={styles.settingsBtn}>
            <Settings color={Theme.colors.textSecondary} size={24} />
          </TouchableOpacity>
        </View>

        {/* Anniversary Hero */}
        <TouchableOpacity activeOpacity={0.9}>
          <LinearGradient
            colors={['rgba(233, 78, 119, 0.2)', 'rgba(233, 78, 119, 0.05)']}
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
  content: { padding: 20, paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  greeting: { fontSize: 28, fontWeight: '800', color: '#fff' },
  subGreeting: { fontSize: 16, color: 'rgba(255,255,255,0.5)', marginTop: 4 },
  settingsBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroCard: {
    height: 160,
    borderRadius: 32,
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(233, 78, 119, 0.3)',
  },
  heroInfo: { flex: 1 },
  heroLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 16, fontWeight: '600' },
  heroValue: { color: '#fff', fontSize: 56, fontWeight: '900', marginTop: 4 },
  heroIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  moodMiniCard: {
    width: '100%',
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderRadius: 32,
  },
  moodPerson: {
    alignItems: 'center',
  },
  personLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  moodStatus: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  moodDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 24,
    marginTop: 20,
  },
  alertText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    marginLeft: 12,
    fontWeight: '500',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 16,
    marginLeft: 4,
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  onboardingHeader: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  heroLogo: { width: 180, height: 180, marginBottom: 24 },
  appName: { fontSize: 42, fontWeight: '900', color: '#fff', letterSpacing: -1 },
  bottomArea: { width: '100%', paddingBottom: 40 },
  primaryButton: {
    backgroundColor: Theme.colors.primary,
    height: 64,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    ...Theme.shadow,
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '800', marginRight: 10 },
  pairingContainer: { flex: 1, justifyContent: 'center', padding: 24 },
  pairingCard: { padding: 32, alignItems: 'center' },
  cardTitle: { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 12 },
  cardSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  pairingButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  }
});
