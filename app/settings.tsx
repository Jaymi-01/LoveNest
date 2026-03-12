import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { Theme } from '../constants/Theme';
import { useRouter } from 'expo-router';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User, LogOut, ChevronLeft, Shield, Bell, Heart, Trash2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { scale, verticalScale, moderateScale, fontScale } from '../lib/responsive';

export default function SettingsScreen() {
  const { user, userData, nestData } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/');
    } catch (error) {
      console.error(error);
    }
  };

  const handleLeaveNest = async () => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        nestId: null,
        pendingPairingWith: null,
        pairingRequestFrom: null,
        pairingRequestEmail: null
      });
      router.replace('/');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[Theme.colors.background, '#FFF0E6']}
        style={StyleSheet.absoluteFill}
      />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft color={Theme.colors.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {/* Profile Section */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={[Theme.colors.primary, Theme.colors.accent]}
              style={styles.avatarGradient}
            >
              <User color="#fff" size={40} />
            </LinearGradient>
          </View>
          <Text style={styles.userName}>{user?.email?.split('@')[0]}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          
          <View style={styles.nestBadge}>
            <Heart color={Theme.colors.primary} size={14} fill={Theme.colors.primary} />
            <Text style={styles.nestBadgeText}>
              {nestData ? 'Paired Sanctuary' : 'Unpaired'}
            </Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menu}>
          <TouchableOpacity style={styles.menuItem}>
            <View style={[styles.menuIcon, { backgroundColor: 'rgba(240, 128, 128, 0.1)' }]}>
              <Shield color={Theme.colors.primary} size={20} />
            </View>
            <Text style={styles.menuText}>Privacy & Security</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={[styles.menuIcon, { backgroundColor: 'rgba(240, 128, 128, 0.1)' }]}>
              <Bell color={Theme.colors.primary} size={20} />
            </View>
            <Text style={styles.menuText}>Notifications</Text>
          </TouchableOpacity>

          {userData?.nestId && (
            <TouchableOpacity style={styles.menuItem} onPress={handleLeaveNest}>
              <View style={[styles.menuIcon, { backgroundColor: 'rgba(255, 107, 107, 0.1)' }]}>
                <Trash2 color="#FF6B6B" size={20} />
              </View>
              <Text style={[styles.menuText, { color: '#FF6B6B' }]}>Leave Nest</Text>
            </TouchableOpacity>
          )}

          <View style={styles.divider} />

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <LogOut color="#FF6B6B" size={20} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: moderateScale(20),
    height: verticalScale(60),
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fontScale(18),
    fontWeight: '700',
    color: Theme.colors.text,
  },
  content: {
    flex: 1,
    padding: moderateScale(24),
  },
  profileCard: {
    alignItems: 'center',
    marginBottom: verticalScale(40),
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: moderateScale(32),
    padding: moderateScale(32),
    borderWidth: 1,
    borderColor: 'rgba(240, 128, 128, 0.1)',
  },
  avatarContainer: {
    marginBottom: verticalScale(16),
  },
  avatarGradient: {
    width: scale(80),
    height: scale(80),
    borderRadius: scale(40),
    justifyContent: 'center',
    alignItems: 'center',
    ...Theme.shadow,
  },
  userName: {
    fontSize: fontScale(22),
    fontWeight: '800',
    color: Theme.colors.text,
    textTransform: 'capitalize',
  },
  userEmail: {
    fontSize: fontScale(14),
    color: Theme.colors.textSecondary,
    marginTop: verticalScale(4),
  },
  nestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(240, 128, 128, 0.1)',
    paddingVertical: verticalScale(6),
    paddingHorizontal: scale(12),
    borderRadius: moderateScale(12),
    marginTop: verticalScale(16),
  },
  nestBadgeText: {
    color: Theme.colors.primary,
    fontSize: fontScale(12),
    fontWeight: '700',
    marginLeft: scale(6),
  },
  menu: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: moderateScale(24),
    padding: moderateScale(8),
    borderWidth: 1,
    borderColor: 'rgba(240, 128, 128, 0.1)',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: moderateScale(16),
  },
  menuIcon: {
    width: scale(40),
    height: scale(40),
    borderRadius: moderateScale(12),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(16),
  },
  menuText: {
    fontSize: fontScale(16),
    fontWeight: '600',
    color: Theme.colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(93, 64, 55, 0.05)',
    marginHorizontal: moderateScale(16),
    marginVertical: verticalScale(8),
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: moderateScale(16),
    marginBottom: verticalScale(8),
  },
  logoutText: {
    fontSize: fontScale(16),
    fontWeight: '700',
    color: '#FF6B6B',
    marginLeft: scale(16),
  },
});
