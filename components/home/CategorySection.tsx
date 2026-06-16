import { Image } from 'expo-image';
import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { HomeCategory } from '@/app/data/home';

type CategorySectionProps = {
  categories: HomeCategory[];
  activeCategoryId: string;
  onSelectCategory?: (categoryId: string) => void;
};

function CategorySectionComponent({
  categories,
  activeCategoryId,
  onSelectCategory,
}: CategorySectionProps) {
  return (
    <View style={styles.container}>
      {categories.map(category => {
        const isActive = category.id === activeCategoryId;

        return (
          <Pressable
            key={category.id}
            onPress={() => onSelectCategory?.(category.id)}
            style={({ pressed }) => [
              styles.categoryButton,
              isActive && styles.activeCategoryButton,
              pressed && styles.pressed,
            ]}
          >
            <Image
              source={category.icon}
              style={[styles.categoryIcon, isActive && styles.activeCategoryIcon]}
              contentFit="contain"
            />
          </Pressable>
        );
      })}
    </View>
  );
}

export const CategorySection = memo(CategorySectionComponent);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 30,
    marginBottom: 29,
  },
  categoryButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#252523',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeCategoryButton: {
    backgroundColor: '#C9922A',
  },
  categoryIcon: {
    width: 20,
    height: 20,
    tintColor: '#C9922A',
  },
  activeCategoryIcon: {
    tintColor: '#FFFFFF',
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.97 }],
  },
});
