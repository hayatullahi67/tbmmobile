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

export default function ZioraHomeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [promptText, setPromptText] = useState('');
  const [outputType, setOutputType] = useState<number>(1); // 1 = Image, 2 = Video
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [referenceImageBase64, setReferenceImageBase64] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

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
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets.length > 0) {
      setReferenceImage(result.assets[0].uri);
      setReferenceImageBase64(result.assets[0].base64 || null);
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
        imageBase64: referenceImageBase64 || '',
        isVideo: outputType === 2 ? 'true' : 'false',
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
            {/* Search/Prompt Input */}
            <View style={styles.searchBarContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Ask Ziora anything..."
                placeholderTextColor="#666666"
                value={promptText}
                onChangeText={setPromptText}
                multiline={false}
                returnKeyType="done"
                allowFontScaling={false}
              />
              <Pressable
                style={({ pressed }) => [styles.searchButton, pressed && styles.pressed]}
                onPress={handleSend}
              >
                <Ionicons name="arrow-forward" size={20} color="#000000" />
              </Pressable>
            </View>

            {/* Output Type Switcher Segmented Control */}
            <View style={styles.segmentContainer}>
              <Pressable
                style={[styles.segmentButton, outputType === 1 && styles.segmentActive]}
                onPress={() => setOutputType(1)}
              >
                <Ionicons name="image-outline" size={16} color={outputType === 1 ? '#000000' : '#888888'} />
                <Text style={[styles.segmentText, outputType === 1 && styles.segmentTextActive]} allowFontScaling={false}>
                  Image Result
                </Text>
              </Pressable>
              <Pressable
                style={[styles.segmentButton, outputType === 2 && styles.segmentActive]}
                onPress={() => setOutputType(2)}
              >
                <Ionicons name="videocam-outline" size={16} color={outputType === 2 ? '#000000' : '#888888'} />
                <Text style={[styles.segmentText, outputType === 2 && styles.segmentTextActive]} allowFontScaling={false}>
                  Video Result
                </Text>
              </Pressable>
            </View>

            {/* Reference Image Actions */}
            <View style={styles.pickerSection}>
              <Pressable
                style={({ pressed }) => [styles.imagePickerButton, pressed && styles.pressed]}
                onPress={handleSelectReferenceImage}
              >
                <Ionicons name="camera-outline" size={18} color="#B58529" />
                <Text style={styles.imagePickerText} allowFontScaling={false}>
                  {referenceImage ? 'Change Reference Photo' : 'Add Reference Photo'}
                </Text>
              </Pressable>

              {referenceImage && (
                <View style={styles.referencePreviewContainer}>
                  <Image source={{ uri: referenceImage }} style={styles.referencePreviewImage} />
                  <Pressable style={styles.removeReferenceButton} onPress={() => setReferenceImage(null)}>
                    <Ionicons name="close" size={16} color="#FFFFFF" />
                  </Pressable>
                </View>
              )}
            </View>

            {/* Menu Cards */}
            <Text style={styles.exploreHeading} allowFontScaling={false}>
              Explore Tools
            </Text>
            <View style={styles.gridContainer}>
              {/* Card 1 */}
              <Pressable
                style={({ pressed }) => [styles.card, pressed && styles.pressed]}
                onPress={() => router.push({
                  pathname: '/screens/ziora-ai/VisualizerResultScreen',
                  params: { prompt: 'Modern Luxury Living Room' }
                })}
              >
                <View style={styles.cardIconContainer}>
                  <Ionicons name="home-outline" size={28} color="#B58529" />
                </View>
                <Text style={styles.cardTitle} allowFontScaling={false}>
                  AI Visualizer
                </Text>
                <Text style={styles.cardSubtitle} allowFontScaling={false}>
                  See before{'\n'}you build
                </Text>
              </Pressable>

              {/* Card 2 */}
              <Pressable
                style={({ pressed }) => [styles.card, pressed && styles.pressed]}
                onPress={() => router.push('/screens/ziora-ai/RenovationEstimatesScreen')}
              >
                <View style={styles.cardIconContainer}>
                  <Ionicons name="document-text-outline" size={28} color="#B58529" />
                </View>
                <Text style={styles.cardTitle} allowFontScaling={false}>
                  Estimates
                </Text>
                <Text style={styles.cardSubtitle} allowFontScaling={false}>
                  Get accurate{'\n'}costs
                </Text>
              </Pressable>

              {/* Card 3 */}
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
                  Find the{'\n'}best
                </Text>
              </Pressable>

              {/* Card 4 */}
              <Pressable
                style={({ pressed }) => [styles.card, pressed && styles.pressed]}
                onPress={() => router.push('/screens/ziora-ai/InspirationScreen')}
              >
                <View style={styles.cardIconContainer}>
                  <Ionicons name="bulb-outline" size={28} color="#B58529" />
                </View>
                <Text style={styles.cardTitle} allowFontScaling={false}>
                  Inspiration
                </Text>
                <Text style={styles.cardSubtitle} allowFontScaling={false}>
                  Design{'\n'}ideas
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
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111111',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#222222',
    paddingLeft: 16,
    paddingRight: 6,
    height: 56,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 14,
  },
  searchButton: {
    backgroundColor: '#B58529',
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#222222',
    borderRadius: 12,
    padding: 3,
    marginBottom: 16,
    gap: 4,
  },
  segmentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 9,
    gap: 6,
  },
  segmentActive: {
    backgroundColor: '#B58529',
  },
  segmentText: {
    color: '#888888',
    fontFamily: 'Manrope',
    fontSize: 12,
    fontWeight: '600',
  },
  segmentTextActive: {
    color: '#000000',
    fontWeight: '700',
  },
  pickerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: '#222222',
    borderRadius: 12,
    padding: 10,
  },
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  imagePickerText: {
    color: '#B58529',
    fontFamily: 'Manrope',
    fontSize: 13,
    fontWeight: '600',
  },
  referencePreviewContainer: {
    position: 'relative',
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333333',
  },
  referencePreviewImage: {
    width: '100%',
    height: '100%',
  },
  removeReferenceButton: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 10,
    padding: 2,
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
});