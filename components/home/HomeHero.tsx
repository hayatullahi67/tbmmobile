import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { memo } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

const GOLD = '#C9922A';

type HomeHeroProps = {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  horizontalPadding?: number;
};

function HomeHeroComponent({
  searchValue,
  onSearchChange,
  horizontalPadding = 4,
}: HomeHeroProps) {
  return (
    <View style={styles.hero}>
      {/* Background photo */}
      <Image
        source={require('@/assets/images/product7.jpeg')}
        style={styles.heroImage}
        contentFit="cover"
      />

      {/* Black gradient — very dark at top, fades to transparent at middle */}
      <LinearGradient
        colors={[
          'rgba(0,0,0,0.95)',
          'rgba(0,0,0,0.75)',
          'rgba(0,0,0,0.30)',
          'rgba(0,0,0,0.0)',
        ]}
        locations={[0, 0.30, 0.55, 1]}
        style={styles.gradient}
      />

      {/* Content */}
      <View style={[styles.content, { paddingHorizontal: horizontalPadding }]}>

        {/* Title — dark gold, same text */}
        <Text style={styles.title} allowFontScaling={false}>
          Spaces Built Smarter
        </Text>

        {/* Search bar — search icon in dark gold */}
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={13} color={GOLD} />
          <TextInput
            value={searchValue}
            onChangeText={onSearchChange}
            style={styles.searchInput}
            placeholder="Search item"
            placeholderTextColor="#7A7A7A"
            autoCapitalize="none"
            autoCorrect={false}
            allowFontScaling={false}
          />
        </View>
      </View>
    </View>
  );
}

export const HomeHero = memo(HomeHeroComponent);

const styles = StyleSheet.create({
  hero: {
    height: 271,
    overflow: 'hidden',
    backgroundColor: '#07070A',
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 18,
  },

  // ── Title — dark gold ─────────────────────────────────────────────────────────
  title: {
    color: "white",
    fontFamily: 'Manrope',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 20.5,
    textAlign: 'center',
    marginBottom: 29,
  },

  // ── Search bar — gold search icon ─────────────────────────────────────────────
  searchBox: {
    width: '100%',
    height: 45,
    borderRadius: 11,
    backgroundColor: '#252523',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: 'rgba(201,146,42,0.25)',
  },
  searchInput: {
    flex: 1,
    height: '100%',
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 10,
    fontWeight: '400',
    marginLeft: 8,
    padding: 0,
  },
});
