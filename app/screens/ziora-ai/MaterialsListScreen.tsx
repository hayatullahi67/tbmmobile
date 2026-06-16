import React, { useState, useMemo } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TextInput,
  FlatList,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getMaterialsForPrompt, MaterialItem } from '@/app/screens/ziora-ai/mockVisualizerData';
import MaterialCard from '@/components/ziora-ai/MaterialCard';
import MaterialFilterTabs from '@/components/ziora-ai/MaterialFilterTabs';

export const options = {
  headerShown: false,
};

export default function MaterialsListScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const prompt = (params.prompt as string) || '';

  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isSearching, setIsSearching] = useState(false);

  // Fetch materials for current visualizer concept
  const materials = useMemo(() => {
    return getMaterialsForPrompt(prompt);
  }, [prompt]);

  // Categories list
  const categories = ['All', 'Flooring', 'Walls', 'Roofing', 'Windows'];

  // Filtered materials
  const filteredMaterials = useMemo(() => {
    return materials.filter((item) => {
      const matchesCategory =
        selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(searchText.toLowerCase()) ||
        item.description.toLowerCase().includes(searchText.toLowerCase()) ||
        item.category.toLowerCase().includes(searchText.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [materials, selectedCategory, searchText]);

  const handleAddMaterial = (item: MaterialItem) => {
    router.push({
      pathname: '/screens/ziora-ai/SelectComponentsScreen',
      params: {
        id: item.id,
        name: item.name,
        category: item.category,
        price: item.price,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* Header Navigation Bar */}
        <View style={styles.navBar}>
          <Pressable
            style={({ pressed }) => [styles.backButton, pressed && styles.headerButtonPressed]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#C9922A" />
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.searchToggle, pressed && styles.headerButtonPressed]}
            onPress={() => setIsSearching(!isSearching)}
          >
            <Ionicons name="search-outline" size={24} color="#C9922A" />
          </Pressable>
        </View>

        {/* Title & Brand Section */}
        <View style={styles.brandContainer}>
          <Text style={styles.logoText} allowFontScaling={false}>
            B O G A T
          </Text>
          <Text style={styles.subtitleText} allowFontScaling={false}>
            Premium Materials
          </Text>
        </View>

        {/* Search Bar Input */}
        <View style={styles.searchSection}>
          <View style={styles.searchBarWrapper}>
            <Ionicons name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search materials, brands, categories..."
              placeholderTextColor="#636366"
              value={searchText}
              onChangeText={setSearchText}
              returnKeyType="search"
              clearButtonMode="while-editing"
              allowFontScaling={false}
            />
            {searchText ? (
              <Pressable onPress={() => setSearchText('')} style={styles.clearButton}>
                <Ionicons name="close-circle" size={16} color="#8E8E93" />
              </Pressable>
            ) : null}
          </View>
        </View>

        {/* Category Filter Pills (Modularized) */}
        <MaterialFilterTabs
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Dynamic Material List */}
        <FlatList
          data={filteredMaterials}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MaterialCard item={item} onAddPress={handleAddMaterial} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          initialNumToRender={4}
          maxToRenderPerBatch={8}
          windowSize={5}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="cube-outline" size={48} color="#2C2C2E" style={styles.emptyIcon} />
              <Text style={styles.emptyText} allowFontScaling={false}>
                No premium materials match your filter.
              </Text>
              <Text style={styles.emptySubText} allowFontScaling={false}>
                Try adjusting your search query or selecting a different category.
              </Text>
            </View>
          }
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#070707',
  },
  container: {
    flex: 1,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: Platform.OS === 'android' ? 10 : 0,
  },
  backButton: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: '#0F0F0F',
    borderWidth: 1,
    borderColor: '#1D1D1D',
  },
  searchToggle: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: '#0F0F0F',
    borderWidth: 1,
    borderColor: '#1D1D1D',
  },
  headerButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  brandContainer: {
    paddingHorizontal: 22,
    marginTop: 8,
    marginBottom: 16,
  },
  logoText: {
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 2,
  },
  subtitleText: {
    color: '#C9922A',
    fontFamily: 'Manrope',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
    opacity: 0.85,
  },
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F0F0F',
    borderWidth: 1,
    borderColor: '#1D1D1D',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 14,
    fontWeight: '500',
  },
  clearButton: {
    padding: 4,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyText: {
    color: '#E5E5EA',
    fontFamily: 'Manrope',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 6,
  },
  emptySubText: {
    color: '#8E8E93',
    fontFamily: 'Manrope',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
