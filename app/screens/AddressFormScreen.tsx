import {
    Raleway_400Regular,
    Raleway_500Medium,
    Raleway_700Bold,
    useFonts,
} from '@expo-google-fonts/raleway';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
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
import { HomeFooter } from '@/components/home/HomeFooter';
import { HOME_HORIZONTAL_PADDING } from '@/components/home/layout';

export const options = { headerShown: false };

export default function AddressFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    mode?: string;
    id?: string;
    fullName?: string;
    address?: string;
    phone?: string;
  }>();

  const isEdit = params.mode === 'edit';

  // Pre-fill fields when editing
  const [fullName, setFullName] = useState(params.fullName ?? '');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState(params.phone ?? '');
  const [address, setAddress] = useState(params.address ?? '');

  const [fontsLoaded] = useFonts({
    Raleway_400Regular,
    Raleway_500Medium,
    Raleway_700Bold,
  });

  if (!fontsLoaded) return null;

  const handleSubmit = () => {
    // TODO: save to API / state management
    router.back();
  };

  const handleFooterSelect = (itemId: string) => {
    if (itemId === 'home') router.replace('/screens/HomeScreen');
    if (itemId === 'cart') router.push('/screens/CartScreen');
    if (itemId === 'favorite') router.push('/screens/FavoriteScreen');
    if (itemId === 'profile') router.push('/screens/ProfileScreen');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.page}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 18 : 0}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={10}>
            <Ionicons name="chevron-back" size={18} color="#C9922A" />
          </Pressable>
          <Text style={styles.headerTitle} allowFontScaling={false}>
            {isEdit ? 'Edit Address' : 'Add New Address'}
          </Text>
        </View>

        <View style={styles.divider} />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Section label ── */}
          <Text style={styles.sectionLabel} allowFontScaling={false}>
            Delivery Details
          </Text>

          {/* ── Fields ── */}
          <View style={styles.fieldGroup}>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="Full Name"
              placeholderTextColor="#6B6B6B"
              style={styles.input}
              autoCapitalize="words"
              allowFontScaling={false}
            />
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              placeholderTextColor="#6B6B6B"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              allowFontScaling={false}
            />
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="Phone number"
              placeholderTextColor="#6B6B6B"
              style={styles.input}
              keyboardType="phone-pad"
              allowFontScaling={false}
            />
            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="Address"
              placeholderTextColor="#6B6B6B"
              style={styles.input}
              allowFontScaling={false}
            />
          </View>

          {/* ── Submit button ── */}
          <Pressable
            onPress={handleSubmit}
            style={({ pressed }) => [styles.submitButton, pressed && styles.pressed]}
          >
            <Text style={styles.submitButtonText} allowFontScaling={false}>
              {isEdit ? 'Save changes' : 'Add new address'}
            </Text>
          </Pressable>
        </ScrollView>

        <HomeFooter
          items={footerNavItems}
          activeItemId="profile"
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
    paddingTop: 28,
    paddingBottom: 110,
    gap: 20,
  },

  // ── Section label ────────────────────────────────────────────────────────────
  sectionLabel: {
    color: '#6B6B6B',
    fontFamily: 'Raleway_500Medium',
    fontSize: 15,
    lineHeight: 18,
  },

  // ── Fields ───────────────────────────────────────────────────────────────────
  fieldGroup: {
    gap: 14,
  },
  input: {
    width: '100%',
    height: 56,
    borderRadius: 10,
    backgroundColor: '#252523',
    paddingHorizontal: 16,
    color: '#FFFFFF',
    fontFamily: 'Raleway_400Regular',
    fontSize: 14,
    lineHeight: 18,
  },

  // ── Submit button ─────────────────────────────────────────────────────────────
  submitButton: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    backgroundColor: '#C9922A',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Raleway_700Bold',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
  },

  pressed: { opacity: 0.78 },
});
