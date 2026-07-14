import React, { useState, useMemo } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Pressable,
  FlatList,
  Modal,
  Platform,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export const options = {
  headerShown: false,
};

interface InspirationItem {
  id: string;
  title: string;
  category: 'Kitchen' | 'Bathroom' | 'Bedroom' | 'Living Room' | 'Office' | 'Outdoor';
  style: 'Modern' | 'Luxury' | 'Minimalist';
  image: string;
  isLocked: boolean;
  tier: 'Economy' | 'Premium' | 'Luxury';
  description: string;
}

// Hardcoded premium design inspiration entries based on the Ziora spec
const INSPIRATION_DESIGNS: InspirationItem[] = [
  {
    id: 'insp-1',
    title: 'Minimalist Culinary Space',
    category: 'Kitchen',
    style: 'Minimalist',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80',
    isLocked: false,
    tier: 'Economy',
    description: 'Clean handleless cabinets, integrated smart appliances, and a polished quartz island countertop.',
  },
  {
    id: 'insp-2',
    title: 'Scandinavian Sanctuary',
    category: 'Bedroom',
    style: 'Minimalist',
    image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=600&auto=format&fit=crop&q=80',
    isLocked: false,
    tier: 'Economy',
    description: 'Natural oak timber panels, cozy linen layers, and floor-to-ceiling perimeter window bays.',
  },
  {
    id: 'insp-3',
    title: 'Modern Luxury Living Room',
    category: 'Living Room',
    style: 'Luxury',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&auto=format&fit=crop&q=80',
    isLocked: true,
    tier: 'Premium',
    description: 'Fluted architectural walnut wall panels, custom brass fittings, and low-profile velvet lounge seating.',
  },
  {
    id: 'insp-4',
    title: 'Industrial Executive Suite',
    category: 'Office',
    style: 'Modern',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop&q=80',
    isLocked: true,
    tier: 'Premium',
    description: 'Matte black structural steel frames, polished architectural concrete, and integrated smart LED strip runs.',
  },
  {
    id: 'insp-5',
    title: 'Spa-Inspired Bath Oasis',
    category: 'Bathroom',
    style: 'Luxury',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80',
    isLocked: true,
    tier: 'Luxury',
    description: 'Floating double slab wash vanity, freestanding soaking stone tub, and book-matched Carrara marble tiling.',
  },
  {
    id: 'insp-6',
    title: 'Biophilic Patio Deck',
    category: 'Outdoor',
    style: 'Modern',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80',
    isLocked: true,
    tier: 'Luxury',
    description: 'Premium teak decking planks, flush glass transitions, and a lush perimeter garden landscape wall.',
  },
];

export default function InspirationScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [upgradeModalVisible, setUpgradeModalVisible] = useState<boolean>(false);
  const [selectedTier, setSelectedTier] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<InspirationItem | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState<boolean>(false);

  const categories = ['All', 'Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Office', 'Outdoor'];

  // Filtered dataset
  const filteredItems = useMemo(() => {
    return selectedCategory === 'All' || selectedCategory === ''
      ? INSPIRATION_DESIGNS
      : INSPIRATION_DESIGNS.filter((item) => item.category === selectedCategory);
  }, [selectedCategory]);

  const handleCardPress = (item: InspirationItem) => {
    if (item.isLocked) {
      setSelectedTier(item.tier);
      setSelectedItem(item);
      setUpgradeModalVisible(true);
    } else {
      setSelectedItem(item);
      setDetailsModalVisible(true);
    }
  };

  const handleApplyStyle = () => {
    if (!selectedItem) return;
    setDetailsModalVisible(false);
    
    // Pass prefilled style back to ZioraHomeScreen
    router.replace({
      pathname: '/screens/ziora-ai/ZioraHomeScreen',
      params: {
        prefilledPrompt: `${selectedItem.style} ${selectedItem.category} - ${selectedItem.title}`,
        prefilledImage: selectedItem.image,
      },
    });
  };

  const renderDesignItem = ({ item }: { item: InspirationItem }) => {
    return (
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        onPress={() => handleCardPress(item)}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.image }} style={styles.cardImage} contentFit="cover" transition={200} />
          
          {/* Top badges */}
          <View style={styles.badgeRow}>
            <View style={styles.styleBadge}>
              <Text style={styles.styleBadgeText} allowFontScaling={false}>
                {item.style}
              </Text>
            </View>
            
            {item.isLocked && (
              <View style={[styles.tierBadge, item.tier === 'Luxury' ? styles.luxuryBadge : styles.premiumBadge]}>
                <Ionicons name="lock-closed" size={10} color="#000000" style={{ marginRight: 2 }} />
                <Text style={styles.tierBadgeText} allowFontScaling={false}>
                  {item.tier.toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          {/* Translucent overlay for locked premium designs */}
          {item.isLocked && (
            <View style={styles.lockOverlay}>
              <View style={styles.lockIconCircle}>
                <Ionicons name="lock-closed-outline" size={24} color="#C9922A" />
              </View>
              <Text style={styles.lockOverlayText} allowFontScaling={false}>
                Unlock with {item.tier}
              </Text>
            </View>
          )}

          {/* Bottom title gradient */}
          <LinearGradient
            colors={['transparent', 'rgba(0, 0, 0, 0.6)', 'rgba(0, 0, 0, 0.95)']}
            style={styles.cardGradient}
          />

          <View style={styles.cardInfo}>
            <Text style={styles.cardCategory} allowFontScaling={false}>
              {item.category.toUpperCase()}
            </Text>
            <Text style={styles.cardTitle} allowFontScaling={false}>
              {item.title}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && styles.pressedIcon]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#C9922A" />
        </Pressable>
        <Text style={styles.headerTitle} allowFontScaling={false}>
          Ziora Inspiration
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* ── CATEGORY TAB BAR ── */}
      <View style={styles.tabBarContainer}>
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(cat) => cat}
          contentContainerStyle={styles.tabsScrollContent}
          renderItem={({ item }) => {
            const isActive = selectedCategory === item;
            return (
              <Pressable
                style={[styles.tabButton, isActive && styles.tabButtonActive]}
                onPress={() => setSelectedCategory(item)}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]} allowFontScaling={false}>
                  {item}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      {/* ── GRID LIST OF DESIGNS ── */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={renderDesignItem}
        contentContainerStyle={styles.gridContent}
        showsVerticalScrollIndicator={false}
        numColumns={2}
        columnWrapperStyle={styles.rowWrapper}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="images-outline" size={48} color="#333333" />
            <Text style={styles.emptyText} allowFontScaling={false}>
              No concepts found
            </Text>
          </View>
        }
      />

      {/* ── DETAILS MODAL (UNLOCKED CARDS) ── */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={detailsModalVisible}
        onRequestClose={() => setDetailsModalVisible(false)}
      >
        <View style={styles.modalCenteredView}>
          <View style={styles.modalDetailsContent}>
            {selectedItem && (
              <>
                <View style={styles.modalImageWrapper}>
                  <Image source={{ uri: selectedItem.image }} style={styles.modalImage} contentFit="cover" />
                  <Pressable style={styles.closeModalButton} onPress={() => setDetailsModalVisible(false)}>
                    <Ionicons name="close" size={20} color="#FFFFFF" />
                  </Pressable>
                </View>

                <View style={styles.modalBody}>
                  <View style={styles.modalBadgeRow}>
                    <Text style={styles.modalCategory} allowFontScaling={false}>
                      {selectedItem.category.toUpperCase()} • {selectedItem.style}
                    </Text>
                    <View style={styles.freeBadge}>
                      <Text style={styles.freeBadgeText} allowFontScaling={false}>FREE USE</Text>
                    </View>
                  </View>

                  <Text style={styles.modalTitle} allowFontScaling={false}>
                    {selectedItem.title}
                  </Text>
                  
                  <Text style={styles.modalDesc} allowFontScaling={false}>
                    {selectedItem.description}
                  </Text>

                  <Pressable
                    style={({ pressed }) => [styles.applyButton, pressed && styles.applyButtonPressed]}
                    onPress={handleApplyStyle}
                  >
                    <Ionicons name="sparkles" size={18} color="#000000" style={{ marginRight: 8 }} />
                    <Text style={styles.applyButtonText} allowFontScaling={false}>
                      Use Style in Visualizer
                    </Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* ── UPGRADE PAYWALL MODAL (LOCKED CARDS) ── */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={upgradeModalVisible}
        onRequestClose={() => setUpgradeModalVisible(false)}
      >
        <View style={styles.paywallCenteredView}>
          <View style={styles.paywallCard}>
            <Pressable style={styles.closePaywallButton} onPress={() => setUpgradeModalVisible(false)}>
              <Ionicons name="close" size={24} color="#888888" />
            </Pressable>

            <View style={styles.paywallIconContainer}>
              <Ionicons name="ribbon-outline" size={48} color="#C9922A" />
            </View>

            <Text style={styles.paywallTitle} allowFontScaling={false}>
              Unlock Ziora {selectedTier}
            </Text>

            <Text style={styles.paywallSub} allowFontScaling={false}>
              This design concept is locked under the premium tier. Upgrade to unlock elite architectural assets.
            </Text>

            <View style={styles.benefitsBox}>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={16} color="#C9922A" style={{ marginRight: 8 }} />
                <Text style={styles.benefitText} allowFontScaling={false}>Unlimited Concept Generations</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={16} color="#C9922A" style={{ marginRight: 8 }} />
                <Text style={styles.benefitText} allowFontScaling={false}>Full Bill of Quantities (BOQ)</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={16} color="#C9922A" style={{ marginRight: 8 }} />
                <Text style={styles.benefitText} allowFontScaling={false}>Direct Bogat Cart Integration</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={16} color="#C9922A" style={{ marginRight: 8 }} />
                <Text style={styles.benefitText} allowFontScaling={false}>TBM Construction Booking Form</Text>
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [styles.upgradeButton, pressed && styles.upgradeButtonPressed]}
              onPress={() => {
                setUpgradeModalVisible(false);
                Alert.alert('Upgrade Demo', `Simulated payment check processing for Ziora ${selectedTier} tier subscription... Success!`);
              }}
            >
              <Text style={styles.upgradeButtonText} allowFontScaling={false}>
                Upgrade to {selectedTier}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#070707',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: '#151515',
    marginTop: Platform.OS === 'android' ? 12 : 4,
  },
  backButton: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: '#0F0F0F',
    borderWidth: 1,
    borderColor: '#1D1D1D',
  },
  pressedIcon: {
    opacity: 0.7,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 16,
    fontWeight: '700',
  },
  tabBarContainer: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#111111',
  },
  tabsScrollContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#222222',
    backgroundColor: '#0F0F0F',
  },
  tabButtonActive: {
    backgroundColor: 'rgba(201, 146, 42, 0.15)',
    borderColor: '#C9922A',
  },
  tabText: {
    color: '#8E8E93',
    fontFamily: 'Manrope',
    fontSize: 12,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#C9922A',
    fontWeight: '700',
  },
  gridContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  rowWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    width: '48%',
    aspectRatio: 0.8,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#1F1F1F',
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  badgeRow: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  styleBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  styleBadgeText: {
    color: '#E0E0E0',
    fontFamily: 'Manrope',
    fontSize: 9,
    fontWeight: '600',
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  premiumBadge: {
    backgroundColor: '#E0E0E0',
  },
  luxuryBadge: {
    backgroundColor: '#C9922A',
  },
  tierBadgeText: {
    color: '#000000',
    fontFamily: 'Manrope',
    fontSize: 9,
    fontWeight: '700',
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  lockIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C9922A',
    marginBottom: 6,
  },
  lockOverlayText: {
    color: '#E0E0E0',
    fontFamily: 'Manrope',
    fontSize: 10,
    fontWeight: '600',
  },
  cardGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    zIndex: 2,
  },
  cardInfo: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    zIndex: 3,
  },
  cardCategory: {
    color: '#C9922A',
    fontFamily: 'Manrope',
    fontSize: 8,
    fontWeight: '700',
    marginBottom: 2,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    color: '#444444',
    fontFamily: 'Manrope',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 10,
  },
  modalCenteredView: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalDetailsContent: {
    backgroundColor: '#0F0F0F',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    paddingBottom: 40,
    maxHeight: '85%',
  },
  modalImageWrapper: {
    width: '100%',
    height: 250,
    position: 'relative',
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  closeModalButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    padding: 20,
  },
  modalBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalCategory: {
    color: '#C9922A',
    fontFamily: 'Manrope',
    fontSize: 11,
    fontWeight: '700',
  },
  freeBadge: {
    backgroundColor: '#34C759',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  freeBadgeText: {
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 9,
    fontWeight: '700',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 12,
  },
  modalDesc: {
    color: '#AEAEB2',
    fontFamily: 'Manrope',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 24,
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#C9922A',
    borderRadius: 12,
    height: 52,
  },
  applyButtonPressed: {
    backgroundColor: '#A37521',
    transform: [{ scale: 0.98 }],
  },
  applyButtonText: {
    color: '#000000',
    fontFamily: 'Manrope',
    fontSize: 15,
    fontWeight: '700',
  },
  paywallCenteredView: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  paywallCard: {
    width: '100%',
    backgroundColor: '#0F0F0F',
    borderWidth: 1,
    borderColor: '#222222',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    position: 'relative',
  },
  closePaywallButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 4,
  },
  paywallIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(201, 146, 42, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(201, 146, 42, 0.25)',
  },
  paywallTitle: {
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  paywallSub: {
    color: '#8A8A8F',
    fontFamily: 'Manrope',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  benefitsBox: {
    width: '100%',
    backgroundColor: '#070707',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1A1A1A',
    marginBottom: 24,
    gap: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitText: {
    color: '#E5E5EA',
    fontFamily: 'Manrope',
    fontSize: 13,
  },
  upgradeButton: {
    width: '100%',
    height: 52,
    backgroundColor: '#C9922A',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  upgradeButtonPressed: {
    backgroundColor: '#A37521',
    transform: [{ scale: 0.98 }],
  },
  upgradeButtonText: {
    color: '#000000',
    fontFamily: 'Manrope',
    fontSize: 15,
    fontWeight: '700',
  },
});
