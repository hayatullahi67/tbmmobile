import { Image } from 'expo-image';
import { memo } from 'react';
import { Pressable, StyleSheet } from 'react-native';

type FloatingZioraButtonProps = {
  onPress?: () => void;
};

function FloatingZioraButtonComponent({ onPress }: FloatingZioraButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Image
        source={require('@/assets/images/ziora.png')}
        style={styles.image}
        contentFit="contain"
      />
    </Pressable>
  );
}

export const FloatingZioraButton = memo(FloatingZioraButtonComponent);

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    right: 23,
    bottom: 69,
    width: 51,
    height: 51,
    borderRadius: 25.5,
    backgroundColor: '#C9922A',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    elevation: 10,
  },
  image: {
    width: 41,
    height: 41,
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.96 }],
  },
});
