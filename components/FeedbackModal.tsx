import React, { useEffect, useRef, useState } from 'react';
import { Modal, View, Text, StyleSheet, Pressable, Dimensions, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const GOLD = '#C9922A';

interface FeedbackModalProps {
  visible: boolean;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
  buttonText?: string;
  secondaryButtonText?: string;
  onClose: () => void;
  onConfirm?: () => void;
}

export default function FeedbackModal({ 
  visible, 
  type, 
  title, 
  message, 
  buttonText, 
  secondaryButtonText = 'Cancel', 
  onClose,
  onConfirm
}: FeedbackModalProps) {
  const [showModal, setShowModal] = useState(visible);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (visible) {
      setShowModal(true);
      fadeAnim.setValue(0);
      slideAnim.setValue(SCREEN_HEIGHT);
      
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss after 5 seconds (only for standard alerts, not confirmation dialogs)
      if (!onConfirm) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          handleClose();
        }, 5000);
      }

    } else if (showModal) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowModal(false);
      });
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [visible]);

  const handleClose = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowModal(false);
      onClose();
    });
  };

  const handleConfirm = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowModal(false);
      if (onConfirm) {
        onConfirm();
      }
    });
  };

  const getIconName = () => {
    switch (type) {
      case 'success':
        return 'checkmark-sharp';
      case 'error':
        return 'close-sharp';
      case 'info':
      default:
        return 'information-sharp';
    }
  };

  const getStatusStyles = () => {
    switch (type) {
      case 'success':
        return {
          iconColor: '#4CAF50',
          bgColor: 'rgba(76, 175, 80, 0.12)',
          borderColor: 'rgba(76, 175, 80, 0.25)',
        };
      case 'error':
        return {
          iconColor: '#F44336',
          bgColor: 'rgba(244, 67, 54, 0.12)',
          borderColor: 'rgba(244, 67, 54, 0.25)',
        };
      case 'info':
      default:
        return {
          iconColor: GOLD,
          bgColor: 'rgba(201, 146, 42, 0.12)',
          borderColor: 'rgba(201, 146, 42, 0.25)',
        };
    }
  };

  const status = getStatusStyles();
  const resolvedButtonText = buttonText || (
    type === 'success' ? 'Awesome' : 
    type === 'error' ? 'Okay' : 'Understand'
  );

  return (
    <Modal
      transparent
      visible={showModal}
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <Animated.View 
          style={[
            styles.backdrop, 
            { opacity: fadeAnim }
          ]} 
        />
        <Animated.View 
          style={[
            styles.container, 
            { 
              transform: [{ translateY: slideAnim }],
              borderColor: status.borderColor
            }
          ]}
        >
          <View style={styles.grabHandle} />

          <View style={styles.iconWrapper}>
            {/* Tech Blueprint Dashed Rings */}
            <View style={[styles.orbitRing, styles.ringOuter]} />
            <View style={[styles.orbitRing, styles.ringInner]} />
            
            {/* Rotated Diamond Status Badge */}
            <View 
              style={[
                styles.diamondBadge, 
                { 
                  backgroundColor: status.bgColor, 
                  borderColor: status.borderColor 
                }
              ]}
            >
              {/* Counter-rotation to keep the icon itself upright */}
              <View style={styles.iconInner}>
                <Ionicons name={getIconName()} size={28} color={status.iconColor} />
              </View>
            </View>
          </View>
          
          <Text style={styles.title} allowFontScaling={false}>
            {title}
          </Text>
          
          <Text style={styles.message} allowFontScaling={false}>
            {message}
          </Text>
          
          {onConfirm ? (
            <View style={styles.buttonRow}>
              <Pressable
                onPress={handleClose}
                style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
              >
                <Text style={styles.secondaryButtonText} allowFontScaling={false}>
                  {secondaryButtonText}
                </Text>
              </Pressable>
              <Pressable
                onPress={handleConfirm}
                style={({ pressed }) => [
                  styles.primaryHalfButton, 
                  { backgroundColor: status.iconColor, shadowColor: status.iconColor },
                  pressed && styles.pressed
                ]}
              >
                <Text style={styles.buttonText} allowFontScaling={false}>
                  {resolvedButtonText}
                </Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={handleClose}
              style={({ pressed }) => [
                styles.button, 
                { backgroundColor: status.iconColor, shadowColor: status.iconColor },
                pressed && styles.pressed
              ]}
            >
              <Text style={styles.buttonText} allowFontScaling={false}>
                {resolvedButtonText}
              </Text>
            </Pressable>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  container: {
    width: '100%',
    backgroundColor: '#121211',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1.5,
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 40 : 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.35,
    shadowRadius: 15,
    elevation: 24,
  },
  grabHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignSelf: 'center',
    marginBottom: 20,
  },
  iconWrapper: {
    height: 110,
    width: 110,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  orbitRing: {
    position: 'absolute',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 999,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  ringOuter: {
    width: 96,
    height: 96,
    opacity: 0.4,
  },
  ringInner: {
    width: 74,
    height: 74,
    opacity: 0.7,
  },
  diamondBadge: {
    width: 52,
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '45deg' }],
  },
  iconInner: {
    transform: [{ rotate: '-45deg' }],
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Manrope_700Bold',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  message: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 14,
    fontFamily: 'Manrope_400Regular',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Manrope_700Bold',
    letterSpacing: 0.3,
  },
  primaryHalfButton: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  button: {
    width: '100%',
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Manrope_700Bold',
    letterSpacing: 0.3,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.97 }],
  },
});


