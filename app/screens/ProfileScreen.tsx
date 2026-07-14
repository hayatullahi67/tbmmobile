import {
  Manrope_400Regular,
  Manrope_600SemiBold,
  Manrope_700Bold,
  useFonts,
} from '@expo-google-fonts/manrope';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker'; // ✅ FIXED: added this import
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { footerNavItems } from '@/app/data/home';
import { ApiService } from '@/app/services/apiService';
import { TokenService } from '@/app/services/tokenService';
import { HomeFooter } from '@/components/home/HomeFooter';
import { HOME_HORIZONTAL_PADDING } from '@/components/home/layout';

export const options = {
  headerShown: false,
};

const MENU_ITEMS = [
  { id: 'orders', label: 'Orders', icon: 'bag-outline' as const },
  { id: 'my-details', label: 'My Details', icon: 'card-outline' as const },
  { id: 'delivery-address', label: 'Delivery Address', icon: 'location-outline' as const },
  // { id: 'rewards', label: 'rewards', icon: 'ribbon-outline' as const },
  { id: 'contact-us', label: 'Contact us', icon: 'notifications-outline' as const },
];

export default function ProfileScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('Andrea Hirata');
  const [email, setEmail] = useState('hirata@gmail.com');
  const [profileUri, setProfileUri] = useState<string | null>(null);

  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });

  useFocusEffect(
    useCallback(() => {
      async function loadUserData() {
        try {
          const profile = await ApiService.getUserProfile();
          if (profile) {
            if (profile.fullName) {
              setFullName(profile.fullName);
            } else if (profile.firstName && profile.lastName) {
              setFullName(`${profile.firstName} ${profile.lastName}`);
            }
            if (profile.email) setEmail(profile.email);
            if (profile.avatarUrl) {
              setProfileUri(profile.avatarUrl);
            } else {
              const localUser = await TokenService.getUser();
              if (localUser?.profileUri) {
                setProfileUri(localUser.profileUri);
              }
            }
          }
        } catch (err) {
          console.error('Failed to load live user profile:', err);
          try {
            const user = await TokenService.getUser();
            if (user) {
              if (user.fullName || (user.firstName && user.lastName)) {
                setFullName(user.fullName || `${user.firstName} ${user.lastName}`);
              }
              if (user.email) setEmail(user.email);
              if (user.profileUri) setProfileUri(user.profileUri);
            }
          } catch (e) {
            console.error('Fallback load failed:', e);
          }
        }
      }
      loadUserData();
    }, [])
  );

  if (!fontsLoaded) return null;

  const handlePickImage = async () => {
    // Request permission
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
        if (profile) {
          if (profile.fullName) {
            setFullName(profile.fullName);
          } else if (profile.firstName && profile.lastName) {
            setFullName(`${profile.firstName} ${profile.lastName}`);
          }
          if (profile.email) setEmail(profile.email);
          if (profile.avatarUrl) setProfileUri(profile.avatarUrl);
        }
        
        const activeUser = (await TokenService.getUser()) || {};
        await TokenService.saveUser({ 
          ...activeUser, 
          profileUri: profile?.avatarUrl || newUri 
        });
      } catch (e: any) {
        console.error('Failed to save profile picture state:', e);
        setProfileUri(backupUri);
        Alert.alert('Upload Failed', e.message || 'Failed to upload profile picture to server.');
      }
    }
  };

  const handleFooterSelect = (itemId: string) => {
    if (itemId === 'home') router.replace('/screens/HomeScreen');
    if (itemId === 'cart') router.push('/screens/CartScreen');
    if (itemId === 'favorite') router.push('/screens/FavoriteScreen');
  };

  const handleLogout = async () => {
    try {
      await TokenService.clearAuth();
    } catch (e) {
      console.error('Failed to clear tokens on logout:', e);
    }
    router.replace('/screens/WelcomeScreen');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.page}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={10}>
            <Ionicons name="chevron-back" size={18} color="#C9922A" />
          </Pressable>

          <Text style={styles.headerTitle} allowFontScaling={false}>
            Profile
          </Text>

          <Pressable style={styles.notifButton} hitSlop={10}>
            {/* <Ionicons name="notifications-outline" size={22} color="#C9922A" />
            <View style={styles.notifBadge} /> */}
          </Pressable>
        </View>

        <View style={styles.divider} />

        <ScrollView
          style={styles.contentScroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Profile card ── */}
          <View style={styles.profileCard}>

            {/* Tappable avatar */}
            <Pressable
              onPress={handlePickImage}
              style={({ pressed }) => [styles.avatarWrapper, pressed && styles.pressed]}
            >
              {profileUri ? (
                <Image source={{ uri: profileUri }} style={styles.avatar} contentFit="cover" />
              ) : (
                <View style={styles.avatarDefault}>
                  <Ionicons name="person-circle" size={75} color="#888888" />
                </View>
              )}
              {/* Gold camera badge */}
              <View style={styles.cameraBadge}>
                <Ionicons name="camera" size={10} color="#FFFFFF" />
              </View>
            </Pressable>

            {/* Name + email */}
            <Pressable
              onPress={() => router.push('/screens/ProfileDetailScreen')}
              style={({ pressed }) => [styles.profileInfo, pressed && styles.pressed]}
              hitSlop={6}
            >
              <Text style={styles.fullName} allowFontScaling={false}>
                {fullName}
              </Text>
              <Text style={styles.email} allowFontScaling={false}>
                {email}
              </Text>
            </Pressable>
          </View>

          {/* ── Menu list — bleeds edge-to-edge ── */}
          <View style={styles.menuList}>
            {MENU_ITEMS.map((item) => (
              <View key={item.id}>
                <Pressable
                  onPress={() => {
                    if (item.id === 'orders') router.push('/screens/OrdersScreen');
                    if (item.id === 'delivery-address') router.push('/screens/DeliveryAddressScreen');
                    if (item.id === 'my-details') router.push('/screens/MyDetailsScreen');
                    if (item.id === 'rewards') router.push('/screens/RewardsScreen');
                    if (item.id === 'contact-us') router.push('/screens/ContactUsScreen');
                  }}
                  style={({ pressed }) => [styles.menuRow, pressed && styles.pressed]}
                  hitSlop={4}
                >
                  <Ionicons name={item.icon} size={22} color="#FFFFFF" style={styles.menuIcon} />
                  <Text style={styles.menuLabel} allowFontScaling={false}>
                    {item.label}
                  </Text>
                  <Ionicons name="chevron-forward" color="#FFFFFF" style={styles.chevronIcon} />
                </Pressable>
                <View style={styles.menuDivider} />
              </View>
            ))}
          </View>

          {/* ── Log Out ── */}
          <Pressable
            onPress={handleLogout}
            style={({ pressed }) => [styles.logoutButton, pressed && styles.pressed]}
          >
            <Text style={styles.logoutText} allowFontScaling={false}>
              Log Out
            </Text>
          </Pressable>
        </ScrollView>

        <HomeFooter
          items={footerNavItems}
          activeItemId="profile"
          onSelectItem={handleFooterSelect}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
    marginTop: 30,
  },
  page: {
    flex: 1,
    backgroundColor: '#000000',
  },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    height: 41,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: HOME_HORIZONTAL_PADDING,
  },
  backButton: {
    position: 'absolute',
    left: 17,
    width: 28,
    height: 28,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontFamily: 'Manrope_700Bold',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
    textAlign: 'center',
  },
  notifButton: {
    position: 'absolute',
    right: 17,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E53935',
  },
  divider: {
    height: 1,
    backgroundColor: '#2A2A2A',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 3,
    elevation: 4,
  },

  // ── Scroll ───────────────────────────────────────────────────────────────────
  contentScroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: HOME_HORIZONTAL_PADDING,
    paddingTop: 28,
    paddingBottom: 110,
    gap: 32,
  },

  // ── Profile card ─────────────────────────────────────────────────────────────
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 37,
    marginTop:10,
  },
  avatarWrapper: {
    // width: 75,
    // height: 75,
    // borderRadius: 37.5,
    // overflow: 'hidden',
  },
  avatar: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
  },
  avatarDefault: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
    backgroundColor: '#252523',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#C9922A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
    gap: 6,
  },
  fullName: {
    color: '#FFFFFF',
    fontFamily: 'Manrope_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 16,
    letterSpacing: 0.2,
  },
  email: {
    color: '#AAAAAA',
    fontFamily: 'Manrope_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 16,
    letterSpacing: 0.2,
  },

  // ── Menu list — edge-to-edge ──────────────────────────────────────────────────
  menuList: {
    marginHorizontal: -HOME_HORIZONTAL_PADDING,
    marginTop:20,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 25,
    paddingHorizontal: HOME_HORIZONTAL_PADDING,
    gap: 36,
  },
  menuIcon: {
    width: 20,
    height: 20.17,
  },
  chevronIcon: {
    fontSize: 22,
  },
  menuLabel: {
    flex: 1,
    color: '#FFFFFF',
    fontFamily: 'Manrope_600SemiBold',
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 14,
    letterSpacing: 0.2,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#2A2A2A',
  },

  // ── Log Out ──────────────────────────────────────────────────────────────────
  logoutButton: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    backgroundColor: '#C9922A',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  logoutText: {
    color: '#FFFFFF',
    fontFamily: 'Manrope_700Bold',
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: 0.2,
  },

  pressed: {
    opacity: 0.78,
  },
});
