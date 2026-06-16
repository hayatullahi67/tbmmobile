import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { MaterialItem } from '@/app/screens/ziora-ai/mockVisualizerData';

interface MaterialCardProps {
  item: MaterialItem;
  onAddPress?: (item: MaterialItem) => void;
}

export default function MaterialCard({ item, onAddPress }: MaterialCardProps) {
  const isLuxury = item.tag === 'Luxury';

  return (
    <View style={styles.cardContainer}>
      {/* ── Image & Tag ── */}
      <View style={styles.imageWrapper}>
        <Image
          source={typeof item.image === 'number' ? item.image : { uri: item.image }}
          style={styles.cardImage}
          contentFit="cover"
          transition={250}
        />
        {/* Luxury / Economy Tag */}
        <View style={[styles.tagBadge, isLuxury ? styles.tagLuxury : styles.tagEconomy]}>
          <Text style={[styles.tagText, isLuxury ? styles.tagTextLuxury : styles.tagTextEconomy]} allowFontScaling={false}>
            {item.tag}
          </Text>
        </View>
      </View>

      {/* ── Content Area ── */}
      <View style={styles.contentContainer}>
        {/* Title */}
        <Text style={styles.titleText} allowFontScaling={false}>
          {item.name}
        </Text>

        {/* Price & Unit */}
        <Text style={styles.priceText} allowFontScaling={false}>
          {item.price}
          <Text style={styles.unitText}> {item.unit}</Text>
        </Text>

        {/* Description */}
        <Text style={styles.descriptionText} numberOfLines={3} allowFontScaling={false}>
          {item.description}
        </Text>

        {/* Dynamic Badges Row */}
        <View style={styles.badgesRow}>
          {item.badges.map((badge, idx) => {
            const isInStock = badge.toLowerCase().includes('in stock');
            return (
              <View
                key={`${badge}-${idx}`}
                style={[
                  styles.badgePill,
                  isInStock ? styles.badgeInStock : styles.badgeShipping,
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    isInStock ? styles.badgeTextInStock : styles.badgeTextShipping,
                  ]}
                  allowFontScaling={false}
                >
                  {badge}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Bottom Details Row */}
        <View style={styles.bottomRow}>
          <View style={styles.quantityContainer}>
            <Text style={styles.quantityLabel} allowFontScaling={false}>
              • QUANTITY
            </Text>
            <Text style={styles.quantityValue} allowFontScaling={false}>
              {item.quantity}
            </Text>
          </View>

          {/* Plus Add Button */}
          <Pressable
            style={({ pressed }) => [styles.plusButton, pressed && styles.plusPressed]}
            onPress={() => onAddPress?.(item)}
          >
            <Ionicons name="add" size={22} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#0F0F0F',
    borderWidth: 1,
    borderColor: '#1D1D1D',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  imageWrapper: {
    width: '100%',
    height: 180,
    position: 'relative',
    backgroundColor: '#1E1E1E',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  tagBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 3,
  },
  tagLuxury: {
    backgroundColor: '#C9922A',
  },
  tagEconomy: {
    backgroundColor: '#3A3A3C',
  },
  tagText: {
    fontFamily: 'Manrope',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  tagTextLuxury: {
    color: '#FFFFFF',
  },
  tagTextEconomy: {
    color: '#E5E5EA',
  },
  contentContainer: {
    padding: 20,
  },
  titleText: {
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    marginBottom: 6,
  },
  priceText: {
    color: '#C9922A',
    fontFamily: 'Manrope',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  unitText: {
    color: '#8A8A8F',
    fontFamily: 'Manrope',
    fontSize: 12,
    fontWeight: '500',
  },
  descriptionText: {
    color: '#AEAEB2',
    fontFamily: 'Manrope',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '400',
    marginBottom: 16,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  badgePill: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  badgeInStock: {
    backgroundColor: 'rgba(52, 199, 89, 0.08)',
    borderColor: 'rgba(52, 199, 89, 0.25)',
  },
  badgeShipping: {
    backgroundColor: 'rgba(181, 133, 41, 0.06)',
    borderColor: 'rgba(181, 133, 41, 0.2)',
  },
  badgeText: {
    fontFamily: 'Manrope',
    fontSize: 10,
    fontWeight: '600',
  },
  badgeTextInStock: {
    color: '#34C759',
  },
  badgeTextShipping: {
    color: '#C9922A',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#1D1D1D',
    paddingTop: 16,
    marginTop: 4,
  },
  quantityContainer: {
    flexDirection: 'column',
    gap: 4,
  },
  quantityLabel: {
    color: '#8A8A8F',
    fontFamily: 'Manrope',
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  quantityValue: {
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 16,
    fontWeight: '700',
  },
  plusButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#8C641D',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#C9922A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  plusPressed: {
    backgroundColor: '#C9922A',
    transform: [{ scale: 0.94 }],
  },
});
