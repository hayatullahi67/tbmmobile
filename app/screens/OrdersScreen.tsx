import {
  Raleway_400Regular,
  Raleway_600SemiBold,
  Raleway_700Bold,
  useFonts,
} from '@expo-google-fonts/raleway';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { footerNavItems } from '@/app/data/home';
import { MOCK_ORDERS, STATUS_COLOR } from '@/app/data/orders';
import { HomeFooter } from '@/components/home/HomeFooter';
import { HOME_HORIZONTAL_PADDING } from '@/components/home/layout';

export const options = {
  headerShown: false,
};

export default function OrdersScreen() {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Raleway_700Bold,
    Raleway_600SemiBold,
    Raleway_400Regular,
  });

  if (!fontsLoaded) return null;

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
            My Orders
          </Text>
        </View>

        <View style={styles.divider} />

        {/* ── Order list ── */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {MOCK_ORDERS.map((order) => (
            <Pressable
              key={order.id}
              onPress={() =>
                router.push({
                  pathname: '/screens/OrderDetailScreen',
                  params: { orderId: order.id },
                })
              }
              style={({ pressed }) => [styles.card, pressed && styles.pressed]}
            >
              {/* Product image */}
              <View style={styles.imageWrap}>
                <Image
                  source={order.image}
                  style={styles.productImage}
                  // contentFit="contain"
                />
              </View>

              {/* Info */}
              <View style={styles.info}>
                <Text style={styles.productName} allowFontScaling={false}>
                  {order.productName}
                </Text>
                <Text style={styles.delivery} allowFontScaling={false}>
                  EST: {order.deliveryDays} WORKING DAYS
                </Text>
                {/* Status badge */}
                {/* <View style={[styles.statusBadge, { backgroundColor: STATUS_COLOR[order.status] + '22' }]}>
                  <Text style={[styles.statusText, { color: STATUS_COLOR[order.status] }]} allowFontScaling={false}>
                    {order.status}
                  </Text>
                </View> */}
              </View>

              {/* Price */}
              <Text style={styles.price} allowFontScaling={false}>
                {order.price}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

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
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: HOME_HORIZONTAL_PADDING,
    paddingTop: 20,
    paddingBottom: 110,
    gap: 14,
    marginTop:20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#252523',
    // borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 19,
    gap: 12,
  },
  imageWrap: {
    width: 89,
    height: 82,
    borderRadius: 6,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  productImage: {
    width: 89,
    height: 82,
  },
  info: {
    flex: 1,
    gap: 5,
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
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginTop: 4,
  },
  statusText: {
    fontFamily: 'Raleway_600SemiBold',
    fontSize: 10,
    lineHeight: 13,
  },
  price: {
    color: '#C9922A',
    fontFamily: 'Raleway_700Bold',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
    flexShrink: 0,
  },
  pressed: {
    opacity: 0.82,
  },
});
