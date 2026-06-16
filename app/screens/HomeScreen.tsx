import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';

import {
    footerNavItems,
    homeCategories,
    HomeProduct,
    latestReleaseProducts,
} from '@/app/data/home';
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
  const { isFavorite, toggleFavorite } = useFavorites();
  const [searchValue, setSearchValue] = useState('');
  const [activeCategoryId, setActiveCategoryId] = useState(homeCategories[0].id);

  const categories = useMemo(() => homeCategories, []);
  const latestProducts = useMemo(() => latestReleaseProducts, []);
  const secondLatestProducts = useMemo(() => latestReleaseProducts.slice(2, 4), []);
  const footerItems = useMemo(() => footerNavItems, []);

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

          <LatestReleaseSection
            products={latestProducts}
            horizontalPadding={HOME_HORIZONTAL_PADDING}
            isProductFavorite={isFavorite}
            onProductPress={handleProductPress}
            onFavoritePress={product => toggleFavorite(product.id)}
          />

          <VirtualShowroomBanner />

          <LatestReleaseSection
            products={secondLatestProducts}
            horizontalPadding={HOME_HORIZONTAL_PADDING}
            isProductFavorite={isFavorite}
            onProductPress={handleProductPress}
            onFavoritePress={product => toggleFavorite(product.id)}
          />
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
});
