import React, { useState } from 'react';
import { Modal, View, Text, TextInput, Pressable, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface PaystackPaymentModalProps {
  visible: boolean;
  onClose: () => void;
  amount: number;
  onSuccess: (reference: string) => void;
}

export const PaystackPaymentModal: React.FC<PaystackPaymentModalProps> = ({ visible, onClose, amount, onSuccess }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'card' | 'otp' | 'success'>('card');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Sync state on visibility change
  React.useEffect(() => {
    if (visible) {
      setCardNumber('');
      setExpiry('');
      setCvv('');
      setOtp('');
      setError(null);
      setStep('card');
      setLoading(false);
    }
  }, [visible]);

  const handlePay = () => {
    if (!cardNumber.trim() || !expiry.trim() || !cvv.trim()) {
      setError('Please fill in all card details.');
      return;
    }
    setError(null);
    setLoading(true);

    // Simulate contacting Paystack and showing OTP screen
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
    }, 2000);
  };

  const handleVerifyOtp = () => {
    if (!otp.trim()) {
      setError('Please enter the OTP sent to your phone.');
      return;
    }
    setError(null);
    setLoading(true);

    // Simulate verifying OTP and getting Paystack transaction reference
    setTimeout(() => {
      setLoading(false);
      const reference = 'pstk_' + Math.random().toString(36).substr(2, 9);
      onSuccess(reference);
    }, 2000);
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.backdrop}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.paystackBadge}>
              <Text style={styles.paystackBadgeText}>paystack</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#FFF" />
            </Pressable>
          </View>

          {step === 'card' && (
            <View>
              <Text style={styles.amountText}>₦{amount.toLocaleString('en-US')}</Text>
              <Text style={styles.subtitle}>Enter your card details to complete payment</Text>

              <TextInput
                placeholder="Card Number"
                placeholderTextColor="#888"
                keyboardType="number-pad"
                maxLength={19}
                value={cardNumber}
                onChangeText={setCardNumber}
                style={styles.input}
              />

              <View style={styles.row}>
                <TextInput
                  placeholder="MM/YY"
                  placeholderTextColor="#888"
                  maxLength={5}
                  value={expiry}
                  onChangeText={setExpiry}
                  style={[styles.input, { flex: 1, marginRight: 10 }]}
                />
                <TextInput
                  placeholder="CVV"
                  placeholderTextColor="#888"
                  keyboardType="number-pad"
                  maxLength={3}
                  secureTextEntry
                  value={cvv}
                  onChangeText={setCvv}
                  style={[styles.input, { flex: 1 }]}
                />
              </View>

              {error && <Text style={styles.error}>{error}</Text>}

              <Pressable onPress={handlePay} disabled={loading} style={styles.payBtn}>
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.payBtnText}>Pay ₦{amount.toLocaleString('en-US')}</Text>
                )}
              </Pressable>
            </View>
          )}

          {step === 'otp' && (
            <View>
              <Text style={styles.otpTitle}>Enter OTP</Text>
              <Text style={styles.subtitle}>A one-time passcode has been sent to your registered phone number/email.</Text>

              <TextInput
                placeholder="OTP Code"
                placeholderTextColor="#888"
                keyboardType="number-pad"
                value={otp}
                onChangeText={setOtp}
                style={styles.input}
              />

              {error && <Text style={styles.error}>{error}</Text>}

              <Pressable onPress={handleVerifyOtp} disabled={loading} style={styles.payBtn}>
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.payBtnText}>Authorize Payment</Text>
                )}
              </Pressable>
            </View>
          )}

          <View style={styles.footer}>
            <Ionicons name="lock-closed" size={12} color="#00C853" style={{ marginRight: 4 }} />
            <Text style={styles.secureText}>Secured by Paystack</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '88%',
    backgroundColor: '#151515',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#262626',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  paystackBadge: {
    backgroundColor: '#00C853',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  paystackBadgeText: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 10,
    textTransform: 'uppercase',
  },
  closeBtn: {
    padding: 4,
  },
  amountText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    color: '#8E8E93',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  row: {
    flexDirection: 'row',
  },
  input: {
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    color: '#FFF',
    fontSize: 14,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    marginBottom: 16,
  },
  payBtn: {
    backgroundColor: '#00C853',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  payBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 15,
  },
  otpTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  error: {
    color: '#FF3B30',
    fontSize: 12,
    marginBottom: 12,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  secureText: {
    color: '#00C853',
    fontSize: 10,
    fontWeight: '700',
  },
});
