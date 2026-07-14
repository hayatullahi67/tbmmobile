import {
    Raleway_400Regular,
    Raleway_500Medium,
    Raleway_600SemiBold,
    Raleway_700Bold,
    useFonts,
} from '@expo-google-fonts/raleway';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useMemo, useState, useCallback } from 'react';
import {
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

import { footerNavItems } from '@/app/data/home';
import { useCart } from '@/components/home/CartContext';
import { HomeFooter } from '@/components/home/HomeFooter';
import { HOME_HORIZONTAL_PADDING } from '@/components/home/layout';
import { OrderAcceptedComponent } from '@/components/home/OrderAcceptedComponent';
import { PaymentDetailsComponent } from '@/components/home/PaymentDetailsComponent';

export const options = {
  headerShown: false,
};

const SHIPPING_FEE = 5000;

function parsePrice(price: string) {
  const numericPrice = Number(price.replace(/[^0-9]/g, ''));
  return Number.isNaN(numericPrice) ? 0 : numericPrice;
}

function formatCurrency(amount: number) {
  return `N${amount.toLocaleString('en-NG')}`;
}

export default function CheckoutScreen() {
  const router = useRouter();
  const { productId } = useLocalSearchParams<{ productId?: string }>();
  const { cartItems, refreshCart } = useCart();

  useFocusEffect(
    useCallback(() => {
      refreshCart();
    }, [refreshCart])
  );
  const [selectedState] = useState('Lagos - N5000');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [saveAddress, setSaveAddress] = useState(false);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [showOrderAccepted, setShowOrderAccepted] = useState(false);

  useFonts({
    Raleway_400Regular,
    Raleway_500Medium,
    Raleway_600SemiBold,
    Raleway_700Bold,
  });

  const selectedItem = useMemo(
    () => productId ? cartItems.find(item => item.product.id === productId) : null,
    [cartItems, productId]
  );

  const subtotal = useMemo(() => {
    if (selectedItem) {
      return parsePrice(selectedItem.product.price) * selectedItem.quantity;
    }
    return cartItems.reduce((sum, item) => sum + parsePrice(item.product.price) * item.quantity, 0);
  }, [selectedItem, cartItems]);

  const total = subtotal + SHIPPING_FEE;

  const handleFooterSelect = (itemId: string) => {
    if (itemId === 'home') {
      router.replace('/screens/HomeScreen');
    }

    if (itemId === 'cart') {
      router.replace('/screens/CartScreen');
    }

    if (itemId === 'favorite') {
      router.push('/screens/FavoriteScreen');
    }

    if (itemId === 'profile') {
      router.push('/screens/ProfileScreen');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.page}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 18 : 0}
      >
        {showOrderAccepted ? null : (
          <>
            <View style={styles.header}>
              <Pressable
                onPress={() => {
                  if (showPaymentDetails) {
                    setShowPaymentDetails(false);
                    return;
                  }

                  router.back();
                }}
                style={styles.backButton}
                hitSlop={10}
              >
                <Ionicons name="chevron-back" size={18} color="#C9922A" />
              </Pressable>

              <Text style={styles.headerTitle} allowFontScaling={false}>
                {showPaymentDetails ? 'Payment' : 'Checkout'}
              </Text>
            </View>

            <View style={styles.divider} />
          </>
        )}

        <ScrollView
          style={styles.contentScroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="none"
        >
          {showOrderAccepted ? (
            <OrderAcceptedComponent onMyOrder={() => router.replace('/screens/CartScreen')} />
          ) : showPaymentDetails && (selectedItem || cartItems[0]) ? (
            <PaymentDetailsComponent
              product={selectedItem ? selectedItem.product : cartItems[0].product}
              total={formatCurrency(total)}
              onPayNow={() => setShowOrderAccepted(true)}
            />
          ) : (
            <>
              <View style={styles.fieldGroup}>
                <Text style={styles.sectionTitle} allowFontScaling={false}>
                  Select delivery state
                </Text>

                <Pressable style={styles.selectField}>
                  <Text style={styles.selectFieldText} allowFontScaling={false}>
                    {selectedState}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color="#5C6C72" />
                </Pressable>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.sectionTitle} allowFontScaling={false}>
                  Delivery Details
                </Text>

                <TextInput
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Full Name"
                  placeholderTextColor="#B6B6B6"
                  style={styles.input}
                />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Email"
                  placeholderTextColor="#B6B6B6"
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <TextInput
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder="Phone number"
                  placeholderTextColor="#B6B6B6"
                  style={styles.input}
                  keyboardType="phone-pad"
                />
                <TextInput
                  value={address}
                  onChangeText={setAddress}
                  placeholder="Address"
                  placeholderTextColor="#B6B6B6"
                  style={styles.input}
                />

                <Pressable
                  onPress={() => setSaveAddress(currentValue => !currentValue)}
                  style={styles.saveAddressRow}
                  hitSlop={10}
                >
                  <View
                    style={[
                      styles.saveAddressCircle,
                      saveAddress && styles.saveAddressCircleActive,
                    ]}
                  >
                    {saveAddress ? <View style={styles.saveAddressInnerCircle} /> : null}
                  </View>
                  <Text style={styles.saveAddressText} allowFontScaling={false}>
                    Save Address
                  </Text>
                </Pressable>
              </View>

              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel} allowFontScaling={false}>
                    Subtotal
                  </Text>
                  <Text style={styles.summaryValue} allowFontScaling={false}>
                    {formatCurrency(subtotal)}
                  </Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel} allowFontScaling={false}>
                    Shipping
                  </Text>
                  <Text style={styles.summaryValue} allowFontScaling={false}>
                    {formatCurrency(SHIPPING_FEE)}
                  </Text>
                </View>

                <View style={styles.totalSummaryRow}>
                  <Text style={styles.totalSummaryLabel} allowFontScaling={false}>
                    Total
                  </Text>
                  <Text style={styles.totalSummaryValue} allowFontScaling={false}>
                    {formatCurrency(total)}
                  </Text>
                </View>

                <Pressable
                  onPress={() => setShowPaymentDetails(true)}
                  style={({ pressed }) => [styles.payButton, pressed && styles.pressed]}
                >
                  <Text style={styles.payButtonText} allowFontScaling={false}>
                    Pay Now
                  </Text>
                </Pressable>
              </View>
            </>
          )}
        </ScrollView>

        <HomeFooter
          items={footerNavItems}
          activeItemId="cart"
          onSelectItem={handleFooterSelect}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
    marginTop: 30,
  },
  page: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    height: 41,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 17,
    width: 28,
    height: 28,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontFamily: 'Raleway_700Bold',
    fontSize: 16,
    lineHeight: 20,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#2A2A2A',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 3,
    elevation: 4,
  },
  contentScroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingTop: 24,
    paddingHorizontal: HOME_HORIZONTAL_PADDING,
    paddingBottom: 102,
    gap: 26,
  },
  fieldGroup: {
    gap: 11,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontFamily: 'Raleway_500Medium',
    fontSize: 15,
    lineHeight: 18,
  },
  selectField: {
    width: '100%',
    height: 50,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#3A3833',
    backgroundColor: '#252523',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectFieldText: {
    color: '#E7E7E7',
    fontFamily: 'Raleway_400Regular',
    fontSize: 11,
    lineHeight: 15,
  },
  input: {
    width: '100%',
    height: 50,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#3A3833',
    backgroundColor: '#252523',
    paddingHorizontal: 12,
    color: '#FFFFFF',
    fontFamily: 'Raleway_400Regular',
    fontSize: 11,
    lineHeight: 15,
  },
  saveAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginTop: 4,
  },
  saveAddressCircle: {
    width: 13,
    height: 13,
    borderRadius: 6.5,
    borderWidth: 1,
    borderColor: '#C9922A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveAddressCircleActive: {
    borderColor: '#C9922A',
  },
  saveAddressInnerCircle: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#C9922A',
  },
  saveAddressText: {
    color: '#C9922A',
    fontFamily: 'Raleway_400Regular',
    fontSize: 12,
    // lineHeight: 12,
  },
  summaryCard: {
    borderRadius: 8,
    backgroundColor: '#252523',
    paddingHorizontal: 18,
    paddingTop: 24,
    paddingBottom: 15,
    gap: 15,
    marginTop: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    color: '#FFFFFF',
    fontFamily: 'Raleway_600SemiBold',
    fontSize: 15,
    lineHeight: 14,
  },
  summaryValue: {
    color: '#FFFFFF',
    // fontFamily: 'Raleway_400Regular',
    fontSize: 15,
    // lineHeight: 14,
  },
  totalSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 8,
  },
  totalSummaryLabel: {
    color: '#C9922A',
    // fontFamily: 'Raleway_700Bold',
    fontSize: 15,
    lineHeight: 18,
  },
  totalSummaryValue: {
    color: '#C9922A',
    // fontFamily: 'Raleway_700Bold',
    fontSize: 15,
    lineHeight: 18,
  },
  payButton: {
    width: '100%',
    height: 52,
    borderRadius: 6,
    backgroundColor: '#C9922A',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
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
