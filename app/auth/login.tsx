import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  KeyboardAvoidingView, 
  Platform,
  Dimensions,
  Image
} from 'react-native';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Theme } from '../../constants/Theme';
import { GlassCard } from '../../components/GlassCard';
import { useRouter } from 'expo-router';
import { Mail, Lock, Heart, ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { height } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      if (isRegister) {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', res.user.uid), {
          email,
          createdAt: new Date().toISOString(),
          nestId: null,
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.replace('/');
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <LinearGradient
        colors={[Theme.colors.background, '#1a0808', Theme.colors.background]}
        style={StyleSheet.absoluteFill}
      />
      
      <View style={styles.content}>
        <View style={styles.headerArea}>
          <Image 
            source={require('../../assets/images/logo-transparent.png')} 
            style={{ width: 120, height: 120, marginBottom: 16 }}
            resizeMode="contain"
          />
          <Text style={styles.title}>Love Nest</Text>
          <Text style={styles.subtitle}>
            {isRegister ? 'Start your journey together' : 'Welcome back'}
          </Text>
        </View>

        <GlassCard style={styles.card} intensity={60}>
          <Text style={styles.formTitle}>{isRegister ? 'Sign Up' : 'Login'}</Text>
          
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <View style={styles.inputContainer}>
              <Mail color={Theme.colors.primary} size={18} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputContainer}>
              <Lock color={Theme.colors.primary} size={18} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleAuth}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Processing...' : (isRegister ? 'Create Account' : 'Sign In')}
            </Text>
            {!loading && <ChevronRight color="#fff" size={20} />}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.toggleContainer} 
            onPress={() => setIsRegister(!isRegister)}
          >
            <Text style={styles.toggleText}>
              {isRegister ? 'Already have an account? ' : "New to Love Nest? "}
              <Text style={styles.toggleAction}>
                {isRegister ? 'Login' : 'Create one'}
              </Text>
            </Text>
          </TouchableOpacity>
        </GlassCard>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  headerArea: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(233, 78, 119, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(233, 78, 119, 0.2)',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: Theme.colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.8,
  },
  card: {
    padding: 24,
    borderRadius: 32,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 24,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  button: {
    backgroundColor: Theme.colors.primary,
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    ...Theme.shadow,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    marginRight: 8,
  },
  toggleContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  toggleText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
  },
  toggleAction: {
    color: Theme.colors.primary,
    fontWeight: '700',
  },
});
