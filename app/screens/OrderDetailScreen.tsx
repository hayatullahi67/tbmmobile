import {
    Raleway_400Regular,
    Raleway_600SemiBold,
    Raleway_700Bold,
    useFonts,
} from '@expo-google-fonts/raleway';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { footerNavItems } from '@/app/data/home';
import { HomeFooter } from '@/components/home/HomeFooter';
import { HOME_HORIZONTAL_PADDING } from '@/components/home/layout';

// ─── Re-use the same mock data shape — swap with API later ───────────────────
import { MOCK_ORDERS } from '@/app/data/orders';

export const options = {
  headerShown: false,
};

export default function OrderDetailScreen() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId?: string }>();

  const [fontsLoaded] = useFonts({
    Raleway_400Regular,
    Raleway_600SemiBold,
    Raleway_700Bold,
  });

  if (!fontsLoaded) return null;

  // Find the order — fallback to first if not found
  const order = MOCK_ORDERS.find(o => o.id === orderId) ?? MOCK_ORDERS[0];

  const handleFooterSelect = (itemId: string) => {
    if (itemId === 'home') router.replace('/screens/HomeScreen');
    if (itemId === 'cart') router.push('/screens/CartScreen');
    if (itemId === 'favorite') router.push('/screens/FavoriteScreen');
    if (itemId === 'profile') router.push('/screens/ProfileScreen');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.page}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={10}>
            <Ionicons name="chevron-back" size={18} color="#C9922A" />
          </Pressable>
          <Text style={styles.headerTitle} allowFontScaling={false}>
            My Order
          </Text>
        </View>

        <View style={styles.divider} />

        {/* ── Order detail card ── */}
        <View style={styles.content}>
          <View style={styles.card}>

            {/* Top row — image + name + price */}
            <View style={styles.topRow}>
              <View style={styles.imageWrap}>
                <Image
                  source={order.image}
                  style={styles.productImage}
                  // contentFit="contain"
                />
              </View>

              <View style={styles.info}>
                <Text style={styles.productName} allowFontScaling={false}>
                  {order.productName}
                </Text>
                <Text style={styles.delivery} allowFontScaling={false}>
                  EST: {order.deliveryDays} WORKING DAYS
                </Text>
              </View>

              <Text style={styles.price} allowFontScaling={false}>
                {order.price}
              </Text>
            </View>

            {/* Divider inside card */}
            <View style={styles.cardDivider} />

            {/* Tracking message */}
            <View style={styles.trackingWrap}>
              <Text style={styles.trackingText} allowFontScaling={false}>
                Tracking details will be{'\n'}available in your email
              </Text>
            </View>
          </View>
        </View>

        <HomeFooter
          items={footerNavItems}
          activeItemId="profile"
          onSelectItem={handleFooterSelect}
        />
      </View>
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

  // ── Header ──────────────────────────────────────────────────────────────────
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
    fontWeight: '700',
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

  // ── Content ──────────────────────────────────────────────────────────────────
  content: {
    flex: 1,
    paddingHorizontal: HOME_HORIZONTAL_PADDING,
    paddingTop: 24,
  },

  // ── Card ─────────────────────────────────────────────────────────────────────
  card: {
    backgroundColor: '#252523',
    borderRadius: 12,
    overflow: 'hidden',
  },

  // Top row
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  imageWrap: {
    width: 110,
    height: 100,
    borderRadius: 6,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  productImage: {
    width: 110,
    height: 100,
  },
  info: {
    flex: 1,
    gap: 6,
  },
  productName: {
    color: '#FFFFFF',
    fontFamily: 'Raleway_600SemiBold',
    fontSize: 14,
    lineHeight: 18,
  },
  delivery: {
    color: '#8B8B8B',
    fontFamily: 'Raleway_600SemiBold',
    fontSize: 8,
    lineHeight: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  price: {
    color: '#C9922A',
    fontFamily: 'Raleway_700Bold',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
    flexShrink: 0,
  },

  // Card divider
  cardDivider: {
    height: 1,
    backgroundColor: '#3A3A3A',
    marginHorizontal: 12,
  },

  // Tracking
  trackingWrap: {
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackingText: {
    color: '#6B6B6B',
    fontFamily: 'Raleway_400Regular',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
});
