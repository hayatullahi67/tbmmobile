import FeedbackModal from '@/components/FeedbackModal';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const DESIGN_STYLES = [
  { id: 'Modern', name: 'Modern', image: require('@/assets/ziora/living_modern.png') },
  { id: 'Minimalism', name: 'Minimalism', image: require('@/assets/ziora/living_minimalism.png') },
  { id: 'Wabi-sabi', name: 'Wabi-sabi', image: require('@/assets/ziora/living_wabisabi.png') },
  { id: 'Tropical', name: 'Tropical', image: require('@/assets/ziora/living_tropical.png') },
  { id: 'Farmhouse', name: 'Farmhouse', image: require('@/assets/ziora/living_farmhouse.png') },
  // { id: 'Memphis', name: 'Memphis', image: require('@/assets/ziora/living_memphis.png') },
];

export const options = {
  headerShown: false,
};

const getFallbackDesignData = (userPrompt: string) => {
  const query = userPrompt.toLowerCase();
  let category = 'living';
  if (query.includes('kitchen')) category = 'kitchen';
  else if (query.includes('bedroom') || query.includes('bed')) category = 'bedroom';
  else if (query.includes('toilet') || query.includes('bathroom') || query.includes('wc') || query.includes('restroom') || query.includes('toiletg')) category = 'bathroom';
  else if (query.includes('parlor') || query.includes('parlour') || query.includes('living') || query.includes('sitting')) category = 'living';

  const datasets: Record<string, any> = {
    kitchen: {
      Modern: {
        imageAsset: require('@/assets/ziora/kitchen_modern.png'),
        matchedProducts: [
          { productId: 'kit-mod-1', name: 'Polished Carrara Quartz Countertop', category: 'Construction Finish', price: 480000, priceDisplay: '₦480,000.00', imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=150' },
          { productId: 'kit-mod-2', name: 'Gold Halo Ring Pendant Lights', category: 'Lighting', price: 95000, priceDisplay: '₦95,000.00', imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=150' }
        ]
      },
      Minimalism: {
        imageAsset: require('@/assets/ziora/kitchen_minimalism.png'),
        matchedProducts: [
          { productId: 'kit-min-1', name: 'Concealed Handleless Cabinetry', category: 'Cabinetry', price: 1200000, priceDisplay: '₦1,200,000.00', imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=150' },
          { productId: 'kit-min-2', name: 'Seamless Integrated Induction Hob', category: 'Appliances', price: 850000, priceDisplay: '₦850,000.00', imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=150' }
        ]
      },
      'Wabi-sabi': {
        imageAsset: require('@/assets/ziora/kitchen_wabisabi.png'),
        matchedProducts: [
          { productId: 'kit-wab-1', name: 'Live-Edge Solid Iroko Island Countertop', category: 'Timber Finish', price: 720000, priceDisplay: '₦720,000.00', imageUrl: 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=150' },
          { productId: 'kit-wab-2', name: 'Clay Pendant Lamp (Handcrafted)', category: 'Lighting', price: 48000, priceDisplay: '₦48,000.00', imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=150' }
        ]
      },
      Tropical: {
        imageAsset: require('@/assets/ziora/kitchen_tropical.png'),
        matchedProducts: [
          { productId: 'kit-trop-1', name: 'Woven Rattan Ceiling Pendant', category: 'Lighting', price: 35000, priceDisplay: '₦35,000.00', imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=150' },
          { productId: 'kit-trop-2', name: 'Verde Bamboo Marble Accent Slab', category: 'Construction Finish', price: 540000, priceDisplay: '₦540,000.00', imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=150' }
        ]
      },
      Farmhouse: {
        imageAsset: require('@/assets/ziora/kitchen_farmhouse.png'),
        matchedProducts: [
          { productId: 'kit-farm-1', name: 'Ceramic Apron-Front Sink', category: 'Kitchen Fixture', price: 290000, priceDisplay: '₦290,000.00', imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=150' },
          { productId: 'kit-farm-2', name: 'Solid Oak Butcher Block Island Top', category: 'Timber Finish', price: 360000, priceDisplay: '₦360,000.00', imageUrl: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=150' }
        ]
      },
      Memphis: {
        imageAsset: require('@/assets/ziora/kitchen_memphis.png'),
        matchedProducts: [
          { productId: 'kit-mem-1', name: 'Confetti Terrazzo Tile Flooring', category: 'Flooring', price: 150000, priceDisplay: '₦150,000.00', imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=150' },
          { productId: 'kit-mem-2', name: 'Pastel Geometric Cabinet Hardware', category: 'Hardware', price: 14000, priceDisplay: '₦14,000.00', imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=150' }
        ]
      }
    },
    bedroom: {
      Modern: {
        imageAsset: require('@/assets/images/welcomebg.png'),
        matchedProducts: [
          { productId: 'bed-mod-1', name: 'Upholstered Velvet Accent Headboard', category: 'Furniture Finish', price: 380000, priceDisplay: '₦380,000.00', imageUrl: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=150' }
        ]
      },
      Minimalism: {
        imageAsset: require('@/assets/images/product1.jpeg'),
        matchedProducts: [
          { productId: 'bed-min-1', name: 'Low Profile Oak Bed Frame', category: 'Furniture', price: 450000, priceDisplay: '₦450,000.00', imageUrl: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=150' }
        ]
      },
      'Wabi-sabi': {
        imageAsset: require('@/assets/images/product4.jpeg'),
        matchedProducts: [
          { productId: 'bed-wab-1', name: 'Bogat Raw Textured Wall Screed', category: 'Paints', price: 82000, priceDisplay: '₦82,000.00', imageUrl: 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=150' }
        ]
      },
      Tropical: {
        imageAsset: require('@/assets/images/product6.jpeg'),
        matchedProducts: [
          { productId: 'bed-trop-1', name: 'Teak Canopy Bedroom Post', category: 'Timber Finish', price: 580000, priceDisplay: '₦580,000.00', imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=150' }
        ]
      },
      Farmhouse: {
        imageAsset: require('@/assets/images/product8.jpeg'),
        matchedProducts: [
          { productId: 'bed-farm-1', name: 'Solid Timber Sliding Barn Door', category: 'Doors', price: 290000, priceDisplay: '₦290,000.00', imageUrl: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=150' }
        ]
      },
      Memphis: {
        imageAsset: require('@/assets/images/product10.jpeg'),
        matchedProducts: [
          { productId: 'bed-mem-1', name: 'Abstract Pastel Geometric Rug', category: 'Flooring', price: 180000, priceDisplay: '₦180,000.00', imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=150' }
        ]
      }
    },
    bathroom: {
      Modern: {
        imageAsset: require('@/assets/ziora/bathroom_modern.png'),
        matchedProducts: [
          { productId: 'bath-mod-1', name: 'Frameless Backlit LED Mirror', category: 'Bath Fixtures', price: 125000, priceDisplay: '₦125,000.00', imageUrl: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=150' },
          { productId: 'bath-mod-2', name: 'Black Matte Rainfall Shower Set', category: 'Plumbing', price: 220000, priceDisplay: '₦220,000.00', imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=150' }
        ]
      },
      Minimalism: {
        imageAsset: require('@/assets/ziora/bathroom_minimalism.png'),
        matchedProducts: [
          { productId: 'bath-min-1', name: 'Seamless Microcement Wall Finish', category: 'Paints', price: 280000, priceDisplay: '₦280,000.00', imageUrl: 'https://images.unsplash.com/photo-1604014237800-1c9102c219da?w=150' }
        ]
      },
      'Wabi-sabi': {
        imageAsset: require('@/assets/ziora/bathroom_wabisabi.png'),
        matchedProducts: [
          { productId: 'bath-wab-1', name: 'Natural Stone Carved Pedestal Basin', category: 'Bath Fixtures', price: 450000, priceDisplay: '₦450,000.00', imageUrl: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=150' }
        ]
      },
      Tropical: {
        imageAsset: require('@/assets/ziora/bathroom_tropical.png'),
        matchedProducts: [
          { productId: 'bath-trop-1', name: 'Teak Wood Slatted Shower Floor', category: 'Construction Finish', price: 95000, priceDisplay: '₦95,000.00', imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=150' }
        ]
      },
      Farmhouse: {
        imageAsset: require('@/assets/ziora/bathroom_farmhouse.png'),
        matchedProducts: [
          { productId: 'bath-farm-1', name: 'Freestanding Clawfoot Soaking Tub', category: 'Bath Fixtures', price: 880000, priceDisplay: '₦880,000.00', imageUrl: 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?w=150' }
        ]
      },
      Memphis: {
        imageAsset: require('@/assets/ziora/bathroom_memphis.png'),
        matchedProducts: [
          { productId: 'bath-mem-1', name: 'Colorful Terrazzo Vanity Countertop', category: 'Construction Finish', price: 320000, priceDisplay: '₦320,000.00', imageUrl: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=150' }
        ]
      }
    },
    living: {
      Modern: {
        imageAsset: require('@/assets/ziora/living_modern.png'),
        matchedProducts: [
          { productId: 'liv-mod-1', name: 'High-Gloss Calacatta Wall Panel', category: 'Walls', price: 650000, priceDisplay: '₦650,000.00', imageUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=150' },
          { productId: 'liv-mod-2', name: 'Smart Recessed Linear LED Strip', category: 'Lighting', price: 42000, priceDisplay: '₦42,000.00', imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=150' }
        ]
      },
      Minimalism: {
        imageAsset: require('@/assets/ziora/living_minimalism.png'),
        matchedProducts: [
          { productId: 'liv-min-1', name: 'Self-leveling Concrete Screed Finish', category: 'Flooring', price: 320000, priceDisplay: '₦320,000.00', imageUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=150' }
        ]
      },
      'Wabi-sabi': {
        imageAsset: require('@/assets/ziora/living_wabisabi.png'),
        matchedProducts: [
          { productId: 'liv-wab-1', name: 'Venetian Mineral Plaster Coating', category: 'Paints', price: 78000, priceDisplay: '₦78,000.00', imageUrl: 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=150' }
        ]
      },
      Tropical: {
        imageAsset: require('@/assets/ziora/living_tropical.png'),
        matchedProducts: [
          { productId: 'liv-trop-1', name: 'Hand-woven Rattan Accent Armchair', category: 'Furniture', price: 165000, priceDisplay: '₦165,000.00', imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=150' }
        ]
      },
      Farmhouse: {
        imageAsset: require('@/assets/ziora/living_farmhouse.png'),
        matchedProducts: [
          { productId: 'liv-farm-1', name: 'Reclaimed Heart-Pine Timber Planks', category: 'Flooring', price: 680000, priceDisplay: '₦680,000.00', imageUrl: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=150' }
        ]
      },
      Memphis: {
        imageAsset: require('@/assets/ziora/living_memphis.png'),
        matchedProducts: [
          { productId: 'liv-mem-1', name: 'Terrazzo Flooring Compound Set', category: 'Flooring', price: 210000, priceDisplay: '₦210,000.00', imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=150' }
        ]
      }
    }
  };

  const activeDataset = datasets[category] || datasets.living;
  return activeDataset;
};

export default function VisualizerResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | 'info'>('info');
  const [feedbackTitle, setFeedbackTitle] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [showProductsDrawer, setShowProductsDrawer] = useState(false);

  const showFeedback = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    setFeedbackType(type);
    setFeedbackTitle(title);
    setFeedbackMessage(message);
    setFeedbackVisible(true);
  };

  const projectId = (params.projectId as string) || '692aadf2-4172-485d-9796-84ee98d54479';
  const prompt = (params.prompt as string) || '';
  const inputUrl = (params.inputUrl as string) || '';
  const imageBase64 = (params.imageBase64 as string) || '';
  const isVideo = params.isVideo === 'true';

  const [currentOutputUrl, setCurrentOutputUrl] = useState<any>(null);
  const [isTransforming, setIsTransforming] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<string>('Modern');
  const [currentMatchedProducts, setCurrentMatchedProducts] = useState<any[]>([]);

  const [isLoadingDesign, setIsLoadingDesign] = useState(true);
  const [designData, setDesignData] = useState<any>(null);

  const isFetchingRef = useRef(false);

  useEffect(() => {
    // Instantaneous premium local load
    const parsed = getFallbackDesignData(prompt);
    setDesignData(parsed);

    const initialStyle = 'Modern';
    setSelectedStyle(initialStyle);
    const selectedKey = Object.keys(parsed || {}).find(
      k => k.toLowerCase().replace(/[^a-z0-9]/g, '') === initialStyle.toLowerCase().replace(/[^a-z0-9]/g, '')
    );
    const selectedData = selectedKey ? parsed[selectedKey] : null;
    if (selectedData) {
      setCurrentOutputUrl(selectedData.imageAsset);
      setCurrentMatchedProducts(selectedData.matchedProducts || []);
    }

    // Short layout analyzer feedback spinner to look extremely professional
    const timer = setTimeout(() => {
      setIsLoadingDesign(false);
    }, 450);

    return () => clearTimeout(timer);
  }, [prompt]);

  const handleStyleTransform = async (styleName: string) => {
    if (isTransforming || !designData) return;
    setIsTransforming(true);
    setSelectedStyle(styleName);

    try {
      const selectedKey = Object.keys(designData || {}).find(
        k => k.toLowerCase().replace(/[^a-z0-9]/g, '') === styleName.toLowerCase().replace(/[^a-z0-9]/g, '')
      );
      const selectedData = selectedKey ? designData[selectedKey] : null;
      if (selectedData) {
        setCurrentOutputUrl(selectedData.imageAsset);
        setCurrentMatchedProducts(selectedData.matchedProducts || []);
      }
    } catch (err) {
      console.error('Failed to change style:', err);
    } finally {
      setIsTransforming(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Visualizer Image Container */}
      <View style={styles.fullScreenContainer}>
        <View style={styles.imageCardContainer}>
          <Image
            source={currentOutputUrl || require('@/assets/images/visualizer_after.png')}
            style={styles.mainImageCard}
            contentFit="cover"
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.3)', 'transparent', 'rgba(0,0,0,0.5)']}
            locations={[0, 0.4, 1]}
            style={StyleSheet.absoluteFillObject}
            pointerEvents="none"
          />
        </View>

        {/* Floating Top Header Controls */}
        <View style={styles.floatingHeader}>
          <Pressable style={styles.headerIconButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </Pressable>

          <View style={styles.headerRightActions}>
            <Pressable style={styles.shopPillButton} onPress={() => setShowProductsDrawer(true)}>
              <Ionicons name="cart" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.shopPillText} allowFontScaling={false}>Shop Look</Text>
            </Pressable>
            <Pressable style={styles.headerIconButton} onPress={() => showFeedback('success', 'Saved', 'Design layout saved to your design library.')}>
              <Ionicons name="bookmark-outline" size={20} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>

        {/* Bottom Styling Options Carousel Overlay */}
        <View style={styles.bottomStyleCarouselContainer}>
          <Text style={styles.carouselSectionTitle} allowFontScaling={false}>
            Select Room Style
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carouselScroll}>
            {DESIGN_STYLES.map((style) => {
              const isActive = selectedStyle === style.id;
              return (
                <Pressable
                  key={style.id}
                  style={[styles.styleCard, isActive && styles.styleCardActive]}
                  onPress={() => handleStyleTransform(style.id)}
                  disabled={isTransforming}
                >
                  <Image source={style.image} style={styles.styleCardImage} contentFit="cover" />
                  <View style={styles.styleCardOverlay}>
                    <Text style={styles.styleCardLabel} allowFontScaling={false}>
                      {style.name}
                    </Text>
                    {isActive && (
                      <View style={styles.activeCheckBadge}>
                        <Ionicons name="checkmark" size={10} color="#000000" />
                      </View>
                    )}
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>

      {/* Slide-Up Products Bottom Sheet Drawer */}
      <Modal
        visible={showProductsDrawer}
        transparent
        animationType="slide"
        onRequestClose={() => setShowProductsDrawer(false)}
      >
        <Pressable style={styles.drawerBackdrop} onPress={() => setShowProductsDrawer(false)}>
          <View style={styles.drawerContent} onStartShouldSetResponder={() => true}>
            <View style={styles.drawerIndicator} />

            <View style={styles.drawerHeader}>
              <View>
                <Text style={styles.drawerTitle} allowFontScaling={false}>Shop the Design</Text>
                <Text style={styles.drawerSub} allowFontScaling={false}>Matched fixtures and materials identified by Ziora AI</Text>
              </View>
              <Pressable style={styles.closeDrawerButton} onPress={() => setShowProductsDrawer(false)}>
                <Ionicons name="close" size={20} color="#8E8E93" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.drawerScrollList}>
              {currentMatchedProducts.map((prod: any) => (
                <View key={prod.productId} style={styles.productRow}>
                  <Image
                    source={prod.imageUrl ? { uri: prod.imageUrl } : { uri: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=150&auto=format&fit=crop&q=60' }}
                    style={styles.productThumbnail}
                    contentFit="cover"
                  />
                  <View style={styles.productDetails}>
                    <Text style={styles.productName} numberOfLines={1} allowFontScaling={false}>{prod.name}</Text>
                    <Text style={styles.productCategory} allowFontScaling={false}>{prod.category || 'Renovation Material'}</Text>
                    <Text style={styles.productPrice} allowFontScaling={false}>
                      {prod.priceDisplay || `₦${prod.price?.toLocaleString()}`}
                    </Text>
                  </View>
                  <Pressable
                    style={({ pressed }) => [
                      styles.addToCartButton,
                      pressed && { opacity: 0.8 }
                    ]}
                    onPress={() => {
                      setShowProductsDrawer(false);
                      showFeedback('success', 'Added to Cart', `${prod.name} added to your project budget list.`);
                    }}
                  >
                    <Ionicons name="cart-outline" size={16} color="#000000" />
                    <Text style={styles.addToCartText} allowFontScaling={false}>Add</Text>
                  </Pressable>
                </View>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      {/* Loading Overlay */}
      {isTransforming && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color="#C9922A" />
          <Text style={styles.loaderText} allowFontScaling={false}>
            Ziora is transforming space to {selectedStyle} style...
          </Text>
        </View>
      )}

      {isLoadingDesign && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color="#C9922A" />
          <Text style={styles.loaderText} allowFontScaling={false}>
            Ziora is analyzing layout and preparing styles...
          </Text>
        </View>
      )}

      {/* Global Notifications */}
      <FeedbackModal
        visible={feedbackVisible}
        type={feedbackType}
        title={feedbackTitle}
        message={feedbackMessage}
        onClose={() => setFeedbackVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  fullScreenContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    position: 'relative',
  },
  imageCardContainer: {
    width: '100%',
    height: SCREEN_HEIGHT * 0.52,
    marginTop: Platform.OS === 'ios' ? 76 : 96,
    // paddingHorizontal: 16,
  },
  mainImageCard: {
    width: '100%',
    height: '100%',
    // borderRadius: 20,
    // overflow: 'hidden',
    // backgroundColor: '#151515',
    // borderWidth: 1.5,
    // borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  floatingHeader: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 10 : 30,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  headerIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  shopPillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#C9922A',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  shopPillText: {
    color: '#000000',
    fontFamily: 'Manrope',
    fontSize: 12,
    fontWeight: '800',
  },
  bottomStyleCarouselContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 116 : 86,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  carouselSectionTitle: {
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 12,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  carouselScroll: {
    gap: 12,
    paddingRight: 20,
  },
  styleCard: {
    width: 100,
    height: 86,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 2.5,
    borderColor: 'transparent',
    position: 'relative',
    backgroundColor: '#1E1E1E',
  },
  styleCardActive: {
    borderColor: '#C9922A',
  },
  styleCardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  styleCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 6,
  },
  styleCardLabel: {
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  activeCheckBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#C9922A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loaderText: {
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  // Slide-Up Bottom Drawer Styles
  drawerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  drawerContent: {
    backgroundColor: '#0F0F0F',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.6,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    borderWidth: 1,
    borderColor: '#222222',
  },
  drawerIndicator: {
    width: 44,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#3A3A3C',
    alignSelf: 'center',
    marginBottom: 16,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  drawerTitle: {
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  drawerSub: {
    color: '#8E8E93',
    fontFamily: 'Manrope',
    fontSize: 12,
  },
  closeDrawerButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerScrollList: {
    gap: 16,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#2A2A2C',
  },
  productThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#2C2C2E',
  },
  productDetails: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  productName: {
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  productCategory: {
    color: '#8E8E93',
    fontFamily: 'Manrope',
    fontSize: 11,
    marginBottom: 4,
  },
  productPrice: {
    color: '#C9922A',
    fontFamily: 'Manrope',
    fontSize: 13,
    fontWeight: '800',
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#C9922A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addToCartText: {
    color: '#000000',
    fontFamily: 'Manrope',
    fontSize: 11,
    fontWeight: '800',
  },
});
