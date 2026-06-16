import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  Dimensions,
} from 'react-native';
import { getVisualizerData } from './mockVisualizerData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const options = {
  headerShown: false,
};

export default function VisualizerResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const prompt = (params.prompt as string) || '';
  const data = getVisualizerData(prompt);

  const [sliderPosition, setSliderPosition] = useState(0.5);
  const [activeTab, setActiveTab] = useState(1);

  const handleSliderMove = (e: any) => {
    const pageX = e.nativeEvent.pageX;
    const sliderWidth = SCREEN_WIDTH - 40; // 40 is padding horizontal (20 on each side)
    const relativeX = pageX - 20; // 20 is horizontal offset from screen edge
    const newPos = relativeX / sliderWidth;
    if (newPos >= 0.02 && newPos <= 0.98) {
      setSliderPosition(newPos);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerIcon}>
          <Ionicons name="arrow-back" size={24} color="#B58529" />
        </Pressable>
        <Text style={styles.headerTitle} allowFontScaling={false}>
          AI Visualizer
        </Text>
        <Pressable style={styles.headerIcon}>
          <Ionicons name="ellipsis-vertical" size={24} color="#B58529" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle} allowFontScaling={false}>
            {data.mainTitle}
          </Text>
          <Text style={styles.subTitle} allowFontScaling={false}>
            {data.subTitle}
          </Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {data.tabs.map((tab, index) => (
            <Pressable
              key={tab}
              style={[styles.tab, index === activeTab && styles.tabActive]}
              onPress={() => setActiveTab(index)}
            >
              <Text
                style={[styles.tabText, index === activeTab && styles.tabTextActive]}
                allowFontScaling={false}
              >
                {tab}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Interactive Image Slider */}
        <View style={styles.imageContainer}>
          <View
            style={styles.sliderWrapper}
            onStartShouldSetResponder={() => true}
            onResponderMove={handleSliderMove}
          >
            {/* After Image (Background) */}
            <Image
              source={require('@/assets/images/visualizer_after.png')}
              style={styles.imageFull}
              contentFit="cover"
            />
            {/* Before Image (Cropped Overlay) */}
            <View style={[styles.imageCropped, { width: `${sliderPosition * 100}%` }]}>
              <Image
                source={require('@/assets/images/visualizer_before.png')}
                style={{ width: SCREEN_WIDTH - 40, height: '100%' }}
                contentFit="cover"
              />
            </View>

            {/* Slider Line & Handle */}
            <View style={[styles.sliderLine, { left: `${sliderPosition * 100}%` }]} />
            <View style={[styles.sliderHandle, { left: `${sliderPosition * 100}%` }]}>
              <Ionicons name="chevron-forward" size={16} color="#000" style={{ marginLeft: 2 }} />
              <Ionicons
                name="chevron-forward"
                size={16}
                color="#000"
                style={{ marginLeft: -8, marginRight: 2 }}
              />
            </View>

            {/* Floating AR Button */}
            <Pressable
              style={({ pressed }) => [
                styles.floatingArButtonContainer,
                pressed && { opacity: 0.9, transform: [{ translateY: 2 }, { scale: 0.99 }] },
              ]}
              onPress={() =>
                router.push({
                  pathname: '/screens/ziora-ai/MaterialsListScreen',
                  params: { prompt },
                })
              }
            >
              <View style={styles.arButtonWrapper}>
                <LinearGradient
                  colors={['#C9922A', '#A37521', '#8C641D']}
                  style={styles.arGradientArea}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.arButtonText} allowFontScaling={false}>
                    View Materials
                  </Text>
                </LinearGradient>
                <View style={styles.arIconArea}>
                  <Ionicons name="cube-outline" size={24} color="#B58529" />
                </View>
              </View>
            </Pressable>
          </View>
        </View>

        {/* Primary Actions */}
        <View style={styles.actionButtons}>
          <Pressable style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}>
            <Ionicons name="download-outline" size={20} color="#B58529" style={styles.actionIcon} />
            <Text style={styles.actionText} allowFontScaling={false}>
              Download High-Res Image
            </Text>
          </Pressable>

          <Pressable style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}>
            <MaterialCommunityIcons
              name="message-processing-outline"
              size={20}
              color="#B58529"
              style={styles.actionIcon}
            />
            <Text style={styles.actionText} allowFontScaling={false}>
              Contact Designer
            </Text>
          </Pressable>
        </View>

        {/* Stats Section */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel} allowFontScaling={false}>
              AI Accuracy
            </Text>
            <Text style={styles.statValue} allowFontScaling={false}>
              {data.accuracy}
            </Text>
            <Text style={styles.statDesc} allowFontScaling={false}>
              {data.accuracyLabel}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel} allowFontScaling={false}>
              Material Blend
            </Text>
            <Text style={styles.statValueGold} allowFontScaling={false}>
              {data.materialBlend}
            </Text>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBarFillGold, { width: `${data.materialPercentage}%` }]} />
              <View style={[styles.progressBarFillWhite, { width: `${100 - data.materialPercentage}%` }]} />
            </View>
          </View>
        </View>

        {/* Bottom Banner */}
        <View style={styles.bottomBanner}>
          <Ionicons name="sparkles" size={24} color="#B58529" style={styles.bannerIcon} />
          <View style={styles.bannerTextContainer}>
            <Text style={styles.bannerTitle} allowFontScaling={false}>
              Powered by Advanced AI
            </Text>
            <Text style={styles.bannerSub} allowFontScaling={false}>
              Accurate • Realistic • Instant
            </Text>
          </View>
        </View>
      </ScrollView>
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
    marginTop:30,
  },
  headerIcon: {
    padding: 4,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 16,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  titleSection: {
    marginTop: 8,
    marginBottom: 16,
  },
  mainTitle: {
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  subTitle: {
    color: '#888888',
    fontFamily: 'Manrope',
    fontSize: 12,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#222222',
    backgroundColor: '#111111',
  },
  tabActive: {
    borderColor: '#B58529',
    backgroundColor: 'rgba(181, 133, 41, 0.15)',
  },
  tabText: {
    color: '#888888',
    fontFamily: 'Manrope',
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#B58529',
  },
  imageContainer: {
    width: '100%',
    height: 420,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  sliderWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  imageFull: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  imageCropped: {
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    overflow: 'hidden',
  },
  sliderLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#FFFFFF',
    transform: [{ translateX: -1 }],
  },
  sliderHandle: {
    position: 'absolute',
    top: '50%',
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    transform: [{ translateX: -19 }, { translateY: -19 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 6,
  },
  floatingArButtonContainer: {
    position: 'absolute',
    bottom: 16,
    left: 20,
    right: 20,
    height: 52,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 8,
  },
  arButtonWrapper: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#B58529',
  },
  arGradientArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 14,
    fontWeight: '700',
  },
  arIconArea: {
    width: 60,
    backgroundColor: '#111111',
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#B58529',
  },
  actionButtons: {
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: 12,
    height: 52,
  },
  actionIcon: {
    marginRight: 10,
  },
  actionText: {
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 14,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#222222',
    borderRadius: 12,
    padding: 16,
    justifyContent: 'center',
  },
  statLabel: {
    color: '#888888',
    fontFamily: 'Manrope',
    fontSize: 11,
    marginBottom: 8,
  },
  statValue: {
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statDesc: {
    color: '#666666',
    fontFamily: 'Manrope',
    fontSize: 11,
  },
  statValueGold: {
    color: '#B58529',
    fontFamily: 'Manrope',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
  },
  progressBarContainer: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    flexDirection: 'row',
    overflow: 'hidden',
    marginTop: 'auto',
  },
  progressBarFillGold: {
    height: '100%',
    backgroundColor: '#B58529',
  },
  progressBarFillWhite: {
    height: '100%',
    backgroundColor: '#E0E0E0',
  },
  bottomBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#11100C',
    borderWidth: 1,
    borderColor: '#4A3B18',
    borderRadius: 12,
    padding: 16,
  },
  bannerIcon: {
    marginRight: 16,
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    color: '#B58529',
    fontFamily: 'Manrope',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  bannerSub: {
    color: '#888888',
    fontFamily: 'Manrope',
    fontSize: 11,
  },
  pressed: {
    opacity: 0.7,
  },
});
