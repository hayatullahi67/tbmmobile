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
import {
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

        {/* ── Brand — top center ── */}
        <View style={styles.brand}>
          <Text style={styles.brandName} allowFontScaling={false}>
            Z I O R A
          </Text>
          <Text style={styles.brandTagline} allowFontScaling={false}>
            AI VISUALIZER &amp; ESTIMATES
          </Text>
        </View>

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
                />

                <Pressable
                  onPress={() => setEmailSent(true)}
                  style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
                >
                  <Text style={styles.actionButtonText} allowFontScaling={false}>
                    Send to Email
                  </Text>
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
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  brandName: {
    color: GOLD,
    fontFamily: 'Manrope_500Medium',
    fontSize: 28,
    letterSpacing: 6,
    lineHeight: 34,
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
    marginBottom: 150,
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
