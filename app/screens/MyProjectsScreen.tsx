import React, { useState, useCallback } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { TokenService } from '@/app/services/tokenService';
import { ApiService } from '@/app/services/apiService';
import FeedbackModal from '@/components/FeedbackModal';
import { HomeFooter } from '@/components/home/HomeFooter';
import { footerNavItems } from '@/app/data/home';

const GOLD = '#C9922A';

export const options = {
  headerShown: false,
};

export default function MyProjectsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const token = await TokenService.getAccessToken();
      if (!token) {
        setShowAuthModal(true);
        setProjects([]);
        setUser(null);
        setLoading(false);
        return;
      }

      const [userProfile, projectsRes] = await Promise.all([
        TokenService.getUser(),
        ApiService.getAiProjects(),
      ]);

      setUser(userProfile);

      let rawList: any[] = [];
      if (Array.isArray(projectsRes)) {
        rawList = projectsRes;
      } else if (projectsRes && (projectsRes as any).success && (projectsRes as any).data) {
        const dataVal = (projectsRes as any).data;
        rawList = Array.isArray(dataVal) ? dataVal : (dataVal.items || []);
      } else if (projectsRes && (projectsRes as any).data) {
        const dataVal = (projectsRes as any).data;
        rawList = Array.isArray(dataVal) ? dataVal : (dataVal.items || []);
      }

      const sorted = [...rawList].sort((a, b) => {
        const aUrl = a.latestDesignUrl;
        const bUrl = b.latestDesignUrl;
        const aHas = typeof aUrl === 'string' && aUrl.trim().startsWith('http');
        const bHas = typeof bUrl === 'string' && bUrl.trim().startsWith('http');
        if (aHas && !bHas) return -1;
        if (!aHas && bHas) return 1;
        return 0;
      });

      setProjects(sorted);
    } catch (err) {
      console.error('Failed to load visualizer projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleFooterSelect = (itemId: string) => {
    if (itemId === 'projects') return;
    if (itemId === 'home') router.push('/screens/HomeScreen');
    if (itemId === 'favorite') router.push('/screens/FavoriteScreen');
    if (itemId === 'cart') router.push('/screens/CartScreen');
    if (itemId === 'profile') router.push('/screens/ProfileScreen');
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Recent';
    }
  };

  const getStatusStyle = (status: number) => {
    switch (status) {
      case 3: // Completed
        return { bg: 'rgba(46,125,50,0.15)', text: '#4CAF50' };
      case 4: // Failed
        return { bg: 'rgba(211,47,47,0.15)', text: '#F44336' };
      case 2: // Processing
        return { bg: 'rgba(251,192,45,0.15)', text: '#FBC02D' };
      default: // Pending / Created
        return { bg: 'rgba(201,146,42,0.15)', text: GOLD };
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 1: return 'Pending';
      case 2: return 'Processing';
      case 3: return 'Completed';
      case 4: return 'Failed';
      default: return 'Pending';
    }
  };

  const handleProjectPress = (proj: any) => {
    setSelectedProject(proj);
    setShowDetailsModal(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.page}>
        
        {/* ── HEADER ── */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.push('/screens/HomeScreen')}>
            <Ionicons name="arrow-back" size={24} color={GOLD} />
          </Pressable>
          <Text style={styles.headerTitle} allowFontScaling={false}>
            My Projects
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* ── LIST ── */}
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={GOLD} />
          </View>
        ) : (
          <ScrollView style={styles.content} contentContainerStyle={styles.contentScroll} showsVerticalScrollIndicator={false}>
            
            {/* User welcome banner */}
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeLabel} allowFontScaling={false}>Welcome,</Text>
              <Text style={styles.userName} allowFontScaling={false}>
                {user ? `${user.firstName} ${user.lastName}` : 'Ziora Builder'}
              </Text>
              <Text style={styles.projectCountText} allowFontScaling={false}>
                You have saved {projects.length} visualizer design{projects.length === 1 ? '' : 's'}.
              </Text>
            </View>

            {projects.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="images-outline" size={48} color="rgba(255,255,255,0.15)" />
                <Text style={styles.emptyText} allowFontScaling={false}>
                  No visualizer designs saved yet.
                </Text>
                <Pressable 
                  style={styles.startBtn} 
                  onPress={() => router.push('/screens/ziora-ai/ZioraHomeScreen')}
                >
                  <Text style={styles.startBtnText} allowFontScaling={false}>Start Designing</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.grid}>
                {projects.map(proj => {
                  const statusInfo = getStatusStyle(proj.status);
                  return (
                    <Pressable 
                      key={proj.id} 
                      style={styles.card}
                      onPress={() => handleProjectPress(proj)}
                    >
                      {proj.latestDesignUrl ? (
                        <Image
                          source={{ uri: proj.latestDesignUrl }}
                          style={styles.thumbnail}
                          contentFit="cover"
                        />
                      ) : (
                        <View style={[styles.thumbnail, styles.placeholderThumbnail]}>
                          <Ionicons name="image-outline" size={24} color="rgba(255,255,255,0.2)" />
                        </View>
                      )}
                      
                      <View style={styles.cardDetails}>
                        <View style={styles.cardHeaderRow}>
                          <Text style={styles.cardTitle} numberOfLines={1} allowFontScaling={false}>
                            {proj.contextLabel === 'string' || !proj.contextLabel ? 'Renovation Visualizer' : proj.contextLabel}
                          </Text>
                          <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
                            <Text style={[styles.statusBadgeText, { color: statusInfo.text }]} allowFontScaling={false}>
                              {getStatusText(proj.status)}
                            </Text>
                          </View>
                        </View>

                        <Text style={styles.cardMeta} allowFontScaling={false}>
                          Created: {formatDate(proj.createdAt)}
                        </Text>

                        <View style={styles.cardFooter}>
                          <View style={styles.designCountBadge}>
                            <Ionicons name="cube-outline" size={13} color="rgba(255,255,255,0.4)" style={{ marginRight: 4 }} />
                            <Text style={styles.designCountText} allowFontScaling={false}>
                              {proj.designCount} design{proj.designCount === 1 ? '' : 's'}
                            </Text>
                          </View>
                          
                          <View style={styles.viewAction}>
                            <Text style={styles.viewActionText} allowFontScaling={false}>View</Text>
                            <Ionicons name="chevron-forward" size={14} color={GOLD} />
                          </View>
                        </View>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </ScrollView>
        )}

        <HomeFooter
          items={footerNavItems}
          activeItemId="projects"
          onSelectItem={handleFooterSelect}
        />

        {/* --- Authentication Required Modal --- */}
        <FeedbackModal
          visible={showAuthModal}
          type="info"
          title="Authentication Required"
          message="Please log in or create an account to view and manage your visualizer designs."
          buttonText="Log In"
          secondaryButtonText="Cancel"
          onClose={() => setShowAuthModal(false)}
          onConfirm={() => {
            setShowAuthModal(false);
            router.push('/screens/LoginScreen');
          }}
        />

        {/* --- Project Details Modal --- */}
        {showDetailsModal && selectedProject && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle} numberOfLines={1} allowFontScaling={false}>
                  {selectedProject.contextLabel === 'string' || !selectedProject.contextLabel ? 'Renovation Visualizer' : selectedProject.contextLabel}
                </Text>
                <Pressable onPress={() => setShowDetailsModal(false)} style={styles.modalCloseIcon}>
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                </Pressable>
              </View>

              <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                {selectedProject.latestDesignUrl ? (
                  <Image
                    source={{ uri: selectedProject.latestDesignUrl }}
                    style={styles.modalImage}
                    contentFit="contain"
                  />
                ) : (
                  <View style={styles.modalImagePlaceholder}>
                    <Ionicons name="image-outline" size={48} color="rgba(255,255,255,0.15)" />
                    <Text style={styles.modalPlaceholderText} allowFontScaling={false}>No Design Generated Yet</Text>
                  </View>
                )}

                <View style={styles.modalDetailsContainer}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel} allowFontScaling={false}>Project ID</Text>
                    <Text style={styles.detailValue} selectTextOnPress allowFontScaling={false}>{selectedProject.id}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel} allowFontScaling={false}>Created Date</Text>
                    <Text style={styles.detailValue} allowFontScaling={false}>{formatDate(selectedProject.createdAt)}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel} allowFontScaling={false}>Status</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusStyle(selectedProject.status).bg, alignSelf: 'flex-start' }]}>
                      <Text style={[styles.statusBadgeText, { color: getStatusStyle(selectedProject.status).text }]} allowFontScaling={false}>
                        {getStatusText(selectedProject.status)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel} allowFontScaling={false}>Total Designs</Text>
                    <Text style={styles.detailValue} allowFontScaling={false}>
                      {selectedProject.designCount} design{selectedProject.designCount === 1 ? '' : 's'}
                    </Text>
                  </View>
                </View>
              </ScrollView>

              <Pressable style={styles.modalCloseBtn} onPress={() => setShowDetailsModal(false)}>
                <Text style={styles.modalCloseBtnText} allowFontScaling={false}>Close</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#07070A',
    marginTop: 27,
  },
  page: {
    flex: 1,
    backgroundColor: '#07070A',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1F',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 18,
    fontWeight: '700',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  contentScroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 95,
  },
  welcomeContainer: {
    marginBottom: 20,
  },
  welcomeLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    fontFamily: 'Manrope',
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Manrope',
    marginTop: 2,
  },
  projectCountText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    fontFamily: 'Manrope',
    marginTop: 6,
  },
  grid: {
    gap: 12,
  },
  card: {
    backgroundColor: '#121217',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1C1C24',
    padding: 12,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  thumbnail: {
    width: 76,
    height: 76,
    borderRadius: 8,
    backgroundColor: '#1E1E24',
  },
  placeholderThumbnail: {
    backgroundColor: '#1A1A22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardDetails: {
    flex: 1,
    justifyContent: 'space-between',
    height: 76,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Manrope',
    flex: 1,
  },
  statusBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Manrope',
  },
  cardMeta: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    fontFamily: 'Manrope',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  designCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  designCountText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontFamily: 'Manrope',
  },
  viewAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewActionText: {
    color: GOLD,
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Manrope',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
    fontFamily: 'Manrope',
    textAlign: 'center',
  },
  startBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: GOLD,
    marginTop: 10,
  },
  startBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Manrope',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 999,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#121217',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#22222E',
    padding: 20,
    maxHeight: '80%',
    gap: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C24',
    paddingBottom: 12,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Manrope',
    flex: 1,
    marginRight: 12,
  },
  modalCloseIcon: {
    padding: 4,
  },
  modalScroll: {
    flexGrow: 0,
  },
  modalImage: {
    width: '100%',
    height: 220,
    borderRadius: 8,
    backgroundColor: '#07070A',
    marginBottom: 16,
  },
  modalImagePlaceholder: {
    width: '100%',
    height: 220,
    borderRadius: 8,
    backgroundColor: '#1E1E24',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 8,
  },
  modalPlaceholderText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 13,
    fontFamily: 'Manrope',
  },
  modalDetailsContainer: {
    gap: 12,
  },
  detailRow: {
    gap: 4,
  },
  detailLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    fontFamily: 'Manrope',
    textTransform: 'uppercase',
  },
  detailValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Manrope',
    fontWeight: '500',
  },
  modalCloseBtn: {
    backgroundColor: GOLD,
    borderRadius: 8,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  modalCloseBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Manrope',
  },
});
