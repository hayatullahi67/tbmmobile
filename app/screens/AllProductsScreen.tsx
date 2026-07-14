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
import { useFavorites } from '@/components/home/FavoritesContext';
import { HomeProduct, footerNavItems } from '@/app/data/home';
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

  const [products, setProducts] = useState<HomeProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');

  // Pagination states
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const footerItems = useMemo(() => footerNavItems, []);

  const mapApiProduct = (item: any): HomeProduct => {
    return {
      id: item.id,
      name: item.name,
      price: item.priceDisplay || (item.price != null ? `₦${Number(item.price).toLocaleString()}` : 'Request Price'),
      image: { uri: item.primaryImageUrl || 'https://via.placeholder.com/300/252523/ffffff?text=No+Image' },
      description: item.description || item.shortDescription || 'No description available.',
      review: 'Highly recommended by verified buyers for build quality.',
      availability: item.inStock ? 'In stock - Limited units available' : 'Out of stock',
      delivery: '15 days after payment confirmation',
      colors: item.color ? [item.color] : ['#C9922A', '#E8E8E8', '#1A1A1A'],
    };
  };

  const fetchProducts = async (pageToLoad: number, append: boolean = false) => {
    try {
      if (pageToLoad === 1 && !refreshing) setLoading(true);
      
      const res = await ApiService.getAllProducts(pageToLoad, 12);
      
      let rawItems: any[] = [];
      let totalPages = 1;
      
      if (res && res.success && res.data) {
        rawItems = res.data.items || [];
        totalPages = res.data.totalPages || 1;
      } else if (res && res.data) {
        rawItems = res.data.items || res.data || [];
        totalPages = res.data.totalPages || 1;
      }

      const mapped = rawItems.map(mapApiProduct);
      
      // Cache products for ProductDetail lookup
      ApiService.cacheProducts(mapped);

      if (append) {
        setProducts(prev => [...prev, ...mapped]);
      } else {
        setProducts(mapped);
      }

      setHasMore(pageToLoad < totalPages);
    } catch (err) {
      console.error('Failed to load products list:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchProducts(1, false);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchProducts(1, false);
  };

  const handleLoadMore = () => {
    if (hasMore && !loadingMore && !loading) {
      setLoadingMore(true);
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProducts(nextPage, true);
    }
  };

  const filteredProducts = useMemo(() => {
    if (!searchText.trim()) return products;
    const query = searchText.toLowerCase();
    return products.filter(
      p => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query)
    );
  }, [products, searchText]);

  const handleProductPress = (product: HomeProduct) => {
    router.push({
      pathname: '/screens/ProductDetailsScreen',
      params: { productId: product.id },
    });
  };

  const handleFooterSelect = (itemId: string) => {
    if (itemId === 'home') router.push('/screens/HomeScreen');
    if (itemId === 'cart') router.push('/screens/CartScreen');
    if (itemId === 'favorite') router.push('/screens/FavoriteScreen');
    if (itemId === 'profile') router.push('/screens/ProfileScreen');
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
                      onFavoritePress={() => toggleFavorite(product.id)}
                    />
                  ))}
                </View>

                {hasMore && !searchText && (
                  <Pressable
                    style={({ pressed }) => [styles.loadMoreButton, pressed && styles.loadMorePressed]}
                    onPress={handleLoadMore}
                    disabled={loadingMore}
                  >
                    {loadingMore ? (
                      <ActivityIndicator size="small" color="#C9922A" />
                    ) : (
                      <Text style={styles.loadMoreText} allowFontScaling={false}>
                        Load More Products
                      </Text>
                    )}
                  </Pressable>
                )}
              </>
            )}
          </ScrollView>
        )}

        <HomeFooter
          items={footerItems}
          activeItemId="home"
          onSelectItem={handleFooterSelect}
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
