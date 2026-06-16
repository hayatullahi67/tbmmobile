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

// ── Brand gold — matches WelcomeScreen ───────────────────────────────────────
const GOLD = '#C9922A';

export default function LoginScreen() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

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
            <View style={styles.form}>

              {/* Title */}
              <Text style={styles.title} allowFontScaling={false}>
                Welcome Back
              </Text>
              <Text style={styles.subtitle} allowFontScaling={false}>
                Login to your TBM account
              </Text>

              {/* Email */}
              <TextInput
                style={styles.input}
                placeholder="Enter Email Address"
                placeholderTextColor="rgba(255,255,255,0.35)"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                allowFontScaling={false}
              />

              {/* Password */}
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Password"
                  placeholderTextColor="rgba(255,255,255,0.35)"
                  secureTextEntry={!showPassword}
                  allowFontScaling={false}
                />
                <Pressable
                  onPress={() => setShowPassword(p => !p)}
                  style={styles.eyeButton}
                  hitSlop={8}
                >
                  <Ionicons
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color={GOLD}
                  />
                </Pressable>
              </View>

              {/* Forgot password */}
              <Pressable
                onPress={() => router.replace('/screens/ForgotPasswordScreen')}
                style={styles.forgotRow}
                hitSlop={8}
              >
                <Text style={styles.forgotText} allowFontScaling={false}>
                  Forgot Password?
                </Text>
              </Pressable>

              {/* Login button */}
              <Pressable
                onPress={() => router.replace('/screens/HomeScreen')}
                style={({ pressed }) => [styles.loginButton, pressed && styles.pressed]}
              >
                <Text style={styles.loginButtonText} allowFontScaling={false}>
                  Login
                </Text>
              </Pressable>

              {/* Divider */}
              <View style={styles.rule} />

              {/* Footer */}
              <Text style={styles.footerText} allowFontScaling={false}>
                {"Don't have an account?"}{' '}
                <Text
                  style={styles.footerLink}
                  onPress={() => router.push('/screens/SignupScreen')}
                >
                  Create Account Here
                </Text>
              </Text>
            </View>
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
    // paddingBottom: 70,
    marginBottom:70,
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

  // ── Forgot ───────────────────────────────────────────────────────────────────
  forgotRow: {
    alignSelf: 'flex-end',
    marginTop: -4,
  },
  forgotText: {
    color: 'rgba(255,255,255,0.55)',
    fontFamily: 'Manrope_400Regular',
    fontSize: 12,
  },

  // ── Login button ─────────────────────────────────────────────────────────────
  loginButton: {
    width: '100%',
    height: 52,
    borderRadius: 8,
    backgroundColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  loginButtonText: {
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
