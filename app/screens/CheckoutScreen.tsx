import {
  Raleway_400Regular,
  Raleway_500Medium,
  Raleway_600SemiBold,
  Raleway_700Bold,
  useFonts,
} from '@expo-google-fonts/raleway';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useMemo, useState, useCallback, useEffect } from 'react';
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
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';

import { footerNavItems } from '@/app/data/home';
import { useCart } from '@/components/home/CartContext';
import { HomeFooter } from '@/components/home/HomeFooter';
import { HOME_HORIZONTAL_PADDING } from '@/components/home/layout';
import { OrderAcceptedComponent } from '@/components/home/OrderAcceptedComponent';
import { ApiService } from '@/app/services/apiService';
import { TokenService } from '@/app/services/tokenService';
import { PaystackWebViewModal } from '@/components/PaystackWebViewModal';

export const options = {
  headerShown: false,
};

function formatCurrency(amount: number) {
  return `N${Math.round(amount).toLocaleString('en-NG')}`;
}

export default function CheckoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ productId?: string; designSessionId?: string; cartTotalPrice?: string }>();
  const designSessionId = params.designSessionId || null;
  
  const { refreshCart } = useCart();

  // Basic Details States
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [saveAddress, setSaveAddress] = useState(false);
  const [showOrderAccepted, setShowOrderAccepted] = useState(false);

  // Address Selector States
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  // Promo Code States
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);

  // Checkout Data States
  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [isLoadingCheckout, setIsLoadingCheckout] = useState(false);

  // Paystack & WebView Modal States
  const [showPaystack, setShowPaystack] = useState(false);
  const [paystackUrl, setPaystackUrl] = useState('');
  const [paystackRef, setPaystackRef] = useState('');
  const [isInitiatingPayment, setIsInitiatingPayment] = useState(false);
  const [guestSessionId, setGuestSessionId] = useState<string | null>(null);

  useFonts({
    Raleway_400Regular,
    Raleway_500Medium,
    Raleway_600SemiBold,
    Raleway_700Bold,
  });

  // Fetch user profile fallback details
  const loadAddressAndProfile = async () => {
    try {
      const token = await TokenService.getAccessToken();
      if (!token) {
        const u = await TokenService.getUser();
        if (u) {
          setFullName(`${u.firstName || ''} ${u.lastName || ''}`.trim());
          setEmail(u.email || '');
          setPhoneNumber(u.phoneNumber || u.phone || '');
        }
        return;
      }

      const profile = await ApiService.getUserProfile();
      if (profile) {
        if (profile.email) setEmail(profile.email);
        if (profile.phoneNumber && !phoneNumber) setPhoneNumber(profile.phoneNumber);
        
        if (!fullName) {
          if (profile.fullName) {
            setFullName(profile.fullName);
          } else if (profile.firstName && profile.lastName) {
            setFullName(`${profile.firstName} ${profile.lastName}`);
          }
        }
      }
    } catch (err) {
      console.error('Failed to pre-fill checkout details from profile:', err);
      try {
        const u = await TokenService.getUser();
        if (u) {
          setFullName(`${u.firstName || ''} ${u.lastName || ''}`.trim());
          setEmail(u.email || '');
          setPhoneNumber(u.phoneNumber || u.phone || '');
        }
      } catch (_) {}
    }
  };

  // Fetch checkout details from backend
  const fetchCheckout = useCallback(async (appliedPromo: string | null = null) => {
    const token = await TokenService.getAccessToken();
    if (!token) return;

    setIsLoadingCheckout(true);
    try {
      const data = await ApiService.getCheckout(appliedPromo);
      if (data) {
        setCheckoutData(data);
        if (Array.isArray(data.savedAddresses)) {
          setAddresses(data.savedAddresses);
          
          if (data.savedAddresses.length > 0) {
            const defaultAddr = data.savedAddresses.find((a: any) => a.isDefault) || data.savedAddresses[0];
            setSelectedAddressId(prevId => {
              if (!prevId && defaultAddr) {
                setAddress(defaultAddr.street || defaultAddr.address || '');
                setCity(defaultAddr.city || '');
                setPhoneNumber(prevPhone => prevPhone || defaultAddr.phone || '');
                setFullName(prevName => prevName || defaultAddr.fullName || '');
                return defaultAddr.id;
              }
              return prevId;
            });
          }
        }
      }
    } catch (err) {
      console.error('[CHECKOUT] Error fetching checkout details:', err);
    } finally {
      setIsLoadingCheckout(false);
    }
  }, []);

  // Initialize Guest Session ID if guest
  useEffect(() => {
    async function initGuestSession() {
      try {
        const token = await TokenService.getAccessToken();
        if (!token) {
          let gId = await SecureStore.getItemAsync('guest_session_id');
          if (!gId) {
            gId = 'guest_' + Math.random().toString(36).substring(2, 15);
            await SecureStore.setItemAsync('guest_session_id', gId);
          }
          setGuestSessionId(gId);
        }
      } catch (err) {
        console.error('Failed to initialize guest session ID:', err);
      }
    }
    initGuestSession();
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshCart();
      loadAddressAndProfile();
      fetchCheckout(promoApplied ? promoCode.trim() : null);
    }, [refreshCart, fetchCheckout])
  );

  // Final checkout total (coming entirely from backend)
  const displayTotal = checkoutData?.total || 0;

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      Alert.alert('Info', 'Please enter a promo code.');
      return;
    }
    setIsValidatingPromo(true);
    try {
      const res = await ApiService.validatePromoCode(promoCode.trim());
      if (res && res.success) {
        setPromoApplied(true);
        await fetchCheckout(promoCode.trim());
        Alert.alert('Promo Applied', res.message || 'Promo code applied successfully.');
      } else {
        Alert.alert('Promo Failed', res.message || 'Invalid promo code.');
        setPromoApplied(false);
        await fetchCheckout(null);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to validate promo code.');
      setPromoApplied(false);
      await fetchCheckout(null);
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const handlePromoTextChange = (text: string) => {
    setPromoCode(text);
    if (promoApplied) {
      setPromoApplied(false);
      fetchCheckout(null);
    }
  };

  const handlePayNow = async () => {
    if (!fullName.trim() || !email.trim() || !phoneNumber.trim() || !address.trim() || !city.trim()) {
      Alert.alert('Missing Fields', 'Please fill in all delivery details (including city).');
      return;
    }

    setIsInitiatingPayment(true);
    try {
      const ref = 'pstk_ch_' + Date.now() + '_' + Math.random().toString(36).substring(2, 10);
      const idempotencyKey = 'idemp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 12);
      
      // Determine state: if they selected an address, use its state. Otherwise, default to "Lagos".
      const cleanState = selectedAddressId
        ? (addresses.find(a => a.id === selectedAddressId)?.state || 'Lagos')
        : 'Lagos';
        
      const token = await TokenService.getAccessToken();

      const payload = {
        designSessionId: designSessionId,
        guestEmail: !token ? email.trim() : null,
        guestPhone: !token ? phoneNumber.trim() : null,
        guestSessionId: !token ? guestSessionId : null,
        delivery: {
          fullName: fullName.trim(),
          phone: phoneNumber.trim(),
          address: address.trim(),
          city: city.trim(),
          state: cleanState,
          notes: '',
          customerNotes: '',
        },
        payment: {
          method: 'paystack',
          reference: ref,
          callbackUrl: 'https://tbmdev-001-site1.dtempurl.com/api/v1/Checkout/payment/paystack/callback',
        },
        total: displayTotal,
        promoCode: promoApplied ? promoCode.trim() : null,
        idempotencyKey: idempotencyKey,
      };

      console.log('[CHECKOUT] Initiating checkout payment with payload:', JSON.stringify(payload, null, 2));
      const res = await ApiService.initiateCheckoutPayment(payload);

      const authUrl = res.data || (res as any).authorizationUrl;
      if (authUrl) {
        setPaystackUrl(authUrl);
        setPaystackRef(ref);
        setShowPaystack(true);
      } else {
        throw new Error(res.message || 'Failed to retrieve payment URL from server.');
      }
    } catch (err: any) {
      console.error('[CHECKOUT] Payment initiation error:', err);
      Alert.alert('Payment Error', err.message || 'An error occurred while initiating payment.');
    } finally {
      setIsInitiatingPayment(false);
    }
  };

  const handlePaystackWebViewClose = async () => {
    setShowPaystack(false);
    if (!paystackRef) return;

    try {
      console.log('[CHECKOUT] Verifying payment for reference:', paystackRef);
      const verifyRes = await ApiService.verifyCheckoutPayment(paystackRef);
      console.log('[CHECKOUT] Verification response:', JSON.stringify(verifyRes, null, 2));

      if (verifyRes && verifyRes.success) {
        setShowOrderAccepted(true);
      } else {
        Alert.alert(
          'Payment Unverified',
          verifyRes.message || 'We could not verify your payment. Reference: ' + paystackRef
        );
      }
    } catch (err: any) {
      console.error('[CHECKOUT] Verification failed:', err);
      Alert.alert('Verification Error', err.message || 'An error occurred during verification.');
    }
  };

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
                onPress={() => router.back()}
                style={styles.backButton}
                hitSlop={10}
              >
                <Ionicons name="chevron-back" size={18} color="#C9922A" />
              </Pressable>

              <Text style={styles.headerTitle} allowFontScaling={false}>
                Checkout
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
          ) : (
            <>
              {/* Address Selection Section */}
              {addresses.length > 0 ? (
                <View style={styles.fieldGroup}>
                  <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitle} allowFontScaling={false}>
                      Select Delivery Address
                    </Text>
                    <Pressable onPress={() => router.push('/screens/AddressFormScreen')}>
                      <Text style={styles.addNewAddressText} allowFontScaling={false}>+ Add New</Text>
                    </Pressable>
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.addressListScroll}
                  >
                    {addresses.map((addr) => {
                      const isSelected = selectedAddressId === addr.id;
                      return (
                        <Pressable
                          key={addr.id}
                          onPress={() => {
                            setSelectedAddressId(addr.id);
                            setAddress(addr.street || addr.address || '');
                            setCity(addr.city || '');
                            if (addr.phone) setPhoneNumber(addr.phone);
                            if (addr.fullName) setFullName(addr.fullName);
                          }}
                          style={[
                            styles.addressCard,
                            isSelected && styles.addressCardActive,
                          ]}
                        >
                          <View style={styles.addressCardHeader}>
                            <Text style={styles.addressCardName} allowFontScaling={false} numberOfLines={1}>
                              {addr.fullName}
                            </Text>
                            {isSelected && (
                              <Ionicons name="checkmark-circle" size={16} color="#C9922A" />
                            )}
                          </View>
                          <Text style={styles.addressCardText} allowFontScaling={false} numberOfLines={1}>
                            {addr.street}
                          </Text>
                          <Text style={styles.addressCardText} allowFontScaling={false} numberOfLines={1}>
                            {addr.city}, {addr.state}
                          </Text>
                          <Text style={styles.addressCardPhone} allowFontScaling={false} numberOfLines={1}>
                            {addr.phone}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </View>
              ) : (
                <View style={styles.noAddressBanner}>
                  <Ionicons name="location-outline" size={18} color="#C9922A" />
                  <Text style={styles.noAddressText} allowFontScaling={false}>
                    No saved addresses found. Fill in details below or{' '}
                    <Text
                      style={styles.noAddressLink}
                      onPress={() => router.push('/screens/AddressFormScreen')}
                    >
                      add a new address
                    </Text>.
                  </Text>
                </View>
              )}

              {/* Delivery Form */}
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
                <TextInput
                  value={city}
                  onChangeText={setCity}
                  placeholder="City (e.g. Ikeja)"
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

              {/* Promo Code section */}
              <View style={styles.fieldGroup}>
                <Text style={styles.sectionTitle} allowFontScaling={false}>
                  Promo Code
                </Text>
                <View style={styles.promoRow}>
                  <TextInput
                    value={promoCode}
                    onChangeText={handlePromoTextChange}
                    placeholder="Enter Promo Code"
                    placeholderTextColor="#B6B6B6"
                    style={[styles.input, { flex: 1, marginBottom: 0 }]}
                    autoCapitalize="characters"
                    editable={!isValidatingPromo}
                  />
                  <Pressable
                    onPress={handleApplyPromo}
                    disabled={isValidatingPromo}
                    style={({ pressed }) => [
                      styles.promoApplyButton,
                      pressed && styles.pressed,
                      promoApplied && styles.promoAppliedButton,
                    ]}
                  >
                    {isValidatingPromo ? (
                      <ActivityIndicator size="small" color="#000000" />
                    ) : (
                      <Text style={styles.promoApplyButtonText} allowFontScaling={false}>
                        {promoApplied ? 'Applied' : 'Apply'}
                      </Text>
                    )}
                  </Pressable>
                </View>
              </View>

              {/* Summary Card */}
              <View style={styles.summaryCard}>
                {checkoutData && (
                  <>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel} allowFontScaling={false}>
                        Subtotal
                      </Text>
                      <Text style={styles.summaryValue} allowFontScaling={false}>
                        {formatCurrency(checkoutData.subtotal)}
                      </Text>
                    </View>
                    
                    {checkoutData.tax > 0 && (
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel} allowFontScaling={false}>
                          Tax 
                        </Text>
                        <Text style={styles.summaryValue} allowFontScaling={false}>
                          {formatCurrency(checkoutData.tax)}
                        </Text>
                      </View>
                    )}

                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel} allowFontScaling={false}>
                        Shipping
                      </Text>
                      <Text style={checkoutData.shipping === 0 ? styles.shippingFreeValue : styles.summaryValue} allowFontScaling={false}>
                        {checkoutData.shipping === 0 ? 'FREE' : formatCurrency(checkoutData.shipping)}
                      </Text>
                    </View>

                    {checkoutData.discount > 0 && (
                      <View style={styles.summaryRow}>
                        <Text style={[styles.summaryLabel, { color: '#28A745' }]} allowFontScaling={false}>
                          Discount
                        </Text>
                        <Text style={[styles.summaryValue, { color: '#28A745' }]} allowFontScaling={false}>
                          -{formatCurrency(checkoutData.discount)}
                        </Text>
                      </View>
                    )}
                  </>
                )}

                <View style={styles.totalSummaryRow}>
                  <Text style={styles.totalSummaryLabel} allowFontScaling={false}>
                    Total
                  </Text>
                  <Text style={styles.totalSummaryValue} allowFontScaling={false}>
                    {formatCurrency(displayTotal)}
                  </Text>
                </View>

                <Pressable
                  onPress={handlePayNow}
                  disabled={isInitiatingPayment}
                  style={({ pressed }) => [styles.payButton, pressed && styles.pressed]}
                >
                  {isInitiatingPayment ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.payButtonText} allowFontScaling={false}>
                      Pay Now ({formatCurrency(displayTotal)})
                    </Text>
                  )}
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

        {/* Real Paystack WebView Modal */}
        <PaystackWebViewModal
          visible={showPaystack}
          onClose={handlePaystackWebViewClose}
          authorizationUrl={paystackUrl}
          reference={paystackRef}
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
    fontSize: 15,
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
    fontSize: 15,
    lineHeight: 18,
  },
  totalSummaryValue: {
    color: '#C9922A',
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
  promoRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  promoApplyButton: {
    height: 50,
    paddingHorizontal: 20,
    borderRadius: 6,
    backgroundColor: '#C9922A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  promoAppliedButton: {
    backgroundColor: '#28A745',
  },
  promoApplyButtonText: {
    color: '#000000',
    fontFamily: 'Raleway_700Bold',
    fontSize: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addNewAddressText: {
    color: '#C9922A',
    fontFamily: 'Raleway_600SemiBold',
    fontSize: 13,
  },
  addressListScroll: {
    gap: 12,
    paddingVertical: 4,
  },
  addressCard: {
    width: 200,
    backgroundColor: '#252523',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3A3833',
    padding: 12,
    gap: 4,
  },
  addressCardActive: {
    borderColor: '#C9922A',
    backgroundColor: 'rgba(201, 146, 42, 0.05)',
  },
  addressCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  addressCardName: {
    color: '#FFFFFF',
    fontFamily: 'Raleway_600SemiBold',
    fontSize: 13,
    flex: 1,
    marginRight: 6,
  },
  addressCardText: {
    color: '#B6B6B6',
    fontFamily: 'Raleway_400Regular',
    fontSize: 11,
    lineHeight: 14,
  },
  addressCardPhone: {
    color: '#C9922A',
    fontFamily: 'Raleway_500Medium',
    fontSize: 10,
    marginTop: 2,
  },
  noAddressBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1E1C18',
    borderWidth: 1,
    borderColor: '#3A2E19',
    borderRadius: 8,
    padding: 12,
  },
  noAddressText: {
    color: '#E7E7E7',
    fontFamily: 'Raleway_400Regular',
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
  noAddressLink: {
    color: '#C9922A',
    fontFamily: 'Raleway_600SemiBold',
    textDecorationLine: 'underline',
  },
  shippingFreeValue: {
    color: '#34C759',
    fontFamily: 'Raleway_700Bold',
    fontSize: 15,
    fontWeight: '700',
  },
});
