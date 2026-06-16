import {
    Manrope_400Regular,
    Manrope_600SemiBold,
    Manrope_700Bold,
    useFonts,
} from '@expo-google-fonts/manrope';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { footerNavItems } from '@/app/data/home';
import { HomeFooter } from '@/components/home/HomeFooter';
import { HOME_HORIZONTAL_PADDING } from '@/components/home/layout';

export const options = { headerShown: false };

const GOLD = '#C9922A';

// ─── Mock rewards data ────────────────────────────────────────────────────────
const REWARDS = [
  { id: '1', title: 'Welcome Bonus', points: 500, date: 'Jan 10, 2025', type: 'earned' as const },
  { id: '2', title: 'First Purchase', points: 200, date: 'Jan 15, 2025', type: 'earned' as const },
  { id: '3', title: 'Redeemed Discount', points: -300, date: 'Feb 2, 2025', type: 'spent' as const },
  { id: '4', title: 'Referral Bonus', points: 150, date: 'Feb 20, 2025', type: 'earned' as const },
];

const TOTAL_POINTS = REWARDS.reduce((sum, r) => sum + r.points, 0);

export default function RewardsScreen() {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });

  if (!fontsLoaded) return null;

  const handleFooterSelect = (itemId: string) => {
    if (itemId === 'home') router.replace('/screens/HomeScreen');
    if (itemId === 'cart') router.push('/screens/CartScreen');
    if (itemId === 'favorite') router.push('/screens/FavoriteScreen');
    if (itemId === 'profile') router.push('/screens/ProfileScreen');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.page}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={10}>
            <Ionicons name="chevron-back" size={18} color={GOLD} />
          </Pressable>
          <Text style={styles.headerTitle} allowFontScaling={false}>
            Rewards
          </Text>
        </View>

        <View style={styles.divider} />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Points card ── */}
          <View style={styles.pointsCard}>
            <View style={styles.pointsCardInner}>
              <Ionicons name="ribbon" size={32} color={GOLD} />
              <Text style={styles.pointsValue} allowFontScaling={false}>
                {TOTAL_POINTS}
              </Text>
              <Text style={styles.pointsLabel} allowFontScaling={false}>
                Total Points
              </Text>
            </View>
            <Pressable style={({ pressed }) => [styles.redeemBtn, pressed && styles.pressed]}>
              <Text style={styles.redeemBtnText} allowFontScaling={false}>
                Redeem Points
              </Text>
            </Pressable>
          </View>

          {/* ── History ── */}
          <Text style={styles.sectionLabel} allowFontScaling={false}>
            Points History
          </Text>

          <View style={styles.historyList}>
            {REWARDS.map(reward => (
              <View key={reward.id} style={styles.historyRow}>
                <View style={[styles.historyIcon, { backgroundColor: reward.type === 'earned' ? 'rgba(201,146,42,0.15)' : 'rgba(255,80,80,0.10)' }]}>
                  <Ionicons
                    name={reward.type === 'earned' ? 'add-circle-outline' : 'remove-circle-outline'}
                    size={20}
                    color={reward.type === 'earned' ? GOLD : '#FF5050'}
                  />
                </View>
                <View style={styles.historyInfo}>
                  <Text style={styles.historyTitle} allowFontScaling={false}>
                    {reward.title}
                  </Text>
                  <Text style={styles.historyDate} allowFontScaling={false}>
                    {reward.date}
                  </Text>
                </View>
                <Text style={[styles.historyPoints, { color: reward.type === 'earned' ? GOLD : '#FF5050' }]} allowFontScaling={false}>
                  {reward.type === 'earned' ? '+' : ''}{reward.points} pts
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>

        <HomeFooter
          items={footerNavItems}
          activeItemId="profile"
          onSelectItem={handleFooterSelect}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#000000', marginTop: 30 },
  page: { flex: 1, backgroundColor: '#000000' },
  header: { height: 41, alignItems: 'center', justifyContent: 'center' },
  backButton: { position: 'absolute', left: 17, width: 28, height: 28, alignItems: 'flex-start', justifyContent: 'center' },
  headerTitle: { color: '#FFFFFF', fontFamily: 'Manrope_700Bold', fontSize: 16, fontWeight: '700', lineHeight: 20, textAlign: 'center' },
  divider: { height: 1, backgroundColor: '#2A2A2A', elevation: 4 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: HOME_HORIZONTAL_PADDING, paddingTop: 24, paddingBottom: 110, gap: 20 },

  // Points card
  pointsCard: { backgroundColor: '#252523', borderRadius: 12, padding: 24, alignItems: 'center', gap: 8, borderWidth: 1, borderColor: 'rgba(201,146,42,0.25)' },
  pointsCardInner: { alignItems: 'center', gap: 6 },
  pointsValue: { color: GOLD, fontFamily: 'Manrope_700Bold', fontSize: 48, fontWeight: '700', lineHeight: 52 },
  pointsLabel: { color: 'rgba(255,255,255,0.60)', fontFamily: 'Manrope_400Regular', fontSize: 13 },
  redeemBtn: { marginTop: 8, width: '100%', height: 48, borderRadius: 8, backgroundColor: GOLD, alignItems: 'center', justifyContent: 'center' },
  redeemBtnText: { color: '#FFFFFF', fontFamily: 'Manrope_700Bold', fontSize: 14, fontWeight: '700' },

  // History
  sectionLabel: { color: 'rgba(255,255,255,0.50)', fontFamily: 'Manrope_600SemiBold', fontSize: 13 },
  historyList: { gap: 12 },
  historyRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#252523', borderRadius: 10, padding: 14 },
  historyIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  historyInfo: { flex: 1, gap: 3 },
  historyTitle: { color: '#FFFFFF', fontFamily: 'Manrope_600SemiBold', fontSize: 13 },
  historyDate: { color: 'rgba(255,255,255,0.45)', fontFamily: 'Manrope_400Regular', fontSize: 11 },
  historyPoints: { fontFamily: 'Manrope_700Bold', fontSize: 13, fontWeight: '700' },

  pressed: { opacity: 0.78 },
});
