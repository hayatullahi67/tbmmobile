import {
    Raleway_400Regular,
    Raleway_600SemiBold,
    Raleway_700Bold,
    useFonts,
} from '@expo-google-fonts/raleway';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { footerNavItems } from '@/app/data/home';
import { HomeFooter } from '@/components/home/HomeFooter';
import { HOME_HORIZONTAL_PADDING } from '@/components/home/layout';

export const options = { headerShown: false };

// ─── Address type — swap with API shape later ─────────────────────────────────
type Address = {
  id: string;
  fullName: string;
  address: string;
  phone: string;
};

// ─── Mock saved addresses — replace with API/state management later ───────────
const MOCK_ADDRESSES: Address[] = [
  {
    id: 'addr-001',
    fullName: 'Najeeb Abubaka',
    address: 'Third Ave, Lekki phase 1, Lagos, Nigeria',
    phone: '+234 7060 868580',
  },
];

export default function DeliveryAddressScreen() {
  const router = useRouter();
  const [addresses] = useState<Address[]>(MOCK_ADDRESSES);

  const [fontsLoaded] = useFonts({
    Raleway_400Regular,
    Raleway_600SemiBold,
    Raleway_700Bold,
  });

  if (!fontsLoaded) return null;

  const handleFooterSelect = (itemId: string) => {
    if (itemId === 'home') router.replace('/screens/HomeScreen');
    if (itemId === 'cart') router.push('/screens/CartScreen');
    if (itemId === 'favorite') router.push('/screens/FavoriteScreen');
    if (itemId === 'profile') router.push('/screens/ProfileScreen');
  };

  const handleEdit = (addr: Address) => {
    router.push({
      pathname: '/screens/AddressFormScreen',
      params: {
        mode: 'edit',
        id: addr.id,
        fullName: addr.fullName,
        address: addr.address,
        phone: addr.phone,
      },
    });
  };

  const handleAddNew = () => {
    router.push({
      pathname: '/screens/AddressFormScreen',
      params: { mode: 'add' },
    });
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
            Delivery Address
          </Text>
        </View>

        <View style={styles.divider} />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Address cards ── */}
          {addresses.map((addr) => (
            <View key={addr.id} style={styles.card}>
              {/* Name + edit icon */}
              <View style={styles.cardHeader}>
                <Text style={styles.cardName} allowFontScaling={false}>
                  {addr.fullName}
                </Text>
                <Pressable
                  onPress={() => handleEdit(addr)}
                  hitSlop={10}
                  style={({ pressed }) => [pressed && styles.pressed]}
                >
                  <Ionicons name="pencil-outline" size={20} color="#C9922A" />
                </Pressable>
              </View>

              <View style={styles.cardDivider} />

              <Text style={styles.cardAddress} allowFontScaling={false}>
                {addr.address}
              </Text>
              <Text style={styles.cardPhone} allowFontScaling={false}>
                {addr.phone}
              </Text>
            </View>
          ))}

          {/* ── Add new address button ── */}
          <Pressable
            onPress={handleAddNew}
            style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
          >
            <Text style={styles.addButtonText} allowFontScaling={false}>
              Add new address
            </Text>
          </Pressable>
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

  // ── Scroll ───────────────────────────────────────────────────────────────────
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: HOME_HORIZONTAL_PADDING,
    paddingTop: 32,
    paddingBottom: 110,
    gap: 20,
  },

  // ── Address card ─────────────────────────────────────────────────────────────
  card: {
    backgroundColor: '#252523',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardName: {
    color: '#FFFFFF',
    fontFamily: 'Raleway_700Bold',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#3A3A3A',
  },
  cardAddress: {
    color: '#CCCCCC',
    fontFamily: 'Raleway_400Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  cardPhone: {
    color: '#CCCCCC',
    fontFamily: 'Raleway_400Regular',
    fontSize: 14,
    lineHeight: 20,
  },

  // ── Add button ───────────────────────────────────────────────────────────────
  addButton: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    backgroundColor: '#C9922A',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Raleway_700Bold',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
  },

  pressed: { opacity: 0.78 },
});
