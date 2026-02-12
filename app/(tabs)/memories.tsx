import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Theme } from '../../constants/Theme';
import { GlassCard } from '../../components/GlassCard';
import { Camera, Book, Mail, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function MemoriesScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Theme.colors.background, '#1a0505']}
        style={StyleSheet.absoluteFill}
      />
      
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Memories</Text>
        <Text style={styles.subtitle}>Treasures of your journey together</Text>

        <MemoryLink 
          title="Our Scrapbook" 
          desc="A visual diary of your favorite moments"
          icon={<Camera color={Theme.colors.primary} size={24} />}
          onPress={() => router.push('/scrapbook')}
        />

        <MemoryLink 
          title="Shared Journals" 
          desc="Deep thoughts and daily whispers"
          icon={<Book color="#F1C40F" size={24} />}
          onPress={() => router.push('/journals')}
        />

        <MemoryLink 
          title="Love Letters" 
          desc="Words to be opened in the future"
          icon={<Mail color="#E67E22" size={24} />}
          onPress={() => router.push('/love-letters')}
        />
      </ScrollView>
    </View>
  );
}

const MemoryLink = ({ title, desc, icon, onPress }: any) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
    <GlassCard style={styles.card} intensity={40}>
      <View style={styles.row}>
        <View style={styles.iconCircle}>
          {icon}
        </View>
        <View style={styles.info}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardDesc}>{desc}</Text>
        </View>
        <ChevronRight color="rgba(255,255,255,0.3)" size={20} />
      </View>
    </GlassCard>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  content: { padding: 24, paddingTop: 60 },
  title: { fontSize: 32, fontWeight: '900', color: '#fff' },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.5)', marginBottom: 30, marginTop: 4 },
  card: { marginBottom: 16, padding: 20 },
  row: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  info: { flex: 1 },
  cardTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  cardDesc: { color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 2 },
});
