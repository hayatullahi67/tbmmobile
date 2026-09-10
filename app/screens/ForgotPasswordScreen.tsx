import {
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    useFonts,
} from '@expo-google-fonts/manrope';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ApiService } from '../services/apiService';
import FeedbackModal from '@/components/FeedbackModal';
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

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

export const options = { headerShown: false };

const GOLD = '#C9922A';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
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

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      showFeedback('error', 'Validation Error', 'Please enter your email address.');
      return;
    }
    setLoading(true);
    try {
      const response = await ApiService.forgotPassword(email.trim());
      if (response.success) {
        showFeedback(
          'success',
          'Success',
          response.message || 'If the email exists, a password reset link has been sent.',
          () => {
            setEmailSent(true);
          }
        );
      } else {
        showFeedback(
          'error',
          'Failed',
          response.message || 'Something went wrong. Please check your network connection.'
        );
      }
    } catch (err: any) {
      showFeedback(
        'error',
        'Error',
        err.message || 'Something went wrong. Please check your network connection.'
      );
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
          source={require('@/assets/images/modern_interior_dark.png')}
          style={styles.bgImage}
          contentFit="cover"
        />

        {/* ── Gradient overlay ── */}
        <LinearGradient
          colors={[
            'rgba(0,0,0,0.65)',
            'rgba(0,0,0,0.3)',
            'rgba(0,0,0,0.75)',
            '#000000',
          ]}
          locations={[0, 0.35, 0.7, 1]}
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
            {/* ── Brand ── */}
            <View style={styles.brand}>
              <Text style={styles.brandName} allowFontScaling={false}>
                Z I O R A
              </Text>
              <Text style={styles.brandTagline} allowFontScaling={false}>
                POWERED BY TBM BUILDING SERVICES
              </Text>
            </View>

            {emailSent ? (
              /* ── Email sent state ── */
              <View style={styles.sentContainer}>
                <Image
                  source={require('@/assets/images/email.png')}
                  style={styles.emailIcon}
                  contentFit="contain"
                />
                <Text style={styles.sentTitle} allowFontScaling={false}>
                  Check your email
                </Text>
                <Text style={styles.sentSubtitle} allowFontScaling={false}>
                  Please check your email to reset password
                </Text>
                <Pressable
                  onPress={() => router.replace('/screens/LoginScreen')}
                  style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
                >
                  <Text style={styles.actionButtonText} allowFontScaling={false}>
                    Back to Login
                  </Text>
                </Pressable>
              </View>
            ) : (
              /* ── Default state ── */
              <View style={styles.form}>
                <Text style={styles.title} allowFontScaling={false}>
                  Forgot Password
                </Text>
                <Text style={styles.subtitle} allowFontScaling={false}>
                  Enter your email to receive a reset link
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="Enter Email Address"
                  placeholderTextColor="rgba(255,255,255,0.35)"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={setEmail}
                  allowFontScaling={false}
                  editable={!loading}
                />

                <Pressable
                  onPress={handleForgotPassword}
                  disabled={loading}
                  style={({ pressed }) => [
                    styles.actionButton,
                    pressed && styles.pressed,
                    loading && { opacity: 0.7 }
                  ]}
                >
                  {loading ? (
                    <ActivityIndicator color="#000000" />
                  ) : (
                    <Text style={styles.actionButtonText} allowFontScaling={false}>
                      Send to Email
                    </Text>
                  )}
                </Pressable>

                <View style={styles.rule} />

                <Text style={styles.footerText} allowFontScaling={false}>
                  Remember your password?{' '}
                  <Text
                    style={styles.footerLink}
                    onPress={() => router.replace('/screens/LoginScreen')}
                  >
                    Login Here
                  </Text>
                </Text>
              </View>
            )}
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
    alignItems: 'flex-start',
    marginTop: 15,
    marginBottom: 50,
    paddingHorizontal: 27,
  },
  brandName: {
    color: GOLD,
    fontFamily: 'Manrope_700Bold',
    fontSize: 30,
    letterSpacing: 5,
    lineHeight: 36,
    fontWeight: '700',
  },
  brandTagline: {
    color: '#FFFFFF',
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 11,
    letterSpacing: 1.5,
    lineHeight: 16,
    marginTop: 4,
    opacity: 0.75,
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
    justifyContent: 'center',
    paddingBottom: 50,
  },

  // ── Default form ─────────────────────────────────────────────────────────────
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
  actionButton: {
    width: '100%',
    height: 52,
    borderRadius: 8,
    backgroundColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Manrope_700Bold',
    fontSize: 15,
    fontWeight: '700',
  },
  rule: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginVertical: 4,
  },
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

  // ── Email sent state ──────────────────────────────────────────────────────────
  sentContainer: {
    paddingHorizontal: 27,
    alignItems: 'center',
    gap: 16,
  },
  emailIcon: {
    width: 180,
    height: 180,
    marginBottom: 8,
  },
  sentTitle: {
    color: GOLD,
    fontFamily: 'Manrope_700Bold',
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 32,
    textAlign: 'center',
  },
  sentSubtitle: {
    color: 'rgba(255,255,255,0.70)',
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: 16,
  },

  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },
});
