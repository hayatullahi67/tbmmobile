import {
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  useFonts,
} from '@expo-google-fonts/manrope';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  Dimensions,
  Platform,
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

  const handleBookConsultation = () => {
    router.push('/screens/ziora-ai/BookConsultationScreen');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.page}>

        {/* ── Full-screen background photo ── */}
        <Image
          source={require('@/assets/images/modern_interior_dark.png')}
          style={styles.bgImage}
          contentFit="cover"
        />

        {/* ── Gradient overlay — transparent top → solid black bottom ── */}
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

        {/* ── Brand — top left aligned ── */}
        <View style={styles.brand}>
          <Text style={styles.brandName} allowFontScaling={false}>
            Z I O R A
          </Text>
          <Text style={styles.brandTagline} allowFontScaling={false}>
            POWERED BY TBM BUILDING SERVICES
          </Text>
        </View>

        {/* ── Bottom content ── */}
        <View style={styles.content}>
          
          {/* Upper Text Block */}
          <View style={styles.textContainer}>
            {/* Headline */}
            <Text style={styles.headline} allowFontScaling={false}>
              Imagine.{'\n'}Design.{'\n'}
              <Text style={styles.headlineGold}>Build.</Text>
            </Text>

            {/* Description */}
            <Text style={styles.description} allowFontScaling={false}>
              Visualize your space, get{'\n'}intelligent estimates and bring{'\n'}your renovation to life.
            </Text>
          </View>

          {/* Lower Action Block */}
          <View style={styles.actionContainer}>
            {/* Buttons */}
            <View style={styles.buttons}>
              <Pressable
                onPress={() => router.push('/screens/LoginScreen')}
                style={({ pressed }) => [styles.getStartedButton, pressed && styles.pressed]}
              >
                <Text style={styles.getStartedText} allowFontScaling={false}>
                  Get Started
                </Text>
              </Pressable>

              <Pressable
                onPress={handleBookConsultation}
                style={({ pressed }) => [styles.consultationButton, pressed && styles.pressed]}
              >
                <Text style={styles.consultationText} allowFontScaling={false}>
                  Book a Consultation
                </Text>
              </Pressable>
            </View>

            {/* Guest entry link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText} allowFontScaling={false}>
                {"Don't want to sign in? "}
                <Text
                  style={styles.loginGoldText}
                  onPress={() => router.replace('/screens/HomeScreen')}
                >
                  Continue as Guest
                </Text>
              </Text>
            </View>
          </View>
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
    top: Platform.OS === 'ios' ? 70 : 50,
    left: 27,
    right: 27,
    alignItems: 'flex-start',
  },
  brandName: {
    color: '#C9922A',
    fontFamily: 'Manrope_700Bold',
    fontSize: 26,
    letterSpacing: 5,
    lineHeight: 32,
    fontWeight: '700',
  },
  brandTagline: {
    color: '#FFFFFF',
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 9,
    letterSpacing: 1.2,
    lineHeight: 14,
    marginTop: 4,
    opacity: 0.75,
  },

  // ── Bottom content ───────────────────────────────────────────────────────────
  content: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: Platform.OS === 'ios' ? 175 : 145,
    bottom: Platform.OS === 'ios' ? 90 : 75,
    paddingHorizontal: 27,
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    marginBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  actionContainer: {
    width: '100%',
  },

  // Headline
  headline: {
    color: '#FFFFFF',
    fontFamily: 'Manrope_700Bold',
    fontSize: 52,
    fontWeight: '700',
    lineHeight: 58,
    marginBottom: 16,
  },
  headlineGold: {
    color: '#C9922A',
  },

  // Description
  description: {
    color: 'rgba(255,255,255,0.75)',
    fontFamily: 'Manrope_500Medium',
    fontSize: 17,
    lineHeight: 26,
  },

  // Buttons
  buttons: {
    gap: 15,
    marginBottom: 20,
  },
  getStartedButton: {
    width: '100%',
    height: 52,
    borderRadius: 8,
    backgroundColor: '#C9922A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  getStartedText: {
    color: '#000000',
    fontFamily: 'Manrope_700Bold',
    fontSize: 15,
    fontWeight: '700',
  },
  consultationButton: {
    width: '100%',
    height: 52,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#C9922A',
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  consultationText: {
    color: '#FFFFFF',
    fontFamily: 'Manrope_700Bold',
    fontSize: 15,
    fontWeight: '700',
  },

  // Login Area
  loginContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  loginText: {
    color: 'rgba(255,255,255,0.6)',
    fontFamily: 'Manrope_500Medium',
    fontSize: 14,
  },
  loginGoldText: {
    color: '#C9922A',
    fontFamily: 'Manrope_700Bold',
  },

  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});
