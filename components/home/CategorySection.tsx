import { memo } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { HomeCategory } from '@/app/data/home';

type CategorySectionProps = {
  categories: HomeCategory[];
  activeCategoryId: string;
  onSelectCategory?: (categoryId: string) => void;
};

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

const iconForKeyword: Array<[string[], IconName]> = [
  [['chair', 'stool', 'seat'], 'chair-school'],
  [['table', 'desk'], 'table-furniture'],
  [['sofa', 'couch', 'lounge', 'armchair'], 'sofa'],
  [['bed', 'mattress', 'bedroom'], 'bed'],
  [['star', 'feature', 'popular'], 'star'],
  [['bath', 'toilet', 'shower', 'restroom', 'sanitary'], 'bathtub-outline'],
  [['kitchen', 'cabinet', 'cook', 'dining'], 'chef-hat'],
  [['light', 'lamp', 'fixture', 'chandelier'], 'ceiling-light'],
  [['door', 'gate', 'entry'], 'door'],
  [['faucet', 'plumbing', 'water', 'tap', 'fitting'], 'faucet'],
  [['tile', 'floor', 'wall', 'marble'], 'floor-plan'],
  [['paint', 'colour', 'color'], 'format-paint'],
  [['electrical', 'switch', 'socket', 'wire'], 'lightning-bolt-outline'],
  [['tool', 'construction', 'renovation', 'work', 'building'], 'tools'],
  [['decor', 'accessor', 'art', 'mirror'], 'image-frame'],
  [['storage', 'shelf', 'wardrobe'], 'bookshelf'],
  [['garden', 'outdoor'], 'flower-outline'],
];

const fallbackIcons: IconName[] = ['package-variant-closed', 'home-outline', 'shape-outline'];

const normaliseIconName = (value: string) =>
  value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Prefer an exact Material Community icon name from the API, then use category keywords.
// This validation prevents React Native from rendering a question-mark glyph for unknown names.
const getIconByName = (name: string, id: string): IconName => {
  const candidates = [normaliseIconName(name), normaliseIconName(id)];
  const directIcon = candidates.find(candidate => candidate in MaterialCommunityIcons.glyphMap);
  if (directIcon) return directIcon as IconName;

  const searchableName = `${name} ${id}`.toLowerCase();
  const matchedIcon = iconForKeyword.find(([keywords]) =>
    keywords.some(keyword => searchableName.includes(keyword))
  );
  if (matchedIcon) return matchedIcon[1];

  // Keep the fallback stable for a category, so it does not change on every render.
  const stableIndex = [...searchableName].reduce((total, character) => total + character.charCodeAt(0), 0) % fallbackIcons.length;
  return fallbackIcons[stableIndex];
};

function CategorySectionComponent({
  categories,
  activeCategoryId,
  onSelectCategory,
}: CategorySectionProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scrollView}
      contentContainerStyle={styles.container}
    >
      {categories.map(category => {
        const isActive = category.id === activeCategoryId;
        const iconName = getIconByName(category.label, category.id);

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
            <MaterialCommunityIcons
              name={iconName}
              color={isActive ? '#FFFFFF' : '#C9922A'}
              size={20}
            />
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export const CategorySection = memo(CategorySectionComponent);

const styles = StyleSheet.create({
  scrollView: {
    marginTop: 30,
    marginBottom: 29,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingRight: 24,
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
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.97 }],
  },
});
