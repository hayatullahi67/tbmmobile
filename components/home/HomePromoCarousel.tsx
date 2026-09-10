import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, View, Text, Pressable, FlatList, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PromoSlide {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  btnText: string;
  icon: string;
  colors: string[];
  route: string;
}

export const HomePromoCarousel: React.FC = () => {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList<PromoSlide>>(null);

  const slides: PromoSlide[] = [
    {
      id: '1',
      badge: 'AI ESTIMATOR',
      title: 'AI Smart Estimate',
      subtitle: 'Generate a detailed materials list and budget breakdown for your space.',
      btnText: 'Calculate Cost',
      icon: 'calculator-outline',
      // Keep every slide within the app's warm gold and charcoal palette.
      colors: ['#7A5518', '#3D2A0E', '#121212'],
      route: '/screens/ziora-ai/CreateEstimateScreen',
    },
    {
      id: '2',
      badge: 'AI POWERED',
      title: 'AI Space Image Visualizer',
      subtitle: 'Describe your dream room and watch our AI render a high-quality visualization.',
      btnText: 'Generate Image',
      icon: 'image-outline',
      colors: ['#C9922A', '#6B4A10', '#121212'],
      route: '/screens/ziora-ai/ZioraHomeScreen',
    },
    {
      id: '3',
      badge: 'CINEMATIC AI',
      title: 'AI Space Video Renderer',
      subtitle: 'Bring rendering visuals to life with custom 4-second panning video walkthroughs.',
      btnText: 'Render Video',
      icon: 'videocam-outline',
      colors: ['#9B7024', '#4C3510', '#121212'],
      route: '/screens/ziora-ai/ZioraHomeScreen',
    },
    {
      id: '4',
      badge: 'MOODBOARDS',
      title: 'AI Design Inspiration',
      subtitle: 'Browse through hundreds of AI-generated moodboards for your home renovation.',
      btnText: 'Explore Designs',
      icon: 'bulb-outline',
      colors: ['#B17D27', '#5C4012', '#121212'],
      route: '/screens/ziora-ai/InspirationScreen',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      let nextIndex = activeIndex + 1;
      if (nextIndex >= slides.length) {
        nextIndex = 0;
      }
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
      setActiveIndex(nextIndex);
    }, 6000);

    return () => clearInterval(timer);
  }, [activeIndex]);

  const handleScroll = (event: any) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollOffset / SCREEN_WIDTH);
    if (index >= 0 && index < slides.length && index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  const renderItem = ({ item }: { item: PromoSlide }) => {
    return (
      <View style={styles.cardWrapper}>
        <View style={styles.card}>
          <LinearGradient
            colors={item.colors}
            locations={[0, 0.45, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          
          {/* Concentric blueprint orbits in background */}
          <View style={styles.orbit1} />
          <View style={styles.orbit2} />

          <View style={styles.content}>
            <View style={styles.textSection}>
              {/* Badge */}
              <View style={styles.badge}>
                <Ionicons name={item.icon as any} size={10} color="#C9922A" style={{ marginRight: 4 }} />
                <Text style={styles.badgeText}>{item.badge}</Text>
              </View>
              
              {/* Title */}
              <Text style={styles.title} numberOfLines={1} allowFontScaling={false}>
                {item.title}
              </Text>
              
              {/* Subtitle */}
              <Text style={styles.subtitle} numberOfLines={2} allowFontScaling={false}>
                {item.subtitle}
              </Text>

              {/* Pill Button */}
              <Pressable
                style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
                onPress={() => router.push(item.route as any)}
              >
                <Text style={styles.actionBtnText} allowFontScaling={false}>
                  {item.btnText}
                </Text>
                <Ionicons name="arrow-forward-outline" size={11} color="#000" style={{ marginLeft: 4 }} />
              </Pressable>
            </View>

            {/* Faint gold/white watermark icon on the right */}
            <View style={styles.rightIconWrapper}>
              <Ionicons name={item.icon as any} size={90} color="rgba(255, 255, 255, 0.04)" />
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.flatListContent}
      />
      
      {/* Dots Indicator */}
      <View style={styles.indicatorContainer}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              activeIndex === index ? styles.activeDot : null
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 14,
    marginBottom: 24,
  },
  flatListContent: {
    // Left and right are padded inside each wrapper to align with paging
  },
  cardWrapper: {
    width: SCREEN_WIDTH,
    paddingHorizontal: 16, // Matches HOME_HORIZONTAL_PADDING exactly
  },
  card: {
    height: 135,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1C1C1E',
  },
  orbit1: {
    position: 'absolute',
    right: -20,
    top: -20,
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.03)',
    borderStyle: 'dashed',
  },
  orbit2: {
    position: 'absolute',
    right: -50,
    top: -50,
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.02)',
    borderStyle: 'dashed',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  textSection: {
    flex: 2,
    zIndex: 2,
  },
  rightIconWrapper: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
    zIndex: 1,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(201, 146, 42, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(201, 146, 42, 0.25)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  badgeText: {
    color: '#C9922A',
    fontFamily: 'Manrope',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  title: {
    color: '#FFF',
    fontFamily: 'Manrope',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    color: '#BBB',
    fontFamily: 'Manrope',
    fontSize: 9.5,
    lineHeight: 14,
    fontWeight: '500',
    marginBottom: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#C9922A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  actionBtnPressed: {
    opacity: 0.85,
  },
  actionBtnText: {
    color: '#000',
    fontFamily: 'Manrope',
    fontSize: 9.5,
    fontWeight: '800',
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    marginHorizontal: 3,
  },
  activeDot: {
    width: 10,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#C9922A',
  },
});
