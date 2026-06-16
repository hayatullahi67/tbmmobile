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

function ProductCardComponent({
  product,
  width = 160,
  isFavorite = false,
  actionVariant = 'favorite',
  onPress,
  onFavoritePress,
}: ProductCardProps) {
  const scale = width / 160;
  const cardHeight = 122 * scale;
  const imageOffset = 8 * scale;
  const imageTop = -17 * scale;
  const imageHeight = 93.73 * scale;
  const detailsHeight = 100 * scale;
  const actionButtonSize = 18 * scale;
  const actionIconSize = Math.max(9, 10 * scale);
  const actionIconName =
    actionVariant === 'delete'
      ? 'trash-outline'
      : isFavorite
        ? 'heart'
        : 'heart-outline';
  const actionIconColor =
    actionVariant === 'delete' || isFavorite ? '#C9922A' : '#FFFFFF';

  return (
    <Pressable
      onPress={() => onPress?.(product)}
      style={({ pressed }) => [
        styles.card,
        {
          width,
          height: cardHeight,
        },
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.detailsPanel, { width, height: detailsHeight }]}>
        <Text style={styles.name} numberOfLines={1} allowFontScaling={false}>
          {product.name}
        </Text>
        <Text style={styles.price} numberOfLines={1} allowFontScaling={false}>
          {product.price}
        </Text>
      </View>

      <View
        style={[
          styles.imagePanel,
          {
            top: imageTop,
            left: imageOffset,
            width: width - imageOffset * 2,
            height: imageHeight,
          },
        ]}
      >
        <Image source={product.image} style={styles.productImage} contentFit="cover" />
        <Pressable
          onPress={event => {
            event.stopPropagation();
            onFavoritePress?.(product);
          }}
          style={[
            styles.favoriteButton,
            {
              width: actionButtonSize,
              height: actionButtonSize,
              borderRadius: actionButtonSize / 2,
            },
          ]}
          hitSlop={8}
        >
          <Ionicons
            name={actionIconName}
            size={actionIconSize}
            color={actionIconColor}
          />
        </Pressable>
      </View>
    </Pressable>
  );
}

export const ProductCard = memo(ProductCardComponent);

const styles = StyleSheet.create({
  card: {
    marginBottom: 19,
    // marginTop:13,
  },
  imagePanel: {
    position: 'absolute',
    top: -17,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#252523',
    zIndex: 2,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(37, 37, 35, 0.78)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsPanel: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    borderRadius: 8,
    backgroundColor: '#252523',
    justifyContent: 'flex-end',
    paddingHorizontal: 9,
    paddingBottom: 8,
  },
  name: {
    color: '#AAAAAA',
    fontFamily: 'Manrope',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 12,
  },
  price: {
    color: '#C9922A',
    fontFamily: 'Manrope',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 13,
    marginTop: 3,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },
});
