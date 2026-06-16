import {
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  useFonts,
} from '@expo-google-fonts/manrope';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import {
  Dimensions,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.page}>

        {/* ── Full-screen background photo ── */}
        <Image
          source={require('@/assets/images/welcomebg.png')}
          style={styles.bgImage}
          contentFit="cover"
        />

        {/* ── Gradient overlay — transparent top → solid black bottom ── */}
        <LinearGradient
          colors={[
            'rgba(0,0,0,0.05)',
            'rgba(0,0,0,0.25)',
            'rgba(0,0,0,0.75)',
            '#000000',
          ]}
          locations={[0, 0.35, 0.65, 1]}
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

        {/* ── Bottom content ── */}
        <View style={styles.content}>

          {/* Headline */}
          <Text style={styles.headline} allowFontScaling={false}>
            Imagine.{'\n'}Visualize.{'\n'}Build{' '}
            <Text style={styles.headlineGold}>Extraordinary.</Text>
          </Text>

          {/* Description */}
          <Text style={styles.description} allowFontScaling={false}>
            AI-Powered visualization and accurate estimates for construction,
            renovation &amp; interior projects.
          </Text>

          {/* Buttons */}
          <View style={styles.buttons}>
            <Pressable
              onPress={() => router.push('/screens/LoginScreen')}
              style={({ pressed }) => [styles.loginButton, pressed && styles.pressed]}
            >
              <Text style={styles.loginButtonText} allowFontScaling={false}>
                Login
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.push('/screens/SignupScreen')}
              style={({ pressed }) => [styles.createButton, pressed && styles.pressed]}
            >
              <Text style={styles.createButtonText} allowFontScaling={false}>
                Create Account
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.replace('/screens/HomeScreen')}
              style={({ pressed }) => [styles.guestButton, pressed && styles.pressed]}
            >
              <Text style={styles.guestText} allowFontScaling={false}>
                Continue as Guest
              </Text>
            </Pressable>
          </View>

          {/* Divider */}
          <View style={styles.rule} />

          {/* Footer */}
          <Text style={styles.footer} allowFontScaling={false}>
            By continuing, you agree to our{'\n'}
            <Text style={styles.footerLink}>Terms of Use</Text>
            {' '}and{' '}
            <Text style={styles.footerLink}>Privacy Policy.</Text>
          </Text>
        </View>
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
    top: 96,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  brandName: {
    color: '#C9922A',
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

  // ── Bottom content ───────────────────────────────────────────────────────────
  content: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 50,
    paddingHorizontal: 27,
    // paddingBottom: 40,
  },

  // Headline
  headline: {
    color: '#FFFFFF',
    fontFamily: 'Manrope_700Bold',
    fontSize: 33,
    fontWeight: '700',
    lineHeight: 36,
    marginBottom: 17,
  },
  headlineGold: {
    color: '#C9922A',
  },

  // Description
  description: {
    color: 'rgba(255,255,255,0.70)',
    fontFamily: 'Manrope_500Medium',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 38,
    // marginTop:5,
    width: '85%',
  },

  // Buttons
  buttons: {
    gap: 22,
    marginBottom: 20,
  },
  loginButton: {
    width: '100%',
    height: 52,
    borderRadius: 8,
    backgroundColor: '#C9922A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Manrope_700Bold',
    fontSize: 15,
    fontWeight: '700',
  },
  createButton: {
    width: '100%',
    height: 52,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#C9922A',
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom:0,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Manrope_700Bold',
    fontSize: 15,
    fontWeight: '700',
  },
  guestButton: {
    height: 36,
    alignItems: 'center',
    justifyContent: 'center', 
    marginTop:40,
  },
  guestText: {
    color: 'rgba(255,255,255,0.75)',
    fontFamily: 'Manrope_500Medium',
    fontSize: 13,
  },

  // Divider
  rule: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginBottom: 16,
  },

  // Footer
  footer: {
    color: 'rgba(255,255,255,0.55)',
    fontFamily: 'Manrope_500Medium',
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
  },
  footerLink: {
    color: '#C9922A',
    fontFamily: 'Manrope_700Bold',
  },

  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },
});
