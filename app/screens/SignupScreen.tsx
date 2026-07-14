import {
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    useFonts,
} from '@expo-google-fonts/manrope';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ApiService } from '../services/apiService';
import { TokenService } from '../services/tokenService';
import {
    ActivityIndicator,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import FeedbackModal from '@/components/FeedbackModal';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

export const options = { headerShown: false };

const GOLD = '#C9922A';

export default function SignupScreen() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    type: 'success' | 'error' | 'info';
    title: string;
    message: string;
    onClose?: () => void;
  }>({
    type: 'info',
    title: '',
    message: '',
  });

  const showFeedback = (type: 'success' | 'error' | 'info', title: string, message: string, onClose?: () => void) => {
    setModalConfig({ type, title, message, onClose });
    setModalVisible(true);
  };

  const handleSignup = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phoneNumber.trim() || !password.trim()) {
      showFeedback('error', 'Validation Error', 'All fields are required.');
      return;
    }
    setLoading(true);
    try {
      const response = await ApiService.register({
        email: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: phoneNumber.trim(),
      });

      if (response.success && response.data) {
        const { accessToken, refreshToken, user } = response.data;
        if (accessToken && refreshToken) {
          await TokenService.saveTokens(accessToken, refreshToken);
        }
        if (user) {
          await TokenService.saveUser(user);
        }
        showFeedback('success', 'Success', response.message || 'Registration successful! Please login.', () => {
          router.replace('/screens/LoginScreen');
        });
      } else {
        showFeedback('error', 'Registration Failed', response.message || 'An unknown error occurred.');
      }
    } catch (err: any) {
      showFeedback('error', 'Registration Error', err.message || 'An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.page}>

        {/* ── Full-screen background ── */}
        <Image
          source={require('@/assets/images/welcomebg.png')}
          style={styles.bgImage}
          contentFit="cover"
        />

        {/* ── Gradient overlay ── */}
        <LinearGradient
          colors={[
            'rgba(0,0,0,0.10)',
            'rgba(0,0,0,0.55)',
            'rgba(0,0,0,0.88)',
            '#000000',
          ]}
          locations={[0, 0.3, 0.6, 1]}
          style={styles.gradient}
        />

        {/* ── Body ── */}
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* ── Brand — center inside scroll ── */}
            <View style={styles.brand}>
              <Image
                source={require('@/assets/images/logo.png')}
                style={styles.tbmLogo}
                contentFit="contain"
              />
              <Text style={styles.brandName} allowFontScaling={false}>
                Z I O R A ( B O G A T )
              </Text>
              <Text style={styles.brandTagline} allowFontScaling={false}>
                AI VISUALIZER &amp; ESTIMATES
              </Text>
            </View>

            <View style={styles.form}>

              {/* Title */}
              <Text style={styles.title} allowFontScaling={false}>
                Create Account
              </Text>
              <Text style={styles.subtitle} allowFontScaling={false}>
                Enter your details for a new account
              </Text>

              {/* First Name */}
              <TextInput
                style={styles.input}
                placeholder="First Name"
                placeholderTextColor="rgba(255,255,255,0.35)"
                autoCapitalize="words"
                autoCorrect={false}
                allowFontScaling={false}
                value={firstName}
                onChangeText={setFirstName}
                editable={!loading}
              />

              {/* Last Name */}
              <TextInput
                style={styles.input}
                placeholder="Last Name"
                placeholderTextColor="rgba(255,255,255,0.35)"
                autoCapitalize="words"
                autoCorrect={false}
                allowFontScaling={false}
                value={lastName}
                onChangeText={setLastName}
                editable={!loading}
              />

              {/* Email */}
              <TextInput
                style={styles.input}
                placeholder="Enter Email Address"
                placeholderTextColor="rgba(255,255,255,0.35)"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                allowFontScaling={false}
                value={email}
                onChangeText={setEmail}
                editable={!loading}
              />

              {/* Phone Number */}
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                placeholderTextColor="rgba(255,255,255,0.35)"
                keyboardType="phone-pad"
                autoCapitalize="none"
                autoCorrect={false}
                allowFontScaling={false}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                editable={!loading}
              />

              {/* Password */}
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Password"
                  placeholderTextColor="rgba(255,255,255,0.35)"
                  secureTextEntry={!showPassword}
                  allowFontScaling={false}
                  value={password}
                  onChangeText={setPassword}
                  editable={!loading}
                />
                <Pressable
                  onPress={() => setShowPassword(p => !p)}
                  style={styles.eyeButton}
                  hitSlop={8}
                  disabled={loading}
                >
                  <Ionicons
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color={GOLD}
                  />
                </Pressable>
              </View>

              {/* Create Account button */}
              <Pressable
                onPress={handleSignup}
                disabled={loading}
                style={({ pressed }) => [
                  styles.signupButton,
                  pressed && styles.pressed,
                  loading && { opacity: 0.7 }
                ]}
              >
                {loading ? (
                  <ActivityIndicator color="#000000" />
                ) : (
                  <Text style={styles.signupButtonText} allowFontScaling={false}>
                    Create Account
                  </Text>
                )}
              </Pressable>

              {/* Divider */}
              <View style={styles.rule} />

              {/* Footer */}
              <Text style={styles.footerText} allowFontScaling={false}>
                Already have an account?{' '}
                <Text
                  style={styles.footerLink}
                  onPress={() => router.push('/screens/LoginScreen')}
                >
                  Login Here
                </Text>
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
      <FeedbackModal
        visible={modalVisible}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        onClose={() => {
          setModalVisible(false);
          if (modalConfig.onClose) {
            modalConfig.onClose();
          }
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  page: {
    flex: 1,
    backgroundColor: '#000000',
    overflow: 'hidden',
  },

  // ── Background ───────────────────────────────────────────────────────────────
  bgImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },

  // ── Brand ────────────────────────────────────────────────────────────────────
  brand: {
    alignItems: 'center',
    marginTop: 70,
    marginBottom: 20,
  },
  tbmLogo: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  brandName: {
    color: GOLD,
    fontFamily: 'Manrope_500Medium',
    fontSize: 20,
    letterSpacing: 4,
    lineHeight: 26,
  },
  brandTagline: {
    color: '#FFFFFF',
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 10,
    letterSpacing: 1.5,
    lineHeight: 14,
    marginTop: 2,
    opacity: 0.85,
  },

  // ── Keyboard / scroll ────────────────────────────────────────────────────────
  keyboardView: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    marginBottom: 70,
  },

  // ── Form ─────────────────────────────────────────────────────────────────────
  form: {
    paddingHorizontal: 27,
    gap: 14,
  },
  title: {
    color: GOLD,
    fontFamily: 'Manrope_700Bold',
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
    marginBottom: 2,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.70)',
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 6,
  },

  // ── Inputs ───────────────────────────────────────────────────────────────────
  input: {
    width: '100%',
    height: 52,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(201,146,42,0.35)',
    backgroundColor: 'rgba(37,37,35,0.85)',
    paddingHorizontal: 16,
    color: '#F5F5F5',
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
  },
  passwordWrapper: {
    width: '100%',
    height: 52,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(201,146,42,0.35)',
    backgroundColor: 'rgba(37,37,35,0.85)',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    color: '#F5F5F5',
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    height: '100%',
  },
  eyeButton: {
    paddingLeft: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Signup button ─────────────────────────────────────────────────────────────
  signupButton: {
    width: '100%',
    height: 52,
    borderRadius: 8,
    backgroundColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  signupButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Manrope_700Bold',
    fontSize: 15,
    fontWeight: '700',
  },

  // ── Divider ──────────────────────────────────────────────────────────────────
  rule: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginVertical: 4,
  },

  // ── Footer ───────────────────────────────────────────────────────────────────
  footerText: {
    color: 'rgba(255,255,255,0.55)',
    fontFamily: 'Manrope_400Regular',
    fontSize: 12,
    textAlign: 'center',
  },
  footerLink: {
    color: GOLD,
    fontFamily: 'Manrope_700Bold',
  },

  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },
});
