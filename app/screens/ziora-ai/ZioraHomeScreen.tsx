import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

export const options = {
  headerShown: false,
};

export default function ZioraHomeScreen() {
  const router = useRouter();
  const [promptText, setPromptText] = useState('');

  const handleSend = () => {
    if (!promptText.trim()) return;
    router.push({
      pathname: '/screens/ziora-ai/VisualizerResultScreen',
      params: { prompt: promptText.trim() },
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
                Ask anything about construction,{'\n'}renovation, materials, or estimates.
              </Text>
            </View>
          </View>

          {/* Interactive Section */}
          <View style={styles.interactiveSection}>
            {/* Search/Prompt Input */}
            <View style={styles.inputContainer}>
              <Ionicons name="sparkles" size={20} color="#B58529" style={styles.inputIconLeft} />
              <TextInput
                style={styles.textInput}
                placeholder="Ask Ziora anything..."
                placeholderTextColor="#888888"
                returnKeyType="send"
                value={promptText}
                onChangeText={setPromptText}
                onSubmitEditing={handleSend}
              />
              <Pressable 
                style={({ pressed }) => [styles.micButton, pressed && styles.pressed]}
                onPress={handleSend}
              >
                <Ionicons name="mic-outline" size={24} color="#B58529" />
              </Pressable>
            </View>

            {/* Feature Cards */}
            <View style={styles.cardsRow}>
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
              <Pressable style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
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
              <Pressable style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
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
              <Pressable style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
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
    bottom: 150,
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
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '400',
  },
  interactiveSection: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 60,
    marginBottom: 24,
  },
  inputIconLeft: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 15,
  },
  micButton: {
    padding: 8,
    marginLeft: 8,
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  card: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: '#222222',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'flex-start',
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
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 6,
  },
  cardSubtitle: {
    color: '#777777',
    fontFamily: 'Manrope',
    fontSize: 10,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 14,
  },
  pressed: {
    opacity: 0.7,
  },
});
