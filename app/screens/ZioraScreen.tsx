import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

export const options = {
  headerShown: false,
};

export default function ZioraScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.page}>
        <Image
          source={require('@/assets/images/welcomebg.png')}
          style={styles.background}
          contentFit="cover"
        />
        <LinearGradient
          colors={[
            'rgba(0, 0, 0, 0.08)',
            'rgba(0, 0, 0, 0.28)',
            'rgba(0, 0, 0, 0.82)',
            '#000000',
          ]}
          locations={[0, 0.38, 0.68, 1]}
          style={styles.gradient}
        />

        <View style={styles.brand}>
          <Image
            source={require('@/assets/images/logo.png')}
            style={styles.tbmLogo}
            contentFit="contain"
          />
          <Text style={styles.logo} allowFontScaling={false}>
            Z I O R A ( B O G A T )
          </Text>
          <Text style={styles.tagline} allowFontScaling={false}>
            AI VISUALIZER & ESTIMATES
          </Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.title} allowFontScaling={false}>
            Imagine.{'\n'}Visualize.{'\n'}Build <Text style={styles.goldText}>Extraordinary.</Text>
          </Text>

          <Text style={styles.description} allowFontScaling={false}>
            AI-powered visualization and accurate estimates for construction, renovation &
            interior projects.
          </Text>

          <View style={styles.actions}>
            <Pressable
              onPress={() => router.push('/screens/LoginScreen')}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
            >
              <Text style={styles.primaryButtonText} allowFontScaling={false}>
                Login
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.push('/screens/SignupScreen')}
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
            >
              <Text style={styles.secondaryButtonText} allowFontScaling={false}>
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

          <View style={styles.rule} />

          <Text style={styles.terms} allowFontScaling={false}>
            By continuing, you agree to our{'\n'}
            <Text style={styles.termsLink}>Terms of Use</Text> and{' '}
            <Text style={styles.termsLink}>Privacy Policy.</Text>
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
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  brand: {
    position: 'absolute',
    top: 130,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  tbmLogo: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  logo: {
    color: '#D4AF37',
    fontFamily: 'Manrope',
    fontSize: 22,
    fontWeight: '500',
    letterSpacing: 2,
    lineHeight: 26,
  },
  tagline: {
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 13,
    marginTop: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 27,
    paddingBottom: 42,
    marginTop:200,
  },
  title: {
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 35,
  },
  goldText: {
    color: '#D4AF37',
  },
  description: {
    width: '88%',
    color: '#DADADA',
    fontFamily: 'Manrope',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 18,
    marginTop: 18,
  },
  actions: {
    gap: 15,
    marginTop: 33,
  },
  primaryButton: {
    width: '100%',
    height: 51,
    borderRadius: 9,
    backgroundColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
  secondaryButton: {
    width: '100%',
    height: 51,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#D4AF37',
    backgroundColor: 'rgba(0, 0, 0, 0.44)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
  guestButton: {
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestText: {
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  rule: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.13)',
    marginTop: 20,
    marginBottom: 21,
  },
  terms: {
    color: '#DADADA',
    fontFamily: 'Manrope',
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 17,
    textAlign: 'center',
  },
  termsLink: {
    color: '#D4AF37',
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.84,
  },
});
