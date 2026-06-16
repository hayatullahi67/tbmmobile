import React from 'react';
import { StyleSheet, Text, Pressable, ScrollView, View } from 'react-native';

interface MaterialFilterTabsProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export default function MaterialFilterTabs({
  categories,
  selectedCategory,
  onSelectCategory,
}: MaterialFilterTabsProps) {
  return (
    <View style={styles.outerContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        bounces={true}
      >
        {categories.map((category) => {
          const isActive = selectedCategory === category;
          return (
            <Pressable
              key={category}
              onPress={() => onSelectCategory(category)}
              style={({ pressed }) => [
                styles.tabPill,
                isActive ? styles.tabActive : styles.tabInactive,
                pressed && styles.tabPressed,
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  isActive ? styles.tabTextActive : styles.tabTextInactive,
                ]}
                allowFontScaling={false}
              >
                {category}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    marginVertical: 18,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    gap: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabPill: {
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 25,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#C9922A',
    borderColor: '#C9922A',
    shadowColor: '#C9922A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  tabInactive: {
    backgroundColor: '#0F0F0F',
    borderColor: '#1D1D1D',
  },
  tabPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },
  tabText: {
    fontFamily: 'Manrope',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  tabTextInactive: {
    color: '#8E8E93',
  },
});
