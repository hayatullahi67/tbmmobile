import React, { useState } from 'react';
import { Modal, View, Text, TextInput, Pressable, StyleSheet, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ApiService } from '@/app/services/apiService';

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
    preferredTime1: string;
    preferredDate2?: string;
    preferredTime2?: string;
    propertyType: string;
    consultationType: number;
    paymentReference?: string;
    additionalNotes?: string;
  }) => Promise<void>;
  defaultValues?: { contactName: string; contactPhone: string; contactEmail: string } | null;
  paymentReference?: string;
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
  
  const [propertyType, setPropertyType] = useState('Residential');
  
  const [preferredDate1, setPreferredDate1] = useState('');
  const [preferredTime1, setPreferredTime1] = useState('');
  const [preferredDate2, setPreferredDate2] = useState('');
  const [preferredTime2, setPreferredTime2] = useState('');
  
  const [date1, setDate1] = useState(new Date());
  const [date2, setDate2] = useState(new Date());
  
  const [showDatePicker1, setShowDatePicker1] = useState(false);
  const [showDatePicker2, setShowDatePicker2] = useState(false);
  
  const [slots1, setSlots1] = useState<string[]>([]);
  const [slots2, setSlots2] = useState<string[]>([]);
  const [loadingSlots1, setLoadingSlots1] = useState(false);
  const [loadingSlots2, setLoadingSlots2] = useState(false);
  
  const [additionalNotes, setAdditionalNotes] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate;
  };

  // Sync default values when they change/modal opens
  React.useEffect(() => {
    if (visible) {
      if (defaultValues) {
        setContactName(defaultValues.contactName || '');
        setContactPhone(defaultValues.contactPhone || '');
        setContactEmail(defaultValues.contactEmail || '');
      }
      setPropertyType('Residential');
      setPreferredDate1(formatDate(getTomorrow()));
      setPreferredTime1('');
      setPreferredDate2('');
      setPreferredTime2('');
      setDate1(getTomorrow());
      setDate2(getTomorrow());
      setSlots1([]);
      setSlots2([]);
      setShowDatePicker1(false);
      setShowDatePicker2(false);
    }
  }, [visible, defaultValues]);

  const formatDate = (date: Date) => {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  };

  const getApiDateString = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const loadSlots = async (selectedDate: Date, index: 1 | 2) => {
    const dateStr = getApiDateString(selectedDate);
    const stateVal = siteState.trim() || 'Lagos';
    if (index === 1) {
      setLoadingSlots1(true);
      setSlots1([]);
    } else {
      setLoadingSlots2(true);
      setSlots2([]);
    }

    try {
      const res = await ApiService.getInspectionAvailability(1, dateStr, stateVal);
      if (res && res.success && res.data && Array.isArray(res.data.slots)) {
        // Map the slots to readable time strings (like "10:00 AM")
        // and filter to only those that are available: true
        const availableSlots = res.data.slots
          .filter((slot: any) => slot.available)
          .map((slot: any) => {
            const dateObj = new Date(slot.start);
            let hours = dateObj.getHours();
            const minutes = String(dateObj.getMinutes()).padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            return `${hours}:${minutes} ${ampm}`;
          });
        if (index === 1) {
          setSlots1(availableSlots);
          if (availableSlots.length > 0) {
            setPreferredTime1((prev) => availableSlots.includes(prev) ? prev : availableSlots[0]);
          } else {
            setPreferredTime1('');
          }
        } else {
          setSlots2(availableSlots);
          if (availableSlots.length > 0) {
            setPreferredTime2((prev) => availableSlots.includes(prev) ? prev : availableSlots[0]);
          } else {
            setPreferredTime2('');
          }
        }
      }
    } catch (err) {
      console.error(`Failed to load slots for date ${index}:`, err);
    } finally {
      if (index === 1) setLoadingSlots1(false);
      else setLoadingSlots2(false);
    }
  };

  React.useEffect(() => {
    if (visible && preferredDate1) {
      loadSlots(date1, 1);
    }
  }, [date1, siteState, visible]);

  React.useEffect(() => {
    if (visible && preferredDate2) {
      loadSlots(date2, 2);
    }
  }, [date2, siteState, visible]);

  const onDate1Change = (event: any, selectedDate?: Date) => {
    setShowDatePicker1(Platform.OS === 'ios');
    if (selectedDate) {
      setDate1(selectedDate);
      setPreferredDate1(formatDate(selectedDate));
    }
  };

  const onDate2Change = (event: any, selectedDate?: Date) => {
    setShowDatePicker2(Platform.OS === 'ios');
    if (selectedDate) {
      setDate2(selectedDate);
      setPreferredDate2(formatDate(selectedDate));
    }
  };

  const handleSubmit = async () => {
    if (
      !contactName.trim() ||
      !contactPhone.trim() ||
      !contactEmail.trim() ||
      !siteAddress.trim() ||
      !siteCity.trim() ||
      !siteState.trim() ||
      !preferredDate1.trim() ||
      !preferredTime1.trim()
    ) {
      setError('Please fill in all required fields (Date 1 and Time 1 are required).');
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
        preferredTime1: preferredTime1.trim(),
        preferredDate2: preferredDate2.trim() ? preferredDate2.trim() : undefined,
        preferredTime2: preferredTime2.trim() ? preferredTime2.trim() : undefined,
        propertyType,
        consultationType: 1,
        paymentReference,
        additionalNotes: additionalNotes.trim(),
      });
      // Clear address fields on success
      setSiteAddress('');
      setSiteCity('');
      setSiteState('');
      setPreferredDate1('');
      setPreferredTime1('10:00 AM');
      setPreferredDate2('');
      setPreferredTime2('');
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
          {/* Grab Handle */}
          <View style={styles.handle} />
          
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

            <Text style={styles.sectionHeading}>Property Type</Text>
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

            <Text style={styles.sectionHeading}>Preferred Date & Time 1 (Required)</Text>
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Pressable
                  style={styles.dateSelector}
                  onPress={() => setShowDatePicker1(true)}
                >
                  <Text style={[styles.dateSelectorText, !preferredDate1 && styles.placeholderText]}>
                    {preferredDate1 || 'Select Date 1'}
                  </Text>
                  <Ionicons name="calendar-outline" size={16} color="#C9922A" />
                </Pressable>
                {showDatePicker1 && (
                  <DateTimePicker
                    value={date1}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'compact' : 'default'}
                    onChange={onDate1Change}
                    minimumDate={getTomorrow()}
                    maximumDate={getMaxDate()}
                  />
                )}
              </View>

              <View style={{ flex: 1 }}>
                {loadingSlots1 ? (
                  <View style={{ height: Platform.OS === 'ios' ? 44 : 40, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="small" color="#C9922A" />
                  </View>
                ) : slots1.length === 0 ? (
                  <View style={[styles.dateSelector, { borderColor: '#FF3B30' }]}>
                    <Text style={[styles.dateSelectorText, { color: '#FF3B30' }]} allowFontScaling={false}>
                      No slots available
                    </Text>
                  </View>
                ) : (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ height: Platform.OS === 'ios' ? 44 : 40 }}>
                    {slots1.map((slot) => {
                      const isActive = preferredTime1 === slot;
                      return (
                        <Pressable
                          key={slot}
                          style={[styles.slotChip, isActive && styles.slotChipActive]}
                          onPress={() => setPreferredTime1(slot)}
                        >
                          <Text style={[styles.slotChipText, isActive && styles.slotChipTextActive]} allowFontScaling={false}>
                            {slot}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                )}
              </View>
            </View>

            <Text style={styles.sectionHeading}>Preferred Date & Time 2 (Optional Backup)</Text>
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Pressable
                  style={styles.dateSelector}
                  onPress={() => setShowDatePicker2(true)}
                >
                  <Text style={[styles.dateSelectorText, !preferredDate2 && styles.placeholderText]}>
                    {preferredDate2 || 'Select Date 2'}
                  </Text>
                  <Ionicons name="calendar-outline" size={16} color="#C9922A" />
                </Pressable>
                {showDatePicker2 && (
                  <DateTimePicker
                    value={date2}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'compact' : 'default'}
                    onChange={onDate2Change}
                    minimumDate={getTomorrow()}
                    maximumDate={getMaxDate()}
                  />
                )}
              </View>

              <View style={{ flex: 1 }}>
                {preferredDate2 ? (
                  loadingSlots2 ? (
                    <View style={{ height: Platform.OS === 'ios' ? 44 : 40, justifyContent: 'center', alignItems: 'center' }}>
                      <ActivityIndicator size="small" color="#C9922A" />
                    </View>
                  ) : slots2.length === 0 ? (
                    <View style={[styles.dateSelector, { borderColor: '#FF3B30' }]}>
                      <Text style={[styles.dateSelectorText, { color: '#FF3B30' }]} allowFontScaling={false}>
                        No slots available
                      </Text>
                    </View>
                  ) : (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ height: Platform.OS === 'ios' ? 44 : 40 }}>
                      {slots2.map((slot) => {
                        const isActive = preferredTime2 === slot;
                        return (
                          <Pressable
                            key={slot}
                            style={[styles.slotChip, isActive && styles.slotChipActive]}
                            onPress={() => setPreferredTime2(slot)}
                          >
                            <Text style={[styles.slotChipText, isActive && styles.slotChipTextActive]} allowFontScaling={false}>
                              {slot}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </ScrollView>
                  )
                ) : (
                  <View style={[styles.dateSelector, { opacity: 0.5 }]}>
                    <Text style={styles.dateSelectorText} allowFontScaling={false}>
                      Select Date 2 first
                    </Text>
                  </View>
                )}
              </View>
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

            {paymentReference ? (
              <Text style={styles.refText}>Payment Verified Ref: {paymentReference}</Text>
            ) : null}

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
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  container: {
    width: '100%',
    maxHeight: '85%',
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
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#161616',
    borderWidth: 1,
    borderColor: '#262626',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: Platform.OS === 'ios' ? 44 : 40,
    marginBottom: 12,
  },
  dateSelectorText: {
    color: '#FFF',
    fontFamily: 'Manrope',
    fontSize: 13,
  },
  placeholderText: {
    color: '#888',
  },
  slotChip: {
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#161616',
    borderWidth: 1,
    borderColor: '#262626',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  slotChipActive: {
    backgroundColor: 'rgba(201, 146, 42, 0.08)',
    borderColor: '#C9922A',
  },
  slotChipText: {
    fontFamily: 'Manrope',
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
  },
  slotChipTextActive: {
    color: '#C9922A',
    fontWeight: '700',
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
    backgroundColor: '#161616',
    borderWidth: 1,
    borderColor: '#262626',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  propertyTypeBtnActive: {
    borderColor: '#C9922A',
    backgroundColor: 'rgba(201, 146, 42, 0.08)',
  },
  propertyTypeText: {
    color: 'rgba(255,255,255,0.6)',
    fontFamily: 'Manrope',
    fontSize: 13,
    fontWeight: '600',
  },
  propertyTypeTextActive: {
    color: '#C9922A',
    fontWeight: '700',
  },
});
