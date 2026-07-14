import {
  Raleway_400Regular,
  Raleway_600SemiBold,
  Raleway_700Bold,
  useFonts,
} from '@expo-google-fonts/raleway';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';

import { footerNavItems } from '@/app/data/home';
import { Order, STATUS_COLOR } from '@/app/data/orders';
import { ApiService } from '@/app/services/apiService';
import { HomeFooter } from '@/components/home/HomeFooter';
import { HOME_HORIZONTAL_PADDING } from '@/components/home/layout';

export const options = {
  headerShown: false,
};

const mapApiOrder = (apiOrder: any): Order => {
  const firstItem = apiOrder.items?.[0] || apiOrder.orderItems?.[0];
  const productName = 
    apiOrder.productName || 
    firstItem?.productName || 
    firstItem?.product?.name || 
    `Order #${apiOrder.orderNumber || apiOrder.id?.substring(0, 8) || ''}`;

  // Price formatting
  let priceStr = 'N0';
  const priceVal = apiOrder.totalAmount ?? apiOrder.total ?? apiOrder.price ?? firstItem?.price;
  if (priceVal !== undefined && priceVal !== null) {
    priceStr = typeof priceVal === 'number' 
      ? `₦${priceVal.toLocaleString()}` 
      : String(priceVal).startsWith('₦') || String(priceVal).startsWith('N') 
        ? String(priceVal) 
        : `₦${priceVal}`;
  }

  // Image source
  let imageSrc: any = require('@/assets/images/Productpic.png');
  const imageUrl = firstItem?.product?.imageUrl || firstItem?.imageUrl || apiOrder.imageUrl || apiOrder.image;
  if (imageUrl) {
    imageSrc = { uri: imageUrl };
  }

  // Map status
  let statusName: Order['status'] = 'Processing';
  const statusVal = apiOrder.status;
  if (statusVal === 0 || statusVal === 'Pending') statusName = 'Processing';
  else if (statusVal === 1 || statusVal === 'Processing') statusName = 'Processing';
  else if (statusVal === 4 || statusVal === 'Shipped') statusName = 'Shipped';
  else if (statusVal === 5 || statusVal === 'Delivered') statusName = 'Delivered';
  else if (typeof statusVal === 'string' && ['processing', 'shipped', 'delivered'].includes(statusVal.toLowerCase())) {
    statusName = (statusVal.charAt(0).toUpperCase() + statusVal.slice(1).toLowerCase()) as Order['status'];
  }

  return {
    id: apiOrder.id || 'ord-' + Math.random(),
    productName,
    price: priceStr,
    deliveryDays: apiOrder.deliveryDays || 15,
    image: imageSrc,
    status: statusName,
  };
};

export default function OrdersScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [fontsLoaded] = useFonts({
    Raleway_700Bold,
    Raleway_600SemiBold,
    Raleway_400Regular,
  });

  useEffect(() => {
    async function fetchOrders() {
      try {
        const response = await ApiService.getMyOrders();
        if (response && response.success && Array.isArray(response.data)) {
          const mapped = response.data.map(mapApiOrder);
          setOrders(mapped);
        } else if (response && Array.isArray(response.data)) {
          const mapped = response.data.map(mapApiOrder);
          setOrders(mapped);
        } else if (Array.isArray(response)) {
          const mapped = response.map(mapApiOrder);
          setOrders(mapped);
        }
      } catch (err) {
        console.error('Failed to load my orders:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

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
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#C9922A" />
          </View>
        ) : orders.length === 0 ? (
          <View style={styles.centerContainer}>
            <Ionicons name="receipt-outline" size={64} color="#555555" />
            <Text style={styles.emptyTitle} allowFontScaling={false}>No Orders Yet</Text>
            <Text style={styles.emptySubtitle} allowFontScaling={false}>
              You haven't placed any orders yet. Once you place an order, it will show up here.
            </Text>
            <Pressable
              style={({ pressed }) => [styles.shopButton, pressed && styles.pressed]}
              onPress={() => router.replace('/screens/HomeScreen')}
            >
              <Text style={styles.shopButtonText} allowFontScaling={false}>Start Shopping</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {orders.map((order) => (
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
                  <View style={[styles.statusBadge, { backgroundColor: STATUS_COLOR[order.status] + '22' }]}>
                    <Text style={[styles.statusText, { color: STATUS_COLOR[order.status] }]} allowFontScaling={false}>
                      {order.status}
                    </Text>
                  </View>
                </View>

                {/* Price */}
                <Text style={styles.price} allowFontScaling={false}>
                  {order.price}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        )}

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
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingTop: 80,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontFamily: 'Raleway_700Bold',
    fontSize: 20,
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#8B8B8B',
    fontFamily: 'Raleway_400Regular',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 24,
  },
  shopButton: {
    backgroundColor: '#C9922A',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  shopButtonText: {
    color: '#000000',
    fontFamily: 'Raleway_700Bold',
    fontSize: 14,
  },
});
