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
import { useAuth } from '../context/AuthContext';
import { Theme } from '../constants/Theme';
import { GlassCard } from '../components/GlassCard';
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
            <Text style={styles.greeting}>Hello, Beautiful</Text>
            <Text style={styles.subGreeting}>Welcome back to your Nest</Text>
          </View>
          <TouchableOpacity style={styles.settingsBtn}>
            <Settings color={Theme.colors.textSecondary} size={24} />
          </TouchableOpacity>
        </View>

        {/* Anniversary Hero */}
        <TouchableOpacity activeOpacity={0.9}>
          <LinearGradient
            colors={['rgba(233, 78, 119, 0.4)', 'rgba(233, 78, 119, 0.1)']}
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
              <Heart color="#fff" fill="#fff" size={32} />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Mood & Status Row */}
        <View style={styles.statusRow}>
          <GlassCard style={styles.moodMiniCard}>
             <Smile color={Theme.colors.primary} size={24} />
             <Text style={styles.miniLabel}>Mood Map</Text>
          </GlassCard>
          <GlassCard style={[styles.moodMiniCard, { borderColor: Theme.colors.accent }]}>
             <Clock color={Theme.colors.accent} size={24} />
             <Text style={styles.miniLabel}>Cooldown</Text>
          </GlassCard>
        </View>

        {/* The Grid */}
        <Text style={styles.sectionHeader}>Our Space</Text>
        <View style={styles.grid}>
          <FeatureIcon 
            icon={<MessageSquare color="#fff" size={28} />} 
            label="Chat" 
            color="#E94E77" 
            onPress={() => router.push('/chat')}
          />
          <FeatureIcon 
            icon={<Calendar color="#fff" size={28} />} 
            label="Calendar" 
            color="#9B59B6" 
            onPress={() => router.push('/calendar')}
          />
          <FeatureIcon 
            icon={<Camera color="#fff" size={28} />} 
            label="Scrapbook" 
            color="#3498DB" 
            onPress={() => router.push('/scrapbook')}
          />
          <FeatureIcon 
            icon={<Book color="#fff" size={28} />} 
            label="Journals" 
            color="#F1C40F" 
            onPress={() => router.push('/journals')}
          />
          <FeatureIcon 
            icon={<Mail color="#fff" size={28} />} 
            label="Letters" 
            color="#E67E22" 
            onPress={() => router.push('/love-letters')}
          />
          <FeatureIcon 
            icon={<Lock color="#fff" size={28} />} 
            label="Security" 
            color="#607D8B" 
            onPress={() => {}}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const FeatureIcon = ({ icon, label, color, onPress }: any) => (
  <TouchableOpacity style={styles.gridItem} onPress={onPress}>
    <GlassCard style={styles.gridCard} intensity={30}>
      <View style={[styles.iconContainer, { backgroundColor: color }]}>
        {icon}
      </View>
      <Text style={styles.gridLabel}>{label}</Text>
    </GlassCard>
  </TouchableOpacity>
);

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
    width: (width - 50) / 2,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
  },
  miniLabel: { color: '#fff', marginLeft: 12, fontWeight: '700', fontSize: 15 },
  sectionHeader: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 20,
    marginLeft: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: (width - 60) / 3,
    marginBottom: 20,
  },
  gridCard: {
    padding: 16,
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    ...Theme.shadow,
  },
  gridLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontWeight: '700',
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
