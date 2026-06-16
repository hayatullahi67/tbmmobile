import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { latestReleaseProducts } from '@/app/data/home';
import { useCart } from '@/components/home/CartContext';
import { useFavorites } from '@/components/home/FavoritesContext';
import { HOME_HORIZONTAL_PADDING } from '@/components/home/layout';

export const options = {
  headerShown: false,
};

export default function ProductDetailsScreen() {
  const router = useRouter();
  const { productId } = useLocalSearchParams<{ productId?: string }>();
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');
  const [quantity, setQuantity] = useState(1);

  const product = useMemo(
    () => latestReleaseProducts.find(item => item.id === productId) ?? latestReleaseProducts[0],
    [productId]
  );

  const isProductFavorite = isFavorite(product.id);
  const bodyText = activeTab === 'description' ? product.description : product.review;
  const decreaseQuantity = () => {
    setQuantity(currentQuantity => Math.max(1, currentQuantity - 1));
  };
  const increaseQuantity = () => {
    setQuantity(currentQuantity => currentQuantity + 1);
  };
  const handleAddToCart = () => {
    addToCart(product, quantity);
    router.push('/screens/CartScreen');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.page}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <Image source={product.image} style={styles.heroImage}  />
            {/* <View style={styles.heroOverlay} /> */}
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
              hitSlop={10}
            >
              <Ionicons name="arrow-back" size={16} color="#FFFFFF" />
            </Pressable>
          </View>

          <View style={styles.details}>
            <View style={styles.summaryRow}>
              <View style={styles.identity}>
                <Text style={styles.name} allowFontScaling={false}>
                  {product.name}
                </Text>
                <Text style={styles.price} allowFontScaling={false}>
                  {product.price}
                </Text>
                <View style={styles.colors}>
                  {product.colors.map(color => (
                    <View key={color} style={[styles.colorSwatch, { backgroundColor: color }]} />
                  ))}
                </View>
              </View>

              <View style={styles.actions}>
                <Pressable
                  onPress={() => toggleFavorite(product.id)}
                  style={styles.saveButton}
                  hitSlop={8}
                >
                  <Ionicons
                    name={isProductFavorite ? 'bookmark' : 'bookmark-outline'}
                    size={15}
                    color="white"
                  />
                </Pressable>

                <View style={styles.quantityRow}>
                  <Pressable
                    onPress={decreaseQuantity}
                    style={styles.quantityButton}
                    hitSlop={8}
                  >
                    <Ionicons name="remove-outline" size={14} color="#FFFFFF" />
                  </Pressable>
                  <Text style={styles.quantityText} allowFontScaling={false}>
                    {quantity}
                  </Text>
                  <Pressable
                    onPress={increaseQuantity}
                    style={styles.quantityButton}
                    hitSlop={8}
                  >
                    <Ionicons name="add-outline" size={14} color="#FFFFFF" />
                  </Pressable>
                </View>
              </View>
            </View>

            <View style={styles.tabs}>
              <Pressable
                onPress={() => setActiveTab('description')}
                style={[
                  styles.tabButton,
                  activeTab === 'description' && styles.activeTabButton,
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'description' && styles.activeTabText,
                  ]}
                  allowFontScaling={false}
                >
                  Description
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setActiveTab('reviews')}
                style={[
                  styles.tabButton,
                  activeTab === 'reviews' && styles.activeTabButton,
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'reviews' && styles.activeTabText,
                  ]}
                  allowFontScaling={false}
                >
                  Reviews
                </Text>
              </Pressable>
            </View>

            <Text style={styles.description} allowFontScaling={false}>
              {bodyText}
            </Text>

            <View style={styles.infoPanel}>
              <Text style={styles.infoText} allowFontScaling={false}>
                <Text style={styles.infoLabel}>Availability: </Text>
                {product.availability}
              </Text>
              <Text style={styles.infoText} allowFontScaling={false}>
                <Text style={styles.infoLabel}>Delivery: </Text>
                {product.delivery}
              </Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.bottomBar}>
          <Pressable
            onPress={handleAddToCart}
            style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
          >
            <Text style={styles.addButtonText} allowFontScaling={false}>
              Add to Cart
            </Text>
          </Pressable>
        </View>
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
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 110,
  },
  hero: {
    width: '100%',
    height: 373,
    backgroundColor: '#252523',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  // heroOverlay: {
  //   ...StyleSheet.absoluteFillObject,
  //   backgroundColor: 'rgba(0, 0, 0, 0.22)',
  // },
  backButton: {
    position: 'absolute',
    top: 102,
    left: HOME_HORIZONTAL_PADDING,
    width: 32,
    height: 32,
    borderRadius: 7,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
  },
  details: {
    paddingHorizontal: HOME_HORIZONTAL_PADDING,
    paddingTop: 18,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  identity: {
    flex: 1,
    paddingRight: 20,
  },
  name: {
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
  },
  price: {
    color: '#C9922A',
    fontFamily: 'Manrope',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 25,
    marginTop: 4,
  },
  colors: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 19,
  },
  colorSwatch: {
    width: 23,
    height: 23,
    borderRadius: 11.5,
  },
  actions: {
    alignItems: 'flex-end',
    gap: 22,
  },
  saveButton: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    borderWidth: 1,
    backgroundColor: '#C9922A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  quantityButton: {
    width: 19,
    height: 19,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 16,
  },
  tabs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 26,
    marginTop: 34,
  },
  tabButton: {
    minWidth: 74,
    height: 38,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabButton: {
    backgroundColor: '#C9922A',
    width:106,
  },
  tabText: {
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 12,
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  description: {
    color: '#BEBEBE',
    fontFamily: 'Manrope',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 18,
    marginTop: 24,
  },
  infoPanel: {
    borderTopWidth: 5,
    borderBottomWidth: 1,
    borderColor: '#D8D8D8',
    paddingVertical: 24,
    paddingHorizontal: HOME_HORIZONTAL_PADDING,
    gap: 17,
    marginTop: 28,
    marginHorizontal: -HOME_HORIZONTAL_PADDING,
  },
  infoText: {
    color: '#AFAFAF',
    fontFamily: 'Manrope',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 14,
  },
  infoLabel: {
    color: '#C9922A',
    fontWeight: '700',
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: HOME_HORIZONTAL_PADDING,
    paddingTop: 14,
    paddingBottom: 28,
    backgroundColor: '#000000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
     zIndex: 9,
     elevation: 9,
  },
  addButton: {
    height: 43,
    borderRadius: 7,
    backgroundColor: '#C9922A',
    alignItems: 'center',
    justifyContent: 'center',
    width:235,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 14,
  },
  pressed: {
    opacity: 0.82,
  },
});
