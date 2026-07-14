import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  footerNavItems,
  HomeCategory,
  HomeProduct,
} from '@/app/data/home';
import { ApiService } from '@/app/services/apiService';
import { CategorySection } from '@/components/home/CategorySection';
import { useFavorites } from '@/components/home/FavoritesContext';
import { FloatingZioraButton } from '@/components/home/FloatingZioraButton';
import { HomeFooter } from '@/components/home/HomeFooter';
import { HomeHero } from '@/components/home/HomeHero';
import { LatestReleaseSection } from '@/components/home/LatestReleaseSection';
import { HOME_HORIZONTAL_PADDING } from '@/components/home/layout';
import { VirtualShowroomBanner } from '@/components/home/VirtualShowroomBanner';

export const options = {
  headerShown: false,
};

export default function HomeScreen() {
  const router = useRouter();
  const { isFavorite, toggleFavorite, refreshFavorites } = useFavorites();
  const [searchValue, setSearchValue] = useState('');
  const [activeCategoryId, setActiveCategoryId] = useState('');

  useFocusEffect(
    useCallback(() => {
      refreshFavorites();
    }, [refreshFavorites])
  );
  const [categories, setCategories] = useState<HomeCategory[]>([]);
  const [latestProducts, setLatestProducts] = useState<HomeProduct[]>([]);
  const [secondLatestProducts, setSecondLatestProducts] = useState<HomeProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const footerItems = useMemo(() => footerNavItems, []);

  useEffect(() => {
    let active = true;

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

    const loadData = async () => {
      try {
        const [categoriesRes, latestRes, secondRes] = await Promise.all([
          ApiService.getCategories(),
          ApiService.getFeaturedProducts(10),
          ApiService.getFeaturedProducts(4),
        ]);

        if (!active) return;

        const mappedCats: HomeCategory[] = [];
        if (categoriesRes.success && categoriesRes.data) {
          categoriesRes.data.forEach((cat: any) => {
            mappedCats.push({
              id: cat.id,
              label: cat.name,
              icon: { uri: cat.imageUrl || 'https://via.placeholder.com/50/252523/ffffff?text=Icon' },
            });
          });
        }

        setCategories(mappedCats);
        if (mappedCats.length > 0) {
          setActiveCategoryId(mappedCats[0].id);
        }

        const rawP1 = latestRes.success && latestRes.data ? latestRes.data : [];
        const rawP2 = secondRes.success && secondRes.data ? secondRes.data : [];

        const mappedP1 = rawP1.map(mapApiProduct);
        const mappedP2 = rawP2.map(mapApiProduct);

        // Cache mapped products for seamless retrieve in details view
        ApiService.cacheProducts([...mappedP1, ...mappedP2]);

        setLatestProducts(mappedP1);
        setSecondLatestProducts(mappedP2);
      } catch (error) {
        console.error('Error loading home screen data:', error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, []);

  const filteredLatestProducts = useMemo(() => {
    if (!searchValue.trim()) return latestProducts;
    const query = searchValue.toLowerCase();
    return latestProducts.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.description.toLowerCase().includes(query)
    );
  }, [latestProducts, searchValue]);

  const filteredSecondLatestProducts = useMemo(() => {
    if (!searchValue.trim()) return secondLatestProducts;
    const query = searchValue.toLowerCase();
    return secondLatestProducts.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.description.toLowerCase().includes(query)
    );
  }, [secondLatestProducts, searchValue]);

  const handleFooterSelect = (itemId: string) => {
    if (itemId === 'cart') {
      router.push('/screens/CartScreen');
    }

    if (itemId === 'favorite') {
      router.push('/screens/FavoriteScreen');
    }

    if (itemId === 'profile') {
      router.push('/screens/ProfileScreen');
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    setActiveCategoryId(categoryId);
    router.push({
      pathname: '/screens/CategoryScreen',
      params: { categoryId },
    });
  };

  const handleProductPress = (product: HomeProduct) => {
    router.push({
      pathname: '/screens/ProductDetailsScreen',
      params: { productId: product.id },
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#C9922A" />
        </View>
      </SafeAreaView>
    );
  }

  const isSearchEmpty = searchValue.trim() !== '' && filteredLatestProducts.length === 0 && filteredSecondLatestProducts.length === 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.page}>
        <HomeHero
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          horizontalPadding={HOME_HORIZONTAL_PADDING}
        />

        <ScrollView
          style={styles.contentScroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <CategorySection
            categories={categories}
            activeCategoryId={activeCategoryId}
            onSelectCategory={handleCategorySelect}
          />

          {isSearchEmpty ? (
            <View style={styles.noResultsContainer}>
              <Text style={styles.noResultsText} allowFontScaling={false}>
                No products match "{searchValue}"
              </Text>
            </View>
          ) : (
            <>
              {filteredLatestProducts.length > 0 && (
                <LatestReleaseSection
                  products={filteredLatestProducts}
                  horizontalPadding={HOME_HORIZONTAL_PADDING}
                  isProductFavorite={isFavorite}
                  onProductPress={handleProductPress}
                  onFavoritePress={product => toggleFavorite(product.id)}
                  onSeeAllPress={() => router.push('/screens/AllProductsScreen')}
                />
              )}

              <VirtualShowroomBanner />

              {filteredSecondLatestProducts.length > 0 && (
                <LatestReleaseSection
                  products={filteredSecondLatestProducts}
                  horizontalPadding={HOME_HORIZONTAL_PADDING}
                  isProductFavorite={isFavorite}
                  onProductPress={handleProductPress}
                  onFavoritePress={product => toggleFavorite(product.id)}
                  onSeeAllPress={() => router.push('/screens/AllProductsScreen')}
                />
              )}
            </>
          )}
        </ScrollView>

        <FloatingZioraButton onPress={() => router.push('/screens/ziora-ai/ZioraHomeScreen')} />

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
    backgroundColor: '#07070A',
  },
  page: {
    flex: 1,
    backgroundColor: '#07070A',
  },
  contentScroll: {
    flex: 1,
    backgroundColor: '#000000',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -18,
  },
  content: {
    paddingHorizontal: HOME_HORIZONTAL_PADDING,
    paddingBottom: 102,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#07070A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResultsContainer: {
    paddingVertical: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noResultsText: {
    color: '#8A8A8F',
    fontFamily: 'Manrope',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});
