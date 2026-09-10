import React, { useState, useEffect, useMemo } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  TextInput,
  ActivityIndicator,
  useWindowDimensions,
  Platform,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ApiService } from '@/app/services/apiService';
import { TokenService } from '@/app/services/tokenService';
import FeedbackModal from '@/components/FeedbackModal';
import { useFavorites } from '@/components/home/FavoritesContext';
import { HomeProduct, footerNavItems, mapApiProduct } from '@/app/data/home';
import { ProductCard } from '@/components/home/ProductCard';
import { HOME_HORIZONTAL_PADDING } from '@/components/home/layout';
import { HomeFooter } from '@/components/home/HomeFooter';

export const options = {
  headerShown: false,
};

export default function AllProductsScreen() {
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [allProductsPool, setAllProductsPool] = useState<HomeProduct[]>([]);
  const [displayLimit, setDisplayLimit] = useState(30);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');

  const footerItems = useMemo(() => footerNavItems, []);

  const fetchProducts = async () => {
    try {
      if (!refreshing) setLoading(true);
      
      const res = await ApiService.getAllProducts(1, 250);
      
      let rawItems: any[] = [];
      
      if (res && res.success && res.data) {
        rawItems = res.data.items || [];
      } else if (res && res.data) {
        rawItems = res.data.items || res.data || [];
      }

      const mapped = rawItems.map(mapApiProduct);
      
      // Cache products for ProductDetail lookup
      ApiService.cacheProducts(mapped);

      // Globally separate products with valid HTTP image URLs from those without
      const withImages = mapped.filter(p => {
        const img = p.image;
        const uri = typeof img === 'object' && img !== null && 'uri' in img ? img.uri : '';
        return typeof uri === 'string' && uri.trim().startsWith('http');
      });

      const withoutImages = mapped.filter(p => {
        const img = p.image;
        const uri = typeof img === 'object' && img !== null && 'uri' in img ? img.uri : '';
        return !(typeof uri === 'string' && uri.trim().startsWith('http'));
      });

      // Merge globally: products with images always come first
      const finalPool = [...withImages, ...withoutImages];
      setAllProductsPool(finalPool);
      setDisplayLimit(30);
    } catch (err) {
      console.error('Failed to load products list:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  const filteredPool = useMemo(() => {
    if (!searchText.trim()) return allProductsPool;
    const query = searchText.toLowerCase();
    return allProductsPool.filter(
      p => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query)
    );
  }, [allProductsPool, searchText]);

  const filteredProducts = useMemo(() => {
    return filteredPool.slice(0, displayLimit);
  }, [filteredPool, displayLimit]);

  const hasMore = useMemo(() => {
    return displayLimit < filteredPool.length;
  }, [filteredPool, displayLimit]);

  const handleLoadMore = () => {
    setDisplayLimit(prev => prev + 30);
  };

  const handleProductPress = (product: HomeProduct) => {
    router.push({
      pathname: '/screens/ProductDetailsScreen',
      params: { productId: product.id },
    });
  };

  const handleFooterSelect = async (itemId: string) => {
    if (itemId === 'home') {
      router.push('/screens/HomeScreen');
      return;
    }

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

  const handleFavoritePress = async (productId: string) => {
    const token = await TokenService.getAccessToken();
    if (!token) {
      setShowAuthModal(true);
      return;
    }
    toggleFavorite(productId);
  };

  // 2-column layout width calculation
  const gridGap = 16;
  const availableWidth = windowWidth - HOME_HORIZONTAL_PADDING * 2;
  const cardWidth = Math.floor((availableWidth - gridGap) / 2);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.page}>
        {/* ── HEADER ── */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#C9922A" />
          </Pressable>
          <Text style={styles.headerTitle} allowFontScaling={false}>
            All Products
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* ── SEARCH BAR ── */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={18} color="#8E8E93" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search matching catalog products..."
            placeholderTextColor="#555555"
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText !== '' && (
            <Pressable onPress={() => setSearchText('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={16} color="#8E8E93" />
            </Pressable>
          )}
        </View>

        {/* ── CONTENT ── */}
        {loading ? (
          <View style={[styles.centerContainer, { flex: 1 }]}>
            <ActivityIndicator size="large" color="#C9922A" />
          </View>
        ) : (
          <ScrollView
            style={styles.contentScroll}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor="#C9922A"
                colors={['#C9922A']}
              />
            }
          >
            {filteredProducts.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="cube-outline" size={64} color="#333333" style={{ marginBottom: 16 }} />
                <Text style={styles.emptyText} allowFontScaling={false}>
                  No products found
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.grid}>
                  {filteredProducts.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      width={cardWidth}
                      isFavorite={isFavorite(product.id)}
                      onPress={handleProductPress}
                      onFavoritePress={() => handleFavoritePress(product.id)}
                    />
                  ))}
                </View>

                {hasMore && !searchText && (
                  <Pressable
                    style={({ pressed }) => [styles.loadMoreButton, pressed && styles.loadMorePressed]}
                    onPress={handleLoadMore}
                  >
                    <Text style={styles.loadMoreText} allowFontScaling={false}>
                      Load More Products
                    </Text>
                  </Pressable>
                )}
              </>
            )}
          </ScrollView>
        )}

        <HomeFooter
          items={footerItems}
          activeItemId=""
          onSelectItem={handleFooterSelect}
        />

        <FeedbackModal
          visible={showAuthModal}
          type="info"
          title="Authentication Required"
          message="Please log in or create an account to manage your cart, save favorites, or view your dashboard."
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
    backgroundColor: '#000000',
  },
  page: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#111111',
    marginTop: Platform.OS === 'android' ? 12 : 4,
  },
  backButton: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: '#1D1D1D',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 17,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F0F0F',
    borderWidth: 1,
    borderColor: '#1D1D1D',
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    height: 46,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 13,
  },
  clearButton: {
    padding: 4,
  },
  contentScroll: {
    flex: 1,
  },
  content: {
    paddingTop: 16,
    paddingHorizontal: HOME_HORIZONTAL_PADDING,
    paddingBottom: 110,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 120,
  },
  emptyText: {
    color: '#8E8E93',
    fontFamily: 'Manrope',
    fontSize: 14,
    fontWeight: '500',
  },
  loadMoreButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#C9922A',
    borderRadius: 12,
    height: 48,
    marginTop: 30,
    backgroundColor: '#0A0A0A',
  },
  loadMorePressed: {
    backgroundColor: 'rgba(201, 146, 42, 0.1)',
  },
  loadMoreText: {
    color: '#C9922A',
    fontFamily: 'Manrope',
    fontSize: 13,
    fontWeight: '700',
  },
});
