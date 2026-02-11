import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Theme } from '../constants/Theme';
import { GlassCard } from '../components/GlassCard';
import { 
  Heart, 
  MessageSquare, 
  Calendar, 
  Camera, 
  Book, 
  Smile, 
  Clock, 
  Lock,
  Zap,
  Mail
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { formatDistanceToNow, differenceInDays } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';
import { Alert } from 'react-native';

const { width } = Dimensions.get('window');

export default function Dashboard() {
  const { user, nestData, loading } = useAuth();
  const router = useRouter();

  if (loading) return null;

  if (!user) {
    return (
      <View style={styles.authContainer}>
        <LinearGradient
          colors={['transparent', Theme.colors.surface]}
          style={StyleSheet.absoluteFill}
        />
        <Heart color={Theme.colors.primary} size={80} fill={Theme.colors.primary} style={styles.heroIcon} />
        <Text style={styles.appName}>LoveNest</Text>
        <Text style={styles.tagline}>Your private sanctuary for two</Text>
        
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => router.push('/auth/login')}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!nestData) {
    return (
      <View style={styles.container}>
        <GlassCard style={styles.pairingCard}>
          <Zap color={Theme.colors.primary} size={40} />
          <Text style={styles.cardTitle}>Waiting for your partner...</Text>
          <Text style={styles.cardSubtitle}>Share your code or enter theirs to begin your journey together.</Text>
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => router.push('/auth/pairing')}
          >
            <Text style={styles.buttonText}>Pairing Settings</Text>
          </TouchableOpacity>
        </GlassCard>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Anniversary Countdown */}
      <GlassCard style={styles.anniversaryCard}>
        <View style={styles.row}>
          <Heart color={Theme.colors.primary} fill={Theme.colors.primary} size={24} />
          <Text style={styles.anniversaryTitle}>Days Together</Text>
        </View>
        <Text style={styles.daysCount}>
          {differenceInDays(new Date(), new Date(nestData.anniversaryDate || Date.now()))}
        </Text>
        <Text style={styles.countdownSub}>Next anniversary in 42 days</Text>
      </GlassCard>

      {/* Quick Actions */}
      <View style={styles.grid}>
        <MenuButton 
          icon={<MessageSquare color="#fff" />} 
          label="Chat" 
          onPress={() => router.push('/chat')} 
          color="#E94E77"
        />
        <MenuButton 
          icon={<Calendar color="#fff" />} 
          label="Calendar" 
          onPress={() => router.push('/calendar')} 
          color="#9B59B6"
        />
        <MenuButton 
          icon={<Camera color="#fff" />} 
          label="Scrapbook" 
          onPress={() => router.push('/scrapbook')} 
          color="#3498DB"
        />
        <MenuButton 
          icon={<Book color="#fff" />} 
          label="Journals" 
          onPress={() => router.push('/journals')} 
          color="#F1C40F"
        />
        <MenuButton 
          icon={<Mail color="#fff" />} 
          label="Love Letters" 
          onPress={() => router.push('/love-letters')} 
          color="#E67E22"
        />
        <MenuButton 
          icon={<Lock color="#fff" />} 
          label="Security" 
          onPress={() => Alert.alert("Security Settings", "PIN and Autolock are enabled.")} 
          color="#95A5A6"
        />
      </View>

      {/* Mood Map */}
      <GlassCard style={styles.moodCard}>
        <Text style={styles.sectionTitle}>Mood Map</Text>
        <View style={styles.moodRow}>
          <View style={styles.moodItem}>
            <Text style={styles.moodLabel}>You</Text>
            <Smile color={Theme.colors.accent} size={40} />
            <Text style={styles.moodStatus}>Sunny</Text>
          </View>
          <View style={styles.moodDivider} />
          <View style={styles.moodItem}>
            <Text style={styles.moodLabel}>Partner</Text>
            <Smile color={Theme.colors.primary} size={40} />
            <Text style={styles.moodStatus}>Cloudy</Text>
          </View>
        </View>
      </GlassCard>

      {/* Cooldown Timer (Simulated) */}
      <GlassCard style={styles.cooldownCard}>
        <View style={styles.row}>
          <Clock color={Theme.colors.accent} size={20} />
          <Text style={styles.cooldownTitle}>Cooldown Active</Text>
        </View>
        <Text style={styles.timer}>12:45</Text>
        <Text style={styles.cooldownSub}>Take a deep breath...</Text>
      </GlassCard>
    </ScrollView>
  );
}

const MenuButton = ({ icon, label, onPress, color }: any) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={[styles.iconBox, { backgroundColor: color }]}>
      {icon}
    </View>
    <Text style={styles.menuLabel}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.background,
    padding: 40,
  },
  heroIcon: {
    marginBottom: 20,
    shadowColor: Theme.colors.primary,
    shadowRadius: 20,
    shadowOpacity: 0.5,
  },
  appName: {
    fontSize: 48,
    fontWeight: '800',
    color: Theme.colors.text,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 18,
    color: Theme.colors.textSecondary,
    marginBottom: 40,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: Theme.colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    ...Theme.shadow,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  anniversaryCard: {
    marginBottom: 20,
    alignItems: 'center',
  },
  anniversaryTitle: {
    color: Theme.colors.text,
    fontSize: 18,
    marginLeft: 10,
    fontWeight: '600',
  },
  daysCount: {
    fontSize: 72,
    fontWeight: '900',
    color: Theme.colors.primary,
    marginVertical: 10,
  },
  countdownSub: {
    color: Theme.colors.textSecondary,
    fontSize: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  menuItem: {
    width: (width - 60) / 2,
    backgroundColor: Theme.colors.surface,
    padding: 20,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  menuLabel: {
    color: Theme.colors.text,
    fontWeight: '600',
  },
  moodCard: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: Theme.colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  moodItem: {
    alignItems: 'center',
  },
  moodLabel: {
    color: Theme.colors.textSecondary,
    fontSize: 12,
    marginBottom: 8,
  },
  moodStatus: {
    color: Theme.colors.text,
    marginTop: 8,
    fontWeight: '500',
  },
  moodDivider: {
    width: 1,
    height: 40,
    backgroundColor: Theme.colors.border,
  },
  cooldownCard: {
    borderWidth: 1,
    borderColor: Theme.colors.accent,
  },
  cooldownTitle: {
    color: Theme.colors.accent,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  timer: {
    fontSize: 32,
    color: Theme.colors.text,
    fontWeight: '800',
    marginVertical: 5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pairingCard: {
    marginTop: 100,
    alignItems: 'center',
    textAlign: 'center',
  },
  cardTitle: {
    fontSize: 20,
    color: Theme.colors.text,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 10,
  },
  cardSubtitle: {
    fontSize: 14,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  }
});
