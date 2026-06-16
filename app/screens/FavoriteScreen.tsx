import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { footerNavItems, HomeProduct, latestReleaseProducts } from '@/app/data/home';
import { useFavorites } from '@/components/home/FavoritesContext';
import { HomeFooter } from '@/components/home/HomeFooter';
import { HOME_HORIZONTAL_PADDING } from '@/components/home/layout';
import { ProductCard } from '@/components/home/ProductCard';

export const options = {
  headerShown: false,
};

export default function FavoriteScreen() {
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();
  const { favoriteIds, isFavorite, toggleFavorite } = useFavorites();
  const gridGap = 12;
  const availableWidth = windowWidth - HOME_HORIZONTAL_PADDING * 2;
  const cardWidth = Math.floor((availableWidth - gridGap) / 2);

  const favoriteProducts = useMemo(
    () => latestReleaseProducts.filter(product => favoriteIds.includes(product.id)),
    [favoriteIds]
  );

  const footerItems = useMemo(() => footerNavItems, []);

  const handleFooterSelect = (itemId: string) => {
    if (itemId === 'home') {
      router.replace('/screens/HomeScreen');
    }

    if (itemId === 'cart') {
      router.push('/screens/CartScreen');
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.page}>
        <View style={styles.header}>
          <Pressable
            onPress={() => router.replace('/screens/HomeScreen')}
            style={styles.backButton}
            hitSlop={10}
          >
            <Ionicons name="chevron-back" size={18} color="#D4AF37" />
          </Pressable>

          <Text style={styles.headerTitle} allowFontScaling={false}>
            Favorite
          </Text>
        </View>

        <View style={styles.divider} />

        <ScrollView
          style={styles.contentScroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.grid}>
            {favoriteProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                width={cardWidth}
                isFavorite={isFavorite(product.id)}
                actionVariant="delete"
                onPress={handleProductPress}
                onFavoritePress={() => toggleFavorite(product.id)}
              />
            ))}
          </View>
        </ScrollView>

        <HomeFooter
          items={footerItems}
          activeItemId="favorite"
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
    marginTop:30,
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
  headerTitle: {
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 16,
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
});
