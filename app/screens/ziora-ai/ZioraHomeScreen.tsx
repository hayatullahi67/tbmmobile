import { ApiService } from '@/app/services/apiService';
import FeedbackModal from '@/components/FeedbackModal';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export const options = {
  headerShown: false,
};

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

export default function ZioraHomeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [promptText, setPromptText] = useState('');
  const [outputType, setOutputType] = useState<number>(1); // 1 = Image, 2 = Video
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [stylesList, setStylesList] = useState<any[]>(STATIC_STYLES);
  const [selectedStyleId, setSelectedStyleId] = useState<string>('modern');

  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | 'info'>('info');
  const [feedbackTitle, setFeedbackTitle] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const showFeedback = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    setFeedbackType(type);
    setFeedbackTitle(title);
    setFeedbackMessage(message);
    setFeedbackVisible(true);
  };

  useEffect(() => {
    async function fetchStyles() {
      try {
        const res = await ApiService.getAiStyles();
        if (res.success && res.data && res.data.length > 0) {
          setStylesList(res.data);
          const hasModern = res.data.find((s: any) => s.id === 'modern' || s.id === 'Modern');
          setSelectedStyleId(hasModern ? hasModern.id : res.data[0].id);
        }
      } catch (err) {
        console.error('Error fetching AI styles:', err);
      }
    }
    fetchStyles();
  }, []);

  useEffect(() => {
    if (params.prefilledPrompt) {
      setPromptText(params.prefilledPrompt as string);
    }
    if (params.prefilledImage) {
      setReferenceImage(params.prefilledImage as string);
    }
  }, [params.prefilledPrompt, params.prefilledImage]);

  const handleSelectReferenceImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showFeedback('error', 'Permission needed', 'Please allow access to your photo library to choose reference images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.6,
      base64: false,
    });

    if (!result.canceled && result.assets.length > 0) {
      setReferenceImage(result.assets[0].uri);
    }
  };

  const handleSend = async () => {
    if (!promptText.trim()) {
      showFeedback('info', 'Input Required', 'Please enter a prompt describing your dream space.');
      return;
    }

    router.push({
      pathname: '/screens/ziora-ai/VisualizerResultScreen',
      params: {
        prompt: promptText.trim(),
        inputUrl: referenceImage || '',
        isVideo: outputType === 2 ? 'true' : 'false',
        style: selectedStyleId,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          bounces={true}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Top Hero Section with Image and Gradient */}
          <View style={styles.heroSection}>
            <Image
              source={require('@/assets/images/modern_interior_dark.png')}
              style={styles.heroImage}
              contentFit="cover"
            />
            <LinearGradient
              colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.8)', '#000000']}
              locations={[0, 0.5, 1]}
              style={styles.gradient}
            />

            <View style={styles.heroContent}>
              <Text style={styles.welcomeText} allowFontScaling={false}>
                Welcome to Ziora
              </Text>
              <Text style={styles.mainHeading} allowFontScaling={false}>
                What can we{'\n'}help you <Text style={styles.goldText}>build</Text>{'\n'}today?
              </Text>
              <Text style={styles.subHeading} allowFontScaling={false}>
                Ask anything about construction,{'\n'}renovation, materials, or smart estimates.
              </Text>
            </View>
          </View>

          {/* Interactive Section */}
          <View style={styles.interactiveSection}>
            {/* AI Prompt Composer Card */}
            <View style={styles.composerCard}>
              <TextInput
                style={styles.composerInput}
                placeholder="Describe your dream space, materials, or style..."
                placeholderTextColor="#666666"
                value={promptText}
                onChangeText={setPromptText}
                multiline={true}
                numberOfLines={3}
                allowFontScaling={false}
              />

              {referenceImage && (
                <View style={styles.attachmentWrapper}>
                  <View style={styles.referencePreviewContainer}>
                    <Image source={{ uri: referenceImage }} style={styles.referencePreviewImage} />
                    <Pressable style={styles.removeReferenceButton} onPress={() => setReferenceImage(null)}>
                      <Ionicons name="close" size={14} color="#FFFFFF" />
                    </Pressable>
                  </View>
                </View>
              )}

              <View style={styles.composerToolbar}>
                <View style={styles.toolbarLeft}>
                  {/* Photo picker trigger */}
                  <Pressable
                    style={({ pressed }) => [
                      styles.toolbarIconButton,
                      referenceImage ? styles.toolbarIconButtonActive : null,
                      pressed && styles.pressed
                    ]}
                    onPress={handleSelectReferenceImage}
                  >
                    <Ionicons
                      name={referenceImage ? "image" : "image-outline"}
                      size={20}
                      color={referenceImage ? "#B58529" : "#888888"}
                    />
                  </Pressable>

                  {/* Output Type Switcher Capsule */}
                  <View style={styles.compactSwitcher}>
                    <Pressable
                      style={[styles.switcherPill, outputType === 1 && styles.switcherPillActive]}
                      onPress={() => setOutputType(1)}
                    >
                      <Ionicons name="image" size={13} color={outputType === 1 ? '#000000' : '#888888'} />
                      <Text style={[styles.switcherPillText, outputType === 1 && styles.switcherPillTextActive]} allowFontScaling={false}>
                        Image
                      </Text>
                    </Pressable>
                    <Pressable
                      style={[styles.switcherPill, outputType === 2 && styles.switcherPillActive]}
                      onPress={() => setOutputType(2)}
                    >
                      <Ionicons name="videocam" size={13} color={outputType === 2 ? '#000000' : '#888888'} />
                      <Text style={[styles.switcherPillText, outputType === 2 && styles.switcherPillTextActive]} allowFontScaling={false}>
                        Video
                      </Text>
                    </Pressable>
                  </View>
                </View>

                {/* Send/Generate Button */}
                <Pressable
                  style={({ pressed }) => [
                    styles.sendIconButton,
                    promptText.trim().length > 0 && styles.sendIconButtonActive,
                    pressed && styles.pressed
                  ]}
                  onPress={handleSend}
                >
                  <Ionicons
                    name="arrow-up"
                    size={20}
                    color={promptText.trim().length > 0 ? "#000000" : "#555555"}
                  />
                </Pressable>
              </View>
            </View>

            {/* Style Selector Section */}
            <Text style={styles.sectionHeading} allowFontScaling={false}>
              Choose Design Style
            </Text>
            <View style={{ marginBottom: 20 }}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.styleCarousel}
              >
                {stylesList.map((style) => {
                  const isActive = selectedStyleId === style.id;
                  return (
                    <Pressable
                      key={style.id}
                      style={[styles.stylePill, isActive && styles.stylePillActive]}
                      onPress={() => setSelectedStyleId(style.id)}
                    >
                      {isActive && <View style={styles.activeStyleDot} />}
                      <Text style={[styles.stylePillText, isActive && styles.stylePillTextActive]} allowFontScaling={false}>
                        {style.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* Menu Cards */}
            <Text style={styles.exploreHeading} allowFontScaling={false}>
              Explore Tools
            </Text>
            <View style={styles.rowContainer}>
              {/* Card 1 */}
              <Pressable
                style={({ pressed }) => [styles.threeCard, pressed && styles.pressed]}
                onPress={() => {
                  showFeedback(
                    'info',
                    'How to Use Visualizer',
                    'To use the AI Visualizer, please write your description in the input box, select a design style, and  add a reference photo above, then tap the gold arrow button.'
                  );
                }}
              >
                <View style={styles.cardIconContainer}>
                  <Ionicons name="home-outline" size={24} color="#B58529" />
                </View>
                <Text style={styles.threeCardTitle} allowFontScaling={false}>
                  AI Visualizer
                </Text>
                <Text style={styles.threeCardSubtitle} allowFontScaling={false}>
                  See design
                </Text>
              </Pressable>

              {/* Card 2 */}
              <Pressable
                style={({ pressed }) => [styles.threeCard, pressed && styles.pressed]}
                onPress={() => router.push('/screens/ziora-ai/RenovationEstimatesScreen')}
              >
                <View style={styles.cardIconContainer}>
                  <Ionicons name="document-text-outline" size={24} color="#B58529" />
                </View>
                <Text style={styles.threeCardTitle} allowFontScaling={false}>
                  Estimates
                </Text>
                <Text style={styles.threeCardSubtitle} allowFontScaling={false}>
                  Renovation costs
                </Text>
              </Pressable>

              {/* Commented out Materials Card 3
              <Pressable
                style={({ pressed }) => [styles.card, pressed && styles.pressed]}
                onPress={() => router.push({
                  pathname: '/screens/ziora-ai/MaterialsListScreen',
                  params: { prompt: 'Luxury Flooring' }
                })}
              >
                <View style={styles.cardIconContainer}>
                  <Ionicons name="cube-outline" size={28} color="#B58529" />
                </View>
                <Text style={styles.cardTitle} allowFontScaling={false}>
                  Materials
                </Text>
                <Text style={styles.cardSubtitle} allowFontScaling={false}>
                  Find the
                  best
                </Text>
              </Pressable>
              */}

              {/* Card 4 */}
              <Pressable
                style={({ pressed }) => [styles.threeCard, pressed && styles.pressed]}
                onPress={() => router.push('/screens/ziora-ai/InspirationScreen')}
              >
                <View style={styles.cardIconContainer}>
                  <Ionicons name="bulb-outline" size={24} color="#B58529" />
                </View>
                <Text style={styles.threeCardTitle} allowFontScaling={false}>
                  Inspiration
                </Text>
                <Text style={styles.threeCardSubtitle} allowFontScaling={false}>
                  Design ideas
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Loading HUD Overlay */}
      {isGenerating && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color="#B58529" />
          <Text style={styles.loaderText} allowFontScaling={false}>
            Ziora is generating your concept...
          </Text>
        </View>
      )}

      {/* Feedback Alert Modal */}
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
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  heroSection: {
    height: 480,
    width: '100%',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  gradient: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  heroContent: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
  },
  welcomeText: {
    color: '#E0E0E0',
    fontFamily: 'Manrope',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  mainHeading: {
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 38,
    fontWeight: '700',
    lineHeight: 46,
    marginBottom: 16,
  },
  goldText: {
    color: '#B58529',
  },
  subHeading: {
    color: '#A0A0A0',
    fontFamily: 'Manrope',
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
  },
  interactiveSection: {
    paddingHorizontal: 20,
    marginTop: -20,
  },
  composerCard: {
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#222222',
    borderRadius: 18,
    padding: 12,
    marginBottom: 20,
  },
  composerInput: {
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 15,
    minHeight: 80,
    maxHeight: 160,
    textAlignVertical: 'top',
    paddingTop: 4,
    paddingBottom: 8,
    paddingHorizontal: 4,
  },
  attachmentWrapper: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  referencePreviewContainer: {
    position: 'relative',
    width: 72,
    height: 72,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333333',
    backgroundColor: '#1a1a1a',
  },
  referencePreviewImage: {
    width: '100%',
    height: '100%',
  },
  removeReferenceButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  composerToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
    paddingTop: 12,
    marginTop: 4,
  },
  toolbarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toolbarIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#262626',
  },
  toolbarIconButtonActive: {
    borderColor: '#B58529',
    backgroundColor: 'rgba(181, 133, 41, 0.1)',
  },
  compactSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#262626',
    borderRadius: 20,
    padding: 3,
    gap: 2,
  },
  switcherPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 17,
    gap: 4,
  },
  switcherPillActive: {
    backgroundColor: '#B58529',
  },
  switcherPillText: {
    color: '#888888',
    fontFamily: 'Manrope',
    fontSize: 11,
    fontWeight: '600',
  },
  switcherPillTextActive: {
    color: '#000000',
    fontWeight: '700',
  },
  sendIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#262626',
  },
  sendIconButtonActive: {
    backgroundColor: '#B58529',
    borderColor: '#B58529',
  },
  sectionHeading: {
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
    marginTop: 8,
  },
  styleCarousel: {
    gap: 8,
  },
  stylePill: {
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#222222',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stylePillActive: {
    backgroundColor: '#B58529',
    borderColor: '#B58529',
  },
  stylePillText: {
    color: '#888888',
    fontFamily: 'Manrope',
    fontSize: 12,
    fontWeight: '600',
  },
  stylePillTextActive: {
    color: '#000000',
    fontWeight: '700',
  },
  activeStyleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#000000',
    marginRight: 6,
  },
  exploreHeading: {
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    width: '48%',
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: '#222222',
    borderRadius: 16,
    padding: 16,
    minHeight: 140,
  },
  cardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  cardSubtitle: {
    color: '#777777',
    fontFamily: 'Manrope',
    fontSize: 11,
    fontWeight: '400',
    lineHeight: 14,
  },
  pressed: {
    opacity: 0.7,
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 8,
  },
  threeCard: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: '#222222',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 6,
    minHeight: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  threeCardTitle: {
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 8,
    textAlign: 'center',
  },
  threeCardSubtitle: {
    color: '#777777',
    fontFamily: 'Manrope',
    fontSize: 9,
    fontWeight: '400',
    marginTop: 4,
    textAlign: 'center',
  },
});