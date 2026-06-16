import {
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    useFonts,
} from '@expo-google-fonts/manrope';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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

const GOLD = '#C9922A';

export default function MyDetailsScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('Andrea Hirata');
  const [email, setEmail] = useState('hirata@gmail.com');
  const [phone, setPhone] = useState('+234 7060 868580');
  const [dob, setDob] = useState('');

  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
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
            My Details
          </Text>
        </View>

        <View style={styles.divider} />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Avatar placeholder ── */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person-circle" size={80} color="#555555" />
            </View>
            <Pressable style={styles.changePhotoBtn}>
              <Text style={styles.changePhotoText} allowFontScaling={false}>
                Change Photo
              </Text>
            </Pressable>
          </View>

          {/* ── Fields ── */}
          <Text style={styles.sectionLabel} allowFontScaling={false}>
            Personal Information
          </Text>

          <View style={styles.fieldGroup}>
            <View style={styles.fieldWrapper}>
              <Text style={styles.fieldLabel} allowFontScaling={false}>Full Name</Text>
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                style={styles.input}
                placeholderTextColor="rgba(255,255,255,0.35)"
                allowFontScaling={false}
              />
            </View>

            <View style={styles.fieldWrapper}>
              <Text style={styles.fieldLabel} allowFontScaling={false}>Email Address</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="rgba(255,255,255,0.35)"
                allowFontScaling={false}
              />
            </View>

            <View style={styles.fieldWrapper}>
              <Text style={styles.fieldLabel} allowFontScaling={false}>Phone Number</Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                style={styles.input}
                keyboardType="phone-pad"
                placeholderTextColor="rgba(255,255,255,0.35)"
                allowFontScaling={false}
              />
            </View>

            <View style={styles.fieldWrapper}>
              <Text style={styles.fieldLabel} allowFontScaling={false}>Date of Birth</Text>
              <TextInput
                value={dob}
                onChangeText={setDob}
                style={styles.input}
                placeholder="DD / MM / YYYY"
                placeholderTextColor="rgba(255,255,255,0.35)"
                allowFontScaling={false}
              />
            </View>
          </View>

          {/* ── Save button ── */}
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.saveButton, pressed && styles.pressed]}
          >
            <Text style={styles.saveButtonText} allowFontScaling={false}>
              Save Changes
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
  safeArea: { flex: 1, backgroundColor: '#000000', marginTop: 30 },
  page: { flex: 1, backgroundColor: '#000000' },
  header: { height: 41, alignItems: 'center', justifyContent: 'center' },
  backButton: { position: 'absolute', left: 17, width: 28, height: 28, alignItems: 'flex-start', justifyContent: 'center' },
  headerTitle: { color: '#FFFFFF', fontFamily: 'Manrope_700Bold', fontSize: 16, fontWeight: '700', lineHeight: 20, textAlign: 'center' },
  divider: { height: 1, backgroundColor: '#2A2A2A', elevation: 4 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: HOME_HORIZONTAL_PADDING, paddingTop: 24, paddingBottom: 110, gap: 20 },

  avatarSection: { alignItems: 'center', gap: 10, marginBottom: 8 },
  avatarCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#252523', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  changePhotoBtn: { paddingVertical: 4, paddingHorizontal: 12, borderRadius: 6, borderWidth: 1, borderColor: GOLD },
  changePhotoText: { color: GOLD, fontFamily: 'Manrope_600SemiBold', fontSize: 12 },

  sectionLabel: { color: 'rgba(255,255,255,0.50)', fontFamily: 'Manrope_500Medium', fontSize: 13 },
  fieldGroup: { gap: 14 },
  fieldWrapper: { gap: 6 },
  fieldLabel: { color: GOLD, fontFamily: 'Manrope_600SemiBold', fontSize: 12 },
  input: {
    width: '100%', height: 52, borderRadius: 10, borderWidth: 1,
    borderColor: 'rgba(201,146,42,0.35)', backgroundColor: 'rgba(37,37,35,0.85)',
    paddingHorizontal: 16, color: '#F5F5F5', fontFamily: 'Manrope_400Regular', fontSize: 14,
  },

  saveButton: { width: '100%', height: 52, borderRadius: 8, backgroundColor: GOLD, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  saveButtonText: { color: '#FFFFFF', fontFamily: 'Manrope_700Bold', fontSize: 15, fontWeight: '700' },
  pressed: { opacity: 0.78 },
});
