import React, { useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import FeedbackModal from '@/components/FeedbackModal';
import {
  DEFAULT_MATERIAL_SELECTIONS,
  MATERIAL_CATEGORIES,
  QUALITY_TIERS,
  RENOVATION_COMPLEXITIES,
  QualityTier,
  RenovationComplexity,
} from '@/app/screens/ziora-ai/mockEstimateData';
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

const COMPLEXITY_DETAILS: Record<RenovationComplexity, string> = {
  'Cosmetic Refresh': 'Painting, surface polishing, replacing minor fittings. No demolition.',
  'Standard Renovation': 'New flooring, cabinetry refurb, updated lighting, standard fixtures.',
  'Major Renovation': 'Structural alterations, full rewiring/plumbing, new walls or major layouts.',
  'Complete Remodel': 'Strip down to bare bricks, total layout reconstruction, top-tier materials.',
};

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
  const [complexity, setComplexity] = useState<RenovationComplexity>('Standard Renovation');
  const [materialSelections, setMaterialSelections] = useState(DEFAULT_MATERIAL_SELECTIONS);
  const [includeFlooring, setIncludeFlooring] = useState(true);
  const [includePainting, setIncludePainting] = useState(true);
  const [includeElectrical, setIncludeElectrical] = useState(true);
  const [includePlumbing, setIncludePlumbing] = useState(true);
  const [contingency, setContingency] = useState('10');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculates a live data completeness score
  const completionScore = useMemo(() => {
    let score = 40;
    if (projectName.trim()) score += 20;
    if (parseFloat(length) > 0 && parseFloat(width) > 0 && parseFloat(height) > 0) score += 25;
    if (complexity) score += 15;
    return Math.min(100, score);
  }, [complexity, height, length, projectName, width]);

  const setMaterialTier = (key: keyof typeof DEFAULT_MATERIAL_SELECTIONS, tier: QualityTier) => {
    setMaterialSelections((current) => ({ ...current, [key]: tier }));
  };
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
        showFeedback('error', 'Invalid Dimensions', 'Please check and enter room dimensions greater than 0 meters (e.g. 4.5).');
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
      showFeedback('error', 'Invalid Dimensions', 'Room length, width, and height must be greater than zero. Please go back to Step 2 and correct the dimensions.');
      return;
    }

    setIsSubmitting(true);

    // Map material selections record to selectedItems array
    const selectedItems = Object.entries(materialSelections).map(([category, item]) => ({
      category,
      item,
    }));

    try {
      const res = await ApiService.createRenovationEstimate({
        projectName: projectName.trim(),
        roomType,
        lengthMeters: lenVal,
        widthMeters: widVal,
        heightMeters: heiVal,
        finishLevel: complexity,
        includeFlooring,
        includePainting,
        includeElectrical,
        includePlumbing,
        contingencyPercent: parseFloat(contingency) || 10,
        roomDimensions: {
          length: lenVal,
          width: widVal,
          height: heiVal,
        },
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
        const errMsg = (res as any)?.message || errorsText || JSON.stringify(res) || 'Unable to save your smart estimate.';
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
        return 'Room Size';
      case 3:
        return 'Details & Buffer';
      default:
        return 'Smart Estimate';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Dynamic Header */}
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
        {/* Notice Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle-outline" size={18} color="#C9922A" />
          <Text style={styles.infoBannerText} allowFontScaling={false}>
            AI preliminary estimates are for budgeting. Bogat binding quotations are issued after site inspections.
          </Text>
        </View>

        {/* STEP 1: Project setup & room type */}
        {currentStep === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.introHeading} allowFontScaling={false}>
              Let's name your project
            </Text>
            <Text style={styles.label} allowFontScaling={false}>
              PROJECT NAME
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
              Choose the room type
            </Text>
            <View style={styles.roomGrid}>
              {ROOM_TYPES.map((item) => {
                const isSelected = roomType === item.name;
                return (
                  <Pressable
                    key={item.name}
                    style={[styles.roomCard, isSelected && styles.roomCardSelected]}
                    onPress={() => {
                      setRoomType(item.name);
                      setIncludePlumbing(item.name === 'Kitchen' || item.name === 'Bathroom');
                    }}
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
        {/* STEP 2: Room dimensions */}
        {currentStep === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.introHeading} allowFontScaling={false}>
              Enter space dimensions
            </Text>
            <Text style={styles.sectionSubtitle} allowFontScaling={false}>
              Dimensions are essential to calculate floor and wall square meters accurately.
            </Text>

            <View style={{ gap: 12, marginTop: 8 }}>
              {[
                { label: 'Room Length', val: length, setter: setLength, placeholder: '4.5', desc: 'Front-to-back distance', icon: 'swap-horizontal-outline' },
                { label: 'Room Width', val: width, setter: setWidth, placeholder: '3.5', desc: 'Side-to-side distance', icon: 'swap-vertical-outline' },
                { label: 'Ceiling Height', val: height, setter: setHeight, placeholder: '2.8', desc: 'Floor-to-ceiling height', icon: 'resize-outline' },
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

            {/*
            <View style={styles.calcPreviewBox}>
              <View style={styles.calcRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="grid-outline" size={14} color="#8E8E93" />
                  <Text style={styles.calcLabel} allowFontScaling={false}>Estimated Floor Area:</Text>
                </View>
                <Text style={styles.calcValue} allowFontScaling={false}>
                  Floor Area sqm
                </Text>
              </View>
              <View style={styles.calcRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="git-commit-outline" size={14} color="#8E8E93" />
                  <Text style={styles.calcLabel} allowFontScaling={false}>Estimated Wall Area:</Text>
                </View>
                <Text style={styles.calcValue} allowFontScaling={false}>
                  Wall Area sqm
                </Text>
              </View>
            </View>
            */}
          </View>
        )}


        {/* STEP 3: Options & Contingency */}
        {currentStep === 3 && (
          <View style={styles.stepContainer}>
            <Text style={styles.introHeading} allowFontScaling={false}>
              Included scope of work
            </Text>
            <Text style={styles.sectionSubtitle} allowFontScaling={false}>
              Uncheck items that are already installed or excluded from your plan.
            </Text>

            <View style={styles.scopeWrapper}>
              {[
                { title: 'Flooring installation', state: includeFlooring, setter: setIncludeFlooring },
                { title: 'Interior painting & walls', state: includePainting, setter: setIncludePainting },
                { title: 'Electrical fittings & lighting', state: includeElectrical, setter: setIncludeElectrical },
                { title: 'Plumbing work & fittings', state: includePlumbing, setter: setIncludePlumbing },
              ].map((scope) => (
                <View key={scope.title} style={styles.scopeRow}>
                  <Text style={styles.scopeRowTitle} allowFontScaling={false}>
                    {scope.title}
                  </Text>
                  <Switch
                    value={scope.state}
                    onValueChange={scope.setter}
                    trackColor={{ false: '#262626', true: '#C9922A' }}
                    thumbColor="#FFFFFF"
                  />
                </View>
              ))}
            </View>

            <Text style={styles.introHeading} allowFontScaling={false}>
              Contingency Percent (%)
            </Text>
            <Text style={styles.sectionSubtitle} allowFontScaling={false}>
              A percentage added for unexpected costs. 10% is standard.
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
                % Contingency
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Sticky Bottom Actions */}
      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [
            styles.ctaButton,
            (pressed || isSubmitting) && styles.ctaButtonPressed,
            isSubmitting && { opacity: 0.8 }
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
                {currentStep === 3 ? 'Generate Smart Estimate' : 'Continue'}
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
  label: {
    color: '#8E8E93',
    fontFamily: 'Manrope',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: -8,
  },
  textInput: {
    height: 50,
    backgroundColor: '#0F0F0F',
    borderWidth: 1,
    borderColor: '#242424',
    borderRadius: 12,
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 14,
    paddingHorizontal: 16,
  },
  roomGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  roomCard: {
    width: '48%',
    height: 94,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1C1C1E',
    backgroundColor: '#0F0F0F',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  roomCardSelected: {
    borderColor: '#C9922A',
    backgroundColor: 'rgba(201, 146, 42, 0.05)',
  },
  roomIcon: {
    marginBottom: 8,
  },
  roomText: {
    color: '#AEAEB2',
    fontFamily: 'Manrope',
    fontSize: 12,
    fontWeight: '700',
  },
  roomTextSelected: {
    color: '#C9922A',
  },
  roomCardCheckmark: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  dimensionsLayout: {
    flexDirection: 'row',
    gap: 10,
  },
  dimensionBox: {
    flex: 1,
  },
  numberInput: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#242424',
    backgroundColor: '#0F0F0F',
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
  },
  calcPreviewBox: {
    backgroundColor: '#0F0F0F',
    borderWidth: 1,
    borderColor: '#1D1D1D',
    borderRadius: 12,
    padding: 14,
    gap: 8,
    marginTop: 10,
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  calcLabel: {
    color: '#8E8E93',
    fontFamily: 'Manrope',
    fontSize: 12,
  },
  calcValue: {
    color: '#C9922A',
    fontFamily: 'Manrope',
    fontSize: 12,
    fontWeight: '800',
  },
  complexityWrapper: {
    gap: 12,
  },
  complexityCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1C1C1E',
    backgroundColor: '#0F0F0F',
    padding: 14,
    gap: 6,
  },
  complexityCardSelected: {
    borderColor: '#C9922A',
    backgroundColor: 'rgba(201, 146, 42, 0.08)',
  },
  complexityHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  complexityName: {
    color: '#AEAEB2',
    fontFamily: 'Manrope',
    fontSize: 14,
    fontWeight: '800',
  },
  complexityNameActive: {
    color: '#C9922A',
  },
  complexityDetail: {
    color: '#8E8E93',
    fontFamily: 'Manrope',
    fontSize: 11,
    lineHeight: 16,
    marginLeft: 30,
  },
  materialBlock: {
    gap: 12,
  },
  materialRow: {
    backgroundColor: '#0F0F0F',
    borderWidth: 1,
    borderColor: '#1C1C1E',
    borderRadius: 14,
    padding: 12,
    gap: 10,
  },
  materialLabel: {
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 13,
    fontWeight: '700',
  },
  tierSelectorGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  tierOption: {
    flex: 1,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#242424',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tierOptionActive: {
    backgroundColor: '#C9922A',
    borderColor: '#C9922A',
  },
  tierOptionText: {
    color: '#8E8E93',
    fontFamily: 'Manrope',
    fontSize: 11,
    fontWeight: '700',
  },
  tierOptionTextActive: {
    color: '#000000',
  },
  scopeWrapper: {
    gap: 10,
  },
  scopeRow: {
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1C1C1E',
    backgroundColor: '#0F0F0F',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scopeRowTitle: {
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 13,
    fontWeight: '700',
  },
  contingencyWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contingencyPercentSign: {
    color: '#8E8E93',
    fontFamily: 'Manrope',
    fontSize: 13,
    fontWeight: '700',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#070707',
    borderTopWidth: 1,
    borderColor: '#151515',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
  },
  ctaButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: '#C9922A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaButtonPressed: {
    backgroundColor: '#A37521',
    transform: [{ scale: 0.98 }],
  },
  ctaButtonText: {
    color: '#000000',
    fontFamily: 'Manrope',
    fontSize: 15,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.75,
  },
  dimensionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F0F0F',
    borderWidth: 1,
    borderColor: '#1D1D1D',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dimLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  dimIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(201, 146, 42, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dimTitle: {
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 13,
    fontWeight: '800',
  },
  dimDesc: {
    color: '#8E8E93',
    fontFamily: 'Manrope',
    fontSize: 10,
    marginTop: 2,
  },
  dimInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 90,
    height: 40,
    backgroundColor: '#070707',
    borderWidth: 1,
    borderColor: '#242424',
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  dimTextInput: {
    flex: 1,
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'right',
    padding: 0,
  },
  dimUnit: {
    color: '#8E8E93',
    fontFamily: 'Manrope',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
});
