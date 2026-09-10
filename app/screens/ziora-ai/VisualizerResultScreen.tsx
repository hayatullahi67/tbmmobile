import FeedbackModal from '@/components/FeedbackModal';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ApiService } from '@/app/services/apiService';
import { WebView } from 'react-native-webview';
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

const STATIC_STYLES = [
  { id: 'modern', name: 'Modern' },
  { id: 'minimalist', name: 'Minimalism' },
  { id: 'wabi-sabi', name: 'Wabi-Sabi' },
  { id: 'tropical', name: 'Tropical' },
  { id: 'farmhouse', name: 'Farmhouse' },
  { id: 'memphis', name: 'Memphis' },
  { id: 'afro-minimalism', name: 'Afro-Minimalism' },
  { id: 'contemporary-african', name: 'Contemporary African' },
  { id: 'industrial', name: 'Industrial' },
  { id: 'bohemian', name: 'Bohemian' },
];

function getStyleImage(styleId: string) {
  const normalized = styleId.toLowerCase();
  switch (normalized) {
    case 'modern':
      return require('@/assets/ziora/living_modern.png');
    case 'minimalist':
    case 'minimalism':
      return require('@/assets/ziora/living_minimalism.png');
    case 'wabi-sabi':
    case 'wabisabi':
      return require('@/assets/ziora/living_wabisabi.png');
    case 'tropical':
      return require('@/assets/ziora/living_tropical.png');
    case 'farmhouse':
      return require('@/assets/ziora/living_farmhouse.png');
    case 'memphis':
      return require('@/assets/ziora/living_memphis.png');
    case 'afro-minimalism':
      return require('@/assets/ziora/living_minimalism.png');
    case 'contemporary-african':
      return require('@/assets/ziora/living_modern.png');
    case 'industrial':
      return require('@/assets/ziora/living_minimalism.png');
    case 'bohemian':
      return require('@/assets/ziora/living_tropical.png');
    default:
      return require('@/assets/ziora/living_modern.png');
  }
}

export const options = {
  headerShown: false,
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
  const isVideo = params.isVideo === 'true';

  const [currentOutputUrl, setCurrentOutputUrl] = useState<any>(null);
  const [isTransforming, setIsTransforming] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<string>('Modern');
  const [currentMatchedProducts, setCurrentMatchedProducts] = useState<any[]>([]);
  const [stylesList, setStylesList] = useState<any[]>(STATIC_STYLES);
  const [loaderMessage, setLoaderMessage] = useState('Ziora is analyzing layout and preparing styles...');
  const [activeProjectId, setActiveProjectId] = useState<string>(projectId);
  const [remoteImageUrl, setRemoteImageUrl] = useState<string>('');

  const [isLoadingDesign, setIsLoadingDesign] = useState(true);

  const isFetchingRef = useRef(false);

  useEffect(() => {
    async function fetchStyles() {
      try {
        const res = await ApiService.getAiStyles();
        if (res.success && res.data && res.data.length > 0) {
          setStylesList(res.data);
        }
      } catch (err) {
        console.error('Error fetching styles in visualizer:', err);
      }
    }
    fetchStyles();
  }, []);

  useEffect(() => {
    let active = true;

    async function pollProjectStatus(projId: string, maxAttempts = 30, delayMs = 6000): Promise<string> {
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          console.log(`[API Poll] Checking project ${projId} status, attempt ${attempt}/${maxAttempts}...`);
          const projectsRes = await ApiService.getAiProjects();
          if (projectsRes.success && projectsRes.data) {
            const myProject = projectsRes.data.find((p: any) => (p.id === projId || p.projectId === projId));
            if (myProject) {
              console.log(`[API Poll] Project status is ${myProject.status}`);
              if (myProject.status === 3) { // 3 = Completed
                const outUrl = myProject.latestDesignUrl || myProject.outputUrl;
                if (outUrl) {
                  const matched = myProject.matchedProducts || [];
                  if (matched.length > 0) {
                    const mappedProducts = matched.map((p: any) => ({
                      productId: p.productId || p.id || String(Math.random()),
                      name: p.name || 'Bogat Material',
                      category: p.role || p.category || 'Renovation Finish',
                      price: p.price || 0,
                      priceDisplay: p.priceDisplay || (p.price ? `₦${p.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '₦0.00'),
                      imageUrl: p.imageUrl || p.image || 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=150',
                    }));
                    setCurrentMatchedProducts(mappedProducts);
                  }
                  return outUrl;
                }
              } else if (myProject.status === 4) { // 4 = Failed
                throw new Error('Project generation failed on backend.');
              }
            }
          }
        } catch (pollErr) {
          console.warn(`[API Poll] Attempt ${attempt} failed:`, pollErr);
        }
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
      throw new Error('Project status polling timed out.');
    }

    async function executeRealApiGeneration() {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;
      setIsLoadingDesign(true);

      const routeStyleId = (params.style as string) || 'modern';
      const styleObj = stylesList.find(s => s.id.toLowerCase() === routeStyleId.toLowerCase());
      const displayStyleName = styleObj ? styleObj.name : 'Modern';
      setSelectedStyle(displayStyleName);

      let currentRemoteUrl = inputUrl;
      let currentProjectId = projectId;
      const contextTags = ['Renovation Finish', 'Interior design', 'Bogat Inventory'];

      try {
        // 1. Upload local reference image if needed (using uploadRoomImage)
        if (inputUrl && (inputUrl.startsWith('file://') || inputUrl.startsWith('/') || inputUrl.startsWith('content://'))) {
          setLoaderMessage('Ziora is uploading reference image...');
          const uploadRes: any = await ApiService.uploadRoomImage(inputUrl);
          const uploadedUrl = uploadRes?.imageUrl || uploadRes?.data?.imageUrl || uploadRes?.url || uploadRes?.data?.url;
          if (uploadedUrl) {
            currentRemoteUrl = uploadedUrl;
            if (active) setRemoteImageUrl(uploadedUrl);
          } else {
            console.warn('[API] Upload reference image failed, using original uri');
          }
        }

        // 2. Create AI project
        setLoaderMessage('Ziora is creating AI project...');
        const payloadOutputType = isVideo ? 2 : 1;
        const payloadGenerationType = isVideo ? 2 : 1;
        console.log(`[DEBUG] createAIProject Input Params - outputType: ${payloadOutputType}, generationType: ${payloadGenerationType}, prompt: ${prompt}`);

        const projectRes = await ApiService.createAIProject({
          sourceImageUrl: currentRemoteUrl || null,
          outputType: payloadOutputType,
          generationType: payloadGenerationType,
          prompt: prompt,
          contextLabel: 'Renovation Visualizer'
        });

        console.log('[DEBUG] createAIProject Response payload:', JSON.stringify(projectRes));

        const resProjId = (projectRes as any)?.id || (projectRes as any)?.projectId || projectRes?.data?.id || projectRes?.data?.projectId;
        console.log('[DEBUG] Extracted resProjId:', resProjId);
        if (resProjId) {
          currentProjectId = resProjId;
          if (active) setActiveProjectId(resProjId);
        }

        // 3. Trigger generation
        let genRes: any = null;
        if (isVideo) {
          setLoaderMessage('Ziora is generating your video concept...');
          genRes = await ApiService.generateAIVideo({
            projectId: currentProjectId,
            prompt: prompt,
            sourceImageUrl: currentRemoteUrl || null,
            durationSeconds: 5,
            style: routeStyleId,
            contextTags
          });
          const outUrl = genRes?.data?.url || genRes?.url || genRes?.data?.videoUrl || genRes?.videoUrl || genRes?.data?.outputUrl || genRes?.outputUrl;
          if (outUrl && active) {
            setCurrentOutputUrl(outUrl);
          }
        } else {
          setLoaderMessage('Ziora is generating your image concept...');
          genRes = await ApiService.generateAIImage({
            projectId: currentProjectId,
            prompt: prompt,
            sourceImageUrl: currentRemoteUrl || null,
            style: routeStyleId,
            contextTags
          });
          const outUrl = genRes?.data?.url || genRes?.url || genRes?.data?.imageUrl || genRes?.imageUrl || genRes?.data?.outputUrl || genRes?.outputUrl;
          if (outUrl && active) {
            setLoaderMessage('Ziora is caching design layout...');
            try {
              await Image.prefetch(outUrl);
            } catch (err) {
              console.warn('[ImagePrefetch] failed:', err);
            }
            setCurrentOutputUrl(outUrl);
          }
        }

        // 4. Map matched products directly from the design generation response
        const matched = genRes?.data?.matchedProducts || genRes?.matchedProducts || [];
        if (active) {
          if (matched && matched.length > 0) {
            const mappedProducts = matched.map((p: any) => ({
              productId: p.productId || p.id || String(Math.random()),
              name: p.name || 'Bogat Material',
              category: p.role || p.category || 'Renovation Finish',
              price: p.price || 0,
              priceDisplay: p.priceDisplay || (p.price ? `₦${p.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '₦0.00'),
              imageUrl: p.imageUrl || p.image || 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=150',
            }));
            setCurrentMatchedProducts(mappedProducts);
          } else {
            // Fallback to fetch from all products if matchedProducts is empty
            try {
              const prodRes = await ApiService.getAllProducts(1, 10);
              if (prodRes.success && prodRes.data) {
                const products = prodRes.data.products || prodRes.data.items || prodRes.data || [];
                const mappedProducts = products.map((p: any) => ({
                  productId: p.id || p.productId || String(Math.random()),
                  name: p.name || p.title,
                  category: p.categoryName || p.category || 'Renovation Finish',
                  price: p.price || 0,
                  priceDisplay: p.price ? `₦${p.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '₦0.00',
                  imageUrl: p.imageUrl || p.image || 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=150',
                }));
                setCurrentMatchedProducts(mappedProducts);
              }
            } catch (prodErr) {
              console.warn('[Products Fetch Fallback] failed:', prodErr);
            }
          }
        }

      } catch (err: any) {
        console.error('[API] Ziora generation failed, attempting recovery polling:', err);
        setLoaderMessage(isVideo 
          ? 'Ziora is rendering your video concept (this may take 1-3 minutes)...' 
          : 'Ziora is rendering your image concept...');
        try {
          const outUrl = await pollProjectStatus(currentProjectId, isVideo ? 60 : 30);
          if (outUrl && active) {
            setCurrentOutputUrl(outUrl);
            return;
          }
        } catch (pollErr: any) {
          console.error('[API Poll Recovery] Failed:', pollErr);
        }

        if (active) {
          showFeedback('error', 'Generation Failed', err?.message || 'Ziora was unable to complete the generation. Please try again.');
        }
      } finally {
        if (active) {
          setIsLoadingDesign(false);
          isFetchingRef.current = false;
        }
      }
    }

    executeRealApiGeneration();

    return () => {
      active = false;
    };
  }, [prompt, params.style, stylesList]);

  const handleStyleTransform = async (styleId: string, styleName: string) => {
    if (isTransforming) return;
    setIsTransforming(true);
    setSelectedStyle(styleName);
    const contextTags = ['Renovation Finish', 'Interior design', 'Bogat Inventory'];

    try {
      // 1. Call real AI generation API to transform style
      const genRes: any = await ApiService.generateAIImage({
        projectId: activeProjectId,
        prompt: prompt,
        sourceImageUrl: remoteImageUrl || null,
        style: styleId,
        contextTags
      });

      const outUrl = genRes?.data?.url || genRes?.url || genRes?.data?.imageUrl || genRes?.imageUrl || genRes?.data?.outputUrl || genRes?.outputUrl;
      if (outUrl) {
        try {
          await Image.prefetch(outUrl);
        } catch (err) {
          console.warn('[ImagePrefetch] failed:', err);
        }
        setCurrentOutputUrl(outUrl);
      }

      // Map new matched products as well!
      const matched = genRes?.data?.matchedProducts || genRes?.matchedProducts || [];
      if (matched && matched.length > 0) {
        const mappedProducts = matched.map((p: any) => ({
          productId: p.productId || p.id || String(Math.random()),
          name: p.name || 'Bogat Material',
          category: p.role || p.category || 'Renovation Finish',
          price: p.price || 0,
          priceDisplay: p.priceDisplay || (p.price ? `₦${p.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '₦0.00'),
          imageUrl: p.imageUrl || p.image || 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=150',
        }));
        setCurrentMatchedProducts(mappedProducts);
      }

    } catch (err: any) {
      console.error('[API] Ziora style transformation failed:', err);
      showFeedback('error', 'Transformation Failed', err?.message || 'Ziora was unable to apply this style preset. Please try again.');
    } finally {
      setIsTransforming(false);
    }
  };

  const currentImageSource = currentOutputUrl 
    ? { uri: currentOutputUrl } 
    : (inputUrl ? { uri: inputUrl } : require('@/assets/images/visualizer_after.png'));

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Visualizer Image Container */}
      <View style={styles.fullScreenContainer}>
        <View style={styles.imageCardContainer}>
          {isVideo && currentOutputUrl ? (
            <WebView
              source={{
                html: `
                  <html>
                    <head>
                      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
                      <style>
                        body {
                          margin: 0;
                          background-color: #000;
                          display: flex;
                          align-items: center;
                          justify-content: center;
                          height: 100vh;
                          width: 100vw;
                          overflow: hidden;
                        }
                        video {
                          width: 100%;
                          height: 100%;
                          object-fit: contain;
                        }
                      </style>
                    </head>
                    <body>
                      <video src="${currentOutputUrl}" controls playsinline preload="metadata" autoplay loop></video>
                    </body>
                  </html>
                `
              }}
              style={styles.mainImageCard}
              backgroundColor="#000000"
              javaScriptEnabled={true}
              domStorageEnabled={true}
            />
          ) : (
            <Image
              source={currentImageSource}
              style={styles.mainImageCard}
              contentFit="cover"
            />
          )}
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
            {stylesList.map((style) => {
              const isActive = selectedStyle.toLowerCase() === style.name.toLowerCase();
              return (
                <Pressable
                  key={style.id}
                  style={[styles.styleCard, isActive && styles.styleCardActive]}
                  onPress={() => handleStyleTransform(style.id, style.name)}
                  disabled={isTransforming}
                >
                  <Image source={getStyleImage(style.id)} style={styles.styleCardImage} contentFit="cover" />
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
            {loaderMessage}
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
