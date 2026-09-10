import {
  Raleway_400Regular,
  Raleway_600SemiBold,
  Raleway_700Bold,
  useFonts,
} from '@expo-google-fonts/raleway';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { footerNavItems } from '@/app/data/home';
import { ApiService } from '@/app/services/apiService';
import { HomeFooter } from '@/components/home/HomeFooter';
import { HOME_HORIZONTAL_PADDING } from '@/components/home/layout';
import FeedbackModal from '@/components/FeedbackModal';

export const options = { headerShown: false };

interface ApiAddress {
  id: string;
  fullName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  deliveryNotes?: string;
  isDefault: boolean;
}

export default function DeliveryAddressScreen() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<ApiAddress[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    type: 'success' | 'error' | 'info';
    title: string;
    message: string;
    buttonText?: string;
    secondaryButtonText?: string;
    onConfirm?: () => void;
  }>({
    type: 'info',
    title: '',
    message: '',
  });

  const showFeedback = (
    type: 'success' | 'error' | 'info',
    title: string,
    message: string,
    onConfirm?: () => void,
    secondaryButtonText?: string,
    buttonText?: string
  ) => {
    setModalConfig({ type, title, message, onConfirm, secondaryButtonText, buttonText });
    setModalVisible(true);
  };

  const [fontsLoaded] = useFonts({
    Raleway_400Regular,
    Raleway_600SemiBold,
    Raleway_700Bold,
  });

  const fetchAddresses = useCallback(async () => {
    try {
      setLoading(true);
      const profile = await ApiService.getUserProfile();
      if (profile && Array.isArray(profile.addresses)) {
        setAddresses(profile.addresses);
      }
    } catch (err) {
      console.error('Failed to load user addresses:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchAddresses();
    }, [fetchAddresses])
  );

  if (!fontsLoaded) return null;

  const handleFooterSelect = (itemId: string) => {
    if (itemId === 'home') router.replace('/screens/HomeScreen');
    if (itemId === 'cart') router.push('/screens/CartScreen');
    if (itemId === 'favorite') router.push('/screens/FavoriteScreen');
    if (itemId === 'profile') router.push('/screens/ProfileScreen');
  };

  const handleEdit = (addr: ApiAddress) => {
    router.push({
      pathname: '/screens/AddressFormScreen',
      params: {
        mode: 'edit',
        id: addr.id,
        fullName: addr.fullName,
        street: addr.street,
        city: addr.city,
        state: addr.state,
        postalCode: addr.postalCode,
        country: addr.country,
        phone: addr.phone,
        deliveryNotes: addr.deliveryNotes || '',
        isDefault: String(addr.isDefault),
      },
    });
  };

  const handleDelete = (id: string) => {
    showFeedback(
      'error',
      'Delete Address',
      'Are you sure you want to remove this delivery address?',
      async () => {
        try {
          setLoading(true);
          await ApiService.deleteAddress(id);
          showFeedback('success', 'Success', 'Address removed successfully.');
          await fetchAddresses();
        } catch (err: any) {
          showFeedback('error', 'Error', err.message || 'Failed to delete address.');
          setLoading(false);
        }
      },
      'Cancel',
      'Delete'
    );
  };

  const handleSetDefault = async (id: string) => {
    try {
      setLoading(true);
      await ApiService.setDefaultAddress(id);
      showFeedback('success', 'Success', 'Default address updated.');
      await fetchAddresses();
    } catch (err: any) {
      showFeedback('error', 'Error', err.message || 'Failed to update default address.');
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    router.push({
      pathname: '/screens/AddressFormScreen',
      params: { mode: 'add' },
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.center]}>
        <ActivityIndicator size="large" color="#C9922A" />
      </SafeAreaView>
    );
  }

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
          {addresses.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="location-outline" size={48} color="#555555" />
              <Text style={styles.emptyText} allowFontScaling={false}>
                No saved delivery addresses yet.
              </Text>
            </View>
          ) : (
            addresses.map((addr) => {
              const fullAddressStr = `${addr.street}, ${addr.city}, ${addr.state} ${addr.postalCode ? addr.postalCode : ''}, ${addr.country}`;
              return (
                <View key={addr.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.nameAndBadge}>
                      <Text style={styles.cardName} allowFontScaling={false}>
                        {addr.fullName}
                      </Text>
                      {addr.isDefault && (
                        <View style={styles.defaultBadge}>
                          <Text style={styles.defaultBadgeText} allowFontScaling={false}>
                            Default
                          </Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.cardActions}>
                      <Pressable
                        onPress={() => handleEdit(addr)}
                        hitSlop={10}
                        style={({ pressed }) => [pressed && styles.pressed, { marginRight: 16 }]}
                      >
                        <Ionicons name="pencil-outline" size={18} color="#C9922A" />
                      </Pressable>
                      <Pressable
                        onPress={() => handleDelete(addr.id)}
                        hitSlop={10}
                        style={({ pressed }) => [pressed && styles.pressed]}
                      >
                        <Ionicons name="trash-outline" size={18} color="#EA4335" />
                      </Pressable>
                    </View>
                  </View>

                  <View style={styles.cardDivider} />

                  <Text style={styles.cardAddress} allowFontScaling={false}>
                    {fullAddressStr}
                  </Text>
                  <Text style={styles.cardPhone} allowFontScaling={false}>
                    {addr.phone}
                  </Text>
                  {addr.deliveryNotes ? (
                    <Text style={styles.cardNotes} allowFontScaling={false}>
                      Note: {addr.deliveryNotes}
                    </Text>
                  ) : null}

                  {!addr.isDefault && (
                    <Pressable
                      onPress={() => handleSetDefault(addr.id)}
                      style={({ pressed }) => [styles.setDefaultBtn, pressed && styles.pressed]}
                    >
                      <Ionicons name="radio-button-off" size={14} color="#C9922A" />
                      <Text style={styles.setDefaultText} allowFontScaling={false}>
                        Set as Default
                      </Text>
                    </Pressable>
                  )}
                </View>
              );
            })
          )}

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
      <FeedbackModal
        visible={modalVisible}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        buttonText={modalConfig.buttonText}
        secondaryButtonText={modalConfig.secondaryButtonText}
        onConfirm={modalConfig.onConfirm}
        onClose={() => setModalVisible(false)}
      />
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
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: HOME_HORIZONTAL_PADDING,
    paddingTop: 32,
    paddingBottom: 110,
    gap: 20,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },

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
  nameAndBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  defaultBadge: {
    backgroundColor: 'rgba(201, 146, 42, 0.15)',
    borderWidth: 1,
    borderColor: '#C9922A',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  defaultBadgeText: {
    color: '#C9922A',
    fontSize: 10,
    fontFamily: 'Raleway_700Bold',
    fontWeight: '700',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
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
  cardNotes: {
    color: '#8A8A8F',
    fontFamily: 'Raleway_400Regular',
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  setDefaultBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#3A3A3A',
  },
  setDefaultText: {
    color: '#C9922A',
    fontFamily: 'Raleway_600SemiBold',
    fontSize: 12,
    fontWeight: '600',
  },

  emptyContainer: {
    paddingVertical: 50,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyText: {
    color: '#8A8A8F',
    fontSize: 14,
    textAlign: 'center',
  },

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
