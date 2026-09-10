import { formatNaira } from '@/utils/formatters';
import { ApiService } from '@/app/services/apiService';
import { TokenService } from '@/app/services/tokenService';
import FeedbackModal from '@/components/FeedbackModal';
import { InspectionBookingModal } from '@/components/InspectionBookingModal';
import { PaystackWebViewModal } from '@/components/PaystackWebViewModal';
import { UpgradeFormModal } from '@/components/UpgradeFormModal';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

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

  // Instant upgrades state hooks
  const [upgradeType, setUpgradeType] = useState<'3d' | 'boq' | 'designer' | null>(null);
  const [showPaystack, setShowPaystack] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [paystackRef, setPaystackRef] = useState('');
  const [paystackUrl, setPaystackUrl] = useState('');
  const [userProfile, setUserProfile] = useState<{ contactName: string; contactPhone: string; contactEmail: string } | null>(null);

  const showFeedback = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    setFeedbackType(type);
    setFeedbackTitle(title);
    setFeedbackMessage(message);
    setFeedbackVisible(true);
  };

  useEffect(() => {
    async function loadUserProfile() {
      try {
        const u = await TokenService.getUser();
        if (u) {
          setUserProfile({
            contactName: `${u.firstName || ''} ${u.lastName || ''}`.trim(),
            contactPhone: u.phoneNumber || u.phone || '',
            contactEmail: u.email || '',
          });
        } else {
          const prof = await ApiService.getUserProfile();
          if (prof) {
            setUserProfile({
              contactName: `${prof.firstName || ''} ${prof.lastName || ''}`.trim(),
              contactPhone: prof.phoneNumber || '',
              contactEmail: prof.email || '',
            });
          }
        }
      } catch (err) {
        console.error('Failed to load user profile for upgrade prefill:', err);
      }
    }
    loadUserProfile();
  }, []);

  const handleUpgradeSubmit = async (data: { contactName: string; contactPhone: string; contactEmail: string; additionalNotes?: string }) => {
    if (!estimate) return;
    if (upgradeType === '3d') {
      const res = await ApiService.request3DDesign({
        estimateId: estimate.id,
        projectDescription: `3D design for my ${estimate.roomType || 'room'}`,
        contactName: data.contactName,
        contactPhone: data.contactPhone,
        contactEmail: data.contactEmail,
        additionalNotes: data.additionalNotes || '',
      });
      showFeedback('success', 'Request Received', res.message || 'Your 3D design request has been received!');
    } else if (upgradeType === 'boq') {
      const res = await ApiService.requestBOQ({
        estimateId: estimate.id,
        contactName: data.contactName,
        contactPhone: data.contactPhone,
        contactEmail: data.contactEmail,
        additionalNotes: data.additionalNotes || '',
      });
      showFeedback('success', 'Request Received', res.message || 'Your Official BOQ request has been received!');
    } else if (upgradeType === 'designer') {
      const res = await ApiService.requestDesignerContact({
        estimateId: estimate.id,
        contactName: data.contactName,
        contactPhone: data.contactPhone,
        contactEmail: data.contactEmail,
        additionalNotes: data.additionalNotes || '',
      });
      showFeedback('success', 'Request Received', res.message || 'Your request to speak with a designer has been received!');
    }
  };

  const handlePaystackSuccess = async (reference: string) => {
    try {
      setShowPaystack(false);
      console.log('[DEBUG] Paystack success. Verifying payment ref:', reference);
      // STEP B: Verify the payment
      const res = await ApiService.verifyInspectionPayment({ reference });
      console.log('[DEBUG] Payment verification response in EstimateDetailScreen:', JSON.stringify(res, null, 2));
      
      if (res && res.success) {
        setPaystackRef(reference);
        setShowBooking(true);
      } else {
        showFeedback('error', 'Verification Failed', res.message || 'We could not verify your payment reference.');
      }
    } catch (e: any) {
      console.log('[DEBUG] Payment verification caught exception:', e);
      showFeedback('error', 'Verification Error', e.message || 'An error occurred during payment verification.');
    }
  };

  const formatToISODate = (dateStr: string): string | null => {
    if (!dateStr) return null;
    const clean = dateStr.trim();
    
    // Check if already YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
      return clean;
    }
    
    // DD/MM/YYYY or DD-MM-YYYY
    const dmyMatch = clean.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (dmyMatch) {
      const [_, d, m, y] = dmyMatch;
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
    
    // Fallback general parse
    const parsed = Date.parse(clean);
    if (!isNaN(parsed)) {
      const date = new Date(parsed);
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    
    return null;
  };

  const combineDateTimeToISO = (dateStr: string, timeStr: string): string | null => {
    try {
      const isoDate = formatToISODate(dateStr);
      if (!isoDate) return null;
      
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
      
      const dateParts = isoDate.split('-');
      if (dateParts.length === 3) {
        const year = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10) - 1; // 0-indexed
        const day = parseInt(dateParts[2], 10);
        const date = new Date(year, month, day, hours, minutes, 0, 0);
        return date.toISOString();
      }
    } catch (e) {
      console.error('Error combining date and time:', e);
    }
    return null;
  };

  const handleInspectionBookingSubmit = async (data: any) => {
    const isoDateTime1 = combineDateTimeToISO(data.preferredDate1, data.preferredTime1);
    if (!isoDateTime1) {
      throw new Error('Preferred Date 1 and Time 1 are required.');
    }

    let isoDateTime2: string | undefined = undefined;
    if (data.preferredDate2 && data.preferredTime2) {
      isoDateTime2 = combineDateTimeToISO(data.preferredDate2, data.preferredTime2) || undefined;
    }

    console.log('[BOOKING FLOW] Step 1: Submitting booking details:', {
      contactName: data.contactName,
      contactPhone: data.contactPhone,
      contactEmail: data.contactEmail,
      siteAddress: data.siteAddress,
      siteCity: data.siteCity,
      siteState: data.siteState,
      preferredDate1: isoDateTime1,
      preferredDate2: isoDateTime2,
      propertyType: data.propertyType,
      consultationType: data.consultationType,
      additionalNotes: data.additionalNotes || '',
    });

    // 1. Submit the booking details
    const bookRes: any = await ApiService.bookInspection({
      contactName: data.contactName,
      contactPhone: data.contactPhone,
      contactEmail: data.contactEmail,
      siteAddress: data.siteAddress,
      siteCity: data.siteCity,
      siteState: data.siteState,
      preferredDate1: isoDateTime1,
      preferredDate2: isoDateTime2 || '',
      propertyType: data.propertyType,
      consultationType: data.consultationType,
      paymentReference: '',
      additionalNotes: data.additionalNotes || '',
    });

    console.log('[BOOKING FLOW] Step 1 Response from server:', JSON.stringify(bookRes, null, 2));

    const inspectionId = bookRes?.bookingId || bookRes?.id || bookRes?.inspectionId || bookRes?.data?.id || bookRes?.data?.bookingId || bookRes?.data?.inspectionId;
    console.log('[BOOKING FLOW] Extracted inspectionId:', inspectionId);

    if (!bookRes || !bookRes.success || !inspectionId) {
      throw new Error(bookRes?.message || 'Failed to submit inspection details.');
    }

    // 2. Initialize Paystack payment
    console.log('[BOOKING FLOW] Step 2: Initializing payment on server for ID:', inspectionId, 'Email:', data.contactEmail);
    const payRes: any = await ApiService.initializeInspectionPayment(inspectionId, data.contactEmail);
    console.log('[BOOKING FLOW] Step 2 Response from server:', JSON.stringify(payRes, null, 2));

    const authUrl = payRes?.authorizationUrl || payRes?.data?.authorizationUrl;
    const reference = payRes?.reference || payRes?.data?.reference;
    console.log('[BOOKING FLOW] Extracted authUrl & reference:', { authUrl, reference });

    if (!payRes || payRes.success === false || !authUrl) {
      throw new Error(payRes?.message || 'Failed to initialize payment.');
    }

    // 3. Save URL & Reference, then show Webview Modal
    setPaystackUrl(authUrl);
    setPaystackRef(reference);
    setShowPaystack(true);
  };

  const handlePaystackWebViewClose = async () => {
    setShowPaystack(false);
    if (!paystackRef) return;
    
    try {
      console.log('[BOOKING FLOW] Step 4: Verifying payment for reference:', paystackRef);
      showFeedback('info', 'Verifying Payment', 'Verifying payment status, please wait...');
      const verifyRes = await ApiService.verifyInspectionPayment({ reference: paystackRef });
      console.log('[BOOKING FLOW] Step 4 Response from server:', JSON.stringify(verifyRes, null, 2));
      
      if (verifyRes.success) {
        showFeedback('success', 'Booking Confirmed', verifyRes.message || 'Your site inspection has been successfully booked and payment verified!');
      } else {
        showFeedback(
          'error',
          'Payment Verification Failed',
          verifyRes.message || 'We could not verify your payment. Reference: ' + paystackRef
        );
      }
    } catch (e: any) {
      console.error('[BOOKING FLOW] Error in verification:', e);
      showFeedback('error', 'Error', e.message || 'An error occurred during verification.');
    }
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
        console.log('[API DEBUG] raw estimate response details:', JSON.stringify(raw, null, 2));

        if (raw && (raw.estimateId || raw.projectName || raw.id) && active) {
          // 1. Quality Tier Specific Parsing (Does not use finishLevel / complexity as a quality fallback)
          const rawTier = raw.qualityTierName ?? raw.qualityTier ?? raw.quality ?? raw.tier;
          let qualityTierLabel = 'Standard';

          if (rawTier !== undefined && rawTier !== null) {
            const cleanTier = String(rawTier).trim();
            const lowerTier = cleanTier.toLowerCase();
            if (cleanTier === '0' || lowerTier === 'budget') {
              qualityTierLabel = 'Budget';
            } else if (cleanTier === '1' || lowerTier === 'standard') {
              qualityTierLabel = 'Standard';
            } else if (cleanTier === '2' || lowerTier === 'premium') {
              qualityTierLabel = 'Premium';
            } else if (cleanTier === '3' || lowerTier === 'luxury') {
              qualityTierLabel = 'Luxury';
            } else {
              const parsedInt = parseInt(cleanTier, 10);
              if (!isNaN(parsedInt) && parsedInt >= 0 && parsedInt <= 3) {
                const tierNames = ['Budget', 'Standard', 'Premium', 'Luxury'];
                qualityTierLabel = tierNames[parsedInt];
              } else {
                qualityTierLabel = cleanTier;
              }
            }
          }

          // 2. Complexity / Finish Level Specific Parsing
          const rawComplexity = raw.complexity ?? raw.finishLevel;
          let complexityLabel = 'Standard Renovation';
          if (rawComplexity !== undefined && rawComplexity !== null) {
            complexityLabel = String(rawComplexity).trim() || 'Standard Renovation';
          }

          setEstimate({
            id: raw.estimateId || raw.id,
            projectName: raw.projectName || 'Renovation Project',
            roomType: raw.roomType || 'Living Room',
            qualityTier: qualityTierLabel,
            complexity: complexityLabel,
            totalEstimate: raw.totalEstimate || 0,
            status: raw.status || 'Saved',
            paymentPlanOptions: raw.paymentPlanOptions || [],
            floorAreaSqm: raw.floorArea ?? raw.floorAreaSqm ?? 0,
            wallAreaSqm: raw.wallAreaSqm || 0,
            materialsSubtotal: raw.materialsSubtotal || 0,
            laborSubtotal: raw.labourSubtotal ?? raw.laborSubtotal ?? 0,
            contingencyAmount: raw.contingencyAmount || 0,
            lineItems: raw.lineItems || [],
            suggestedProducts: raw.suggestedProducts || [],
            summary: raw.summary || '',
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
              {estimate.roomType}
            </Text>

            {/* Pricing Box */}
            <View style={styles.rangeBox}>
              <Text style={styles.rangeLabel} allowFontScaling={false}>TOTAL ESTIMATE</Text>
              <Text style={styles.rangeValue} allowFontScaling={false}>
                {formatNaira(estimate.totalEstimate)}
              </Text>
              <Text style={styles.rangeSub} allowFontScaling={false}>*Final budget determined after site inspection</Text>
            </View>

            {/* Core Info Cells */}
            <View style={styles.infoCellsGrid}>
              <View style={styles.infoCell}>
                <Text style={styles.infoCellLabel} allowFontScaling={false}>FLOOR AREA</Text>
                <Text style={styles.infoCellValue} allowFontScaling={false}>{estimate.floorAreaSqm.toFixed(1)} sqm</Text>
              </View>
              {/* Commented out Quality Tier Cell
              <View style={styles.infoCell}>
                <Text style={styles.infoCellLabel} allowFontScaling={false}>QUALITY TIER</Text>
                <Text style={[styles.infoCellValue, { color: '#C9922A' }]} allowFontScaling={false}>{estimate.qualityTier}</Text>
              </View>
              */}
              {estimate.wallAreaSqm > 0 && (
                <View style={styles.infoCell}>
                  <Text style={styles.infoCellLabel} allowFontScaling={false}>WALL AREA</Text>
                  <Text style={styles.infoCellValue} allowFontScaling={false}>{estimate.wallAreaSqm.toFixed(1)} sqm</Text>
                </View>
              )}
            </View>
          </View>


          {/* AI Estimate Summary Banner */}
          {estimate.summary && (
            <View style={styles.summaryBanner}>
              <View style={styles.summaryHeader}>
                <Ionicons name="document-text" size={18} color="#C9922A" style={{ marginRight: 6 }} />
                <Text style={styles.summaryHeading} allowFontScaling={false}>AI Summary</Text>
              </View>
              <Text style={styles.summaryBody} allowFontScaling={false}>
                {estimate.summary}
              </Text>
            </View>
          )}

          {/* Detailed Cost Analysis Breakdown */}
          <SectionTitle title="Cost Breakdown" />
          <View style={styles.table}>
            {estimate.lineItems && estimate.lineItems.map((line: any, idx: number) => (
              <View key={idx} style={styles.tableRow}>
                <View style={styles.rowLabelGroup}>
                  <Text style={styles.rowLabelText} allowFontScaling={false}>{line.name}</Text>
                  <Text style={styles.rowSubText} allowFontScaling={false}>
                    {line.group} • {line.quantity.toLocaleString()} {line.unit} @ {formatNaira(line.unitCost)}
                  </Text>
                </View>
                <Text style={styles.rowPriceText} allowFontScaling={false}>{formatNaira(line.totalCost)}</Text>
              </View>
            ))}
            {/* Totals */}
            <View style={styles.tableSummaryRow}>
              <Text style={styles.summaryLabel} allowFontScaling={false}>Materials Subtotal</Text>
              <Text style={styles.summaryValue} allowFontScaling={false}>{formatNaira(estimate.materialsSubtotal)}</Text>
            </View>
            <View style={styles.tableSummaryRow}>
              <Text style={styles.summaryLabel} allowFontScaling={false}>Labor Subtotal</Text>
              <Text style={styles.summaryValue} allowFontScaling={false}>{formatNaira(estimate.laborSubtotal)}</Text>
            </View>
            <View style={styles.tableSummaryRow}>
              <Text style={styles.summaryLabel} allowFontScaling={false}>Contingency Percent</Text>
              <Text style={styles.summaryValue} allowFontScaling={false}>{formatNaira(estimate.contingencyAmount)}</Text>
            </View>
            <View style={[styles.tableSummaryRow, { borderBottomWidth: 0, backgroundColor: 'rgba(201, 146, 42, 0.05)', paddingTop: 14, paddingBottom: 14 }]}>
              <Text style={[styles.summaryLabel, { color: '#C9922A', fontWeight: '800', fontSize: 14 }]} allowFontScaling={false}>Total Estimate</Text>
              <Text style={[styles.summaryValue, { color: '#C9922A', fontWeight: '800', fontSize: 14 }]} allowFontScaling={false}>{formatNaira(estimate.totalEstimate)}</Text>
            </View>
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

          {/* Recommended Materials */}
          {estimate.suggestedProducts && estimate.suggestedProducts.length > 0 && (
            <>
              <SectionTitle title="Recommended Materials" />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.compareScroll}>
                {estimate.suggestedProducts.map((prod: any, idx: number) => {
                  const prodId = prod.productId || prod.id;
                  return (
                    <Pressable
                      key={prodId || idx}
                      style={({ pressed }) => [styles.compareCard, pressed && styles.pressed]}
                      onPress={() => {
                        if (prodId) {
                          router.push({
                            pathname: '/screens/ProductDetailsScreen',
                            params: { id: String(prodId) },
                          });
                        }
                      }}
                    >
                      <Text style={styles.compareLabel} allowFontScaling={false}>{prod.category || 'Product'}</Text>
                      <Text style={[styles.compareValue, { fontSize: 13, minHeight: 36 }]} allowFontScaling={false}>{prod.name}</Text>
                      <Text style={[styles.compareDesc, { color: '#C9922A', fontWeight: '800' }]} allowFontScaling={false}>{formatNaira(prod.price)}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </>
          )}

          {/* Next Steps */}
          {estimate.nextSteps && estimate.nextSteps.length > 0 && (
            <>
              <SectionTitle title="Next Steps" />
              <View style={styles.recommendationsList}>
                {estimate.nextSteps.map((step: any, idx: number) => (
                  <View key={idx} style={styles.recommendationItem}>
                    <View style={styles.recBulletCircle}>
                      <Ionicons name="arrow-forward" size={10} color="#000000" />
                    </View>
                    <Text style={styles.recommendationText} allowFontScaling={false}>
                      {step.label}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          )}


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
                  if (up.label === 'Add 3D Design') {
                    setUpgradeType('3d');
                  } else if (up.label === 'Book Site Inspection') {
                    setShowBooking(true);
                  } else if (up.label === 'Request Official BOQ') {
                    setUpgradeType('boq');
                  } else if (up.label === 'Speak with Designer') {
                    setUpgradeType('designer');
                  }
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

      <UpgradeFormModal
        visible={upgradeType !== null}
        onClose={() => setUpgradeType(null)}
        title={
          upgradeType === '3d'
            ? 'Add 3D Design'
            : upgradeType === 'boq'
              ? 'Request Official BOQ'
              : 'Speak with Designer'
        }
        onSubmit={handleUpgradeSubmit}
        defaultValues={userProfile}
      />

      <PaystackWebViewModal
        visible={showPaystack}
        onClose={handlePaystackWebViewClose}
        authorizationUrl={paystackUrl}
        reference={paystackRef}
      />

      <InspectionBookingModal
        visible={showBooking}
        onClose={() => setShowBooking(false)}
        onSubmit={handleInspectionBookingSubmit}
        defaultValues={userProfile}
        paymentReference={paystackRef}
      />

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
  tableSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F21',
  },
  summaryLabel: {
    color: '#8E8E93',
    fontFamily: 'Manrope',
    fontSize: 13,
    fontWeight: '600',
  },
  summaryValue: {
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 13,
    fontWeight: '700',
  },
  summaryBanner: {
    backgroundColor: '#0F0F0F',
    borderWidth: 1,
    borderColor: '#1D1D1D',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    gap: 8,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryHeading: {
    color: '#C9922A',
    fontFamily: 'Manrope',
    fontSize: 13,
    fontWeight: '800',
  },
  summaryBody: {
    color: '#D8D8D8',
    fontFamily: 'Manrope',
    fontSize: 12,
    lineHeight: 18,
  },
});
