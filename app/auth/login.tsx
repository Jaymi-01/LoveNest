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
import { scale, verticalScale, moderateScale, fontScale } from '../../lib/responsive';

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
        colors={[Theme.colors.background, '#FFEDE0', Theme.colors.background]}
        style={StyleSheet.absoluteFill}
      />
      
      <View style={styles.content}>
        <View style={styles.headerArea}>
          <Image 
            source={require('../../assets/images/logo-transparent.png')} 
            style={{ width: 140, height: 140, marginBottom: 16 }}
            resizeMode="contain"
          />
          <Text style={styles.subtitle}>
            {isRegister ? 'Start your journey together' : 'Welcome back'}
          </Text>
        </View>

        <View style={styles.formArea}>
          <View style={styles.inputWrapper}>
            <View style={styles.inputContainer}>
              <Mail color={Theme.colors.primary} size={20} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor="rgba(93, 64, 55, 0.4)"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <View style={styles.inputContainer}>
              <Lock color={Theme.colors.primary} size={20} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="rgba(93, 64, 55, 0.4)"
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
        </View>
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
    padding: moderateScale(24),
  },
  headerArea: {
    alignItems: 'center',
    marginBottom: verticalScale(40),
  },
  logoCircle: {
    width: scale(80),
    height: scale(80),
    borderRadius: scale(40),
    backgroundColor: 'rgba(233, 78, 119, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(16),
    borderWidth: 1,
    borderColor: 'rgba(233, 78, 119, 0.2)',
  },
  title: {
    fontSize: fontScale(32),
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: fontScale(16),
    color: Theme.colors.textSecondary,
    marginTop: verticalScale(8),
    textAlign: 'center',
    opacity: 0.8,
  },
  formArea: {
    width: '100%',
  },
  card: {
    padding: moderateScale(24),
    borderRadius: moderateScale(32),
  },
  formTitle: {
    fontSize: fontScale(22),
    fontWeight: '700',
    color: '#fff',
    marginBottom: verticalScale(24),
  },
  inputWrapper: {
    marginBottom: verticalScale(20),
  },
  inputLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: fontScale(12),
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: verticalScale(8),
    marginLeft: scale(4),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: moderateScale(16),
    borderWidth: 1,
    borderColor: 'rgba(240, 128, 128, 0.15)',
    paddingHorizontal: scale(16),
    height: verticalScale(56),
  },
  inputIcon: {
    marginRight: scale(12),
  },
  input: {
    flex: 1,
    color: Theme.colors.text,
    fontSize: fontScale(16),
  },
  button: {
    backgroundColor: Theme.colors.primary,
    height: verticalScale(56),
    borderRadius: moderateScale(16),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: verticalScale(12),
    ...Theme.shadow,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: fontScale(17),
    fontWeight: '700',
    marginRight: scale(8),
  },
  toggleContainer: {
    marginTop: verticalScale(24),
    alignItems: 'center',
  },
  toggleText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: fontScale(14),
  },
  toggleAction: {
    color: Theme.colors.primary,
    fontWeight: '700',
  },
});
