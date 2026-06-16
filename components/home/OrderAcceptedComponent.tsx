import { Manrope_400Regular, useFonts as useManropeFonts } from '@expo-google-fonts/manrope';
import { Outfit_600SemiBold, useFonts as useOutfitFonts } from '@expo-google-fonts/outfit';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type OrderAcceptedComponentProps = {
  onMyOrder?: () => void;
};

export function OrderAcceptedComponent({ onMyOrder }: OrderAcceptedComponentProps) {
  useManropeFonts({
    Manrope_400Regular,
  });
  useOutfitFonts({
    Outfit_600SemiBold,
  });

  return (
    <View style={styles.wrapper}>
      <Image
        source={require('@/assets/images/payment.png')}
        style={styles.image}
        contentFit="contain"
      />

      <Text style={styles.title} allowFontScaling={false}>
        Your Order has been{'\n'}accepted
      </Text>

      <Text style={styles.description} allowFontScaling={false}>
        Your item is being processed! A confirmation{'\n'}email will be sent to you!
      </Text>

      <Pressable
        onPress={onMyOrder}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Text style={styles.buttonText} allowFontScaling={false}>
          My Order
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 28,
  },
  image: {
    width: 277,
    height: 300,
  },
  title: {
    marginTop: 30,
    color: '#FFFFFF',
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 22,
    lineHeight: 31,
    textAlign: 'center',
  },
  description: {
    marginTop: 24,
    color: '#FFFFFF',
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    lineHeight: 24,
    textAlign: 'center',
  },
  button: {
    width: 299,
    height: 53,
    borderRadius: 7,
    backgroundColor: '#C9922A',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 84,
  },
  buttonText: {
    color: '#FFFFFF',
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 16,
    lineHeight: 20,
  },
  pressed: {
    opacity: 0.82,
  },
});
