import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';

interface SplashScreenProps {
  onFinish?: () => void;
}

export default function CustomSplashScreen({ onFinish }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(async () => {
      await SplashScreen.hideAsync();
      onFinish?.();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View style={styles.container}>
      {/* Main Logo */}
      <Image
        source={require('@/assets/images/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Bottom Left Vectors */}
      <View style={styles.vectorContainer}>
        <Image
          source={require('@/assets/images/Vector1.png')}
          style={styles.vector1}
        //   resizeMode="contain"
        />
        <Image
          source={require('@/assets/images/Vector.png')}
          style={styles.vector2}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  logo: {
    width: 187,
    height: 187,
    marginBottom: 40,
  },
  vectorContainer: {
    position: 'absolute',
    bottom: 0,
    left: 7,
    width: '100%',
    // height: 150,
    flexDirection: 'row',
    // paddingLeft: 20,
    // paddingBottom: 20,
  },
  vector1: {
    // width: 90,
    height: 257,
    // marginRight: 10,
  },
  vector2: {
    width: 120,
    position: 'absolute',
    bottom: -30,
    left:120,
    height: 230,
  },
});
