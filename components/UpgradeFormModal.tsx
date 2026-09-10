import React, { useState } from 'react';
import { Modal, View, Text, TextInput, Pressable, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface UpgradeFormModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  onSubmit: (data: { contactName: string; contactPhone: string; contactEmail: string; additionalNotes?: string }) => Promise<void>;
  defaultValues?: { contactName: string; contactPhone: string; contactEmail: string } | null;
}

export const UpgradeFormModal: React.FC<UpgradeFormModalProps> = ({ visible, onClose, title, onSubmit, defaultValues }) => {
  const [contactName, setContactName] = useState(defaultValues?.contactName || '');
  const [contactPhone, setContactPhone] = useState(defaultValues?.contactPhone || '');
  const [contactEmail, setContactEmail] = useState(defaultValues?.contactEmail || '');
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
    if (!contactName.trim() || !contactPhone.trim() || !contactEmail.trim()) {
      setError('All contact fields are required.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({
        contactName: contactName.trim(),
        contactPhone: contactPhone.trim(),
        contactEmail: contactEmail.trim(),
        additionalNotes: additionalNotes.trim(),
      });
      // Clear notes on success
      setAdditionalNotes('');
      onClose();
    } catch (e: any) {
      setError(e.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <View style={styles.container}>
          {/* Grab Handle */}
          <View style={styles.handle} />
          
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#FFF" />
            </Pressable>
          </View>
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
          <TextInput
            placeholder="Additional Notes (optional)"
            placeholderTextColor="#888"
            value={additionalNotes}
            onChangeText={setAdditionalNotes}
            multiline
            numberOfLines={3}
            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
          />
          {error && <Text style={styles.error}>{error}</Text>}
          <Pressable onPress={handleSubmit} disabled={submitting} style={styles.submitBtn}>
            {submitting ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.submitText}>Submit Request</Text>
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  container: {
    width: '100%',
    backgroundColor: '#0F0F0F',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: '#1D1D1D',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 40 : 28,
  },
  handle: {
    width: 38,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
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
  input: {
    backgroundColor: '#161616',
    borderWidth: 1,
    borderColor: '#262626',
    color: '#FFF',
    fontFamily: 'Manrope',
    fontSize: 14,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    marginBottom: 16,
  },
  submitBtn: {
    backgroundColor: '#C9922A',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  submitText: {
    color: '#000000',
    fontFamily: 'Manrope',
    fontWeight: '800',
    fontSize: 15,
  },
  error: {
    color: '#FF3B30',
    fontFamily: 'Manrope',
    fontSize: 12,
    marginBottom: 12,
  },
});
