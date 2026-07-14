import React from 'react';
import { Modal, View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GOLD = '#C9922A';

interface FeedbackModalProps {
  visible: boolean;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
  onClose: () => void;
}

export default function FeedbackModal({ visible, type, title, message, onClose }: FeedbackModalProps) {
  const getIconName = () => {
    switch (type) {
      case 'success':
        return 'checkmark-circle-outline';
      case 'error':
        return 'alert-circle-outline';
      case 'info':
      default:
        return 'information-circle-outline';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'success':
        return '#4CAF50';
      case 'error':
        return '#F44336';
      case 'info':
      default:
        return GOLD;
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Ionicons name={getIconName()} size={60} color={getIconColor()} style={styles.icon} />
          
          <Text style={styles.title} allowFontScaling={false}>
            {title}
          </Text>
          
          <Text style={styles.message} allowFontScaling={false}>
            {message}
          </Text>
          
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}
          >
            <Text style={styles.buttonText} allowFontScaling={false}>
              Dismiss
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  container: {
    width: '100%',
    maxWidth: SCREEN_WIDTH - 60,
    backgroundColor: '#161614',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(201, 146, 42, 0.35)',
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    color: GOLD,
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Manrope_700Bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 14,
    fontFamily: 'Manrope_400Regular',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  button: {
    width: '100%',
    height: 48,
    borderRadius: 8,
    backgroundColor: GOLD,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Manrope_700Bold',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});
