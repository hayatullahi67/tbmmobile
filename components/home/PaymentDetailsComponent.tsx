import {
  Raleway_400Regular,
  Raleway_500Medium,
  Raleway_600SemiBold,
  Raleway_700Bold,
  useFonts,
} from '@expo-google-fonts/raleway';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { HomeProduct } from '@/app/data/home';

type PaymentDetailsComponentProps = {
  product: HomeProduct;
  total: string;
  onPayNow?: () => void;
};

export function PaymentDetailsComponent({
  product,
  total,
  onPayNow,
}: PaymentDetailsComponentProps) {
  useFonts({
    Raleway_400Regular,
    Raleway_500Medium,
    Raleway_600SemiBold,
    Raleway_700Bold,
  });

  return (
    <View style={styles.wrapper}>
      <View style={styles.productCard}>
        <Image source={product.image} style={styles.productImage} contentFit="cover" />

        <View style={styles.productContent}>
          <Text style={styles.productName} allowFontScaling={false}>
            {product.name}
          </Text>
          <Text style={styles.deliveryText} allowFontScaling={false}>
            EST: 15 WORKING DAYS
          </Text>
        </View>

        <Text style={styles.priceText} allowFontScaling={false}>
          {total}
        </Text>
      </View>

      <View style={styles.paymentCard}>
        <View style={styles.fieldBlock}>
          <Text style={styles.label} allowFontScaling={false}>
            Card number
          </Text>
          <TextInput
            placeholder="5627 2158 9854 8869"
            placeholderTextColor="#B8B8B8"
            style={styles.lineInput}
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.fieldBlock}>
          <Text style={styles.label} allowFontScaling={false}>
            Card Holder
          </Text>
          <TextInput
            placeholder="Najeeb Abubakar"
            placeholderTextColor="#B8B8B8"
            style={styles.lineInput}
          />
        </View>

        <View style={styles.bottomRow}>
          <View style={[styles.fieldBlock, styles.halfField]}>
            <Text style={styles.label} allowFontScaling={false}>
              Expires Date
            </Text>
            <TextInput
              placeholder="12/08"
              placeholderTextColor="#B8B8B8"
              style={styles.lineInput}
            />
          </View>

          <View style={[styles.fieldBlock, styles.cvvField]}>
            <Text style={styles.label} allowFontScaling={false}>
              CVV
            </Text>
            <TextInput
              placeholder="1|"
              placeholderTextColor="#FFFFFF"
              style={styles.lineInput}
              keyboardType="number-pad"
              maxLength={3}
            />
          </View>
        </View>
      </View>

      <Pressable
        onPress={onPayNow}
        style={({ pressed }) => [styles.payButton, pressed && styles.pressed]}
      >
        <Text style={styles.payButtonText} allowFontScaling={false}>
          Pay Now
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 24,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#252523',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  productImage: {
    width: 95,
    height: 82,
  },
  productContent: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  productName: {
    color: '#FFFFFF',
    fontFamily: 'Raleway_600SemiBold',
    fontSize: 14,
    lineHeight: 18,
  },
  deliveryText: {
    color: '#B6B6B6',
    fontFamily: 'Raleway_500Medium',
    fontSize: 8,
    lineHeight: 12,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  priceText: {
    color: '#C9922A',
    fontFamily: 'Raleway_700Bold',
    fontSize: 14,
    lineHeight: 18,
  },
  paymentCard: {
    backgroundColor: '#252523',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 42,
  },
  fieldBlock: {
    gap: 10,
  },
  label: {
    color: '#FFFFFF',
    // fontFamily: 'Raleway_500Medium',
    fontSize: 16,
    lineHeight: 16,
  },
  lineInput: {
    borderBottomWidth: 1,
    borderBottomColor: '#8F8F8F',
    color: '#FFFFFF',
    // fontFamily: 'Raleway_400Regular',
    fontSize: 12,
    lineHeight: 16,
    paddingBottom: 8,
    paddingTop: 0,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 18,
  },
  halfField: {
    flex: 1,
  },
  cvvField: {
    width: 82,
  },
  payButton: {
    width: '100%',
    height: 56,
    borderRadius: 8,
    backgroundColor: '#C9922A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  payButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Raleway_700Bold',
    fontSize: 14,
    lineHeight: 18,
  },
  pressed: {
    opacity: 0.82,
  },
});
