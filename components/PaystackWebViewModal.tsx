import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet, Platform, ActivityIndicator, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';

export interface PaystackWebViewModalProps {
  visible: boolean;
  onClose: () => void;
  authorizationUrl: string;
  reference: string;
}

export const PaystackWebViewModal: React.FC<PaystackWebViewModalProps> = ({
  visible,
  onClose,
  authorizationUrl,
  reference,
}) => {
  if (!authorizationUrl) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.headerTitleContainer}>
            <Ionicons name="lock-closed" size={16} color="#C9922A" style={{ marginRight: 6 }} />
            <Text style={styles.headerTitle}>Secure Payment</Text>
          </View>
          <Pressable onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color="#FFF" />
          </Pressable>
        </View>

        <WebView
          source={{ uri: authorizationUrl }}
          style={styles.webview}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#C9922A" />
              <Text style={styles.loaderText}>Loading checkout page...</Text>
            </View>
          )}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#161616',
    borderBottomWidth: 1,
    borderBottomColor: '#262626',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFF',
    fontFamily: 'Manrope',
    fontSize: 16,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 6,
  },
  webview: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0F0F0F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    color: '#888',
    fontFamily: 'Manrope',
    fontSize: 13,
    marginTop: 12,
  },
});
