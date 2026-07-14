import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from 'react-native';

import {
    footerNavItems,
    HomeProduct,
} from '@/app/data/home';
import { ApiService } from '@/app/services/apiService';
import { useFavorites } from '@/components/home/FavoritesContext';
import { HomeFooter } from '@/components/home/HomeFooter';
import { HOME_HORIZONTAL_PADDING } from '@/components/home/layout';
import { ProductCard } from '@/components/home/ProductCard';

export const options = {
  headerShown: false,
};

export default function CategoryScreen() {
  const router = useRouter();
  const { categoryId } = useLocalSearchParams<{ categoryId?: string }>();
  const { width: windowWidth } = useWindowDimensions();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [categoryName, setCategoryName] = useState('Category');
  const [products, setProducts] = useState<HomeProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const footerItems = useMemo(() => footerNavItems, []);

  useEffect(() => {
    let active = true;
    if (!categoryId) {
      setLoading(false);
      return;
    }

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

    const loadCategoryData = async () => {
      try {
        setLoading(true);
        const [categoryRes, productsRes] = await Promise.all([
          ApiService.getCategoryById(categoryId),
          ApiService.getProductsByCategoryId(categoryId),
        ]);

        if (!active) return;

        if (categoryRes.success && categoryRes.data) {
          setCategoryName(categoryRes.data.name || 'Category');
        }

        let rawProducts: any[] = [];
        if (productsRes.success && productsRes.data) {
          if (Array.isArray(productsRes.data)) {
            rawProducts = productsRes.data;
          } else if (productsRes.data && Array.isArray(productsRes.data.items)) {
            rawProducts = productsRes.data.items;
          }
        }

        const mappedProducts = rawProducts.map(mapApiProduct);

        // Cache mapped products for Details Screen lookup
        ApiService.cacheProducts(mappedProducts);

        setProducts(mappedProducts);
      } catch (error) {
        console.error('Error loading category data:', error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadCategoryData();

    return () => {
      active = false;
    };
  }, [categoryId]);

  const title = categoryName;

  const gridGap = 12;
  const availableWidth = windowWidth - HOME_HORIZONTAL_PADDING * 2;
  const cardWidth = Math.floor((availableWidth - gridGap) / 2);

  const handleFooterSelect = (itemId: string) => {
    if (itemId === 'home') {
      router.replace('/screens/HomeScreen');
    }

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

  const handleProductPress = (product: HomeProduct) => {
    router.push({
      pathname: '/screens/ProductDetailsScreen',
      params: { productId: product.id },
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#C9922A" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.page}>
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={10}
          >
            <Ionicons name="chevron-back" size={18} color="#D4AF37" />
          </Pressable>

          <Text style={styles.headerTitle} allowFontScaling={false}>
            {title}
          </Text>

          <Pressable style={styles.filterButton} hitSlop={10}>
            <Ionicons name="filter" size={18} color="#D4AF37" />
          </Pressable>
        </View>

        <View style={styles.divider} />

        <ScrollView
          style={styles.contentScroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {products.length === 0 ? (
            <View style={styles.noProductsContainer}>
              <Text style={styles.noProductsText} allowFontScaling={false}>
                No products found in this category
              </Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {products.map(product => (
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
          )}
        </ScrollView>

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
    marginTop: 30,
  },
  page: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    height: 41,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 17,
    width: 28,
    height: 28,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  filterButton: {
    position: 'absolute',
    right: 17,
    width: 28,
    height: 28,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 23,
    fontWeight: '700',
    lineHeight: 20,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#2A2A2A',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 3,
    elevation: 4,
  },
  contentScroll: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    paddingTop: 38,
    paddingHorizontal: HOME_HORIZONTAL_PADDING,
    paddingBottom: 102,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  noProductsContainer: {
    flex: 1,
    paddingVertical: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noProductsText: {
    color: '#8A8A8F',
    fontFamily: 'Manrope',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});
