import {
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    useFonts,
} from '@expo-google-fonts/manrope';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
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
import { ApiService } from '@/app/services/apiService';
import { TokenService } from '@/app/services/tokenService';
import FeedbackModal from '@/components/FeedbackModal';

export const options = { headerShown: false };

const GOLD = '#C9922A';

// ─── Contact channels ─────────────────────────────────────────────────────────


export default function ContactUsScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'success' | 'error'>('success');
  const [feedbackTitle, setFeedbackTitle] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  // Load stored user info to pre‑fill the form
  useEffect(() => {
    (async () => {
      const user = await TokenService.getUser();
      if (user) {
        const name = user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim();
        setFullName(name);
        setEmail(user.email || '');
        setPhoneNumber(user.phoneNumber || '');
      }
    })();
  }, []);

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

const handleSend = async () => {
  if (!fullName || !email || !phoneNumber || !subject || !message) {
    setFeedbackType('error');
    setFeedbackTitle('Missing Information');
    setFeedbackMessage('Please fill in all fields.');
    setFeedbackVisible(true);
    return;
  }
  setIsSubmitting(true);
  try {
    await ApiService.contactUs({ fullName, email, phoneNumber, subject, message });
    setFeedbackType('success');
    setFeedbackTitle('Message Sent');
    setFeedbackMessage('Your message has been sent successfully.');
    setFeedbackVisible(true);
  } catch (err: any) {
    const msg = err?.message ?? 'An unexpected error occurred.';
    setFeedbackType('error');
    setFeedbackTitle('Error');
    setFeedbackMessage(msg);
    setFeedbackVisible(true);
  } finally {
    setIsSubmitting(false);
  }
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
            Contact Us
          </Text>
        </View>

        <View style={styles.divider} />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >


          {/* ── Message form ── */}
          <Text style={styles.sectionLabel} allowFontScaling={false}>
            Send a Message
          </Text>

          <View style={styles.form}>
            <View style={styles.fieldWrapper}>
              <Text style={styles.fieldLabel} allowFontScaling={false}>Full Name</Text>
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder="Your full name"
                placeholderTextColor="rgba(255,255,255,0.35)"
                style={styles.input}
                allowFontScaling={false}
              />
            </View>
            <View style={styles.fieldWrapper}>
              <Text style={styles.fieldLabel} allowFontScaling={false}>Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor="rgba(255,255,255,0.35)"
                style={styles.input}
                autoCapitalize="none"
                keyboardType="email-address"
                allowFontScaling={false}
              />
            </View>
            <View style={styles.fieldWrapper}>
              <Text style={styles.fieldLabel} allowFontScaling={false}>Phone Number</Text>
              <TextInput
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="+234 800 000 0000"
                placeholderTextColor="rgba(255,255,255,0.35)"
                style={styles.input}
                keyboardType="phone-pad"
                allowFontScaling={false}
              />
            </View>
            <View style={styles.fieldWrapper}>
              <Text style={styles.fieldLabel} allowFontScaling={false}>Subject</Text>
              <TextInput
                value={subject}
                onChangeText={setSubject}
                placeholder="What is this about?"
                placeholderTextColor="rgba(255,255,255,0.35)"
                style={styles.input}
                allowFontScaling={false}
              />
            </View>

            <View style={styles.fieldWrapper}>
              <Text style={styles.fieldLabel} allowFontScaling={false}>Message</Text>
              <TextInput
                value={message}
                onChangeText={setMessage}
                placeholder="Write your message here..."
                placeholderTextColor="rgba(255,255,255,0.35)"
                style={[styles.input, styles.textArea]}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                allowFontScaling={false}
              />
            </View>

            <Pressable onPress={handleSend} style={styles.sendButton} disabled={isSubmitting}>
              <Text style={styles.sendButtonText} allowFontScaling={false}>
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </Text>
            </Pressable>
          </View>
        </ScrollView>

        <HomeFooter
          items={footerNavItems}
          activeItemId="profile"
          onSelectItem={handleFooterSelect}
        />
        <FeedbackModal
          visible={feedbackVisible}
          type={feedbackType}
          title={feedbackTitle}
          message={feedbackMessage}
          onClose={() => {
            setFeedbackVisible(false);
            if (feedbackType === 'success') router.back();
          }}
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
  content: { paddingHorizontal: HOME_HORIZONTAL_PADDING, paddingTop: 24, paddingBottom: 110, gap: 16 },

  sectionLabel: { color: 'rgba(255,255,255,0.50)', fontFamily: 'Manrope_600SemiBold', fontSize: 13 },

  // Channels
  channels: { gap: 10 },
  channelRow: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#252523', borderRadius: 10, padding: 14, borderWidth: 1, borderColor: 'rgba(201,146,42,0.15)' },
  channelIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(201,146,42,0.12)', alignItems: 'center', justifyContent: 'center' },
  channelInfo: { flex: 1, gap: 3 },
  channelLabel: { color: '#FFFFFF', fontFamily: 'Manrope_600SemiBold', fontSize: 13 },
  channelValue: { color: 'rgba(255,255,255,0.50)', fontFamily: 'Manrope_400Regular', fontSize: 11 },

  // Form
  form: { gap: 14 },
  fieldWrapper: { gap: 6 },
  fieldLabel: { color: GOLD, fontFamily: 'Manrope_600SemiBold', fontSize: 12 },
  input: {
    width: '100%', height: 52, borderRadius: 10, borderWidth: 1,
    borderColor: 'rgba(201,146,42,0.35)', backgroundColor: 'rgba(37,37,35,0.85)',
    paddingHorizontal: 16, color: '#F5F5F5', fontFamily: 'Manrope_400Regular', fontSize: 14,
  },
  textArea: { height: 120, paddingTop: 14 },
  sendButton: { width: '100%', height: 52, borderRadius: 8, backgroundColor: GOLD, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  sendButtonText: { color: '#FFFFFF', fontFamily: 'Manrope_700Bold', fontSize: 15, fontWeight: '700' },

  pressed: { opacity: 0.78 },
});
