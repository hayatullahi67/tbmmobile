import React, { useState } from 'react';
import { Modal, View, Text, TextInput, Pressable, StyleSheet, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface InspectionBookingModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    contactName: string;
    contactPhone: string;
    contactEmail: string;
    siteAddress: string;
    siteCity: string;
    siteState: string;
    preferredDate1: string;
    preferredDate2: string;
    paymentReference: string;
    additionalNotes?: string;
  }) => Promise<void>;
  defaultValues?: { contactName: string; contactPhone: string; contactEmail: string } | null;
  paymentReference: string;
}

export const InspectionBookingModal: React.FC<InspectionBookingModalProps> = ({
  visible,
  onClose,
  onSubmit,
  defaultValues,
  paymentReference,
}) => {
  const [contactName, setContactName] = useState(defaultValues?.contactName || '');
  const [contactPhone, setContactPhone] = useState(defaultValues?.contactPhone || '');
  const [contactEmail, setContactEmail] = useState(defaultValues?.contactEmail || '');
  
  const [siteAddress, setSiteAddress] = useState('');
  const [siteCity, setSiteCity] = useState('');
  const [siteState, setSiteState] = useState('');
  
  const [preferredDate1, setPreferredDate1] = useState('');
  const [preferredDate2, setPreferredDate2] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync default values when they change/modal opens
  React.useEffect(() => {
    if (visible && defaultValues) {
      setContactName(defaultValues.contactName || '');
      setContactPhone(defaultValues.contactPhone || '');
      setContactEmail(defaultValues.contactEmail || '');
    }
  }, [visible, defaultValues]);

  const handleSubmit = async () => {
    if (
      !contactName.trim() ||
      !contactPhone.trim() ||
      !contactEmail.trim() ||
      !siteAddress.trim() ||
      !siteCity.trim() ||
      !siteState.trim() ||
      !preferredDate1.trim() ||
      !preferredDate2.trim()
    ) {
      setError('Please fill in all required fields.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({
        contactName: contactName.trim(),
        contactPhone: contactPhone.trim(),
        contactEmail: contactEmail.trim(),
        siteAddress: siteAddress.trim(),
        siteCity: siteCity.trim(),
        siteState: siteState.trim(),
        preferredDate1: preferredDate1.trim(),
        preferredDate2: preferredDate2.trim(),
        paymentReference,
        additionalNotes: additionalNotes.trim(),
      });
      // Clear address fields on success
      setSiteAddress('');
      setSiteCity('');
      setSiteState('');
      setPreferredDate1('');
      setPreferredDate2('');
      setAdditionalNotes('');
      onClose();
    } catch (e: any) {
      setError(e.message || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Book Site Inspection</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#FFF" />
            </Pressable>
          </View>
          
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionHeading}>Contact Information</Text>
            <TextInput
              placeholder="Contact Name"
              placeholderTextColor="#888"
              value={contactName}
              onChangeText={setContactName}
              style={styles.input}
            />
            <TextInput
              placeholder="Contact Phone"
              placeholderTextColor="#888"
              value={contactPhone}
              onChangeText={setContactPhone}
              keyboardType="phone-pad"
              style={styles.input}
            />
            <TextInput
              placeholder="Contact Email"
              placeholderTextColor="#888"
              value={contactEmail}
              onChangeText={setContactEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />

            <Text style={styles.sectionHeading}>Site Address</Text>
            <TextInput
              placeholder="Site Address"
              placeholderTextColor="#888"
              value={siteAddress}
              onChangeText={setSiteAddress}
              style={styles.input}
            />
            <View style={styles.row}>
              <TextInput
                placeholder="City"
                placeholderTextColor="#888"
                value={siteCity}
                onChangeText={setSiteCity}
                style={[styles.input, { flex: 1, marginRight: 10 }]}
              />
              <TextInput
                placeholder="State"
                placeholderTextColor="#888"
                value={siteState}
                onChangeText={setSiteState}
                style={[styles.input, { flex: 1 }]}
              />
            </View>

            <Text style={styles.sectionHeading}>Preferred Dates (e.g. YYYY-MM-DD)</Text>
            <View style={styles.row}>
              <TextInput
                placeholder="Preferred Date 1"
                placeholderTextColor="#888"
                value={preferredDate1}
                onChangeText={setPreferredDate1}
                style={[styles.input, { flex: 1, marginRight: 10 }]}
              />
              <TextInput
                placeholder="Preferred Date 2"
                placeholderTextColor="#888"
                value={preferredDate2}
                onChangeText={setPreferredDate2}
                style={[styles.input, { flex: 1 }]}
              />
            </View>

            <Text style={styles.sectionHeading}>Additional Details</Text>
            <TextInput
              placeholder="Any additional notes or instructions"
              placeholderTextColor="#888"
              value={additionalNotes}
              onChangeText={setAdditionalNotes}
              multiline
              numberOfLines={3}
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
            />

            <Text style={styles.refText}>Payment Verified Ref: {paymentReference}</Text>

            {error && <Text style={styles.error}>{error}</Text>}
            
            <Pressable onPress={handleSubmit} disabled={submitting} style={styles.submitBtn}>
              {submitting ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.submitText}>Submit Booking</Text>
              )}
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxHeight: '85%',
    backgroundColor: '#0F0F0F',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1D1D1D',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#FFF',
    fontFamily: 'Manrope',
    fontSize: 18,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 4,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  sectionHeading: {
    color: '#C9922A',
    fontFamily: 'Manrope',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginTop: 10,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
  },
  input: {
    backgroundColor: '#161616',
    borderWidth: 1,
    borderColor: '#262626',
    color: '#FFF',
    fontFamily: 'Manrope',
    fontSize: 13,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    marginBottom: 12,
  },
  submitBtn: {
    backgroundColor: '#C9922A',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  submitText: {
    color: '#000000',
    fontFamily: 'Manrope',
    fontWeight: '800',
    fontSize: 15,
  },
  refText: {
    color: '#00C853',
    fontFamily: 'Manrope',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 8,
  },
  error: {
    color: '#FF3B30',
    fontFamily: 'Manrope',
    fontSize: 12,
    marginBottom: 12,
  },
});
