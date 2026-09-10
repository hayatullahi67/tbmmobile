import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
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
import { useRouter } from 'expo-router';
import FeedbackModal from '@/components/FeedbackModal';
import { ApiService } from '@/app/services/apiService';

export const options = {
  headerShown: false,
};

const ROOM_TYPES = [
  { name: 'Kitchen', icon: 'restaurant-outline' },
  { name: 'Bathroom', icon: 'water-outline' },
  { name: 'Bedroom', icon: 'bed-outline' },
  { name: 'Living Room', icon: 'easel-outline' },
  { name: 'Office', icon: 'briefcase-outline' },
];

const QUALITY_TIERS = [
  { value: 0, label: 'Budget', desc: 'Cost-conscious finishes & standard materials' },
  { value: 1, label: 'Standard', desc: 'Balanced quality, durable fixtures & modern look' },
  { value: 2, label: 'Premium', desc: 'High-grade materials, custom finishes & enhanced detail' },
  { value: 3, label: 'Luxury', desc: 'Top-tier luxury materials, imported fixtures & full bespoke design' },
];

export default function CreateEstimateScreen() {
  const router = useRouter();
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

  const [currentStep, setCurrentStep] = useState(1);
  const [projectName, setProjectName] = useState('');
  const [roomType, setRoomType] = useState('Kitchen');
  const [length, setLength] = useState('0');
  const [width, setWidth] = useState('0');
  const [height, setHeight] = useState('0');
  const [qualityTier, setQualityTier] = useState<number>(1); // 1 = Standard default
  const [contingency, setContingency] = useState('10');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculates data completeness score
  const completionScore = useMemo(() => {
    let score = 30;
    if (projectName.trim()) score += 20;
    if (parseFloat(length) > 0 && parseFloat(width) > 0 && parseFloat(height) > 0) score += 30;
    if (qualityTier !== undefined) score += 20;
    return Math.min(100, score);
  }, [height, length, projectName, qualityTier, width]);

  const parseDimension = (val: string) => {
    const sanitized = val.replace(',', '.').trim();
    const parsed = parseFloat(sanitized);
    return isNaN(parsed) ? 0 : parsed;
  };

  const cleanNumber = (val: string) => {
    let cleaned = val.replace(/[^0-9.,]/g, '');
    const firstSeparatorIndex = cleaned.search(/[.,]/);
    if (firstSeparatorIndex !== -1) {
      const prefix = cleaned.substring(0, firstSeparatorIndex + 1);
      const suffix = cleaned.substring(firstSeparatorIndex + 1).replace(/[.,]/g, '');
      cleaned = prefix + suffix;
    }
    return cleaned;
  };

  const handleNumberChange = (val: string, setter: (v: string) => void) => {
    let cleaned = cleanNumber(val);
    if (cleaned.startsWith('0') && cleaned.length > 1 && !cleaned.startsWith('0.') && !cleaned.startsWith('0,')) {
      cleaned = cleaned.substring(1);
    }
    setter(cleaned || '0');
  };

  const validateStep = (step: number) => {
    if (step === 1) {
      if (!projectName.trim()) {
        showFeedback('error', 'Project Name Required', 'Please enter a name for your renovation project to proceed.');
        return false;
      }
    }
    if (step === 2) {
      const lenVal = parseDimension(length);
      const widVal = parseDimension(width);
      const heiVal = parseDimension(height);
      if (lenVal <= 0 || widVal <= 0 || heiVal <= 0) {
        showFeedback('error', 'Invalid Dimensions', 'Please enter room dimensions greater than 0 meters (e.g. 4.5).');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    const lenVal = parseDimension(length);
    const widVal = parseDimension(width);
    const heiVal = parseDimension(height);

    if (lenVal <= 0 || widVal <= 0 || heiVal <= 0) {
      showFeedback('error', 'Invalid Dimensions', 'Room length, width, and height must be greater than zero.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await ApiService.createRenovationEstimate({
        projectName: projectName.trim(),
        roomType,
        lengthM: lenVal,
        widthM: widVal,
        heightM: heiVal,
        qualityTier,
        contingencyPercent: parseFloat(contingency) || 10,
        notes: notes.trim() || undefined,
      });

      const rawData = (res as any)?.data || res;
      const estimateId = rawData?.id || rawData?.estimateId;

      if (estimateId) {
        router.push({
          pathname: '/screens/ziora-ai/EstimateDetailScreen',
          params: {
            estimateId: String(estimateId),
          },
        });
      } else {
        const errorsText = (res as any)?.errors && (res as any)?.errors.length > 0 ? (res as any)?.errors.join('\n') : '';
        const errMsg = (res as any)?.message || errorsText || 'Unable to save smart estimate.';
        showFeedback('error', 'Creation Failed', errMsg);
      }
    } catch (err: any) {
      console.error('[API] Create Estimate failed:', err);
      const errorsText = err.errors && err.errors.length > 0 ? `\nDetails:\n${err.errors.join('\n')}` : '';
      showFeedback('error', 'Creation Error', `${err?.message || 'A network error occurred. Please try again.'}${errorsText}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return 'Project Setup';
      case 2:
        return 'Dimensions';
      case 3:
        return 'Quality & Buffer';
      default:
        return 'Smart Estimate';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
          onPress={handleBack}
        >
          <Ionicons name="arrow-back" size={22} color="#C9922A" />
        </Pressable>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.stepIndicator} allowFontScaling={false}>
            STEP {currentStep} OF 3
          </Text>
          <Text style={styles.headerTitle} allowFontScaling={false}>
            {getStepTitle()}
          </Text>
        </View>
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreText} allowFontScaling={false}>
            {completionScore}%
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${(currentStep / 3) * 100}%` }]} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle-outline" size={18} color="#C9922A" />
          <Text style={styles.infoBannerText} allowFontScaling={false}>
            AI preliminary estimates are for budgeting. Official binding quotations are issued after site inspection.
          </Text>
        </View>

        {/* STEP 1: Project Setup */}
        {currentStep === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.introHeading} allowFontScaling={false}>
              Project Name
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Banana Island Kitchen Upgrade"
              placeholderTextColor="#5D5D5D"
              value={projectName}
              onChangeText={setProjectName}
              autoFocus={projectName === ''}
            />

            <Text style={styles.introHeading} allowFontScaling={false}>
              Choose Room Type
            </Text>
            <View style={styles.roomGrid}>
              {ROOM_TYPES.map((item) => {
                const isSelected = roomType === item.name;
                return (
                  <Pressable
                    key={item.name}
                    style={[styles.roomCard, isSelected && styles.roomCardSelected]}
                    onPress={() => setRoomType(item.name)}
                  >
                    {isSelected && (
                      <View style={styles.roomCardCheckmark}>
                        <Ionicons name="checkmark-circle" size={14} color="#C9922A" />
                      </View>
                    )}
                    <Ionicons
                      name={item.icon as any}
                      size={26}
                      color={isSelected ? '#C9922A' : '#5D5D5D'}
                      style={styles.roomIcon}
                    />
                    <Text style={[styles.roomText, isSelected && styles.roomTextSelected]} allowFontScaling={false}>
                      {item.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {/* STEP 2: Room Dimensions */}
        {currentStep === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.introHeading} allowFontScaling={false}>
              Room Dimensions (Meters)
            </Text>
            <Text style={styles.sectionSubtitle} allowFontScaling={false}>
              Enter length, width, and height to calculate square meters accurately.
            </Text>

            <View style={{ gap: 12, marginTop: 8 }}>
              {[
                { label: 'Room Length (m)', val: length, setter: setLength, placeholder: '4.5', desc: 'Length in meters', icon: 'swap-horizontal-outline' },
                { label: 'Room Width (m)', val: width, setter: setWidth, placeholder: '3.5', desc: 'Width in meters', icon: 'swap-vertical-outline' },
                { label: 'Ceiling Height (m)', val: height, setter: setHeight, placeholder: '2.8', desc: 'Height in meters', icon: 'resize-outline' },
              ].map((dim) => (
                <View key={dim.label} style={styles.dimensionCard}>
                  <View style={styles.dimLeft}>
                    <View style={styles.dimIconBg}>
                      <Ionicons name={dim.icon as any} size={18} color="#C9922A" />
                    </View>
                    <View>
                      <Text style={styles.dimTitle} allowFontScaling={false}>{dim.label}</Text>
                      <Text style={styles.dimDesc} allowFontScaling={false}>{dim.desc}</Text>
                    </View>
                  </View>
                  <View style={styles.dimInputContainer}>
                    <TextInput
                      style={styles.dimTextInput}
                      keyboardType="decimal-pad"
                      value={dim.val}
                      placeholder={dim.placeholder}
                      placeholderTextColor="#5D5D5D"
                      onChangeText={(text) => handleNumberChange(text, dim.setter)}
                    />
                    <Text style={styles.dimUnit} allowFontScaling={false}>m</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* STEP 3: Quality Tier, Contingency & Notes */}
        {currentStep === 3 && (
          <View style={styles.stepContainer}>
            {/* Commented out Quality Tier Selector
            <Text style={styles.introHeading} allowFontScaling={false}>
              Select Quality Tier
            </Text>
            <Text style={styles.sectionSubtitle} allowFontScaling={false}>
              Choose the finish standard for materials and fixtures.
            </Text>

            <View style={{ gap: 10 }}>
              {QUALITY_TIERS.map((tier) => {
                const isSelected = qualityTier === tier.value;
                return (
                  <Pressable
                    key={tier.value}
                    style={[styles.tierCard, isSelected && styles.tierCardSelected]}
                    onPress={() => setQualityTier(tier.value)}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.tierTitle, isSelected && { color: '#C9922A' }]} allowFontScaling={false}>
                        {tier.label}
                      </Text>
                      <Text style={styles.tierDesc} allowFontScaling={false}>
                        {tier.desc}
                      </Text>
                    </View>
                    <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                      {isSelected && <View style={styles.radioInnerCircle} />}
                    </View>
                  </Pressable>
                );
              })}
            </View>
            */}

            <Text style={[styles.introHeading, { marginTop: 12 }]} allowFontScaling={false}>
              Contingency Percentage (0–20%)
            </Text>
            <Text style={styles.sectionSubtitle} allowFontScaling={false}>
              Percentage added for unexpected site variations.
            </Text>
            <View style={styles.contingencyWrapper}>
              <TextInput
                style={styles.textInput}
                keyboardType="number-pad"
                value={contingency}
                onChangeText={(text) => handleNumberChange(text, setContingency)}
                placeholder="10"
                placeholderTextColor="#5D5D5D"
              />
              <Text style={styles.contingencyPercentSign} allowFontScaling={false}>
                % Buffer
              </Text>
            </View>

            <Text style={[styles.introHeading, { marginTop: 12 }]} allowFontScaling={false}>
              Special Requirements / Notes
            </Text>
            <TextInput
              style={[styles.textInput, { height: 80, paddingTop: 12 }]}
              multiline
              numberOfLines={3}
              placeholder="e.g. Include marble countertop, extra wall sockets..."
              placeholderTextColor="#5D5D5D"
              value={notes}
              onChangeText={setNotes}
            />
          </View>
        )}
      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [
            styles.ctaButton,
            (pressed || isSubmitting) && styles.ctaButtonPressed,
            isSubmitting && { opacity: 0.8 },
          ]}
          onPress={handleNext}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#000000" />
          ) : (
            <>
              <Ionicons
                name={currentStep === 3 ? 'sparkles' : 'arrow-forward'}
                size={20}
                color="#000000"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.ctaButtonText} allowFontScaling={false}>
                {currentStep === 3 ? 'Calculate Estimate' : 'Continue'}
              </Text>
            </>
          )}
        </Pressable>
      </View>

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
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#151515',
    marginTop: Platform.OS === 'android' ? 12 : 4,
  },
  headerButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#0F0F0F',
    borderWidth: 1,
    borderColor: '#1D1D1D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  stepIndicator: {
    color: '#8E8E93',
    fontSize: 9,
    fontFamily: 'Manrope',
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 16,
    fontWeight: '800',
  },
  scoreBadge: {
    minWidth: 38,
    height: 28,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#C9922A',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  scoreText: {
    color: '#C9922A',
    fontFamily: 'Manrope',
    fontSize: 11,
    fontWeight: '800',
  },
  progressBarBg: {
    height: 4,
    backgroundColor: '#1E1E1E',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#C9922A',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 110,
  },
  infoBanner: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#11100C',
    borderWidth: 1,
    borderColor: '#3A2F13',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  infoBannerText: {
    flex: 1,
    color: '#D8D8D8',
    fontFamily: 'Manrope',
    fontSize: 11,
    lineHeight: 16,
  },
  stepContainer: {
    gap: 16,
  },
  introHeading: {
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 17,
    fontWeight: '800',
    marginTop: 6,
  },
  sectionSubtitle: {
    color: '#8E8E93',
    fontFamily: 'Manrope',
    fontSize: 12,
    lineHeight: 18,
    marginTop: -8,
  },
  textInput: {
    height: 50,
    backgroundColor: '#0F0F0F',
    borderWidth: 1,
    borderColor: '#242424',
    borderRadius: 12,
    paddingHorizontal: 14,
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 14,
  },
  roomGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  roomCard: {
    width: '48%',
    backgroundColor: '#0F0F0F',
    borderWidth: 1,
    borderColor: '#242424',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    position: 'relative',
  },
  roomCardSelected: {
    borderColor: '#C9922A',
    backgroundColor: 'rgba(201, 146, 42, 0.08)',
  },
  roomCardCheckmark: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  roomIcon: {
    marginBottom: 8,
  },
  roomText: {
    color: '#8E8E93',
    fontFamily: 'Manrope',
    fontSize: 13,
    fontWeight: '600',
  },
  roomTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  dimensionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F0F0F',
    borderWidth: 1,
    borderColor: '#242424',
    borderRadius: 14,
    padding: 14,
  },
  dimLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dimIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(201, 146, 42, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dimTitle: {
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 14,
    fontWeight: '700',
  },
  dimDesc: {
    color: '#8E8E93',
    fontFamily: 'Manrope',
    fontSize: 11,
  },
  dimInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dimTextInput: {
    width: 65,
    height: 40,
    backgroundColor: '#181818',
    borderWidth: 1,
    borderColor: '#2E2E2E',
    borderRadius: 8,
    textAlign: 'center',
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 14,
    fontWeight: '700',
  },
  dimUnit: {
    color: '#8E8E93',
    fontFamily: 'Manrope',
    fontSize: 14,
    fontWeight: '700',
  },
  tierCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F0F0F',
    borderWidth: 1,
    borderColor: '#242424',
    borderRadius: 14,
    padding: 14,
  },
  tierCardSelected: {
    borderColor: '#C9922A',
    backgroundColor: 'rgba(201, 146, 42, 0.08)',
  },
  tierTitle: {
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  tierDesc: {
    color: '#8E8E93',
    fontFamily: 'Manrope',
    fontSize: 11,
    lineHeight: 16,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#3D3D3D',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  radioCircleSelected: {
    borderColor: '#C9922A',
  },
  radioInnerCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#C9922A',
  },
  contingencyWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  contingencyPercentSign: {
    position: 'absolute',
    right: 14,
    color: '#8E8E93',
    fontFamily: 'Manrope',
    fontSize: 13,
    fontWeight: '700',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#070707',
    borderTopWidth: 1,
    borderColor: '#151515',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  ctaButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#C9922A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaButtonPressed: {
    opacity: 0.8,
  },
  ctaButtonText: {
    color: '#000000',
    fontFamily: 'Manrope',
    fontSize: 15,
    fontWeight: '800',
  },
});
