import React, { useMemo, useState, useEffect } from 'react';
import {
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';
import FeedbackModal from '@/components/FeedbackModal';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  DEFAULT_MATERIAL_SELECTIONS,
  formatNaira,
  materialSummary,
} from '@/app/screens/ziora-ai/mockEstimateData';
import { ApiService } from '@/app/services/apiService';

export const options = {
  headerShown: false,
};

export default function EstimateDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ estimateId?: string }>();

  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | 'info'>('info');
  const [feedbackTitle, setFeedbackTitle] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const [estimate, setEstimate] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedPlanIndex, setSelectedPlanIndex] = useState<number>(0);

  const showFeedback = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    setFeedbackType(type);
    setFeedbackTitle(title);
    setFeedbackMessage(message);
    setFeedbackVisible(true);
  };

  useEffect(() => {
    let active = true;
    async function loadDetails() {
      if (!params.estimateId) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const res = await ApiService.getRenovationEstimateDetails(params.estimateId);
        const raw = (res as any)?.data || res;
        if (raw && (raw.id || raw.projectName) && active) {
          const floorArea = raw.floorArea || (raw.length * raw.width) || 16.0;
          const wallArea = raw.wallArea || (2 * ((raw.length || 4) + (raw.width || 4)) * (raw.height || 2.8)) || 36.0;
          
          const midTotal = ((raw.lowEstimate || 0) + (raw.highEstimate || 0)) / 2;
          const costLines = raw.costLines || [
            { label: 'Materials', amount: midTotal * 0.58, note: 'Finishes and selected fixtures' },
            { label: 'Labour', amount: midTotal * 0.32, note: 'Installation and artisan work' },
            { label: 'Logistics', amount: midTotal * 0.075, note: 'Delivery and handling' },
            { label: 'Contingency', amount: midTotal * 0.025, note: 'Project buffer' },
          ];

          const paymentSchedule = raw.paymentSchedule || [
            { label: 'Mobilization', amount: midTotal * 0.4, note: 'Due after approved quotation' },
            { label: 'Mid-project milestone', amount: midTotal * 0.35, note: 'Due after core installation' },
            { label: 'Completion balance', amount: midTotal * 0.25, note: 'Due before final handover' },
          ];

          const recommendations = raw.recommendations || [
            `Optimize your ${raw.roomType || 'space'} layout by layering accent lighting.`,
            'Confirm details during the physical site surveyor inspection.',
            'Expect construction completion within the estimated timeframe.',
          ];

          // Material selections mapping
          const materialSels = raw.materialSelections || raw.selectedItems?.reduce((acc: any, cur: any) => {
            acc[cur.category] = cur.item;
            return acc;
          }, {}) || DEFAULT_MATERIAL_SELECTIONS;

          setEstimate({
            id: raw.id,
            projectName: raw.projectName || 'Renovation Project',
            roomType: raw.roomType || 'Living Room',
            complexity: raw.complexity || 'Standard Renovation',
            lowEstimate: raw.lowEstimate || 0,
            highEstimate: raw.highEstimate || 0,
            confidence: raw.confidence || 85,
            costPerSqm: raw.costPerSqm || (midTotal / floorArea),
            duration: raw.duration || '2-4 weeks',
            status: raw.status || 'Saved',
            paymentPlanOptions: raw.paymentPlanOptions || [],
            floorAreaSqm: floorArea,
            wallAreaSqm: wallArea,
            costLines,
            paymentSchedule,
            recommendations,
            materialSelections: materialSels,
            disclaimer: raw.disclaimer || 'This Smart Estimate is an AI-generated budgeting guide. It is not an official TBM quotation. Final pricing is confirmed after inspection.',
          });
        }
      } catch (err) {
        console.error('Failed to load estimate details:', err);
      } finally {
        if (active) setIsLoading(false);
      }
    }
    loadDetails();
    return () => {
      active = false;
    };
  }, [params.estimateId]);

  const comparisonCards = useMemo(() => {
    if (!estimate) return [];
    const economy = estimate.lowEstimate * 0.82;
    const standard = (estimate.lowEstimate + estimate.highEstimate) / 2;
    const luxury = estimate.highEstimate * 1.22;
    return [
      { label: 'Economy', value: economy, note: 'Cost-saving finishes' },
      { label: 'Standard', value: standard, note: 'Balanced durability' },
      { label: 'Luxury', value: luxury, note: 'High-end fixtures' },
    ];
  }, [estimate]);

  const openQuotation = () => {
    if (!estimate) return;
    router.push({
      pathname: '/screens/ziora-ai/OfficialQuotationScreen',
      params: { estimateId: estimate.id, projectName: estimate.projectName },
    });
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
          Smart Estimate
        </Text>
        <Pressable
          style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
          onPress={() => router.push('/screens/ziora-ai/CreateEstimateScreen')}
        >
          <Ionicons name="add-outline" size={22} color="#C9922A" />
        </Pressable>
      </View>

      {isLoading || !estimate ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#C9922A" />
          <Text style={{ color: '#8E8E93', fontFamily: 'Manrope', fontSize: 13, marginTop: 12 }} allowFontScaling={false}>
            Retrieving smart estimate details...
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Main Budget Card */}
          <View style={styles.budgetCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <Text style={styles.eyebrow} allowFontScaling={false}>AI SMART ESTIMATE (NON-BINDING)</Text>
              {estimate.status && (
                <View style={{ backgroundColor: 'rgba(52, 199, 89, 0.15)', borderWidth: 1, borderColor: '#34C759', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 }}>
                  <Text style={{ color: '#34C759', fontSize: 10, fontFamily: 'Manrope', fontWeight: '800' }} allowFontScaling={false}>
                    {estimate.status.toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.projectName} allowFontScaling={false}>{estimate.projectName}</Text>
            <Text style={styles.metaText} allowFontScaling={false}>
              {estimate.roomType} • {estimate.complexity}
            </Text>

            {/* Pricing Range Box */}
            <View style={styles.rangeBox}>
              <Text style={styles.rangeLabel} allowFontScaling={false}>ESTIMATED BUDGET RANGE</Text>
              <Text style={styles.rangeValue} allowFontScaling={false}>
                {formatNaira(estimate.lowEstimate)} – {formatNaira(estimate.highEstimate)}
              </Text>
              <Text style={styles.rangeSub} allowFontScaling={false}>*Final budget determined after site inspection</Text>
            </View>

            {/* Core Info Cells */}
            <View style={styles.infoCellsGrid}>
              <View style={styles.infoCell}>
                <Text style={styles.infoCellLabel} allowFontScaling={false}>CONFIDENCE</Text>
                <Text style={styles.infoCellValue} allowFontScaling={false}>{estimate.confidence}%</Text>
              </View>
              <View style={styles.infoCell}>
                <Text style={styles.infoCellLabel} allowFontScaling={false}>COST / SQM</Text>
                <Text style={styles.infoCellValue} allowFontScaling={false}>
                  {formatNaira(estimate.costPerSqm)}
                </Text>
              </View>
            </View>
          </View>

          {/* Confidence Explanation Banner */}
          <View style={styles.explanationBanner}>
            <Ionicons name="sparkles-outline" size={18} color="#C9922A" />
            <View style={{ flex: 1 }}>
              <Text style={styles.explanationTitle} allowFontScaling={false}>
                Ziora Confidence Score: {estimate.confidence}%
              </Text>
              <Text style={styles.explanationBody} allowFontScaling={false}>
                Based on completed room dimensions, selected material qualities per category, and scope options. Site inspection will raise accuracy to 100%.
              </Text>
            </View>
          </View>

          {/* Detailed Cost Analysis Breakdown */}
          <SectionTitle title="Cost Breakdown" />
          <View style={styles.table}>
            {estimate.costLines.map((line: any) => (
              <View key={line.label} style={styles.tableRow}>
                <View style={styles.rowLabelGroup}>
                  <Text style={styles.rowLabelText} allowFontScaling={false}>{line.label}</Text>
                  <Text style={styles.rowSubText} allowFontScaling={false}>{line.note}</Text>
                </View>
                <Text style={styles.rowPriceText} allowFontScaling={false}>{formatNaira(line.amount)}</Text>
              </View>
            ))}
            {/* Floor & Wall Space Area */}
            <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
              <View style={styles.rowLabelGroup}>
                <Text style={styles.rowLabelText} allowFontScaling={false}>Project Area Details</Text>
                <Text style={styles.rowSubText} allowFontScaling={false}>
                  Floor: {estimate.floorAreaSqm.toFixed(1)} sqm | Walls: {estimate.wallAreaSqm.toFixed(1)} sqm
                </Text>
              </View>
              <Text style={styles.rowPriceText} allowFontScaling={false}>
                {estimate.duration}
              </Text>
            </View>
          </View>

          {/* Milestone Payment Schedule */}
          <SectionTitle title="Suggested Milestone Schedule" />
          <View style={styles.milestoneBox}>
            {estimate.paymentSchedule.map((line: any, idx: number) => (
              <View key={line.label} style={styles.milestoneRow}>
                <View style={styles.milestoneIndicatorCol}>
                  <View style={styles.milestoneNodeActive}>
                    <Text style={styles.milestoneNodeText} allowFontScaling={false}>{idx + 1}</Text>
                  </View>
                  {idx < estimate.paymentSchedule.length - 1 && <View style={styles.milestoneLine} />}
                </View>
                <View style={styles.milestoneTextCol}>
                  <Text style={styles.milestoneTitle} allowFontScaling={false}>{line.label}</Text>
                  <Text style={styles.milestoneDesc} allowFontScaling={false}>{line.note}</Text>
                  <Text style={styles.milestoneAmount} allowFontScaling={false}>{formatNaira(line.amount)}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Flexible Payment Plans */}
          {estimate.paymentPlanOptions && estimate.paymentPlanOptions.length > 0 && (
            <>
              <SectionTitle title="Flexible Payment Plans" />
              <Text style={styles.compareHint} allowFontScaling={false}>
                Choose a payment schedule that fits your budget:
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.compareScroll}>
                {estimate.paymentPlanOptions.map((plan: any, index: number) => {
                  const isSelected = selectedPlanIndex === index;
                  return (
                    <Pressable
                      key={plan.name}
                      style={[
                        styles.compareCard,
                        isSelected && { borderColor: '#C9922A', backgroundColor: 'rgba(201, 146, 42, 0.08)' }
                      ]}
                      onPress={() => setSelectedPlanIndex(index)}
                    >
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <Text style={[styles.compareLabel, isSelected && { color: '#C9922A' }]} allowFontScaling={false}>
                          {plan.name}
                        </Text>
                        {isSelected && <Ionicons name="checkmark-circle" size={16} color="#C9922A" />}
                      </View>
                      <Text style={styles.compareValue} allowFontScaling={false}>
                        {formatNaira(plan.perInstallment)} <Text style={{ fontSize: 10, color: '#8E8E93' }}>/ inst</Text>
                      </Text>
                      <Text style={[styles.compareDesc, { marginTop: 4 }]} allowFontScaling={false}>
                        {plan.installments} Installments • {plan.description}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </>
          )}

          {/* AI Smart Recommendations */}
          <SectionTitle title="AI Design Recommendations" />
          <View style={styles.recommendationsList}>
            {estimate.recommendations.map((rec: string) => (
              <View key={rec} style={styles.recommendationItem}>
                <View style={styles.recBulletCircle}>
                  <Ionicons name="checkmark" size={12} color="#000000" />
                </View>
                <Text style={styles.recommendationText} allowFontScaling={false}>
                  {rec}
                </Text>
              </View>
            ))}
          </View>

          {/* Selected Category Finishes (COMMENTED OUT: NOT IN API)
          <SectionTitle title="Selected Category Finishes" />
          <View style={styles.finishesGrid}>
            {materialSummary(estimate.materialSelections).map((item: string) => {
              const [catName, tierName] = item.split(': ');
              return (
                <View key={item} style={styles.finishCard}>
                  <Text style={styles.finishCardLabel} allowFontScaling={false}>{catName.toUpperCase()}</Text>
                  <Text style={styles.finishCardValue} allowFontScaling={false}>{tierName}</Text>
                </View>
              );
            })}
          </View>
          */}

          {/* Scenario Comparisons */}
          <SectionTitle title="Compare Material Scenarios" />
          <Text style={styles.compareHint} allowFontScaling={false}>
            See standard finish tier alternatives for this room size:
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.compareScroll}>
            {comparisonCards.map((item) => (
              <View key={item.label} style={styles.compareCard}>
                <Text style={styles.compareLabel} allowFontScaling={false}>{item.label}</Text>
                <Text style={styles.compareValue} allowFontScaling={false}>{formatNaira(item.value)}</Text>
                <Text style={styles.compareDesc} allowFontScaling={false}>{item.note}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Instant Upgrades Block */}
          <SectionTitle title="Instant Upgrades" />
          <View style={styles.upgradeGrid}>
            {[
              { icon: 'cube-outline', label: 'Add 3D Design', desc: 'Photorealistic layout model' },
              { icon: 'calendar-outline', label: 'Book Site Inspection', desc: 'Confirm dimensions' },
              { icon: 'document-text-outline', label: 'Request Official BOQ', desc: 'Detailed cost breakdown' },
              { icon: 'chatbubbles-outline', label: 'Speak with Designer', desc: 'Get free expert advice' },
            ].map((up) => (
              <Pressable
                key={up.label}
                style={({ pressed }) => [styles.upgradeCard, pressed && styles.pressed]}
                onPress={() => {
                  showFeedback('success', 'Request Received', `${up.label} request added. Bogat administrator will contact you.`);
                }}
              >
                <View style={styles.upgradeHeader}>
                  <Ionicons name={up.icon as any} size={22} color="#C9922A" />
                  <Ionicons name="chevron-forward" size={14} color="#5D5D5D" />
                </View>
                <View>
                  <Text style={styles.upgradeTitle} allowFontScaling={false}>{up.label}</Text>
                  <Text style={styles.upgradeDesc} allowFontScaling={false}>{up.desc}</Text>
                </View>
              </Pressable>
            ))}
          </View>

          {/* Funnel Call to Action */}
          <View style={styles.disclaimerContainer}>
            <Ionicons name="shield-checkmark" size={18} color="#C9922A" style={{ marginTop: 2 }} />
            <Text style={styles.disclaimerText} allowFontScaling={false}>
              {estimate.disclaimer}
            </Text>
          </View>

          <Pressable
            style={({ pressed }) => [styles.ctaButton, pressed && styles.ctaButtonPressed]}
            onPress={openQuotation}
          >
            <MaterialCommunityIcons name="file-document-edit-outline" size={20} color="#000000" style={{ marginRight: 6 }} />
            <Text style={styles.ctaButtonText} allowFontScaling={false}>
              Proceed to Official Quotation
            </Text>
          </Pressable>
        </ScrollView>
      )}

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

function SectionTitle({ title }: { title: string }) {
  return <Text style={styles.sectionTitle} allowFontScaling={false}>{title}</Text>;
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
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 40,
  },
  budgetCard: {
    backgroundColor: '#0F0F0F',
    borderWidth: 1,
    borderColor: '#1D1D1D',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
  },
  eyebrow: {
    color: '#C9922A',
    fontFamily: 'Manrope',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  projectName: {
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  metaText: {
    color: '#9E9E9E',
    fontFamily: 'Manrope',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 18,
  },
  rangeBox: {
    backgroundColor: '#161616',
    borderWidth: 1,
    borderColor: '#262626',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  rangeLabel: {
    color: '#8E8E93',
    fontFamily: 'Manrope',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  rangeValue: {
    color: '#C9922A',
    fontFamily: 'Manrope',
    fontSize: 21,
    fontWeight: '800',
  },
  rangeSub: {
    color: '#5D5D5D',
    fontFamily: 'Manrope',
    fontSize: 10,
    marginTop: 6,
  },
  infoCellsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  infoCell: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: '#070707',
    borderWidth: 1,
    borderColor: '#1D1D1D',
    padding: 12,
  },
  infoCellLabel: {
    color: '#5D5D5D',
    fontFamily: 'Manrope',
    fontSize: 9,
    fontWeight: '800',
    marginBottom: 4,
  },
  infoCellValue: {
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 15,
    fontWeight: '800',
  },
  explanationBanner: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#11100C',
    borderWidth: 1,
    borderColor: '#3D331A',
    borderRadius: 14,
    padding: 14,
    marginBottom: 24,
  },
  explanationTitle: {
    color: '#C9922A',
    fontFamily: 'Manrope',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4,
  },
  explanationBody: {
    color: '#D8D8D8',
    fontFamily: 'Manrope',
    fontSize: 11,
    lineHeight: 16,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 12,
    marginTop: 8,
  },
  table: {
    backgroundColor: '#0F0F0F',
    borderWidth: 1,
    borderColor: '#1C1C1E',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F21',
  },
  rowLabelGroup: {
    flex: 1,
    paddingRight: 10,
  },
  rowLabelText: {
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 3,
  },
  rowSubText: {
    color: '#8E8E93',
    fontFamily: 'Manrope',
    fontSize: 10,
  },
  rowPriceText: {
    color: '#C9922A',
    fontFamily: 'Manrope',
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'right',
  },
  milestoneBox: {
    backgroundColor: '#0F0F0F',
    borderWidth: 1,
    borderColor: '#1D1D1D',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  milestoneRow: {
    flexDirection: 'row',
    gap: 12,
  },
  milestoneIndicatorCol: {
    alignItems: 'center',
  },
  milestoneNodeActive: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#C9922A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  milestoneNodeText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '900',
    fontFamily: 'Manrope',
  },
  milestoneLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#262626',
    marginVertical: 4,
  },
  milestoneTextCol: {
    flex: 1,
    paddingBottom: 20,
  },
  milestoneTitle: {
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 13,
    fontWeight: '800',
  },
  milestoneDesc: {
    color: '#8E8E93',
    fontFamily: 'Manrope',
    fontSize: 11,
    marginTop: 2,
  },
  milestoneAmount: {
    color: '#C9922A',
    fontFamily: 'Manrope',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 6,
  },
  recommendationsList: {
    gap: 10,
    marginBottom: 24,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F0F0F',
    borderWidth: 1,
    borderColor: '#1D1D1D',
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  recBulletCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#C9922A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recommendationText: {
    flex: 1,
    color: '#D8D8D8',
    fontFamily: 'Manrope',
    fontSize: 12,
    lineHeight: 18,
  },
  finishesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  finishCard: {
    width: '48%',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1D1D1D',
    backgroundColor: '#0F0F0F',
    padding: 10,
    justifyContent: 'space-between',
  },
  finishCardLabel: {
    color: '#5D5D5D',
    fontFamily: 'Manrope',
    fontSize: 8,
    fontWeight: '800',
    marginBottom: 4,
  },
  finishCardValue: {
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 12,
    fontWeight: '800',
  },
  compareHint: {
    color: '#8E8E93',
    fontFamily: 'Manrope',
    fontSize: 12,
    marginBottom: 10,
    marginTop: -8,
  },
  compareScroll: {
    gap: 10,
    paddingBottom: 4,
    marginBottom: 24,
  },
  compareCard: {
    width: 140,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1D1D1D',
    backgroundColor: '#0F0F0F',
    padding: 12,
    gap: 6,
  },
  compareLabel: {
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 13,
    fontWeight: '800',
  },
  compareValue: {
    color: '#C9922A',
    fontFamily: 'Manrope',
    fontSize: 14,
    fontWeight: '800',
  },
  compareDesc: {
    color: '#8E8E93',
    fontFamily: 'Manrope',
    fontSize: 10,
    lineHeight: 14,
  },
  upgradeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  upgradeCard: {
    width: '48%',
    minHeight: 82,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1D1D1D',
    backgroundColor: '#0F0F0F',
    padding: 12,
    justifyContent: 'space-between',
  },
  upgradeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  upgradeTitle: {
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 12,
    fontWeight: '800',
  },
  upgradeDesc: {
    color: '#5D5D5D',
    fontFamily: 'Manrope',
    fontSize: 9,
    marginTop: 2,
  },
  disclaimerContainer: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: '#1A1A1A',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  disclaimerText: {
    flex: 1,
    color: '#8E8E93',
    fontFamily: 'Manrope',
    fontSize: 11,
    lineHeight: 16,
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
});
