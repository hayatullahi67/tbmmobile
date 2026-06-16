import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

function VirtualShowroomBannerComponent() {
  return (
    <View style={styles.container}>
      {/* Gradient — dark gold left → black right */}
      <LinearGradient
        colors={['#C9922A', '#6B4A10', '#1A1A1A', '#000000']}
        locations={[0, 0.35, 0.65, 1]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.copy}>
        <Text style={styles.title} allowFontScaling={false}>
          Virtual Reality Showroom
        </Text>
        <Text style={styles.description} allowFontScaling={false}>
          Allows you to view our showrooms containing our latest furniture collections
        </Text>
      </View>

      <Image
        source={require('@/assets/images/PngItem.png')}
        style={styles.image}
        contentFit="contain"
      />
    </View>
  );
}

export const VirtualShowroomBanner = memo(VirtualShowroomBannerComponent);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 99,
    borderRadius: 8,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 23,
    paddingRight: 6,
    marginTop: 8,
    marginBottom: 25,
  },
  copy: {
    flex: 1,
    paddingRight: 8,
    zIndex: 1,
  },
  title: {
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
    marginBottom: 2,
  },
  description: {
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 6,
    fontWeight: '500',
    lineHeight: 9,
  },
  image: {
    width: '42%',
    maxWidth: 140,
    minWidth: 96,
    height: 83,
    zIndex: 1,
  },
});
