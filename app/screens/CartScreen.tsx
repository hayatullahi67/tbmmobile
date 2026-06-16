import {
  Raleway_600SemiBold,
  Raleway_700Bold,
  useFonts,
} from '@expo-google-fonts/raleway';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Platform,
  Alert,
} from 'react-native';

import { footerNavItems } from '@/app/data/home';
import { useCart } from '@/components/home/CartContext';
import { HomeFooter } from '@/components/home/HomeFooter';
import { HOME_HORIZONTAL_PADDING } from '@/components/home/layout';

export const options = {
  headerShown: false,
};

// Extensible helper to check currency types dynamically
function checkHasDollar(priceStr: string) {
  return priceStr.includes('$');
}

function parsePrice(price: string) {
  const numericPrice = Number(price.replace(/[^0-9]/g, ''));
  return Number.isNaN(numericPrice) ? 0 : numericPrice;
}

export default function CartScreen() {
  const router = useRouter();
  const { cartItems, removeFromCart, addToCart } = useCart();
  const [promoCode, setPromoCode] = useState('');
  
  useFonts({
    Raleway_600SemiBold,
    Raleway_700Bold,
  });

  const hasItems = cartItems.length > 0;

  // Determine standard active currency prefix
  const hasDollar = useMemo(() => {
    return cartItems.some(item => checkHasDollar(item.product.price));
  }, [cartItems]);

  const formatCartCurrency = (amount: number) => {
    if (hasDollar) {
      return `$` + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return `N${amount.toLocaleString('en-NG')}`;
  };

  // Compute live billing calculations
  const subtotal = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + parsePrice(item.product.price) * item.quantity,
      0
    );
  }, [cartItems]);

  const tax = useMemo(() => {
    // 8% tax matching layout ratios
    return subtotal * 0.08;
  }, [subtotal]);

  const total = useMemo(() => {
    return subtotal + tax;
  }, [subtotal, tax]);

  // Adjust item count label (e.g. "3 items")
  const totalItemsCount = useMemo(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);

  // Quantity control triggers
  const handleIncrement = (item: typeof cartItems[0]) => {
    addToCart(item.product, 1);
  };

  const handleDecrement = (item: typeof cartItems[0]) => {
    if (item.quantity > 1) {
      addToCart(item.product, -1);
    } else {
      // Prompt user or simply delete
      removeFromCart(item.product.id);
    }
  };

  const handleApplyPromo = () => {
    if (!promoCode.trim()) return;
    Alert.alert('Promo Code Applied', `Successfully applied promo code "${promoCode.trim()}"!`);
  };

  const handleFooterSelect = (itemId: string) => {
    if (itemId === 'home') {
      router.replace('/screens/HomeScreen');
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
      <View style={styles.page}>
        {/* ── HEADER ── */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={10}
          >
            <Ionicons name="arrow-back" size={22} color="#C9922A" />
          </Pressable>

          <Text style={styles.headerTitle} allowFontScaling={false}>
            My Cart
          </Text>

          <Text style={styles.headerItemsCount} allowFontScaling={false}>
            {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'}
          </Text>
        </View>

        {/* ── SCROLLVIEW CONTENTS ── */}
        <ScrollView
          style={styles.contentScroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {hasItems ? (
            <>
              {/* Product Cards List */}
              <View style={styles.cardsList}>
                {cartItems.map((item) => {
                  const itemPriceParsed = parsePrice(item.product.price);
                  const itemTotal = itemPriceParsed * item.quantity;
                  const itemHasDollar = checkHasDollar(item.product.price);

                  return (
                    <View key={item.product.id} style={styles.cartCard}>
                      {/* Product Image */}
                      <View style={styles.imageWrap}>
                        <Image
                          source={typeof item.product.image === 'number' ? item.product.image : { uri: item.product.image }}
                          style={styles.productImage}
                          contentFit="cover"
                          transition={200}
                        />
                      </View>

                      {/* Product Content Details */}
                      <View style={styles.productContent}>
                        <View style={styles.nameRow}>
                          <Text style={styles.productName} numberOfLines={1} allowFontScaling={false}>
                            {item.product.name}
                          </Text>
                          <Pressable
                            onPress={() => removeFromCart(item.product.id)}
                            style={styles.removeButton}
                            hitSlop={8}
                          >
                            <Ionicons name="trash-outline" size={16} color="#8A8A8F" />
                          </Pressable>
                        </View>

                        {/* Optional subtitle (description or dimensions details) */}
                        <Text style={styles.subtitleText} numberOfLines={1} allowFontScaling={false}>
                          {item.product.description || 'Premium interior component'}
                        </Text>

                        <Text style={styles.qtyLabel} allowFontScaling={false}>
                          Qty: {item.quantity}
                        </Text>

                        {/* Adjusters Row & Price */}
                        <View style={styles.cardActionsRow}>
                          <View style={styles.counterRow}>
                            <Pressable
                              style={({ pressed }) => [styles.counterBtn, pressed && styles.counterPressed]}
                              onPress={() => handleDecrement(item)}
                            >
                              <Ionicons name="remove" size={14} color="#CCCCCC" />
                            </Pressable>
                            <Text style={styles.counterValue} allowFontScaling={false}>
                              {item.quantity}
                            </Text>
                            <Pressable
                              style={({ pressed }) => [styles.counterBtn, pressed && styles.counterPressed]}
                              onPress={() => handleIncrement(item)}
                            >
                              <Ionicons name="add" size={14} color="#CCCCCC" />
                            </Pressable>
                          </View>

                          <Text style={styles.priceText} allowFontScaling={false}>
                            {itemHasDollar ? '$' : 'N'}{itemTotal.toLocaleString(itemHasDollar ? 'en-US' : 'en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>

              {/* Promo Code Row */}
              <View style={styles.promoSection}>
                <View style={styles.promoInputWrapper}>
                  <TextInput
                    style={styles.promoInput}
                    placeholder="Apply Promo Code"
                    placeholderTextColor="#636366"
                    value={promoCode}
                    onChangeText={setPromoCode}
                    autoCapitalize="characters"
                    allowFontScaling={false}
                  />
                </View>
                <Pressable
                  style={({ pressed }) => [styles.promoApplyBtn, pressed && styles.promoApplyPressed]}
                  onPress={handleApplyPromo}
                >
                  <Text style={styles.promoApplyText} allowFontScaling={false}>
                    Apply
                  </Text>
                </Pressable>
              </View>

              {/* Summary Card */}
              <View style={styles.summarySection}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel} allowFontScaling={false}>
                    Subtotal
                  </Text>
                  <Text style={styles.summaryValue} allowFontScaling={false}>
                    {formatCartCurrency(subtotal)}
                  </Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel} allowFontScaling={false}>
                    Shipping
                  </Text>
                  <Text style={styles.shippingValue} allowFontScaling={false}>
                    FREE
                  </Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel} allowFontScaling={false}>
                    Estimated Tax
                  </Text>
                  <Text style={styles.summaryValue} allowFontScaling={false}>
                    {formatCartCurrency(tax)}
                  </Text>
                </View>

                <View style={styles.dividerSummary} />

                <View style={styles.totalSummaryRow}>
                  <Text style={styles.totalLabel} allowFontScaling={false}>
                    Total
                  </Text>
                  <Text style={styles.totalValue} allowFontScaling={false}>
                    {formatCartCurrency(total)}
                  </Text>
                </View>
              </View>

              {/* Unified Checkout Trigger */}
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: '/screens/CheckoutScreen',
                  })
                }
                style={({ pressed }) => [
                  styles.checkoutButton,
                  pressed && styles.checkoutPressed,
                ]}
              >
                <Ionicons name="card-outline" size={20} color="#000000" style={styles.checkoutBtnIcon} />
                <Text style={styles.checkoutButtonText} allowFontScaling={false}>
                  Proceed to Checkout
                </Text>
              </Pressable>
            </>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="cart-outline" size={52} color="#3A3A3A" />
              <Text style={styles.emptyTitle} allowFontScaling={false}>
                Your cart is empty
              </Text>
              <Text style={styles.emptyHint} allowFontScaling={false}>
                Add dynamic premium materials or components to view them here.
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Existing Application footer bar */}
        <HomeFooter
          items={footerNavItems}
          activeItemId="cart"
          onSelectItem={handleFooterSelect}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#070707',
  },
  page: {
    flex: 1,
    backgroundColor: '#070707',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: '#151515',
    marginTop: Platform.OS === 'android' ? 12 : 4,
  },
  backButton: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: '#0F0F0F',
    borderWidth: 1,
    borderColor: '#1D1D1D',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontFamily: 'Raleway_700Bold',
    fontSize: 16,
    fontWeight: '700',
  },
  headerItemsCount: {
    color: '#8A8A8F',
    fontFamily: 'Raleway_600SemiBold',
    fontSize: 13,
    fontWeight: '500',
  },
  contentScroll: {
    flex: 1,
  },
  content: {
    paddingTop: 16,
    paddingHorizontal: HOME_HORIZONTAL_PADDING,
    paddingBottom: 110,
    gap: 16,
  },
  cardsList: {
    gap: 16,
  },
  cartCard: {
    flexDirection: 'row',
    backgroundColor: '#0F0F0F',
    borderWidth: 1,
    borderColor: '#1A1A1A',
    borderRadius: 18,
    padding: 14,
    height: 148,
  },
  imageWrap: {
    width: 90,
    height: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1E1E1E',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productContent: {
    flex: 1,
    paddingLeft: 14,
    justifyContent: 'space-between',
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productName: {
    color: '#FFFFFF',
    fontFamily: 'Raleway_700Bold',
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  removeButton: {
    padding: 2,
  },
  subtitleText: {
    color: '#8E8E93',
    fontFamily: 'Raleway_600SemiBold',
    fontSize: 10,
    fontWeight: '400',
    marginTop: 2,
  },
  qtyLabel: {
    color: '#8E8E93',
    fontFamily: 'Raleway_600SemiBold',
    fontSize: 11,
    marginTop: 4,
  },
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161616',
    borderWidth: 1,
    borderColor: '#262626',
    borderRadius: 10,
    width: 96,
    height: 30,
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  counterBtn: {
    width: 26,
    height: 26,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterPressed: {
    backgroundColor: '#262626',
  },
  counterValue: {
    color: '#FFFFFF',
    fontFamily: 'Raleway_700Bold',
    fontSize: 13,
    fontWeight: '700',
  },
  priceText: {
    color: '#FFFFFF',
    fontFamily: 'Raleway_700Bold',
    fontSize: 15,
    fontWeight: '700',
  },
  promoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 6,
  },
  promoInputWrapper: {
    flex: 1,
    backgroundColor: '#0F0F0F',
    borderWidth: 1,
    borderColor: '#1D1D1D',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    justifyContent: 'center',
  },
  promoInput: {
    color: '#FFFFFF',
    fontFamily: 'Raleway_600SemiBold',
    fontSize: 13,
    fontWeight: '500',
  },
  promoApplyBtn: {
    backgroundColor: '#0F0F0F',
    borderWidth: 1,
    borderColor: '#C9922A',
    borderRadius: 12,
    paddingHorizontal: 20,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  promoApplyPressed: {
    backgroundColor: 'rgba(201, 146, 42, 0.1)',
  },
  promoApplyText: {
    color: '#C9922A',
    fontFamily: 'Raleway_700Bold',
    fontSize: 13,
    fontWeight: '700',
  },
  summarySection: {
    backgroundColor: '#0F0F0F',
    borderWidth: 1,
    borderColor: '#1A1A1A',
    borderRadius: 18,
    padding: 16,
    marginTop: 8,
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    color: '#8E8E93',
    fontFamily: 'Raleway_600SemiBold',
    fontSize: 13,
    fontWeight: '500',
  },
  summaryValue: {
    color: '#FFFFFF',
    fontFamily: 'Raleway_600SemiBold',
    fontSize: 13,
    fontWeight: '600',
  },
  shippingValue: {
    color: '#34C759',
    fontFamily: 'Raleway_700Bold',
    fontSize: 13,
    fontWeight: '700',
  },
  dividerSummary: {
    height: 1,
    backgroundColor: '#222222',
    marginVertical: 4,
  },
  totalSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLabel: {
    color: '#FFFFFF',
    fontFamily: 'Raleway_700Bold',
    fontSize: 15,
    fontWeight: '700',
  },
  totalValue: {
    color: '#FFFFFF',
    fontFamily: 'Raleway_700Bold',
    fontSize: 20,
    fontWeight: '800',
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#C9922A',
    borderRadius: 12,
    height: 52,
    marginTop: 8,
    shadowColor: '#C9922A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  checkoutPressed: {
    backgroundColor: '#A37521',
    transform: [{ scale: 0.98 }],
  },
  checkoutBtnIcon: {
    marginRight: 8,
  },
  checkoutButtonText: {
    color: '#000000',
    fontFamily: 'Raleway_700Bold',
    fontSize: 15,
    fontWeight: '700',
  },
  emptyState: {
    paddingTop: 80,
    alignItems: 'center',
    gap: 12,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontFamily: 'Raleway_700Bold',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
  },
  emptyHint: {
    color: '#8E8E93',
    fontFamily: 'Raleway_600SemiBold',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
  },
});
