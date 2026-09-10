import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

const GOLD = '#C9922A';

type HomeHeroProps = {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  horizontalPadding?: number;
};

function HomeHeroComponent({
  searchValue,
  onSearchChange,
  horizontalPadding = 0,
}: HomeHeroProps) {
  const router = useRouter();

  return (
    <View style={[styles.container, { paddingHorizontal: horizontalPadding }]}>
      
      {/* ── SEARCH EXPERIENCE ── */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={20} color="rgba(255,255,255,0.4)" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search designs, services and vanities"
          placeholderTextColor="rgba(255,255,255,0.3)"
          value={searchValue}
          onChangeText={onSearchChange}
          autoCapitalize="none"
          autoCorrect={false}
          allowFontScaling={false}
        />
        <Pressable style={styles.filterButton} onPress={() => router.push('/screens/AllProductsScreen')}>
          <Ionicons name="options-outline" size={20} color="rgba(255,255,255,0.7)" />
        </Pressable>
      </View>

      {/* ── HERO VISUALIZER BANNER ── */}
      <Pressable style={styles.heroCard} onPress={() => router.push('/screens/ziora-ai/ZioraHomeScreen')}>
        <Image source={require('@/assets/images/visualizer_after.png')} style={styles.heroBgImage} contentFit="cover" />
        
        {/* Professional Horizontal Gradient Overlay */}
        <LinearGradient
          colors={['rgba(0,0,0,0.85)', 'rgba(0,0,0,0.45)', 'rgba(0,0,0,0.1)', 'transparent']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 0.8, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Content overlay */}
        <View style={styles.heroTextContainer}>
          <Text style={styles.heroTag} allowFontScaling={false}>ZIORA AI</Text>
          <Text style={styles.heroHeading} allowFontScaling={false}>
            Design your{'\n'}space before{'\n'}you build.
          </Text>
          <View style={styles.heroButton}>
            <Text style={styles.heroButtonText} allowFontScaling={false}>Start Designing</Text>
          </View>
        </View>
      </Pressable>
    </View>
  );
}

export const HomeHero = memo(HomeHeroComponent);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#07070A',
  },
  // ── Search experience ──
  searchBar: {
    height: 48,
    borderRadius: 8,
    backgroundColor: '#121217',
    borderWidth: 1,
    borderColor: '#1C1C24',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginTop: 16,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Manrope',
    height: '100%',
  },
  filterButton: {
    padding: 4,
  },

  // ── Hero banner card ──
  heroCard: {
    height: 185,
    borderRadius: 12,
    marginTop: 16,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#1C1C24',
  },
  heroBgImage: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
  },
  heroTextContainer: {
    position: 'absolute',
    left: 16,
    bottom: 16,
    zIndex: 5,
  },
  heroTag: {
    color: GOLD,
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Manrope',
    letterSpacing: 1.2,
  },
  heroHeading: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 26,
    fontFamily: 'Manrope',
    marginTop: 4,
  },
  heroButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    backgroundColor: GOLD,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  heroButtonText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Manrope',
  },
});
