import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import FeedbackModal from '@/components/FeedbackModal';
import { ApiService } from '@/app/services/apiService';
import { PaystackWebViewModal } from '@/components/PaystackWebViewModal';

const GOLD = '#C9922A';

export const options = {
  headerShown: false,
};

type ConsultationType = 'virtual' | 'site';

export default function BookConsultationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const projectId = (params?.projectId as string) || null;

  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<ConsultationType>('virtual');
  
  // Form fields matching API request body
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [propertyType, setPropertyType] = useState('Residential');
  
  // Location details for site visits
  const [location, setLocation] = useState('');
  const [siteCity, setSiteCity] = useState('');
  const [siteState, setSiteState] = useState('');
  
  const [description, setDescription] = useState('');
  
  // Get today's date dynamically as default (YYYY-MM-DD)
  const getTodayDateString = () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [selectedTime, setSelectedTime] = useState('10:00 AM');

  // Paystack payment modal states
  const [paystackUrl, setPaystackUrl] = useState('');
  const [paystackRef, setPaystackRef] = useState('');
  const [showPaystack, setShowPaystack] = useState(false);
  const [managementToken, setManagementToken] = useState('');
  const [consultationId, setConsultationId] = useState('');

  // Success/Error Feedback Modal
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedbackConfig, setFeedbackConfig] = useState({
    type: 'success' as 'success' | 'error' | 'info',
    title: '',
    message: '',
  });

  // Pre-fill user profile info on mount
  useEffect(() => {
    async function loadProfile() {
      try {
        const profile = await ApiService.getUserProfile();
        if (profile) {
          const name = `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
          setContactName(name);
          setContactPhone(profile.phoneNumber || '');
          setContactEmail(profile.email || '');
        }
      } catch (err) {
        console.error('Error fetching user profile for consultation:', err);
      }
    }
    loadProfile();
  }, []);

  const typesList = [
    { id: 'virtual' as ConsultationType, title: 'Virtual Design Consult', icon: 'videocam-outline', desc: 'Discuss your vision, preferences, and visualizer layouts remotely.' },
    { id: 'site' as ConsultationType, title: 'In-Person Site Inspection', icon: 'pin-outline', desc: 'A TBM representative visits your space for professional assessment.' },
  ];

  const combineDateTimeToISO = (dateStr: string, timeStr: string): string => {
    try {
      const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
      let hours = 10;
      let minutes = 0;
      if (match) {
        hours = parseInt(match[1], 10);
        minutes = parseInt(match[2], 10);
        const ampm = match[3].toUpperCase();
        if (ampm === 'PM' && hours < 12) {
          hours += 12;
        } else if (ampm === 'AM' && hours === 12) {
          hours = 0;
        }
      }

      const dateParts = dateStr.trim().split('-');
      if (dateParts.length === 3) {
        const year = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10) - 1; // 0-indexed
        const day = parseInt(dateParts[2], 10);
        const date = new Date(year, month, day, hours, minutes, 0, 0);
        return date.toISOString();
      }
    } catch (error) {
      console.error('Error combining date and time:', error);
    }
    return new Date(`${dateStr}T${timeStr}`).toISOString();
  };

  const handleBookConsultation = async () => {
    // Basic validation
    if (!contactName.trim()) {
      setFeedbackConfig({ type: 'error', title: 'Validation Error', message: 'Please provide a contact name.' });
      setFeedbackVisible(true);
      return;
    }
    if (!contactPhone.trim()) {
      setFeedbackConfig({ type: 'error', title: 'Validation Error', message: 'Please provide a contact phone number.' });
      setFeedbackVisible(true);
      return;
    }
    if (!contactEmail.trim()) {
      setFeedbackConfig({ type: 'error', title: 'Validation Error', message: 'Please provide a contact email.' });
      setFeedbackVisible(true);
      return;
    }
    if (selectedType === 'site') {
      if (!location.trim()) {
        setFeedbackConfig({ type: 'error', title: 'Missing Address', message: 'Please provide the property address for the In-Person Site Inspection.' });
        setFeedbackVisible(true);
        return;
      }
      if (!siteCity.trim()) {
        setFeedbackConfig({ type: 'error', title: 'Missing City', message: 'Please provide the city for the In-Person Site Inspection.' });
        setFeedbackVisible(true);
        return;
      }
      if (!siteState.trim()) {
        setFeedbackConfig({ type: 'error', title: 'Missing State', message: 'Please provide the state for the In-Person Site Inspection.' });
        setFeedbackVisible(true);
        return;
      }
    }

    setLoading(true);
    try {
      const scheduledStart = combineDateTimeToISO(selectedDate, selectedTime);
      const payload = {
        typeKey: selectedType === 'virtual' ? 'virtual-design' : 'site-consultation',
        scheduledStart,
        projectId,
        contactName: contactName.trim(),
        contactPhone: contactPhone.trim(),
        contactEmail: contactEmail.trim(),
        propertyType,
        siteAddress: selectedType === 'site' ? location.trim() : '',
        siteCity: selectedType === 'site' ? siteCity.trim() : '',
        siteState: selectedType === 'site' ? siteState.trim() : '',
        notes: description.trim(),
      };

      console.log('[BOOKING] Submitting consultation payload:', JSON.stringify(payload, null, 2));
      const res = await ApiService.bookConsultation(payload);
      console.log('[BOOKING] Response:', JSON.stringify(res, null, 2));

      if (!res || !res.success || !res.data?.consultation) {
        throw new Error(res?.message || 'Failed to schedule consultation.');
      }

      const consultation = res.data.consultation;
      const fee = consultation.fee || 0;
      const verified = consultation.paymentVerified || false;
      const mToken = res.data.managementToken || '';
      const cId = consultation.id;

      setConsultationId(cId);
      setManagementToken(mToken);

      if (fee > 0 && !verified) {
        // Step 2: Initialize Payment
        console.log('[BOOKING] Fee is > 0, initializing Paystack payment...');
        const payRes = await ApiService.initializeConsultationPayment(cId, mToken, contactEmail.trim());
        console.log('[BOOKING] Payment Init Response:', JSON.stringify(payRes, null, 2));

        if (!payRes || !payRes.success || !payRes.data?.authorizationUrl) {
          throw new Error(payRes?.message || 'Failed to initialize payment.');
        }

        setPaystackUrl(payRes.data.authorizationUrl);
        setPaystackRef(payRes.data.reference);
        setShowPaystack(true);
      } else {
        // Free consultation / already verified
        setFeedbackConfig({
          type: 'success',
          title: 'Booking Confirmed',
          message: `Your ${selectedType === 'virtual' ? 'Virtual Design Consult' : 'In-Person Site Inspection'} is successfully scheduled for ${selectedDate} at ${selectedTime}.`,
        });
        setFeedbackVisible(true);
      }
    } catch (error: any) {
      console.error('[BOOKING] Error booking consultation:', error);
      setFeedbackConfig({
        type: 'error',
        title: 'Booking Failed',
        message: error.message || 'An error occurred while scheduling your consultation. Please try again.',
      });
      setFeedbackVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handlePaystackWebViewClose = async () => {
    setShowPaystack(false);
    if (!paystackRef) return;

    setLoading(true);
    try {
      console.log('[BOOKING] Verifying payment for reference:', paystackRef);
      const verifyRes = await ApiService.verifyConsultationPayment({ reference: paystackRef });
      console.log('[BOOKING] Verification response:', JSON.stringify(verifyRes, null, 2));

      if (verifyRes && verifyRes.success && verifyRes.data?.verified) {
        setFeedbackConfig({
          type: 'success',
          title: 'Payment Successful',
          message: `Your payment was verified. Your ${selectedType === 'virtual' ? 'Virtual Design Consult' : 'In-Person Site Inspection'} is successfully scheduled for ${selectedDate} at ${selectedTime}.`,
        });
        setFeedbackVisible(true);
      } else {
        setFeedbackConfig({
          type: 'error',
          title: 'Payment Verification Failed',
          message: verifyRes?.message || 'We could not verify your payment. Please contact support with reference: ' + paystackRef,
        });
        setFeedbackVisible(true);
      }
    } catch (error: any) {
      console.error('[BOOKING] Error verifying payment:', error);
      setFeedbackConfig({
        type: 'error',
        title: 'Verification Error',
        message: error.message || 'An error occurred during payment verification. Please contact support.',
      });
      setFeedbackVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackClose = () => {
    setFeedbackVisible(false);
    if (feedbackConfig.type === 'success') {
      router.push('/screens/HomeScreen');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 48}
      >
        <View style={styles.page}>
        
        {/* ── HEADER ── */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()} hitSlop={10}>
            <Ionicons name="arrow-back" size={24} color={GOLD} />
          </Pressable>
          <Text style={styles.headerTitle} allowFontScaling={false}>
            Book a Consultation
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* ── CONTENT ── */}
        <ScrollView style={styles.content} contentContainerStyle={styles.contentScroll} showsVerticalScrollIndicator={false}>
          
          {/* Section 1: Type Selection */}
          <Text style={styles.sectionTitle} allowFontScaling={false}>1. Select Consultation Type</Text>
          <View style={styles.typeGrid}>
            {typesList.map(item => (
              <Pressable
                key={item.id}
                style={[styles.typeCard, selectedType === item.id && styles.activeTypeCard]}
                onPress={() => setSelectedType(item.id)}
              >
                <View style={styles.typeIconRow}>
                  <Ionicons 
                    name={item.icon as any} 
                    size={22} 
                    color={selectedType === item.id ? '#FFFFFF' : GOLD} 
                  />
                  <Ionicons 
                    name={selectedType === item.id ? 'radio-button-on' : 'radio-button-off'} 
                    size={18} 
                    color={selectedType === item.id ? GOLD : 'rgba(255,255,255,0.2)'} 
                  />
                </View>
                <Text style={[styles.typeTitle, selectedType === item.id && styles.activeText]} allowFontScaling={false}>
                  {item.title}
                </Text>
                <Text style={styles.typeDesc} allowFontScaling={false}>
                  {item.desc}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Section 2: Contact Details */}
          <Text style={styles.sectionTitle} allowFontScaling={false}>2. Contact Details</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel} allowFontScaling={false}>Contact Name</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter contact name"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={contactName}
              onChangeText={setContactName}
              allowFontScaling={false}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel} allowFontScaling={false}>Contact Phone</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter contact phone"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={contactPhone}
              onChangeText={setContactPhone}
              keyboardType="phone-pad"
              allowFontScaling={false}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel} allowFontScaling={false}>Contact Email</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter contact email"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={contactEmail}
              onChangeText={setContactEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              allowFontScaling={false}
            />
          </View>

          {/* Section 3: Date Input */}
          <Text style={styles.sectionTitle} allowFontScaling={false}>3. Select Preferred Date</Text>
          <View style={styles.inputContainer}>
            <View style={styles.inputWithIconRow}>
              <TextInput
                style={[styles.textInput, { flex: 1, borderWidth: 0, backgroundColor: 'transparent' }]}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={selectedDate}
                onChangeText={setSelectedDate}
                allowFontScaling={false}
              />
              <Ionicons name="calendar-outline" size={20} color={GOLD} style={styles.inputIconRight} />
            </View>
          </View>

          {/* Section 4: Time Input */}
          <Text style={styles.sectionTitle} allowFontScaling={false}>4. Select Preferred Time Slot</Text>
          <View style={styles.inputContainer}>
            <View style={styles.inputWithIconRow}>
              <TextInput
                style={[styles.textInput, { flex: 1, borderWidth: 0, backgroundColor: 'transparent' }]}
                placeholder="HH:MM AM/PM"
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={selectedTime}
                onChangeText={setSelectedTime}
                allowFontScaling={false}
              />
              <Ionicons name="time-outline" size={20} color={GOLD} style={styles.inputIconRight} />
            </View>
          </View>

          {/* Section 5: Project Details */}
          <Text style={styles.sectionTitle} allowFontScaling={false}>5. Project Details</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel} allowFontScaling={false}>Property Type</Text>
            <View style={styles.propertyTypeRow}>
              {['Residential', 'Commercial'].map((type) => (
                <Pressable
                  key={type}
                  style={[
                    styles.propertyTypeBtn,
                    propertyType === type && styles.propertyTypeBtnActive,
                  ]}
                  onPress={() => setPropertyType(type)}
                >
                  <Text
                    style={[
                      styles.propertyTypeText,
                      propertyType === type && styles.propertyTypeTextActive,
                    ]}
                    allowFontScaling={false}
                  >
                    {type}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {selectedType === 'site' && (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel} allowFontScaling={false}>Property Address / Location</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter full site address"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={location}
                  onChangeText={setLocation}
                  allowFontScaling={false}
                />
              </View>
              
              <View style={styles.rowInputs}>
                <View style={[styles.inputContainer, { flex: 1, marginRight: 6 }]}>
                  <Text style={styles.inputLabel} allowFontScaling={false}>City</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Ikeja"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    value={siteCity}
                    onChangeText={setSiteCity}
                    allowFontScaling={false}
                  />
                </View>
                <View style={[styles.inputContainer, { flex: 1, marginLeft: 6 }]}>
                  <Text style={styles.inputLabel} allowFontScaling={false}>State</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Lagos"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    value={siteState}
                    onChangeText={setSiteState}
                    allowFontScaling={false}
                  />
                </View>
              </View>
            </>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel} allowFontScaling={false}>Project Notes / Requirements (Optional)</Text>
            <TextInput
              style={[styles.textInput, styles.multilineInput]}
              placeholder="Tell us about the space you want to renovate..."
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              allowFontScaling={false}
            />
          </View>

          {/* Submit Button */}
          <Pressable 
            style={[styles.submitButton, loading && styles.disabledButton]} 
            onPress={handleBookConsultation}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText} allowFontScaling={false}>Schedule Consultation</Text>
            )}
          </Pressable>

        </ScrollView>

        <FeedbackModal
          visible={feedbackVisible}
          type={feedbackConfig.type}
          title={feedbackConfig.title}
          message={feedbackConfig.message}
          buttonText="OK"
          onClose={handleFeedbackClose}
        />

        <PaystackWebViewModal
          visible={showPaystack}
          onClose={handlePaystackWebViewClose}
          authorizationUrl={paystackUrl}
          reference={paystackRef}
        />
      </View>
     </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#07070A',
    marginTop: 27,
  },
  page: {
    flex: 1,
    backgroundColor: '#07070A',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1F',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  contentScroll: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 220,
  },
  sectionTitle: {
    color: 'rgba(255,255,255,0.6)',
    fontFamily: 'Manrope',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginTop: 12,
  },
  typeGrid: {
    gap: 12,
    marginBottom: 16,
  },
  typeCard: {
    backgroundColor: '#121217',
    borderWidth: 1,
    borderColor: '#1C1C24',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  activeTypeCard: {
    borderColor: GOLD,
    backgroundColor: '#1A1A22',
  },
  typeIconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeTitle: {
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 15,
    fontWeight: '700',
  },
  activeText: {
    color: GOLD,
  },
  typeDesc: {
    color: 'rgba(255,255,255,0.4)',
    fontFamily: 'Manrope',
    fontSize: 12,
    lineHeight: 16,
  },
  inputWithIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121217',
    borderWidth: 1,
    borderColor: '#1C1C24',
    borderRadius: 8,
    height: 48,
    paddingRight: 12,
  },
  inputIconRight: {
    marginLeft: 8,
  },
  slotChip: {
    backgroundColor: '#121217',
    borderWidth: 1,
    borderColor: '#1C1C24',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeSlotChip: {
    borderColor: GOLD,
    backgroundColor: '#1A1A22',
  },
  slotChipText: {
    color: 'rgba(255,255,255,0.6)',
    fontFamily: 'Manrope',
    fontSize: 13,
    fontWeight: '600',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
    gap: 6,
  },
  inputLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontFamily: 'Manrope',
    fontSize: 12,
  },
  textInput: {
    backgroundColor: '#121217',
    borderWidth: 1,
    borderColor: '#1C1C24',
    borderRadius: 8,
    height: 48,
    paddingHorizontal: 12,
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 14,
  },
  multilineInput: {
    height: 100,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: GOLD,
    borderRadius: 8,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 15,
    fontWeight: '700',
  },
  rowInputs: {
    flexDirection: 'row',
  },
  propertyTypeRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
    marginBottom: 12,
  },
  propertyTypeBtn: {
    flex: 1,
    height: 40,
    backgroundColor: '#121217',
    borderWidth: 1,
    borderColor: '#1C1C24',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  propertyTypeBtnActive: {
    borderColor: GOLD,
    backgroundColor: '#1A1A22',
  },
  propertyTypeText: {
    color: 'rgba(255,255,255,0.6)',
    fontFamily: 'Manrope',
    fontSize: 13,
    fontWeight: '600',
  },
  propertyTypeTextActive: {
    color: GOLD,
    fontWeight: '700',
  },
});
