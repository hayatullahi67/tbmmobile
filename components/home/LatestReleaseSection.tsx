import { memo } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { HomeProduct } from '@/app/data/home';
import { ProductCard } from '@/components/home/ProductCard';

type LatestReleaseSectionProps = {
  products: HomeProduct[];
  horizontalPadding?: number;
  title?: string;
  showSeeAll?: boolean;
  isProductFavorite?: (productId: string) => boolean;
  onSeeAllPress?: () => void;
  onProductPress?: (product: HomeProduct) => void;
  onFavoritePress?: (product: HomeProduct) => void;
};

function LatestReleaseSectionComponent({
  products,
  horizontalPadding = 23,
  title = 'Latest Release',
  showSeeAll = true,
  isProductFavorite,
  onSeeAllPress,
  onProductPress,
  onFavoritePress,
}: LatestReleaseSectionProps) {
  const { width: windowWidth } = useWindowDimensions();
  const gridGap = 12;
  const availableWidth = windowWidth - horizontalPadding * 2;
  const cardWidth = Math.floor((availableWidth - gridGap) / 2);

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title} allowFontScaling={false}>
          {title}
        </Text>
        {showSeeAll && (
          <Pressable onPress={onSeeAllPress} hitSlop={8}>
            <Text style={styles.seeAll} allowFontScaling={false}>
              See all  →
            </Text>
          </Pressable>
        )}
      </View>

      <View style={styles.grid}>
        {products.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            width={cardWidth}
            isFavorite={isProductFavorite?.(product.id)}
            onPress={onProductPress}
            onFavoritePress={onFavoritePress}
          />
        ))}
      </View>
    </View>
  );
}

export const LatestReleaseSection = memo(LatestReleaseSectionComponent);

const styles = StyleSheet.create({
  section: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  title: {
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 18, 
    marginBottom:26,
  },
  seeAll: {
    color: '#C9922A',
    fontFamily: 'Manrope',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 11,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
  },
});
