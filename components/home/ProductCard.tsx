import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { HomeProduct } from '@/app/data/home';

type ProductCardProps = {
  product: HomeProduct;
  width?: number;
  isFavorite?: boolean;
  actionVariant?: 'favorite' | 'delete';
  onPress?: (product: HomeProduct) => void;
  onFavoritePress?: (product: HomeProduct) => void;
};

const GOLD = '#C9922A';

function ProductCardComponent({
  product,
  width = 160,
  isFavorite = false,
  actionVariant = 'favorite',
  onPress,
  onFavoritePress,
}: ProductCardProps) {
  const actionIconName =
    actionVariant === 'delete'
      ? 'trash-outline'
      : isFavorite
        ? 'heart'
        : 'heart-outline';
  
  const actionIconColor =
    actionVariant === 'delete' ? GOLD : isFavorite ? GOLD : '#FFFFFF';

  return (
    <Pressable
      onPress={() => onPress?.(product)}
      style={({ pressed }) => [
        styles.card,
        { width },
        pressed && styles.pressed,
      ]}
    >
      {/* Image Panel */}
      <View style={styles.imagePanel}>
        <Image source={product.image} style={styles.productImage} contentFit="cover" />
        
        {/* Favorite Icon overlay */}
        <Pressable
          onPress={event => {
            event.stopPropagation();
            onFavoritePress?.(product);
          }}
          style={styles.favoriteButton}
          hitSlop={8}
        >
          <Ionicons
            name={actionIconName}
            size={14}
            color={actionIconColor}
          />
        </Pressable>
      </View>

      {/* Details Panel */}
      <View style={styles.detailsPanel}>
        <Text style={styles.name} numberOfLines={1} allowFontScaling={false}>
          {product.name}
        </Text>
        <Text style={styles.price} numberOfLines={1} allowFontScaling={false}>
          {product.price}
        </Text>
        {product.availability ? (
          <Text style={styles.status} numberOfLines={1} allowFontScaling={false}>
            {product.availability}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

export const ProductCard = memo(ProductCardComponent);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#121217',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1C1C24',
    height: 205,
    marginBottom: 12,
  },
  imagePanel: {
    width: '100%',
    height: 125,
    backgroundColor: '#1E1E24',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  detailsPanel: {
    padding: 10,
    justifyContent: 'center',
    gap: 2,
  },
  name: {
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 16,
  },
  price: {
    color: GOLD,
    fontFamily: 'Manrope',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 15,
  },
  status: {
    color: 'rgba(255,255,255,0.35)',
    fontFamily: 'Manrope',
    fontSize: 9,
    lineHeight: 11,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },
});
