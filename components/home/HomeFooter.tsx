import { Image } from 'expo-image';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { HomeNavItem } from '@/app/data/home';

type HomeFooterProps = {
  items: HomeNavItem[];
  activeItemId: string;
  onSelectItem?: (itemId: string) => void;
};

function HomeFooterComponent({ items, activeItemId, onSelectItem }: HomeFooterProps) {
  return (
    <View style={styles.footer}>
      {items.map(item => {
        const isActive = item.id === activeItemId;

        const getActiveIconName = (id: string): any => {
          switch (id) {
            case 'home': return 'home';
            case 'design': return 'cube';
            case 'projects': return 'folder';
            case 'shop': return 'bag-handle';
            case 'profile': return 'person-circle';
            default: return 'home';
          }
        };

        return (
          <Pressable
            key={item.id}
            onPress={() => onSelectItem?.(item.id)}
            style={({ pressed }) => [styles.item, pressed && styles.pressed]}
          >
            {item.iconName ? (
              <Ionicons
                name={isActive ? getActiveIconName(item.id) : (item.iconName as any)}
                size={22}
                color={isActive ? '#C9922A' : '#8A8A8F'}
              />
            ) : (
              <Image
                source={item.icon}
                style={[styles.icon, isActive ? styles.activeIcon : styles.inactiveIcon]}
                contentFit="contain"
              />
            )}
            <Text
              style={[styles.label, isActive ? styles.activeLabel : styles.inactiveLabel]}
              allowFontScaling={false}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export const HomeFooter = memo(HomeFooterComponent);

const styles = StyleSheet.create({
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 60,
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: '#111111',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    zIndex: 9,
    elevation: 9,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  icon: {
    width: 22,
    height: 22,
    marginBottom: 3,
  },
  activeIcon: {
    tintColor: '#C9922A',
  },
  inactiveIcon: {
    tintColor: '#8A8A8F',
  },
  label: {
    fontFamily: 'Manrope',
    fontSize: 9,
    marginTop: 2,
  },
  activeLabel: {
    color: '#C9922A',
    fontWeight: '700',
  },
  inactiveLabel: {
    color: '#8A8A8F',
    fontWeight: '500',
  },
  pressed: {
    opacity: 0.75,
  },
});
