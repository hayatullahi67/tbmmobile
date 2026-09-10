import React, { useCallback, useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TokenService } from '@/app/services/tokenService';
import FeedbackModal from '@/components/FeedbackModal';
import { useFavorites } from '@/components/home/FavoritesContext';
import { HomeFooter } from '@/components/home/HomeFooter';
import { HomeHero } from '@/components/home/HomeHero';
import { ProductCard } from '@/components/home/ProductCard';
import { footerNavItems, HomeProduct, mapApiProduct } from '@/app/data/home';
import { ApiService } from '@/app/services/apiService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GOLD = '#C9922A';

export const options = {
  headerShown: false,
};

export default function HomeScreen() {
  const router = useRouter();
  const { isFavorite, toggleFavorite, refreshFavorites } = useFavorites();
  const [searchValue, setSearchValue] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const [vanityProducts, setVanityProducts] = useState<HomeProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeaturedVanities = async () => {
    try {
      setLoading(true);
      const res = await ApiService.getAllProducts(1, 50);
      if (res && res.success && res.data) {
        const rawItems = res.data.items || res.data || [];

        // Prioritize sorting products with valid HTTP image URLs first
        const sortedItems = [...rawItems].sort((a, b) => {
          const aUrl = a.primaryImageUrl || a.imageUrl || a.image;
          const bUrl = b.primaryImageUrl || b.imageUrl || b.image;
          const aHas = typeof aUrl === 'string' && aUrl.trim().startsWith('http');
          const bHas = typeof bUrl === 'string' && bUrl.trim().startsWith('http');
          if (aHas && !bHas) return -1;
          if (!aHas && bHas) return 1;
          return 0;
        });

        const mapped = sortedItems.map(mapApiProduct);
        
        // Cache products for Details Lookup
        ApiService.cacheProducts(mapped);

        // Filter products by vanity or cabinet name keywords
        let vanities = mapped.filter(
          p => p.name.toLowerCase().includes('vanity') || 
               p.name.toLowerCase().includes('cabinet') || 
               p.name.toLowerCase().includes('mirror')
        );

        // Fallback in case database doesn't have vanities
        if (vanities.length === 0) {
          vanities = mapped;
        }

        // Display the top 6 vanity products (which naturally puts products with images first)
        setVanityProducts(vanities.slice(0, 8));
      }
    } catch (err) {
      console.error('Failed to load featured products from API:', err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      refreshFavorites();
      fetchFeaturedVanities();
    }, [refreshFavorites])
  );

  const filteredVanities = useMemo(() => {
    if (!searchValue.trim()) return vanityProducts;
    const query = searchValue.toLowerCase();
    return vanityProducts.filter(
      p => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query)
    );
  }, [vanityProducts, searchValue]);

  const handleFooterSelect = async (itemId: string) => {
    if (itemId === 'home') return;

    const token = await TokenService.getAccessToken();
    if (!token) {
      setShowAuthModal(true);
      return;
    }

    if (itemId === 'favorite') {
      router.push('/screens/FavoriteScreen');
    }
    if (itemId === 'projects') {
      router.push('/screens/MyProjectsScreen');
    }
    if (itemId === 'cart') {
      router.push('/screens/CartScreen');
    }
    if (itemId === 'profile') {
      router.push('/screens/ProfileScreen');
    }
  };

  const handleToolPress = async (toolId: string) => {
    if (toolId === 'design') {
      router.push('/screens/ziora-ai/ZioraHomeScreen');
      return;
    }
    if (toolId === 'estimate') {
      router.push('/screens/ziora-ai/CreateEstimateScreen');
      return;
    }

    const token = await TokenService.getAccessToken();
    if (!token) {
      setShowAuthModal(true);
      return;
    }

    if (toolId === 'consultation') {
      router.push('/screens/ziora-ai/BookConsultationScreen');
    }
    if (toolId === 'projects') {
      router.push('/screens/MyProjectsScreen');
    }
  };

  const handleFavoritePress = async (product: HomeProduct) => {
    const token = await TokenService.getAccessToken();
    if (!token) {
      setShowAuthModal(true);
      return;
    }
    toggleFavorite(product.id);
  };

  const handleProductPress = (product: HomeProduct) => {
    router.push({
      pathname: '/screens/ProductDetailsScreen',
      params: { productId: product.id },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.page}>
        
        {/* ── TOP HEADER ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle} allowFontScaling={false}>ZIORA</Text>
            <Text style={styles.headerSubtitle} allowFontScaling={false}>Powered by TBM Building Services</Text>
          </View>
          <View style={styles.headerIcons}>
            <Pressable style={styles.headerIcon} onPress={() => alert('No new notifications')}>
              <Ionicons name="notifications-outline" size={22} color="#FFFFFF" />
            </Pressable>
            <Pressable style={styles.headerIcon} onPress={() => handleFooterSelect('profile')}>
              <Ionicons name="person-circle-outline" size={24} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>

        {/* ── CONTENT SCROLL ── */}
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* ── SEARCH & SPLIT HERO SECTION (HomeHero Component) ── */}
          <HomeHero
            searchValue={searchValue}
            onSearchChange={setSearchValue}
          />

          {/* ── RENOVATION TOOLS SECTION ── */}
          <Text style={styles.sectionTitle} allowFontScaling={false}>Renovation Tools</Text>
          <View style={styles.toolsRow}>
            {/* AI Design Tool */}
            <Pressable style={styles.toolCol} onPress={() => handleToolPress('design')}>
              <View style={styles.toolCircle}>
                <Ionicons name="cube-outline" size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.toolLabel} allowFontScaling={false}>AI Design</Text>
            </Pressable>

            {/* Estimate Tool */}
            <Pressable style={styles.toolCol} onPress={() => handleToolPress('estimate')}>
              <View style={styles.toolCircle}>
                <Ionicons name="calculator-outline" size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.toolLabel} allowFontScaling={false}>Estimate</Text>
            </Pressable>

            {/* Consultation Tool (Active/Gold border in mockup) */}
            <Pressable style={styles.toolCol} onPress={() => handleToolPress('consultation')}>
              <View style={[styles.toolCircle, styles.toolCircleActive]}>
                <Ionicons name="person-outline" size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.toolLabel} allowFontScaling={false}>Consultation</Text>
            </Pressable>

            {/* Projects Tool */}
            <Pressable style={styles.toolCol} onPress={() => handleToolPress('projects')}>
              <View style={styles.toolCircle}>
                <Ionicons name="folder-open-outline" size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.toolLabel} allowFontScaling={false}>Projects</Text>
            </Pressable>
          </View>

          {/* ── FEATURED BOGAT VANITIES SECTION ── */}
          <View style={styles.galleryHeader}>
            <Text style={styles.sectionTitle} allowFontScaling={false}>Featured Vanities by BOGAT</Text>
            <Pressable style={styles.viewAllBtn} onPress={() => router.push('/screens/AllProductsScreen')}>
              <Text style={styles.viewAllText} allowFontScaling={false}>View All</Text>
              <Ionicons name="arrow-forward" size={14} color={GOLD} />
            </Pressable>
          </View>

          {loading ? (
            <ActivityIndicator color={GOLD} style={{ marginTop: 24 }} size="small" />
          ) : filteredVanities.length === 0 ? (
            <Text style={styles.emptyText} allowFontScaling={false}>No products found</Text>
          ) : (
            <View style={styles.vanityGrid}>
              {filteredVanities.slice(0, 6).map(item => (
                <ProductCard
                  key={item.id}
                  product={item}
                  width={(SCREEN_WIDTH - 52) / 2}
                  isFavorite={isFavorite(item.id)}
                  onPress={handleProductPress}
                  onFavoritePress={handleFavoritePress}
                />
              ))}
            </View>
          )}

          {/* ── TBM CONSULTATION BANNER ── */}
          <Pressable 
            style={styles.consultationBanner} 
            onPress={() => handleToolPress('consultation')}
          >
            <View style={styles.bannerLeft}>
              <Ionicons name="calendar-outline" size={20} color={GOLD} style={styles.calendarIcon} />
              <Text style={styles.bannerText} allowFontScaling={false}>Book a TBM Consultation</Text>
            </View>
            <View style={styles.bannerRight}>
              <Text style={styles.bannerActionText} allowFontScaling={false}>Book Now</Text>
              <Ionicons name="arrow-forward" size={14} color={GOLD} />
            </View>
          </Pressable>

        </ScrollView>

        {/* ── FOOTER NAVIGATION ── */}
        <HomeFooter
          items={footerNavItems}
          activeItemId="home"
          onSelectItem={handleFooterSelect}
        />

        {/* --- Authentication Required Modal --- */}
        <FeedbackModal
          visible={showAuthModal}
          type="info"
          title="Authentication Required"
          message="Please log in or create an account to manage your projects, schedule consultations, or save vanity products."
          buttonText="Log In"
          secondaryButtonText="Cancel"
          onClose={() => setShowAuthModal(false)}
          onConfirm={() => {
            setShowAuthModal(false);
            router.push('/screens/LoginScreen');
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#07070A',
    marginTop:27,
  },
  page: {
    flex: 1,
    backgroundColor: '#07070A',
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1F',
    backgroundColor: '#07070A',
  },
  headerTitle: {
    color: GOLD,
    fontFamily: 'Manrope',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 9,
    fontFamily: 'Manrope',
    marginTop: 1,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  headerIcon: {
    padding: 2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 95,
  },

  // ── Renovation Tools grid ──
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Manrope',
    marginTop: 22,
  },
  toolsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  toolCol: {
    alignItems: 'center',
    width: (SCREEN_WIDTH - 40) / 4,
  },
  toolCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1.2,
    borderColor: '#24242B',
    backgroundColor: '#0F0F13',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolCircleActive: {
    borderColor: GOLD,
  },
  toolLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontFamily: 'Manrope',
    marginTop: 8,
    textAlign: 'center',
  },

  // ── Gallery header ──
  galleryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 22,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    color: GOLD,
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Manrope',
  },
  emptyText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 20,
  },

  // ── Vanity grid ──
  vanityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 14,
    rowGap: 14,
  },

  // ── Consultation Banner ──
  consultationBanner: {
    height: 48,
    backgroundColor: '#121217',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(201,146,42,0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    marginTop: 20,
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  calendarIcon: {
    marginTop: -1,
  },
  bannerText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Manrope',
  },
  bannerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bannerActionText: {
    color: GOLD,
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'Manrope',
  },
});
