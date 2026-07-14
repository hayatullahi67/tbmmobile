import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FeedbackModal from '@/components/FeedbackModal';
import { useLocalSearchParams, useRouter } from 'expo-router';

export const options = {
  headerShown: false,
};

const uploadItems = [
  { key: 'photos', label: 'Project Photos', icon: 'images-outline', desc: 'Current state of room' },
  { key: 'videos', label: 'Project Videos', icon: 'videocam-outline', desc: 'Walkthrough video' },
  { key: 'plans', label: 'Floor Plans', icon: 'document-text-outline', desc: 'Dimensions layout sheet' },
] as const;

export default function OfficialQuotationScreen() {
  const router = useRouter();
  const { projectName } = useLocalSearchParams<{ estimateId?: string; projectName?: string }>();
  const [uploads, setUploads] = useState<Record<string, number>>({ photos: 0, videos: 0, plans: 0 });
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [inspectionDate, setInspectionDate] = useState('');
  const [paymentDone, setPaymentDone] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | 'info'>('info');
  const [feedbackTitle, setFeedbackTitle] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const showFeedback = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    setFeedbackType(type);
    setFeedbackTitle(title);
    setFeedbackMessage(message);
    setFeedbackVisible(true);
  };

  const addMockUpload = (key: string) => {
    setUploads((current) => ({ ...current, [key]: current[key] + 1 }));
  };

  const canSubmit = name.trim() && phone.trim() && location.trim() && inspectionDate.trim() && paymentDone;

  const handleSubmit = () => {
    if (!canSubmit) {
      showFeedback('error', 'Information Required', 'Please complete all details, select an inspection date, and confirm the reservation deposit.');
      return;
    }
    setSubmitted(true);
    showFeedback('success', 'Booking Confirmed', 'Your site inspection booking has been submitted. The Bogat TBM project coordinators will contact you shortly.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#C9922A" />
        </Pressable>
        <Text style={styles.headerTitle} allowFontScaling={false}>
          Official Quotation Request
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Intro Funnel Banner */}
        <View style={styles.heroCard}>
          <Text style={styles.heroEyebrow} allowFontScaling={false}>TBM OFFICIAL QUOTATION</Text>
          <Text style={styles.heroTitle} allowFontScaling={false}>
            Site Inspection & Scope Audit
          </Text>
          <Text style={styles.heroText} allowFontScaling={false}>
            To prepare a legally binding construction quote for "{projectName || 'this project'}", a TBM surveyor must visit the property to audit space constraints, plumbing, and wall conditions.
          </Text>
        </View>

        {/* Upload media evidence */}
        <Text style={styles.sectionTitle} allowFontScaling={false}>Attach Project Assets</Text>
        <Text style={styles.sectionDesc} allowFontScaling={false}>
          Providing pictures, videos, or layouts helps our design estimators prepare beforehand.
        </Text>
        <View style={styles.uploadGrid}>
          {uploadItems.map((item) => (
            <Pressable
              key={item.key}
              style={({ pressed }) => [
                styles.uploadCard,
                uploads[item.key] > 0 && styles.uploadCardActive,
                pressed && styles.pressed,
              ]}
              onPress={() => addMockUpload(item.key)}
            >
              <Ionicons
                name={item.icon}
                size={22}
                color={uploads[item.key] > 0 ? '#000000' : '#C9922A'}
              />
              <View>
                <Text
                  style={[styles.uploadCardLabel, uploads[item.key] > 0 && { color: '#000000' }]}
                  allowFontScaling={false}
                >
                  {item.label}
                </Text>
                <Text
                  style={[styles.uploadCardDesc, uploads[item.key] > 0 && { color: '#2B2B2B' }]}
                  allowFontScaling={false}
                >
                  {item.desc}
                </Text>
              </View>
              <Text
                style={[styles.uploadCount, uploads[item.key] > 0 && { color: '#000000', fontWeight: '800' }]}
                allowFontScaling={false}
              >
                {uploads[item.key]} attached
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Site Details Contact Form */}
        <Text style={styles.sectionTitle} allowFontScaling={false}>Contact & Property Details</Text>
        <View style={styles.formBlock}>
          {[
            { label: 'CONTACT FULL NAME', val: name, setter: setName, placeholder: 'e.g. Samuel Adebayo' },
            { label: 'PHONE / WHATSAPP NUMBER', val: phone, setter: setPhone, placeholder: 'e.g. +234 803 123 4567', type: 'phone-pad' },
            { label: 'SITE LOCATION (STREET ADDRESS)', val: location, setter: setLocation, placeholder: 'e.g. Plot 15, Banana Island, Lagos' },
            { label: 'PREFERRED INSPECTION DATE', val: inspectionDate, setter: setInspectionDate, placeholder: 'e.g. Thursday, October 12' },
          ].map((field) => (
            <View key={field.label} style={styles.formField}>
              <Text style={styles.fieldLabel} allowFontScaling={false}>{field.label}</Text>
              <TextInput
                style={styles.textInput}
                placeholder={field.placeholder}
                placeholderTextColor="#5E5E62"
                keyboardType={(field.type as any) || 'default'}
                value={field.val}
                onChangeText={field.setter}
              />
            </View>
          ))}
        </View>

        {/* Site Survey Fee Reservation Deposit */}
        <Text style={styles.sectionTitle} allowFontScaling={false}>Inspection Payment</Text>
        <View style={styles.paymentCard}>
          <View style={styles.paymentDetails}>
            <Ionicons name="card-outline" size={24} color="#C9922A" style={styles.paymentIcon} />
            <View style={{ flex: 1 }}>
              <Text style={styles.paymentTitle} allowFontScaling={false}>Lagos Metro Inspection Fee</Text>
              <Text style={styles.paymentPrice} allowFontScaling={false}>₦15,000</Text>
              <Text style={styles.paymentSub} allowFontScaling={false}>
                A mock transaction is initiated. Tap "Pay" to simulate standard Payment Gateway approval.
              </Text>
            </View>
          </View>
          <Pressable
            style={[styles.payButton, paymentDone && styles.payButtonDone]}
            onPress={() => {
              setPaymentDone(true);
              showFeedback('success', 'Payment Simulated', 'Mock inspection fee deposit processed successfully.');
            }}
          >
            <Text style={[styles.payButtonText, paymentDone && { color: '#FFFFFF' }]} allowFontScaling={false}>
              {paymentDone ? 'Paid ✔' : 'Pay'}
            </Text>
          </Pressable>
        </View>

        {/* Success submission banner */}
        {submitted && (
          <View style={styles.successCard}>
            <Ionicons name="checkmark-circle" size={22} color="#34C759" />
            <Text style={styles.successText} allowFontScaling={false}>
              Mock submission ready for TBM admin dashboard review.
            </Text>
          </View>
        )}

        {/* Submit Booking */}
        <Pressable
          style={({ pressed }) => [
            styles.submitButton,
            !canSubmit && styles.submitButtonDisabled,
            pressed && canSubmit && styles.submitPressed,
          ]}
          onPress={handleSubmit}
          disabled={!canSubmit || submitted}
        >
          <Ionicons
            name="cloud-upload-outline"
            size={20}
            color={canSubmit ? '#000000' : 'rgba(255,255,255,0.3)'}
            style={{ marginRight: 6 }}
          />
          <Text
            style={[styles.submitText, !canSubmit && { color: 'rgba(255,255,255,0.3)' }]}
            allowFontScaling={false}
          >
            {submitted ? 'Booking Request Submitted' : 'Submit Quotation Request'}
          </Text>
        </Pressable>
      </ScrollView>
      <FeedbackModal
        visible={feedbackVisible}
        type={feedbackType}
        title={feedbackTitle}
        message={feedbackMessage}
        onClose={() => setFeedbackVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#070707',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: '#151515',
    marginTop: Platform.OS === 'android' ? 12 : 4,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#0F0F0F',
    borderWidth: 1,
    borderColor: '#1D1D1D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 16,
    fontWeight: '800',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: '#11100C',
    borderWidth: 1,
    borderColor: '#3D331A',
    borderRadius: 18,
    padding: 18,
    marginBottom: 24,
  },
  heroEyebrow: {
    color: '#C9922A',
    fontFamily: 'Manrope',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
  },
  heroText: {
    color: '#CCCCCC',
    fontFamily: 'Manrope',
    fontSize: 11,
    lineHeight: 17,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  sectionDesc: {
    color: '#8E8E93',
    fontFamily: 'Manrope',
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 14,
  },
  uploadGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  uploadCard: {
    flex: 1,
    minHeight: 116,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1C1C1E',
    backgroundColor: '#0F0F0F',
    padding: 12,
    justifyContent: 'space-between',
  },
  uploadCardActive: {
    backgroundColor: '#C9922A',
    borderColor: '#C9922A',
  },
  uploadCardLabel: {
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 11,
    fontWeight: '800',
  },
  uploadCardDesc: {
    color: '#5D5D5D',
    fontFamily: 'Manrope',
    fontSize: 8,
    marginTop: 2,
  },
  uploadCount: {
    color: '#8E8E93',
    fontFamily: 'Manrope',
    fontSize: 9,
  },
  formBlock: {
    gap: 14,
    marginBottom: 24,
  },
  formField: {
    gap: 6,
  },
  fieldLabel: {
    color: '#8E8E93',
    fontFamily: 'Manrope',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  textInput: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#242424',
    backgroundColor: '#0F0F0F',
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 13,
    paddingHorizontal: 15,
  },
  paymentCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1D1D1D',
    backgroundColor: '#0F0F0F',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  paymentDetails: {
    flexDirection: 'row',
    flex: 1,
    paddingRight: 10,
  },
  paymentIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  paymentTitle: {
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 12,
    fontWeight: '800',
  },
  paymentPrice: {
    color: '#C9922A',
    fontFamily: 'Manrope',
    fontSize: 16,
    fontWeight: '800',
    marginVertical: 4,
  },
  paymentSub: {
    color: '#5D5D5D',
    fontFamily: 'Manrope',
    fontSize: 9,
    lineHeight: 13,
  },
  payButton: {
    width: 68,
    height: 38,
    borderRadius: 9,
    backgroundColor: '#C9922A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  payButtonDone: {
    backgroundColor: '#34C759',
  },
  payButtonText: {
    color: '#000000',
    fontFamily: 'Manrope',
    fontSize: 12,
    fontWeight: '800',
  },
  successCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(52, 199, 89, 0.2)',
    backgroundColor: 'rgba(52, 199, 89, 0.05)',
    padding: 12,
    marginBottom: 20,
  },
  successText: {
    flex: 1,
    color: '#A9F4BC',
    fontFamily: 'Manrope',
    fontSize: 11,
    fontWeight: '700',
  },
  submitButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: '#C9922A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#2D2D2D',
  },
  submitPressed: {
    backgroundColor: '#A37521',
    transform: [{ scale: 0.98 }],
  },
  submitText: {
    color: '#000000',
    fontFamily: 'Manrope',
    fontSize: 14,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.75,
  },
});
