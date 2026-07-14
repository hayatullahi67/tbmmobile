import React from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { MOCK_SAVED_ESTIMATES, formatNaira } from '@/app/screens/ziora-ai/mockEstimateData';

export const options = {
  headerShown: false,
};

export default function RenovationEstimatesScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#C9922A" />
        </Pressable>
        <Text style={styles.headerTitle} allowFontScaling={false}>
          AI Smart Estimates
        </Text>
        <Pressable
          style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
          onPress={() => router.push('/screens/ziora-ai/CreateEstimateScreen')}
        >
          <Ionicons name="add" size={24} color="#C9922A" />
        </Pressable>
      </View>

      <FlatList
        data={MOCK_SAVED_ESTIMATES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.heroBlock}>
            <Text style={styles.heroTitle} allowFontScaling={false}>
              Budget first. Quote after inspection.
            </Text>
            <Text style={styles.heroText} allowFontScaling={false}>
              Ziora gives a preliminary renovation range for planning. TBM official quotations are issued only after site inspection and scope verification.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={() =>
              router.push({
                pathname: '/screens/ziora-ai/EstimateDetailScreen',
                params: { estimateId: item.id },
              })
            }
          >
            <View style={styles.cardHeader}>
              <View style={styles.iconWrap}>
                <Ionicons name="sparkles" size={20} color="#C9922A" />
              </View>
              <View style={styles.cardTitleWrap}>
                <Text style={styles.projectName} allowFontScaling={false}>{item.projectName}</Text>
                <Text style={styles.projectMeta} allowFontScaling={false}>
                  {item.roomType} | {item.complexity}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#6F6F6F" />
            </View>

            <View style={styles.rangeRow}>
              <View>
                <Text style={styles.label} allowFontScaling={false}>ESTIMATED RANGE</Text>
                <Text style={styles.rangeText} allowFontScaling={false}>
                  {formatNaira(item.lowEstimate)} - {formatNaira(item.highEstimate)}
                </Text>
              </View>
              <View style={styles.confidenceBadge}>
                <Text style={styles.confidenceValue} allowFontScaling={false}>{item.confidence}%</Text>
                <Text style={styles.confidenceLabel} allowFontScaling={false}>Confidence</Text>
              </View>
            </View>

            <View style={styles.footerRow}>
              <Text style={styles.footerText} allowFontScaling={false}>{item.duration}</Text>
              <Text style={styles.footerText} allowFontScaling={false}>
                {formatNaira(item.costPerSqm)} / sqm
              </Text>
            </View>
          </Pressable>
        )}
      />

      <View style={styles.footerBar}>
        <Pressable
          style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
          onPress={() => router.push('/screens/ziora-ai/CreateEstimateScreen')}
        >
          <Ionicons name="calculator-outline" size={20} color="#000000" />
          <Text style={styles.ctaText} allowFontScaling={false}>Create New Smart Estimate</Text>
        </Pressable>
      </View>
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
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 116,
  },
  heroBlock: {
    backgroundColor: '#11100C',
    borderWidth: 1,
    borderColor: '#3A2F13',
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  heroText: {
    color: '#BEBEBE',
    fontFamily: 'Manrope',
    fontSize: 12,
    lineHeight: 19,
  },
  card: {
    backgroundColor: '#0F0F0F',
    borderWidth: 1,
    borderColor: '#1D1D1D',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: 'rgba(201, 146, 42, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardTitleWrap: {
    flex: 1,
  },
  projectName: {
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  projectMeta: {
    color: '#8E8E93',
    fontFamily: 'Manrope',
    fontSize: 11,
    fontWeight: '600',
  },
  rangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#1D1D1D',
    paddingTop: 14,
  },
  label: {
    color: '#737373',
    fontFamily: 'Manrope',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 5,
  },
  rangeText: {
    color: '#C9922A',
    fontFamily: 'Manrope',
    fontSize: 16,
    fontWeight: '800',
  },
  confidenceBadge: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2B2B2B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  confidenceValue: {
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 14,
    fontWeight: '800',
  },
  confidenceLabel: {
    color: '#8E8E93',
    fontFamily: 'Manrope',
    fontSize: 9,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  footerText: {
    color: '#8E8E93',
    fontFamily: 'Manrope',
    fontSize: 11,
    fontWeight: '600',
  },
  footerBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#070707',
    borderTopWidth: 1,
    borderColor: '#151515',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: Platform.OS === 'ios' ? 24 : 14,
  },
  cta: {
    height: 52,
    borderRadius: 12,
    backgroundColor: '#C9922A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  ctaPressed: {
    backgroundColor: '#A37521',
    transform: [{ scale: 0.98 }],
  },
  ctaText: {
    color: '#000000',
    fontFamily: 'Manrope',
    fontSize: 15,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.75,
  },
});
