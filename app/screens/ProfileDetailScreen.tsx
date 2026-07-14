import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  useFonts,
} from '@expo-google-fonts/manrope';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { footerNavItems } from '@/app/data/home';
import { ApiService } from '@/app/services/apiService';
import { TokenService } from '@/app/services/tokenService';
import { HomeFooter } from '@/components/home/HomeFooter';
import { HOME_HORIZONTAL_PADDING } from '@/components/home/layout';

const GOLD = '#C9922A';

export default function ProfileDetailScreen() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [profileUri, setProfileUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Password change modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordStep, setPasswordStep] = useState(1); // 1: request OTP, 2: verify OTP, 3: change password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [stepLoading, setStepLoading] = useState(false);

  // Deactivate & Delete Account modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [secureDelete, setSecureDelete] = useState(true);

  // Secure visibility states
  const [secureCurrent, setSecureCurrent] = useState(true);
  const [secureNew, setSecureNew] = useState(true);
  const [secureConfirm, setSecureConfirm] = useState(true);

  useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });

  useEffect(() => {
    async function loadUserData() {
      try {
        setLoading(true);
        const profile = await ApiService.getUserProfile();
        if (profile) {
          setFirstName(profile.firstName || '');
          setLastName(profile.lastName || '');
          setEmail(profile.email || '');
          setPhone(profile.phoneNumber || '');
          if (profile.avatarUrl) {
            setProfileUri(profile.avatarUrl);
          } else {
            const localUser = await TokenService.getUser();
            if (localUser?.profileUri) {
              setProfileUri(localUser.profileUri);
            }
          }
        }
      } catch (err: any) {
        console.error('Failed to load user details:', err);
        // Fallback to local user
        try {
          const user = await TokenService.getUser();
          if (user) {
            setFirstName(user.firstName || '');
            setLastName(user.lastName || '');
            setEmail(user.email || '');
            setPhone(user.phoneNumber || '');
            if (user.profileUri) setProfileUri(user.profileUri);
          }
        } catch (fallbackErr) {
          console.error('Failed fallback load:', fallbackErr);
        }
      } finally {
        setLoading(false);
      }
    }
    loadUserData();
  }, []);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photo library to change your profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      const newUri = result.assets[0].uri;
      const backupUri = profileUri;
      setProfileUri(newUri);
      try {
        await ApiService.uploadAvatar(newUri);
        
        const profile = await ApiService.getUserProfile();
        let syncedUri = newUri;
        if (profile && profile.avatarUrl) {
          syncedUri = profile.avatarUrl;
          setProfileUri(profile.avatarUrl);
        }
        
        const activeUser = (await TokenService.getUser()) || {};
        await TokenService.saveUser({ ...activeUser, profileUri: syncedUri });
      } catch (e: any) {
        console.error('Failed to save profile picture state locally:', e);
        setProfileUri(backupUri);
        Alert.alert('Upload Failed', e.message || 'Failed to upload profile picture to server.');
      }
    }
  };

  const handleSaveChanges = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Validation Error', 'First name and last name are required.');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Validation Error', 'Email is required.');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Validation Error', 'Phone number is required.');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: phone.trim(),
        email: email.trim(),
      };
      
      await ApiService.updateUserProfile(payload);

      // Keep local TokenService user details in sync
      const activeUser = (await TokenService.getUser()) || {};
      const updatedUser = {
        ...activeUser,
        firstName: payload.firstName,
        lastName: payload.lastName,
        fullName: `${payload.firstName} ${payload.lastName}`,
        email: payload.email,
        phoneNumber: payload.phoneNumber,
        profileUri,
      };
      await TokenService.saveUser(updatedUser);

      Alert.alert('Success', 'Profile details updated successfully.');
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  // Change password wizard actions
  const handleRequestOtp = async () => {
    if (!currentPassword) {
      Alert.alert('Validation Error', 'Please enter your current password.');
      return;
    }
    try {
      setStepLoading(true);
      await ApiService.requestPasswordOtp(currentPassword.trim());
      Alert.alert('Success', 'OTP verification code has been sent to your email.');
      setPasswordStep(2);
    } catch (err: any) {
      Alert.alert('Request Failed', err.message || 'Failed to request OTP code.');
    } finally {
      setStepLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode.trim()) {
      Alert.alert('Validation Error', 'Please enter the verification code.');
      return;
    }
    try {
      setStepLoading(true);
      await ApiService.verifyPasswordOtp(otpCode.trim());
      Alert.alert('Success', 'Code verified. Please set your new password.');
      setPasswordStep(3);
    } catch (err: any) {
      Alert.alert('Verification Failed', err.message || 'Invalid verification code.');
    } finally {
      setStepLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword) {
      Alert.alert('Validation Error', 'Current password is required.');
      return;
    }
    if (!newPassword.trim()) {
      Alert.alert('Validation Error', 'New password is required.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Validation Error', 'New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Validation Error', 'New passwords do not match.');
      return;
    }

    try {
      setStepLoading(true);
      const payload = {
        currentPassword: currentPassword.trim(),
        newPassword: newPassword.trim(),
        confirmNewPassword: confirmPassword.trim(),
      };
      await ApiService.changePassword(payload);
      Alert.alert('Success', 'Your password has been changed successfully.');
      // Reset and close modal
      setShowPasswordModal(false);
      setPasswordStep(1);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setOtpCode('');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to change password.');
    } finally {
      setStepLoading(false);
    }
  };

  // Account termination action
  const handleDeactivateAndDelete = async () => {
    if (!deletePassword.trim()) {
      Alert.alert('Validation Error', 'Password is required.');
      return;
    }

    try {
      setDeleteLoading(true);
      // Call both endpoints sequentially
      await ApiService.deactivateAccount(deletePassword.trim());
      await ApiService.deleteAccount(deletePassword.trim());

      Alert.alert(
        'Account Removed',
        'Your account has been deactivated and deleted successfully.',
        [
          {
            text: 'OK',
            onPress: async () => {
              setShowDeleteModal(false);
              await TokenService.clearAuth();
              router.replace('/screens/WelcomeScreen');
            },
          },
        ]
      );
    } catch (err: any) {
      Alert.alert('Operation Failed', err.message || 'Verification failed. Incorrect password.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleFooterSelect = (itemId: string) => {
    if (itemId === 'home') router.replace('/screens/HomeScreen');
    if (itemId === 'cart') router.push('/screens/CartScreen');
    if (itemId === 'favorite') router.push('/screens/FavoriteScreen');
    if (itemId === 'profile') router.push('/screens/ProfileScreen');
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.center]}>
        <ActivityIndicator size="large" color={GOLD} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.page}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={10}>
            <Ionicons name="chevron-back" size={18} color={GOLD} />
          </Pressable>
          <Text style={styles.headerTitle} allowFontScaling={false}>
            Profile Details
          </Text>
        </View>

        <View style={styles.divider} />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Avatar Section ── */}
          <View style={styles.avatarSection}>
            <Pressable onPress={handlePickImage} style={styles.avatarCircle}>
              {profileUri ? (
                <Image source={{ uri: profileUri }} style={styles.avatarImage} contentFit="cover" />
              ) : (
                <Ionicons name="person-circle" size={80} color="#555555" />
              )}
            </Pressable>
            <Pressable style={styles.changePhotoBtn} onPress={handlePickImage}>
              <Text style={styles.changePhotoText} allowFontScaling={false}>
                Change Photo
              </Text>
            </Pressable>
          </View>

          {/* ── Fields ── */}
          <Text style={styles.sectionLabel} allowFontScaling={false}>
            Personal Information
          </Text>

          <View style={styles.fieldGroup}>
            <View style={styles.fieldWrapper}>
              <Text style={styles.fieldLabel} allowFontScaling={false}>First Name</Text>
              <TextInput
                value={firstName}
                onChangeText={setFirstName}
                style={styles.input}
                placeholder="First Name"
                placeholderTextColor="rgba(255,255,255,0.25)"
                allowFontScaling={false}
              />
            </View>

            <View style={styles.fieldWrapper}>
              <Text style={styles.fieldLabel} allowFontScaling={false}>Last Name</Text>
              <TextInput
                value={lastName}
                onChangeText={setLastName}
                style={styles.input}
                placeholder="Last Name"
                placeholderTextColor="rgba(255,255,255,0.25)"
                allowFontScaling={false}
              />
            </View>

            <View style={styles.fieldWrapper}>
              <Text style={styles.fieldLabel} allowFontScaling={false}>Email Address</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="Email Address"
                placeholderTextColor="rgba(255,255,255,0.25)"
                allowFontScaling={false}
              />
            </View>

            <View style={styles.fieldWrapper}>
              <Text style={styles.fieldLabel} allowFontScaling={false}>Phone Number</Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                style={styles.input}
                keyboardType="phone-pad"
                placeholder="Phone Number"
                placeholderTextColor="rgba(255,255,255,0.25)"
                allowFontScaling={false}
              />
            </View>
          </View>

          {/* ── Save button ── */}
          <Pressable
            onPress={handleSaveChanges}
            disabled={saving}
            style={({ pressed }) => [styles.saveButton, (pressed || saving) && styles.pressed]}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#000000" />
            ) : (
              <Text style={styles.saveButtonText} allowFontScaling={false}>
                Save Changes
              </Text>
            )}
          </Pressable>

          {/* ── Change Password Button ── */}
          <Pressable
            onPress={() => {
              setShowPasswordModal(true);
              setPasswordStep(1);
              setCurrentPassword('');
              setNewPassword('');
              setConfirmPassword('');
              setOtpCode('');
            }}
            style={({ pressed }) => [styles.changePasswordBtn, pressed && styles.pressed]}
          >
            <Text style={styles.changePasswordText} allowFontScaling={false}>
              Change Password
            </Text>
          </Pressable>

          {/* ── Deactivate & Delete Account Button ── */}
          <Pressable
            onPress={() => {
              setShowDeleteModal(true);
              setDeletePassword('');
            }}
            style={({ pressed }) => [styles.deleteAccountBtn, pressed && styles.pressed]}
          >
            <Text style={styles.deleteAccountText} allowFontScaling={false}>
              Deactivate & Delete Account
            </Text>
          </Pressable>
        </ScrollView>

        <HomeFooter
          items={footerNavItems}
          activeItemId="profile"
          onSelectItem={handleFooterSelect}
        />

        {/* ── Password Change Modal Wizard ── */}
        <Modal
          visible={showPasswordModal}
          transparent
          animationType="fade"
          onRequestClose={() => {
            if (!stepLoading) setShowPasswordModal(false);
          }}
        >
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.modalContainer}
            >
              <View style={styles.modalCard}>
                {/* Header */}
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle} allowFontScaling={false}>
                    {passwordStep === 1 && 'Change Password'}
                    {passwordStep === 2 && 'Verify Email'}
                    {passwordStep === 3 && 'New Password'}
                  </Text>
                  <Pressable
                    disabled={stepLoading}
                    onPress={() => setShowPasswordModal(false)}
                    hitSlop={8}
                  >
                    <Ionicons name="close" size={20} color="#8A8A8F" />
                  </Pressable>
                </View>

                {/* STEP 1: Current Password / Request OTP */}
                {passwordStep === 1 && (
                  <View style={styles.modalBody}>
                    <Text style={styles.modalDesc} allowFontScaling={false}>
                      Enter your current password to request a verification OTP to your email address.
                    </Text>
                    <View style={styles.inputWrapper}>
                      <TextInput
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                        secureTextEntry={secureCurrent}
                        placeholder="Current Password"
                        placeholderTextColor="rgba(255,255,255,0.25)"
                        style={styles.modalInput}
                        allowFontScaling={false}
                      />
                      <Pressable
                        onPress={() => setSecureCurrent(prev => !prev)}
                        style={styles.eyeIcon}
                        hitSlop={8}
                      >
                        <Ionicons
                          name={secureCurrent ? 'eye-off-outline' : 'eye-outline'}
                          size={18}
                          color="#8A8A8F"
                        />
                      </Pressable>
                    </View>

                    <View style={styles.modalActions}>
                      <Pressable
                        disabled={stepLoading}
                        onPress={() => setShowPasswordModal(false)}
                        style={[styles.modalBtn, styles.modalBtnSecondary]}
                      >
                        <Text style={styles.modalBtnSecondaryText} allowFontScaling={false}>Cancel</Text>
                      </Pressable>
                      <Pressable
                        disabled={stepLoading}
                        onPress={handleRequestOtp}
                        style={[styles.modalBtn, styles.modalBtnPrimary]}
                      >
                        {stepLoading ? (
                          <ActivityIndicator size="small" color="#000000" />
                        ) : (
                          <Text style={styles.modalBtnPrimaryText} allowFontScaling={false}>Next</Text>
                        )}
                      </Pressable>
                    </View>
                  </View>
                )}

                {/* STEP 2: Verify OTP */}
                {passwordStep === 2 && (
                  <View style={styles.modalBody}>
                    <Text style={styles.modalDesc} allowFontScaling={false}>
                      We sent a 6-digit OTP code to your email. Enter it below to authorize this password change.
                    </Text>
                    <TextInput
                      value={otpCode}
                      onChangeText={setOtpCode}
                      placeholder="6-Digit OTP Code"
                      placeholderTextColor="rgba(255,255,255,0.25)"
                      style={styles.modalInputCentered}
                      keyboardType="numeric"
                      maxLength={6}
                      allowFontScaling={false}
                    />

                    <View style={styles.modalActions}>
                      <Pressable
                        disabled={stepLoading}
                        onPress={() => setPasswordStep(1)}
                        style={[styles.modalBtn, styles.modalBtnSecondary]}
                      >
                        <Text style={styles.modalBtnSecondaryText} allowFontScaling={false}>Back</Text>
                      </Pressable>
                      <Pressable
                        disabled={stepLoading}
                        onPress={handleVerifyOtp}
                        style={[styles.modalBtn, styles.modalBtnPrimary]}
                      >
                        {stepLoading ? (
                          <ActivityIndicator size="small" color="#000000" />
                        ) : (
                          <Text style={styles.modalBtnPrimaryText} allowFontScaling={false}>Verify</Text>
                        )}
                      </Pressable>
                    </View>
                  </View>
                )}

                {/* STEP 3: Change Password details */}
                {passwordStep === 3 && (
                  <View style={styles.modalBody}>
                    <Text style={styles.modalDesc} allowFontScaling={false}>
                      Verify your current password and create a new secure password.
                    </Text>

                    <View style={styles.inputWrapper}>
                      <TextInput
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                        secureTextEntry={secureCurrent}
                        placeholder="Confirm Current Password"
                        placeholderTextColor="rgba(255,255,255,0.25)"
                        style={styles.modalInput}
                        allowFontScaling={false}
                      />
                      <Pressable
                        onPress={() => setSecureCurrent(prev => !prev)}
                        style={styles.eyeIcon}
                        hitSlop={8}
                      >
                        <Ionicons
                          name={secureCurrent ? 'eye-off-outline' : 'eye-outline'}
                          size={18}
                          color="#8A8A8F"
                        />
                      </Pressable>
                    </View>

                    <View style={[styles.inputWrapper, { marginTop: 12 }]}>
                      <TextInput
                        value={newPassword}
                        onChangeText={setNewPassword}
                        secureTextEntry={secureNew}
                        placeholder="New Password"
                        placeholderTextColor="rgba(255,255,255,0.25)"
                        style={styles.modalInput}
                        allowFontScaling={false}
                      />
                      <Pressable
                        onPress={() => setSecureNew(prev => !prev)}
                        style={styles.eyeIcon}
                        hitSlop={8}
                      >
                        <Ionicons
                          name={secureNew ? 'eye-off-outline' : 'eye-outline'}
                          size={18}
                          color="#8A8A8F"
                        />
                      </Pressable>
                    </View>

                    <View style={[styles.inputWrapper, { marginTop: 12 }]}>
                      <TextInput
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={secureConfirm}
                        placeholder="Confirm New Password"
                        placeholderTextColor="rgba(255,255,255,0.25)"
                        style={styles.modalInput}
                        allowFontScaling={false}
                      />
                      <Pressable
                        onPress={() => setSecureConfirm(prev => !prev)}
                        style={styles.eyeIcon}
                        hitSlop={8}
                      >
                        <Ionicons
                          name={secureConfirm ? 'eye-off-outline' : 'eye-outline'}
                          size={18}
                          color="#8A8A8F"
                        />
                      </Pressable>
                    </View>

                    <View style={styles.modalActions}>
                      <Pressable
                        disabled={stepLoading}
                        onPress={() => setShowPasswordModal(false)}
                        style={[styles.modalBtn, styles.modalBtnSecondary]}
                      >
                        <Text style={styles.modalBtnSecondaryText} allowFontScaling={false}>Cancel</Text>
                      </Pressable>
                      <Pressable
                        disabled={stepLoading}
                        onPress={handleChangePassword}
                        style={[styles.modalBtn, styles.modalBtnPrimary]}
                      >
                        {stepLoading ? (
                          <ActivityIndicator size="small" color="#000000" />
                        ) : (
                          <Text style={styles.modalBtnPrimaryText} allowFontScaling={false}>Submit</Text>
                        )}
                      </Pressable>
                    </View>
                  </View>
                )}
              </View>
            </KeyboardAvoidingView>
          </View>
        </Modal>

        {/* ── Account Deactivation & Deletion Modal ── */}
        <Modal
          visible={showDeleteModal}
          transparent
          animationType="fade"
          onRequestClose={() => {
            if (!deleteLoading) setShowDeleteModal(false);
          }}
        >
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.modalContainer}
            >
              <View style={styles.modalCard}>
                {/* Header */}
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: '#EA4335' }]} allowFontScaling={false}>
                    Deactivate & Delete Account
                  </Text>
                  <Pressable
                    disabled={deleteLoading}
                    onPress={() => setShowDeleteModal(false)}
                    hitSlop={8}
                  >
                    <Ionicons name="close" size={20} color="#8A8A8F" />
                  </Pressable>
                </View>

                <View style={styles.modalBody}>
                  <Text style={styles.modalDesc} allowFontScaling={false}>
                    WARNING: This action is permanent. Your account will be deactivated and completely deleted. Enter your password to confirm.
                  </Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      value={deletePassword}
                      onChangeText={setDeletePassword}
                      secureTextEntry={secureDelete}
                      placeholder="Enter Password"
                      placeholderTextColor="rgba(255,255,255,0.25)"
                      style={styles.modalInput}
                      allowFontScaling={false}
                    />
                    <Pressable
                      onPress={() => setSecureDelete(prev => !prev)}
                      style={styles.eyeIcon}
                      hitSlop={8}
                    >
                      <Ionicons
                        name={secureDelete ? 'eye-off-outline' : 'eye-outline'}
                        size={18}
                        color="#8A8A8F"
                      />
                    </Pressable>
                  </View>

                  <View style={styles.modalActions}>
                    <Pressable
                      disabled={deleteLoading}
                      onPress={() => setShowDeleteModal(false)}
                      style={[styles.modalBtn, styles.modalBtnSecondary]}
                    >
                      <Text style={styles.modalBtnSecondaryText} allowFontScaling={false}>Cancel</Text>
                    </Pressable>
                    <Pressable
                      disabled={deleteLoading}
                      onPress={handleDeactivateAndDelete}
                      style={[styles.modalBtn, { backgroundColor: '#EA4335' }]}
                    >
                      {deleteLoading ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Text style={[styles.modalBtnPrimaryText, { color: '#FFFFFF' }]} allowFontScaling={false}>
                          Confirm
                        </Text>
                      )}
                    </Pressable>
                  </View>
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#000000', marginTop: 30 },
  page: { flex: 1, backgroundColor: '#000000' },
  header: { height: 41, alignItems: 'center', justifyContent: 'center' },
  backButton: { position: 'absolute', left: 17, width: 28, height: 28, alignItems: 'flex-start', justifyContent: 'center' },
  headerTitle: { color: '#FFFFFF', fontFamily: 'Raleway_700Bold', fontSize: 16, fontWeight: '700', lineHeight: 20, textAlign: 'center' },
  divider: { height: 1, backgroundColor: '#2A2A2A', elevation: 4 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: HOME_HORIZONTAL_PADDING, paddingTop: 24, paddingBottom: 110, gap: 20 },
  center: { justifyContent: 'center', alignItems: 'center' },

  avatarSection: { alignItems: 'center', gap: 10, marginBottom: 8 },
  avatarCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#252523', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%' },
  changePhotoBtn: { paddingVertical: 4, paddingHorizontal: 12, borderRadius: 6, borderWidth: 1, borderColor: GOLD },
  changePhotoText: { color: GOLD, fontFamily: 'Raleway_600SemiBold', fontSize: 12 },

  sectionLabel: { color: 'rgba(255,255,255,0.50)', fontFamily: 'Raleway_500Medium', fontSize: 13 },
  fieldGroup: { gap: 14 },
  fieldWrapper: { gap: 6 },
  fieldLabel: { color: GOLD, fontFamily: 'Raleway_600SemiBold', fontSize: 12 },
  input: {
    width: '100%', height: 52, borderRadius: 10, borderWidth: 1,
    borderColor: 'rgba(201,146,42,0.35)', backgroundColor: 'rgba(37,37,35,0.85)',
    paddingHorizontal: 16, color: '#F5F5F5', fontSize: 14,
  },

  saveButton: { width: '100%', height: 52, borderRadius: 8, backgroundColor: GOLD, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  saveButtonText: { color: '#000000', fontFamily: 'Raleway_700Bold', fontSize: 15, fontWeight: '700' },
  
  changePasswordBtn: { width: '100%', height: 52, borderRadius: 8, borderWidth: 1, borderColor: GOLD, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  changePasswordText: { color: GOLD, fontFamily: 'Raleway_700Bold', fontSize: 15, fontWeight: '700' },

  deleteAccountBtn: { width: '100%', height: 52, borderRadius: 8, borderWidth: 1, borderColor: '#EA4335', alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  deleteAccountText: { color: '#EA4335', fontFamily: 'Raleway_700Bold', fontSize: 15, fontWeight: '700' },

  pressed: { opacity: 0.78 },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 360,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#161616',
    borderWidth: 1,
    borderColor: '#262626',
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#262626',
    paddingBottom: 12,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Raleway_700Bold',
  },
  modalBody: {
    gap: 12,
  },
  modalDesc: {
    color: '#8A8A8F',
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'Raleway_400Regular',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F0F0F',
    borderWidth: 1,
    borderColor: '#262626',
    borderRadius: 10,
    height: 48,
    paddingHorizontal: 12,
  },
  modalInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    height: '100%',
  },
  eyeIcon: {
    padding: 4,
  },
  modalInputCentered: {
    backgroundColor: '#0F0F0F',
    borderWidth: 1,
    borderColor: '#262626',
    borderRadius: 10,
    height: 48,
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 4,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  modalBtn: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBtnPrimary: {
    backgroundColor: GOLD,
  },
  modalBtnPrimaryText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Raleway_700Bold',
  },
  modalBtnSecondary: {
    borderWidth: 1,
    borderColor: '#333333',
    backgroundColor: 'transparent',
  },
  modalBtnSecondaryText: {
    color: '#8A8A8F',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Raleway_600SemiBold',
  },
});
