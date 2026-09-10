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
  ActivityIndicator,
  Alert,
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
import { ApiService } from '@/app/services/apiService';
import { HomeFooter } from '@/components/home/HomeFooter';
import { HOME_HORIZONTAL_PADDING } from '@/components/home/layout';
import FeedbackModal from '@/components/FeedbackModal';

export const options = { headerShown: false };

export default function AddressFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    mode?: string;
    id?: string;
    fullName?: string;
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    phone?: string;
    deliveryNotes?: string;
    isDefault?: string;
  }>();

  const isEdit = params.mode === 'edit';

  // Pre-fill all 9 fields when editing
  const [fullName, setFullName] = useState(params.fullName ?? '');
  const [phone, setPhone] = useState(params.phone ?? '');
  const [street, setStreet] = useState(params.street ?? '');
  const [city, setCity] = useState(params.city ?? '');
  const [state, setState] = useState(params.state ?? '');
  const [postalCode, setPostalCode] = useState(params.postalCode ?? '');
  const [country, setCountry] = useState(params.country ?? '');
  const [deliveryNotes, setDeliveryNotes] = useState(params.deliveryNotes ?? '');
  const [isDefault, setIsDefault] = useState(params.isDefault === 'true');
  const [submitting, setSubmitting] = useState(false);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    type: 'success' | 'error' | 'info';
    title: string;
    message: string;
    onClose?: () => void;
  }>({
    type: 'info',
    title: '',
    message: '',
  });

  const showFeedback = (type: 'success' | 'error' | 'info', title: string, message: string, onClose?: () => void) => {
    setModalConfig({ type, title, message, onClose });
    setModalVisible(true);
  };

  const [fontsLoaded] = useFonts({
    Raleway_400Regular,
    Raleway_500Medium,
    Raleway_700Bold,
  });

  if (!fontsLoaded) return null;

  const handleSubmit = async () => {
    if (!fullName.trim()) {
      showFeedback('error', 'Validation Error', 'Full Name is required.');
      return;
    }
    if (!phone.trim()) {
      showFeedback('error', 'Validation Error', 'Phone Number is required.');
      return;
    }
    if (!street.trim()) {
      showFeedback('error', 'Validation Error', 'Street Address is required.');
      return;
    }
    if (!city.trim()) {
      showFeedback('error', 'Validation Error', 'City is required.');
      return;
    }
    if (!state.trim()) {
      showFeedback('error', 'Validation Error', 'State is required.');
      return;
    }
    if (!country.trim()) {
      showFeedback('error', 'Validation Error', 'Country is required.');
      return;
    }

    const payload = {
      fullName: fullName.trim(),
      street: street.trim(),
      city: city.trim(),
      state: state.trim(),
      postalCode: postalCode.trim(),
      country: country.trim(),
      phone: phone.trim(),
      deliveryNotes: deliveryNotes.trim(),
      isDefault,
    };

    try {
      setSubmitting(true);
      if (isEdit && params.id) {
        await ApiService.updateAddress(params.id, payload);
        showFeedback('success', 'Success', 'Address updated successfully.', () => {
          router.back();
        });
      } else {
        await ApiService.createAddress(payload);
        showFeedback('success', 'Success', 'Address added successfully.', () => {
          router.back();
        });
      }
    } catch (err: any) {
      showFeedback('error', 'Error', err.message || 'Failed to save address.');
    } finally {
      setSubmitting(false);
    }
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
              placeholder="Full Name (Required)"
              placeholderTextColor="#6B6B6B"
              style={styles.input}
              autoCapitalize="words"
              allowFontScaling={false}
            />
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="Phone number (Required)"
              placeholderTextColor="#6B6B6B"
              style={styles.input}
              keyboardType="phone-pad"
              allowFontScaling={false}
            />
            <TextInput
              value={street}
              onChangeText={setStreet}
              placeholder="Street Address (Required)"
              placeholderTextColor="#6B6B6B"
              style={styles.input}
              autoCapitalize="sentences"
              allowFontScaling={false}
            />
            <TextInput
              value={city}
              onChangeText={setCity}
              placeholder="City (Required)"
              placeholderTextColor="#6B6B6B"
              style={styles.input}
              autoCapitalize="words"
              allowFontScaling={false}
            />
            <TextInput
              value={state}
              onChangeText={setState}
              placeholder="State (Required)"
              placeholderTextColor="#6B6B6B"
              style={styles.input}
              autoCapitalize="words"
              allowFontScaling={false}
            />
            <TextInput
              value={postalCode}
              onChangeText={setPostalCode}
              placeholder="Postal Code (Optional)"
              placeholderTextColor="#6B6B6B"
              style={styles.input}
              keyboardType="numeric"
              allowFontScaling={false}
            />
            <TextInput
              value={country}
              onChangeText={setCountry}
              placeholder="Country (Required)"
              placeholderTextColor="#6B6B6B"
              style={styles.input}
              autoCapitalize="words"
              allowFontScaling={false}
            />
            <TextInput
              value={deliveryNotes}
              onChangeText={setDeliveryNotes}
              placeholder="Delivery Notes (Optional)"
              placeholderTextColor="#6B6B6B"
              style={styles.input}
              multiline
              numberOfLines={3}
              allowFontScaling={false}
            />

            {/* ── Checkbox ── */}
            <Pressable
              onPress={() => setIsDefault(curr => !curr)}
              style={styles.defaultCheckboxRow}
              hitSlop={10}
            >
              <View style={[styles.checkbox, isDefault && styles.checkboxActive]}>
                {isDefault && <Ionicons name="checkmark" size={12} color="#000000" />}
              </View>
              <Text style={styles.checkboxLabel} allowFontScaling={false}>
                Set as default delivery address
              </Text>
            </Pressable>
          </View>

          {/* ── Submit button ── */}
          <Pressable
            onPress={handleSubmit}
            disabled={submitting}
            style={({ pressed }) => [styles.submitButton, (pressed || submitting) && styles.pressed]}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#000000" />
            ) : (
              <Text style={styles.submitButtonText} allowFontScaling={false}>
                {isEdit ? 'Save changes' : 'Add new address'}
              </Text>
            )}
          </Pressable>
        </ScrollView>

        <HomeFooter
          items={footerNavItems}
          activeItemId="profile"
          onSelectItem={handleFooterSelect}
        />
      </KeyboardAvoidingView>
      <FeedbackModal
        visible={modalVisible}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        onClose={() => {
          setModalVisible(false);
          if (modalConfig.onClose) {
            modalConfig.onClose();
          }
        }}
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
    paddingTop: 28,
    paddingBottom: 110,
    gap: 20,
  },
  sectionLabel: {
    color: '#6B6B6B',
    fontFamily: 'Raleway_500Medium',
    fontSize: 15,
    lineHeight: 18,
  },
  fieldGroup: {
    gap: 14,
  },
  input: {
    width: '100%',
    borderRadius: 10,
    backgroundColor: '#252523',
    paddingHorizontal: 16,
    color: '#FFFFFF',
    fontFamily: 'Raleway_400Regular',
    fontSize: 14,
    minHeight: 56,
    paddingVertical: 14,
  },
  defaultCheckboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
    marginBottom: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#C9922A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: '#C9922A',
  },
  checkboxLabel: {
    color: '#C9922A',
    fontFamily: 'Raleway_600SemiBold',
    fontSize: 13,
    fontWeight: '600',
  },
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
    color: '#000000',
    fontFamily: 'Raleway_700Bold',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
  },
  pressed: { opacity: 0.78 },
});
