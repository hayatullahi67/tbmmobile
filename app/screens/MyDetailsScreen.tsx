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
import { HomeFooter } from '@/components/home/HomeFooter';
import { HOME_HORIZONTAL_PADDING } from '@/components/home/layout';

const GOLD = '#C9922A';

interface SavedCard {
  id: string;
  cardholderName: string;
  cardNumber: string;
  expiryDate: string;
  cardType: 'visa' | 'mastercard';
}

export default function MyDetailsScreen() {
  const router = useRouter();

  // Saved cards mock list
  const [savedCards, setSavedCards] = useState<SavedCard[]>([
    {
      id: '1',
      cardholderName: 'Andrea Hirata',
      cardNumber: '•••• •••• •••• 4296',
      expiryDate: '12/28',
      cardType: 'visa',
    },
    {
      id: '2',
      cardholderName: 'Andrea Hirata',
      cardNumber: '•••• •••• •••• 8840',
      expiryDate: '09/27',
      cardType: 'mastercard',
    },
  ]);

  // Form states
  const [cardholderName, setCardholderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  useFonts({
    Raleway_400Regular,
    Raleway_600SemiBold,
    Raleway_700Bold,
  });

  const handleCardNumberChange = (text: string) => {
    // Keep only digits
    const cleaned = text.replace(/\D/g, '');
    // Limit to 16 digits
    const limited = cleaned.slice(0, 16);
    // Format: XXXX XXXX XXXX XXXX
    const formatted = limited.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  const handleExpiryChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const limited = cleaned.slice(0, 4);
    if (limited.length >= 3) {
      setExpiryDate(`${limited.slice(0, 2)}/${limited.slice(2)}`);
    } else {
      setExpiryDate(limited);
    }
  };

  const handleCvvChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    setCvv(cleaned.slice(0, 3));
  };

  const handleAddCard = () => {
    if (!cardholderName.trim()) {
      Alert.alert('Validation Error', 'Please enter the cardholder name.');
      return;
    }
    const cleanNum = cardNumber.replace(/\s/g, '');
    if (cleanNum.length !== 16) {
      Alert.alert('Validation Error', 'Card number must be 16 digits.');
      return;
    }
    if (expiryDate.length !== 5) {
      Alert.alert('Validation Error', 'Please enter a valid expiry date (MM/YY).');
      return;
    }
    if (cvv.length < 3) {
      Alert.alert('Validation Error', 'CVV must be 3 digits.');
      return;
    }

    // Determine type (visa if starts with 4, else mastercard)
    const cardType = cleanNum.startsWith('4') ? 'visa' : 'mastercard';
    const obfuscatedNumber = `•••• •••• •••• ${cleanNum.slice(-4)}`;

    const newCard: SavedCard = {
      id: Date.now().toString(),
      cardholderName,
      cardNumber: obfuscatedNumber,
      expiryDate,
      cardType,
    };

    setSavedCards(prev => [...prev, newCard]);
    Alert.alert('Success', 'Payment card saved successfully.');

    // Clear form
    setCardholderName('');
    setCardNumber('');
    setExpiryDate('');
    setCvv('');
  };

  const handleDeleteCard = (id: string) => {
    Alert.alert(
      'Remove Card',
      'Are you sure you want to remove this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setSavedCards(prev => prev.filter(c => c.id !== id));
          },
        },
      ]
    );
  };

  const handleFooterSelect = (itemId: string) => {
    if (itemId === 'home') router.replace('/screens/HomeScreen');
    if (itemId === 'cart') router.push('/screens/CartScreen');
    if (itemId === 'favorite') router.push('/screens/FavoriteScreen');
    if (itemId === 'profile') router.push('/screens/ProfileScreen');
  };

  // Helper to format credit card visual output on mockup
  const displayCardNumber = cardNumber || '•••• •••• •••• ••••';
  const displayCardholder = cardholderName.toUpperCase() || 'CARDHOLDER NAME';
  const displayExpiry = expiryDate || 'MM/YY';

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.page}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={10}>
            <Ionicons name="chevron-back" size={18} color={GOLD} />
          </Pressable>
          <Text style={styles.headerTitle} allowFontScaling={false}>
            Payment Methods
          </Text>
        </View>

        <View style={styles.divider} />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Virtual Card Mockup ── */}
          <View style={styles.cardPreviewContainer}>
            <View style={styles.creditCardMock}>
              <View style={styles.cardHeaderRow}>
                <Ionicons name="hardware-chip-sharp" size={32} color="#D4AF37" />
                <Text style={styles.cardBrandText}>
                  {cardNumber.replace(/\s/g, '').startsWith('4') ? 'VISA' : 'Mastercard'}
                </Text>
              </View>

              <Text style={styles.cardMockNumber} allowFontScaling={false}>
                {displayCardNumber}
              </Text>

              <View style={styles.cardFooterRow}>
                <View>
                  <Text style={styles.cardMockLabel} allowFontScaling={false}>CARD HOLDER</Text>
                  <Text style={styles.cardMockValue} numberOfLines={1} allowFontScaling={false}>
                    {displayCardholder}
                  </Text>
                </View>

                <View style={styles.alignRight}>
                  <Text style={styles.cardMockLabel} allowFontScaling={false}>EXPIRES</Text>
                  <Text style={styles.cardMockValue} allowFontScaling={false}>
                    {displayExpiry}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* ── Add Card Form ── */}
          <Text style={styles.sectionTitle} allowFontScaling={false}>Add New Card</Text>

          <View style={styles.formGroup}>
            <View style={styles.fieldWrapper}>
              <Text style={styles.fieldLabel} allowFontScaling={false}>Cardholder Name</Text>
              <TextInput
                value={cardholderName}
                onChangeText={setCardholderName}
                style={styles.input}
                placeholder="e.g. Andrea Hirata"
                placeholderTextColor="rgba(255,255,255,0.25)"
                allowFontScaling={false}
              />
            </View>

            <View style={styles.fieldWrapper}>
              <Text style={styles.fieldLabel} allowFontScaling={false}>Card Number</Text>
              <TextInput
                value={cardNumber}
                onChangeText={handleCardNumberChange}
                style={styles.input}
                placeholder="4000 1234 5678 9010"
                placeholderTextColor="rgba(255,255,255,0.25)"
                keyboardType="numeric"
                allowFontScaling={false}
              />
            </View>

            <View style={styles.rowFields}>
              <View style={[styles.fieldWrapper, { flex: 1.2 }]}>
                <Text style={styles.fieldLabel} allowFontScaling={false}>Expiry Date</Text>
                <TextInput
                  value={expiryDate}
                  onChangeText={handleExpiryChange}
                  style={styles.input}
                  placeholder="MM/YY"
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  keyboardType="numeric"
                  allowFontScaling={false}
                />
              </View>

              <View style={[styles.fieldWrapper, { flex: 0.8 }]}>
                <Text style={styles.fieldLabel} allowFontScaling={false}>CVV</Text>
                <TextInput
                  value={cvv}
                  onChangeText={handleCvvChange}
                  style={styles.input}
                  placeholder="123"
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  keyboardType="numeric"
                  secureTextEntry
                  allowFontScaling={false}
                />
              </View>
            </View>

            <Pressable
              onPress={handleAddCard}
              style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
            >
              <Text style={styles.primaryBtnText} allowFontScaling={false}>Add Card</Text>
            </Pressable>
          </View>

          {/* ── Saved Cards List ── */}
          <Text style={[styles.sectionTitle, { marginTop: 12 }]} allowFontScaling={false}>Saved Cards</Text>

          <View style={styles.savedList}>
            {savedCards.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText} allowFontScaling={false}>
                  No saved payment methods.
                </Text>
              </View>
            ) : (
              savedCards.map(card => (
                <View key={card.id} style={styles.savedCardItem}>
                  <View style={styles.savedCardLeft}>
                    <Ionicons
                      name={card.cardType === 'visa' ? 'card' : 'card-outline'}
                      size={24}
                      color={GOLD}
                    />
                    <View style={styles.savedCardInfo}>
                      <Text style={styles.savedCardNumber} allowFontScaling={false}>
                        {card.cardNumber}
                      </Text>
                      <Text style={styles.savedCardExpiry} allowFontScaling={false}>
                        Expires {card.expiryDate} • {card.cardholderName}
                      </Text>
                    </View>
                  </View>

                  <Pressable
                    onPress={() => handleDeleteCard(card.id)}
                    style={styles.deleteBtn}
                    hitSlop={8}
                  >
                    <Ionicons name="trash-outline" size={18} color="#EA4335" />
                  </Pressable>
                </View>
              ))
            )}
          </View>
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
  safeArea: { flex: 1, backgroundColor: '#000000', marginTop: 30 },
  page: { flex: 1, backgroundColor: '#000000' },
  header: { height: 41, alignItems: 'center', justifyContent: 'center' },
  backButton: { position: 'absolute', left: 17, width: 28, height: 28, alignItems: 'flex-start', justifyContent: 'center' },
  headerTitle: { color: '#FFFFFF', fontFamily: 'Raleway_700Bold', fontSize: 16, fontWeight: '700', lineHeight: 20, textAlign: 'center' },
  divider: { height: 1, backgroundColor: '#2A2A2A', elevation: 4 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: HOME_HORIZONTAL_PADDING, paddingTop: 18, paddingBottom: 110, gap: 20 },

  cardPreviewContainer: {
    alignItems: 'center',
    marginVertical: 4,
  },
  creditCardMock: {
    width: '100%',
    height: 190,
    borderRadius: 16,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#3A3833',
    padding: 20,
    justifyContent: 'space-between',
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardBrandText: {
    color: '#D4AF37',
    fontWeight: '800',
    fontSize: 18,
    fontStyle: 'italic',
  },
  cardMockNumber: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 2,
    marginVertical: 14,
    fontFamily: 'Raleway_600SemiBold',
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardMockLabel: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 9,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardMockValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Raleway_700Bold',
    maxWidth: 160,
  },
  alignRight: {
    alignItems: 'flex-end',
  },

  sectionTitle: {
    color: GOLD,
    fontFamily: 'Raleway_700Bold',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
  },
  formGroup: {
    gap: 14,
  },
  fieldWrapper: {
    gap: 6,
  },
  fieldLabel: {
    color: '#8E8E93',
    fontFamily: 'Raleway_600SemiBold',
    fontSize: 12,
  },
  input: {
    width: '100%',
    height: 52,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#3A3833',
    backgroundColor: '#161616',
    paddingHorizontal: 16,
    color: '#FFFFFF',
    fontSize: 14,
  },
  rowFields: {
    flexDirection: 'row',
    gap: 14,
  },
  primaryBtn: {
    width: '100%',
    height: 52,
    borderRadius: 10,
    backgroundColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  primaryBtnText: {
    color: '#000000',
    fontFamily: 'Raleway_700Bold',
    fontSize: 15,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.78,
  },

  savedList: {
    gap: 12,
  },
  savedCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F0F0F',
    borderWidth: 1,
    borderColor: '#1D1D1D',
    borderRadius: 12,
    padding: 16,
  },
  savedCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  savedCardInfo: {
    gap: 4,
    flex: 1,
  },
  savedCardNumber: {
    color: '#FFFFFF',
    fontFamily: 'Raleway_600SemiBold',
    fontSize: 14,
    fontWeight: '600',
  },
  savedCardExpiry: {
    color: '#8E8E93',
    fontSize: 11,
  },
  deleteBtn: {
    padding: 6,
  },
  emptyContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#8E8E93',
    fontSize: 13,
  },
});
